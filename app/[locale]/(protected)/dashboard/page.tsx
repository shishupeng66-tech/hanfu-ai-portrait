"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from 'next-intl';
import { Button } from "@/components/button";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { getDefaultOneTimePack } from "@/lib/billing-display";
import { getSubscriptionPlanDisplayInfo } from "@/lib/account-settings";
import type { ClientUserProfile, UserProfileResponse } from "@/lib/client-api";
import { Sparkles, Coins, GalleryVerticalEnd, Layers, CreditCard, FolderOpen, ImageIcon } from "lucide-react";

type QuickActionKey = "quickActionsGenerate" | "quickActionsTemplates" | "quickActionsCredits" | "quickActionsWorks";
type QuickActionSubKey = "quickActionsGenerateSub" | "quickActionsTemplatesSub" | "quickActionsCreditsSub" | "quickActionsWorksSub";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const locale = useLocale();
  const t = useTranslations('dashboard');
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
        {/* Hero section */}
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
                  {t('paymentSuccess')}
                </p>
                <Link href={`/${locale}/credits`}>
                  <Button variant="outline" size="sm" className="ml-4">
                    {t('viewCredits')}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                {t('welcome')}
              </h1>
              <p className="text-lg" style={{ color: "rgba(255, 247, 236, 0.6)" }}>
                {t('subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm mb-1" style={{ color: "rgba(255, 247, 236, 0.5)" }}>
                  {t('credits')}
                </p>
                <p className="text-2xl font-bold" style={{ color: "#E8C27A" }}>
                  {credits}
                </p>
              </div>
              <div className="text-right pl-4" style={{ borderLeft: "1px solid rgba(255, 247, 236, 0.1)" }}>
                <p className="text-sm mb-1" style={{ color: "rgba(255, 247, 236, 0.5)" }}>
                  {t('currentPlan')}
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
                  {t('createHeroTitle')}
                </h2>
                <p className="text-base mb-0" style={{ color: "rgba(255, 247, 236, 0.65)" }}>
                  {t('createHeroSubtitle')}
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
                {t('startCreating')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* KPI */}
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
                  {t('generatedToday')}
                </span>
              </div>
              <p className="text-3xl font-bold" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                0
              </p>
              <p className="text-xs mt-2" style={{ color: "rgba(255, 247, 236, 0.4)" }}>
                {t('vsYesterday')} &mdash;
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
                  {t('totalWorks')}
                </span>
              </div>
              <p className="text-3xl font-bold" style={{ color: "rgba(255, 247, 236, 0.95)" }}>
                0
              </p>
              <p className="text-xs mt-2" style={{ color: "rgba(255, 247, 236, 0.4)" }}>
                {t('vsLastMonth')} &mdash;
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
                  {t('remainingCredits')}
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
                  {t('recharge')} &rarr;
                </button>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recent works */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: "rgba(255, 247, 236, 0.9)" }}>
              {t('recentWorks')}
            </h3>
            <Link
              href={`/${locale}/works`}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "#E8C27A" }}
            >
              {t('viewAll')} &rarr;
            </Link>
          </div>

          <div className="col-span-full flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: "rgba(255, 247, 236, 0.02)", border: "1px solid rgba(255, 247, 236, 0.06)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255, 247, 236, 0.04)" }}>
              <ImageIcon className="w-8 h-8" style={{ color: "rgba(255, 247, 236, 0.25)" }} />
            </div>
            <p className="text-base font-medium mb-1" style={{ color: "rgba(255, 247, 236, 0.55)" }}>
              {t('recentWorksEmpty')}
            </p>
            <p className="text-sm mb-4" style={{ color: "rgba(255, 247, 236, 0.35)" }}>
              {t('recentWorksEmptySub')}
            </p>
            <Button
              onClick={() => router.push(`/${locale}/generate`)}
              style={{
                background: "linear-gradient(135deg, #E8C27A 0%, #D4A84B 100%)",
                color: "#1a1508",
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('startCreating')}
            </Button>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-6" style={{ color: "rgba(255, 247, 236, 0.9)" }}>
            {t('quickActions')}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: "generate", titleKey: "quickActionsGenerate" as QuickActionKey, subKey: "quickActionsGenerateSub" as QuickActionSubKey, icon: Sparkles, href: "/generate" },
              { id: "templates", titleKey: "quickActionsTemplates" as QuickActionKey, subKey: "quickActionsTemplatesSub" as QuickActionSubKey, icon: Layers, href: "/templates" },
              { id: "credits", titleKey: "quickActionsCredits" as QuickActionKey, subKey: "quickActionsCreditsSub" as QuickActionSubKey, icon: CreditCard, href: "/credits" },
              { id: "works", titleKey: "quickActionsWorks" as QuickActionKey, subKey: "quickActionsWorksSub" as QuickActionSubKey, icon: FolderOpen, href: "/works" },
            ].map((action) => (
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
                  {t(action.titleKey)}
                </p>
                <p className="text-xs" style={{ color: "rgba(255, 247, 236, 0.45)" }}>
                  {t(action.subKey)}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}