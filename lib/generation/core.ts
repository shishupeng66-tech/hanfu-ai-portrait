/**
 * lib/generation/core.ts
 * Shared AI generation functions — used by both route.ts and generation-worker.ts
 */

import { uploadToR2, generateImageKey } from "@/lib/r2";
import { volcanoEngineConfig, getHeaders } from "@/lib/volcano-engine/config";
import type { TemplateWithShots } from "@/lib/db/template-repository";
import { buildIdentityTransferPrompt } from "@/lib/prompts/identity-preservation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function getImageGenerationUrl() {
  const apiUrl = volcanoEngineConfig.apiUrl
    .replace("https://ark.byteplus.com", "https://ark.ap-southeast.bytepluses.com")
    .replace(/\/+$/, "");
  return apiUrl.endsWith("/images/generations")
    ? apiUrl
    : `${apiUrl}/images/generations`;
}

export function buildGenerationPrompt(
  template: TemplateWithShots,
  shotId?: string | null,
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

function getUrlHost(value: string): string | null {
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

function logArkRequestDebug({
  path,
  endpoint,
  model,
  prompt,
  images,
  size,
  responseFormat,
}: {
  path: string;
  endpoint: string;
  model: string;
  prompt: string;
  images: string[];
  size: string;
  responseFormat: string;
}) {
  console.log("ARK REQUEST DEBUG:", JSON.stringify({
    path,
    endpoint,
    model,
    promptLength: prompt.length,
    imageFieldExists: images.length > 0,
    imageCount: images.length,
    imagePrefixes: images.map((image) => image.slice(0, 100)),
    imageHosts: images.map(getUrlHost),
    size,
    responseFormat,
  }));
}

export async function generatePortraitImages({
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
  const endpoint = getImageGenerationUrl();
  const image = `data:${mimeType};base64,${imageBase64}`;
  logArkRequestDebug({
    path: "core/generatePortraitImages",
    endpoint,
    model: volcanoEngineConfig.imageModel ?? "",
    prompt,
    images: [image],
    size: "3072x4096",
    responseFormat: "url",
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model: volcanoEngineConfig.imageModel,
      prompt,
      negative_prompt: negativePrompt,
      image,
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
  try { data = JSON.parse(responseText); } catch { /* keep raw */ }

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

export async function generateIdentityTransferImages({
  prompt,
  userImageBase64,
  userImageMimeType,
  userImageUrl,
  templateImageUrl,
  model,
  size,
}: {
  prompt: string;
  userImageBase64: string;
  userImageMimeType: string;
  userImageUrl?: string | null;
  templateImageUrl: string;
  model: string;
  size: string;
}): Promise<string[]> {
  const endpoint = getImageGenerationUrl();
  const userImage = userImageUrl?.trim() || `data:${userImageMimeType};base64,${userImageBase64}`;
  const images = [userImage, templateImageUrl];
  logArkRequestDebug({
    path: "core/generateIdentityTransferImages",
    endpoint,
    model,
    prompt,
    images,
    size,
    responseFormat: "url",
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      prompt,
      image: images,
      size,
      response_format: "url",
      stream: false,
      watermark: false,
    }),
  });

  const responseText = await response.text();
  let data: unknown = responseText;
  try { data = JSON.parse(responseText); } catch { /* keep raw */ }

  console.log("ARK identity_transfer status:", response.status);
  console.log("ARK identity_transfer response:", JSON.stringify(data).substring(0, 500));

  if (!response.ok) {
    throw new Error(`ARK API error: ${JSON.stringify(data)}`);
  }

  return (
    (data as { data?: Array<{ url?: string }> }).data
      ?.map((item) => item.url)
      .filter((url): url is string => Boolean(url)) || []
  );
}

export async function generateSingleShotImage({
  shot,
  template,
  imageBase64,
  mimeType,
  userImageUrl,
  model,
  size,
  workflow,
}: {
  shot: TemplateWithShots["shots"][number];
  template: TemplateWithShots;
  imageBase64: string;
  mimeType: string;
  userImageUrl?: string | null;
  model: string;
  size: string;
  workflow: string;
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

  // Resolve per-shot reference image for identity_transfer
  let templateImageUrl = shot.referenceImage?.trim() || "";
  if (!templateImageUrl) {
    templateImageUrl = template.referenceImages?.[0]?.trim() || "";
  }
  if (!templateImageUrl) {
    throw new Error(`Shot "${shot.shotKey}" is missing its reference image.`);
  }

  let generatedUrls: string[];

  if (workflow === "identity_transfer") {
    generatedUrls = await generateIdentityTransferImages({
      prompt,
      userImageBase64: imageBase64,
      userImageMimeType: mimeType,
      userImageUrl,
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
// Full generation pipeline for a single shot (AI + R2 upload)
// ---------------------------------------------------------------------------

export async function runShotGenerationPipeline({
  shot,
  template,
  imageBase64,
  mimeType,
  userImageUrl,
  model,
  size,
  workflow,
  userId,
}: {
  shot: TemplateWithShots["shots"][number];
  template: TemplateWithShots;
  imageBase64: string;
  mimeType: string;
  userImageUrl?: string | null;
  model: string;
  size: string;
  workflow: string;
  userId: string;
}): Promise<string> {
  const imageUrl = await generateSingleShotImage({
    shot,
    template,
    imageBase64,
    mimeType,
    userImageUrl,
    model,
    size,
    workflow,
  });

  // Upload to R2
  try {
    const buffer = await downloadImage(imageUrl);
    const key = generateImageKey(userId, `-${shot.shotKey}`);
    return await uploadToR2(buffer, key, "image/jpeg");
  } catch {
    return imageUrl;
  }
}
