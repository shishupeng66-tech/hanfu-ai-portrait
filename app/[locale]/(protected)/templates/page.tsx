"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  templateLibraryData,
  type TemplateCategoryWithAll,
  type TemplateFilter,
} from "@/features/templates/template-data";

const categoryTabs: Array<TemplateCategoryWithAll> = ["all", "tang", "song", "yuan", "ming", "qing", "modern", "dunhuang", "qipao"];
const filterChips: TemplateFilter[] = ["popular", "new", "premium", "free", "favorited"];

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20.8 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.02-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.74-7.74 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

export default function TemplatesPage() {
  const t = useTranslations("templates.list");
  const tTemplate = useTranslations("templates");
  const locale = useLocale();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<TemplateCategoryWithAll>("all");
  const [activeFilters, setActiveFilters] = useState<Set<TemplateFilter>>(new Set());

  const toggleFilter = (filter: TemplateFilter) => {
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
    const result = templateLibraryData.filter((template) => {
      if (activeCategory !== "all" && template.category !== activeCategory) {
        return false;
      }
      if (activeFilters.size > 0) {
        const hasMatchingFilter = template.filters.some((f) => activeFilters.has(f));
        if (!hasMatchingFilter) {
          return false;
        }
      }
      return true;
    });
    return result;
  }, [activeCategory, activeFilters]);

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
                onClick={() => router.push(`/${locale}/templates/${template.id}`)}
                className="group relative rounded-xl overflow-hidden transition-all duration-300 text-left"
                style={{
                  background: "#111114",
                  border: "1px solid rgba(255, 247, 236, 0.08)",
                }}
              >
                {/* Preview Image */}
                <div className="aspect-[3/4] relative overflow-hidden">
                  <Image
                    src={template.previewUrl}
                    alt={tTemplate(`templates.${template.id}.name`)}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div
                      className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: "rgba(232, 194, 122, 0.15)",
                        color: "#E8C27A",
                        border: "1px solid rgba(232, 194, 122, 0.25)",
                      }}
                    >
                      {t("filters.premium")}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{
                        background: "rgba(232, 194, 122, 0.2)",
                        color: "#E8C27A",
                        border: "1px solid rgba(232, 194, 122, 0.3)",
                      }}
                    >
                      {t("viewDetails")}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold truncate" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
                      {tTemplate(`templates.${template.id}.name`)}
                    </h4>
                    <HeartIcon filled={false} />
                  </div>
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
                    {tTemplate(`templates.${template.id}.description`)}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[0, 1, 2].map((idx) => {
                      const tag = tTemplate(`templates.${template.id}.styleTags.${idx}`);
                      if (!tag || tag.startsWith("templates.")) return null;
                      return (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            background: "rgba(255, 247, 236, 0.04)",
                            color: "rgba(255, 247, 236, 0.4)",
                          }}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-base" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
              {t("empty")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}