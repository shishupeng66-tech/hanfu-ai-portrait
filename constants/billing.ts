export type BillingKind = "subscription" | "one_time";

export type PlanKey =
  | "plus_monthly"
  | "pro_monthly"
  | "proplus_yearly";

export type PackKey =
  | "pack_small"
  | "pack_popular"
  | "pack_large";

export type GrantScheduleConfig =
  | {
      mode: "per_cycle";
    }
  | {
      mode: "installments";
      grantsPerCycle: number;
      intervalMonths: number;
      creditsPerGrant?: number;
      initialGrants?: number;
    };

type SubscriptionPlan = {
  key: PlanKey;
  kind: "subscription";
  priceCents: number;
  currency: "usd";
  creditsPerCycle: number;
  cycle: "month" | "year";
  creemPriceId?: string;
  grantSchedule?: GrantScheduleConfig;
};

type OneTimePack = {
  key: PackKey;
  kind: "one_time";
  priceCents: number;
  currency: "usd";
  credits: number;
  creemPriceId?: string;
};

export const subscriptionPlans: Record<PlanKey, SubscriptionPlan> = {
  plus_monthly: {
    key: "plus_monthly",
    kind: "subscription",
    priceCents: 990,
    currency: "usd",
    creditsPerCycle: 10,
    cycle: "month",
    creemPriceId: "prod_6PoSDMfbwhBhErem8pPule",
    grantSchedule: { mode: "per_cycle" },
  },
  pro_monthly: {
    key: "pro_monthly",
    kind: "subscription",
    priceCents: 1990,
    currency: "usd",
    creditsPerCycle: 22,
    cycle: "month",
    creemPriceId: "prod_5ISUR9mYVpSlKu1QU8PwW8",
    grantSchedule: { mode: "per_cycle" },
  },
  proplus_yearly: {
    key: "proplus_yearly",
    kind: "subscription",
    priceCents: 19900,
    currency: "usd",
    creditsPerCycle: 260,
    cycle: "year",
    creemPriceId: "prod_16o388IDnRXlqOuMjrFeL",
    grantSchedule: { mode: "per_cycle" },
  },
};

export const oneTimePacks: Record<PackKey, OneTimePack> = {
  pack_small: {
    key: "pack_small",
    kind: "one_time",
    priceCents: 500,
    currency: "usd",
    credits: 5,
    creemPriceId: "prod_2LjKXaJgJs69mZf9X02SVX",
  },
  pack_popular: {
    key: "pack_popular",
    kind: "one_time",
    priceCents: 1900,
    currency: "usd",
    credits: 20,
    creemPriceId: "prod_2I65kPTVfEwqfQIW1FthPd",
  },
  pack_large: {
    key: "pack_large",
    kind: "one_time",
    priceCents: 4900,
    currency: "usd",
    credits: 55,
    creemPriceId: "prod_7PtO0h2GValAHmkV84t2K0",
  },
};

export function isSubscriptionKey(key: string): key is PlanKey {
  return (key as PlanKey) in subscriptionPlans;
}

export function isPackKey(key: string): key is PackKey {
  return (key as PackKey) in oneTimePacks;
}
