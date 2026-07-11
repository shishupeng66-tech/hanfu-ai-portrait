"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/button";

interface CreditTransaction {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  delta: number;
  reason: string;
  paymentId: string | null;
  createdAt: Date;
  userCredits: number | null;
}

interface CreditStats {
  totalCreditsIssued: number;
  totalCreditsUsed: number;
  totalTransactions: number;
  averageUsage: number;
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  credits: number;
}

interface CreditsTableProps {
  transactions: CreditTransaction[];
  stats: CreditStats;
  topUsers: TopUser[];
}

export function CreditsTable({ transactions, stats, topUsers }: CreditsTableProps) {
  const t = useTranslations("Admin.credits");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const name = (tx.userName || "").toLowerCase();
      const email = (tx.userEmail || "").toLowerCase();
      const reason = t(tx.reason) || tx.reason;
      if (!name.includes(q) && !email.includes(q) && !reason.toLowerCase().includes(q)) return false;
    }
    if (typeFilter === "earned" && tx.delta <= 0) return false;
    if (typeFilter === "spent" && tx.delta >= 0) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const statCards = [
    { label: t("totalIssued"), value: stats.totalCreditsIssued.toLocaleString(), color: "text-emerald-400" },
    { label: t("totalUsed"), value: stats.totalCreditsUsed.toLocaleString(), color: "text-red-400" },
    { label: t("totalTransactions"), value: stats.totalTransactions.toLocaleString() },
    { label: t("avgUsage"), value: Math.round(stats.averageUsage).toLocaleString() },
  ];

  const inputClass = "flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">Han Portrait · 积分管理</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-amber-500/20">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={cn("mt-1 text-2xl font-bold text-foreground", card.color)}>{card.value}</p>
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
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          className={cn(inputClass, "w-28")}
        >
          <option value="all">{t("allTypes")}</option>
          <option value="earned">{t("earned")}</option>
          <option value="spent">{t("spent")}</option>
        </select>
        {(searchQuery || typeFilter !== "all") && (
          <Button variant="simple" size="sm" onClick={() => { setSearchQuery(""); setTypeFilter("all"); setCurrentPage(1); }}>
            <X className="h-4 w-4 mr-1" />
            清空
          </Button>
        )}
      </div>

      {/* 积分流水表格 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-500/10 bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("user")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("change")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">{t("reason")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("balance")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">{t("date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {paged.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{tx.userName || t("unknownUser")}</p>
                    <p className="text-xs text-muted-foreground">{tx.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("text-sm font-medium", tx.delta > 0 ? "text-emerald-400" : "text-red-400")}>
                      {tx.delta > 0 ? "+" : ""}{tx.delta.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">{t(tx.reason) || tx.reason}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-foreground">{(tx.userCredits ?? 0).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">{format(new Date(tx.createdAt), "yyyy-MM-dd HH:mm")}</span>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">{t("noTransactions")}</td>
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

      {/* 积分排行榜 */}
      {topUsers.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">{t("topUsers")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-500/10 bg-muted/50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground w-12">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">{t("user")}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">{t("balance")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/5">
                {topUsers.map((u, i) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 text-xs text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2"><p className="text-sm font-medium text-foreground">{u.name || u.email}</p></td>
                    <td className="px-4 py-2 text-right">
                      <span className="text-sm font-medium text-amber-500/80">{u.credits.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}