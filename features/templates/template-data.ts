// Template type definitions and data loading for the new template system.
// Old demo template data has been removed. New templates are loaded from
// data/templates/items/ via the unified loader in data/templates/index.ts.

export type ApiTemplateKey = string;

export type TemplateDynasty = "tang" | "song" | "yuan" | "ming" | "qing" | "modern";
export type TemplateCategory = TemplateDynasty | "dunhuang" | "qipao";
export type TemplateFilter = "popular" | "new" | "premium" | "free" | "favorited";
export type TemplateCategoryWithAll = TemplateCategory | "all";

export type HanfuTemplate = {
  id: string;
  apiTemplateKey: ApiTemplateKey;
  name: string;
  dynasty: TemplateDynasty;
  category: TemplateCategory;
  label: string;
  styleTags: string[];
  filters: TemplateFilter[];
  description: string;
  previewUrl: string;
  galleryImages: string[];
  creditCost: number;
  isPremium: boolean;
  recommendedPhotoType: string;
  generationCount: number;
  audience: string;
  usageTips: string;
};

// Currently empty — new templates are loaded from data/templates/items/.
export const hanfuTemplates: HanfuTemplate[] = [];

export const dynastyTabs: TemplateDynasty[] = ["tang", "song", "yuan", "ming", "qing", "modern"];

export const featuredTemplateIds: string[] = [];

export const templateLibraryIds: string[] = [];

export const templateLibraryData: HanfuTemplate[] = [];

export function getTemplateById(id: string): HanfuTemplate | null {
  return hanfuTemplates.find((template) => template.id === id) ?? null;
}