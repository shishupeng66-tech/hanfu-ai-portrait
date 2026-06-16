"use client";

import Image from "next/image";
import { ChangeEvent, useMemo, useState } from "react";

import { Background } from "@/components/background";
import { Button } from "@/components/button";
import { Container } from "@/components/container";
import { cn } from "@/lib/utils";

const templates = [
  {
    key: "nightLanternRedBlackHanfu",
    name: "夜灯红黑汉服",
    description: "红墙巷弄，暮色灯笼，红黑金汉服，4张套图",
    sampleClass: "from-red-700 via-red-500 to-amber-400",
    shots: 4,
    trialCredits: 1,
    setCredits: 4,
  },
] as const;

type TemplateKey = (typeof templates)[number]["key"];
type GenerationMode = "trial" | "set";

type GenerateResponse = {
  imageUrls?: string[];
  templateName?: string;
  totalShots?: number;
  creditsUsed?: number;
  remainingCredits?: number;
  error?: string;
};

export default function GeneratePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>("nightLanternRedBlackHanfu");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("trial");
  const [trialCompletedTemplates, setTrialCompletedTemplates] = useState<Partial<Record<TemplateKey, boolean>>>({});

  const selectedTemplateName = useMemo(
    () => templates.find((t) => t.key === selectedTemplate)?.name,
    [selectedTemplate]
  );
  const selectedTemplateConfig = templates.find((t) => t.key === selectedTemplate) || templates[0];
  const hasCompletedTrial = Boolean(trialCompletedTemplates[selectedTemplate]);
  const setCredits = hasCompletedTrial
    ? Math.max(1, selectedTemplateConfig.setCredits - selectedTemplateConfig.trialCredits)
    : selectedTemplateConfig.setCredits;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setError(null);
    setResultUrls([]);
    setFile(nextFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  async function handleGenerate(mode: GenerationMode) {
    if (!file) {
      setError("请先上传一张照片。");
      return;
    }
    setGenerationMode(mode);
    setIsGenerating(true);
    setError(null);
    setResultUrls([]);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("template", selectedTemplate);
    formData.append("mode", mode);
    if (mode === "set" && trialCompletedTemplates[selectedTemplate]) {
      formData.append("trialAlreadyUsed", "true");
    }
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as GenerateResponse;
      if (!response.ok) {
        throw new Error(data.error || "生成失败，请稍后重试。");
      }
      if (!data.imageUrls || data.imageUrls.length === 0) {
        throw new Error("生成成功但没有返回图片。");
      }
      setResultUrls(data.imageUrls);
      if (mode === "trial") {
        setTrialCompletedTemplates(previous => ({
          ...previous,
          [selectedTemplate]: true,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <Background />
      <Container className="relative z-10 py-24">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-medium text-primary">汉韵写真</p>
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-6xl">
            汉服AI写真生成
          </h1>
          <p className="text-lg text-muted-foreground">
            上传一张照片，选择风格，AI 保留你的面部特征生成专属汉服写真。
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-semibold text-card-foreground">1. 上传照片</h2>
              <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center transition hover:border-primary">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {previewUrl ? (
                  <div className="relative h-64 w-full overflow-hidden rounded-xl">
                    <Image src={previewUrl} alt="上传照片预览" fill className="object-contain" unoptimized />
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-foreground">点击上传照片</p>
                    <p className="mt-2 text-sm text-muted-foreground">支持 JPG、PNG、WebP，建议上传清晰正脸照片</p>
                  </div>
                )}
              </label>
            </section>
            <section className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-md">
              <h2 className="mb-4 text-2xl font-semibold text-card-foreground">2. 选择写真风格</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {templates.map((template) => (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => setSelectedTemplate(template.key)}
                    className={cn(
                      "rounded-2xl border p-3 text-left transition",
                      selectedTemplate === template.key
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border bg-background/60 hover:border-primary/60"
                    )}
                  >
                    <div className={cn("mb-3 h-28 rounded-xl bg-gradient-to-br", template.sampleClass)} />
                    <h3 className="mb-1 text-lg font-semibold text-foreground">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </button>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-card-foreground">3. 开始生成</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    当前选择：{selectedTemplateName}，可先试 1 张，满意后再生成整套 4 张。
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={() => handleGenerate("trial")}
                    disabled={isGenerating || !file}
                    className="disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGenerating && generationMode === "trial" ? "试用生成中..." : "先试一张 · 1积分"}
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleGenerate("set")}
                    disabled={isGenerating || !file}
                    className="disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGenerating && generationMode === "set" ? "整套生成中..." : `生成整套 · ${setCredits}积分`}
                  </Button>
                </div>
              </div>
              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
            </section>
          </div>
          <aside className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-md">
            <h2 className="mb-4 text-2xl font-semibold text-card-foreground">生成结果</h2>
            <div className="space-y-4">
              {resultUrls.length > 0 ? (
                resultUrls.map((url, index) => (
                  <div key={index} className="relative overflow-hidden rounded-xl border border-border">
                    <Image src={url} alt={`写真镜头 ${index + 1}`} width={400} height={600} className="w-full object-cover" unoptimized />
                    
                    {/* Watermark */}
                    <div className="absolute bottom-2 left-2 opacity-20" style={{ width: '5%', minWidth: '20px' }}>
                      <img
                        src="/brand/logo-mark.png"
                        alt="HanPortrait Watermark"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    
                    <a href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 rounded-lg bg-black/50 px-3 py-1 text-xs text-white hover:bg-black/70"
                    >
                      查看原图
                    </a>
                  </div>
                ))
              ) : (
                <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-border bg-background/60">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <img
                          src="/brand/logo-mark.png"
                          alt="HanPortrait Logo"
                          className="h-16 w-16 object-contain drop-shadow-[0_0_12px_rgba(232,194,122,0.4)] animate-breathing"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#E8C27A]/20 to-[#B7352D]/20 blur-[3px]"></div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground">
                        {generationMode === "trial"
                          ? "AI 正在生成试用图，请耐心等待..."
                          : "AI 正在生成整套写真，请耐心等待..."}
                      </p>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      生成后的图片会显示在这里
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
