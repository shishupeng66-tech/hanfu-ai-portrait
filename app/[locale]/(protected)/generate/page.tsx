"use client";

import Image from "next/image";
import { ChangeEvent, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LocaleLink } from "@/components/locale-link";

type StyleTemplate = {
  id: string;
  key: string;
  name: string;
  description: string;
  previewUrl: string;
};

export default function GeneratePage() {
  const locale = useLocale();
  const t = useTranslations("generate");
  const tStudio = useTranslations("studio");
  const tGeneral = useTranslations();

  // State management
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("tangGlamour");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Style templates data
  const styleTemplates: StyleTemplate[] = useMemo(
    () => [
      {
        id: "tangGlamour",
        key: "tangGlamour",
        name: t("styles.tangGlamour.name"),
        description: t("styles.tangGlamour.description"),
        previewUrl: "/images/hanfu-hero/palace-red-02.jpg",
      },
      {
        id: "songElegance",
        key: "songElegance",
        name: t("styles.songElegance.name"),
        description: t("styles.songElegance.description"),
        previewUrl: "/images/hanfu-hero/palace-red-03.jpg",
      },
      {
        id: "qinHanNoir",
        key: "qinHanNoir",
        name: t("styles.qinHanNoir.name"),
        description: t("styles.qinHanNoir.description"),
        previewUrl: "/images/hanfu-hero/palace-red-01.jpg",
      },
      {
        id: "bluePorcelain",
        key: "bluePorcelain",
        name: t("styles.bluePorcelain.name"),
        description: t("styles.bluePorcelain.description"),
        previewUrl: "/images/hanfu-hero/festival-lantern-01.jpg",
      },
      {
        id: "modernQipao",
        key: "modernQipao",
        name: t("styles.modernQipao.name"),
        description: t("styles.modernQipao.description"),
        previewUrl: "/images/hanfu-hero/spring-pink-01.jpg",
      },
      {
        id: "dunhuangMuse",
        key: "dunhuangMuse",
        name: t("styles.dunhuangMuse.name"),
        description: t("styles.dunhuangMuse.description"),
        previewUrl: "/images/hanfu-hero/jade-temple-01.jpg",
      },
    ],
    [t]
  );

  // Filter templates based on selected style
  const filteredTemplates = useMemo(() => {
    if (selectedStyle === "all") {
      return styleTemplates;
    }
    return styleTemplates.filter((template) => template.key === selectedStyle);
  }, [selectedStyle, styleTemplates]);

  // Menu items configuration
  const menuItems = useMemo(() => [
    {
      group: tStudio("sidebar.create"),
      items: [
        { id: "generatePortrait", label: tStudio("sidebar.generatePortrait"), active: true },
        { id: "styleTemplates", label: tStudio("sidebar.styleTemplates"), disabled: false },
        { id: "myGallery", label: tStudio("sidebar.myGallery"), disabled: true },
      ],
    },
    {
      group: tStudio("sidebar.hanfuStyles"),
      items: [
        { id: "tangGlamour", label: tStudio("sidebar.tangGlamour"), active: selectedStyle === "tangGlamour" },
        { id: "songElegance", label: tStudio("sidebar.songElegance"), active: selectedStyle === "songElegance" },
        { id: "qinHanNoir", label: tStudio("sidebar.qinHanNoir"), active: selectedStyle === "qinHanNoir" },
        { id: "bluePorcelain", label: tStudio("sidebar.bluePorcelain"), active: selectedStyle === "bluePorcelain" },
        { id: "modernQipao", label: tStudio("sidebar.modernQipao"), active: selectedStyle === "modernQipao" },
        { id: "dunhuangMuse", label: tStudio("sidebar.dunhuangMuse"), active: selectedStyle === "dunhuangMuse" },
      ],
    },
    {
      group: tStudio("sidebar.enhance"),
      items: [
        { id: "upscale", label: tStudio("sidebar.upscale"), disabled: true },
        { id: "regenerate", label: tStudio("sidebar.regenerate"), disabled: true },
        { id: "faceRestore", label: tStudio("sidebar.faceRestore"), disabled: true },
      ],
    },
    {
      group: tStudio("sidebar.account"),
      items: [
        { id: "credits", label: tStudio("sidebar.credits"), disabled: false },
        { id: "history", label: tStudio("sidebar.history"), disabled: true },
      ],
    },
  ], [tStudio, selectedStyle]);

  // Handle file upload
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setError(null);
    setResultUrls([]);
    setFile(nextFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  // Handle generation
  async function handleGenerate() {
    if (!file) {
      setError(t("errors.uploadRequired"));
      return;
    }
    setIsGenerating(true);
    setError(null);
    setResultUrls([]);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("template", selectedTemplate);
    formData.append("mode", "set");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("errors.generationFailed"));
      }
      if (!data.imageUrls || data.imageUrls.length === 0) {
        throw new Error(t("errors.noResult"));
      }
      setResultUrls(data.imageUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generationFailed"));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen w-[260px] z-40 flex flex-col border-r overflow-hidden"
        style={{
          background: "#241812",
          borderColor: "rgba(232, 194, 122, 0.12)",
        }}
      >
        {/* Brand Area */}
        <LocaleLink
          href="/"
          className="flex items-center gap-3 px-5 py-6 border-b cursor-pointer"
          style={{ borderColor: "rgba(232, 194, 122, 0.10)" }}
        >
          <img
            src="/brand/logo-mark.png"
            alt="Han Portrait Logo"
            className="h-9 w-9 object-contain"
          />
          {locale === "zh" ? (
            <span className="text-lg font-semibold tracking-[-0.01em]" style={{ color: "#E8C27A" }}>
              {tGeneral("brand.name")}
            </span>
          ) : (
            <div className="text-lg font-semibold tracking-[-0.01em]">
              <span className="text-[#FFF7EC]">{tGeneral("brand.first")}</span>
              <span className="text-[#E8C27A]"> {tGeneral("brand.second")}</span>
            </div>
          )}
        </LocaleLink>

        {/* Menu Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {menuItems.map((group) => (
            <div key={group.group} className="mb-6">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3 px-3"
                style={{ color: "rgba(255, 247, 236, 0.42)" }}
              >
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      // If it's a style item, filter templates
                      if (["tangGlamour", "songElegance", "qinHanNoir", "bluePorcelain", "modernQipao", "dunhuangMuse"].includes(item.id)) {
                        setSelectedStyle(item.id);
                      }
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center",
                      item.active
                        ? "text-[#E8C27A] border border-[rgba(232,194,122,0.28)]"
                        : item.disabled
                        ? "text-[rgba(255,247,236,0.28)] cursor-not-allowed"
                        : "text-[rgba(255,247,236,0.62)] hover:text-[#E8C27A] hover:bg-[rgba(232,194,122,0.05)]"
                    )}
                    style={{
                      background: item.active ? "rgba(200, 58, 50, 0.18)" : "transparent",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Right Main Workspace */}
      <main
        className="ml-[260px] flex-1 min-h-screen"
        style={{ background: "#1B120E" }}
      >
        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-8 py-6 border-b"
          style={{ borderColor: "rgba(232, 194, 122, 0.12)" }}
        >
          <div>
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: "#FFF7EC" }}
            >
              {tStudio("title")}
            </h1>
            <p
              className="text-sm"
              style={{ color: "rgba(255, 247, 236, 0.62)" }}
            >
              {tStudio("subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                color: "#FFF7EC",
                background: "rgba(255, 247, 236, 0.06)",
                border: "1px solid rgba(232, 194, 122, 0.26)",
              }}
            >
              {tStudio("credits")}
            </button>
            <LanguageSwitcher variant="navbarIcon" />
            <Link
              href={`/${locale}/login`}
              className="flex items-center justify-center transition-all duration-200"
              style={{
                height: "38px",
                padding: "0 18px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#FFF7EC",
                background: "rgba(255, 247, 236, 0.06)",
                border: "1px solid rgba(232, 194, 122, 0.26)",
              }}
            >
              {tStudio("login")}
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Top Section: Upload and Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Upload Card */}
            <div
              className="p-6 border"
              style={{
                background: "#2A1C15",
                borderColor: "rgba(232, 194, 122, 0.16)",
                borderRadius: "24px",
              }}
            >
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "#FFF7EC" }}
              >
                {t("uploadCard.title")}
              </h2>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div
                  className="min-h-[320px] flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 text-center transition-all"
                  style={{
                    borderColor: "rgba(232, 194, 122, 0.2)",
                    background: "rgba(27, 18, 14, 0.5)",
                  }}
                >
                  {previewUrl ? (
                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl">
                      <Image
                        src={previewUrl}
                        alt="Upload preview"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div>
                      <div
                        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(232, 194, 122, 0.1)" }}
                      >
                        <span className="text-2xl" style={{ color: "#E8C27A" }}>📸</span>
                      </div>
                      <p
                        className="text-lg font-medium mb-1"
                        style={{ color: "#FFF7EC" }}
                      >
                        {t("uploadCard.cta")}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "rgba(255, 247, 236, 0.62)" }}
                      >
                        {t("uploadCard.hint")}
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Preview Card */}
            <div
              className="p-6 border"
              style={{
                borderColor: "rgba(232, 194, 122, 0.16)",
                borderRadius: "24px",
                background: "#2A1C15",
              }}
            >
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "#FFF7EC" }}
              >
                {t("previewCard.title")}
              </h2>
              <div
                className="min-h-[320px] flex items-center justify-center rounded-3xl border-dashed border-2 border-border"
                style={{
                  background: "rgba(27, 18, 14, 0.5)",
                }}
              >
                {resultUrls.length > 0 ? (
                  <div className="w-full aspect-[3/4] overflow-hidden rounded-2xl relative">
                    <Image
                      src={resultUrls[0]}
                      alt="Generated portrait"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {/* Watermark */}
                    <div
                      className="absolute bottom-3 left-3 opacity-20"
                      style={{ width: "5%", minWidth: "20px" }}
                    >
                      <img
                        src="/brand/logo-mark.png"
                        alt="Han Portrait Watermark"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                ) : isGenerating ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <img
                        src="/brand/logo-mark.png"
                        alt="Han Portrait Logo"
                        className="h-16 w-16 object-contain drop-shadow-[0_0_12px_rgba(232,194,122,0.4)] animate-breathing"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[rgba(232,194,122,0.2)] to-[rgba(183,53,45,0.2)] blur-[3px]" />
                    </div>
                    <p
                      className="text-center text-sm"
                      style={{ color: "rgba(255, 247, 236, 0.62)" }}
                    >
                      {t("previewCard.loading")}
                    </p>
                  </div>
                ) : (
                  <p
                    className="text-center text-sm"
                    style={{ color: "rgba(255, 247, 236, 0.62)" }}
                  >
                    {t("previewCard.placeholder")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Style Templates */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-semibold"
                style={{ color: "#FFF7EC" }}
              >
                {t("styleTemplates.title")}
              </h2>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !file}
                className={cn(
                  "px-8 py-3 rounded-full text-base font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  isGenerating || !file ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                )}
                style={{
                  background: "#C83A32",
                  color: "#FFF7EC",
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating && file) {
                    e.currentTarget.style.background = "#D7463E";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGenerating && file) {
                    e.currentTarget.style.background = "#C83A32";
                  }
                }}
              >
                {isGenerating ? t("styleTemplates.generating") : t("styleTemplates.generateButton")}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    "group cursor-pointer overflow-hidden transition-all duration-300",
                    selectedTemplate === template.id
                      ? "ring-2 ring-[rgba(232,194,122,0.4)] ring-offset-2 ring-offset-[#1B120E]"
                      : "hover:ring-2 hover:ring-[rgba(232,194,122,0.2)]"
                  )}
                  style={{
                    background: "#2A1C15",
                    border: `1px solid ${selectedTemplate === template.id ? "rgba(232,194,122,0.35)" : "rgba(232,194,122,0.16)"}`,
                    borderRadius: "24px",
                  }}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={template.previewUrl}
                      alt={template.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(27,18,14,0.8)] via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3
                      className="text-lg font-semibold mb-1"
                      style={{ color: "#FFF7EC" }}
                    >
                      {template.name}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(255, 247, 236, 0.62)" }}
                    >
                      {template.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div
              className="mb-6 px-5 py-4 rounded-xl"
              style={{
                background: "rgba(200,58,50,0.1)",
                border: "1px solid rgba(200,58,50,0.25)",
                color: "#E8C27A",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}