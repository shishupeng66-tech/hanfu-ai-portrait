"use client";

import { useState, useRef } from "react";
import { Coins, ReceiptText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type CreditsBadgeProps = {
  credits?: number;
  locale?: string;
  planName?: string;
  className?: string;
};

export const CreditsBadge = ({
  credits = 0,
  locale = "en",
  planName = "Free",
  className,
}: CreditsBadgeProps) => {
  const isZh = locale === "zh";
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Labels
  const currentCreditsLabel = isZh ? "当前积分" : "Current credits";
  const planTypeLabel = isZh ? "套餐类型" : "Plan";
  const creditDetailsLabel = isZh ? "积分明细" : "Credit details";

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Credits pill */}
      <div
        className="transition-all duration-200 cursor-default"
        style={{
          height: 38,
          borderRadius: "999px",
          display: "inline-flex",
          alignItems: "center",
          background:
            "linear-gradient(180deg, rgba(232,194,122,0.13), rgba(232,194,122,0.055))",
          border: "1px solid rgba(232,194,122,0.24)",
          boxShadow:
            "inset 0 1px 0 rgba(255,247,236,0.08), 0 0 18px rgba(232,194,122,0.06)",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(232,194,122,0.34)";
          e.currentTarget.style.background =
            "linear-gradient(180deg, rgba(232,194,122,0.17), rgba(232,194,122,0.07))";
          e.currentTarget.style.boxShadow =
            "inset 0 1px 0 rgba(255,247,236,0.10), 0 0 22px rgba(232,194,122,0.10)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(232,194,122,0.24)";
          e.currentTarget.style.background =
            "linear-gradient(180deg, rgba(232,194,122,0.13), rgba(232,194,122,0.055))";
          e.currentTarget.style.boxShadow =
            "inset 0 1px 0 rgba(255,247,236,0.08), 0 0 18px rgba(232,194,122,0.06)";
        }}
      >
        {/* Left: credits icon + number (clickable) */}
        <Link
          href={`/${locale}/credits`}
          className="flex items-center gap-1.5 h-full pl-3 pr-2.5 transition-colors duration-200 hover:text-[#E8C27A]"
          style={{
            color: "rgba(255,247,236,0.82)",
            fontSize: "14px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            textDecoration: "none",
          }}
        >
          <Coins size={15} color="#E8C27A" style={{ opacity: 0.9, flexShrink: 0 }} />
          <span
            style={{
              color: "#E8C27A",
              fontWeight: 700,
              letterSpacing: "0.01em",
            }}
          >
            {credits}
          </span>
        </Link>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(232,194,122,0.22)",
            flexShrink: 0,
          }}
        />

        {/* Right: + button (clickable) */}
        <Link
          href={`/${locale}/pricing?tab=packs`}
          className="flex items-center justify-center h-full px-2.5 transition-colors duration-200"
          style={{
            color: "#E8C27A",
            fontSize: "16px",
            fontWeight: 500,
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232,194,122,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          +
        </Link>
      </div>

      {/* Hover dropdown */}
      {isHovered && (
        <div
          className="absolute right-0 z-50"
          style={{
            top: "calc(100% + 8px)",
            width: 260,
            background:
              "linear-gradient(145deg, rgba(17, 17, 20, 0.74), rgba(11, 11, 13, 0.68) 54%, rgba(20, 20, 24, 0.66))",
            border: "1px solid rgba(255, 247, 236, 0.08)",
            borderRadius: 16,
            boxShadow:
              "0 28px 80px rgba(0, 0, 0, 0.42), 0 12px 30px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 247, 236, 0.05)",
            backdropFilter: "blur(28px) saturate(1.15)",
            padding: 14,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Info rows */}
          <div className="flex flex-col" style={{ gap: 10 }}>
            {/* Current credits */}
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 247, 236, 0.45)",
                }}
              >
                {currentCreditsLabel}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#E8C27A",
                }}
              >
                {credits}
              </span>
            </div>

            {/* Plan type */}
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 247, 236, 0.45)",
                }}
              >
                {planTypeLabel}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "rgba(255, 247, 236, 0.72)",
                }}
              >
                {planName}
              </span>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: "rgba(255, 247, 236, 0.08)",
                margin: "2px 0",
              }}
            />

            {/* Credit details link */}
            <Link
              href={`/${locale}/credits`}
              className="group flex items-center justify-between rounded-xl px-2.5 py-2 transition-all duration-200"
              style={{
                color: "rgba(255, 247, 236, 0.74)",
                border: "1px solid transparent",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(90deg, rgba(232, 194, 122, 0.16), rgba(232, 194, 122, 0.055))";
                e.currentTarget.style.borderColor = "rgba(232, 194, 122, 0.08)";
                e.currentTarget.style.color = "rgba(255, 247, 236, 0.96)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.color = "rgba(255, 247, 236, 0.74)";
              }}
            >
              <div className="flex items-center gap-2.5">
                <ReceiptText
                  size={16}
                  strokeWidth={1.8}
                  style={{ width: 18, flexShrink: 0, color: "#E8C27A" }}
                />
                <span className="text-sm font-medium">{creditDetailsLabel}</span>
              </div>
              <ChevronRight
                size={14}
                style={{ color: "rgba(232, 194, 122, 0.5)", flexShrink: 0 }}
              />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
