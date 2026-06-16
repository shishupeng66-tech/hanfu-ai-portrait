"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heading } from "@/components/heading";
import { Subheading } from "@/components/subheading";
import { cn } from "@/lib/utils";

const dynastyColors = [
  {
    border: "border-[#D85A30]/20 dark:border-[#D85A30]/30",
    bg: "bg-[#D85A30]/5",
    accent: "text-[#D85A30]",
    hoverBorder: "hover:border-[#D85A30]/40",
  },
  {
    border: "border-[#0F6E56]/20 dark:border-[#0F6E56]/30",
    bg: "bg-[#0F6E56]/5",
    accent: "text-[#0F6E56]",
    hoverBorder: "hover:border-[#0F6E56]/40",
  },
  {
    border: "border-[#EF9F27]/20 dark:border-[#EF9F27]/30",
    bg: "bg-[#EF9F27]/5",
    accent: "text-[#EF9F27]",
    hoverBorder: "hover:border-[#EF9F27]/40",
  },
  {
    border: "border-[#D85A30]/20 dark:border-[#D85A30]/30",
    bg: "bg-[#D85A30]/5",
    accent: "text-[#D85A30]",
    hoverBorder: "hover:border-[#D85A30]/40",
  },
];

function DecorativeFrame({ colorClass }: { colorClass: string }) {
  return (
    <svg
      viewBox="0 0 280 320"
      className="absolute inset-0 w-full h-full pointer-events-none"
      fill="none"
      aria-hidden="true"
    >
      {/* Outer border */}
      <rect
        x="8"
        y="8"
        width="264"
        height="304"
        rx="16"
        stroke="currentColor"
        strokeWidth="1"
        className={colorClass}
        opacity="0.4"
      />
      {/* Inner border */}
      <rect
        x="16"
        y="16"
        width="248"
        height="288"
        rx="10"
        stroke="currentColor"
        strokeWidth="0.5"
        className={colorClass}
        opacity="0.2"
      />
      {/* Corner ornaments */}
      {[
        [16, 16],
        [264, 16],
        [16, 304],
        [264, 304],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="currentColor" className={colorClass} opacity="0.3" />
      ))}
    </svg>
  );
}

function DynastySketch({ name }: { name: string }) {
  // Abstract hanfu silhouette representation using SVG
  return (
    <div className="relative w-full aspect-[3/4] max-w-[200px] mx-auto mb-6 overflow-hidden rounded-xl bg-gradient-to-b from-background to-muted/20">
      <svg
        viewBox="0 0 200 280"
        className="w-full h-full"
        fill="none"
        role="img"
        aria-label={name}
      >
        {/* Abstract hanfu silhouette */}
        <ellipse cx="100" cy="50" rx="30" ry="35" className="fill-muted/30" />
        <path
          d="M20 80C20 80 30 200 100 240C170 200 180 80 180 80"
          className="fill-muted/20"
        />
        {/* Sleeve lines */}
        <path
          d="M20 100C5 120 -5 180 15 200"
          stroke="currentColor"
          className="text-muted/30"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M180 100C195 120 205 180 185 200"
          stroke="currentColor"
          className="text-muted/30"
          strokeWidth="0.5"
          fill="none"
        />
        {/* Collar */}
        <path
          d="M85 80L100 130L115 80"
          stroke="currentColor"
          className="text-muted/30"
          strokeWidth="0.5"
          fill="none"
        />
        {/* Decorative belt/waist */}
        <rect
          x="60"
          y="155"
          width="80"
          height="4"
          rx="2"
          className="fill-muted/20"
        />
        {/* Skirt folds */}
        <path
          d="M70 159L65 240"
          stroke="currentColor"
          className="text-muted/20"
          strokeWidth="0.5"
        />
        <path
          d="M100 159L100 245"
          stroke="currentColor"
          className="text-muted/20"
          strokeWidth="0.5"
        />
        <path
          d="M130 159L135 240"
          stroke="currentColor"
          className="text-muted/20"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

export function HomeShowcase() {
  const t = useTranslations("hanfuHome.showcase");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const styles = [
    { name: t("tang.name"), description: t("tang.description") },
    { name: t("song.name"), description: t("song.description") },
    { name: t("ming.name"), description: t("ming.description") },
    { name: t("han.name"), description: t("han.description") },
  ];

  return (
    <section id="hanfu-styles" className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F6E56]/3 to-transparent dark:via-[#0F6E56]/5 pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <Heading as="h2">{t("title")}</Heading>
          <Subheading>{t("subtitle")}</Subheading>
        </div>

        {/* Style Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {styles.map((style, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={cn(
                "relative p-6 rounded-2xl border bg-card transition-all duration-300",
                dynastyColors[i].border,
                "hover:shadow-lg hover:-translate-y-1",
                dynastyColors[i].hoverBorder
              )}
            >
              {/* Decorative frame */}
              <div className="relative">
                <DecorativeFrame colorClass={dynastyColors[i].accent} />
                <div className="relative z-10">
                  {/* Dynasty sketch illustration */}
                  <DynastySketch name={style.name} />

                  {/* Style name */}
                  <h3
                    className={cn(
                      "text-lg font-semibold text-center mb-2",
                      dynastyColors[i].accent
                    )}
                  >
                    {style.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {style.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
