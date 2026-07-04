"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { CheckCircle2, Coins, Sparkles } from "lucide-react";

export default function CheckoutSuccessPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-[#0B0B0D] px-6 py-10 text-[rgba(255,247,236,0.92)]">
      <div className="mx-auto flex min-h-[620px] max-w-4xl flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(232,194,122,0.24)] bg-[rgba(232,194,122,0.10)] text-[#E8C27A] shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.7} />
          </div>
          <h1 className="text-3xl font-semibold text-[rgba(255,247,236,0.94)] md:text-4xl">
            支付成功
          </h1>
          <p className="mt-3 text-base text-[rgba(255,247,236,0.56)]">
            你的积分或订阅已成功开通。
          </p>
        </div>

        <section className="w-full rounded-[24px] border border-[rgba(255,247,236,0.08)] bg-[#111114] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.30)] md:p-8">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(232,194,122,0.08)] text-[#E8C27A]">
            <Coins className="h-6 w-6" strokeWidth={1.7} />
          </div>
          <h2 className="text-xl font-semibold text-[rgba(255,247,236,0.92)]">
            感谢你的购买，系统正在同步你的账户权益。
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[rgba(255,247,236,0.52)]">
            如果积分没有立即到账，请刷新页面或稍后查看积分中心。
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${locale}/credits`}
              className="inline-flex h-11 min-w-[150px] items-center justify-center rounded-xl bg-[#E8C27A] px-5 text-sm font-semibold text-[#0B0B0D] transition hover:bg-[#F2D38A]"
            >
              查看积分中心
            </Link>
            <Link
              href={`/${locale}/generate`}
              className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl border border-[rgba(232,194,122,0.18)] bg-[rgba(232,194,122,0.07)] px-5 text-sm font-medium text-[#E8C27A] transition hover:bg-[rgba(232,194,122,0.12)]"
            >
              <Sparkles className="h-4 w-4" />
              开始创作
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
