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
export const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    slug: "tang-lantern-festival-night-fair",
    nameZh: "唐朝·上元灯会",
    nameEn: "Tang Dynasty · Lantern Festival Night Fair",
    descriptionZh:
      "大唐上元夜，长安城灯火如昼，仕女提灯漫步于花灯市集。金碧辉煌的楼阁，漫天飞舞的孔明灯，尽显盛唐风华。",
    descriptionEn:
      "On the Lantern Festival night of the Tang Dynasty, the capital Chang'an glows with countless lanterns. Elegant ladies stroll through the fair with handheld lanterns, surrounded by golden pavilions and floating sky lanterns.",
    category: "hanfu",
    dynasty: "tang",
    stylePrompt:
      "盛唐风格，上元灯会场景，金碧辉煌，华丽唐装服饰，精致妆容，温暖灯光氛围，古典宫廷背景。",
    generationConfig: {
      model: "doubao-seedream-5-0-lite",
      size: "3072x4096",
      aspectRatio: "3:4",
      count: 1,
      workflow: "identity_transfer",
    },
    creditsPerGeneration: 4,
    shots: [
      {
        shotKey: "shot-01",
        sortOrder: 1,
        titleZh: "灯市初遇",
        titleEn: "Lanterns at Nightfall",
        referenceImage: "https://pub-8f864adfb2174af9ba9aa03f83a659f7.r2.dev/templates/tang-lantern-festival-night-fair/shot1.png",
        stylePrompt: "夜景灯光，手持花灯，温暖烛光映照面容",
      },
      {
        shotKey: "shot-02",
        sortOrder: 2,
        titleZh: "玉兔花灯",
        titleEn: "Jade Rabbit Lantern",
        referenceImage: "https://pub-8f864adfb2174af9ba9aa03f83a659f7.r2.dev/templates/tang-lantern-festival-night-fair/shot2.png",
        stylePrompt: "兔子造型花灯，月色朦胧，粉色罗裙",
      },
      {
        shotKey: "shot-03",
        sortOrder: 3,
        titleZh: "锦绣华裳",
        titleEn: "Splendid Attire",
        referenceImage: "https://pub-8f864adfb2174af9ba9aa03f83a659f7.r2.dev/templates/tang-lantern-festival-night-fair/shot3.png",
        stylePrompt: "锦绣华服特写，金线刺绣，牡丹花纹",
      },
      {
        shotKey: "shot-04",
        sortOrder: 4,
        titleZh: "月上柳梢",
        titleEn: "Moonlit Promise",
        referenceImage: "https://pub-8f864adfb2174af9ba9aa03f83a659f7.r2.dev/templates/tang-lantern-festival-night-fair/shot4.png",
        stylePrompt: "柳树月下，圆月背景，清冷优雅氛围",
      },
      {
        shotKey: "shot-05",
        sortOrder: 5,
        titleZh: "鱼龙夜舞",
        titleEn: "Fish and Dragon Dance",
        referenceImage: "https://pub-8f864adfb2174af9ba9aa03f83a659f7.r2.dev/templates/tang-lantern-festival-night-fair/shot5.png",
        stylePrompt: "鱼龙灯舞，热闹街市，动态光影",
      },
      {
        shotKey: "shot-06",
        sortOrder: 6,
        titleZh: "花好月圆",
        titleEn: "Blissful Union",
        referenceImage: "https://pub-8f864adfb2174af9ba9aa03f83a659f7.r2.dev/templates/tang-lantern-festival-night-fair/shot6.png",
        stylePrompt: "花丛月下，团扇遮面，浪漫唯美氛围",
      },
      {
        shotKey: "shot-07",
        sortOrder: 7,
        titleZh: "春宵灯影",
        titleEn: "Spring Night Shadows",
        referenceImage: "https://pub-8f864adfb2174af9ba9aa03f83a659f7.r2.dev/templates/tang-lantern-festival-night-fair/shot7.png",
        stylePrompt: "春夜灯影摇曳，朦胧光晕，诗意氛围",
      },
      {
        shotKey: "shot-08",
        sortOrder: 8,
        titleZh: "盛世红妆",
        titleEn: "Imperial Elegance",
        referenceImage: "https://pub-8f864adfb2174af9ba9aa03f83a659f7.r2.dev/templates/tang-lantern-festival-night-fair/shot8.png",
        stylePrompt: "宫廷红妆，金饰凤冠，华丽盛唐风范",
      },
    ],
  },
];