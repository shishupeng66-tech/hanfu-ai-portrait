"use client";

import { useTranslations } from "next-intl";

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
      title: t("table.rows.purchaseType"),
      values: {
        basic: t("table.membership.basic.purchaseType"),
        premium: t("table.membership.premium.purchaseType"),
        proPlus: t("table.membership.proPlus.purchaseType"),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: t("table.rows.price"),
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
      title: t("table.rows.billingCycle"),
      values: {
        basic: t("table.membership.basic.billingCycle"),
        premium: t("table.membership.premium.billingCycle"),
        proPlus: t("table.membership.proPlus.billingCycle"),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: t("table.rows.creditsIncluded"),
      values: {
        basic: t("table.membership.basic.creditsIncluded"),
        premium: t("table.membership.premium.creditsIncluded"),
        proPlus: t("table.membership.proPlus.creditsIncluded"),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: t("table.rows.premiumTemplates"),
      values: {
        basic: t("table.membership.basic.premiumTemplates"),
        premium: t("table.membership.premium.premiumTemplates"),
        proPlus: t("table.membership.proPlus.premiumTemplates"),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: t("table.rows.newTemplates"),
      values: {
        basic: t("table.membership.basic.newTemplates"),
        premium: t("table.membership.premium.newTemplates"),
        proPlus: t("table.membership.proPlus.newTemplates"),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: t("table.rows.extraCreditDiscount"),
      values: {
        basic: t("table.membership.basic.extraCreditDiscount"),
        premium: t("table.membership.premium.extraCreditDiscount"),
        proPlus: t("table.membership.proPlus.extraCreditDiscount"),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: t("table.rows.bestFor"),
      values: {
        basic: t("table.membership.basic.bestFor"),
        premium: t("table.membership.premium.bestFor"),
        proPlus: t("table.membership.proPlus.bestFor"),
        small: "",
        common: "",
        large: "",
      },
    },
  ];

  const packRows: TableRow[] = [
    {
      title: t("table.rows.purchaseType"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: t("table.packs.small.purchaseType"),
        common: t("table.packs.common.purchaseType"),
        large: t("table.packs.large.purchaseType"),
      },
    },
    {
      title: t("table.rows.price"),
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
      title: t("table.rows.creditsIncluded"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: t("table.packs.small.creditsIncluded"),
        common: t("table.packs.common.creditsIncluded"),
        large: t("table.packs.large.creditsIncluded"),
      },
    },
    {
      title: t("table.rows.subscription"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: t("table.packs.small.subscription"),
        common: t("table.packs.common.subscription"),
        large: t("table.packs.large.subscription"),
      },
    },
    {
      title: t("table.rows.premiumTemplates"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: t("table.packs.small.premiumTemplates"),
        common: t("table.packs.common.premiumTemplates"),
        large: t("table.packs.large.premiumTemplates"),
      },
    },
    {
      title: t("table.rows.delivery"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: t("table.packs.small.delivery"),
        common: t("table.packs.common.delivery"),
        large: t("table.packs.large.delivery"),
      },
    },
    {
      title: t("table.rows.bestFor"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: t("table.packs.small.bestFor"),
        common: t("table.packs.common.bestFor"),
        large: t("table.packs.large.bestFor"),
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
