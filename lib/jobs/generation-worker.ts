/**
 * lib/jobs/generation-worker.ts
 * Persistent worker for processing set generation batches.
 *
 * Invoked as: processSetBatch(batchId)
 * All data restored from DB — no HTTP request memory dependency.
 */

import "server-only";

import { randomUUID } from "crypto";
import { getErrorMessage } from "@/lib/error-utils";
import { refundCredits } from "@/lib/credits";
import { getTemplateById } from "@/lib/db/template-repository";
import { downloadImage } from "@/lib/generation/core";
import { runShotGenerationPipeline } from "@/lib/generation/core";
import {
  tryLockBatch,
  updateHeartbeat,
  updateBatchStatus,
  updateHistoryCompleted,
  updateHistoryFailed,
  incrementCompletedShots,
  incrementFailedShots,
  addRefundedCredits,
  clearTrialBatchId,
  setLastError,
  getBatchById,
  getPendingOrFailedHistories,
} from "@/lib/db/generation-batch-repository";
import { volcanoEngineConfig } from "@/lib/volcano-engine/config";

const HEARTBEAT_INTERVAL_MS = 30_000; // 30s heartbeat

export async function processSetBatch(batchId: string): Promise<void> {
  const workerId = `wkr-${randomUUID().substring(0, 8)}`;

  // 1. Atomic lock
  const batch = await tryLockBatch(batchId, workerId);
  if (!batch) {
    console.log(`[worker:${workerId}] Batch ${batchId.substring(0, 12)} already locked or terminal`);
    return;
  }

  console.log(`[worker:${workerId}] Acquired lock on batch ${batchId.substring(0, 12)}`);

  // 2. Heartbeat loop
  const heartbeatTimer = setInterval(() => {
    updateHeartbeat(batchId).catch(() => {});
  }, HEARTBEAT_INTERVAL_MS);

  try {
    // 3. Validate sourceImage
    if (!batch.sourceImage) {
      throw new Error("Batch has no sourceImage URL");
    }

    // 4. Download source image from R2
    let imageBase64: string;
    const mimeType = "image/jpeg";
    try {
      const buffer = await downloadImage(batch.sourceImage);
      imageBase64 = buffer.toString("base64");
      // Try to detect mime type from the response
      // For R2, we assume JPEG — safe default
    } catch {
      throw new Error(`Failed to download source image from ${batch.sourceImage}`);
    }

    // 5. Resolve template
    const template = await getTemplateById(batch.templateId!);
    if (!template) {
      throw new Error(`Template ${batch.templateId} not found`);
    }

    const genConfig = JSON.parse(template.generationConfig ?? "{}");
    const workflow: string = genConfig.workflow ?? "prompt_generation";
    const model =
      typeof genConfig.model === "string" && genConfig.model.trim()
        ? genConfig.model.trim()
        : volcanoEngineConfig.imageModel;
    const size =
      typeof genConfig.size === "string" && genConfig.size.trim()
        ? genConfig.size.trim()
        : "3072x4096";

    const shots = (template.shots ?? []).sort((a, b) => a.sortOrder - b.sortOrder);

    // 6. Get pending/failed histories only (idempotent — skip completed)
    const pendingHistories = await getPendingOrFailedHistories(batchId);
    console.log(`[worker:${workerId}] ${pendingHistories.length} shots to process`);

    let anySuccess = false;
    let anyFailure = false;

    for (const history of pendingHistories) {
      // Find the matching shot
      const shot = shots.find((s) => s.shotKey === history.shotId);
      if (!shot) {
        await updateHistoryFailed(history.id, `Shot "${history.shotId}" not found in template`);
        await incrementFailedShots(batchId);
        anyFailure = true;
        continue;
      }

      try {
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

        await updateHistoryCompleted(history.id, finalUrl, {
          workflow,
          templateId: template.id,
          templateSlug: template.slug,
          templateVersion: template.version,
          templateName: { zh: template.nameZh, en: template.nameEn },
          shotId: shot.shotKey,
          shotOrder: shot.sortOrder,
          model,
          size,
          generationType: "set",
        });

        await incrementCompletedShots(batchId);
        anySuccess = true;
        console.log(`[worker:${workerId}] Shot ${shot.shotKey} completed`);
      } catch (shotError) {
        const errorMsg = getErrorMessage(shotError, `Failed to generate shot "${shot.shotKey}"`);
        console.error(`[worker:${workerId}] Shot ${shot.shotKey} failed:`, errorMsg);

        await updateHistoryFailed(history.id, errorMsg);
        await incrementFailedShots(batchId);
        anyFailure = true;
      }
    }

    // 7. Finalize
    if (!anySuccess && anyFailure) {
      // All failed — refund
      await updateBatchStatus(batchId, "failed");

      // Refund per failed shot (respecting trial deduction)
      const perShotCredits = template.creditsPerGeneration ?? 1;
      const grossCredits = shots.length * perShotCredits;
      const trialDeduction = batch.trialBatchId ? perShotCredits : 0;
      const chargedCredits = grossCredits - trialDeduction;

      const refundAmount = Math.min(
        chargedCredits,
        pendingHistories.length * perShotCredits,
      );

      if (refundAmount > 0) {
        await addRefundedCredits(batchId, refundAmount);
        await refundCredits(batch.userId, refundAmount, "portrait_set_refund", batchId);
      }

      // Release trial
      if (batch.trialBatchId) {
        await clearTrialBatchId(batchId);
      }

      console.log(`[worker:${workerId}] All failed — refunded ${refundAmount}, trial released`);
    } else if (anyFailure) {
      // Partial success — refund failed shots
      await updateBatchStatus(batchId, "partial");

      const currentBatch = await getBatchById(batchId);
      if (currentBatch) {
        const perShotCredits = template.creditsPerGeneration ?? 1;
        const refundAmount = currentBatch.failedShots * perShotCredits;

        if (refundAmount > 0 && currentBatch.refundedCredits < refundAmount) {
          const toRefund = refundAmount - currentBatch.refundedCredits;
          await addRefundedCredits(batchId, toRefund);
          await refundCredits(batch.userId, toRefund, "portrait_set_partial_refund", batchId);
          console.log(`[worker:${workerId}] Partial refund: ${toRefund} credits`);
        }
      }
    } else {
      // All success
      await updateBatchStatus(batchId, "completed");
      console.log(`[worker:${workerId}] All completed`);
    }
  } catch (err) {
    const errorMsg = getErrorMessage(err, "Worker fatal error");
    console.error(`[worker:${workerId}] Fatal:`, errorMsg);
    await setLastError(batchId, errorMsg);
    await updateBatchStatus(batchId, "failed");
  } finally {
    clearInterval(heartbeatTimer);
    console.log(`[worker:${workerId}] Finished`);
  }
}