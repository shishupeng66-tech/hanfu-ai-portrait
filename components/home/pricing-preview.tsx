"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heading } from "@/components/heading";
import { Subheading } from "@/components/subheading";
import { LocaleLink } from "@/components/locale-link";
import { cn } from "@/lib/utils";

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11.667 3.5L5.25 9.917L2.333 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      features: [t("free.feature1"), t("free.feature2"), t("free.feature3"), t("free.feature4")],
      cta: t("free.cta"),
      highlighted: false,
      accentColor: "text-[#EF9F27]",
      bgAccent: "bg-[#EF9F27]/5",
      borderAccent: "border-[#EF9F27]/20",
      buttonStyle: "bg-muted hover:bg-muted/80 text-foreground",
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
      highlighted: true,
      accentColor: "text-[#0F6E56]",
      bgAccent: "bg-[#0F6E56]/5",
      borderAccent: "border-[#0F6E56]",
      buttonStyle:
        "bg-gradient-to-r from-[#0F6E56] to-[#19A07E] text-white shadow-lg hover:shadow-xl",
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
      highlighted: false,
      accentColor: "text-[#D85A30]",
      bgAccent: "bg-[#D85A30]/5",
      borderAccent: "border-[#D85A30]/20",
      buttonStyle: "bg-muted hover:bg-muted/80 text-foreground",
    },
  ];

  return (
    <section id="pricing" className="relative py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <Heading as="h2">{t("title")}</Heading>
          <Subheading>{t("subtitle")}</Subheading>
        </div>

        {/* Pricing Cards */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={cn(
                "relative flex flex-col p-6 md:p-8 rounded-2xl border bg-card transition-all duration-300",
                plan.highlighted
                  ? cn(
                      "border-[#0F6E56] shadow-lg shadow-[#0F6E56]/10 scale-[1.02] md:scale-105",
                      plan.bgAccent
                    )
                  : plan.borderAccent,
                "hover:shadow-lg"
              )}
            >
              {/* Highlight badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F6E56] text-white text-xs font-medium px-3 py-1 rounded-full">
                  {t("popular")}
                </div>
              )}

              {/* Plan Name */}
              <h3
                className={cn(
                  "text-lg font-semibold mb-1",
                  plan.highlighted ? "text-[#0F6E56]" : "text-foreground"
                )}
              >
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 shrink-0",
                        plan.highlighted
                          ? "text-[#0F6E56]"
                          : "text-[#EF9F27]"
                      )}
                    >
                      <CheckIcon />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <LocaleLink
                href="/pricing"
                className={cn(
                  "inline-flex items-center justify-center w-full py-2.5 rounded-full text-sm font-medium transition-all active:scale-95",
                  plan.buttonStyle
                )}
              >
                {plan.cta}
              </LocaleLink>
            </motion.div>
          ))}
        </div>

        {/* Footer link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <LocaleLink
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/30"
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
