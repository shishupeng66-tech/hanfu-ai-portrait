"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Coins, Crown, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Heading } from "@/components/heading";
import { Subheading } from "@/components/subheading";
import { LocaleLink } from "@/components/locale-link";
import { cn } from "@/lib/utils";

export function HomePricingPreview() {
  const t = useTranslations("hanfuHome.pricing");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const plans = [
    {
      name: t("free.name"),
      price: t("free.price"),
      period: t("free.period"),
      description: t("free.description"),
      features: [
        t("free.feature1"),
        t("free.feature2"),
        t("free.feature3"),
        t("free.feature4"),
      ],
      cta: t("free.cta"),
      href: "/generate",
      icon: Sparkles,
      color: "blue" as const,
      highlighted: false,
    },
    {
      name: t("pro.name"),
      price: t("pro.price"),
      period: t("pro.period"),
      description: t("pro.description"),
      features: [
        t("pro.feature1"),
        t("pro.feature2"),
        t("pro.feature3"),
        t("pro.feature4"),
      ],
      cta: t("pro.cta"),
      href: "/pricing?tab=membership",
      icon: Crown,
      color: "green" as const,
      highlighted: true,
    },
    {
      name: t("packs.name"),
      price: t("packs.price"),
      period: t("packs.period"),
      description: t("packs.description"),
      features: [
        t("packs.feature1"),
        t("packs.feature2"),
        t("packs.feature3"),
        t("packs.feature4"),
      ],
      cta: t("packs.cta"),
      href: "/pricing?tab=packs",
      icon: Coins,
      color: "pink" as const,
      highlighted: false,
    },
  ] as const;

  const colorStyles = {
    blue: {
      cardBg:
        "linear-gradient(160deg, #111114 0%, #141418 55%, #111114 100%)",
      borderColor: "rgba(255, 247, 236, 0.08)",
      accent: "#E8C27A",
      iconBg: "rgba(232, 194, 122, 0.10)",
      iconColor: "#E8C27A",
      iconRing: "rgba(232, 194, 122, 0.22)",
      checkColor: "#0B0B0D",
      checkBg: "#E8C27A",
      buttonBg: "rgba(232, 194, 122, 0.10)",
      buttonText: "#E8C27A",
      buttonBorder: "rgba(232, 194, 122, 0.16)",
      buttonHoverBg: "rgba(232, 194, 122, 0.16)",
      buttonHoverText: "#E8C27A",
    },
    green: {
      cardBg:
        "linear-gradient(160deg, #111114 0%, #141418 55%, #111114 100%)",
      borderColor: "rgba(232, 194, 122, 0.12)",
      accent: "#E8C27A",
      iconBg: "rgba(232, 194, 122, 0.10)",
      iconColor: "#E8C27A",
      iconRing: "rgba(232, 194, 122, 0.24)",
      checkColor: "#0B0B0D",
      checkBg: "#E8C27A",
      buttonBg: "#E8C27A",
      buttonText: "#0B0B0D",
      buttonBorder: "transparent",
      buttonHoverBg: "#F2D38A",
      buttonHoverText: "#0B0B0D",
    },
    pink: {
      cardBg:
        "linear-gradient(160deg, #111114 0%, #141418 55%, #111114 100%)",
      borderColor: "rgba(255, 247, 236, 0.08)",
      accent: "#E8C27A",
      iconBg: "rgba(232, 194, 122, 0.10)",
      iconColor: "#E8C27A",
      iconRing: "rgba(232, 194, 122, 0.22)",
      checkColor: "#0B0B0D",
      checkBg: "#E8C27A",
      buttonBg: "rgba(232, 194, 122, 0.10)",
      buttonText: "#E8C27A",
      buttonBorder: "rgba(232, 194, 122, 0.16)",
      buttonHoverBg: "rgba(232, 194, 122, 0.16)",
      buttonHoverText: "#E8C27A",
    },
  } as const;

  const text = {
    title: "rgba(255, 247, 236, 0.92)",
    desc: "rgba(255, 247, 236, 0.45)",
    price: "rgba(255, 247, 236, 0.92)",
    period: "rgba(255, 247, 236, 0.45)",
    feature: "rgba(255, 247, 236, 0.72)",
    footer: "rgba(255, 247, 236, 0.72)",
  };

  return (
    <section id="pricing" className="relative py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <Heading as="h2">{t("title")}</Heading>
          <Subheading>{t("subtitle")}</Subheading>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const styles = colorStyles[plan.color];

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 36 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }
                }
                transition={{
                  delay: i * 0.12,
                  duration: 0.55,
                  ease: "easeOut",
                }}
                whileHover={{ y: -6, scale: 1.012 }}
                className={cn(
                  "relative flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] p-7 transition-shadow duration-300",
                  plan.highlighted && "lg:-mt-4 lg:min-h-[600px]"
                )}
                style={{
                  background: styles.cardBg,
                  border: `1px solid ${styles.borderColor}`,
                  boxShadow: plan.highlighted
                    ? "0 24px 60px -10px rgba(47, 143, 92, 0.30), 0 6px 16px rgba(0,0,0,0.06)"
                    : "0 18px 44px -16px rgba(40, 40, 40, 0.18), 0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                {plan.highlighted && (
                  <div
                    className="absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      color: "#0B0B0D",
                      background: styles.accent,
                      boxShadow: "0 6px 14px rgba(232, 194, 122, 0.20)",
                    }}
                  >
                    {t("popular")}
                  </div>
                )}

                <div
                  className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: styles.iconBg,
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
                    {plan.name}
                  </h3>
                  <p
                    className="mt-2 min-h-[44px] text-[15px] leading-[1.55] font-medium"
                    style={{ color: text.desc }}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 flex items-end gap-1">
                  <span
                    className="text-[44px] font-bold leading-none tracking-[-0.03em]"
                    style={{ color: text.price }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="pb-2 text-[14px] font-medium"
                      style={{ color: text.period }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: styles.checkBg,
                          color: styles.checkColor,
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

                <LocaleLink
                  href={plan.href}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition-all duration-200 active:scale-[0.98]"
                  style={{
                    color: styles.buttonText,
                    background: styles.buttonBg,
                    border: `1px solid ${styles.buttonBorder}`,
                    boxShadow: plan.highlighted
                      ? "0 8px 24px rgba(47, 143, 92, 0.30)"
                      : "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = styles.buttonHoverBg;
                    el.style.color = styles.buttonHoverText;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = styles.buttonBg;
                    el.style.color = styles.buttonText;
                  }}
                >
                  {plan.cta}
                </LocaleLink>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <LocaleLink
            href="/pricing"
            className="text-[15px] font-medium underline underline-offset-4 decoration-[#E8C27A]/40 transition-colors hover:decoration-[#E8C27A]"
            style={{ color: text.footer }}
          >
            {t("footer")}
            <svg
              className="inline-block ml-1 w-3 h-3"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 3L7.5 6L4 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </LocaleLink>
        </motion.div>
      </div>
    </section>
  );
}
