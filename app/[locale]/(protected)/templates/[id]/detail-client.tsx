"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";
import type { PublicTemplate } from "@/data/templates/client";

export default function TemplateDetailClientPage({
  template,
}: {
  template: PublicTemplate | null;
}) {
  const t = useTranslations("templates.detail");
  const locale = useLocale();
  const [isFavorited, setIsFavorited] = useState(false);

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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Preview Image */}
          <div className="lg:col-span-3">
            <div
              className="aspect-[3/4] relative rounded-xl overflow-hidden"
              style={{
                background: "#111114",
                border: "1px solid rgba(255, 247, 236, 0.08)",
              }}
            >
              {template.coverImage ? (
                <Image
                  src={template.coverImage}
                  alt={displayName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-sm text-[rgba(255,247,236,0.25)]">No preview</span>
                </div>
              )}
            </div>

            {/* Gallery Section */}
            {template.previewImages.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
                  {t("morePreviews")}
                </h3>
                <p className="text-sm mb-4" style={{ color: "rgba(255, 247, 236, 0.5)" }}>
                  {t("morePreviewsSubtitle")}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {template.previewImages.map((img, index) => (
                    <div
                      key={index}
                      className="aspect-[3/4] relative rounded-lg overflow-hidden"
                      style={{
                        background: "#111114",
                        border: "1px solid rgba(255, 247, 236, 0.08)",
                      }}
                    >
                      <Image
                        src={img}
                        alt={`${t("preview")} ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Info Sidebar */}
          <div className="lg:col-span-2">
            <div
              className="rounded-xl p-6 sticky top-8"
              style={{
                background: "#111114",
                border: "1px solid rgba(255, 247, 236, 0.08)",
              }}
            >
              <h1 className="text-2xl font-bold mb-1" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
                {displayName}
              </h1>
              <p className="text-sm mb-6" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
                {displayDesc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
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

              {/* Info Grid */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3" style={{ color: "rgba(255, 247, 236, 0.7)" }}>
                  {t("templateInfo")}
                </h3>
                <div className="space-y-3">
                  <InfoRow label={t("dynasty")} value={template.dynasty} />
                  <InfoRow label={t("category")} value={template.category} />
                  <InfoRow label={t("shots")} value={String(template.shots.length)} />
                  <InfoRow label={t("templateAccess")} value={template.status === "published" ? t("free") : t("templateAccess")} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/generate?template=${template.slug}`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
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
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
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

                <Link
                  href={`/${locale}/templates`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm transition-all"
                  style={{ color: "rgba(255, 247, 236, 0.5)" }}
                >
                  {t("viewMoreTemplates")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm shrink-0" style={{ color: "rgba(255, 247, 236, 0.5)" }}>
        {label}
      </span>
      <span className="text-sm text-right" style={{ color: "rgba(255, 247, 236, 0.85)" }}>
        {value}
      </span>
    </div>
  );
}