"use client";

import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("common");

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${locale}`);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,247,236,0.08)] bg-[rgba(255,247,236,0.04)] px-3 py-1.5 text-sm text-[rgba(255,247,236,0.55)] transition-colors hover:border-[rgba(232,194,122,0.22)] hover:bg-[rgba(232,194,122,0.08)] hover:text-[rgba(255,247,236,0.82)]"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {t("actions.back")}
    </button>
  );
}