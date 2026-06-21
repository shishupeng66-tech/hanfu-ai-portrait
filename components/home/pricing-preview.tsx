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
      color: "amber",
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
      color: "jade",
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
      color: "vermilion",
      highlighted: false,
    },
  ] as const;

  const colorStyles = {
    amber: {
      card: "from-[#2A1B10]/92 via-[#120D0A]/96 to-[#080706]/98",
      glow: "bg-[#E8C27A]/16",
      icon: "bg-[#E8C27A]/14 text-[#E8C27A] ring-[#E8C27A]/24",
      check: "text-[#E8C27A]",
      button: "bg-[#E8C27A]/12 text-[#FFF7EC] hover:bg-[#E8C27A]/20",
    },
    jade: {
      card: "from-[#0D221B]/94 via-[#0B1512]/96 to-[#070706]/98",
      glow: "bg-[#19A07E]/18",
      icon: "bg-[#19A07E]/14 text-[#59D7B7] ring-[#19A07E]/28",
      check: "text-[#59D7B7]",
      button:
        "bg-gradient-to-r from-[#0F6E56] to-[#19A07E] text-white shadow-[0_0_26px_rgba(25,160,126,0.24)] hover:shadow-[0_0_34px_rgba(25,160,126,0.36)]",
    },
    vermilion: {
      card: "from-[#2A1110]/94 via-[#140B0A]/96 to-[#080706]/98",
      glow: "bg-[#D85A30]/18",
      icon: "bg-[#D85A30]/14 text-[#FF9B73] ring-[#D85A30]/28",
      check: "text-[#FF9B73]",
      button: "bg-[#D85A30]/14 text-[#FFF7EC] hover:bg-[#D85A30]/24",
    },
  } as const;

  return (
    <section id="pricing" className="relative py-20 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-72 max-w-4xl rounded-full bg-[#E8C27A]/8 blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <Heading as="h2">{t("title")}</Heading>
          <Subheading>{t("subtitle")}</Subheading>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-7 max-w-6xl mx-auto"
        >
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const styles = colorStyles[plan.color];

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 36, rotate: i === 0 ? -1.5 : i === 2 ? 1.5 : 0 }}
                animate={
                  isInView
                    ? { opacity: 1, y: 0, rotate: i === 0 ? -1 : i === 2 ? 1 : 0 }
                    : { opacity: 0, y: 36, rotate: i === 0 ? -1.5 : i === 2 ? 1.5 : 0 }
                }
                transition={{ delay: i * 0.12, duration: 0.55, ease: "easeOut" }}
                whileHover={{ y: -8, rotate: 0, scale: 1.015 }}
                className={cn(
                  "relative flex min-h-[520px] flex-col overflow-hidden rounded-[2rem] border p-6 shadow-[0_28px_90px_rgba(0,0,0,0.32)] transition-colors duration-300",
                  "bg-gradient-to-br",
                  styles.card,
                  plan.highlighted
                    ? "border-[#E8C27A]/42 lg:-mt-4 lg:min-h-[552px]"
                    : "border-[#E8C27A]/14"
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full blur-3xl",
                    styles.glow
                  )}
                />
                <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#FFF7EC]/18 to-transparent" />

                {plan.highlighted && (
                  <div className="absolute right-5 top-5 rounded-full border border-[#E8C27A]/24 bg-[#E8C27A]/12 px-3 py-1 text-xs font-semibold text-[#E8C27A]">
                    {t("popular")}
                  </div>
                )}

                <div
                  className={cn(
                    "mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ring-1",
                    styles.icon
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-semibold tracking-tight text-[#FFF7EC]">
                    {plan.name}
                  </h3>
                  <p className="mt-2 min-h-[44px] text-sm leading-6 text-[#FFF7EC]/56">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-[-0.04em] text-[#FFF7EC]">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="pb-1.5 text-sm text-[#FFF7EC]/46">
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="mb-8 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFF7EC]/7",
                          styles.check
                        )}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-6 text-[#FFF7EC]/68">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <LocaleLink
                  href="/pricing"
                  className={cn(
                    "inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                    styles.button
                  )}
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
          className="text-center mt-10"
        >
          <LocaleLink
            href="/pricing"
            className="text-sm text-[#FFF7EC]/56 hover:text-[#FFF7EC] transition-colors underline underline-offset-4 decoration-[#E8C27A]/30"
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
