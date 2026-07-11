"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/button";

interface SubscriptionItem {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  planKey: string;
  status: string;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  expiredSubscriptions: number;
}

interface SubscriptionsTableProps {
  subscriptions: SubscriptionItem[];
  stats: SubscriptionStats;
}

const statusBadgeClasses: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  trial: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  canceled: "bg-red-500/10 text-red-400 border-red-500/20",
  expired: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
};

export function SubscriptionsTable({ subscriptions, stats }: SubscriptionsTableProps) {
  const t = useTranslations("Admin.subscriptions");
  const tpl = useTranslations("Admin.plans");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filtered = subscriptions.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const name = (s.userName || "").toLowerCase();
      const email = (s.userEmail || "").toLowerCase();
      const plan = tpl(s.planKey).toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !plan.includes(q)) return false;
    }
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const statCards = [
    { label: t("totalSubscriptions"), value: stats.totalSubscriptions },
    { label: t("activeSubscriptions"), value: stats.activeSubscriptions },
    { label: t("canceledSubscriptions"), value: stats.canceledSubscriptions },
    { label: t("expiredSubscriptions"), value: stats.expiredSubscriptions },
  ];

  const getDaysRemaining = (endDate: Date | null) => {
    if (!endDate) return null;
    const now = new Date();
    const diff = Math.ceil((new Date(endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const inputClass = "flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">Han Portrait · 订阅管理</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-amber-500/20">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-2 flex-wrap">
        <input
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className={cn(inputClass, "max-w-sm")}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className={cn(inputClass, "w-32")}
        >
          <option value="all">{t("allStatus")}</option>
          <option value="active">{t("active")}</option>
          <option value="canceled">{t("canceled")}</option>
          <option value="expired">{t("expired")}</option>
          <option value="trial">{t("trial")}</option>
        </select>
        {(searchQuery || statusFilter !== "all") && (
          <Button variant="simple" size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setCurrentPage(1); }}>
            <X className="h-4 w-4 mr-1" />
            清空
          </Button>
        )}
      </div>

      {/* 表格 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-500/10 bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("user")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("plan")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("status")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">{t("expiryDate")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">{t("createdAt")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {paged.map((s) => {
                const days = getDaysRemaining(s.currentPeriodEnd);
                return (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{s.userName || t("unknownUser")}</p>
                      <p className="text-xs text-muted-foreground">{s.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{tpl(s.planKey)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                        statusBadgeClasses[s.status] || "bg-muted text-muted-foreground border-border"
                      )}>
                        {t(s.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {s.currentPeriodEnd ? format(new Date(s.currentPeriodEnd), "yyyy-MM-dd") : "-"}
                        </span>
                        {days !== null && (
                          <span className={cn("ml-2 text-xs", days < 0 ? "text-red-400" : days <= 7 ? "text-amber-400" : "text-muted-foreground")}>
                            {t("daysRemaining", { days })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{format(new Date(s.createdAt), "yyyy-MM-dd")}</span>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {t("noSubscriptions")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-amber-500/10 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {t("pagination.page", { current: safePage, total: totalPages })}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="simple" size="sm" onClick={() => setCurrentPage((p) => p - 1)} disabled={safePage <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="simple" size="sm" onClick={() => setCurrentPage((p) => p + 1)} disabled={safePage >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}