import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { generationHistory, user } from "@/lib/db/schema";
import type { Locale } from "@/i18n.config";
import { cn } from "@/lib/utils";

type GenerationDetailPageProps = {
  params: Promise<{
    locale: Locale;
    id: string;
  }>;
};

type GenerationMetadata = {
  templateName?: string | { zh?: string; en?: string };
  templateKey?: string;
  templateSlug?: string;
  templateId?: string;
  model?: string;
  imageUrls?: string[];
  imageUrl?: string;
  inputImageUrl?: string;
  mode?: string;
  maxImages?: number;
  creditsNeeded?: number;
};

const statusLabels: Record<string, string> = {
  completed: "成功",
  failed: "失败",
  processing: "处理中",
  pending: "等待中",
};

const typeLabels: Record<string, string> = {
  image: "图片",
  video: "视频",
};

function parseMetadata(metadata: string | null): GenerationMetadata {
  if (!metadata) return {};
  try {
    return JSON.parse(metadata) as GenerationMetadata;
  } catch {
    return {};
  }
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 break-all text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isGood = status === "completed";
  const isBad = status === "failed";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        isGood && "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        isBad && "border-red-500/20 bg-red-500/10 text-red-300",
        !isGood && !isBad && "border-amber-500/20 bg-amber-500/10 text-amber-300"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}

function ImagePreview({ title, urls }: { title: string; urls: string[] }) {
  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {urls.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-4">
          {urls.map((url, index) => (
            <a
              key={`${url}-${index}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-amber-500/30"
            >
              <Image src={url} alt={`${title} ${index + 1}`} fill sizes="240px" className="object-cover transition-transform group-hover:scale-105" unoptimized />
            </a>
          ))}
        </div>
      ) : (
        <div className="px-5 py-14 text-center text-sm text-muted-foreground">暂无图片</div>
      )}
    </section>
  );
}

export default async function AdminGenerationDetailPage({ params }: GenerationDetailPageProps) {
  const { locale, id } = await params;

  const rows = await db
    .select({
      id: generationHistory.id,
      userId: generationHistory.userId,
      userEmail: user.email,
      userName: user.name,
      type: generationHistory.type,
      prompt: generationHistory.prompt,
      imageUrl: generationHistory.imageUrl,
      resultUrl: generationHistory.resultUrl,
      taskId: generationHistory.taskId,
      status: generationHistory.status,
      creditsUsed: generationHistory.creditsUsed,
      metadata: generationHistory.metadata,
      error: generationHistory.error,
      createdAt: generationHistory.createdAt,
      updatedAt: generationHistory.updatedAt,
    })
    .from(generationHistory)
    .leftJoin(user, eq(generationHistory.userId, user.id))
    .where(eq(generationHistory.id, id))
    .limit(1);

  const record = rows[0];

  if (!record) {
    return (
      <div className="space-y-6">
        <Link href={`/${locale}/admin/generations`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回 AI 生成任务
        </Link>
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">任务不存在</h1>
          <p className="mt-2 text-sm text-muted-foreground">该生成任务可能不存在，或 ID 不正确。</p>
        </div>
      </div>
    );
  }

  const metadata = parseMetadata(record.metadata);
  const inputUrls = [record.imageUrl, metadata.inputImageUrl, metadata.imageUrl].filter((url): url is string => Boolean(url));
  const outputUrls = [...(metadata.imageUrls ?? []), record.resultUrl].filter((url): url is string => Boolean(url));
  const uniqueOutputUrls = Array.from(new Set(outputUrls));
  const outputCount = metadata.maxImages ?? uniqueOutputUrls.length;

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/generations`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        返回 AI 生成任务
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">AI 生成详情</h1>
        <p className="text-sm text-muted-foreground">{record.id}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field
          label="用户"
          value={
            <Link href={`/${locale}/admin/users/${record.userId}`} className="text-amber-200 hover:text-amber-100">
              {record.userEmail || record.userName || record.userId}
            </Link>
          }
        />
        <Field label="模板" value={typeof metadata.templateName === "string" ? metadata.templateName : metadata.templateName?.zh || metadata.templateName?.en || metadata.templateKey || metadata.templateSlug || "-"} />
        <Field label="模型" value={metadata.model || "Volcano Engine"} />
        <Field label="类型" value={typeLabels[record.type] || record.type} />
        <Field label="消耗积分" value={record.creditsUsed.toLocaleString()} />
        <Field label="状态" value={<StatusBadge status={record.status} />} />
        <Field label="任务 ID" value={record.taskId || "-"} />
        <Field label="生成模式" value={metadata.mode || "-"} />
        <Field label="输出数量" value={outputCount > 0 ? outputCount : "-"} />
        <Field label="创建时间" value={format(new Date(record.createdAt), "yyyy-MM-dd HH:mm")} />
        <Field label="更新时间" value={format(new Date(record.updatedAt), "yyyy-MM-dd HH:mm")} />
        <Field label="错误信息" value={record.error || "-"} />
      </div>

      <ImagePreview title="输入图片" urls={inputUrls} />
      <ImagePreview title="输出图片" urls={uniqueOutputUrls} />

      <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Prompt 摘要</h2>
        </div>
        <div className="max-h-72 overflow-auto p-5 text-sm leading-6 text-muted-foreground">
          {record.prompt || "暂无 prompt"}
        </div>
      </section>
    </div>
  );
}
