"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

type TemplateCategory = "唐" | "宋" | "元" | "明" | "清" | "新中式" | "敦煌" | "旗袍";
type TemplateFilter = "热门" | "最新" | "会员专属" | "免费可用" | "已收藏";

type TemplateCard = {
  id: string;
  name: string;
  category: TemplateCategory;
  style: string;
  image: string;
  credits: number;
  filters: TemplateFilter[];
  premium?: boolean;
};

const categoryTabs: Array<"全部" | TemplateCategory> = ["全部", "唐", "宋", "元", "明", "清", "新中式", "敦煌", "旗袍"];
const filterChips: TemplateFilter[] = ["热门", "最新", "会员专属", "免费可用", "已收藏"];

const templateLibraryData: TemplateCard[] = [
  {
    id: "tangGlamour",
    name: "盛唐金影",
    category: "唐",
    style: "唐风",
    image: "/images/hanfu-hero/palace-red-02.jpg",
    credits: 10,
    filters: ["热门", "最新"],
  },
  {
    id: "songElegance",
    name: "宋韵清婉",
    category: "宋",
    style: "宋韵",
    image: "/images/hanfu-hero/palace-red-03.jpg",
    credits: 10,
    filters: ["免费可用"],
  },
  {
    id: "qinHanNoir",
    name: "秦汉玄色",
    category: "元",
    style: "秦汉",
    image: "/images/hanfu-hero/palace-red-01.jpg",
    credits: 10,
    filters: ["热门"],
  },
  {
    id: "drunkenFlower",
    name: "醉花影",
    category: "唐",
    style: "国风",
    image: "/images/hanfu-hero/festival-lantern-01.jpg",
    credits: 10,
    filters: ["热门"],
  },
  {
    id: "pearBlossom",
    name: "梨花幽韵",
    category: "新中式",
    style: "新中式",
    image: "/images/hanfu-hero/spring-pink-01.jpg",
    credits: 10,
    filters: ["免费可用"],
  },
  {
    id: "dunhuangMuse",
    name: "敦煌飞天",
    category: "敦煌",
    style: "敦煌",
    image: "/images/hanfu-hero/jade-temple-01.jpg",
    credits: 10,
    filters: ["会员专属", "热门"],
    premium: true,
  },
  {
    id: "bluePorcelain",
    name: "青花瓷影",
    category: "新中式",
    style: "青花",
    image: "/images/hanfu-hero/jade-temple-01.jpg",
    credits: 10,
    filters: ["热门", "最新"],
  },
  {
    id: "winterRed",
    name: "冬雪红妆",
    category: "清",
    style: "清韵",
    image: "/images/hanfu-hero/festival-lantern-01.jpg",
    credits: 10,
    filters: ["热门"],
  },
  {
    id: "palaceLantern",
    name: "宫灯夜宴",
    category: "唐",
    style: "唐风",
    image: "/images/hanfu-hero/festival-lantern-01.jpg",
    credits: 10,
    filters: ["会员专属"],
    premium: true,
  },
  {
    id: "modernQipao",
    name: "现代旗袍",
    category: "旗袍",
    style: "旗袍",
    image: "/images/hanfu-hero/spring-pink-01.jpg",
    credits: 10,
    filters: ["免费可用", "最新"],
  },
  {
    id: "courtyardShadow",
    name: "庭院清影",
    category: "宋",
    style: "宋韵",
    image: "/images/hanfu-hero/palace-red-02.jpg",
    credits: 10,
    filters: ["免费可用"],
  },
  {
    id: "phoenixCrown",
    name: "凤冠霞帔",
    category: "明",
    style: "明制",
    image: "/images/hanfu-hero/palace-red-02.jpg",
    credits: 10,
    filters: ["会员专属", "热门"],
    premium: true,
  },
];

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

export default function TemplatesPage() {
  const locale = useLocale();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<"全部" | TemplateCategory>("全部");
  const [activeFilter, setActiveFilter] = useState<TemplateFilter | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return templateLibraryData.filter((template) => {
      const matchesSearch =
        !normalizedSearch ||
        `${template.name} ${template.category} ${template.style} ${template.filters.join(" ")}`.toLowerCase().includes(normalizedSearch);
      const matchesCategory = activeCategory === "全部" || template.category === activeCategory || template.style === activeCategory;
      const matchesFilter =
        !activeFilter ||
        (activeFilter === "已收藏" ? favoriteIds.has(template.id) : template.filters.includes(activeFilter));

      return matchesSearch && matchesCategory && matchesFilter;
    });
  }, [activeCategory, activeFilter, favoriteIds, searchTerm]);

  const toggleFavorite = (templateId: string) => {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setActiveCategory("全部");
    setActiveFilter(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] px-6 py-8 text-[rgba(255,247,236,0.92)]">
      <div className="mx-auto max-w-[1440px]">
        <section className="mb-6 rounded-[24px] border border-[rgba(255,247,236,0.08)] bg-[rgba(17,17,20,0.88)] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(255,247,236,0.35)]">
              <SearchIcon />
            </span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="搜索模板、朝代或风格..."
              className="h-12 w-full rounded-xl border border-[rgba(255,247,236,0.08)] bg-[#0B0B0D] pl-11 pr-4 text-sm text-[rgba(255,247,236,0.86)] outline-none transition placeholder:text-[rgba(255,247,236,0.28)] focus:border-[rgba(232,194,122,0.34)]"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categoryTabs.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className="rounded-full border px-4 py-2 text-sm transition"
                  style={{
                    background: isActive ? "rgba(232,194,122,0.14)" : "rgba(255,247,236,0.04)",
                    borderColor: isActive ? "rgba(232,194,122,0.54)" : "rgba(255,247,236,0.08)",
                    color: isActive ? "#E8C27A" : "rgba(255,247,236,0.62)",
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {filterChips.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(isActive ? null : filter)}
                  className="rounded-full border px-3 py-1.5 text-xs transition"
                  style={{
                    background: isActive ? "rgba(232,194,122,0.10)" : "rgba(255,247,236,0.035)",
                    borderColor: isActive ? "rgba(232,194,122,0.42)" : "rgba(255,247,236,0.08)",
                    color: isActive ? "#E8C27A" : "rgba(255,247,236,0.52)",
                  }}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </section>

        {filteredTemplates.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {filteredTemplates.map((template) => {
              const isFavorite = favoriteIds.has(template.id);

              return (
                <article
                  key={template.id}
                  className="group relative overflow-hidden rounded-[22px] border border-[rgba(255,247,236,0.08)] bg-[#111114] shadow-[0_16px_54px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:border-[rgba(232,194,122,0.26)]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={template.image}
                      alt={template.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.04] group-hover:brightness-110"
                      sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#111114] via-[rgba(17,17,20,0.76)] to-transparent" />

                    <button
                      type="button"
                      onClick={() => toggleFavorite(template.id)}
                      className={cn(
                        "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition",
                        isFavorite
                          ? "border-[rgba(232,194,122,0.42)] bg-[rgba(232,194,122,0.18)] text-[#E8C27A]"
                          : "border-[rgba(255,247,236,0.10)] bg-[rgba(11,11,13,0.58)] text-[rgba(255,247,236,0.62)] hover:text-[#E8C27A]"
                      )}
                      aria-label={isFavorite ? "取消收藏" : "收藏模板"}
                    >
                      <HeartIcon filled={isFavorite} />
                    </button>

                    {template.premium && (
                      <span className="absolute left-3 top-3 rounded-full border border-[rgba(232,194,122,0.22)] bg-[rgba(11,11,13,0.66)] px-2.5 py-1 text-xs text-[#E8C27A] backdrop-blur">
                        会员专属
                      </span>
                    )}

                    <Link
                      href={`/${locale}/generate?template=${template.id}`}
                      className="absolute inset-x-4 bottom-4 flex h-11 translate-y-2 items-center justify-center rounded-xl bg-[#E8C27A] text-sm font-semibold text-[#0B0B0D] opacity-0 shadow-[0_14px_38px_rgba(0,0,0,0.28)] transition group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#F2D38A]"
                    >
                      使用此模板
                    </Link>
                  </div>

                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-[rgba(255,247,236,0.92)]">{template.name}</h2>
                        <p className="mt-1 text-sm text-[rgba(255,247,236,0.45)]">{template.category} · {template.style}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-[rgba(232,194,122,0.16)] px-2 py-1 text-xs text-[#E8C27A]">
                        {template.credits} 积分
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {template.filters.slice(0, 2).map((filter) => (
                        <span key={filter} className="rounded-full border border-[rgba(255,247,236,0.08)] bg-[rgba(255,247,236,0.04)] px-2.5 py-1 text-xs text-[rgba(255,247,236,0.48)]">
                          {filter}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="rounded-[24px] border border-[rgba(255,247,236,0.08)] bg-[#111114] px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-[rgba(255,247,236,0.92)]">没有找到相关模板</h2>
            <p className="mt-2 text-sm text-[rgba(255,247,236,0.48)]">换个关键词或分类试试。</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-[rgba(232,194,122,0.24)] px-5 text-sm font-medium text-[#E8C27A] transition hover:bg-[rgba(232,194,122,0.08)]"
            >
              查看全部模板
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
