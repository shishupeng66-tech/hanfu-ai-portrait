"use client";

import { motion } from "framer-motion";
import { Check, Crown, Gem, Sparkles, Coins, Package, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PricingTable } from "@/app/[locale]/(marketing)/pricing/pricing-table";
import { useSession } from "@/lib/auth-client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

type TabValue = "membership" | "packs";

type CardColor = "blue" | "green" | "pink";

const colorStyles: Record<
  CardColor,
  {
    cardBg: string;
    borderColor: string;
    accent: string;
    iconColor: string;
    iconRing: string;
    checkBg: string;
    buttonBg: string;
    buttonText: string;
    buttonBorder: string;
    buttonHoverBg: string;
    buttonHoverText: string;
    shadow: string;
  }
> = {
  blue: {
    cardBg:
      "linear-gradient(160deg, #111114 0%, #141418 55%, #111114 100%)",
    borderColor: "rgba(255, 247, 236, 0.08)",
    accent: "#E8C27A",
    iconColor: "#E8C27A",
    iconRing: "rgba(232, 194, 122, 0.22)",
    checkBg: "#E8C27A",
    buttonBg: "rgba(232, 194, 122, 0.10)",
    buttonText: "#E8C27A",
    buttonBorder: "rgba(232, 194, 122, 0.16)",
    buttonHoverBg: "rgba(232, 194, 122, 0.16)",
    buttonHoverText: "#E8C27A",
    shadow:
      "0 18px 44px -16px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0,0,0,0.04)",
  },
  green: {
    cardBg:
      "linear-gradient(160deg, #111114 0%, #141418 55%, #111114 100%)",
    borderColor: "rgba(232, 194, 122, 0.12)",
    accent: "#E8C27A",
    iconColor: "#E8C27A",
    iconRing: "rgba(232, 194, 122, 0.24)",
    checkBg: "#E8C27A",
    buttonBg: "#E8C27A",
    buttonText: "#0B0B0D",
    buttonBorder: "transparent",
    buttonHoverBg: "#F2D38A",
    buttonHoverText: "#0B0B0D",
    shadow:
      "0 24px 60px -10px rgba(232, 194, 122, 0.15), 0 6px 16px rgba(0,0,0,0.06)",
  },
  pink: {
    cardBg:
      "linear-gradient(160deg, #111114 0%, #141418 55%, #111114 100%)",
    borderColor: "rgba(255, 247, 236, 0.08)",
    accent: "#E8C27A",
    iconColor: "#E8C27A",
    iconRing: "rgba(232, 194, 122, 0.22)",
    checkBg: "#E8C27A",
    buttonBg: "rgba(232, 194, 122, 0.10)",
    buttonText: "#E8C27A",
    buttonBorder: "rgba(232, 194, 122, 0.16)",
    buttonHoverBg: "rgba(232, 194, 122, 0.16)",
    buttonHoverText: "#E8C27A",
    shadow:
      "0 18px 44px -16px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0,0,0,0.04)",
  },
};

const text = {
  title: "rgba(255, 247, 236, 0.92)",
  desc: "rgba(255, 247, 236, 0.45)",
  price: "rgba(255, 247, 236, 0.92)",
  period: "rgba(255, 247, 236, 0.45)",
  feature: "rgba(255, 247, 236, 0.72)",
};

type IconComponent = typeof Sparkles;

type CardConfig = {
  key: string;
  color: CardColor;
  Icon: IconComponent;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  onClick: () => void;
  featured?: boolean;
  badgeText?: string;
  animKey: string;
  kind?: "subscription" | "one_time";
  planKey?: string;
};

function PriceCard({ config }: { config: CardConfig }) {
  const styles = colorStyles[config.color];
  const Icon = config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.012 }}
      className={cn(
        "relative flex min-h-[480px] flex-col overflow-hidden rounded-[1.75rem] p-5 transition-shadow duration-300",
        config.featured && "lg:-mt-3 lg:min-h-[510px]"
      )}
      style={{
        background: styles.cardBg,
        border: `1px solid ${styles.borderColor}`,
        boxShadow: styles.shadow,
      }}
    >
      {config.featured && config.badgeText && (
        <div
          className="absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            color: "#0B0B0D",
            background: styles.accent,
            boxShadow: "0 6px 14px rgba(232, 194, 122, 0.20)",
          }}
        >
          {config.badgeText}
        </div>
      )}

      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          background: "rgba(232, 194, 122, 0.10)",
          color: styles.iconColor,
          boxShadow: `inset 0 0 0 1px ${styles.iconRing}, 0 4px 14px rgba(0,0,0,0.06)`,
        }}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="mb-4">
        <h3
          className="text-[20px] md:text-[22px] font-bold tracking-tight"
          style={{ color: text.title }}
        >
          {config.name}
        </h3>
        <p
          className="mt-1.5 min-h-[36px] text-[13px] leading-[1.5] font-medium"
          style={{ color: text.desc }}
        >
          {config.description}
        </p>
      </div>

      <div className="mb-5 flex items-end gap-1">
        <motion.span
          key={config.animKey}
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="text-[34px] font-bold leading-none tracking-[-0.03em]"
          style={{ color: text.price }}
        >
          {config.price}
        </motion.span>
        {config.period && (
          <span
            className="pb-1.5 text-[13px] font-medium"
            style={{ color: text.period }}
          >
            {config.period}
          </span>
        )}
      </div>

      <ul className="mb-5 flex-1 space-y-2.5">
        {config.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <span
              className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
              style={{
                background: styles.checkBg,
                color: "#0B0B0D",
              }}
            >
              <Check
                className="h-3 w-3"
                strokeWidth={3}
                aria-hidden="true"
              />
            </span>
            <span
              className="text-[13.5px] font-medium leading-[1.5]"
              style={{ color: text.feature }}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={config.onClick}
        className="inline-flex h-10 w-full items-center justify-center rounded-full text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none"
        style={{
          color: styles.buttonText,
          background: styles.buttonBg,
          border: `1px solid ${styles.buttonBorder}`,
          boxShadow: config.featured
            ? "0 8px 24px rgba(47, 143, 92, 0.30)"
            : "0 4px 12px rgba(0,0,0,0.05)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.background = styles.buttonHoverBg;
          el.style.color = styles.buttonHoverText;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = styles.buttonBg;
          el.style.color = styles.buttonText;
        }}
      >
        {config.cta}
      </button>
    </motion.div>
  );
}

export function Pricing() {
  const t = useTranslations("pricing");
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isLoggedIn = !!session.data?.user;

  const initialTab: TabValue =
    searchParams.get("tab") === "packs" ? "packs" : "membership";
  const [active, setActive] = useState<TabValue>(initialTab);

  const tabs = [
    { name: t("tabs.membership"), value: "membership" as const },
    { name: t("tabs.packs"), value: "packs" as const },
  ];

  function handleTabChange(value: TabValue) {
    setActive(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`/${locale}/pricing?${params.toString()}`, {
      scroll: false,
    });
  }

  async function handleCheckout(kind: "subscription" | "one_time", key: string) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/${locale}/login?callbackUrl=${callbackUrl}`);
      return;
    }

    try {
      const res = await fetch("/api/payments/creem/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          kind, 
          key,
          cancelUrl: `/${locale}/pricing?tab=${kind === "one_time" ? "packs" : "membership"}`
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(t("checkoutError", { defaultValue: "跳转支付失败，请重试" }));
      }
    } catch {
      toast.error(t("checkoutError", { defaultValue: "跳转支付失败，请重试" }));
    }
  }

  // 会员方案 3 张卡：Plus 蓝、Pro 绿主推、Pro+ 粉
  const membershipCards: CardConfig[] = [
    {
      key: "membership-basic",
      color: "blue",
      Icon: Sparkles,
      name: t("membership.basic.name"),
      price: t("membership.basic.price"),
      period: t("membership.basic.period"),
      description: t("membership.basic.description"),
      features: t.raw("membership.basic.features") as string[],
      cta: t("membership.basic.cta"),
      onClick: () => handleCheckout("subscription", "plus_monthly"),
      animKey: "membership-basic",
      kind: "subscription",
      planKey: "plus_monthly",
    },
    {
      key: "membership-premium",
      color: "green",
      Icon: Crown,
      name: t("membership.premium.name"),
      price: t("membership.premium.price"),
      period: t("membership.premium.period"),
      description: t("membership.premium.description"),
      features: t.raw("membership.premium.features") as string[],
      cta: t("membership.premium.cta"),
      onClick: () => handleCheckout("subscription", "pro_monthly"),
      featured: true,
      badgeText: t("popular"),
      animKey: "membership-premium",
      kind: "subscription",
      planKey: "pro_monthly",
    },
    {
      key: "membership-proplus",
      color: "pink",
      Icon: Gem,
      name: t("membership.proPlus.name"),
      price: t("membership.proPlus.price"),
      period: t("membership.proPlus.period"),
      description: t("membership.proPlus.description"),
      features: t.raw("membership.proPlus.features") as string[],
      cta: t("membership.proPlus.cta"),
      onClick: () => handleCheckout("subscription", "proplus_yearly"),
      animKey: "membership-proplus",
      kind: "subscription",
      planKey: "proplus_yearly",
    },
  ];

  // 积分包 3 张卡：small 蓝、common 绿主推、large 粉。不显示 /月 /年
  const packCards: CardConfig[] = [
    {
      key: "pack-small",
      color: "blue",
      Icon: Coins,
      name: t("packs.small.name"),
      price: t("packs.small.price"),
      description: t("packs.small.description"),
      features: t.raw("packs.small.features") as string[],
      cta: t("packs.small.cta"),
      onClick: () => handleCheckout("one_time", "pack_small"),
      animKey: "pack-small",
      kind: "one_time",
      planKey: "pack_small",
    },
    {
      key: "pack-common",
      color: "green",
      Icon: Package,
      name: t("packs.common.name"),
      price: t("packs.common.price"),
      description: t("packs.common.description"),
      features: t.raw("packs.common.features") as string[],
      cta: t("packs.common.cta"),
      onClick: () => handleCheckout("one_time", "pack_popular"),
      featured: true,
      badgeText: t("recommended"),
      animKey: "pack-common",
      kind: "one_time",
      planKey: "pack_popular",
    },
    {
      key: "pack-large",
      color: "pink",
      Icon: ShoppingBag,
      name: t("packs.large.name"),
      price: t("packs.large.price"),
      description: t("packs.large.description"),
      features: t.raw("packs.large.features") as string[],
      cta: t("packs.large.cta"),
      onClick: () => handleCheckout("one_time", "pack_large"),
      animKey: "pack-large",
      kind: "one_time",
      planKey: "pack_large",
    },
  ];

  const activeCards = active === "membership" ? membershipCards : packCards;

  return (
    <div className="relative w-full">
      {/* Top tabs: Membership / Packs */}
      <div className="mx-auto mb-6 flex w-fit items-center justify-center overflow-hidden rounded-full border border-[rgba(255,247,236,0.08)] bg-[#111114] p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              active === tab.value ? "text-[#0B0B0D]" : "text-[rgba(255,247,236,0.72)]"
            )}
          >
            {active === tab.value && (
              <motion.span
                layoutId="pricing-billing-tab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                className="absolute inset-0 rounded-full"
                style={{ background: "#E8C27A" }}
              />
            )}
            <span className="relative z-10">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="relative z-20 mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {activeCards.map((card) => (
          <PriceCard key={card.key} config={card} />
        ))}
      </div>

      {/* Detailed comparison table follows the active tab */}
      <PricingTable mode={active} />
    </div>
  );
}
