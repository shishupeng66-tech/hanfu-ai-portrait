"use client";

import { format } from "date-fns";
import { AlertTriangle, BarChart3, Coins, DollarSign, ImageIcon, TrendingUp, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  stats: {
    todayUsers: number;
    todayGenerations: number;
    todaySuccessRate: number;
    todayFailedGenerations: number;
    todayRevenue: number;
    todayCreditsUsed: number;
  };
  recentFailedGenerations: Array<{
    id: string;
    userEmail: string | null;
    status: string;
    error: string | null;
    createdAt: Date;
  }>;
  recentPayments: Array<{
    id: string;
    userEmail: string | null;
    amountCents: number;
    currency: string;
    status: string;
    createdAt: Date;
  }>;
}

const statusBadgeClasses: Record<string, string> = {
  succeeded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  canceled: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const statusLabels: Record<string, string> = {
  succeeded: "成功",
  completed: "成功",
  failed: "失败",
  canceled: "已取消",
  pending: "待处理",
  processing: "处理中",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusBadgeClasses[status] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}

export function AdminDashboard({ stats, recentFailedGenerations, recentPayments }: AdminDashboardProps) {
  const statCards = [
    {
      label: "今日新增用户",
      value: stats.todayUsers.toLocaleString(),
      icon: UserPlus,
      sub: "今日注册账号数",
    },
    {
      label: "今日生成次数",
      value: stats.todayGenerations.toLocaleString(),
      icon: ImageIcon,
      sub: "图片/视频生成任务",
    },
    {
      label: "今日生成成功率",
      value: `${stats.todaySuccessRate}%`,
      icon: TrendingUp,
      sub: "completed / 全部任务",
    },
    {
      label: "今日失败任务",
      value: stats.todayFailedGenerations.toLocaleString(),
      icon: AlertTriangle,
      sub: "需要优先排查",
      danger: stats.todayFailedGenerations > 0,
    },
    {
      label: "今日收入",
      value: `$${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      sub: "成功支付金额",
    },
    {
      label: "今日消耗积分",
      value: stats.todayCreditsUsed.toLocaleString(),
      icon: Coins,
      sub: "积分流水负向合计",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">工作台</h1>
        <p className="text-sm text-muted-foreground">Han Portrait / 汉韵写真运营概览</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn(
                "rounded-xl border border-border bg-card p-5 transition-colors hover:border-amber-500/20",
                card.danger && "border-red-500/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10", card.danger && "bg-red-500/10")}>
                  <Icon className={cn("h-5 w-5 text-amber-500/70", card.danger && "text-red-400")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{card.label}</p>
                  <p className="text-xl font-bold text-foreground">{card.value}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">最近失败生成任务</h2>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-500/10 bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">用户</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">失败原因</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/5">
                {recentFailedGenerations.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground">{item.userEmail || "-"}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 max-w-[260px] truncate text-xs text-red-400" title={item.error || ""}>{item.error || "-"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</td>
                  </tr>
                ))}
                {recentFailedGenerations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">暂无失败任务</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">最近支付记录</h2>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-500/10 bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">用户</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/5">
                {recentPayments.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground">{item.userEmail || "-"}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      {(item.amountCents / 100).toFixed(2)} {item.currency.toUpperCase()}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">暂无支付记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
