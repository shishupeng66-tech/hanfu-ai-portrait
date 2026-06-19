"use client";

import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export type CreditsBadgeProps = {
  credits?: number;
  locale?: string;
  className?: string;
};

export const CreditsBadge = ({
  credits = 12,
  locale = "en",
  className,
}: CreditsBadgeProps) => {
  const isZh = locale === "zh";

  return (
    <div
      className={cn("transition-all duration-200", className)}
      style={{
        height: 38,
        borderRadius: "999px",
        padding: "0 14px 0 12px",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background:
          "linear-gradient(180deg, rgba(232,194,122,0.13), rgba(232,194,122,0.055))",
        border: "1px solid rgba(232,194,122,0.24)",
        boxShadow:
          "inset 0 1px 0 rgba(255,247,236,0.08), 0 0 18px rgba(232,194,122,0.06)",
        color: "rgba(255,247,236,0.82)",
        fontSize: "14px",
        fontWeight: 600,
        whiteSpace: "nowrap",
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
      <Coins size={15} color="#E8C27A" style={{ opacity: 0.9 }} />
      <span>{isZh ? "积分" : "Credits"}</span>
      <span
        style={{
          color: "#E8C27A",
          fontWeight: 700,
          letterSpacing: "0.01em",
        }}
      >
        {credits}
      </span>
    </div>
  );
};
