/**
 * lib/jobs/generation-worker.ts
 * Background worker for processing set generation batches.
 *
 * Called async (fire-and-forget) from POST /api/generate when generationType=set.
 */

import "server-only";

import { getErrorMessage } from "@/lib/error-utils";
import { createCreditCompensation } from "@/lib/credit-compensation";
import { getTemplateById } from "@/lib/db/template-repository";
import {
  createGenerationHistory,
  updateHistoryCompleted,
  updateHistoryFailed,
  updateBatchStatus,
  incrementCompletedShots,
  incrementFailedShots,
} from "@/lib/db/generation-batch-repository";
import { db } from "@/lib/db";
import { generationBatch } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { runShotGenerationPipeline } from "@/lib/generation/core";

export async function processSetBatch(
  batchId: string,
  userId: string,
  imageBase64: string,
  mimeType: string,
): Promise<void> {
  console.log(`[worker] Starting set batch ${batchId.substring(0, 12)}...`);

  // 1. Read batch
  const batchRows = await db
    .select()
    .from(generationBatch)
    .where(eq(generationBatch.id, batchId))
    .limit(1);

  const batch = batchRows[0];
  if (!batch) {
    console.error(`[worker] Batch ${batchId} not found`);
    return;
  }

  if (batch.generationType !== "set") {
    console.error(`[worker] Batch ${batchId} is not a set batch`);
    return;
  }

  // 2. Resolve template
  const template = await getTemplateById(batch.templateId!);
  if (!template) {
    console.error(`[worker] Template ${batch.templateId} not found`);
    await updateBatchStatus(batchId, "failed");
    return;
  }

  const genConfig = JSON.parse(template.generationConfig ?? "{}");
  const workflow: string = genConfig.workflow ?? "prompt_generation";
  const model =
    typeof genConfig.model === "string" && genConfig.model.trim()
      ? genConfig.model.trim()
      : (await import("@/lib/volcano-engine/config")).volcanoEngineConfig.imageModel;
  const size =
    typeof genConfig.size === "string" && genConfig.size.trim()
      ? genConfig.size.trim()
      : "3072x4096";

  const shots = (template.shots ?? []).sort((a, b) => a.sortOrder - b.sortOrder);

  // 3. Create compensation
  const compensation = createCreditCompensation({
    userId,
    amount: batch.totalCredits,
    reason: "portrait_set_refund",
    referenceId: batchId,
  });

  let anySuccess = false;

  // 4. Process each shot
  for (const shot of shots) {
    const historyId = await createGenerationHistory({
      batchId,
      userId,
      generationType: "set",
      shotId: shot.shotKey,
      shotOrder: shot.sortOrder,
      prompt: "",
      creditsUsed: 0,
      metadata: {
        workflow,
        templateId: template.id,
        templateSlug: template.slug,
        templateVersion: template.version,
        model,
        size,
      },
    });

    try {
      const finalUrl = await runShotGenerationPipeline({
        shot,
        template,
        imageBase64,
        mimeType,
        model,
        size,
        workflow,
        userId,
      });

      await updateHistoryCompleted(historyId, finalUrl, {
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
      console.log(`[worker] Shot ${shot.shotKey} completed`);
    } catch (shotError) {
      const errorMsg = getErrorMessage(shotError, `Failed to generate shot "${shot.shotKey}"`);
      console.error(`[worker] Shot ${shot.shotKey} failed:`, errorMsg);

      await updateHistoryFailed(historyId, errorMsg);
      await incrementFailedShots(batchId);
    }
  }

  // 5. Finalize batch
  if (!anySuccess) {
    await updateBatchStatus(batchId, "failed");
    await compensation.compensate();
    console.log(`[worker] Batch ${batchId.substring(0, 12)} all failed — refunded`);
  } else {
    const batchRows = await db
      .select({ completedShots: generationBatch.completedShots, totalShots: generationBatch.totalShots })
      .from(generationBatch)
      .where(eq(generationBatch.id, batchId))
      .limit(1);

    const current = batchRows[0];
    const allDone = (current?.completedShots ?? 0) >= (current?.totalShots ?? 0);
    await updateBatchStatus(batchId, allDone ? "completed" : "partial");
    compensation.settle();
    console.log(`[worker] Batch ${batchId.substring(0, 12)} done: ${current?.completedShots}/${current?.totalShots}`);
  }
}