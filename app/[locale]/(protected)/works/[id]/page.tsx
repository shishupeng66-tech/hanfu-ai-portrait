"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/button";
import { MOCK_WORKS, type WorkStatus } from "@/features/works/mock-works";

const statusLabels: Record<WorkStatus, { zh: string; en: string; color: string; bg: string }> = {
  completed: {
    zh: "已完成",
    en: "Completed",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.14)",
  },
  processing: {
    zh: "生成中",
    en: "Processing",
    color: "#E8C27A",
    bg: "rgba(232, 194, 122, 0.14)",
  },
  failed: {
    zh: "失败",
    en: "Failed",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.14)",
  },
  favorited: {
    zh: "已完成",
    en: "Completed",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.14)",
  },
};

export default function WorkDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const isZh = locale === "zh";
  const work = MOCK_WORKS.find((item) => item.id === params.id);

  const goBack = () => router.push(`/${locale}/works`);
  const handleRegenerate = () => router.push(`/${locale}/generate`);
  const handleDownload = () => {
    if (work?.image) {
      window.open(work.image, "_blank", "noopener,noreferrer");
    }
  };

  if (!work) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] p-6 md:p-8">
        <div className="mx-auto flex min-h-[520px] max-w-4xl flex-col items-center justify-center rounded-2xl border border-[rgba(255,247,236,0.08)] bg-[#111114] px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[rgba(255,247,236,0.04)]">
            <ImageIcon className="h-10 w-10 text-[rgba(255,247,236,0.25)]" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-[rgba(255,247,236,0.92)]">
            {isZh ? "作品不存在" : "Work Not Found"}
          </h1>
          <p className="mb-8 text-sm text-[rgba(255,247,236,0.55)]">
            {isZh ? "该作品可能已删除或不存在。" : "This work may have been deleted or does not exist."}
          </p>
          <Button
            onClick={goBack}
            className="border border-[rgba(232,194,122,0.18)] bg-[rgba(232,194,122,0.12)] text-[#E8C27A] hover:bg-[rgba(232,194,122,0.18)]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isZh ? "返回我的作品" : "Back to My Works"}
          </Button>
        </div>
      </div>
    );
  }

  const status = statusLabels[work.status];

  return (
    <div className="min-h-screen bg-[#0B0B0D] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(255,247,236,0.08)] bg-[rgba(255,247,236,0.04)] px-4 py-2 text-sm text-[rgba(255,247,236,0.72)] transition-colors hover:border-[rgba(232,194,122,0.22)] hover:bg-[rgba(232,194,122,0.08)] hover:text-[#E8C27A]"
        >
          <ArrowLeft className="h-4 w-4" />
          {isZh ? "返回我的作品" : "Back to My Works"}
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[rgba(255,247,236,0.92)] md:text-3xl">
            {isZh ? "作品详情" : "Work Details"}
          </h1>
          <p className="mt-2 text-sm text-[rgba(255,247,236,0.50)]">
            {isZh ? "查看和管理这组 AI 汉服写真。" : "View and manage this AI Hanfu portrait set."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
          <section className="rounded-2xl border border-[rgba(232,194,122,0.16)] bg-[#111114] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[rgba(255,247,236,0.03)]">
              {work.status === "processing" ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#E8C27A]" />
                  <p className="text-sm text-[rgba(255,247,236,0.62)]">
                    {isZh ? "AI 正在生成中..." : "AI is generating..."}
                  </p>
                </div>
              ) : work.status === "failed" ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <ImageIcon className="mb-4 h-12 w-12 text-[rgba(255,247,236,0.28)]" />
                  <p className="mb-2 text-base font-medium text-[rgba(255,247,236,0.86)]">
                    {isZh ? "生成失败" : "Generation Failed"}
                  </p>
                  <p className="text-sm text-[rgba(255,247,236,0.45)]">{work.errorMessage}</p>
                </div>
              ) : (
                <Image
                  src={work.image}
                  alt={work.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 720px"
                  className="object-cover"
                  priority
                />
              )}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-[rgba(255,247,236,0.08)] bg-[#111114] p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs text-[rgba(255,247,236,0.40)]">
                    {isZh ? "作品名称" : "Work Name"}
                  </p>
                  <h2 className="text-xl font-semibold text-[rgba(255,247,236,0.92)]">
                    {work.title}
                  </h2>
                </div>
                <span
                  className="inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: status.bg, color: status.color }}
                >
                  {isZh ? status.zh : status.en}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <InfoRow label={isZh ? "风格/模板" : "Style"} value={work.styleName} />
                <InfoRow label={isZh ? "生成时间" : "Created At"} value={work.createdAt} />
                <InfoRow label={isZh ? "图片数量" : "Images"} value={`${work.imageCount}`} />
                <InfoRow label={isZh ? "消耗积分" : "Credits"} value={`${work.credits}`} accent />
              </div>
            </div>

            <div className="rounded-2xl border border-[rgba(255,247,236,0.08)] bg-[#111114] p-5">
              <p className="mb-4 text-sm font-medium text-[rgba(255,247,236,0.82)]">
                {isZh ? "操作" : "Actions"}
              </p>
              <div className="grid gap-3">
                <Button
                  onClick={handleDownload}
                  disabled={work.status !== "completed" && work.status !== "favorited"}
                  className="justify-center bg-[rgba(255,247,236,0.06)] text-[rgba(255,247,236,0.82)] hover:bg-[rgba(255,247,236,0.10)] disabled:opacity-45"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isZh ? "下载图片" : "Download Image"}
                </Button>
                <Button
                  onClick={handleRegenerate}
                  className="justify-center bg-[rgba(232,194,122,0.14)] text-[#E8C27A] hover:bg-[rgba(232,194,122,0.20)]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isZh ? "再次生成" : "Regenerate"}
                </Button>
                <Button
                  onClick={goBack}
                  className="justify-center bg-[rgba(255,247,236,0.05)] text-[rgba(255,247,236,0.72)] hover:bg-[rgba(255,247,236,0.09)]"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isZh ? "返回我的作品" : "Back to My Works"}
                </Button>
                <Button
                  onClick={goBack}
                  className="justify-center border border-[rgba(239,68,68,0.18)] bg-[rgba(239,68,68,0.08)] text-[#ef4444] hover:bg-[rgba(239,68,68,0.12)]"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isZh ? "删除作品" : "Delete Work"}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(255,247,236,0.06)] pb-3 last:border-b-0 last:pb-0">
      <span className="text-[rgba(255,247,236,0.45)]">{label}</span>
      <span className={accent ? "font-medium text-[#E8C27A]" : "text-[rgba(255,247,236,0.78)]"}>
        {value}
      </span>
    </div>
  );
}
