"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heading } from "@/components/heading";
import { Subheading } from "@/components/subheading";
import { cn } from "@/lib/utils";

function QuoteIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 21C3 21 7 17 7 13C7 10.5 5.5 8.5 3 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 21C11 21 15 17 15 13C15 10.5 13.5 8.5 11 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRating() {
  return (
    <div className="flex gap-0.5" aria-label="5 stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 1L8.545 5.13L13 5.545L9.73 8.545L10.695 13L7 10.635L3.305 13L4.27 8.545L1 5.545L5.455 5.13L7 1Z"
            fill="#E8C27A"
            stroke="#E8C27A"
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </div>
  );
}

export function HomeTestimonials() {
  const t = useTranslations("hanfuHome.testimonials");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const items = [
    {
      name: t("item1.name"),
      quote: t("item1.quote"),
      designation: t("item1.designation"),
    },
    {
      name: t("item2.name"),
      quote: t("item2.quote"),
      designation: t("item2.designation"),
    },
    {
      name: t("item3.name"),
      quote: t("item3.quote"),
      designation: t("item3.designation"),
    },
    {
      name: t("item4.name"),
      quote: t("item4.quote"),
      designation: t("item4.designation"),
    },
    {
      name: t("item5.name"),
      quote: t("item5.quote"),
      designation: t("item5.designation"),
    },
    {
      name: t("item6.name"),
      quote: t("item6.quote"),
      designation: t("item6.designation"),
    },
  ];

  return (
    <section className="relative py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <Heading as="h2">{t("title")}</Heading>
          <Subheading>{t("subtitle")}</Subheading>
        </div>

        {/* Testimonials Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={cn(
                "flex flex-col p-6 rounded-2xl border bg-card",
                "border-muted/50 hover:border-[#E8C27A]/30",
                "transition-all duration-300 hover:shadow-md"
              )}
            >
              {/* Quote icon */}
              <div className="text-[#E8C27A]/30 mb-3">
                <QuoteIcon />
              </div>

              {/* Quote text */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-5 flex-1">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                {/* Avatar placeholder */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8C27A]/20 to-[#E8C27A]/10 flex items-center justify-center text-xs font-semibold text-[#E8C27A] shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <StarRating />
                    <span className="text-xs text-muted-foreground truncate">
                      {item.designation}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
