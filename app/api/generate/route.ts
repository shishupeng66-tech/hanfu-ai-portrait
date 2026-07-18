import { NextRequest, NextResponse } from "next/server";

import { createCreditCompensation } from "@/lib/credit-compensation";
import { canUserAfford, deductCredits } from "@/lib/credits";
import { getActiveSessionUser } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/error-utils";
import { resolveImageModel, validateConfig, volcanoEngineConfig } from "@/lib/volcano-engine/config";
import { getTemplateBySlug, getTemplateById } from "@/lib/db/template-repository";
import { uploadToR2, generateImageKey } from "@/lib/r2";
import {
  createGenerationBatch,
  createGenerationHistory,
  updateHistoryCompleted,
  updateHistoryFailed,
  updateBatchStatus,
  incrementCompletedShots,
  incrementFailedShots,
  findTrialBatch,
  checkTrialAlreadyUsed,
} from "@/lib/db/generation-batch-repository";
import { runShotGenerationPipeline } from "@/lib/generation/core";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

function ensureGenerateConfig() {
  validateConfig();
  if (!volcanoEngineConfig.apiUrl) {
    throw new Error("VOLCANO_ENGINE_API_URL is not configured");
  }
}

function assertR2ResultUrl(url: string): void {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (!publicUrl || !url.startsWith(`${publicUrl}/`)) {
    throw new Error("Generated image was not persisted to R2");
  }
}

// ---------------------------------------------------------------------------
// POST /api/generate
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const access = await getActiveSessionUser(req.headers);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    ensureGenerateConfig();

    const formData = await req.formData();
    const file = formData.get("image");
    const templateSlug = formData.get("templateSlug");
    const templateId = formData.get("templateId");
    const shotId = formData.get("shotId");
    const generationTypeEntry = formData.get("generationType");
    const trialBatchIdEntry = formData.get("trialBatchId");

    const generationType: "trial" | "set" =
      (typeof generationTypeEntry === "string" &&
        (generationTypeEntry === "trial" || generationTypeEntry === "set"))
        ? generationTypeEntry
        : "trial";

    const trialBatchId =
      typeof trialBatchIdEntry === "string" && trialBatchIdEntry.trim()
        ? trialBatchIdEntry.trim()
        : null;

    // Validate file
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image must be smaller than 10MB" }, { status: 400 });
    }

    // Resolve template
    const slug = typeof templateSlug === "string" ? templateSlug : null;
    const id = typeof templateId === "string" ? templateId : null;
    const template = slug
      ? await getTemplateBySlug(slug)
      : id
        ? await getTemplateById(id)
        : null;

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 400 });
    }

    if (template.status !== "published") {
      return NextResponse.json({ error: "Template is not available" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    const userId = access.user.id;

    const genConfig = JSON.parse(template.generationConfig ?? "{}");
    const workflow: string = genConfig.workflow ?? "prompt_generation";

    const model = resolveImageModel(typeof genConfig.model === "string" ? genConfig.model : null);
    console.log("ARK ROUTE DEBUG:", JSON.stringify({
      generationType,
      path: "route/api/generate",
      model,
      workflow,
      templateSlug: template.slug,
    }));

    const resolvedShotId = typeof shotId === "string" ? shotId : null;

    // Resolve shot
    let activeShot: typeof template.shots[number] | null = null;

    if (resolvedShotId) {
      activeShot = template.shots?.find((s) => s.shotKey === resolvedShotId) ?? null;
      if (!activeShot) {
        return NextResponse.json(
          { error: `Shot "${resolvedShotId}" not found in template "${template.slug}"` },
          { status: 400 },
        );
      }
    } else if (workflow === "identity_transfer") {
      if (generationType === "set") {
        activeShot = null;
      } else {
        const shotCount = template.shots?.length ?? 0;
        if (shotCount > 1) {
          return NextResponse.json(
            { error: "This template has multiple shots. Please select a specific shot." },
            { status: 400 },
          );
        }
        activeShot = template.shots?.[0] ?? null;
      }
    } else {
      activeShot = template.shots?.find((s) => s.shotKey === resolvedShotId) ?? template.shots?.[0] ?? null;
    }

    if (generationType === "trial" && !activeShot) {
      return NextResponse.json(
        { error: "shotId is required for trial generation" },
        { status: 400 },
      );
    }

    const size =
      typeof genConfig.size === "string" && genConfig.size.trim()
        ? genConfig.size.trim()
        : "3072x4096";

    // Resolve template image for identity_transfer (skip for set — resolved per-shot)
    let templateImageUrl = "";
    if (workflow === "identity_transfer" && generationType !== "set") {
      if (activeShot) {
        templateImageUrl = activeShot.referenceImage?.trim() || "";
        if (!templateImageUrl) {
          templateImageUrl = template.referenceImages?.[0]?.trim() || "";
        }
        if (!templateImageUrl) {
          return NextResponse.json(
            { error: `Shot "${activeShot.shotKey}" is missing its reference image. Please upload a template image for this shot.` },
            { status: 400 },
          );
        }
      } else {
        templateImageUrl = template.referenceImages?.[0]?.trim() || "";
      }

      if (!templateImageUrl) {
        return NextResponse.json(
          {
            error:
              "Template is missing the identity transfer reference image. " +
              "Please upload a template image via shot.referenceImage or referenceImages[0].",
          },
          { status: 400 },
        );
      }
    }

    // ---------------------------------------------------------------------------
    // Calculate credits
    // ---------------------------------------------------------------------------

    const perShotCredits = template.creditsPerGeneration ?? 1;
    const shots = (template.shots ?? []).sort((a, b) => a.sortOrder - b.sortOrder);

    let totalCredits: number;
    let trialDeduction = 0;
    let resolvedTrialBatch: { id: string; totalCredits: number } | null = null;

    if (generationType === "set" && trialBatchId) {
      const trial = await findTrialBatch(trialBatchId, userId, template.id);
      if (!trial) {
        return NextResponse.json(
          { error: "Invalid trial batch. Must be a completed trial for the same template." },
          { status: 400 },
        );
      }

      const alreadyUsed = await checkTrialAlreadyUsed(trialBatchId);
      if (alreadyUsed) {
        return NextResponse.json(
          { error: "This trial generation has already been used for a set purchase." },
          { status: 409 },
        );
      }

      resolvedTrialBatch = { id: trial.id, totalCredits: trial.totalCredits };
      trialDeduction = trial.totalCredits;
    }

    if (generationType === "trial") {
      totalCredits = perShotCredits;
    } else {
      const fullCredits = shots.length * perShotCredits;
      totalCredits = Math.max(0, fullCredits - trialDeduction);
    }

    const hasCredits = await canUserAfford(userId, totalCredits);
    if (!hasCredits) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsNeeded: totalCredits,
          remainingCredits: 0,
        },
        { status: 402 }
      );
    }

    // ---------------------------------------------------------------------------
    // Upload source image to R2 (before creating batch)
    // ---------------------------------------------------------------------------

    let sourceImageUrl: string | null = null;
    try {
      const key = generateImageKey(userId, "-source");
      sourceImageUrl = await uploadToR2(Buffer.from(arrayBuffer), key, mimeType);
    } catch {
      return NextResponse.json(
        { error: "Failed to upload source image" },
        { status: 500 },
      );
    }

    // ---------------------------------------------------------------------------
    // Create batch + deduct credits
    // ---------------------------------------------------------------------------

    const batch = await createGenerationBatch({
      userId,
      templateId: template.id,
      templateSlug: template.slug,
      templateNameZh: template.nameZh,
      templateNameEn: template.nameEn,
      generationType,
      totalCredits,
      totalShots: generationType === "trial" ? 1 : shots.length,
      trialBatchId: resolvedTrialBatch?.id ?? null,
      sourceImage: sourceImageUrl,
    });

    const reason = generationType === "trial" ? "portrait_trial" : "portrait_set";
    const deductResult = await deductCredits(userId, totalCredits, reason, batch.id);
    if (!deductResult.success) {
      await updateBatchStatus(batch.id, "failed");
      return NextResponse.json(
        {
          error: deductResult.error || "Failed to deduct credits",
          remainingCredits: deductResult.remainingCredits,
        },
        { status: 402 }
      );
    }

    // ---------------------------------------------------------------------------
    // SET: create pending histories, return immediately — worker picks up via batchId
    // ---------------------------------------------------------------------------

    if (generationType === "set") {
      for (const shot of shots) {
        await createGenerationHistory({
          batchId: batch.id,
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
      }

      // Auto-dispatch worker via internal endpoint
      const taskSecret = process.env.TASK_SECRET;
      if (taskSecret) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        fetch(`${appUrl}/api/generation-batch/${batch.id}/process`, {
          method: "POST",
          headers: { Authorization: `Bearer ${taskSecret}` },
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        batchId: batch.id,
        generationType: "set",
        status: "pending",
        totalCredits,
        totalShots: shots.length,
        trialDeduction: trialDeduction > 0 ? trialDeduction : undefined,
        remainingCredits: deductResult.remainingCredits,
      });
    }

    // ---------------------------------------------------------------------------
    // TRIAL: synchronous (unchanged)
    // ---------------------------------------------------------------------------

    const compensation = createCreditCompensation({
      userId,
      amount: totalCredits,
      reason: "portrait_trial_refund",
      referenceId: batch.id,
    });

    const shotResults: Array<{
      shotId: string;
      shotOrder: number;
      imageUrl: string | null;
      status: "completed" | "failed";
      error?: string;
    }> = [];

    try {
      const historyId = await createGenerationHistory({
        batchId: batch.id,
        userId,
        generationType: "trial",
        shotId: activeShot!.shotKey,
        shotOrder: activeShot!.sortOrder,
        prompt: "",
        creditsUsed: totalCredits,
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
          shot: activeShot!,
          template,
          imageBase64,
          mimeType,
          userImageUrl: sourceImageUrl,
          model,
          size,
          workflow,
          userId,
        });
        assertR2ResultUrl(finalUrl);

        await updateHistoryCompleted(historyId, finalUrl, {
          workflow,
          templateId: template.id,
          templateSlug: template.slug,
          templateVersion: template.version,
          templateName: { zh: template.nameZh, en: template.nameEn },
          shotId: activeShot!.shotKey,
          shotOrder: activeShot!.sortOrder,
          model,
          size,
          generationType: "trial",
        });

        await incrementCompletedShots(batch.id);
        await updateBatchStatus(batch.id, "completed");

        shotResults.push({
          shotId: activeShot!.shotKey,
          shotOrder: activeShot!.sortOrder,
          imageUrl: finalUrl,
          status: "completed",
        });

        compensation.settle();
      } catch (shotError) {
        const errorMsg = getErrorMessage(shotError, "Failed to generate portrait");
        await updateHistoryFailed(historyId, errorMsg);
        await incrementFailedShots(batch.id);
        await updateBatchStatus(batch.id, "failed");

        shotResults.push({
          shotId: activeShot!.shotKey,
          shotOrder: activeShot!.sortOrder,
          imageUrl: null,
          status: "failed",
          error: errorMsg,
        });

        await compensation.compensate();
        throw shotError;
      }
    } catch (outerError) {
      return NextResponse.json(
        { error: getErrorMessage(outerError, "Failed to generate portrait") },
        { status: 500 },
      );
    }

    const allImageUrls = shotResults
      .filter((r) => r.imageUrl)
      .map((r) => r.imageUrl!);

    return NextResponse.json({
      batchId: batch.id,
      generationType,
      totalCredits,
      trialDeduction: trialDeduction > 0 ? trialDeduction : undefined,
      shots: shotResults,
      imageUrls: allImageUrls,
      resultUrl: allImageUrls[0] ?? null,
      templateName: { zh: template.nameZh, en: template.nameEn },
      templateSlug: template.slug,
      templateId: template.id,
      remainingCredits: deductResult.remainingCredits,
    });

  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to generate portrait") },
      { status: 500 }
    );
  }
}
