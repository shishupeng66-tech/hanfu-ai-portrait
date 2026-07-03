"use client";

import Image from "next/image";
import { ChangeEvent, useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useSession } from "@/lib/auth-client";

type StyleTemplate = {
  id: string;
  apiTemplateKey: "nightLanternRedBlackHanfu";
  name: string;
  previewUrl: string;
};

const GENERATION_COST = 10;

const templateData: StyleTemplate[] = [
  {
    id: "tangGlamour",
    apiTemplateKey: "nightLanternRedBlackHanfu",
    name: "盛唐金影",
    previewUrl: "/images/hanfu-hero/palace-red-02.jpg",
  },
  {
    id: "songElegance",
    apiTemplateKey: "nightLanternRedBlackHanfu",
    name: "宋韵清婉",
    previewUrl: "/images/hanfu-hero/palace-red-03.jpg",
  },
  {
    id: "qinHanNoir",
    apiTemplateKey: "nightLanternRedBlackHanfu",
    name: "秦汉玄色",
    previewUrl: "/images/hanfu-hero/palace-red-01.jpg",
  },
  {
    id: "drunkenFlower",
    apiTemplateKey: "nightLanternRedBlackHanfu",
    name: "醉花影",
    previewUrl: "/images/hanfu-hero/festival-lantern-01.jpg",
  },
  {
    id: "pearBlossom",
    apiTemplateKey: "nightLanternRedBlackHanfu",
    name: "梨花幽韵",
    previewUrl: "/images/hanfu-hero/spring-pink-01.jpg",
  },
  {
    id: "dunhuangMuse",
    apiTemplateKey: "nightLanternRedBlackHanfu",
    name: "敦煌飞天",
    previewUrl: "/images/hanfu-hero/jade-temple-01.jpg",
  },
];

const photoTips = [
  "正脸清晰，面部无遮挡",
  "光线充足，五官清晰可见",
  "表情自然，避免夸张表情",
  "背景简洁，避免杂乱干扰",
];

function UploadIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8 12 3 7 8" />
      <path d="M12 3v12" />
    </svg>
  );
}

function LotusEmblem() {
  return (
    <svg width="96" height="96" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="45" stroke="rgba(232,194,122,0.22)" />
      <circle cx="60" cy="60" r="36" stroke="rgba(232,194,122,0.15)" strokeDasharray="3 5" />
      <path d="M60 28C69 42 70 55 60 75C50 55 51 42 60 28Z" fill="rgba(232,194,122,0.56)" />
      <path d="M38 43C53 49 61 60 60 80C43 71 35 58 38 43Z" fill="rgba(232,194,122,0.42)" />
      <path d="M82 43C67 49 59 60 60 80C77 71 85 58 82 43Z" fill="rgba(232,194,122,0.42)" />
      <path d="M25 61C43 60 56 68 63 87C44 86 30 77 25 61Z" fill="rgba(232,194,122,0.32)" />
      <path d="M95 61C77 60 64 68 57 87C76 86 90 77 95 61Z" fill="rgba(232,194,122,0.32)" />
      <path d="M42 88h36" stroke="rgba(232,194,122,0.36)" strokeLinecap="round" />
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
  useLocale();

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

  const styleTemplates: StyleTemplate[] = useMemo(() => templateData, []);
  const activeTemplate = styleTemplates.find((template) => template.id === selectedTemplate) ?? null;
  const selectedTemplateName = activeTemplate?.name || "盛唐金影";

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
    setResultUrls([]);
    setCurrentPreviewIndex(0);

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
      fetchUserCredits();
    } catch (err) {
      console.error(err);
      setGenerationError("生成失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleClearPreview = () => {
    setResultUrls([]);
    setCurrentPreviewIndex(0);
  };

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

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col overflow-hidden bg-[#0B0B0D]">
      <div className="shrink-0 px-6 pb-3 pt-3">
        <div className="mb-1 flex items-center gap-2 text-xs text-[rgba(255,247,236,0.72)]">
          <span className="text-[rgba(255,247,236,0.92)]">汉韵写真</span>
          <span className="text-[rgba(255,247,236,0.45)]">/</span>
          <span>开始创作</span>
        </div>
        <h1 className="text-base font-semibold text-[rgba(255,247,236,0.92)]">创作您的汉服写真</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 pb-4">
        <div className="grid h-full min-h-0 gap-4 overflow-hidden" style={{ gridTemplateColumns: "minmax(0,0.47fr) minmax(0,0.53fr)" }}>
          <section className="grid min-h-0 grid-rows-[minmax(0,0.58fr)_112px_minmax(0,0.42fr)] gap-3 overflow-hidden">
            <div className="min-h-0 overflow-hidden rounded-xl border border-[rgba(255,247,236,0.08)] bg-[#111114] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.24)]">
              <div className="mb-4 flex items-center gap-2">
                <SparkIcon className="h-4 w-4 text-[#E8C27A]" />
                <h2 className="text-lg font-semibold leading-none text-[rgba(255,247,236,0.92)]">上传面部照片</h2>
              </div>

              <div className="grid h-[calc(100%-34px)] min-h-0 gap-4" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(220px,238px)" }}>
                <label className="block min-h-0 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <div className="flex h-full min-h-[210px] items-center justify-center rounded-xl border border-dashed border-[rgba(232,194,122,0.42)] bg-[rgba(11,11,13,0.72)] p-4 text-center transition hover:border-[rgba(232,194,122,0.72)] hover:bg-[rgba(232,194,122,0.04)]">
                    {previewUrl ? (
                      <div className="relative h-full w-full overflow-hidden rounded-lg">
                        <Image src={previewUrl} alt="上传预览" fill className="object-contain" unoptimized />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full border border-[rgba(232,194,122,0.28)] bg-[rgba(232,194,122,0.08)] text-[#E8C27A]">
                          <UploadIcon />
                        </div>
                        <p className="mb-2 text-base font-semibold text-[rgba(255,247,236,0.92)]">点击上传照片</p>
                        <p className="text-sm text-[rgba(255,247,236,0.45)]">支持 JPG、PNG、WebP 格式</p>
                      </div>
                    )}
                  </div>
                </label>

                <aside className="min-h-0 min-w-0 overflow-hidden">
                  <p className="mb-3 text-sm font-medium text-[rgba(255,247,236,0.72)]">照片示例</p>
                  <div className="relative mb-4 h-[40%] min-h-[118px] max-h-[156px] overflow-hidden rounded-lg border border-[rgba(255,247,236,0.08)] bg-[#141418]">
                    <Image src="/images/hanfu-hero/spring-pink-01.jpg" alt="照片示例" fill className="object-cover" sizes="228px" />
                  </div>
                  <p className="mb-2 text-sm font-medium text-[rgba(255,247,236,0.72)]">拍摄建议</p>
                  <ul className="space-y-2">
                    {photoTips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-[12px] leading-[18px] text-[rgba(255,247,236,0.66)]">
                        <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full border border-[#E8C27A]" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </div>

            <div className="min-h-0 overflow-hidden rounded-xl border border-[rgba(255,247,236,0.08)] bg-[#111114] p-3">
              <div className="grid h-[64px] gap-3" style={{ gridTemplateColumns: "42fr 58fr" }}>
                <button type="button" className="flex min-w-0 items-center justify-between rounded-lg border border-[rgba(255,247,236,0.08)] bg-[#141418] px-4 text-left transition hover:border-[rgba(232,194,122,0.24)]">
                  <span className="min-w-0">
                    <span className="block text-xs text-[#E8C27A]">当前模板</span>
                    <span className="mt-1 block truncate text-lg font-semibold text-[rgba(255,247,236,0.92)]">{selectedTemplateName}</span>
                  </span>
                  <ChevronIcon direction="right" />
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !file}
                  className={cn(
                    "flex min-w-0 items-center justify-center gap-3 rounded-lg px-6 text-lg font-semibold text-[#0B0B0D] transition disabled:cursor-not-allowed disabled:opacity-55",
                    !isGenerating && file && "hover:brightness-110"
                  )}
                  style={{
                    background: "linear-gradient(180deg, #F4D18B 0%, #E8C27A 46%, #C99A43 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 14px 36px rgba(232,194,122,0.16)",
                  }}
                >
                  <SparkIcon className="h-5 w-5" />
                  {isGenerating ? "生成中..." : "生成写真"}
                </button>
              </div>
              <p className="pt-1.5 text-center text-xs leading-4 text-[rgba(255,247,236,0.45)]">
                {generationError ? generationError : "已选择模板后即可开始生成（消耗 "}
                {!generationError && <span className="font-semibold text-[#E8C27A]">10 积分</span>}
                {!generationError && "）"}
              </p>
            </div>

            <div className="min-h-0 overflow-hidden rounded-xl border border-[rgba(255,247,236,0.08)] bg-[#111114] p-3">
              <div className="mb-2 flex h-6 shrink-0 items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparkIcon className="h-4 w-4 text-[#E8C27A]" />
                  <h3 className="text-lg font-semibold leading-none text-[rgba(255,247,236,0.92)]">推荐模板</h3>
                </div>
                <button type="button" className="flex items-center gap-1 text-sm text-[#E8C27A]">
                  查看全部
                  <ChevronIcon direction="right" />
                </button>
              </div>

              <div className="flex h-[134px] gap-3 overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {styleTemplates.map((template) => {
                  const isSelected = selectedTemplate === template.id;

                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setGenerationError(null);
                      }}
                      className="group relative h-[130px] w-[92px] shrink-0 overflow-hidden rounded-lg border bg-[#141418] text-left transition"
                      style={{
                        borderColor: isSelected ? "rgba(232,194,122,0.95)" : "rgba(255,247,236,0.08)",
                        boxShadow: isSelected ? "0 0 0 1px rgba(232,194,122,0.38)" : "none",
                      }}
                    >
                      <div className="relative h-[96px] w-full overflow-hidden">
                        <Image src={template.previewUrl} alt={template.name} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="92px" />
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#141418] to-transparent" />
                      </div>
                      <div className="px-2 py-2">
                        <p className="truncate text-xs font-medium text-[rgba(255,247,236,0.92)]">{template.name}</p>
                      </div>
                      {isSelected && (
                        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#E8C27A] text-[#0B0B0D] shadow-lg">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="m20 6-11 11-5-5" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[rgba(255,247,236,0.08)] bg-[#111114] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <div className="flex items-center gap-2">
                <SparkIcon className="h-4 w-4 text-[#E8C27A]" />
                <h2 className="text-lg font-semibold leading-none text-[rgba(255,247,236,0.92)]">作品预览</h2>
              </div>
              <button type="button" onClick={handleClearPreview} className="flex h-9 items-center gap-2 rounded-lg bg-[rgba(255,247,236,0.05)] px-3 text-sm text-[rgba(255,247,236,0.72)] transition hover:bg-[rgba(255,247,236,0.08)]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                清空预览
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
              <div className="flex h-full w-full items-center justify-center gap-6">
                <button type="button" onClick={handlePrevImage} disabled={resultUrls.length === 0} className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(232,194,122,0.24)] bg-[rgba(232,194,122,0.08)] text-[#E8C27A] transition hover:bg-[rgba(232,194,122,0.14)] disabled:opacity-45" aria-label="上一张">
                  <ChevronIcon direction="left" />
                </button>

                <div className="relative aspect-[3/4] h-auto max-h-full min-w-[400px] max-w-[560px] overflow-hidden rounded-xl border border-[rgba(232,194,122,0.26)] bg-[#0B0B0D] shadow-[0_32px_90px_rgba(0,0,0,0.45)]" style={{ width: "64%" }}>
                  {resultUrls.length > 0 ? (
                    <Image src={resultUrls[currentPreviewIndex]} alt="生成的汉服写真" fill className="object-cover" unoptimized />
                  ) : (
                    <div
                      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-8 text-center"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 40%, rgba(232,194,122,0.10), transparent 26%), linear-gradient(180deg, rgba(232,194,122,0.06), rgba(11,11,13,0.98) 50%, rgba(11,11,13,1))",
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-[0.18]"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 20% 18%, rgba(232,194,122,0.8) 0 1px, transparent 1.5px), radial-gradient(circle at 76% 12%, rgba(232,194,122,0.5) 0 1px, transparent 1.5px), repeating-linear-gradient(135deg, rgba(232,194,122,0.10) 0 1px, transparent 1px 18px)",
                        }}
                      />
                      <div
                        className="absolute inset-0 opacity-[0.16]"
                        style={{
                          background:
                            "radial-gradient(ellipse at 80% 92%, transparent 0 34%, rgba(232,194,122,0.42) 35%, transparent 36%), radial-gradient(ellipse at 24% 96%, transparent 0 30%, rgba(232,194,122,0.35) 31%, transparent 32%)",
                        }}
                      />
                      <div className="absolute right-10 top-10 text-5xl font-thin text-[rgba(232,194,122,0.12)]">＋</div>
                      <div className="relative mb-7 flex h-28 w-28 items-center justify-center rounded-full border border-[rgba(232,194,122,0.20)] bg-[rgba(232,194,122,0.05)]">
                        <LotusEmblem />
                      </div>
                      <p className="relative mb-3 text-xl font-semibold text-[rgba(255,247,236,0.92)]">生成的汉服写真将在这里展示</p>
                      <p className="relative text-sm text-[rgba(255,247,236,0.62)]">选择模板并点击「生成写真」开始创作</p>
                    </div>
                  )}
                </div>

                <button type="button" onClick={handleNextImage} disabled={resultUrls.length === 0} className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(232,194,122,0.24)] bg-[rgba(232,194,122,0.08)] text-[#E8C27A] transition hover:bg-[rgba(232,194,122,0.14)] disabled:opacity-45" aria-label="下一张">
                  <ChevronIcon direction="right" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex shrink-0 justify-center gap-3">
              {(resultUrls.length > 0 ? resultUrls : [0, 1, 2, 3]).map((_, idx) => (
                <span key={idx} className="h-2 w-2 rounded-full" style={{ background: idx === currentPreviewIndex ? "#E8C27A" : "rgba(255,247,236,0.25)" }} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
