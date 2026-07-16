import { NextRequest, NextResponse } from "next/server";

import { createCreditCompensation } from "@/lib/credit-compensation";
import { canUserAfford, deductCredits } from "@/lib/credits";
import { uploadToR2, generateImageKey } from "@/lib/r2";
import { getActiveSessionUser } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/error-utils";
import { volcanoEngineConfig, getHeaders, validateConfig } from "@/lib/volcano-engine/config";
import { getTemplateBySlug, getTemplateById } from "@/lib/db/template-repository";
import type { TemplateWithShots } from "@/lib/db/template-repository";
import { buildIdentityTransferPrompt } from "@/lib/prompts/identity-preservation";
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

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getImageGenerationUrl() {
  const apiUrl = volcanoEngineConfig.apiUrl
    .replace("https://ark.byteplus.com", "https://ark.ap-southeast.bytepluses.com")
    .replace(/\/+$/, "");
  return apiUrl.endsWith("/images/generations")
    ? apiUrl
    : `${apiUrl}/images/generations`;
}

function ensureGenerateConfig() {
  validateConfig();
  if (!volcanoEngineConfig.apiUrl) {
    throw new Error("VOLCANO_ENGINE_API_URL is not configured");
  }
}

function buildGenerationPrompt(
  template: TemplateWithShots,
  shotId?: string | null
): { prompt: string; negativePrompt: string } {
  let shot = undefined;
  if (shotId) {
    shot = template.shots?.find((s) => s.shotKey === shotId);
  }
  if (!shot) {
    shot = template.shots?.[0];
  }

  const basePrompt = template.basePrompt ?? "";
  const shotPrompt = shot?.prompt ?? "";
  const prompt = shotPrompt ? `${basePrompt}\n\n${shotPrompt}` : basePrompt;

  return {
    prompt,
    negativePrompt: template.negativePrompt ?? "",
  };
}

async function generatePortraitImages({
  prompt,
  negativePrompt,
  imageBase64,
  mimeType,
  maxImages,
}: {
  prompt: string;
  negativePrompt: string;
  imageBase64: string;
  mimeType: string;
  maxImages: number;
}): Promise<string[]> {
  const isSet = maxImages > 1;
  const response = await fetch(getImageGenerationUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model: volcanoEngineConfig.imageModel,
      prompt,
      negative_prompt: negativePrompt,
      image: `data:${mimeType};base64,${imageBase64}`,
      sequential_image_generation: isSet ? "auto" : "disabled",
      ...(isSet
        ? {
            sequential_image_generation_options: {
              max_images: maxImages,
            },
          }
        : {}),
      response_format: "url",
      size: "3072x4096",
      stream: false,
      watermark: false,
      denoising_strength: 0.35,
    }),
  });

  const responseText = await response.text();
  let data: unknown = responseText;
  try {
    data = JSON.parse(responseText);
  } catch {
    // Keep the raw body for providers that return plain-text errors.
  }

  console.log("ARK image status:", response.status);
  console.log("ARK image response:", JSON.stringify(data).substring(0, 500));

  if (!response.ok) {
    throw new Error(`ARK API error: ${JSON.stringify(data)}`);
  }

  return (
    (data as { data?: Array<{ url?: string }> }).data
      ?.map((item) => item.url)
      .filter((url): url is string => Boolean(url)) || []
  );
}

async function generateIdentityTransferImages({
  prompt,
  userImageBase64,
  userImageMimeType,
  templateImageUrl,
  model,
  size,
}: {
  prompt: string;
  userImageBase64: string;
  userImageMimeType: string;
  templateImageUrl: string;
  model: string;
  size: string;
}): Promise<string[]> {
  const response = await fetch(getImageGenerationUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      prompt,
      image: [
        `data:${userImageMimeType};base64,${userImageBase64}`,
        templateImageUrl,
      ],
      size,
      response_format: "url",
      stream: false,
      watermark: false,
    }),
  });

  const responseText = await response.text();
  let data: unknown = responseText;
  try {
    data = JSON.parse(responseText);
  } catch {
    // Keep the raw body for providers that return plain-text errors.
  }

  console.log("ARK identity_transfer status:", response.status);
  console.log(
    "ARK identity_transfer response:",
    JSON.stringify(data).substring(0, 500),
  );

  if (!response.ok) {
    throw new Error(`ARK API error: ${JSON.stringify(data)}`);
  }

  return (
    (data as { data?: Array<{ url?: string }> }).data
      ?.map((item) => item.url)
      .filter((url): url is string => Boolean(url)) || []
  );
}

// ---------------------------------------------------------------------------
// Shot-level generation helper
// ---------------------------------------------------------------------------

async function generateSingleShotImage({
  shot,
  template,
  imageBase64,
  mimeType,
  model,
  size,
  workflow,
  templateImageUrl,
}: {
  shot: TemplateWithShots["shots"][number];
  template: TemplateWithShots;
  imageBase64: string;
  mimeType: string;
  model: string;
  size: string;
  workflow: string;
  templateImageUrl: string;
}): Promise<string> {
  let prompt: string;

  if (workflow === "identity_transfer") {
    prompt = buildIdentityTransferPrompt({
      templateStylePrompt: template.stylePrompt ?? "",
      shotStylePrompt: shot.stylePrompt ?? undefined,
    });
  } else {
    const built = buildGenerationPrompt(template, shot.shotKey);
    prompt = built.prompt;
  }

  let generatedUrls: string[];

  if (workflow === "identity_transfer") {
    generatedUrls = await generateIdentityTransferImages({
      prompt,
      userImageBase64: imageBase64,
      userImageMimeType: mimeType,
      templateImageUrl,
      model,
      size,
    });
  } else {
    generatedUrls = await generatePortraitImages({
      prompt,
      negativePrompt: template.negativePrompt ?? "",
      imageBase64,
      mimeType,
      maxImages: 1,
    });
  }

  const url = generatedUrls[0];
  if (!url) {
    throw new Error(`No image generated for shot "${shot.shotKey}"`);
  }

  return url;
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

    // generationType: new parameter, defaults to "trial" for backward compat
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

    // Parse generation config and determine workflow
    const genConfig = JSON.parse(template.generationConfig ?? "{}");
    const workflow: string = genConfig.workflow ?? "prompt_generation";

    // Resolve model
    const model =
      typeof genConfig.model === "string" && genConfig.model.trim()
        ? genConfig.model.trim()
        : volcanoEngineConfig.imageModel;

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
      const shotCount = template.shots?.length ?? 0;
      if (shotCount > 1) {
        return NextResponse.json(
          { error: "This template has multiple shots. Please select a specific shot." },
          { status: 400 },
        );
      }
      activeShot = template.shots?.[0] ?? null;
    } else {
      activeShot = template.shots?.find((s) => s.shotKey === resolvedShotId) ?? template.shots?.[0] ?? null;
    }

    // For trial: shotId is required
    if (generationType === "trial" && !activeShot) {
      return NextResponse.json(
        { error: "shotId is required for trial generation" },
        { status: 400 },
      );
    }

    // Resolve size
    const size =
      typeof genConfig.size === "string" && genConfig.size.trim()
        ? genConfig.size.trim()
        : "3072x4096";

    // Resolve template image for identity_transfer
    let templateImageUrl = "";
    if (workflow === "identity_transfer") {
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

    // Trial deduction
    let trialDeduction = 0;
    let resolvedTrialBatch: { id: string; totalCredits: number } | null = null;

    if (generationType === "set" && trialBatchId) {
      // Validate trial batch
      const trial = await findTrialBatch(trialBatchId, userId, template.id);
      if (!trial) {
        return NextResponse.json(
          { error: "Invalid trial batch. Must be a completed trial for the same template." },
          { status: 400 },
        );
      }

      // Check not already used
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
      // set
      const fullCredits = shots.length * perShotCredits;
      totalCredits = Math.max(0, fullCredits - trialDeduction);
    }

    // Check credit balance
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
    // Create generation batch
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
      sourceImage: null, // R2 URL will be set after upload if needed
    });

    // ---------------------------------------------------------------------------
    // Deduct credits
    // ---------------------------------------------------------------------------

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

    const compensation = createCreditCompensation({
      userId,
      amount: totalCredits,
      reason: reason === "portrait_trial" ? "portrait_trial_refund" : "portrait_set_refund",
      referenceId: batch.id,
    });

    // ---------------------------------------------------------------------------
    // Generate images
    // ---------------------------------------------------------------------------

    const shotResults: Array<{
      shotId: string;
      shotOrder: number;
      imageUrl: string | null;
      status: "completed" | "failed";
      error?: string;
    }> = [];

    try {
      if (generationType === "trial") {
        // ===== TRIAL: single shot =====
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
          const imageUrl = await generateSingleShotImage({
            shot: activeShot!,
            template,
            imageBase64,
            mimeType,
            model,
            size,
            workflow,
            templateImageUrl,
          });

          // Upload to R2
          let finalUrl: string;
          try {
            const buffer = await downloadImage(imageUrl);
            const key = generateImageKey(userId, `-${activeShot!.shotKey}`);
            finalUrl = await uploadToR2(buffer, key, "image/jpeg");
          } catch {
            finalUrl = imageUrl;
          }

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
      } else {
        // ===== SET: loop over all shots =====
        let anySuccess = false;

        for (const shot of shots) {
          const historyId = await createGenerationHistory({
            batchId: batch.id,
            userId,
            generationType: "set",
            shotId: shot.shotKey,
            shotOrder: shot.sortOrder,
            prompt: "",
            creditsUsed: 0, // credits tracked at batch level
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
            const imageUrl = await generateSingleShotImage({
              shot,
              template,
              imageBase64,
              mimeType,
              model,
              size,
              workflow,
              templateImageUrl,
            });

            // Upload to R2
            let finalUrl: string;
            try {
              const buffer = await downloadImage(imageUrl);
              const key = generateImageKey(userId, `-${shot.shotKey}`);
              finalUrl = await uploadToR2(buffer, key, "image/jpeg");
            } catch {
              finalUrl = imageUrl;
            }

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

            await incrementCompletedShots(batch.id);
            anySuccess = true;

            shotResults.push({
              shotId: shot.shotKey,
              shotOrder: shot.sortOrder,
              imageUrl: finalUrl,
              status: "completed",
            });
          } catch (shotError) {
            const errorMsg = getErrorMessage(shotError, `Failed to generate shot "${shot.shotKey}"`);
            console.error(`[set] Shot ${shot.shotKey} failed:`, errorMsg);

            await updateHistoryFailed(historyId, errorMsg);
            await incrementFailedShots(batch.id);

            shotResults.push({
              shotId: shot.shotKey,
              shotOrder: shot.sortOrder,
              imageUrl: null,
              status: "failed",
              error: errorMsg,
            });
          }
        }

        // Determine final batch status
        if (!anySuccess) {
          await updateBatchStatus(batch.id, "failed");
          await compensation.compensate();
        } else {
          const allSuccess = shotResults.every((r) => r.status === "completed");
          await updateBatchStatus(batch.id, allSuccess ? "completed" : "partial");
          compensation.settle();
        }
      }
    } catch (outerError) {
      // Only reached for trial failure (which re-throws) or unexpected errors
      return NextResponse.json(
        { error: getErrorMessage(outerError, "Failed to generate portrait") },
        { status: 500 },
      );
    }

    // ---------------------------------------------------------------------------
    // Response
    // ---------------------------------------------------------------------------

    const allImageUrls = shotResults
      .filter((r) => r.imageUrl)
      .map((r) => r.imageUrl!);

    return NextResponse.json({
      batchId: batch.id,
      generationType,
      totalCredits,
      trialDeduction: trialDeduction > 0 ? trialDeduction : undefined,
      shots: shotResults,
      imageUrls: allImageUrls, // backward compatible
      resultUrl: allImageUrls[0] ?? null, // backward compatible: first image
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