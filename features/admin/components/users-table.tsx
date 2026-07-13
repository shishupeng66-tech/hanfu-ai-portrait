"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Ban,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  CreditCard,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { updateUserRole, banUser } from "@/features/admin/actions/user-actions";
import type { AdminUserListItem } from "@/lib/admin-user-directory";

interface UsersTableProps {
  users: AdminUserListItem[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalUsers: number;
  query: string;
}

const statusBadgeClasses: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  banned: "bg-red-500/10 text-red-400 border-red-500/20",
  unverified: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusBadgeClasses[status] || "bg-muted text-muted-foreground border-border"
      )}
    >
      {status}
    </span>
  );
}

export function UsersTable({
  users,
  currentPage,
  pageSize,
  totalPages,
  totalUsers,
  query,
}: UsersTableProps) {
  const t = useTranslations("Admin.users");
  const tr = useTranslations("Admin.roles");
  const locale = useLocale();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(query);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [banLoading, setBanLoading] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [creditsUser, setCreditsUser] = useState<AdminUserListItem | null>(null);
  const [adjustment, setAdjustment] = useState(0);
  const [adjustReason, setAdjustReason] = useState("manualAdjustment");
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [subscriptionUser, setSubscriptionUser] = useState<AdminUserListItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    router.push(`/${locale}/admin/users?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    router.push(`/${locale}/admin/users`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (page > 1) params.set("page", String(page));
    router.push(`/${locale}/admin/users?${params.toString()}`);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleLoading(userId);
    try {
      await updateUserRole(userId, newRole);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setRoleLoading(null);
    }
  };

  const handleBan = async (userId: string, banned: boolean) => {
    setBanLoading(userId);
    try {
      await banUser(userId, banned);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setBanLoading(null);
    }
  };

  const handleCreditsAdjust = async () => {
    if (!creditsUser) return;
    setCreditsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${creditsUser.id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta: adjustment, reason: adjustReason }),
      });
      if (res.ok) {
        setCreditsUser(null);
        setAdjustment(0);
        setAdjustReason("manualAdjustment");
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleSubscriptionUpdate = async () => {
    if (!subscriptionUser || !selectedPlan) return;
    setSubscriptionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${subscriptionUser.id}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: selectedPlan }),
      });
      if (res.ok) {
        setSubscriptionUser(null);
        setSelectedPlan("");
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const getUserStatus = (u: AdminUserListItem) => {
    if (u.banned) return "banned";
    if (!u.emailVerified) return "unverified";
    return "active";
  };

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalUsers);

  const inputClass = "flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
  const selectClass = "flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-6">
      {/* 搜索栏 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(inputClass, "max-w-sm")}
        />
        <Button type="submit" variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          {t("searchAction")}
        </Button>
        {query && (
          <Button type="button" variant="simple" size="sm" onClick={clearSearch}>
            <X className="h-4 w-4 mr-1" />
            {t("clearSearch")}
          </Button>
        )}
      </form>

      {/* 表格 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-500/10 bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("user")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("role")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("credits")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{t("status")}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">{t("joined")}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {users.map((u) => {
                const status = getUserStatus(u);
                return (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{u.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={roleLoading === u.id}
                        className={cn(selectClass, "h-8 w-28 text-xs bg-transparent")}
                      >
                        <option value="user">{tr("user")}</option>
                        <option value="admin">{tr("admin")}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-foreground">{u.credits.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{format(new Date(u.createdAt), "yyyy-MM-dd")}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          title={t("viewDetails")}
                          onClick={() => setSelectedUser(u)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title={t("adjustCredits")}
                          onClick={() => { setCreditsUser(u); setAdjustment(0); setAdjustReason("manualAdjustment"); }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                        <button
                          title={t("manageSubscription")}
                          onClick={() => { setSubscriptionUser(u); setSelectedPlan(u.planKey || "free"); }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                        <button
                          title={u.banned ? t("unban") : t("ban")}
                          onClick={() => handleBan(u.id, !u.banned)}
                          disabled={banLoading === u.id}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                        >
                          {u.banned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {query ? t("emptySearchState") : t("emptyState")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-amber-500/10 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {t("pageSummary", { from, to, total: totalUsers })}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="simple" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {t("pagination.page", { current: currentPage, total: totalPages })}
              </span>
              <Button variant="simple" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 用户详情弹窗 */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("userDetails")}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t("name")}</span><span className="text-sm font-medium">{selectedUser.name || "-"}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t("email")}</span><span className="text-sm font-medium">{selectedUser.email}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t("role")}</span><span className="text-sm font-medium">{tr(selectedUser.role)}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t("credits")}</span><span className="text-sm font-medium">{selectedUser.credits.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t("joined")}</span><span className="text-sm font-medium">{format(new Date(selectedUser.createdAt), "yyyy-MM-dd HH:mm")}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 积分调整弹窗 */}
      <Dialog open={!!creditsUser} onOpenChange={() => setCreditsUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adjustCredits")}</DialogTitle>
            <DialogDescription>{t("currentCredits")}: {creditsUser?.credits.toLocaleString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("adjustment")}</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setAdjustment((v) => v - 1)}><Minus className="h-4 w-4" /></Button>
                <input
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(Number(e.target.value))}
                  className={cn(inputClass, "text-center w-24")}
                />
                <Button variant="outline" size="sm" onClick={() => setAdjustment((v) => v + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("reason")}</Label>
              <select value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className={selectClass}>
                <option value="manualAdjustment">{t("manualAdjustment")}</option>
                <option value="refund">{t("refund")}</option>
                <option value="bonus">{t("bonus")}</option>
                <option value="compensation">{t("compensation")}</option>
              </select>
            </div>
            {creditsUser && (
              <p className="text-sm text-muted-foreground">{t("newBalance")}: {(creditsUser.credits + adjustment).toLocaleString()}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="simple" onClick={() => setCreditsUser(null)}>{t("cancel")}</Button>
            <Button onClick={handleCreditsAdjust} disabled={creditsLoading || adjustment === 0}>
              {adjustment > 0 ? t("addCredits") : t("deductCredits")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 订阅管理弹窗 */}
      <Dialog open={!!subscriptionUser} onOpenChange={() => setSubscriptionUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("manageSubscription")}</DialogTitle>
            <DialogDescription>{t("currentPlan")}: {subscriptionUser?.planKey || "free"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("selectPlan")}</Label>
              <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className={selectClass}>
                <option value="free">Free</option>
                <option value="plus_monthly">Plus Monthly</option>
                <option value="pro_monthly">Pro Monthly</option>
                <option value="pro_plus_yearly">Pro+ Yearly</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="simple" onClick={() => setSubscriptionUser(null)}>{t("cancel")}</Button>
            <Button onClick={handleSubscriptionUpdate} disabled={subscriptionLoading || !selectedPlan}>{t("updateSubscription")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}