"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Crown, Gem, Sparkles } from "lucide-react";
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
      icon: Sparkles,
      color: "blue",
      highlighted: false,
    },
    {
      name: t("starter.name"),
      price: t("starter.price"),
      period: t("starter.period"),
      description: t("starter.description"),
      features: [
        t("starter.feature1"),
        t("starter.feature2"),
        t("starter.feature3"),
        t("starter.feature4"),
        t("starter.feature5"),
      ],
      cta: t("starter.cta"),
      icon: Crown,
      color: "green",
      highlighted: true,
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
        t("pro.feature5"),
        t("pro.feature6"),
      ],
      cta: t("pro.cta"),
      icon: Gem,
      color: "pink",
      highlighted: false,
    },
  ] as const;

  // 三套浅色清新配色（白天模式）
  const colorStyles = {
    blue: {
      cardBg:
        "linear-gradient(160deg, #F0F7FF 0%, #E2EEFF 55%, #D6E6FE 100%)",
      borderColor: "rgba(61, 123, 200, 0.18)",
      accent: "#3D7BC8", // 主色
      iconBg: "#FFFFFF",
      iconColor: "#3D7BC8",
      iconRing: "rgba(61, 123, 200, 0.22)",
      checkColor: "#FFFFFF",
      checkBg: "#3D7BC8",
      buttonBg: "#FFFFFF",
      buttonText: "#3D7BC8",
      buttonBorder: "rgba(61, 123, 200, 0.32)",
      buttonHoverBg: "#3D7BC8",
      buttonHoverText: "#FFFFFF",
    },
    green: {
      cardBg:
        "linear-gradient(160deg, #EEFAF1 0%, #DEF4E5 55%, #CCEDD8 100%)",
      borderColor: "rgba(47, 143, 92, 0.22)",
      accent: "#2F8F5C",
      iconBg: "#FFFFFF",
      iconColor: "#2F8F5C",
      iconRing: "rgba(47, 143, 92, 0.24)",
      checkColor: "#FFFFFF",
      checkBg: "#2F8F5C",
      buttonBg: "#2F8F5C",
      buttonText: "#FFFFFF",
      buttonBorder: "transparent",
      buttonHoverBg: "#247048",
      buttonHoverText: "#FFFFFF",
    },
    pink: {
      cardBg:
        "linear-gradient(160deg, #FFF1F3 0%, #FCE3E7 55%, #F8D2D9 100%)",
      borderColor: "rgba(196, 90, 110, 0.20)",
      accent: "#C45A6E",
      iconBg: "#FFFFFF",
      iconColor: "#C45A6E",
      iconRing: "rgba(196, 90, 110, 0.22)",
      checkColor: "#FFFFFF",
      checkBg: "#C45A6E",
      buttonBg: "#FFFFFF",
      buttonText: "#C45A6E",
      buttonBorder: "rgba(196, 90, 110, 0.32)",
      buttonHoverBg: "#C45A6E",
      buttonHoverText: "#FFFFFF",
    },
  } as const;

  // 白天模式文字色：深灰为主，保证清晰
  const text = {
    title: "#1F1F1F",
    desc: "#5A5A5A",
    price: "#1F1F1F",
    period: "#6B6B6B",
    feature: "#3A3A3A",
    footer: "rgba(40, 40, 40, 0.72)",
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
                {/* Popular badge */}
                {plan.highlighted && (
                  <div
                    className="absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      color: "#FFFFFF",
                      background: styles.accent,
                      boxShadow: "0 6px 14px rgba(47, 143, 92, 0.30)",
                    }}
                  >
                    {t("popular")}
                  </div>
                )}

                {/* Icon */}
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

                {/* Plan name + desc */}
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

                {/* Price */}
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

                {/* Features */}
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

                {/* CTA */}
                <LocaleLink
                  href="/pricing"
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
            className="text-[15px] font-medium underline underline-offset-4 decoration-[#2F8F5C]/40 transition-colors hover:decoration-[#2F8F5C]"
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
