"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { LocaleLink } from "@/components/locale-link";

export function HomeCTAFooter() {
  const t = useTranslations("hanfuHome.ctaFooter");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="relative py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F6E56] via-[#0F6E56]/90 to-[#19A07E] p-8 md:p-16 lg:p-20"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top-right circle */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5" />
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#EF9F27]/10" />

            {/* Bottom-left circle */}
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-black/10" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-[#D85A30]/10" />

            {/* Decorative dots pattern */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.04]"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="cta-dots"
                  x="0"
                  y="0"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-dots)" />
            </svg>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {t("title")}
            </h2>
            <p className="text-base md:text-lg text-white/80 mb-10 leading-relaxed">
              {t("subtitle")}
            </p>

            <LocaleLink
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#EF9F27] text-white font-semibold text-base transition-all active:scale-95 shadow-lg hover:shadow-xl hover:bg-[#F0A838]"
              style={{
                boxShadow: "0 4px 24px rgba(239,159,39,0.4)",
              }}
            >
              {t("cta")}
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

            {/* Trust note */}
            <p className="mt-6 text-sm text-white/50">
              No credit card required. Free forever plan available.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
