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
import {
  ArrowRight,
  Coins,
  Crown,
  FolderOpen,
  GalleryVerticalEnd,
  Layers,
  Sparkles,
} from "lucide-react";

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
    icon: Coins,
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
  const displayUser = userProfile ?? user;
  const credits = userProfile?.credits ?? 0;
  const planDisplayInfo = getSubscriptionPlanDisplayInfo(
    userProfile?.subscription?.planKey,
    locale
  );
  const creatorName =
    displayUser?.name?.trim() ||
    displayUser?.email?.split("@")[0] ||
    (locale === "zh" ? "创作者" : "Creator");
  const summaryCards = [
    {
      key: "today",
      title: locale === "zh" ? "今日生成" : "Generated today",
      value: locale === "zh" ? "0 张" : "0",
      hint: locale === "zh" ? "较昨日 0%" : "0% vs yesterday",
      icon: Sparkles,
      accent: true,
      onClick: undefined,
    },
    {
      key: "works",
      title: locale === "zh" ? "总作品数" : "Total works",
      value: locale === "zh" ? `${MOCK_RECENT_WORKS.length} 张` : String(MOCK_RECENT_WORKS.length),
      hint: locale === "zh" ? "最近创作已保存" : "Recently saved",
      icon: GalleryVerticalEnd,
      accent: false,
      onClick: undefined,
    },
    {
      key: "credits",
      title: locale === "zh" ? "剩余积分" : "Credits left",
      value: locale === "zh" ? `${credits} 积分` : `${credits} credits`,
      hint: locale === "zh" ? "去充值" : "Recharge",
      icon: Coins,
      accent: true,
      onClick: startCheckout,
    },
    {
      key: "plan",
      title: locale === "zh" ? "当前套餐" : "Current plan",
      value: planDisplayInfo.displayName,
      hint:
        locale === "zh"
          ? userProfile?.subscription?.currentPeriodEnd
            ? `有效期至 ${new Date(userProfile.subscription.currentPeriodEnd).toLocaleDateString("zh-CN")}`
            : "当前已启用"
          : userProfile?.subscription?.currentPeriodEnd
            ? `Until ${new Date(userProfile.subscription.currentPeriodEnd).toLocaleDateString("en-US")}`
            : "Active now",
      icon: Crown,
      accent: false,
      onClick: undefined,
    },
  ];

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
    <div className="h-[calc(100vh-56px)] overflow-hidden" style={{ background: "#0B0B0D" }}>
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-3 px-4 py-3 md:gap-3 md:px-5 md:py-3 lg:px-6 lg:py-3">
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

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[rgba(232,194,122,0.22)] md:h-14 md:w-14">
                <Image
                  src={MOCK_RECENT_WORKS[0].image}
                  alt={locale === "zh" ? "创作者头像" : "Creator avatar"}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <h1
                  className="text-[1.85rem] font-bold leading-tight md:text-[2rem]"
                  style={{ color: "rgba(255, 247, 236, 0.95)" }}
                >
                  {locale === "zh" ? `欢迎回来，${creatorName}` : `Welcome back, ${creatorName}`}
                </h1>
                <p className="mt-1 text-sm md:text-[14px]" style={{ color: "rgba(255, 247, 236, 0.60)" }}>
                  {locale === "zh"
                    ? "今天又是创作美好的一天，让我们开始吧！"
                    : "Another beautiful day for creation, let's get started!"}
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255, 247, 236, 0.03)",
                  border: "1px solid rgba(255, 247, 236, 0.08)",
                }}
              >
                <p className="text-xs" style={{ color: "rgba(255, 247, 236, 0.42)" }}>
                  {locale === "zh" ? "剩余积分" : "Credits"}
                </p>
                <p className="mt-1 text-2xl font-bold leading-none" style={{ color: "#E8C27A" }}>
                  {credits}
                </p>
              </div>
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255, 247, 236, 0.03)",
                  border: "1px solid rgba(255, 247, 236, 0.08)",
                }}
              >
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255, 247, 236, 0.42)" }}>
                  <Crown className="h-3 w-3" />
                  <span>{locale === "zh" ? "当前套餐" : "Current plan"}</span>
                </div>
                <p className="mt-1 text-base font-semibold" style={{ color: "rgba(255, 247, 236, 0.92)" }}>
                  {planDisplayInfo.displayName}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.08 }}
          className="shrink-0"
        >
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={card.onClick}
                  className={`rounded-2xl px-4 py-3 text-left transition-colors ${card.onClick ? "hover:bg-[rgba(255,247,236,0.05)]" : ""}`}
                  style={{
                    background: "rgba(255, 247, 236, 0.03)",
                    border: "1px solid rgba(255, 247, 236, 0.08)",
                  }}
                >
                  <div className="mb-2.5 flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        background: card.accent ? "rgba(232, 194, 122, 0.12)" : "rgba(255, 247, 236, 0.06)",
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: card.accent ? "#E8C27A" : "rgba(255, 247, 236, 0.72)" }}
                      />
                    </div>
                    <span className="text-sm" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
                      {card.title}
                    </span>
                  </div>
                  <p
                    className={`font-bold leading-tight ${card.key === "plan" ? "text-[1.45rem]" : "text-[1.65rem]"}`}
                    style={{ color: card.accent ? "#E8C27A" : "rgba(255, 247, 236, 0.95)" }}
                  >
                    {card.value}
                  </p>
                  <p
                    className={`mt-2 text-xs ${card.onClick ? "inline-flex items-center gap-1 hover:underline" : ""}`}
                    style={{ color: card.accent ? "#D6B25E" : "rgba(255, 247, 236, 0.42)" }}
                  >
                    {card.hint}
                    {card.onClick && <ArrowRight className="h-3 w-3" />}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.14 }}
          className="shrink-0"
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(90deg, rgba(74,49,20,0.45) 0%, rgba(23,18,13,0.86) 54%, rgba(11,11,13,0.96) 100%)",
              border: "1px solid rgba(232, 194, 122, 0.12)",
            }}
          >
            <div className="absolute inset-y-0 right-0 hidden w-[28%] lg:block">
              <div className="relative h-full w-full">
                <Image
                  src={MOCK_RECENT_WORKS[1].image}
                  alt={locale === "zh" ? "汉服创作横幅" : "Creator banner"}
                  fill
                  sizes="24vw"
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#15110d] via-transparent to-transparent" />
              </div>
            </div>

            <div className="relative z-10 flex min-h-[124px] items-center justify-between gap-6 px-5 py-4 md:min-h-[132px] md:px-6">
              <div className="max-w-[64%]">
                <h2 className="mb-2 text-[1.75rem] font-bold leading-tight md:text-[1.9rem]" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                  {locale === "zh" ? "创作精美的汉服写真" : "Create stunning Hanfu portraits"}
                </h2>
                <p className="text-sm md:text-[14px]" style={{ color: "rgba(255, 247, 236, 0.64)" }}>
                  {locale === "zh"
                    ? "上传照片，选择模板，AI 帮你生成专属汉服大片"
                    : "Upload a portrait, choose a template, and create your next AI Hanfu artwork."}
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => router.push(`/${locale}/generate`)}
                className="h-12 shrink-0 px-6 text-sm font-semibold md:px-7 md:text-base"
                style={{
                  background: "linear-gradient(135deg, #E8C27A 0%, #D4A84B 100%)",
                  color: "#1a1508",
                  boxShadow: "0 8px 24px rgba(232, 194, 122, 0.20)",
                }}
              >
                {locale === "zh" ? "开始创作" : "Start creating"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.22 }}
          className="min-h-0 flex-1"
        >
          <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_110px] gap-4">
            <section
              className="rounded-2xl px-4 py-4 md:px-5"
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

              <div className="grid grid-cols-4 gap-4">
                {MOCK_RECENT_WORKS.map((work) => (
                  <button
                    key={work.id}
                    type="button"
                    onClick={() => router.push(`/${locale}/gallery`)}
                    className="group min-w-0 text-left"
                  >
                    <div className="relative aspect-[1.55/1] overflow-hidden rounded-xl border border-[rgba(255,247,236,0.08)] bg-[rgba(255,247,236,0.02)]">
                      <Image
                        src={work.image}
                        alt={work.title}
                        fill
                        sizes="(max-width: 1024px) 25vw, 16vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                      <div className="absolute inset-x-0 top-0 p-2">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium"
                          style={{ background: "rgba(34, 197, 94, 0.92)", color: "#fff" }}
                        >
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />
                          {locale === "zh" ? "已完成" : "Completed"}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2.5">
                      <p className="truncate text-sm font-medium" style={{ color: "rgba(255, 247, 236, 0.96)" }}>
                        {work.title}
                      </p>
                      <p className="mt-1 text-[11px]" style={{ color: "rgba(255, 247, 236, 0.62)" }}>
                        {work.createdAt}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section
              className="rounded-2xl px-4 py-3 md:px-5"
              style={{
                background: "rgba(255, 247, 236, 0.02)",
                border: "1px solid rgba(255, 247, 236, 0.06)",
              }}
            >
              <h3 className="mb-3 text-lg font-semibold" style={{ color: "rgba(255, 247, 236, 0.9)" }}>
                {locale === "zh" ? "快捷操作" : "Quick actions"}
              </h3>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => router.push(`/${locale}${action.href}`)}
                    className="flex h-[72px] items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 hover:scale-[1.01]"
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
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "rgba(232, 194, 122, 0.1)" }}
                    >
                      <action.icon className="h-5 w-5" style={{ color: "#E8C27A" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold" style={{ color: "rgba(255, 247, 236, 0.9)" }}>
                        {action.title}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
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
