"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export type AdminPaymentItem = {
  id: string;
  provider: string;
  providerPaymentId: string;
  userEmail: string | null;
  amountCents: number;
  currency: string;
  status: string;
  type: string;
  planKey: string | null;
  creditsGranted: number;
  createdAt: Date;
};

type PaymentsTableProps = {
  payments: AdminPaymentItem[];
  query: string;
  status: string;
  type: string;
};

const statusClasses: Record<string, string> = {
  succeeded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  canceled: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
};

const statusLabels: Record<string, string> = {
  succeeded: "成功",
  paid: "已支付",
  completed: "已完成",
  pending: "待处理",
  failed: "失败",
  canceled: "已取消",
};

const paymentTypeLabels: Record<string, string> = {
  one_time: "积分包",
  subscription: "会员订阅",
};

const planLabels: Record<string, string> = {
  plus_monthly: "Plus 月付",
  pro_monthly: "Pro 月付",
  proplus_yearly: "Pro+ 年付",
  pack_small: "小积分包",
  pack_popular: "热门积分包",
  pack_large: "大积分包",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusClasses[status] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}

export function PaymentsTable({ payments, query, status, type }: PaymentsTableProps) {
  const locale = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(query);
  const [statusFilter, setStatusFilter] = useState(status);
  const [typeFilter, setTypeFilter] = useState(type);

  const inputClass = "flex h-9 rounded-lg border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    router.push(`/${locale}/admin/payments?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    router.push(`/${locale}/admin/payments`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">订单与支付</h1>
        <p className="text-sm text-muted-foreground">查看 Creem 支付订单、发放积分和会员购买记录。</p>
      </div>

      <form onSubmit={applyFilters} className="flex flex-wrap gap-2">
        <input
          placeholder="搜索邮箱、订单 ID 或 Creem 支付 ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(inputClass, "w-full max-w-md")}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={cn(inputClass, "w-36")}>
          <option value="all">全部状态</option>
          <option value="succeeded">succeeded</option>
          <option value="pending">pending</option>
          <option value="failed">failed</option>
          <option value="canceled">canceled</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={cn(inputClass, "w-36")}>
          <option value="all">全部类型</option>
          <option value="one_time">积分包</option>
          <option value="subscription">会员订阅</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          <Search className="h-4 w-4 mr-1" />
          查询
        </Button>
        {(query || status !== "all" || type !== "all") && (
          <Button type="button" variant="simple" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            清空
          </Button>
        )}
      </form>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-500/10 bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">订单 ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">用户邮箱</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">产品类型</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">套餐/积分包</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">金额</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Provider 支付 ID</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">发放积分</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">创建时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {payments.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate" title={item.id}>{item.id}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{item.userEmail || "-"}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{paymentTypeLabels[item.type] || item.type}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{item.planKey ? planLabels[item.planKey] || item.planKey : "-"}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {(item.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[220px] truncate" title={item.providerPaymentId}>
                    {item.provider}: {item.providerPaymentId}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">{item.creditsGranted.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">暂无订单数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
