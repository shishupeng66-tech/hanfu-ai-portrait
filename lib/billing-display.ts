import {
  PackKey,
  PlanKey,
  oneTimePacks,
  subscriptionPlans,
} from "@/constants/billing";

export const DEFAULT_ONE_TIME_PACK_KEY: PackKey = "pack_small";
export const MARKETING_SUBSCRIPTION_PLAN_FAMILIES = [
  {
    id: "plus",
    monthlyKey: "plus_monthly",
    featured: false,
  },
  {
    id: "pro",
    monthlyKey: "pro_monthly",
    yearlyKey: "proplus_yearly",
    featured: true,
  },
] as const;

function formatUsdPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(0)}`;
}

function formatCredits(credits: number) {
  return new Intl.NumberFormat("en-US").format(credits);
}

function getCreditsPerGrant(planKey: PlanKey) {
  const plan = subscriptionPlans[planKey];

  if (plan.grantSchedule?.mode === "installments") {
    return plan.grantSchedule.creditsPerGrant ?? Math.floor(plan.creditsPerCycle / plan.grantSchedule.grantsPerCycle);
  }

  return plan.creditsPerCycle;
}

export function getDefaultOneTimePack() {
  const fallbackKey = Object.keys(oneTimePacks)[0] as PackKey | undefined;
  const key = oneTimePacks[DEFAULT_ONE_TIME_PACK_KEY] ? DEFAULT_ONE_TIME_PACK_KEY : fallbackKey;
  const pack = key ? oneTimePacks[key] : undefined;

  if (!key || !pack) {
    throw new Error("No one-time credit packs are configured.");
  }

  return {
    key,
    pack,
    displayCredits: formatCredits(pack.credits),
    displayPrice: formatUsdPrice(pack.priceCents),
  };
}

export function getSubscriptionPlanDisplays() {
  return MARKETING_SUBSCRIPTION_PLAN_FAMILIES.map((family) => {
    const monthlyPlan = subscriptionPlans[family.monthlyKey];
    const yearlyPlan = "yearlyKey" in family ? subscriptionPlans[family.yearlyKey] : undefined;

    return {
      ...family,
      monthlyPlan,
      yearlyPlan,
      displayMonthlyPrice: formatUsdPrice(monthlyPlan.priceCents),
      displayYearlyPrice: yearlyPlan ? formatUsdPrice(yearlyPlan.priceCents) : undefined,
      displayMonthlyCredits: formatCredits(monthlyPlan.creditsPerCycle),
      displayYearlyCredits: yearlyPlan ? formatCredits(yearlyPlan.creditsPerCycle) : undefined,
      displayYearlyCreditsPerGrant:
        yearlyPlan && "yearlyKey" in family ? formatCredits(getCreditsPerGrant(family.yearlyKey)) : undefined,
    };
  });
}
