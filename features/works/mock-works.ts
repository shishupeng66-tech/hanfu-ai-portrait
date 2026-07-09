export type WorkStatus = 'completed' | 'processing' | 'failed' | 'favorited';

export interface MockWork {
  id: string;
  title: string;
  titleEn: string;
  titleZh: string;
  styleName: string;
  styleNameEn: string;
  styleNameZh: string;
  image: string;
  status: WorkStatus;
  createdAt: string;
  imageCount: number;
  credits: number;
  isFavorited: boolean;
  errorMessage?: string;
  errorMessageEn?: string;
  errorMessageZh?: string;
}

export function getLocalizedWorks(locale: string): MockWork[] {
  const isZh = locale === 'zh';
  return MOCK_WORKS.map((work) => ({
    ...work,
    title: isZh ? work.titleZh : work.titleEn,
    styleName: isZh ? work.styleNameZh : work.styleNameEn,
    errorMessage: isZh ? work.errorMessageZh : work.errorMessageEn,
  }));
}

export const MOCK_WORKS: MockWork[] = [
  {
    id: "1",
    title: "Tang Dynasty Portrait",
    titleEn: "Tang Dynasty Portrait",
    titleZh: "唐风仕女写真",
    styleName: "Tang Hanfu",
    styleNameEn: "Tang Hanfu",
    styleNameZh: "唐制汉服",
    image: "/images/hanfu-hero/palace-red-01.jpg",
    status: "completed",
    createdAt: "2024-01-15 14:30",
    imageCount: 4,
    credits: 2,
    isFavorited: true,
  },
  {
    id: "2",
    title: "Song Tea Portrait",
    titleEn: "Song Tea Portrait",
    titleZh: "宋韵茶席写真",
    styleName: "Song Hanfu",
    styleNameEn: "Song Hanfu",
    styleNameZh: "宋制汉服",
    image: "/images/hanfu-hero/jade-temple-01.jpg",
    status: "completed",
    createdAt: "2024-01-15 12:20",
    imageCount: 6,
    credits: 3,
    isFavorited: false,
  },
  {
    id: "3",
    title: "Ink-Blue Warrior Portrait",
    titleEn: "Ink-Blue Warrior Portrait",
    titleZh: "青黛侠客写真",
    styleName: "Wuxia Style",
    styleNameEn: "Wuxia Style",
    styleNameZh: "侠客风",
    image: "/images/hanfu-hero/spring-pink-01.jpg",
    status: "processing",
    createdAt: "2024-01-15 10:00",
    imageCount: 0,
    credits: 2,
    isFavorited: false,
  },
  {
    id: "4",
    title: "Red Snow Hanfu Portrait",
    titleEn: "Red Snow Hanfu Portrait",
    titleZh: "红妆雪景写真",
    styleName: "Snow Hanfu",
    styleNameEn: "Snow Hanfu",
    styleNameZh: "雪景古风",
    image: "/images/hanfu-hero/palace-red-02.jpg",
    status: "completed",
    createdAt: "2024-01-14 18:45",
    imageCount: 8,
    credits: 4,
    isFavorited: true,
  },
  {
    id: "5",
    title: "Dunhuang Flying Apsara Portrait",
    titleEn: "Dunhuang Flying Apsara Portrait",
    titleZh: "敦煌飞天写真",
    styleName: "Dunhuang Style",
    styleNameEn: "Dunhuang Style",
    styleNameZh: "西域敦煌",
    image: "/images/hanfu-hero/festival-lantern-01.jpg",
    status: "failed",
    createdAt: "2024-01-14 15:30",
    imageCount: 0,
    credits: 2,
    isFavorited: false,
    errorMessage: "Generation failed. Credits have been refunded.",
    errorMessageEn: "Generation failed. Credits have been refunded.",
    errorMessageZh: "生成失败，积分已退回",
  },
  {
    id: "6",
    title: "Lantern Night Portrait",
    titleEn: "Lantern Night Portrait",
    titleZh: "华灯初上写真",
    styleName: "Lantern Night Style",
    styleNameEn: "Lantern Night Style",
    styleNameZh: "夜景古风",
    image: "/images/hanfu-hero/palace-red-03.jpg",
    status: "completed",
    createdAt: "2024-01-14 10:15",
    imageCount: 4,
    credits: 2,
    isFavorited: false,
  },
  {
    id: "7",
    title: "Wei-Jin Scholar Portrait",
    titleEn: "Wei-Jin Scholar Portrait",
    titleZh: "魏晋清谈写真",
    styleName: "Wei-Jin Style",
    styleNameEn: "Wei-Jin Style",
    styleNameZh: "魏晋风骨",
    image: "/images/hanfu-hero/spring-pink-01.jpg",
    status: "processing",
    createdAt: "2024-01-13 22:00",
    imageCount: 0,
    credits: 3,
    isFavorited: false,
  },
  {
    id: "8",
    title: "Ming Palace Portrait",
    titleEn: "Ming Palace Portrait",
    titleZh: "明制宫廷写真",
    styleName: "Ming Hanfu",
    styleNameEn: "Ming Hanfu",
    styleNameZh: "明制汉服",
    image: "/images/hanfu-hero/jade-temple-01.jpg",
    status: "completed",
    createdAt: "2024-01-13 16:20",
    imageCount: 6,
    credits: 3,
    isFavorited: true,
  },
];