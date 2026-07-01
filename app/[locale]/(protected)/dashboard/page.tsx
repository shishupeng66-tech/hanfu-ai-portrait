"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from 'next-intl';
import { Button } from "@/components/button";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { getDefaultOneTimePack } from "@/lib/billing-display";
import { getSubscriptionPlanDisplayInfo } from "@/lib/account-settings";
import type { ClientUserProfile, UserProfileResponse } from "@/lib/client-api";
import { Sparkles, Coins, GalleryVerticalEnd, Layers, CreditCard, FolderOpen } from "lucide-react";

// Mock recent works data
const MOCK_RECENT_WORKS = [
  {
    id: "1",
    title: "江南烟雨 · 古风写真",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
    status: "completed",
    createdAt: "2024-01-15 14:30",
  },
  {
    id: "2",
    title: "唐风雅韵 · 汉服写真",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
    status: "completed",
    createdAt: "2024-01-15 12:20",
  },
  {
    id: "3",
    title: "清冷侠客 · 剑客写真",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
    status: "completed",
    createdAt: "2024-01-14 18:45",
  },
  {
    id: "4",
    title: "红妆映雪 · 冬日写真",
    image: "https://images.unsplash.com/photo-1524504388036-18922537e913?w=400&h=500&fit=crop",
    status: "completed",
    createdAt: "2024-01-14 10:15",
  },
];

const QUICK_ACTIONS = [
  {
    id: "generate",
    title: "开始生成",
    subtitle: "创建新作品",
    icon: Sparkles,
    href: "/generate",
  },
  {
    id: "templates",
    title: "模板库",
    subtitle: "探索精选模板",
    icon: Layers,
    href: "/templates",
  },
  {
    id: "credits",
    title: "积分充值",
    subtitle: "购买更多积分",
    icon: CreditCard,
    href: "/credits",
  },
  {
    id: "gallery",
    title: "我的作品",
    subtitle: "管理作品集",
    icon: FolderOpen,
    href: "/gallery",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const locale = useLocale();
  const tCommon = useTranslations('common');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<ClientUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const defaultPack = getDefaultOneTimePack();

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = (await response.json()) as UserProfileResponse;
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session.data?.user?.id) {
      fetchUserProfile();
    }
  }, [session.data?.user?.id, fetchUserProfile]);
  
  useEffect(() => {
    const success = searchParams.get("success");
    const checkoutId = searchParams.get("checkout_id");
    const orderId = searchParams.get("order_id");
    const subscriptionId = searchParams.get("subscription_id");
    
    if (success === "1" || checkoutId || orderId || subscriptionId) {
      setPaymentSuccess(true);
      setTimeout(() => {
        fetchUserProfile();
      }, 1000);
      setTimeout(() => {
        router.replace(`/${locale}/dashboard`);
      }, 5000);
    }
  }, [searchParams, router, fetchUserProfile, locale]);
  
  const startCheckout = useCallback(
    async () => {
      const userId = session.data?.user?.id;
      if (!userId) return;
      const res = await fetch("/api/payments/creem/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: defaultPack.key, kind: "one_time" }),
      });
      if (!res.ok) return;
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    },
    [defaultPack.key, session.data?.user?.id]
  );

  const user = session.data?.user;
  const credits = userProfile?.credits ?? 0;
  const planDisplayInfo = getSubscriptionPlanDisplayInfo(
    userProfile?.subscription?.planKey,
    locale
  );

  if (loading && !user) {
    return (
      <div className="min-h-screen" style={{ background: "#0B0B0D" }}>
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <p style={{ color: "rgba(255, 247, 236, 0.72)" }}>{tCommon('status.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] overflow-y-auto lg:overflow-hidden" style={{ background: "#0B0B0D" }}>
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 px-4 py-4 md:gap-5 md:px-5 md:py-5 lg:px-6 lg:py-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5 }}
          className="shrink-0"
        >
          {paymentSuccess && (
            <div className="mb-4 rounded-lg border border-[rgba(232,194,122,0.16)] bg-[rgba(232,194,122,0.10)] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#E8C27A]">
                  {locale === "zh" ? "充值成功！" : "Payment successful!"}
                </p>
                <Link href={`/${locale}/credits`}>
                  <Button variant="outline" size="sm">
                    {locale === "zh" ? "查看积分" : "View credits"}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1
                className="mb-1 text-3xl font-bold md:text-[2.25rem]"
                style={{ color: "rgba(255, 247, 236, 0.95)" }}
              >
                {locale === "zh" ? "欢迎回来，创作者" : "Welcome back, Creator"}
              </h1>
              <p className="text-base md:text-lg" style={{ color: "rgba(255, 247, 236, 0.60)" }}>
                {locale === "zh"
                  ? "今天又是创作美好的一天，让我们开始吧！"
                  : "Another beautiful day for creation, let's get started!"}
              </p>
            </div>

            <div
              className="flex w-full gap-4 rounded-xl px-4 py-3 md:w-auto md:justify-end"
              style={{
                background: "rgba(255, 247, 236, 0.02)",
                border: "1px solid rgba(255, 247, 236, 0.06)",
              }}
            >
              <div className="min-w-[88px]">
                <p className="mb-1 text-xs" style={{ color: "rgba(255, 247, 236, 0.48)" }}>
                  {locale === "zh" ? "剩余积分" : "Credits"}
                </p>
                <p className="text-2xl font-bold leading-none" style={{ color: "#E8C27A" }}>
                  {credits}
                </p>
              </div>
              <div className="pl-4" style={{ borderLeft: "1px solid rgba(255, 247, 236, 0.08)" }}>
                <p className="mb-1 text-xs" style={{ color: "rgba(255, 247, 236, 0.48)" }}>
                  {locale === "zh" ? "当前套餐" : "Current plan"}
                </p>
                <p className="text-sm font-semibold md:text-base" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
                  {planDisplayInfo.displayName}
                </p>
              </div>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-2xl px-5 py-5 md:px-6 md:py-6"
            style={{
              background: "linear-gradient(135deg, rgba(232, 194, 122, 0.08) 0%, rgba(232, 194, 122, 0.02) 100%)",
              border: "1px solid rgba(232, 194, 122, 0.15)",
            }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h2 className="mb-2 text-2xl font-bold md:text-[2rem]" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                  {locale === "zh" ? "创作精美的汉服写真" : "Create stunning Hanfu portraits"}
                </h2>
                <p className="text-sm md:text-base" style={{ color: "rgba(255, 247, 236, 0.65)" }}>
                  {locale === "zh"
                    ? "上传照片，选择模板，AI 帮你生成专属汉服大片。"
                    : "Upload photos, choose templates, and let AI create exclusive Hanfu portraits for you."}
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => router.push(`/${locale}/generate`)}
                className="h-14 min-w-[220px] px-7 text-base font-semibold"
                style={{
                  background: "linear-gradient(135deg, #E8C27A 0%, #D4A84B 100%)",
                  color: "#1a1508",
                  boxShadow: "0 8px 24px rgba(232, 194, 122, 0.22)",
                }}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {locale === "zh" ? "开始生成汉服写真" : "Start creating Hanfu portraits"}
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.08 }}
          className="shrink-0"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div
              className="rounded-xl px-4 py-4"
              style={{
                background: "rgba(255, 247, 236, 0.03)",
                border: "1px solid rgba(255, 247, 236, 0.08)",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: "rgba(232, 194, 122, 0.12)" }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: "#E8C27A" }} />
                </div>
                <span className="text-sm" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
                  {locale === "zh" ? "今日生成" : "Generated today"}
                </span>
              </div>
              <p className="text-3xl font-bold leading-none" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                0
              </p>
              <p className="mt-2 text-xs" style={{ color: "rgba(255, 247, 236, 0.4)" }}>
                {locale === "zh" ? "较昨日 —" : "vs yesterday —"}
              </p>
            </div>

            <div
              className="rounded-xl px-4 py-4"
              style={{
                background: "rgba(255, 247, 236, 0.03)",
                border: "1px solid rgba(255, 247, 236, 0.08)",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: "rgba(255, 247, 236, 0.06)" }}
                >
                  <GalleryVerticalEnd className="h-4 w-4" style={{ color: "rgba(255, 247, 236, 0.7)" }} />
                </div>
                <span className="text-sm" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
                  {locale === "zh" ? "总作品数" : "Total works"}
                </span>
              </div>
              <p className="text-3xl font-bold leading-none" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                0
              </p>
              <p className="mt-2 text-xs" style={{ color: "rgba(255, 247, 236, 0.4)" }}>
                {locale === "zh" ? "较上月 —" : "vs last month —"}
              </p>
            </div>

            <div
              className="rounded-xl px-4 py-4"
              style={{
                background: "rgba(255, 247, 236, 0.03)",
                border: "1px solid rgba(255, 247, 236, 0.08)",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: "rgba(232, 194, 122, 0.12)" }}
                >
                  <Coins className="h-4 w-4" style={{ color: "#E8C27A" }} />
                </div>
                <span className="text-sm" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
                  {locale === "zh" ? "剩余积分" : "Remaining credits"}
                </span>
              </div>
              <p className="text-3xl font-bold leading-none" style={{ color: "#E8C27A" }}>
                {credits}
              </p>
              <button
                onClick={startCheckout}
                className="mt-2 text-xs hover:underline"
                style={{ color: "#E8C27A" }}
              >
                {locale === "zh" ? "去充值 →" : "Recharge →"}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.16 }}
          className="min-h-0 flex-1"
        >
          <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section
              className="flex min-h-0 flex-col rounded-2xl px-4 py-4 md:px-5"
              style={{
                background: "rgba(255, 247, 236, 0.02)",
                border: "1px solid rgba(255, 247, 236, 0.06)",
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold md:text-xl" style={{ color: "rgba(255, 247, 236, 0.9)" }}>
                  {locale === "zh" ? "最近作品" : "Recent works"}
                </h3>
                <Link
                  href={`/${locale}/gallery`}
                  className="text-sm font-medium hover:opacity-80"
                  style={{ color: "#E8C27A" }}
                >
                  {locale === "zh" ? "查看全部 →" : "View all →"}
                </Link>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
                {MOCK_RECENT_WORKS.map((work) => (
                  <button
                    key={work.id}
                    type="button"
                    onClick={() => router.push(`/${locale}/gallery`)}
                    className="group flex min-w-0 flex-col rounded-xl text-left transition-transform duration-200 hover:scale-[1.01]"
                    style={{ background: "rgba(255, 247, 236, 0.02)" }}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[rgba(255,247,236,0.08)]">
                      <Image
                        src={work.image}
                        alt={work.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-x-0 top-0 flex justify-start p-2">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium"
                          style={{ background: "rgba(34, 197, 94, 0.92)", color: "#fff" }}
                        >
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />
                          {locale === "zh" ? "已完成" : "Completed"}
                        </span>
                      </div>
                    </div>
                    <div className="px-1 pb-1 pt-2">
                      <p className="truncate text-sm font-medium" style={{ color: "rgba(255, 247, 236, 0.88)" }}>
                        {work.title}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "rgba(255, 247, 236, 0.42)" }}>
                        {work.createdAt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section
              className="rounded-2xl px-4 py-4 md:px-5"
              style={{
                background: "rgba(255, 247, 236, 0.02)",
                border: "1px solid rgba(255, 247, 236, 0.06)",
              }}
            >
              <h3 className="mb-4 text-lg font-semibold md:text-xl" style={{ color: "rgba(255, 247, 236, 0.9)" }}>
                {locale === "zh" ? "快捷操作" : "Quick actions"}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => router.push(`/${locale}${action.href}`)}
                    className="flex min-h-[120px] flex-col items-start justify-between rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: "rgba(255, 247, 236, 0.02)",
                      border: "1px solid rgba(255, 247, 236, 0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 247, 236, 0.04)";
                      e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 247, 236, 0.02)";
                      e.currentTarget.style.borderColor = "rgba(255, 247, 236, 0.06)";
                    }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: "rgba(232, 194, 122, 0.1)" }}
                    >
                      <action.icon className="h-5 w-5" style={{ color: "#E8C27A" }} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: "rgba(255, 247, 236, 0.9)" }}>
                        {action.title}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
                        {action.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
