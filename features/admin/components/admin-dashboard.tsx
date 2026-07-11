"use client";

import { useTranslations } from "next-intl";
import { Users, MessageSquare, BarChart3, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalPayments: number;
    totalRevenue: number;
    totalChats: number;
    totalCreditsUsed: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    credits: number;
    role: string;
    createdAt: Date;
  }>;
  recentPayments: Array<{
    id: string;
    userId: string;
    userName: string | null;
    userEmail: string | null;
    amountCents: number;
    status: string;
    type: string;
    createdAt: Date;
  }>;
}

const statusBadgeClasses: Record<string, string> = {
  succeeded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  canceled: "bg-red-500/10 text-red-400 border-red-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("Admin.paymentStatuses");
  const label = t(status) || status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusBadgeClasses[status] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {label}
    </span>
  );
}

export function AdminDashboard({ stats, recentUsers, recentPayments }: AdminDashboardProps) {
  const t = useTranslations("Admin.dashboard");
  const tp = useTranslations("Admin.paymentTypes");

  const statCards = [
    {
      label: t("totalUsers"),
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      sub: t("activeUsers") + ": " + stats.activeUsers.toLocaleString(),
    },
    {
      label: t("totalRevenue"),
      value: "¥" + stats.totalRevenue.toFixed(2),
      icon: DollarSign,
      sub: t("totalPayments") + ": " + stats.totalPayments.toLocaleString(),
    },
    {
      label: t("totalChats"),
      value: stats.totalChats.toLocaleString(),
      icon: MessageSquare,
      sub: "",
    },
    {
      label: t("creditsUsed"),
      value: stats.totalCreditsUsed.toLocaleString(),
      icon: BarChart3,
      sub: "",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">Han Portrait · 系统概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-amber-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <Icon className="h-5 w-5 text-amber-500/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{card.label}</p>
                  <p className="text-xl font-bold text-foreground">{card.value}</p>
                </div>
              </div>
              {card.sub && (
                <p className="mt-3 text-xs text-muted-foreground">{card.sub}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* 最近用户和支付 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 最近用户 */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">{t("recentUsers")}</h2>
            <span className="text-xs text-muted-foreground">{t("credits")}</span>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {u.name || t("unknownUser")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className="text-sm font-medium text-amber-500/80 ml-3 shrink-0">
                  {u.credits}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">暂无数据</div>
            )}
          </div>
        </div>

        {/* 最近支付 */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">{t("recentPayments")}</h2>
            <span className="text-xs text-muted-foreground">金额</span>
          </div>
          <div className="divide-y divide-border">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {p.userName || p.userEmail || t("unknownUser")}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tp(p.type) || p.type} · {format(new Date(p.createdAt), "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
                <span className="text-sm font-medium text-foreground ml-3 shrink-0">
                  ¥{(p.amountCents / 100).toFixed(2)}
                </span>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">暂无数据</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}