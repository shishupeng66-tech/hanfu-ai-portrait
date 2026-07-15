/**
 * 模板种子数据定义。
 *
 * 添加新模板：
 *   1. 在 TEMPLATE_SEEDS 数组中添加一个新的 TemplateSeed 对象
 *   2. 运行 pnpm seed:templates
 *
 * 注意：referenceImage 需要先上传到 R2/CDN，将 URL 填入对应 shot。
 */

export interface TemplateSeed {
  slug: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  category: string;
  dynasty: string;
  stylePrompt: string;
  generationConfig: {
    model: string;
    size: string;
    aspectRatio: string;
    count: number;
    workflow: string;
  };
  creditsPerGeneration: number;
  shots: {
    shotKey: string;
    sortOrder: number;
    titleZh: string;
    titleEn: string;
    referenceImage: string;
    stylePrompt: string;
  }[];
}

/**
 * 所有待 seed 的模板数据。
 * 目前为空，在此数组内添加模板即可。
 */
export const TEMPLATE_SEEDS: TemplateSeed[] = [];