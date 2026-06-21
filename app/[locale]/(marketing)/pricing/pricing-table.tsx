"use client";

import { useTranslations } from "next-intl";

// Safety helper: if next-intl returns the raw key (translation missing),
// show a friendly fallback instead of the ugly key string.
function resolveValue(
  t: (key: string) => string,
  key: string,
  fallback: string
): string {
  const value = t(key);
  // next-intl returns the raw key when translation is missing
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
      title: resolveValue(t, "table.rows.purchaseType", "购买类型"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.purchaseType",
          "订阅"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.purchaseType",
          "订阅"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.purchaseType",
          "年卡订阅"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.price", "价格"),
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
      title: resolveValue(t, "table.rows.billingCycle", "计费周期"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.billingCycle",
          "每月"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.billingCycle",
          "每月"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.billingCycle",
          "每年"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.creditsIncluded", "获得积分"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.creditsIncluded",
          "每月 10 积分"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.creditsIncluded",
          "每月 22 积分"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.creditsIncluded",
          "每年 260 积分"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.premiumTemplates", "会员模板"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.premiumTemplates",
          "解锁会员专属模板"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.premiumTemplates",
          "解锁全部会员模板"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.premiumTemplates",
          "解锁全部会员模板"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.newTemplates", "新模板权益"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.newTemplates",
          "普通更新"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.newTemplates",
          "优先体验新写真模板"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.newTemplates",
          "全年优先体验新模板"
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
        "额外积分优惠"
      ),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.extraCreditDiscount",
          "无"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.extraCreditDiscount",
          "会员专属优惠"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.extraCreditDiscount",
          "会员专属优惠"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
    {
      title: resolveValue(t, "table.rows.bestFor", "适合人群"),
      values: {
        basic: resolveValue(
          t,
          "table.membership.basic.bestFor",
          "偶尔生成汉服写真"
        ),
        premium: resolveValue(
          t,
          "table.membership.premium.bestFor",
          "生成完整写真套图"
        ),
        proPlus: resolveValue(
          t,
          "table.membership.proPlus.bestFor",
          "长期创作和高频使用"
        ),
        small: "",
        common: "",
        large: "",
      },
    },
  ];

  const packRows: TableRow[] = [
    {
      title: resolveValue(t, "table.rows.purchaseType", "购买类型"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(
          t,
          "table.packs.small.purchaseType",
          "一次性积分包"
        ),
        common: resolveValue(
          t,
          "table.packs.common.purchaseType",
          "一次性积分包"
        ),
        large: resolveValue(
          t,
          "table.packs.large.purchaseType",
          "一次性积分包"
        ),
      },
    },
    {
      title: resolveValue(t, "table.rows.price", "价格"),
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
      title: resolveValue(t, "table.rows.creditsIncluded", "获得积分"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(
          t,
          "table.packs.small.creditsIncluded",
          "5 积分"
        ),
        common: resolveValue(
          t,
          "table.packs.common.creditsIncluded",
          "20 积分"
        ),
        large: resolveValue(
          t,
          "table.packs.large.creditsIncluded",
          "55 积分"
        ),
      },
    },
    {
      title: resolveValue(t, "table.rows.subscription", "是否订阅"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(t, "table.packs.small.subscription", "否"),
        common: resolveValue(t, "table.packs.common.subscription", "否"),
        large: resolveValue(t, "table.packs.large.subscription", "否"),
      },
    },
    {
      title: resolveValue(t, "table.rows.premiumTemplates", "会员模板"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(
          t,
          "table.packs.small.premiumTemplates",
          "否"
        ),
        common: resolveValue(
          t,
          "table.packs.common.premiumTemplates",
          "否"
        ),
        large: resolveValue(
          t,
          "table.packs.large.premiumTemplates",
          "否"
        ),
      },
    },
    {
      title: resolveValue(t, "table.rows.delivery", "到账方式"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(
          t,
          "table.packs.small.delivery",
          "支付成功后立即到账"
        ),
        common: resolveValue(
          t,
          "table.packs.common.delivery",
          "支付成功后立即到账"
        ),
        large: resolveValue(
          t,
          "table.packs.large.delivery",
          "支付成功后立即到账"
        ),
      },
    },
    {
      title: resolveValue(t, "table.rows.bestFor", "适合人群"),
      values: {
        basic: "",
        premium: "",
        proPlus: "",
        small: resolveValue(
          t,
          "table.packs.small.bestFor",
          "临时补充积分"
        ),
        common: resolveValue(
          t,
          "table.packs.common.bestFor",
          "生成一组完整汉服写真"
        ),
        large: resolveValue(
          t,
          "table.packs.large.bestFor",
          "批量生成和多套风格测试"
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
