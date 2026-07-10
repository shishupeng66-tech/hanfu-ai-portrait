"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/button";

export default function WorkDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const isZh = locale === "zh";

  // TODO: fetch work from API when works API is ready
  const work = undefined;

  const goBack = () => router.push(`/${locale}/works`);

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

  // TODO: render work detail when API is ready
  return null;
}
