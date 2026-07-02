"use client";

import Image from "next/image";
import { ChangeEvent, useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";

type StyleTemplate = {
  id: string;
  key: string;
  name: string;
  previewUrl: string;
};

export default function GeneratePage() {
  const locale = useLocale();
  const t = useTranslations("generate");
  const tStudio = useTranslations("studio");

  // State management
  const [selectedTemplate, setSelectedTemplate] = useState<string>("tangGlamour");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);

  // Real auth session from better-auth
  const session = useSession();
  const isLoggedIn = !!session.data?.user;

  // Fetch user credits
  const fetchUserCredits = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.user?.credits || 0);
      }
    } catch (error) {
      console.error("Failed to fetch user credits:", error);
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
        previewUrl: "/images/hanfu-hero/palace-red-02.jpg",
      },
      {
        id: "songElegance",
        key: "songElegance",
        name: t("styles.songElegance.name"),
        previewUrl: "/images/hanfu-hero/palace-red-03.jpg",
      },
      {
        id: "qinHanNoir",
        key: "qinHanNoir",
        name: t("styles.qinHanNoir.name"),
        previewUrl: "/images/hanfu-hero/palace-red-01.jpg",
      },
      {
        id: "bluePorcelain",
        key: "bluePorcelain",
        name: t("styles.bluePorcelain.name"),
        previewUrl: "/images/hanfu-hero/festival-lantern-01.jpg",
      },
      {
        id: "modernQipao",
        key: "modernQipao",
        name: t("styles.modernQipao.name"),
        previewUrl: "/images/hanfu-hero/spring-pink-01.jpg",
      },
      {
        id: "dunhuangMuse",
        key: "dunhuangMuse",
        name: t("styles.dunhuangMuse.name"),
        previewUrl: "/images/hanfu-hero/jade-temple-01.jpg",
      },
    ],
    [t]
  );

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
      
      // Success: update result and refresh credits
      setResultUrls(data.imageUrls);
      // Refresh credits from server to ensure consistency
      fetchUserCredits();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generationFailed"));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main
      className="flex flex-col h-screen overflow-hidden"
      style={{
        background: "#0B0B0D",
      }}
    >
      {/* Top Bar */}
      <div
        className="px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "rgba(255, 247, 236, 0.08)" }}
      >
        <div>
          <h1
            className="text-xl font-bold mb-0.5"
            style={{ color: "rgba(255, 247, 236, 0.92)" }}
          >
            {tStudio("title")}
          </h1>
          <p
            className="text-xs"
            style={{ color: "rgba(255, 247, 236, 0.72)" }}
          >
            {tStudio("subtitle")}
          </p>
        </div>
      </div>

      {/* Main Content - Flex grow to fill space */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 py-4">
        {/* Top Section: Upload and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
          {/* Upload Card */}
          <div
            className="p-4 border"
            style={{
              background: "#111114",
              borderColor: "rgba(255, 247, 236, 0.08)",
              borderRadius: "16px",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-base font-semibold"
                style={{ color: "rgba(255, 247, 236, 0.92)" }}
              >
                {t("uploadCard.title")}
              </h2>
            </div>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                className="aspect-[3/4] max-h-[280px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 text-center transition-all mx-auto"
                style={{
                  borderColor: "rgba(255, 247, 236, 0.08)",
                  background: "rgba(11, 11, 13, 0.5)",
                  maxWidth: "210px",
                }}
              >
                {previewUrl ? (
                  <div className="relative w-full h-full overflow-hidden rounded-xl">
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
                      className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(232, 194, 122, 0.10)" }}
                    >
                      <span className="text-xl" style={{ color: "#E8C27A" }}>📸</span>
                    </div>
                    <p
                      className="text-sm font-medium mb-0.5"
                      style={{ color: "rgba(255, 247, 236, 0.92)" }}
                    >
                      {t("uploadCard.cta")}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255, 247, 236, 0.72)" }}
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
            className="p-4 border"
            style={{
              borderColor: "rgba(255, 247, 236, 0.08)",
              borderRadius: "16px",
              background: "#111114",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-base font-semibold"
                style={{ color: "rgba(255, 247, 236, 0.92)" }}
              >
                {t("previewCard.title")}
              </h2>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !file}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  isGenerating || !file ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                )}
                style={{
                  background: "rgba(232, 194, 122, 0.10)",
                  color: "#E8C27A",
                  border: "1px solid rgba(232, 194, 122, 0.16)",
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating && file) {
                    e.currentTarget.style.background = "rgba(232, 194, 122, 0.16)";
                    e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.25)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGenerating && file) {
                    e.currentTarget.style.background = "rgba(232, 194, 122, 0.10)";
                    e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.16)";
                  }
                }}
              >
                {isGenerating ? t("styleTemplates.generating") : t("styleTemplates.generateButton")}
              </button>
            </div>
            <div
              className="aspect-[3/4] max-h-[280px] flex items-center justify-center rounded-2xl border-dashed border-2 border-border mx-auto"
              style={{
                background: "rgba(11, 11, 13, 0.5)",
                maxWidth: "210px",
              }}
            >
              {resultUrls.length > 0 ? (
                <div className="w-full h-full overflow-hidden rounded-xl relative">
                  <Image
                    src={resultUrls[0]}
                    alt="Generated portrait"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {/* Watermark */}
                  <div
                    className="absolute bottom-2 left-2 opacity-20"
                    style={{ width: "5%", minWidth: "16px" }}
                  >
                    <img
                      src="/brand/logo-mark.png"
                      alt="Han Portrait Watermark"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <img
                      src="/brand/logo-mark.png"
                      alt="Han Portrait Logo"
                      className="h-12 w-12 object-contain drop-shadow-[0_0_12px_rgba(232,194,122,0.4)] animate-breathing"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[rgba(232,194,122,0.2)] to-[rgba(232,194,122,0.05)] blur-[3px]" />
                  </div>
                  <p
                    className="text-center text-xs"
                    style={{ color: "rgba(255, 247, 236, 0.72)" }}
                  >
                    {t("previewCard.loading")}
                  </p>
                </div>
              ) : (
                <p
                  className="text-center text-xs px-4"
                  style={{ color: "rgba(255, 247, 236, 0.72)" }}
                >
                  {t("previewCard.placeholder")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mt-3 px-4 py-2.5 rounded-xl flex-shrink-0"
            style={{
              background: "rgba(200,58,50,0.10)",
              border: "1px solid rgba(200,58,50,0.25)",
              color: "#E8C27A",
            }}
          >
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Recommended Style Templates - Horizontal Scroll Bar */}
        <div className="mt-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-2 flex-shrink-0">
            <span
              className="text-sm font-medium"
              style={{ color: "rgba(255, 247, 236, 0.92)" }}
            >
              推荐风格
            </span>
            <span
              className="text-xs"
              style={{ color: "rgba(255, 247, 236, 0.5)" }}
            >
              · 点击选择
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 flex-shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {styleTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "group cursor-pointer overflow-hidden transition-all duration-200 flex-shrink-0",
                  selectedTemplate === template.id
                    ? "ring-1.5 ring-[rgba(232,194,122,0.4)]"
                    : "hover:ring-1 hover:ring-[rgba(232,194,122,0.2)]"
                )}
                style={{
                  background: "#111114",
                  border: `1px solid ${selectedTemplate === template.id ? "rgba(232,194,122,0.35)" : "rgba(255,247,236,0.08)"}`,
                  borderRadius: "12px",
                  width: "100px",
                }}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[11px]">
                  <Image
                    src={template.previewUrl}
                    alt={template.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  {/* Selected indicator */}
                  {selectedTemplate === template.id && (
                    <div
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "#E8C27A" }}
                    >
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" style={{ fill: "#0B0B0D" }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="px-2 py-1.5 text-center">
                  <h3
                    className="text-xs font-medium truncate"
                    style={{ color: "rgba(255, 247, 236, 0.92)" }}
                  >
                    {template.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
