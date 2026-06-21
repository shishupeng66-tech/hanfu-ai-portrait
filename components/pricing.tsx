"use client";

import { motion } from "framer-motion";
import { Check, Crown, Gem, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getDefaultOneTimePack,
  getSubscriptionPlanDisplays,
} from "@/lib/billing-display";

type BillingTab = "monthly" | "yearly";

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

type CardConfig = {
  key: string;
  color: CardColor;
  Icon: typeof Sparkles;
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
  const [active, setActive] = useState<BillingTab>("monthly");
  const t = useTranslations("pricing");

  const subscriptionPlans = getSubscriptionPlanDisplays();
  const defaultPack = getDefaultOneTimePack();

  const tabs = [
    { name: t("billing.monthly"), value: "monthly" },
    { name: t("billing.yearly"), value: "yearly" },
  ] satisfies Array<{ name: string; value: BillingTab }>;

  // Temporary: 支付暂未上线，所有按钮统一弹 toast 提示。
  // 真实 checkout 逻辑（/api/payments/creem/checkout + Creem 跳转）保留在 route 和 lib 里，
  // 等 Creem 后台准备好新一批产品后再接回来。
  const handlePurchaseClick = () => {
    toast.info(t("comingSoon", { defaultValue: "支付功能即将上线" }));
  };

  // 给三张卡按位置分配颜色和图标：第一个订阅 → 蓝，第二个订阅（featured）→ 绿，点数包 → 粉
  const subscriptionCards: CardConfig[] = subscriptionPlans.map((plan, idx) => {
    const currentPrice =
      active === "monthly"
        ? plan.displayMonthlyPrice
        : plan.displayYearlyPrice;
    const currentCredits =
      active === "monthly"
        ? plan.displayMonthlyCredits
        : plan.displayYearlyCredits;
    const creditSummary =
      active === "monthly"
        ? t("details.monthlyCredits", { credits: currentCredits })
        : t("details.yearlyCredits", { credits: currentCredits });

    const planFeatures = (t.raw(`tiers.${plan.id}.features`) as string[]) ?? [];
    const allFeatures = [creditSummary, ...planFeatures];

    const color: CardColor = plan.featured ? "green" : idx === 0 ? "blue" : "pink";
    const Icon = plan.featured ? Crown : idx === 0 ? Sparkles : Gem;

    return {
      key: plan.id,
      color,
      Icon,
      name: t(`tiers.${plan.id}.name`),
      price: currentPrice,
      period:
        active === "monthly"
          ? t("billing.perMonth", { defaultValue: "" })
          : t("billing.perYear", { defaultValue: "" }),
      description: t(`tiers.${plan.id}.description`),
      features: allFeatures,
      cta: t(`tiers.${plan.id}.cta`),
      onClick: handlePurchaseClick,
      featured: plan.featured,
      badgeText: plan.featured ? t("popular", { defaultValue: "最受欢迎" }) : undefined,
      animKey: `${plan.id}-${active}`,
    };
  });

  const creditsCard: CardConfig = {
    key: "credits-pack",
    color: "pink",
    Icon: Gem,
    name: t("tiers.credits.name"),
    price: defaultPack.displayPrice,
    description: t("tiers.credits.description"),
    features: [
      t("details.oneTimeCredits", { credits: defaultPack.displayCredits }),
      ...((t.raw("tiers.credits.features") as string[]) ?? []),
    ],
    cta: t("tiers.credits.cta", { credits: defaultPack.displayCredits }),
    onClick: handlePurchaseClick,
    animKey: `credits-pack-${defaultPack.key}`,
  };

  const allCards: CardConfig[] = [...subscriptionCards, creditsCard];

  return (
    <div className="relative w-full">
      {/* Billing tabs */}
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
        {allCards.map((card) => (
          <PriceCard key={card.key} config={card} />
        ))}
      </div>
    </div>
  );
}
