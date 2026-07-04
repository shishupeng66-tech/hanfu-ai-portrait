"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Heart, Image as ImageIcon, Sparkles } from "lucide-react";
import { getTemplateById } from "@/features/templates/template-data";

export default function TemplateDetailPage() {
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = useState(false);
  const template = getTemplateById(params.id);
  const backHref = `/${locale}/templates`;

  if (!template) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] p-6 text-[rgba(255,247,236,0.92)] md:p-8">
        <div className="mx-auto flex min-h-[520px] max-w-4xl flex-col items-center justify-center rounded-[24px] border border-[rgba(255,247,236,0.08)] bg-[#111114] px-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[rgba(255,247,236,0.04)]">
            <ImageIcon className="h-10 w-10 text-[rgba(255,247,236,0.25)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[rgba(255,247,236,0.92)]">模板不存在</h1>
          <p className="mt-2 text-sm text-[rgba(255,247,236,0.48)]">该模板可能已下架或不存在。</p>
          <Link
            href={backHref}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-[rgba(232,194,122,0.24)] bg-[rgba(232,194,122,0.08)] px-5 text-sm font-medium text-[#E8C27A] transition hover:bg-[rgba(232,194,122,0.13)]"
          >
            返回模板库
          </Link>
        </div>
      </div>
    );
  }

  const useTemplateHref = `/${locale}/generate?template=${template.id}`;

  return (
    <div className="min-h-screen bg-[#0B0B0D] px-6 py-8 text-[rgba(255,247,236,0.92)]">
      <div className="mx-auto max-w-[1240px]">
        <Link
          href={backHref}
          className="mb-6 inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(255,247,236,0.08)] bg-[rgba(255,247,236,0.04)] px-4 text-sm text-[rgba(255,247,236,0.72)] transition hover:border-[rgba(232,194,122,0.22)] hover:bg-[rgba(232,194,122,0.08)] hover:text-[#E8C27A]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回模板库
        </Link>

        <section className="mb-7">
          <div className="mb-4 flex flex-wrap gap-2">
            {template.styleTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[rgba(232,194,122,0.18)] bg-[rgba(232,194,122,0.07)] px-3 py-1 text-xs text-[#E8C27A]"
              >
                {tag}
              </span>
            ))}
            <span className="rounded-full border border-[rgba(232,194,122,0.18)] bg-[rgba(232,194,122,0.07)] px-3 py-1 text-xs text-[#E8C27A]">
              {template.creditCost} 积分
            </span>
            <span className="rounded-full border border-[rgba(255,247,236,0.08)] bg-[rgba(255,247,236,0.04)] px-3 py-1 text-xs text-[rgba(255,247,236,0.56)]">
              {template.isPremium ? "会员专属" : "免费可用"}
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-[rgba(255,247,236,0.94)] md:text-4xl">
            {template.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[rgba(255,247,236,0.56)] md:text-base">
            {template.description}
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-[24px] border border-[rgba(232,194,122,0.16)] bg-[#111114] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[rgba(255,247,236,0.03)] md:aspect-[4/5]">
              <Image
                src={template.previewUrl}
                alt={template.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 760px"
              />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#111114] via-[rgba(17,17,20,0.62)] to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-sm text-[#E8C27A]">{template.category} · {template.label}</p>
                <p className="mt-1 text-xl font-semibold text-[rgba(255,247,236,0.94)]">{template.name}</p>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-[24px] border border-[rgba(255,247,236,0.08)] bg-[#111114] p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[rgba(255,247,236,0.92)]">
                <Sparkles className="h-4 w-4 text-[#E8C27A]" />
                模板信息
              </h2>
              <div className="space-y-3 text-sm">
                <InfoRow label="朝代/风格" value={`${template.category} · ${template.label}`} />
                <InfoRow label="推荐照片类型" value={template.recommendedPhotoType} />
                <InfoRow label="生成张数" value={`${template.generationCount} 张`} />
                <InfoRow label="消耗积分" value={`${template.creditCost} 积分`} accent />
                <InfoRow label="模板权限" value={template.isPremium ? "会员专属" : "免费可用"} />
                <InfoRow label="适合人群" value={template.audience} />
                <InfoRow label="使用建议" value={template.usageTips} />
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(255,247,236,0.08)] bg-[#111114] p-5">
              <div className="grid gap-3">
                <Link
                  href={useTemplateHref}
                  className="flex h-12 items-center justify-center rounded-xl bg-[#E8C27A] px-5 text-sm font-semibold text-[#0B0B0D] transition hover:bg-[#F2D38A]"
                >
                  使用此模板
                </Link>
                <button
                  type="button"
                  onClick={() => setIsFavorite((value) => !value)}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[rgba(232,194,122,0.18)] bg-[rgba(232,194,122,0.07)] px-5 text-sm font-medium text-[#E8C27A] transition hover:bg-[rgba(232,194,122,0.12)]"
                >
                  {isFavorite ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                  {isFavorite ? "已收藏" : "收藏模板"}
                </button>
                <Link
                  href={backHref}
                  className="flex h-11 items-center justify-center rounded-xl border border-[rgba(255,247,236,0.08)] bg-[rgba(255,247,236,0.04)] px-5 text-sm text-[rgba(255,247,236,0.72)] transition hover:bg-[rgba(255,247,236,0.07)]"
                >
                  查看更多模板
                </Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-10 pb-10">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[rgba(255,247,236,0.92)]">更多效果预览</h2>
            <p className="mt-2 text-sm text-[rgba(255,247,236,0.48)]">同一风格下的不同构图与光影参考。</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {template.galleryImages.slice(0, 6).map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative aspect-[3/4] overflow-hidden rounded-[18px] border border-[rgba(255,247,236,0.08)] bg-[#111114]"
              >
                <Image
                  src={image}
                  alt={`${template.name} 效果预览 ${index + 1}`}
                  fill
                  className="object-cover transition duration-500 hover:scale-[1.04] hover:brightness-110"
                  sizes="(max-width: 768px) 50vw, 180px"
                />
              </div>
            ))}
          </div>
        </section>
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
    <div className="border-b border-[rgba(255,247,236,0.06)] pb-3 last:border-b-0 last:pb-0">
      <p className="mb-1 text-xs text-[rgba(255,247,236,0.38)]">{label}</p>
      <p className={accent ? "text-sm font-medium text-[#E8C27A]" : "text-sm leading-5 text-[rgba(255,247,236,0.72)]"}>
        {value}
      </p>
    </div>
  );
}
