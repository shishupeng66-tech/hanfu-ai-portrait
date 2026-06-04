"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { LocaleLink } from "@/components/locale-link";

function CloudDecoration() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.08]"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Top left cloud pattern */}
      <path
        d="M0 0C60 40 120 80 160 120C200 160 180 200 140 220C100 240 60 200 0 180V0Z"
        fill="currentColor"
        className="text-[#0F6E56]"
      />
      <path
        d="M100 40C160 80 240 100 300 140C360 180 340 220 280 240C220 260 160 220 100 160V40Z"
        fill="currentColor"
        className="text-[#0F6E56]"
      />
      {/* Top right cloud pattern */}
      <path
        d="M1440 0C1380 50 1320 90 1280 130C1240 170 1260 210 1300 230C1340 250 1380 210 1440 190V0Z"
        fill="currentColor"
        className="text-[#D85A30]"
        opacity="0.5"
      />
      {/* Bottom decorative wave */}
      <path
        d="M0 700C200 680 400 720 600 700C800 680 1000 720 1200 700C1300 690 1400 710 1440 720V900H0V700Z"
        fill="currentColor"
        className="text-[#EF9F27]"
        opacity="0.3"
      />
      {/* Center floral motif */}
      <circle
        cx="720"
        cy="450"
        r="200"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-[#EF9F27]"
        opacity="0.15"
      />
      <circle
        cx="720"
        cy="450"
        r="160"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-[#EF9F27]"
        opacity="0.12"
      />
      <circle
        cx="720"
        cy="450"
        r="120"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-[#0F6E56]"
        opacity="0.1"
      />
      {/* Decorative dots */}
      {[
        [200, 300],
        [300, 500],
        [1100, 280],
        [1050, 520],
        [500, 600],
        [900, 600],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill="currentColor"
          className="text-[#EF9F27]"
          opacity="0.2"
        />
      ))}
    </svg>
  );
}

export function HomeHero() {
  const t = useTranslations("hanfuHome.hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F6E56]/5 via-background to-[#EF9F27]/5 dark:from-[#0F6E56]/10 dark:via-background dark:to-[#EF9F27]/10" />

      {/* Cloud decoration */}
      <CloudDecoration />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#EF9F27]/60" />
            <span className="text-xs tracking-[0.3em] uppercase text-[#EF9F27] font-medium">
              {t("badge")}
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#EF9F27]/60" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6"
          >
            {t("title")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <LocaleLink
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-base transition-all active:scale-95 shadow-lg hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #0F6E56 0%, #19A07E 100%)",
                boxShadow: "0 4px 24px rgba(15,110,86,0.35)",
              }}
            >
              {t("ctaPrimary")}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </LocaleLink>
            <LocaleLink
              href="/gallery"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/30"
            >
              {t("ctaSecondary")}
            </LocaleLink>
          </motion.div>

          {/* Trust Labels */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/60"
          >
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M11.667 3.5L5.25 9.917L2.333 7"
                  stroke="#0F6E56"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("trustLabel1")}
            </span>
            <span className="hidden sm:inline text-muted-foreground/30">
              |
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M11.667 3.5L5.25 9.917L2.333 7"
                  stroke="#0F6E56"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("trustLabel2")}
            </span>
            <span className="hidden sm:inline text-muted-foreground/30">
              |
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M11.667 3.5L5.25 9.917L2.333 7"
                  stroke="#0F6E56"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("trustLabel3")}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
