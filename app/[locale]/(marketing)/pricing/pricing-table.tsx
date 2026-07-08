"use client";

import { useTranslations } from "next-intl";

function resolveValue(
  t: (key: string) => string,
  key: string,
  fallback: string
): string {
  const value = t(key);
  return value === key ? fallback : value;
}

type Mode = "membership" | "packs";

type ColumnId =
  | "basic"
  | "premium"
  | "proPlus"
  | "small"
  | "common"
  | "large";

type TableRow = {
  title: string;
  values: Record<ColumnId, string>;
};

export function PricingTable({ mode }: { mode: Mode }) {
  const t = useTranslations("pricing");

  const membershipColumns: { id: ColumnId; name: string }[] = [
    { id: "basic", name: t("membership.basic.name") },
    { id: "premium", name: t("membership.premium.name") },
    { id: "proPlus", name: t("membership.proPlus.name") },
  ];

  const packColumns: { id: ColumnId; name: string }[] = [
    { id: "small", name: t("packs.small.name") },
    { id: "common", name: t("packs.common.name") },
    { id: "large", name: t("packs.large.name") },
  ];

  const membershipRows: TableRow[] = [
    {
      title: resolveValue(t, "table.rows.purchaseType", "Purchase type"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.purchaseType",
          "Subscription"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.purchaseType",
          "Subscription"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.purchaseType",
          "Annual subscription"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.price", "Price"),
      values: {
        basic: t("membership.basic.price"),
        premium: t("membership.premium.price"),
        proPlus: t("membership.proPlus.price"),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.billingCycle", "Billing cycle"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.billingCycle",
          "Monthly"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.billingCycle",
          "Monthly"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.billingCycle",
          "Yearly"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.creditsIncluded", "Credits included"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.creditsIncluded",
          "10 credits monthly"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.creditsIncluded",
          "22 credits monthly"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.creditsIncluded",
          "260 credits yearly"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.premiumTemplates", "Premium templates"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.premiumTemplates",
          "Member-only templates"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.premiumTemplates",
          "All premium templates"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.premiumTemplates",
          "All premium templates"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.newTemplates", "New templates"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.newTemplates",
          "Regular updates"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.newTemplates",
          "Early access to new templates"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.newTemplates",
          "Year-round early access"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(
        t,
        "table.rows.extraCreditDiscount",
        "Extra credit discount"
      ),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.extraCreditDiscount",
          "Not included"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.extraCreditDiscount",
          "Member discount"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.extraCreditDiscount",
          "Member discount"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.bestFor", "Best for"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.bestFor",
          "Occasional Hanfu portraits"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.bestFor",
          "Full portrait sets"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.bestFor",
          "Long-term and frequent creation"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
  ];

  const packRows: TableRow[] = [
    {
      title: resolveValue(t, "table.rows.purchaseType", "Purchase type"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(
          t,
          "table.packs.small.purchaseType",
          "One-time credit pack"
        ),
        common: resolveValue(
          t,
          "table.packs.common.purchaseType",
          "One-time credit pack"
        ),
        large: resolveValue(
          t,
          "table.packs.large.purchaseType",
          "One-time credit pack"
        ),
      },
    },
    {
      title: resolveValue(t, "table.rows.price", "Price"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: t("packs.small.price"),
        common: t("packs.common.price"),
        large: t("packs.large.price"),
      },
    },
    {
      title: resolveValue(t, "table.rows.creditsIncluded", "Credits included"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(
          t,
          "table.packs.small.creditsIncluded",
          "5 credits"
        ),
        common: resolveValue(
          t,
          "table.packs.common.creditsIncluded",
          "20 credits"
        ),
        large: resolveValue(
          t,
          "table.packs.large.creditsIncluded",
          "55 credits"
        ),
      },
    },
    {
      title: resolveValue(t, "table.rows.subscription", "Subscription"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(t, "table.packs.small.subscription", "No"),
        common: resolveValue(t, "table.packs.common.subscription", "No"),
        large: resolveValue(t, "table.packs.large.subscription", "No"),
      },
    },
    {
      title: resolveValue(t, "table.rows.premiumTemplates", "Premium templates"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(
          t,
          "table.packs.small.premiumTemplates",
          "No"
        ),
        common: resolveValue(
          t,
          "table.packs.common.premiumTemplates",
          "No"
        ),
        large: resolveValue(
          t,
          "table.packs.large.premiumTemplates",
          "No"
        ),
      },
    },
    {
      title: resolveValue(t, "table.rows.delivery", "Delivery"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(
          t,
          "table.packs.small.delivery",
          "Added instantly after payment"
        ),
        common: resolveValue(
          t,
          "table.packs.common.delivery",
          "Added instantly after payment"
        ),
        large: resolveValue(
          t,
          "table.packs.large.delivery",
          "Added instantly after payment"
        ),
      },
    },
    {
      title: resolveValue(t, "table.rows.bestFor", "Best for"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(
          t,
          "table.packs.small.bestFor",
          "Quick top-ups"
        ),
        common: resolveValue(
          t,
          "table.packs.common.bestFor",
          "A complete Hanfu portrait set"
        ),
        large: resolveValue(
          t,
          "table.packs.large.bestFor",
          "Batch generation and multiple styles"
        ),
      },
    },
  ];

  const columns = mode === "membership" ? membershipColumns : packColumns;
  const rows = mode === "membership" ? membershipRows : packRows;

  return (
    <div className="relative z-20 mx-auto w-full max-w-5xl px-4 pt-16 pb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="max-w-xs py-3 pl-4 pr-3 text-left text-base font-semibold text-foreground sm:pl-0" />
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className="px-3 py-3 text-center text-sm font-semibold text-foreground"
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.title}>
                <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-0">
                  {row.title}
                </td>
                {columns.map((col) => (
                  <td
                    key={`${row.title}-${col.id}`}
                    className="px-3 py-3 text-center text-sm text-muted-foreground"
                  >
                    {row.values[col.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}