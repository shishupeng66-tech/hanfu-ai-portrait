"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Heading } from "@/components/heading";
import { Subheading } from "@/components/subheading";
import { cn } from "@/lib/utils";

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn(
        "transition-transform duration-300",
        isOpen ? "rotate-180" : "rotate-0"
      )}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  delay,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
          "border rounded-xl overflow-hidden transition-all duration-300",
          isOpen
            ? "border-[#E8C27A]/30 bg-card shadow-sm"
            : "border-border/50 bg-card hover:border-[#E8C27A]/20"
        )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm md:text-base font-medium text-foreground pr-8">
          {question}
        </span>
        <span
          className={cn(
            "shrink-0 transition-colors",
            isOpen ? "text-[#E8C27A]" : "text-muted-foreground"
          )}
        >
          <ChevronIcon isOpen={isOpen} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">
              <div className="h-px bg-border/50 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function HomeFAQ() {
  const t = useTranslations("hanfuHome.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [
    { question: t("q1.question"), answer: t("q1.answer") },
    { question: t("q2.question"), answer: t("q2.answer") },
    { question: t("q3.question"), answer: t("q3.answer") },
    { question: t("q4.question"), answer: t("q4.answer") },
    { question: t("q5.question"), answer: t("q5.answer") },
    { question: t("q6.question"), answer: t("q6.answer") },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 md:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E8C27A]/3 to-transparent dark:via-[#E8C27A]/5 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <Heading as="h2">{t("title")}</Heading>
          <Subheading>{t("subtitle")}</Subheading>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <FAQItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
