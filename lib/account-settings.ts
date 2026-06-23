import { z } from "zod";
import { subscriptionPlans } from "@/constants/billing";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
});

export function normalizeProfileName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function getSubscriptionPlanTranslationKey(planKey?: string | null) {
  switch (planKey) {
    case "plus_monthly":
      return "plusMonthly";
    case "pro_monthly":
      return "proMonthly";
    case "proplus_yearly":
      return "proplusYearly";
    default:
      return "free";
  }
}

export type PlanDisplayInfo = {
  key: string;
  displayName: string;
  displayNameShort: string;
  badgeStyle: React.CSSProperties;
  creditsPerCycle?: number;
  cycle?: "month" | "year";
};

export function getSubscriptionPlanDisplayInfo(planKey?: string | null, locale: string = "en"): PlanDisplayInfo {
  const isZh = locale === "zh";
  
  switch (planKey) {
    case "plus_monthly":
      return {
        key: planKey,
        displayName: isZh ? "Plus" : "Plus",
        displayNameShort: isZh ? "Plus" : "Plus",
        badgeStyle: {
          background: "linear-gradient(135deg, rgba(232, 194, 122, 0.15), rgba(232, 194, 122, 0.05))",
          border: "1px solid rgba(232, 194, 122, 0.3)",
          color: "#E8C27A",
          fontWeight: 600,
        },
        creditsPerCycle: subscriptionPlans.plus_monthly.creditsPerCycle,
        cycle: subscriptionPlans.plus_monthly.cycle,
      };
    case "pro_monthly":
      return {
        key: planKey,
        displayName: isZh ? "Pro" : "Pro",
        displayNameShort: isZh ? "Pro" : "Pro",
        badgeStyle: {
          background: "linear-gradient(135deg, rgba(180, 39, 32, 0.15), rgba(120, 35, 30, 0.08))",
          border: "1px solid rgba(180, 39, 32, 0.35)",
          color: "#E8C27A",
          fontWeight: 700,
          textShadow: "0 0 1px rgba(232, 194, 122, 0.5)",
        },
        creditsPerCycle: subscriptionPlans.pro_monthly.creditsPerCycle,
        cycle: subscriptionPlans.pro_monthly.cycle,
      };
    case "proplus_yearly":
      return {
        key: planKey,
        displayName: isZh ? "Pro+" : "Pro+",
        displayNameShort: isZh ? "Pro+" : "Pro+",
        badgeStyle: {
          background: "linear-gradient(135deg, rgba(24, 14, 12, 0.8), rgba(44, 25, 15, 0.7))",
          border: "1px solid rgba(232, 194, 122, 0.4)",
          color: "#E8C27A",
          fontWeight: 700,
          boxShadow: "0 0 8px rgba(232, 194, 122, 0.2)",
        },
        creditsPerCycle: subscriptionPlans.proplus_yearly.creditsPerCycle,
        cycle: subscriptionPlans.proplus_yearly.cycle,
      };
    default:
      return {
        key: "free",
        displayName: isZh ? "免费版" : "Free",
        displayNameShort: isZh ? "免费" : "Free",
        badgeStyle: {
          background: "rgba(248, 250, 252, 0.2)",
          border: "1px solid rgba(203, 213, 225, 0.3)",
          color: "rgba(71, 85, 105, 0.9)",
          fontWeight: 500,
        },
        creditsPerCycle: undefined,
        cycle: undefined,
      };
  }
}
