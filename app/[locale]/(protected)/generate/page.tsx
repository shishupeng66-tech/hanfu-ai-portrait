"use client";

import Image from "next/image";
import { ChangeEvent, useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { LocaleLink } from "@/components/locale-link";
import { useSession } from "@/lib/auth-client";

type StyleTemplate = {
  id: string;
  key: string;
  name: string;
  description: string;
  previewUrl: string;
};

type SidebarCategory =
  | "my-gallery"
  | "popular"
  | "trending"
  | "new"
  | "curated"
  | "tang"
  | "song"
  | "yuan"
  | "ming"
  | "qing"
  | "republican"
  | "new-chinese";

const SIDEBAR_EXPANDED_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 82;

// Simple inline SVG icon component (no external deps needed)
function Icon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const icons: Record<string, React.ReactNode> = {
    // Works / gallery
    "image-grid": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    // Popular / fire
    "flame": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.2-.7-2-1.5-3-1.4-1.7-2-2.5-2-4 0-1.3.6-2.4 1.5-3-.5 1.5.5 3 2 4" />
        <path d="M12 22s6-3.5 6-9a6 6 0 0 0-12 0c0 5.5 6 9 6 9Z" />
      </svg>
    ),
    // Trending / up arrow
    "trending-up": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
    // New / sparkle
    "sparkles": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
      </svg>
    ),
    // Curated / crown
    "crown": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 19h20l-1.5-11L16 11l-4-7-4 7L3.5 8 2 19Z" />
      </svg>
    ),
    // Tang — 唐 style ornament
    "tang": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    // Song — elegant moon
    "song": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    ),
    // Yuan — bow / archer
    "yuan": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c-4 3-7 7-7 12a7 7 0 0 0 14 0c0-5-3-9-7-12Z" />
        <path d="M12 9v6" />
      </svg>
    ),
    // Ming — gate / palace
    "ming": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V10l7-5 7 5v11" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
    // Qing — dragon scale / coin
    "qing": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M9 10l6 4M15 10l-6 4" />
      </svg>
    ),
    // Republican — retro frame
    "republican": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <path d="M3 9h18M8 4v5M16 4v5" />
      </svg>
    ),
    // New Chinese — modern brush
    "new-chinese": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20c4 0 8-2 12-6s6-8 6-12" />
        <path d="M20 4l-4 4" />
        <path d="M16 8l2 2" />
      </svg>
    ),
    // Credits / coin
    "coins": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M14 14c3 1 6 0 6-3M10 10c2 1 4 0 4-2" />
        <path d="M8 18c-3 0-5-2-5-5" />
      </svg>
    ),
    // Collapse / chevron left
    "chevron-left": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ),
    // Expand / chevron right
    "chevron-right": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
  };

  return <div className={className} style={style}>{icons[name] ?? null}</div>;
}

export default function GeneratePage() {
  const locale = useLocale();
  const t = useTranslations("generate");
  const tStudio = useTranslations("studio");
  const tGeneral = useTranslations();

  // State management
  const [selectedCategory, setSelectedCategory] = useState<SidebarCategory>("popular");
  const [selectedStyle, _setSelectedStyle] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("tangGlamour");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [loadingCredits, setLoadingCredits] = useState(true);

  // Real auth session from better-auth
  const session = useSession();
  const isLoggedIn = !!session.data?.user;

  // Fetch user credits
  const fetchUserCredits = useCallback(async () => {
    if (!isLoggedIn) {
      setLoadingCredits(false);
      return;
    }
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.user?.credits || 0);
      }
    } catch (error) {
      console.error("Failed to fetch user credits:", error);
    } finally {
      setLoadingCredits(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchUserCredits();
  }, [fetchUserCredits]);

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
    const GENERATION_COST = 1; // Credits consumed per generation
    
    // Check if user has uploaded a file
    if (!file) {
      setError(t("errors.uploadRequired"));
      return;
    }
    
    // Check if user has enough credits
    if (userCredits < GENERATION_COST) {
      const message = t("errors.insufficientCredits", { defaultValue: "积分不足，请先购买积分" });
      const shouldNavigate = window.confirm(`${message}\n\n是否跳转到积分页面？`);
      if (shouldNavigate) {
        window.location.href = `/${locale}/credits`;
      }
      return;
    }
    
    // Confirm credit consumption
    const confirmMessage = t("confirmations.creditConsumption", { 
      defaultValue: `本次生成将消耗 ${GENERATION_COST} 积分，是否继续？` 
    });
    if (!window.confirm(confirmMessage)) {
      return; // User cancelled
    }
    
    // Proceed with generation
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
      
      // Success: update credits (optimistic update)
      setUserCredits(prev => prev - GENERATION_COST);
      setResultUrls(data.imageUrls);
      
      // Refresh credits from server to ensure consistency
      setTimeout(() => {
        fetchUserCredits();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generationFailed"));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main
      className="flex-1 min-h-screen"
      style={{
        background: "#1B120E",
      }}
    >

        {/* Top Bar */}
        <div
          className="px-8 py-6 border-b"
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
  );
}