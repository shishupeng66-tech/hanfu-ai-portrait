"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heading } from "@/components/heading";
import { Subheading } from "@/components/subheading";
import { cn } from "@/lib/utils";

function UploadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        stroke="currentColor"
        className="text-[#EF9F27]"
        strokeWidth="1.5"
      />
      <path
        d="M20 12V24"
        stroke="currentColor"
        className="text-[#EF9F27]"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 18L20 12L26 18"
        stroke="currentColor"
        className="text-[#EF9F27]"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 28H28"
        stroke="currentColor"
        className="text-[#EF9F27]"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        stroke="currentColor"
        className="text-[#D85A30]"
        strokeWidth="1.5"
      />
      <path
        d="M20 10L22 16L28 16L23 20L25 26L20 22L15 26L17 20L12 16L18 16L20 10Z"
        stroke="currentColor"
        className="text-[#D85A30]"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        stroke="currentColor"
        className="text-[#0F6E56]"
        strokeWidth="1.5"
      />
      <path
        d="M20 12V24"
        stroke="currentColor"
        className="text-[#0F6E56]"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 20L20 26L26 20"
        stroke="currentColor"
        className="text-[#0F6E56]"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 28H28"
        stroke="currentColor"
        className="text-[#0F6E56]"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
  colorClass,
  delay,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ delay, duration: 0.5 }}
      className="relative flex flex-col items-center text-center"
    >
      {/* Step number */}
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-5",
          colorClass
        )}
      >
        {step}
      </div>

      {/* Icon */}
      <div className="mb-4">{icon}</div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

function ConnectorLine() {
  return (
    <div className="hidden md:flex items-center justify-center w-24 shrink-0 mt-6">
      <svg
        width="80"
        height="16"
        viewBox="0 0 80 16"
        fill="none"
        aria-hidden="true"
        className="text-muted-foreground/20"
      >
        <path
          d="M0 8H60"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <path
          d="M65 5L72 8L65 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function HomeHowItWorks() {
  const t = useTranslations("hanfuHome.howItWorks");

  const steps = [
    {
      step: 1,
      icon: <UploadIcon />,
      title: t("step1.title"),
      description: t("step1.description"),
      colorClass: "bg-[#EF9F27]/10 text-[#EF9F27]",
    },
    {
      step: 2,
      icon: <AIIcon />,
      title: t("step2.title"),
      description: t("step2.description"),
      colorClass: "bg-[#D85A30]/10 text-[#D85A30]",
    },
    {
      step: 3,
      icon: <DownloadIcon />,
      title: t("step3.title"),
      description: t("step3.description"),
      colorClass: "bg-[#0F6E56]/10 text-[#0F6E56]",
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

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-start md:items-start justify-center gap-8 md:gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-row md:flex-col items-center">
              <StepCard {...step} delay={i * 0.15} />
              {i < steps.length - 1 && <ConnectorLine />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
