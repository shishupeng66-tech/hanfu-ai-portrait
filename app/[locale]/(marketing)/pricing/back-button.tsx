"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function BackButton() {
  const router = useRouter();
  const tCommon = useTranslations("common");

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span aria-hidden>←</span>
      {tCommon("actions.back")}
    </button>
  );
}
