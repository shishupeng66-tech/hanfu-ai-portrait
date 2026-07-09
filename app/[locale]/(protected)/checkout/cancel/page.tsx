"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, CreditCard, Crown } from "lucide-react";

export default function CheckoutCancelPage() {
  const locale = useLocale();
  const t = useTranslations("checkout.cancel");

  return (
    <div className="min-h-screen bg-[#0B0B0D] px-6 py-10 text-[rgba(255,247,236,0.92)]">
      <div className="mx-auto flex min-h-[620px] max-w-4xl flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(255,247,236,0.10)] bg-[rgba(255,247,236,0.045)] text-[rgba(255,247,236,0.64)] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <CreditCard className="h-8 w-8" strokeWidth={1.7} />
          </div>
          <h1 className="text-3xl font-semibold text-[rgba(255,247,236,0.94)] md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-base text-[rgba(255,247,236,0.56)]">
            {t("description")}
          </p>
        </div>

        <section className="w-full rounded-[24px] border border-[rgba(255,247,236,0.08)] bg-[#111114] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.30)] md:p-8">
          <h2 className="text-xl font-semibold text-[rgba(255,247,236,0.92)]">
            {t("message")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[rgba(255,247,236,0.48)]">
            {t("subMessage")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}/credits`}
              className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-[#E8C27A] px-5 text-sm font-semibold text-[#0B0B0D] transition hover:bg-[#F2D38A]"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backCredits")}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl border border-[rgba(232,194,122,0.18)] bg-[rgba(232,194,122,0.07)] px-5 text-sm font-medium text-[#E8C27A] transition hover:bg-[rgba(232,194,122,0.12)]"
            >
              <Crown className="h-4 w-4" />
              {t("viewPlans")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}