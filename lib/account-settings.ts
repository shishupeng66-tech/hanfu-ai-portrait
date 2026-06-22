import { z } from "zod";

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
