import {
  DEFAULT_ONE_TIME_PACK_KEY,
  getDefaultOneTimePack,
  getSubscriptionPlanDisplays,
  MARKETING_SUBSCRIPTION_PLAN_FAMILIES,
} from "@/lib/billing-display";

describe("getDefaultOneTimePack", () => {
  it("returns the configured default pack key", () => {
    expect(DEFAULT_ONE_TIME_PACK_KEY).toBe("pack_small");
  });

  it("returns the pack values from billing config", () => {
    expect(getDefaultOneTimePack()).toEqual({
      key: "pack_small",
      pack: {
        key: "pack_small",
        kind: "one_time",
        priceCents: 500,
        currency: "usd",
        credits: 5,
        creemPriceId: "prod_2LjKXaJgJs69mZf9X02SVX",
      },
      displayCredits: "5",
      displayPrice: "$5",
    });
  });
});

describe("getSubscriptionPlanDisplays", () => {
  it("only exposes subscription families that exist in billing config", () => {
    expect(MARKETING_SUBSCRIPTION_PLAN_FAMILIES).toEqual([
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
    ]);
  });

  it("derives marketing prices and credits from the real billing plans", () => {
    expect(getSubscriptionPlanDisplays()).toEqual([
      {
        id: "plus",
        monthlyKey: "plus_monthly",
        featured: false,
        monthlyPlan: {
          key: "plus_monthly",
          kind: "subscription",
          priceCents: 990,
          currency: "usd",
          creditsPerCycle: 10,
          cycle: "month",
          creemPriceId: "prod_6PoSDMfbwhBhErem8pPule",
          grantSchedule: { mode: "per_cycle" },
        },
        yearlyPlan: undefined,
        displayMonthlyPrice: "$10",
        displayYearlyPrice: undefined,
        displayMonthlyCredits: "10",
        displayYearlyCredits: undefined,
        displayYearlyCreditsPerGrant: undefined,
      },
      {
        id: "pro",
        monthlyKey: "pro_monthly",
        yearlyKey: "proplus_yearly",
        featured: true,
        monthlyPlan: {
          key: "pro_monthly",
          kind: "subscription",
          priceCents: 1990,
          currency: "usd",
          creditsPerCycle: 22,
          cycle: "month",
          creemPriceId: "prod_5ISUR9mYVpSlKu1QU8PwW8",
          grantSchedule: { mode: "per_cycle" },
        },
        yearlyPlan: {
          key: "proplus_yearly",
          kind: "subscription",
          priceCents: 19900,
          currency: "usd",
          creditsPerCycle: 260,
          cycle: "year",
          creemPriceId: "prod_16o388IDnRXlqOuMjrFeL",
          grantSchedule: { mode: "per_cycle" },
        },
        displayMonthlyPrice: "$20",
        displayYearlyPrice: "$199",
        displayMonthlyCredits: "22",
        displayYearlyCredits: "260",
        displayYearlyCreditsPerGrant: "260",
      },
    ]);
  });
});
