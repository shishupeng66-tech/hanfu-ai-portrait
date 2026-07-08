export type ApiTemplateKey = "nightLanternRedBlackHanfu";

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

const defaultGallery = [
  "/images/hanfu-hero/palace-red-02.jpg",
  "/images/hanfu-hero/palace-red-03.jpg",
  "/images/hanfu-hero/palace-red-01.jpg",
  "/images/hanfu-hero/festival-lantern-01.jpg",
  "/images/hanfu-hero/spring-pink-01.jpg",
  "/images/hanfu-hero/jade-temple-01.jpg",
];

const makeTemplate = (
  template: Omit<
    HanfuTemplate,
    "apiTemplateKey" | "creditCost" | "generationCount" | "galleryImages" | "recommendedPhotoType" | "audience" | "usageTips"
  > &
    Partial<Pick<HanfuTemplate, "galleryImages" | "recommendedPhotoType" | "audience" | "usageTips">>
): HanfuTemplate => ({
  apiTemplateKey: "nightLanternRedBlackHanfu",
  creditCost: 10,
  generationCount: 4,
  galleryImages: template.galleryImages ?? defaultGallery,
  recommendedPhotoType: template.recommendedPhotoType ?? "Clear front-facing portrait with good lighting.",
  audience: template.audience ?? "Perfect for users who want authentic traditional Hanfu styling.",
  usageTips: template.usageTips ?? "For best results, use a photo with a simple background and clear facial features.",
  ...template,
});

export const hanfuTemplates: HanfuTemplate[] = [
  makeTemplate({
    id: "tangGlamour",
    name: "Tang Glamour",
    dynasty: "tang",
    category: "tang",
    label: "Tang Dynasty",
    styleTags: ["Tang", "Glamorous", "Traditional"],
    filters: ["popular", "new"],
    description: "Elegant Tang dynasty styling with vibrant colors and flowing sleeves.",
    previewUrl: "/images/hanfu-hero/palace-red-02.jpg",
    isPremium: false,
    audience: "Ideal for users seeking authentic Tang dynasty elegance and royal aesthetics.",
  }),
  makeTemplate({
    id: "palaceLantern",
    name: "Palace Lantern",
    dynasty: "tang",
    category: "tang",
    label: "Tang Dynasty",
    styleTags: ["Tang", "Palace", "Festive"],
    filters: ["premium"],
    description: "Warm festive atmosphere inspired by Tang palace lantern ceremonies.",
    previewUrl: "/images/hanfu-hero/festival-lantern-01.jpg",
    isPremium: true,
  }),
  makeTemplate({
    id: "songElegance",
    name: "Song Elegance",
    dynasty: "song",
    category: "song",
    label: "Song Dynasty",
    styleTags: ["Song", "Elegant", "Minimalist"],
    filters: ["free"],
    description: "Refined Song dynasty aesthetics with subtle patterns and clean silhouettes.",
    previewUrl: "/images/hanfu-hero/palace-red-03.jpg",
    isPremium: false,
  }),
  makeTemplate({
    id: "teaGathering",
    name: "Tea Gathering",
    dynasty: "song",
    category: "song",
    label: "Song Dynasty",
    styleTags: ["Song", "Literary", "Elegant"],
    filters: ["free"],
    description: "Scholarly Song dynasty style perfect for tea ceremony aesthetics.",
    previewUrl: "/images/hanfu-hero/spring-pink-01.jpg",
    isPremium: false,
  }),
  makeTemplate({
    id: "landscapePlain",
    name: "Landscape Scholar",
    dynasty: "song",
    category: "song",
    label: "Song Dynasty",
    styleTags: ["Song", "Scholarly", "Minimalist"],
    filters: ["new"],
    description: "Song dynasty literati-inspired Hanfu with landscape painting influences.",
    previewUrl: "/images/hanfu-hero/jade-temple-01.jpg",
    isPremium: false,
  }),
  makeTemplate({
    id: "mingFormal",
    name: "Ming Formal",
    dynasty: "ming",
    category: "ming",
    label: "Ming Dynasty",
    styleTags: ["Ming", "Formal", "Regal"],
    filters: ["new"],
    description: "Formal Ming dynasty court attire with intricate embroidery.",
    previewUrl: "/images/hanfu-hero/jade-temple-01.jpg",
    isPremium: false,
  }),
  makeTemplate({
    id: "phoenixCrown",
    name: "Phoenix Crown",
    dynasty: "ming",
    category: "ming",
    label: "Ming Dynasty",
    styleTags: ["Ming", "Royal", "Wedding"],
    filters: ["premium", "popular"],
    description: "Magnificent Ming dynasty ceremonial attire with phoenix crown decorations.",
    previewUrl: "/images/hanfu-hero/palace-red-02.jpg",
    isPremium: true,
  }),
  makeTemplate({
    id: "boudoirLady",
    name: "Boudoir Lady",
    dynasty: "ming",
    category: "ming",
    label: "Ming Dynasty",
    styleTags: ["Ming", "Elegant", "Graceful"],
    filters: ["free"],
    description: "Gentle Ming dynasty styling for a refined scholarly appearance.",
    previewUrl: "/images/hanfu-hero/spring-pink-01.jpg",
    isPremium: false,
  }),
  makeTemplate({
    id: "qingPalace",
    name: "Qing Palace",
    dynasty: "qing",
    category: "qing",
    label: "Qing Dynasty",
    styleTags: ["Qing", "Palace", "Regal"],
    filters: ["new"],
    description: "Imperial Qing dynasty Manchu palace robe styling.",
    previewUrl: "/images/hanfu-hero/jade-temple-01.jpg",
    isPremium: false,
  }),
  makeTemplate({
    id: "qipaoFlower",
    name: "Modern Qipao",
    dynasty: "modern",
    category: "qipao",
    label: "Modern Style",
    styleTags: ["Qipao", "Modern", "Elegant"],
    filters: ["free"],
    description: "Contemporary qipao (cheongsam) fusion with traditional elements.",
    previewUrl: "/images/hanfu-hero/spring-pink-01.jpg",
    isPremium: false,
  }),
  makeTemplate({
    id: "bluePorcelain",
    name: "Blue Porcelain",
    dynasty: "modern",
    category: "modern",
    label: "Modern Style",
    styleTags: ["Porcelain", "Blue", "Modern"],
    filters: ["popular", "new"],
    description: "Blue and white porcelain-inspired contemporary Hanfu design.",
    previewUrl: "/images/hanfu-hero/jade-temple-01.jpg",
    isPremium: false,
  }),
  makeTemplate({
    id: "modernGuofeng",
    name: "Guofeng Fashion",
    dynasty: "modern",
    category: "modern",
    label: "Modern Style",
    styleTags: ["Fashion", "Contemporary", "Stylish"],
    filters: ["popular"],
    description: "Fashion-forward modern Chinese style with traditional influences.",
    previewUrl: "/images/hanfu-hero/palace-red-03.jpg",
    isPremium: false,
  }),
  makeTemplate({
    id: "orientalMagazine",
    name: "Oriental Vogue",
    dynasty: "modern",
    category: "modern",
    label: "Modern Style",
    styleTags: ["Vogue", "Editorial", "Oriental"],
    filters: ["new"],
    description: "High-fashion editorial style with oriental aesthetics.",
    previewUrl: "/images/hanfu-hero/palace-red-02.jpg",
    isPremium: false,
  }),
  makeTemplate({
    id: "dunhuangMuse",
    name: "Dunhuang Muse",
    dynasty: "tang",
    category: "dunhuang",
    label: "Dunhuang",
    styleTags: ["Dunhuang", "Fresco", "Artistic"],
    filters: ["premium", "popular"],
    description: "Dunhuang fresco-inspired artistic Hanfu with celestial aesthetics.",
    previewUrl: "/images/hanfu-hero/jade-temple-01.jpg",
    isPremium: true,
  }),
];

export const dynastyTabs: TemplateDynasty[] = ["tang", "song", "yuan", "ming", "qing", "modern"];

export const featuredTemplateIds = [
  "tangGlamour",
  "songElegance",
  "dunhuangMuse",
  "bluePorcelain",
  "phoenixCrown",
  "modernGuofeng",
];

export const templateLibraryIds = [
  "tangGlamour",
  "songElegance",
  "dunhuangMuse",
  "bluePorcelain",
  "phoenixCrown",
  "palaceLantern",
];

export const templateLibraryData = templateLibraryIds
  .map((templateId) => hanfuTemplates.find((template) => template.id === templateId))
  .filter((template): template is HanfuTemplate => Boolean(template));

export function getTemplateById(id: string) {
  return hanfuTemplates.find((template) => template.id === id) ?? null;
}
