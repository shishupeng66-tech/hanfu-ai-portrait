"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";
import type { PublicTemplate } from "@/data/templates/client";

/**
 * Resolve the display image for a template.
 * Priority: coverImage > shots[0].referenceImage
 */
function getDisplayImage(template: PublicTemplate): string | null {
  if (template.coverImage?.trim()) return template.coverImage;
  const firstShot = template.shots
    .filter((s) => s.referenceImage?.trim())
    .sort((a, b) => a.order - b.order)[0];
  if (firstShot?.referenceImage) return firstShot.referenceImage;
  return null;
}

export default function TemplateDetailClientPage({
  template,
}: {
  template: PublicTemplate | null;
}) {
  const t = useTranslations("templates.detail");
  const locale = useLocale();
  const [isFavorited, setIsFavorited] = useState(false);

  const sortedShots = useMemo(
    () => (template ? [...template.shots].sort((a, b) => a.order - b.order) : []),
    [template],
  );
  const displayImage = useMemo(
    () => (template ? getDisplayImage(template) : null),
    [template],
  );

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0B0D" }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
            {t("notFound")}
          </h1>
          <p className="text-base mb-6" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
            {t("notFoundDescription")}
          </p>
          <Link
            href={`/${locale}/templates`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "rgba(255, 247, 236, 0.06)",
              color: "rgba(255, 247, 236, 0.9)",
              border: "1px solid rgba(255, 247, 236, 0.12)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToTemplates")}
          </Link>
        </div>
      </div>
    );
  }

  const displayName = template.name.zh || template.name.en;
  const displayDesc = template.description.zh || template.description.en;

  // Collect all shot images for the gallery
  const shotImages = sortedShots.filter((s) => s.referenceImage?.trim());

  return (
    <div className="min-h-screen" style={{ background: "#0B0B0D" }}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/${locale}/templates`}
          className="inline-flex items-center gap-2 mb-6 text-sm transition-colors"
          style={{ color: "rgba(255, 247, 236, 0.55)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToTemplates")}
        </Link>

        {/* Header: Title + Description + Actions */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
            {displayName}
          </h1>
          <p className="text-base mb-4 max-w-2xl" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
            {displayDesc}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-xs"
                style={{
                  background: "rgba(255, 247, 236, 0.04)",
                  color: "rgba(255, 247, 236, 0.5)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Info Row */}
          <div className="flex items-center gap-6 mb-5 text-sm" style={{ color: "rgba(255, 247, 236, 0.5)" }}>
            {template.dynasty && <span>{template.dynasty}</span>}
            <span>{template.shots.length} {t("shots")}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/generate?template=${template.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #E8C27A 0%, #D4A84B 100%)",
                color: "#1a1508",
              }}
            >
              <Sparkles className="w-4 h-4" />
              {t("useThisTemplate")}
            </Link>

            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(255, 247, 236, 0.04)",
                color: isFavorited ? "#E8C27A" : "rgba(255, 247, 236, 0.7)",
                border: isFavorited
                  ? "1px solid rgba(232, 194, 122, 0.25)"
                  : "1px solid rgba(255, 247, 236, 0.1)",
              }}
            >
              <Heart
                className="w-4 h-4"
                fill={isFavorited ? "#E8C27A" : "none"}
                stroke={isFavorited ? "#E8C27A" : "currentColor"}
              />
              {isFavorited ? t("saved") : t("saveTemplate")}
            </button>
          </div>
        </div>

        {/* Shot Gallery: 4-column grid */}
        {shotImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {shotImages.map((shot) => (
              <div
                key={shot.shotKey}
                className="aspect-[3/4] relative rounded-lg overflow-hidden"
                style={{
                  background: "#111114",
                  border: "1px solid rgba(255, 247, 236, 0.08)",
                }}
              >
                <Image
                  src={shot.referenceImage}
                  alt={shot.title.zh || shot.title.en || shot.shotKey}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <span className="text-xs text-white font-medium">
                    {shot.title.zh || shot.title.en || shot.shotKey}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : displayImage ? (
          <div className="aspect-[3/4] max-w-sm relative rounded-lg overflow-hidden"
            style={{ background: "#111114", border: "1px solid rgba(255, 247, 236, 0.08)" }}>
            <Image src={displayImage} alt={displayName} fill sizes="400px" className="object-cover" />
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <span className="text-sm text-[rgba(255,247,236,0.25)]">No preview</span>
          </div>
        )}
      </div>
    </div>
  );
}