"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { format } from "date-fns";
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
import { cn } from "@/lib/utils";
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

const roleLabels: Record<string, string> = {
  admin: "管理员",
  user: "普通用户",
};

const statusLabels: Record<string, string> = {
  active: "正常",
  banned: "已封禁",
  unverified: "未验证",
};

const planLabels: Record<string, string> = {
  free: "免费",
  plus_monthly: "Plus 月付",
  pro_monthly: "Pro 月付",
  proplus_yearly: "Pro+ 年付",
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

export function UsersTable({
  users,
  currentPage,
  pageSize,
  totalPages,
  totalUsers,
  query,
}: UsersTableProps) {
  const locale = useLocale();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(query);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [banLoading, setBanLoading] = useState<string | null>(null);
  const [creditsUser, setCreditsUser] = useState<AdminUserListItem | null>(null);
  const [adjustment, setAdjustment] = useState(0);
  const [adjustReason, setAdjustReason] = useState("manual_adjustment");
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [subscriptionUser, setSubscriptionUser] = useState<AdminUserListItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

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
    if (!window.confirm(`确认将该用户角色调整为「${roleLabels[newRole] || newRole}」吗？`)) {
      router.refresh();
      return;
    }

    setRoleLoading(userId);
    setOperationError(null);
    try {
      await updateUserRole(userId, newRole);
      setOperationMessage("角色已更新");
      router.refresh();
    } catch {
      setOperationError("角色更新失败");
    } finally {
      setRoleLoading(null);
    }
  };

  const handleBan = async (userId: string, banned: boolean) => {
    const action = banned ? "封禁" : "解封";
    if (!window.confirm(`确认${action}该用户吗？`)) return;

    setBanLoading(userId);
    setOperationError(null);
    try {
      await banUser(userId, banned);
      setOperationMessage(`用户已${action}`);
      router.refresh();
    } catch {
      setOperationError(`${action}失败`);
    } finally {
      setBanLoading(null);
    }
  };

  const handleCreditsAdjust = async () => {
    if (!creditsUser) return;
    const reason = adjustReason.trim();
    if (!reason) {
      setOperationError("请填写积分调整原因");
      return;
    }
    if (creditsUser.credits + adjustment < 0) {
      setOperationError("扣减后积分不能小于 0");
      return;
    }
    if (!window.confirm(`确认将 ${creditsUser.email} 的积分调整 ${adjustment > 0 ? "+" : ""}${adjustment} 吗？`)) {
      return;
    }

    setCreditsLoading(true);
    setOperationError(null);
    try {
      const res = await fetch(`/api/admin/users/${creditsUser.id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: adjustment, reason }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || "积分更新失败");
      }
      setCreditsUser(null);
      setAdjustment(0);
      setAdjustReason("manual_adjustment");
      setOperationMessage("积分已更新");
      router.refresh();
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : "积分更新失败");
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleSubscriptionUpdate = async () => {
    if (!subscriptionUser || !selectedPlan) return;
    const status = selectedPlan === "free" ? "canceled" : "active";
    if (!window.confirm(`确认将 ${subscriptionUser.email} 的套餐调整为「${planLabels[selectedPlan] || selectedPlan}」吗？`)) {
      return;
    }

    setSubscriptionLoading(true);
    setOperationError(null);
    try {
      const res = await fetch(`/api/admin/users/${subscriptionUser.id}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: selectedPlan, status }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || "订阅更新失败");
      }
      setSubscriptionUser(null);
      setSelectedPlan("");
      setOperationMessage("订阅已更新");
      router.refresh();
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : "订阅更新失败");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const getUserStatus = (u: AdminUserListItem) => {
    if (u.banned) return "banned";
    if (!u.emailVerified) return "unverified";
    return "active";
  };

  const from = totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalUsers);

  const inputClass = "flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
  const selectClass = "flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-6">
      {(operationError || operationMessage) && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            operationError
              ? "border-red-500/20 bg-red-500/10 text-red-400"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          )}
        >
          {operationError || operationMessage}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          placeholder="搜索用户名或邮箱"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(inputClass, "max-w-sm")}
        />
        <Button type="submit" variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          搜索
        </Button>
        {query && (
          <Button type="button" variant="simple" size="sm" onClick={clearSearch}>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">用户</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">角色</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">积分</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">注册时间</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {users.map((u) => {
                const status = getUserStatus(u);
                return (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{u.name || "-"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={roleLoading === u.id}
                        className={cn(selectClass, "h-8 w-28 text-xs bg-transparent")}
                      >
                        <option value="user">普通用户</option>
                        <option value="admin">管理员</option>
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
                          title="查看详情"
                          onClick={() => router.push(`/${locale}/admin/users/${u.id}`)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="调整积分"
                          onClick={() => { setCreditsUser(u); setAdjustment(0); setAdjustReason("manual_adjustment"); setOperationError(null); }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                        <button
                          title="调整订阅"
                          onClick={() => { setSubscriptionUser(u); setSelectedPlan(u.planKey || "free"); setOperationError(null); }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                        <button
                          title={u.banned ? "解封" : "封禁"}
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
                    {query ? "没有找到匹配用户" : "暂无用户"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-amber-500/10 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              第 {from}-{to} 条，共 {totalUsers} 条
            </span>
            <div className="flex items-center gap-1">
              <Button variant="simple" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                第 {currentPage} / {totalPages} 页
              </span>
              <Button variant="simple" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!creditsUser} onOpenChange={() => setCreditsUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整积分</DialogTitle>
            <DialogDescription>当前积分：{creditsUser?.credits.toLocaleString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>调整数量</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setAdjustment((v) => v - 1)}><Minus className="h-4 w-4" /></Button>
                <input
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(Number(e.target.value))}
                  className={cn(inputClass, "text-center w-28")}
                />
                <Button variant="outline" size="sm" onClick={() => setAdjustment((v) => v + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>调整原因</Label>
              <select value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className={selectClass}>
                <option value="manual_adjustment">人工调整</option>
                <option value="refund">退款返还</option>
                <option value="bonus">活动赠送</option>
                <option value="compensation">失败补偿</option>
              </select>
            </div>
            {creditsUser && (
              <p className={cn("text-sm", creditsUser.credits + adjustment < 0 ? "text-red-400" : "text-muted-foreground")}>
                调整后积分：{(creditsUser.credits + adjustment).toLocaleString()}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="simple" onClick={() => setCreditsUser(null)}>取消</Button>
            <Button
              onClick={handleCreditsAdjust}
              disabled={creditsLoading || adjustment === 0 || !adjustReason.trim() || Boolean(creditsUser && creditsUser.credits + adjustment < 0)}
            >
              {adjustment > 0 ? "补积分" : "扣积分"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!subscriptionUser} onOpenChange={() => setSubscriptionUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整订阅</DialogTitle>
            <DialogDescription>当前套餐：{planLabels[subscriptionUser?.planKey || "free"] || subscriptionUser?.planKey || "免费"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>选择套餐</Label>
              <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className={selectClass}>
                <option value="free">免费</option>
                <option value="plus_monthly">Plus 月付</option>
                <option value="pro_monthly">Pro 月付</option>
                <option value="proplus_yearly">Pro+ 年付</option>
              </select>
              <p className="text-xs text-muted-foreground">
                免费套餐会提交 canceled 状态，付费套餐会提交 active 状态。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="simple" onClick={() => setSubscriptionUser(null)}>取消</Button>
            <Button onClick={handleSubscriptionUpdate} disabled={subscriptionLoading || !selectedPlan}>更新订阅</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
