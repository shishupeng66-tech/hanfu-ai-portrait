export type WorkStatus = 'completed' | 'processing' | 'failed' | 'favorited';

export interface MockWork {
  id: string;
  title: string;
  styleName: string;
  image: string;
  status: WorkStatus;
  createdAt: string;
  imageCount: number;
  credits: number;
  isFavorited: boolean;
  errorMessage?: string;
}

export const MOCK_WORKS: MockWork[] = [
  {
    id: "1",
    title: "唐风仕女写真",
    styleName: "唐制汉服",
    image: "/images/hanfu-hero/palace-red-01.jpg",
    status: "completed",
    createdAt: "2024-01-15 14:30",
    imageCount: 4,
    credits: 2,
    isFavorited: true,
  },
  {
    id: "2",
    title: "宋韵茶席写真",
    styleName: "宋制汉服",
    image: "/images/hanfu-hero/jade-temple-01.jpg",
    status: "completed",
    createdAt: "2024-01-15 12:20",
    imageCount: 6,
    credits: 3,
    isFavorited: false,
  },
  {
    id: "3",
    title: "青黛侠客写真",
    styleName: "侠客风",
    image: "/images/hanfu-hero/spring-pink-01.jpg",
    status: "processing",
    createdAt: "2024-01-15 10:00",
    imageCount: 0,
    credits: 2,
    isFavorited: false,
  },
  {
    id: "4",
    title: "红妆雪景写真",
    styleName: "雪景古风",
    image: "/images/hanfu-hero/palace-red-02.jpg",
    status: "completed",
    createdAt: "2024-01-14 18:45",
    imageCount: 8,
    credits: 4,
    isFavorited: true,
  },
  {
    id: "5",
    title: "敦煌飞天写真",
    styleName: "西域敦煌",
    image: "/images/hanfu-hero/festival-lantern-01.jpg",
    status: "failed",
    createdAt: "2024-01-14 15:30",
    imageCount: 0,
    credits: 2,
    isFavorited: false,
    errorMessage: "生成失败，积分已退回",
  },
  {
    id: "6",
    title: "华灯初上写真",
    styleName: "夜景古风",
    image: "/images/hanfu-hero/palace-red-03.jpg",
    status: "completed",
    createdAt: "2024-01-14 10:15",
    imageCount: 4,
    credits: 2,
    isFavorited: false,
  },
  {
    id: "7",
    title: "魏晋清谈写真",
    styleName: "魏晋风骨",
    image: "/images/hanfu-hero/spring-pink-01.jpg",
    status: "processing",
    createdAt: "2024-01-13 22:00",
    imageCount: 0,
    credits: 3,
    isFavorited: false,
  },
  {
    id: "8",
    title: "明制宫廷写真",
    styleName: "明制汉服",
    image: "/images/hanfu-hero/jade-temple-01.jpg",
    status: "completed",
    createdAt: "2024-01-13 16:20",
    imageCount: 6,
    credits: 3,
    isFavorited: true,
  },
];
