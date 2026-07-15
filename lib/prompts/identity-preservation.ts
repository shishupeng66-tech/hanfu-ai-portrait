/**
 * 身份保持 prompt — 全局共享，所有模板使用同一个。
 *
 * 生成时拼接顺序：
 *   IDENTITY_PRESERVATION_PROMPT
 *   + template.stylePrompt
 *   + shot.stylePrompt
 *
 * 职责：
 * - 保持用户脸部身份、五官比例、脸型、肤色基础、年龄特征
 * - 允许汉服、发型、妆容、场景、光影变化
 * - 禁止换脸成模板人物、改变人种特征、脸部放大、过度美颜
 */

export const IDENTITY_PRESERVATION_PROMPT = [
  "保持人物面部特征、五官比例、脸型、肤色基础和年龄特征不变。",
  "允许更换汉服服饰、发型、妆容、环境背景和光影氛围。",
  "禁止将人物换成模板参考图中的模特。",
  "禁止改变人种特征。",
  "禁止脸部放大或过度美颜。",
  "生成高质量、自然、真实的汉服写真照片。",
].join(" ");

/**
 * 拼接完整的 identity_transfer prompt。
 * 顺序：identity preservation → template style → shot style
 */
export function buildIdentityTransferPrompt(params: {
  templateStylePrompt: string;
  shotStylePrompt?: string;
}): string {
  const parts = [
    IDENTITY_PRESERVATION_PROMPT,
    params.templateStylePrompt?.trim(),
    params.shotStylePrompt?.trim(),
  ].filter((value): value is string => typeof value === "string" && value.length > 0);

  return parts.join("\n\n");
}