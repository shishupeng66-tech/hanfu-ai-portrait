import Image from "next/image";
import Link from "next/link";
import { count, desc, eq, sql } from "drizzle-orm";
import { format } from "date-fns";
import { ArrowLeft, CreditCard, ImageIcon, ReceiptText, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { creditLedger, generationHistory, payment, subscription, user } from "@/lib/db/schema";
import type { Locale } from "@/i18n.config";
import { cn } from "@/lib/utils";

type UserDetailPageProps = {
  params: Promise<{
    locale: Locale;
    id: string;
  }>;
  searchParams?: Promise<{
    tab?: string;
  }>;
};

const tabs = [
  { key: "overview", label: "概览" },
  { key: "orders", label: "订单" },
  { key: "credits", label: "积分流水" },
  { key: "generations", label: "AI生成记录" },
];

const roleLabels: Record<string, string> = {
  admin: "管理员",
  user: "普通用户",
};

const planLabels: Record<string, string> = {
  free: "免费",
  plus_monthly: "Plus 月付",
  pro_monthly: "Pro 月付",
  proplus_yearly: "Pro+ 年付",
};

const paymentTypeLabels: Record<string, string> = {
  one_time: "积分包",
  subscription: "会员订阅",
};

const statusLabels: Record<string, string> = {
  succeeded: "成功",
  completed: "成功",
  paid: "已支付",
  active: "生效中",
  pending: "待处理",
  processing: "处理中",
  failed: "失败",
  canceled: "已取消",
};

const creditReasonLabels: Record<string, string> = {
  manual_adjustment: "人工调整",
  adjustment: "人工调整",
  refund: "退款返还",
  bonus: "活动赠送",
  compensation: "失败补偿",
  one_time_pack: "积分包购买",
  subscription_cycle: "订阅周期发放",
  subscription_schedule: "订阅计划发放",
  image_generation: "图片生成",
  portrait_generation: "写真生成",
  video_generation: "视频生成",
  image_generation_refund: "图片生成退款",
  video_generation_refund: "视频生成退款",
  chat_usage: "聊天消耗",
};

function parseGenerationMetadata(metadata: string | null) {
  if (!metadata) return { templateName: null, templateKey: null };
  try {
    const parsed = JSON.parse(metadata) as { templateName?: string; templateKey?: string };
    return {
      templateName: parsed.templateName ?? null,
      templateKey: parsed.templateKey ?? null,
    };
  } catch {
    return { templateName: null, templateKey: null };
  }
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-amber-500/25">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
          <Icon className="h-4 w-4 text-amber-300" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-muted-foreground">
        暂无数据
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isGood = status === "succeeded" || status === "completed" || status === "active" || status === "paid";
  const isBad = status === "failed" || status === "canceled";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        isGood && "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        isBad && "border-red-500/20 bg-red-500/10 text-red-300",
        !isGood && !isBad && "border-amber-500/20 bg-amber-500/10 text-amber-300"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}

export default async function AdminUserDetailPage({ params, searchParams }: UserDetailPageProps) {
  const { locale, id } = await params;
  const resolvedSearchParams = await searchParams;
  const requestedTab = resolvedSearchParams?.tab ?? "overview";
  const activeTab = tabs.some((item) => item.key === requestedTab) ? requestedTab : "overview";

  const users = await db.select().from(user).where(eq(user.id, id)).limit(1);
  const targetUser = users[0];

  if (!targetUser) {
    return (
      <div className="space-y-6">
        <Link href={`/${locale}/admin/users`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回用户中心
        </Link>
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">用户不存在</h1>
          <p className="mt-2 text-sm text-muted-foreground">该用户可能已被删除，或 ID 不正确。</p>
        </div>
      </div>
    );
  }

  const [creditRows, paymentRows, subscriptionRows, generationRows, totalSpendRows, generationCountRows] = await Promise.all([
    db.select().from(creditLedger).where(eq(creditLedger.userId, id)).orderBy(desc(creditLedger.createdAt)).limit(20),
    db.select().from(payment).where(eq(payment.userId, id)).orderBy(desc(payment.createdAt)).limit(20),
    db.select().from(subscription).where(eq(subscription.userId, id)).orderBy(desc(subscription.updatedAt)).limit(1),
    db.select().from(generationHistory).where(eq(generationHistory.userId, id)).orderBy(desc(generationHistory.createdAt)).limit(20),
    db
      .select({ total: sql<number>`COALESCE(sum(${payment.amountCents}), 0)` })
      .from(payment)
      .where(sql`${payment.userId} = ${id} and ${payment.status} = 'succeeded'`),
    db.select({ total: count() }).from(generationHistory).where(eq(generationHistory.userId, id)),
  ]);

  const currentSubscription = subscriptionRows[0];
  const totalSpend = Number(totalSpendRows[0]?.total ?? 0) / 100;
  const generationCount = Number(generationCountRows[0]?.total ?? 0);
  const userInitial = (targetUser.name || targetUser.email).slice(0, 1).toUpperCase();

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/users`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        返回用户中心
      </Link>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-amber-500/10 text-xl font-semibold text-amber-200">
              {targetUser.image ? (
                <Image src={targetUser.image} alt="用户头像" fill sizes="64px" className="object-cover" unoptimized />
              ) : (
                userInitial
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-foreground">{targetUser.name || "未命名用户"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{targetUser.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">注册时间：{format(new Date(targetUser.createdAt), "yyyy-MM-dd HH:mm")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={targetUser.banned ? "failed" : "active"} />
            <span className="inline-flex items-center rounded-full border border-border bg-background/50 px-2 py-0.5 text-xs text-muted-foreground">
              {roleLabels[targetUser.role] || targetUser.role}
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200">
              {planLabels[targetUser.planKey || "free"] || targetUser.planKey || "免费"}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Wallet} label="当前积分" value={targetUser.credits.toLocaleString()} />
          <StatCard icon={ReceiptText} label="累计消费" value={`$${totalSpend.toFixed(2)}`} />
          <StatCard icon={ImageIcon} label="生成次数" value={generationCount.toLocaleString()} />
          <StatCard icon={CreditCard} label="账号状态" value={targetUser.banned ? "已封禁" : "正常"} />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-sm">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/${locale}/admin/users/${id}${tab.key === "overview" ? "" : `?tab=${tab.key}`}`}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-amber-500/15 text-amber-200"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Section title="订阅信息">
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">套餐</p>
                <p className="mt-1 text-sm font-medium text-foreground">{currentSubscription ? planLabels[currentSubscription.planKey] || currentSubscription.planKey : "暂无订阅"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">状态</p>
                <p className="mt-1 text-sm font-medium text-foreground">{currentSubscription?.status ? statusLabels[currentSubscription.status] || currentSubscription.status : "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">到期时间</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {currentSubscription?.currentPeriodEnd ? format(new Date(currentSubscription.currentPeriodEnd), "yyyy-MM-dd HH:mm") : "-"}
                </p>
              </div>
            </div>
          </Section>

          <Section title="最近 AI 生成">
            <div className="divide-y divide-amber-500/5">
              {generationRows.slice(0, 5).map((item) => {
                const metadata = parseGenerationMetadata(item.metadata);
                return (
                  <Link
                    key={item.id}
                    href={`/${locale}/admin/generations/${item.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{metadata.templateName || item.type}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </Link>
                );
              })}
              {generationRows.length === 0 && <div className="px-5 py-12 text-center text-sm text-muted-foreground">暂无生成记录</div>}
            </div>
          </Section>
        </div>
      )}

      {activeTab === "orders" && (
        <Section title="订单记录（最近 20 条）">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-500/10 bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">订单</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">产品类型</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/5">
                {paymentRows.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/admin/payments/${item.id}`} className="text-xs text-amber-200 hover:text-amber-100">
                        {item.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{paymentTypeLabels[item.type] || item.type}</td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">{(item.amountCents / 100).toFixed(2)} {item.currency.toUpperCase()}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</td>
                  </tr>
                ))}
                {paymentRows.length === 0 && <EmptyRow colSpan={5} />}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {activeTab === "credits" && (
        <Section title="积分流水（最近 20 条）">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-500/10 bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">变动积分</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">原因</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">关联 ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/5">
                {creditRows.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className={cn("px-4 py-3 text-sm font-medium", item.delta > 0 ? "text-emerald-300" : "text-red-300")}>
                      {item.delta > 0 ? "+" : ""}{item.delta}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{creditReasonLabels[item.reason] || item.reason}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.paymentId || "-"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</td>
                  </tr>
                ))}
                {creditRows.length === 0 && <EmptyRow colSpan={4} />}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {activeTab === "generations" && (
        <Section title="AI 生成记录（最近 20 条）">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-500/10 bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">任务</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">模板/类型</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">消耗积分</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">失败原因</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">创建时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/5">
                {generationRows.map((item) => {
                  const metadata = parseGenerationMetadata(item.metadata);
                  return (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link href={`/${locale}/admin/generations/${item.id}`} className="text-xs text-amber-200 hover:text-amber-100">
                          {item.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">{metadata.templateName || item.type}</p>
                        {metadata.templateKey && <p className="text-xs text-muted-foreground">{metadata.templateKey}</p>}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">{item.creditsUsed}</td>
                      <td className="px-4 py-3 text-xs text-red-300 max-w-[320px] truncate" title={item.error || ""}>{item.error || "-"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</td>
                    </tr>
                  );
                })}
                {generationRows.length === 0 && <EmptyRow colSpan={6} />}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}
