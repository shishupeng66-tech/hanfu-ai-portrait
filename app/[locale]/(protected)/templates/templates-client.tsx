"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { PublicTemplate } from "@/data/templates/client";

const categoryTabs = ["all", "tang", "song", "yuan", "ming", "qing", "modern", "dunhuang", "qipao"] as const;
const filterChips = ["popular", "new", "premium", "free", "favorited"] as const;

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20.8 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.02-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.74-7.74 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

export default function TemplatesClientPage({ templates }: { templates: PublicTemplate[] }) {
  const t = useTranslations("templates.list");
  const tTemplates = useTranslations("templates");
  const locale = useLocale();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (activeCategory !== "all" && template.category !== activeCategory) {
        return false;
      }
      if (activeFilters.size > 0) {
        // Simple filter: featured for "popular", tags for others
        if (activeFilters.has("popular") && !template.featured) return false;
        if (activeFilters.has("new") && !template.tags.includes("new")) return false;
        if (activeFilters.has("premium") && !template.tags.includes("premium")) return false;
        if (activeFilters.has("free") && template.tags.includes("premium")) return false;
      }
      return true;
    });
  }, [templates, activeCategory, activeFilters]);

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0D" }}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
            {t("title")}
          </h1>
          <p className="text-base" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
            {t("subtitle")}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 [&::-webkit-scrollbar]:hidden">
          {categoryTabs.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
              style={{
                background: activeCategory === category ? "rgba(232, 194, 122, 0.12)" : "transparent",
                color: activeCategory === category ? "#E8C27A" : "rgba(255, 247, 236, 0.65)",
                border: activeCategory === category ? "1px solid rgba(232, 194, 122, 0.2)" : "1px solid transparent",
              }}
            >
              {t(`categories.${category}`)}
            </button>
          ))}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          {filterChips.map((filter) => {
            const isActive = activeFilters.has(filter);
            return (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: isActive ? "rgba(232, 194, 122, 0.12)" : "rgba(255, 247, 236, 0.03)",
                  color: isActive ? "#E8C27A" : "rgba(255, 247, 236, 0.55)",
                  border: isActive ? "1px solid rgba(232, 194, 122, 0.2)" : "1px solid rgba(255, 247, 236, 0.06)",
                }}
              >
                {t(`filters.${filter}`)}
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => router.push(`/${locale}/templates/${template.slug}`)}
                className="group relative rounded-xl overflow-hidden transition-all duration-300 text-left"
                style={{
                  background: "#111114",
                  border: "1px solid rgba(255, 247, 236, 0.08)",
                }}
              >
                {/* Preview Image */}
                <div className="aspect-[3/4] relative overflow-hidden">
                  {template.coverImage ? (
                    <Image
                      src={template.coverImage}
                      alt={template.name.zh || template.name.en}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-[#1a1a1e]">
                      <span className="text-sm text-[rgba(255,247,236,0.25)]">No preview</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold truncate" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
                      {template.name.zh || template.name.en}
                    </h4>
                    <HeartIcon filled={false} />
                  </div>
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
                    {template.description.zh || template.description.en}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: "rgba(255, 247, 236, 0.04)",
                          color: "rgba(255, 247, 236, 0.4)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(255, 247, 236, 0.03)" }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "rgba(255, 247, 236, 0.25)" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <path d="M12 18v-6" />
                <path d="M9 15h6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
              {tTemplates("emptyLibrary.title")}
            </h3>
            <p className="text-sm text-center max-w-md" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
              {tTemplates("emptyLibrary.subtitle")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}