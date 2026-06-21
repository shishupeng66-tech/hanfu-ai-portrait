"use client";

import { motion } from "framer-motion";
import { Check, Crown, Gem, Sparkles, Coins, Package, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
      "linear-gradient(160deg, #F0F7FF 0%, #E2EEFF 55%, #D6E6FE 100%)",
    borderColor: "rgba(61, 123, 200, 0.18)",
    accent: "#3D7BC8",
    iconColor: "#3D7BC8",
    iconRing: "rgba(61, 123, 200, 0.22)",
    checkBg: "#3D7BC8",
    buttonBg: "#FFFFFF",
    buttonText: "#3D7BC8",
    buttonBorder: "rgba(61, 123, 200, 0.32)",
    buttonHoverBg: "#3D7BC8",
    buttonHoverText: "#FFFFFF",
    shadow:
      "0 18px 44px -16px rgba(40, 40, 40, 0.18), 0 2px 6px rgba(0,0,0,0.04)",
  },
  green: {
    cardBg:
      "linear-gradient(160deg, #EEFAF1 0%, #DEF4E5 55%, #CCEDD8 100%)",
    borderColor: "rgba(47, 143, 92, 0.22)",
    accent: "#2F8F5C",
    iconColor: "#2F8F5C",
    iconRing: "rgba(47, 143, 92, 0.24)",
    checkBg: "#2F8F5C",
    buttonBg: "#2F8F5C",
    buttonText: "#FFFFFF",
    buttonBorder: "transparent",
    buttonHoverBg: "#247048",
    buttonHoverText: "#FFFFFF",
    shadow:
      "0 24px 60px -10px rgba(47, 143, 92, 0.30), 0 6px 16px rgba(0,0,0,0.06)",
  },
  pink: {
    cardBg:
      "linear-gradient(160deg, #FFF1F3 0%, #FCE3E7 55%, #F8D2D9 100%)",
    borderColor: "rgba(196, 90, 110, 0.20)",
    accent: "#C45A6E",
    iconColor: "#C45A6E",
    iconRing: "rgba(196, 90, 110, 0.22)",
    checkBg: "#C45A6E",
    buttonBg: "#FFFFFF",
    buttonText: "#C45A6E",
    buttonBorder: "rgba(196, 90, 110, 0.32)",
    buttonHoverBg: "#C45A6E",
    buttonHoverText: "#FFFFFF",
    shadow:
      "0 18px 44px -16px rgba(40, 40, 40, 0.18), 0 2px 6px rgba(0,0,0,0.04)",
  },
};

const text = {
  title: "#1F1F1F",
  desc: "#5A5A5A",
  price: "#1F1F1F",
  period: "#6B6B6B",
  feature: "#3A3A3A",
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
        "relative flex min-h-[600px] flex-col overflow-hidden rounded-[2rem] p-7 transition-shadow duration-300",
        config.featured && "lg:-mt-4 lg:min-h-[640px]"
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
            color: "#FFFFFF",
            background: styles.accent,
            boxShadow: "0 6px 14px rgba(47, 143, 92, 0.30)",
          }}
        >
          {config.badgeText}
        </div>
      )}

      <div
        className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "#FFFFFF",
          color: styles.iconColor,
          boxShadow: `inset 0 0 0 1px ${styles.iconRing}, 0 4px 14px rgba(0,0,0,0.06)`,
        }}
      >
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>

      <div className="mb-6">
        <h3
          className="text-[24px] md:text-[26px] font-bold tracking-tight"
          style={{ color: text.title }}
        >
          {config.name}
        </h3>
        <p
          className="mt-2 min-h-[44px] text-[15px] leading-[1.55] font-medium"
          style={{ color: text.desc }}
        >
          {config.description}
        </p>
      </div>

      <div className="mb-8 flex items-end gap-1">
        <motion.span
          key={config.animKey}
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="text-[44px] font-bold leading-none tracking-[-0.03em]"
          style={{ color: text.price }}
        >
          {config.price}
        </motion.span>
        {config.period && (
          <span
            className="pb-2 text-[14px] font-medium"
            style={{ color: text.period }}
          >
            {config.period}
          </span>
        )}
      </div>

      <ul className="mb-8 flex-1 space-y-3.5">
        {config.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{
                background: styles.checkBg,
                color: "#FFFFFF",
              }}
            >
              <Check
                className="h-3.5 w-3.5"
                strokeWidth={3}
                aria-hidden="true"
              />
            </span>
            <span
              className="text-[15px] font-medium leading-[1.55]"
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
        className="inline-flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none"
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
  const [active, setActive] = useState<TabValue>("membership");
  const t = useTranslations("pricing");

  const tabs = [
    { name: t("tabs.membership"), value: "membership" as const },
    { name: t("tabs.packs"), value: "packs" as const },
  ];

  // 支付暂未上线，所有按钮统一弹 toast。
  // 真实 Creem checkout 逻辑保留在 /api/payments/creem/* 和 lib/payments/creem.ts，
  // 等后台准备好新一批产品（6 个）后再接回来。
  const handlePurchaseClick = () => {
    toast.info(t("comingSoon", { defaultValue: "支付功能即将上线" }));
  };

  // 会员方案 3 张卡：basic 蓝、premium 绿主推、proPlus 粉
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
      onClick: handlePurchaseClick,
      animKey: "membership-basic",
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
      onClick: handlePurchaseClick,
      featured: true,
      badgeText: t("popular"),
      animKey: "membership-premium",
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
      onClick: handlePurchaseClick,
      animKey: "membership-proplus",
    },
  ];

  // 点数包 3 张卡：small 蓝、common 绿主推、large 粉。不显示 /月 /年
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
      onClick: handlePurchaseClick,
      animKey: "pack-small",
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
      onClick: handlePurchaseClick,
      featured: true,
      badgeText: t("recommended"),
      animKey: "pack-common",
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
      onClick: handlePurchaseClick,
      animKey: "pack-large",
    },
  ];

  const activeCards = active === "membership" ? membershipCards : packCards;

  return (
    <div className="relative w-full">
      {/* Top tabs: Membership / Packs */}
      <div className="mx-auto mb-10 flex w-fit items-center justify-center overflow-hidden rounded-full border border-black/5 bg-white p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActive(tab.value)}
            className={cn(
              "relative rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              active === tab.value ? "text-white" : "text-[#3A3A3A]"
            )}
          >
            {active === tab.value && (
              <motion.span
                layoutId="pricing-billing-tab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                className="absolute inset-0 rounded-full"
                style={{ background: "#2F8F5C" }}
              />
            )}
            <span className="relative z-10">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="relative z-20 mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {activeCards.map((card) => (
          <PriceCard key={card.key} config={card} />
        ))}
      </div>
    </div>
  );
}
