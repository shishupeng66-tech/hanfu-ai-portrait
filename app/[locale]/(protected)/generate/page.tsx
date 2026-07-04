"use client";

import Image from "next/image";
import { ChangeEvent, useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useSession } from "@/lib/auth-client";
import {
  dynastyTabs,
  featuredTemplateIds,
  hanfuTemplates,
  type HanfuTemplate,
} from "@/features/templates/template-data";

const GENERATION_COST = 10;

function UploadIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8 12 3 7 8" />
      <path d="M12 3v12" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
      <path d="M19 15l.8 2.7 2.7.8-2.7.8L19 23l-.8-2.7-2.7-.8 2.7-.8L19 15Z" />
      <path d="M5 14l.7 2.3L8 17l-2.3.7L5 20l-.7-2.3L2 17l2.3-.7L5 14Z" />
    </svg>
  );
}

export default function GeneratePage() {
  const locale = useLocale();

  const [viewMode, setViewMode] = useState<"create" | "preview">("create");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("tangGlamour");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const session = useSession();
  const isLoggedIn = !!session.data?.user;

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

  const styleTemplates: HanfuTemplate[] = useMemo(() => hanfuTemplates, []);
  const activeTemplate = styleTemplates.find((template) => template.id === selectedTemplate) ?? null;
  const selectedTemplateName = activeTemplate?.name || "盛唐金影";
  const selectedDynasty = activeTemplate?.dynasty || "唐";
  const activeDynastyTemplates = styleTemplates.filter((template) => template.dynasty === selectedDynasty);
  const featuredTemplates = featuredTemplateIds
    .map((templateId) => styleTemplates.find((template) => template.id === templateId))
    .filter((template): template is HanfuTemplate => Boolean(template));

  useEffect(() => {
    const templateParam = new URLSearchParams(window.location.search).get("template");
    if (!templateParam) return;
    const matchedTemplate = styleTemplates.find((template) => template.id === templateParam);
    if (matchedTemplate) {
      setSelectedTemplate(matchedTemplate.id);
      setGenerationError(null);
    }
  }, [styleTemplates]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setGenerationError(null);
    setResultUrls([]);
    setCurrentPreviewIndex(0);
    setFile(nextFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  function getApiTemplateKey(selectedTemplateId: string) {
    return styleTemplates.find((template) => template.id === selectedTemplateId)?.apiTemplateKey ?? null;
  }

  async function handleGenerate() {
    const apiTemplateKey = getApiTemplateKey(selectedTemplate);

    if (!file) {
      setGenerationError("请先上传一张面部照片。");
      return;
    }

    if (!apiTemplateKey) {
      setGenerationError("当前模板暂不可用，请重新选择一个模板。");
      return;
    }

    if (userCredits < GENERATION_COST) {
      setGenerationError("积分不足，无法开始生成。");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    if (viewMode === "create") {
      setResultUrls([]);
      setCurrentPreviewIndex(0);
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("template", apiTemplateKey);
    formData.append("mode", "set");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }
      if (!data.imageUrls || data.imageUrls.length === 0) {
        throw new Error("No result");
      }
      setResultUrls(data.imageUrls);
      setCurrentPreviewIndex(0);
      setViewMode("preview");
      fetchUserCredits();
    } catch (err) {
      console.error(err);
      setGenerationError("生成失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  }

  const handlePrevImage = () => {
    if (resultUrls.length > 0) {
      setCurrentPreviewIndex((prev) => (prev > 0 ? prev - 1 : resultUrls.length - 1));
    }
  };

  const handleNextImage = () => {
    if (resultUrls.length > 0) {
      setCurrentPreviewIndex((prev) => (prev < resultUrls.length - 1 ? prev + 1 : 0));
    }
  };

  const handleDownloadImage = () => {
    const currentUrl = resultUrls[currentPreviewIndex];
    if (!currentUrl) return;
    window.open(currentUrl, "_blank", "noopener,noreferrer");
  };

  const LoadingSpinner = () => (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0B0B0D]/30 border-t-[#0B0B0D]" aria-hidden="true" />
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B0B0D] text-[rgba(255,247,236,0.92)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(232,194,122,0.08) 1px, transparent 1px), radial-gradient(circle at 50% 0%, rgba(232,194,122,0.08), transparent 34%)",
          backgroundPosition: "0 0, center top",
          backgroundSize: "26px 26px, 100% 520px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-[rgba(232,194,122,0.08)] via-[rgba(232,194,122,0.025)] to-transparent" />

      <main className="relative mx-auto max-w-[1240px] px-6 py-9 lg:py-10">
        {viewMode === "preview" && resultUrls.length > 0 ? (
          <section className="mx-auto w-full max-w-[1180px]">
            <button
              type="button"
              onClick={() => setViewMode("create")}
              className="mb-6 inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(232,194,122,0.18)] bg-[rgba(17,17,20,0.76)] px-4 text-sm text-[#E8C27A] transition hover:border-[rgba(232,194,122,0.38)] hover:bg-[rgba(232,194,122,0.06)]"
            >
              <ChevronIcon direction="left" />
              返回创作
            </button>

            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(232,194,122,0.16)] bg-[rgba(20,20,24,0.72)] px-4 py-1.5 text-xs text-[#E8C27A] shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur">
                <SparkIcon className="h-3.5 w-3.5" />
                汉韵写真 · 作品预览
              </div>
              <h1 className="text-4xl font-semibold tracking-normal text-[rgba(255,247,236,0.94)] md:text-5xl">生成结果</h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[rgba(255,247,236,0.52)] md:text-base">你的 AI 汉服写真已生成完成</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[24px] border border-[rgba(232,194,122,0.16)] bg-[rgba(17,17,20,0.92)] p-4 shadow-[0_28px_110px_rgba(0,0,0,0.36)] md:p-6">
                <div className="flex items-center justify-center gap-4">
                  <button type="button" onClick={handlePrevImage} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(232,194,122,0.22)] bg-[rgba(232,194,122,0.07)] text-[#E8C27A] transition hover:bg-[rgba(232,194,122,0.13)]" aria-label="上一张">
                    <ChevronIcon direction="left" />
                  </button>

                  <div className="relative aspect-[3/4] h-[min(680px,72vh)] max-h-[680px] min-h-[520px] overflow-hidden rounded-[24px] border border-[rgba(232,194,122,0.16)] bg-[#111114] shadow-[0_28px_100px_rgba(0,0,0,0.48)]">
                    <Image src={resultUrls[currentPreviewIndex]} alt="生成的汉服写真" fill className="object-contain" unoptimized />
                  </div>

                  <button type="button" onClick={handleNextImage} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(232,194,122,0.22)] bg-[rgba(232,194,122,0.07)] text-[#E8C27A] transition hover:bg-[rgba(232,194,122,0.13)]" aria-label="下一张">
                    <ChevronIcon direction="right" />
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-center gap-3">
                  {resultUrls.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentPreviewIndex(idx)}
                      className="h-2.5 w-2.5 rounded-full transition"
                      style={{ background: idx === currentPreviewIndex ? "#E8C27A" : "rgba(255,247,236,0.25)" }}
                      aria-label={`查看第 ${idx + 1} 张`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-center text-sm text-[rgba(255,247,236,0.45)]">
                  {currentPreviewIndex + 1} / {resultUrls.length}
                </p>
              </div>

              <aside className="flex flex-col gap-4">
                <div className="rounded-[24px] border border-[rgba(255,247,236,0.08)] bg-[rgba(17,17,20,0.90)] p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[rgba(255,247,236,0.92)]">
                    <SparkIcon className="h-4 w-4 text-[#E8C27A]" />
                    作品信息
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[rgba(255,247,236,0.45)]">当前模板</span>
                      <span className="text-right font-medium text-[#E8C27A]">{selectedDynasty} · {selectedTemplateName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[rgba(255,247,236,0.45)]">消耗积分</span>
                      <span className="font-medium text-[#E8C27A]">{GENERATION_COST} 积分</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[rgba(255,247,236,0.45)]">生成数量</span>
                      <span className="text-[rgba(255,247,236,0.72)]">{resultUrls.length} 张</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[rgba(255,247,236,0.45)]">状态</span>
                      <span className="text-[rgba(255,247,236,0.72)]">生成完成</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-[rgba(255,247,236,0.08)] bg-[rgba(17,17,20,0.90)] p-5">
                  <div className="grid gap-3">
                    <button type="button" onClick={handleDownloadImage} className="h-11 rounded-xl border border-[rgba(232,194,122,0.22)] bg-[rgba(232,194,122,0.08)] px-4 text-sm font-medium text-[#E8C27A] transition hover:border-[rgba(232,194,122,0.42)] hover:bg-[rgba(232,194,122,0.13)]">
                      下载图片
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E8C27A] px-4 text-sm font-semibold text-[#0B0B0D] transition hover:bg-[#F2D38A] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isGenerating && <LoadingSpinner />}
                      {isGenerating ? "生成中..." : "重新生成"}
                    </button>
                    <button type="button" onClick={() => setViewMode("create")} className="h-11 rounded-xl border border-[rgba(255,247,236,0.08)] bg-[rgba(255,247,236,0.04)] px-4 text-sm text-[rgba(255,247,236,0.72)] transition hover:bg-[rgba(255,247,236,0.07)]">
                      返回创作
                    </button>
                    <a href={`/${locale}/works`} className="flex h-11 items-center justify-center rounded-xl border border-[rgba(255,247,236,0.08)] bg-[rgba(255,247,236,0.04)] px-4 text-sm text-[rgba(255,247,236,0.72)] transition hover:bg-[rgba(255,247,236,0.07)]">
                      查看我的作品
                    </a>
                  </div>
                  {isGenerating && <p className="mt-3 text-center text-xs text-[rgba(255,247,236,0.45)]">AI 正在为你生成汉服写真，请稍候</p>}
                  {generationError && <p className="mt-3 text-center text-xs text-[#E8C27A]">{generationError}</p>}
                </div>
              </aside>
            </div>
          </section>
        ) : (
          <>
            <section className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(232,194,122,0.16)] bg-[rgba(20,20,24,0.72)] px-4 py-1.5 text-xs text-[#E8C27A] shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur">
                <SparkIcon className="h-3.5 w-3.5" />
                汉韵写真 · 开始创作
              </div>
              <h1 className="text-4xl font-semibold tracking-normal text-[rgba(255,247,236,0.94)] md:text-5xl">创作您的汉服写真</h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[rgba(255,247,236,0.52)] md:text-base">
                上传一张清晰正脸照，选择模板，生成专属于你的 AI 汉服写真。
              </p>
            </section>

            <section className="mx-auto mt-8 w-full max-w-[1040px] rounded-[24px] border border-[rgba(255,247,236,0.08)] bg-[rgba(17,17,20,0.88)] p-5 shadow-[0_28px_110px_rgba(0,0,0,0.36)] backdrop-blur md:p-7">
              <div className="grid gap-6 lg:grid-cols-[0.48fr_0.52fr]">
                <div className="min-w-0">
                  <h2 className="mb-3 text-base font-semibold text-[rgba(255,247,236,0.92)]">上传面部照片</h2>
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <div className="relative flex h-[268px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[rgba(232,194,122,0.30)] bg-[#0B0B0D] text-center transition hover:border-[rgba(232,194,122,0.55)] hover:bg-[rgba(232,194,122,0.035)] md:h-[292px]">
                      {previewUrl ? (
                        <Image src={previewUrl} alt="上传预览" fill className="object-contain p-4" unoptimized />
                      ) : (
                        <div className="flex flex-col items-center px-6">
                          <div className="mb-4 flex h-[68px] w-[68px] items-center justify-center rounded-full border border-[rgba(232,194,122,0.24)] bg-[rgba(232,194,122,0.08)] text-[#E8C27A] shadow-[0_0_34px_rgba(232,194,122,0.10)]">
                            <UploadIcon />
                          </div>
                          <p className="text-lg font-semibold text-[rgba(255,247,236,0.94)]">点击上传面部照片</p>
                          <p className="mt-2 max-w-[280px] text-sm leading-5 text-[rgba(255,247,236,0.48)]">
                            支持 JPG、PNG、WebP，建议使用清晰正脸照
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div className="min-w-0 rounded-2xl border border-[rgba(255,247,236,0.08)] bg-[#141418] p-4">
                  <h2 className="mb-3 text-base font-semibold text-[rgba(255,247,236,0.92)]">选择写真风格</h2>
                  <div className="flex flex-wrap gap-2">
                    {dynastyTabs.map((dynasty) => {
                      const isSelected = selectedDynasty === dynasty;

                      return (
                        <button
                          key={dynasty}
                          type="button"
                          onClick={() => {
                            const nextTemplate = styleTemplates.find((template) => template.dynasty === dynasty);
                            if (nextTemplate) {
                              setSelectedTemplate(nextTemplate.id);
                              setGenerationError(null);
                            }
                          }}
                          className="rounded-full border px-4 py-2 text-sm transition"
                          style={{
                            background: isSelected ? "rgba(232,194,122,0.16)" : "rgba(255,247,236,0.04)",
                            borderColor: isSelected ? "rgba(232,194,122,0.58)" : "rgba(255,247,236,0.08)",
                            color: isSelected ? "#E8C27A" : "rgba(255,247,236,0.62)",
                          }}
                        >
                          {dynasty}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                    {activeDynastyTemplates.map((template) => {
                      const isSelected = selectedTemplate === template.id;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => {
                            setSelectedTemplate(template.id);
                            setGenerationError(null);
                          }}
                          className="rounded-full border px-3 py-2 text-sm transition hover:border-[rgba(232,194,122,0.34)]"
                          style={{
                            background: isSelected ? "rgba(232,194,122,0.10)" : "rgba(255,247,236,0.04)",
                            borderColor: isSelected ? "rgba(232,194,122,0.68)" : "rgba(255,247,236,0.08)",
                            color: isSelected ? "#E8C27A" : "rgba(255,247,236,0.62)",
                          }}
                        >
                          {template.name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-xl border border-[rgba(232,194,122,0.12)] bg-[rgba(232,194,122,0.045)] px-4 py-3 text-sm text-[rgba(255,247,236,0.56)]">
                    当前选择：<span className="font-medium text-[#E8C27A]">{selectedDynasty}</span>
                    <span className="px-1 text-[rgba(255,247,236,0.28)]">·</span>
                    <span className="font-medium text-[#E8C27A]">{selectedTemplateName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                {["正脸清晰", "光线充足", "面部无遮挡", "背景简洁"].map((tip) => (
                  <span key={tip} className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,247,236,0.08)] bg-[rgba(255,247,236,0.04)] px-3 py-1.5 text-xs text-[rgba(255,247,236,0.55)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E8C27A]" />
                    {tip}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={cn(
                    "flex h-[58px] w-[280px] items-center justify-center gap-2 rounded-xl px-8 text-base font-semibold text-[#0B0B0D] transition disabled:cursor-not-allowed disabled:opacity-70 md:w-[332px]",
                    !isGenerating && file ? "hover:brightness-110" : "opacity-60"
                  )}
                  style={{
                    background: "linear-gradient(180deg, #F4D18B 0%, #E8C27A 48%, #C99A43 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.34), 0 16px 42px rgba(232,194,122,0.15)",
                  }}
                >
                  {isGenerating ? <LoadingSpinner /> : <SparkIcon className="h-5 w-5" />}
                  {isGenerating ? "生成中..." : "生成写真"}
                </button>
                <p className={cn("mt-3 min-h-5 text-sm", generationError ? "text-[#E8C27A]" : "text-[rgba(255,247,236,0.45)]")}>
                  {generationError || (
                    <>
                      当前模板：<span className="font-medium text-[#E8C27A]">{selectedDynasty} · {selectedTemplateName}</span> · 消耗{" "}
                      <span className="font-semibold text-[#E8C27A]">{GENERATION_COST} 积分</span>
                    </>
                  )}
                </p>
                {isGenerating && <p className="mt-1 text-xs text-[rgba(255,247,236,0.45)]">AI 正在为你生成汉服写真，请稍候</p>}
              </div>
            </section>

            <section className="mt-9 pb-12">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-[rgba(255,247,236,0.92)]">热门汉服写真模板</h2>
                  <p className="mt-2 text-sm text-[rgba(255,247,236,0.48)]">随机推荐 10 套风格，浏览更多灵感。</p>
                </div>
                <span className="text-sm text-[rgba(255,247,236,0.45)]">
                  当前 <span className="font-medium text-[#E8C27A]">{selectedDynasty} · {selectedTemplateName}</span>
                </span>
              </div>

              <div className="flex gap-5 overflow-x-auto overflow-y-hidden pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {featuredTemplates.map((template) => {
                  const isSelected = selectedTemplate === template.id;

                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setGenerationError(null);
                      }}
                      className="group relative w-[180px] shrink-0 overflow-hidden rounded-2xl border bg-[#111114] text-left shadow-[0_16px_50px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-[rgba(232,194,122,0.32)]"
                      style={{
                        borderColor: isSelected ? "rgba(232,194,122,0.92)" : "rgba(255,247,236,0.08)",
                        boxShadow: isSelected ? "0 0 0 1px rgba(232,194,122,0.28), 0 18px 52px rgba(0,0,0,0.28)" : undefined,
                      }}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <Image src={template.previewUrl} alt={template.name} fill className="object-cover transition duration-500 group-hover:scale-[1.035] group-hover:brightness-110" sizes="180px" />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#111114] to-transparent" />
                      </div>
                      <div className="px-4 pb-4 pt-3">
                        <div className="mb-2 inline-flex rounded-full border border-[rgba(232,194,122,0.16)] px-2 py-0.5 text-[11px] text-[#E8C27A]">{template.label}</div>
                        <p className="truncate text-base font-semibold text-[rgba(255,247,236,0.92)]">{template.name}</p>
                      </div>
                      {isSelected && (
                        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#E8C27A] text-[#0B0B0D] shadow-[0_8px_24px_rgba(0,0,0,0.24)]">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="m20 6-11 11-5-5" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
