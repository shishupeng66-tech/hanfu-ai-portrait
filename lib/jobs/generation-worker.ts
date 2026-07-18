/**
 * lib/jobs/generation-worker.ts
 * Single-shot worker: processes ONE shot per invocation.
 * Chain scheduling: after completing a shot, triggers the next one.
 */

import "server-only";

import { randomUUID } from "crypto";
import { getErrorMessage } from "@/lib/error-utils";
import { refundCredits } from "@/lib/credits";
import { getTemplateById } from "@/lib/db/template-repository";
import { downloadImage } from "@/lib/generation/core";
import { runShotGenerationPipeline } from "@/lib/generation/core";
import {
  getBatchById,
  claimNextHistory,
  completeShot,
  failShot,
  updateShotHeartbeat,
  batchHasRemainingShots,
  getBatchCompletionStats,
  updateBatchStatus,
  addRefundedCredits,
  clearTrialBatchId,
} from "@/lib/db/generation-batch-repository";
import { volcanoEngineConfig } from "@/lib/volcano-engine/config";
import { db } from "@/lib/db";
import { generationBatch } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const HEARTBEAT_INTERVAL_MS = 15_000;

export type ProcessNextBatchShotResult = {
  success: boolean;
  batchId: string;
  processedShotId: string | null;
  shotStatus: "completed" | "failed" | null;
  batchStatus: string | null;
  completedShots: number;
  totalShots: number;
  failedShots: number;
  hasMore: boolean;
};

export async function processNextBatchShot(batchId: string): Promise<ProcessNextBatchShotResult> {
  const workerId = `wkr-${randomUUID().substring(0, 8)}`;

  // 1. Validate batch
  const batch = await getBatchById(batchId);
  if (!batch || batch.generationType !== "set") {
    return buildBatchResult(batchId, null, null);
  }
  if (batch.status === "completed" || batch.status === "partial" || batch.status === "failed") {
    return buildBatchResult(batchId, null, null);
  }

  // 2. Atomically claim next shot
  const history = await claimNextHistory(batchId, workerId);
  if (!history) {
    // No shot available — check if all done
    const remaining = await batchHasRemainingShots(batchId);
    if (!remaining) {
      await finalizeBatch(batchId);
    }
    return buildBatchResult(batchId, null, null);
  }

  await updateBatchStatus(batchId, "processing");
  console.log(`[worker:${workerId}] Claimed shot ${history.shotId} (${history.shotOrder})`);

  // 3. Heartbeat
  const heartbeatTimer = setInterval(() => {
    updateShotHeartbeat(history.id).catch(() => {});
  }, HEARTBEAT_INTERVAL_MS);
  let shotStatus: "completed" | "failed" | null = null;

  try {
    // 4. Download source image
    if (!batch.sourceImage) throw new Error("No source image");
    const buffer = await downloadImage(batch.sourceImage);
    const imageBase64 = buffer.toString("base64");
    const mimeType = "image/jpeg";

    // 5. Resolve template
    const template = await getTemplateById(batch.templateId!);
    if (!template) throw new Error("Template not found");

    const shots = (template.shots ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
    const shot = shots.find((s) => s.shotKey === history.shotId);
    if (!shot) throw new Error(`Shot "${history.shotId}" not found`);

    const genConfig = JSON.parse(template.generationConfig ?? "{}");
    const workflow: string = genConfig.workflow ?? "prompt_generation";
    const model = typeof genConfig.model === "string" && genConfig.model.trim()
      ? genConfig.model.trim()
      : volcanoEngineConfig.imageModel;
    const size = typeof genConfig.size === "string" && genConfig.size.trim()
      ? genConfig.size.trim()
      : "3072x4096";

    // 6. Generate
    const finalUrl = await runShotGenerationPipeline({
      shot,
      template,
      imageBase64,
      mimeType,
      model,
      size,
      workflow,
      userId: batch.userId,
    });
    assertR2ResultUrl(finalUrl);

    // 7. Mark completed
    await completeShot(history.id, finalUrl);
    console.log(`[worker:${workerId}] Shot ${history.shotId} completed`);

    // 8. Update batch stats
    const stats = await getBatchCompletionStats(batchId);
    await db
      .update(generationBatch)
      .set({ completedShots: stats.completed, failedShots: stats.failed, updatedAt: new Date() })
      .where(eq(generationBatch.id, batchId));
    shotStatus = "completed";

  } catch (err) {
    const errorMsg = getErrorMessage(err, "Shot generation failed");
    console.error(`[worker:${workerId}] Shot ${history.shotId} failed:`, errorMsg);

    const isFinal = history.attemptCount >= 3;
    await failShot(history.id, errorMsg);

    if (isFinal) {
      const stats = await getBatchCompletionStats(batchId);
      await db
        .update(generationBatch)
        .set({ failedShots: stats.failed, updatedAt: new Date() })
        .where(eq(generationBatch.id, batchId));
    }
    shotStatus = "failed";
  } finally {
    clearInterval(heartbeatTimer);
  }

  // 9. Chain: trigger next shot or finalize
  const hasMore = await batchHasRemainingShots(batchId);
  if (hasMore) {
    await triggerNextShot(batchId);
  } else {
    await finalizeBatch(batchId);
  }

  return buildBatchResult(batchId, history.shotId, shotStatus);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function triggerNextShot(batchId: string): Promise<void> {
  const taskSecret = process.env.TASK_SECRET;
  if (!taskSecret) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  fetch(`${appUrl}/api/generation-batch/${batchId}/process`, {
    method: "POST",
    headers: { Authorization: `Bearer ${taskSecret}` },
  }).catch(() => {});
}

function assertR2ResultUrl(url: string): void {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (!publicUrl || !url.startsWith(`${publicUrl}/`)) {
    throw new Error("Generated image was not persisted to R2");
  }
}

async function buildBatchResult(
  batchId: string,
  processedShotId: string | null,
  shotStatus: "completed" | "failed" | null,
): Promise<ProcessNextBatchShotResult> {
  const [stats, hasMore, batch] = await Promise.all([
    getBatchCompletionStats(batchId),
    batchHasRemainingShots(batchId),
    getBatchById(batchId),
  ]);

  return {
    success: true,
    batchId,
    processedShotId,
    shotStatus,
    batchStatus: batch?.status ?? null,
    completedShots: stats.completed,
    totalShots: stats.total,
    failedShots: stats.failed,
    hasMore,
  };
}

async function finalizeBatch(batchId: string): Promise<void> {
  const batch = await getBatchById(batchId);
  if (!batch || batch.status === "completed" || batch.status === "partial" || batch.status === "failed") return;

  const stats = await getBatchCompletionStats(batchId);
  // Update stats
  await db
    .update(generationBatch)
    .set({ completedShots: stats.completed, failedShots: stats.failed, updatedAt: new Date() })
    .where(eq(generationBatch.id, batchId));

  if (stats.failed === 0) {
    await updateBatchStatus(batchId, "completed");
    console.log(`[worker] Batch ${batchId.substring(0, 12)} completed: ${stats.completed}/${stats.total}`);
  } else if (stats.completed === 0) {
    // All failed — refund and release trial
    await updateBatchStatus(batchId, "failed");

    const refundAmount = Math.max(0, batch.totalCredits - batch.refundedCredits);
    if (refundAmount > 0) {
      await addRefundedCredits(batchId, refundAmount);
      await refundCredits(batch.userId, refundAmount, "portrait_set_refund", batchId);
    }
    if (batch.trialBatchId) {
      await clearTrialBatchId(batchId);
    }
    console.log(`[worker] Batch ${batchId.substring(0, 12)} all failed — refunded ${refundAmount}`);
  } else {
    // Partial — refund failed shots
    const template = await getTemplateById(batch.templateId!);
    const perShotCredits = template?.creditsPerGeneration ?? 1;
    const refundAmount = Math.min(
      stats.failed * perShotCredits,
      Math.max(0, batch.totalCredits - batch.refundedCredits),
    );

    if (refundAmount > 0) {
      await addRefundedCredits(batchId, refundAmount);
      await refundCredits(batch.userId, refundAmount, "portrait_set_partial_refund", batchId);
    }
    await updateBatchStatus(batchId, "partial");
    console.log(`[worker] Batch ${batchId.substring(0, 12)} partial: ${stats.completed}/${stats.total}`);
  }
}

// Keep old function for backward compat
export { processNextBatchShot as processSetBatch };
