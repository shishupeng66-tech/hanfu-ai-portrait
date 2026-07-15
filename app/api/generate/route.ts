import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

import { createCreditCompensation } from "@/lib/credit-compensation";
import { canUserAfford, deductCredits } from "@/lib/credits";
import { db } from "@/lib/db";
import { generationHistory } from "@/lib/db/schema";
import { uploadToR2, generateImageKey } from "@/lib/r2";
import { getActiveSessionUser } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/error-utils";
import { volcanoEngineConfig, getHeaders, validateConfig } from "@/lib/volcano-engine/config";
import { getTemplateBySlug, getTemplateById } from "@/lib/db/template-repository";
import type { TemplateWithShots } from "@/lib/db/template-repository";

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
  // Default to first shot if not specified or not found
  if (!shot) {
    shot = template.shots?.[0];
  }

  const basePrompt = template.basePrompt;
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
      // TODO: 复核 denoising_strength 等参数在 prompt_generation 模式下的必要性
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
}: {
  prompt: string;
  userImageBase64: string;
  userImageMimeType: string;
  templateImageUrl: string;
  model: string;
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
      size: "3072x4096",
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
    const modeEntry = formData.get("mode");
    const trialAlreadyUsed = formData.get("trialAlreadyUsed") === "true";
    const mode = modeEntry === "trial" ? "trial" : "set";

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

    // Resolve model: generationConfig.model takes priority over global env
    const model =
      typeof genConfig.model === "string" && genConfig.model.trim()
        ? genConfig.model.trim()
        : volcanoEngineConfig.imageModel;

    const resolvedShotId = typeof shotId === "string" ? shotId : null;
    const activeShot = template.shots?.find((s) => s.shotKey === resolvedShotId) ?? template.shots?.[0] ?? null;

    let prompt: string;
    let negativePrompt: string;
    let templateImageUrl: string;
    let maxImages: number;

    if (workflow === "identity_transfer") {
      // identity_transfer: fixed 1 image, template image required
      maxImages = 1;

      templateImageUrl =
        activeShot?.referenceImage?.trim() ||
        template.referenceImages?.[0]?.trim() ||
        "";

      if (!templateImageUrl) {
        return NextResponse.json(
          {
            error:
              "Template is missing the identity transfer reference image. " +
              "Please upload a template image via referenceImages[0] or shot.referenceImage.",
          },
          { status: 400 },
        );
      }

      // Build prompt: basePrompt + shot.prompt (if present)
      prompt = [template.basePrompt, activeShot?.prompt]
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .join("\n\n");

      negativePrompt = "";

      // Secure log — no user image base64
      console.log("identity_transfer request:", {
        workflow,
        model,
        size: "3072x4096",
        referenceImageCount: 2,
        templateImageUrl,
        promptLength: prompt.length,
      });
    } else {
      // prompt_generation: keep existing behavior
      const built = buildGenerationPrompt(template, resolvedShotId);
      prompt = built.prompt;
      negativePrompt = built.negativePrompt;
      maxImages = genConfig.imageCount ?? 6;
      templateImageUrl = "";

      console.log("开始处理图片，文件大小:", file.size);
      console.log("VOLCANO_ENGINE_API_URL:", volcanoEngineConfig.apiUrl);
      console.log("VOLCANO_IMAGE_GENERATION_URL:", getImageGenerationUrl());
      console.log("VOLCANO_ENGINE_API_KEY exists:", !!volcanoEngineConfig.apiKey);
    }

    const creditsNeeded = template.creditsPerGeneration ?? 4;

    const hasCredits = await canUserAfford(userId, creditsNeeded);
    if (!hasCredits) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsNeeded,
          remainingCredits: 0,
        },
        { status: 402 }
      );
    }

    const historyId = randomUUID();

    await db.insert(generationHistory).values({
      id: historyId,
      userId,
      type: "image",
      prompt,
      status: "processing",
      creditsUsed: creditsNeeded,
      metadata: JSON.stringify({
        workflow,
        templateId: template.id,
        templateSlug: template.slug,
        templateVersion: template.version,
        templateName: { zh: template.nameZh, en: template.nameEn },
        shotId: activeShot?.shotKey ?? null,
        shotOrder: activeShot?.sortOrder ?? null,
        templateImageUrl: workflow === "identity_transfer" ? templateImageUrl : undefined,
        model,
        size: workflow === "identity_transfer" ? "3072x4096" : undefined,
        aspectRatio: genConfig.aspectRatio ?? "3:4",
        promptVersion: template.version,
        mode,
        maxImages,
        trialAlreadyUsed,
        creditsNeeded,
      }),
    });

    const deductResult = await deductCredits(userId, creditsNeeded, "portrait_generation", historyId);
    if (!deductResult.success) {
      await db
        .update(generationHistory)
        .set({ status: "failed", error: deductResult.error, updatedAt: new Date() })
        .where(eq(generationHistory.id, historyId));

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
      amount: creditsNeeded,
      reason: "image_generation_refund",
      referenceId: historyId,
    });

    let validUrls: string[] = [];
    try {
      let generatedUrls: string[];

      if (workflow === "identity_transfer") {
        generatedUrls = await generateIdentityTransferImages({
          prompt,
          userImageBase64: imageBase64,
          userImageMimeType: mimeType,
          templateImageUrl,
          model,
        });
      } else {
        generatedUrls = await generatePortraitImages({
          prompt,
          negativePrompt,
          imageBase64,
          mimeType,
          maxImages,
        });
      }

      const imageUrls = await Promise.all(
        generatedUrls.map(async (url, index) => {
          try {
            const buffer = await downloadImage(url);
            const key = generateImageKey(userId, `-${index}`);
            return await uploadToR2(buffer, key, "image/jpeg");
          } catch {
            return url;
          }
        })
      );

      validUrls = imageUrls.filter(Boolean) as string[];

      if (validUrls.length === 0) {
        throw new Error("No images generated");
      }

      await db
        .update(generationHistory)
        .set({
          status: "completed",
          resultUrl: validUrls[0],
          updatedAt: new Date(),
          metadata: JSON.stringify({
            workflow,
            templateId: template.id,
            templateSlug: template.slug,
            templateVersion: template.version,
            templateName: { zh: template.nameZh, en: template.nameEn },
            shotId: activeShot?.shotKey ?? null,
            shotOrder: activeShot?.sortOrder ?? null,
            templateImageUrl: workflow === "identity_transfer" ? templateImageUrl : undefined,
            model,
            size: workflow === "identity_transfer" ? "3072x4096" : undefined,
            aspectRatio: genConfig.aspectRatio ?? "3:4",
            promptVersion: template.version,
            mode,
            maxImages,
            trialAlreadyUsed,
            creditsNeeded,
            imageUrls: validUrls,
          }),
        })
        .where(eq(generationHistory.id, historyId));

      compensation.settle();
    } catch (generationError) {
      await compensation.compensate();
      await db
        .update(generationHistory)
        .set({
          status: "failed",
          error: getErrorMessage(generationError, "Failed to generate portrait"),
          updatedAt: new Date(),
        })
        .where(eq(generationHistory.id, historyId));

      throw generationError;
    }

    return NextResponse.json({
      id: historyId,
      imageUrls: validUrls,
      templateName: { zh: template.nameZh, en: template.nameEn },
      templateSlug: template.slug,
      templateId: template.id,
      mode,
      totalShots: maxImages,
      creditsUsed: creditsNeeded,
      remainingCredits: deductResult.remainingCredits,
    });

  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to generate portrait") },
      { status: 500 }
    );
  }
}