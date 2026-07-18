/**
 * 身份迁移 Prompt — Seedream Identity Transfer 双图专用。
 *
 * 图片语义约定（严格按此顺序传入 ARK）：
 *   image[0] = 用户上传人物照 → 身份参考，脸部特征来源
 *   image[1] = Shot 模板参考图 → 服装/发型/姿态/场景/灯光参考
 *
 * 必须遵守：
 *   - 100% 保留图片 1 中的人物身份
 *   - 绝对不要参考图片 2 中的任何人脸或模特特征
 *   - 只迁移图片 2 的汉服、发型、妆容、姿态、场景、灯光
 *   - 禁止改变用户脸部特征
 *   - 禁止美化用户脸部（大眼、瘦脸、美白等）
 */

export const IDENTITY_PRESERVATION_PROMPT = [
  "人物身份迁移任务。",
  "",
  "第一张图片 = 人物身份唯一来源和参考。",
  "第二张图片 = 服装、发型、姿态、场景和摄影风格参考。",
  "",
  "禁止任何对第一张图片人物脸部的修改：",
  "- 不改变脸型",
  "- 不改变五官比例",
  "- 不改变眼睛大小和形状",
  "- 不改变鼻子和嘴巴特征",
  "- 不改变肤色",
  "- 不改变年龄",
  "- 不改变人物气质",
  "",
  "禁止生成或替换成第二张图片中的模特脸部。",
  "禁止任何美颜、瘦脸、大眼效果。",
  "",
  "只将第二张图片中的以下特征迁移到第一张图片的人物上：",
  "- 汉服服装和细节",
  "- 发型和发饰",
  "- 妆容",
  "- 动作姿态",
  "- 场景环境",
  "- 灯光效果",
  "- 摄影风格",
  "",
  "最终结果必须完全保留第一张图片中的原始人物，只是换上第二张图片的服装和场景。",
  "保持真实、自然的照片效果。",
].join("\n");

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