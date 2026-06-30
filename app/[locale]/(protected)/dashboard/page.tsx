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
    <div className="min-h-screen" style={{ background: "#0B0B0D" }}>
      <div className="p-8 max-w-6xl mx-auto">
        {/* 第一屏 - 创作主入口 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5 }}
          className="mb-12"
        >
          {paymentSuccess && (
            <div className="mb-6 p-4 bg-[rgba(232,194,122,0.10)] border border-[rgba(232,194,122,0.16)] rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-[#E8C27A] font-medium">
                  {locale === 'zh' ? '充值成功！' : 'Payment successful!'}
                </p>
                <Link href={`/${locale}/credits`}>
                  <Button variant="outline" size="sm" className="ml-4">
                    {locale === 'zh' ? '查看积分' : 'View credits'}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                {locale === 'zh' ? '欢迎回来，创作者' : 'Welcome back, Creator'}
              </h1>
              <p className="text-lg" style={{ color: "rgba(255, 247, 236, 0.6)" }}>
                {locale === 'zh' ? '今天又是创作美好的一天，让我们开始吧！' : 'Another beautiful day for creation, let\'s get started!'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm mb-1" style={{ color: "rgba(255, 247, 236, 0.5)" }}>
                  {locale === 'zh' ? '剩余积分' : 'Credits'}
                </p>
                <p className="text-2xl font-bold" style={{ color: "#E8C27A" }}>
                  {credits}
                </p>
              </div>
              <div className="text-right pl-4" style={{ borderLeft: "1px solid rgba(255, 247, 236, 0.1)" }}>
                <p className="text-sm mb-1" style={{ color: "rgba(255, 247, 236, 0.5)" }}>
                  {locale === 'zh' ? '当前套餐' : 'Current plan'}
                </p>
                <p className="text-base font-semibold text-foreground">
                  {planDisplayInfo.displayName}
                </p>
              </div>
            </div>
          </div>

          <div 
            className="relative overflow-hidden rounded-2xl p-8 md:p-12"
            style={{ 
              background: "linear-gradient(135deg, rgba(232, 194, 122, 0.08) 0%, rgba(232, 194, 122, 0.02) 100%)",
              border: "1px solid rgba(232, 194, 122, 0.15)",
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                  {locale === 'zh' ? '创作精美的汉服写真' : 'Create stunning Hanfu portraits'}
                </h2>
                <p className="text-base mb-0" style={{ color: "rgba(255, 247, 236, 0.65)" }}>
                  {locale === 'zh' ? '上传照片，选择模板，AI 帮你生成专属汉服大片' : 'Upload photos, choose templates, and let AI create exclusive Hanfu masterpieces for you'}
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => router.push(`/${locale}/generate`)}
                className="min-w-[200px] text-base font-semibold py-6 px-8"
                style={{
                  background: "linear-gradient(135deg, #E8C27A 0%, #D4A84B 100%)",
                  color: "#1a1508",
                  boxShadow: "0 8px 32px rgba(232, 194, 122, 0.25)",
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {locale === 'zh' ? '开始生成汉服写真' : 'Start creating Hanfu portraits'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 第二屏 - 核心数据 KPI */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="rounded-xl p-6"
              style={{ 
                background: "rgba(255, 247, 236, 0.03)",
                border: "1px solid rgba(255, 247, 236, 0.08)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(232, 194, 122, 0.12)" }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: "#E8C27A" }} />
                </div>
                <span className="text-sm" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
                  {locale === 'zh' ? '今日生成' : 'Generated today'}
                </span>
              </div>
              <p className="text-3xl font-bold" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                0
              </p>
              <p className="text-xs mt-2" style={{ color: "rgba(255, 247, 236, 0.4)" }}>
                {locale === 'zh' ? '较昨日 —' : 'vs yesterday —'}
              </p>
            </div>

            <div 
              className="rounded-xl p-6"
              style={{ 
                background: "rgba(255, 247, 236, 0.03)",
                border: "1px solid rgba(255, 247, 236, 0.08)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255, 247, 236, 0.06)" }}
                >
                  <GalleryVerticalEnd className="w-5 h-5" style={{ color: "rgba(255, 247, 236, 0.7)" }} />
                </div>
                <span className="text-sm" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
                  {locale === 'zh' ? '总作品数' : 'Total works'}
                </span>
              </div>
              <p className="text-3xl font-bold" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                0
              </p>
              <p className="text-xs mt-2" style={{ color: "rgba(255, 247, 236, 0.4)" }}>
                {locale === 'zh' ? '较上月 —' : 'vs last month —'}
              </p>
            </div>

            <div 
              className="rounded-xl p-6"
              style={{ 
                background: "rgba(255, 247, 236, 0.03)",
                border: "1px solid rgba(255, 247, 236, 0.08)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(232, 194, 122, 0.12)" }}
                >
                  <Coins className="w-5 h-5" style={{ color: "#E8C27A" }} />
                </div>
                <span className="text-sm" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
                  {locale === 'zh' ? '剩余积分' : 'Remaining credits'}
                </span>
              </div>
              <p className="text-3xl font-bold" style={{ color: "#E8C27A" }}>
                {credits}
              </p>
              <p className="text-xs mt-2" style={{ color: "rgba(255, 247, 236, 0.4)" }}>
                <button 
                  onClick={startCheckout}
                  className="hover:underline"
                  style={{ color: "#E8C27A" }}
                >
                  {locale === 'zh' ? '去充值 →' : 'Recharge →'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>

        {/* 第三屏 - 最近作品 */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: "rgba(255, 247, 236, 0.9)" }}>
              {locale === 'zh' ? '最近作品' : 'Recent works'}
            </h3>
            <Link 
              href={`/${locale}/gallery`}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "#E8C27A" }}
            >
              {locale === 'zh' ? '查看全部 →' : 'View all →'}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_RECENT_WORKS.map((work) => (
              <div
                key={work.id}
                className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                style={{ border: "1px solid rgba(255, 247, 236, 0.08)" }}
              >
                <div className="aspect-[3/4] relative">
                  <Image
                    src={work.image}
                    alt={work.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute top-3 left-3">
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: "rgba(34, 197, 94, 0.9)", color: "white" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
                      {locale === 'zh' ? '已完成' : 'Completed'}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm font-medium text-white truncate">
                      {work.title}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      {work.createdAt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 第四屏 - 快捷入口 */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-6" style={{ color: "rgba(255, 247, 236, 0.9)" }}>
            {locale === 'zh' ? '快捷操作' : 'Quick actions'}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => router.push(`/${locale}${action.href}`)}
                className="flex flex-col items-center justify-center p-6 rounded-xl text-center transition-all duration-200 hover:scale-[1.02]"
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
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(232, 194, 122, 0.1)" }}
                >
                  <action.icon className="w-6 h-6" style={{ color: "#E8C27A" }} />
                </div>
                <p className="font-semibold mb-1" style={{ color: "rgba(255, 247, 236, 0.9)" }}>
                  {action.title}
                </p>
                <p className="text-xs" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
                  {action.subtitle}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
