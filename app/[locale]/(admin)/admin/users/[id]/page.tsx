import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { creditLedger, generationHistory, payment, subscription, user } from "@/lib/db/schema";
import type { Locale } from "@/i18n.config";
import { cn } from "@/lib/utils";

type UserDetailPageProps = {
  params: Promise<{
    locale: Locale;
    id: string;
  }>;
};

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

const generationStatusLabels: Record<string, string> = {
  completed: "成功",
  failed: "失败",
  processing: "处理中",
  pending: "等待中",
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

const paymentStatusLabels: Record<string, string> = {
  succeeded: "成功",
  paid: "已支付",
  completed: "已完成",
  pending: "待处理",
  failed: "失败",
  canceled: "已取消",
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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium text-foreground break-all">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
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
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-muted-foreground">
        暂无数据
      </td>
    </tr>
  );
}

export default async function AdminUserDetailPage({ params }: UserDetailPageProps) {
  const { locale, id } = await params;

  const users = await db
    .select()
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  const targetUser = users[0];

  if (!targetUser) {
    return (
      <div className="space-y-6">
        <Link href={`/${locale}/admin/users`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回用户中心
        </Link>
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">用户不存在</h1>
          <p className="mt-2 text-sm text-muted-foreground">该用户可能已被删除，或 ID 不正确。</p>
        </div>
      </div>
    );
  }

  const [creditRows, paymentRows, subscriptionRows, generationRows] = await Promise.all([
    db
      .select()
      .from(creditLedger)
      .where(eq(creditLedger.userId, id))
      .orderBy(desc(creditLedger.createdAt))
      .limit(20),
    db
      .select()
      .from(payment)
      .where(eq(payment.userId, id))
      .orderBy(desc(payment.createdAt))
      .limit(20),
    db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, id))
      .orderBy(desc(subscription.updatedAt))
      .limit(1),
    db
      .select()
      .from(generationHistory)
      .where(eq(generationHistory.userId, id))
      .orderBy(desc(generationHistory.createdAt))
      .limit(20),
  ]);

  const currentSubscription = subscriptionRows[0];

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/users`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        返回用户中心
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">用户详情</h1>
        <p className="text-sm text-muted-foreground">{targetUser.email}</p>
      </div>

      <Section title="用户基本信息">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
          <Field label="邮箱" value={targetUser.email} />
          <Field label="名称" value={targetUser.name || "-"} />
          <Field label="角色" value={roleLabels[targetUser.role] || targetUser.role} />
          <Field label="是否封禁" value={targetUser.banned ? "已封禁" : "正常"} />
          <Field label="邮箱是否验证" value={targetUser.emailVerified ? "已验证" : "未验证"} />
          <Field label="注册时间" value={format(new Date(targetUser.createdAt), "yyyy-MM-dd HH:mm")} />
          <Field label="当前积分" value={targetUser.credits.toLocaleString()} />
          <Field label="当前套餐" value={planLabels[targetUser.planKey || "free"] || targetUser.planKey || "免费"} />
        </div>
      </Section>

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
                <tr key={item.id}>
                  <td className={cn("px-4 py-3 text-sm font-medium", item.delta > 0 ? "text-emerald-400" : "text-red-400")}>
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

      <Section title="支付记录（最近 20 条）">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-500/10 bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">产品类型</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">金额</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">创建时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {paymentRows.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-foreground">{paymentTypeLabels[item.type] || item.type}</td>
                  <td className="px-4 py-3 text-right text-sm text-foreground">{(item.amountCents / 100).toFixed(2)} {item.currency.toUpperCase()}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{paymentStatusLabels[item.status] || item.status}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</td>
                </tr>
              ))}
              {paymentRows.length === 0 && <EmptyRow colSpan={4} />}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="订阅信息">
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          <Field label="套餐" value={currentSubscription ? planLabels[currentSubscription.planKey] || currentSubscription.planKey : "暂无订阅"} />
          <Field label="状态" value={currentSubscription?.status || "-"} />
          <Field
            label="到期时间"
            value={currentSubscription?.currentPeriodEnd ? format(new Date(currentSubscription.currentPeriodEnd), "yyyy-MM-dd HH:mm") : "-"}
          />
        </div>
      </Section>

      <Section title="生成记录（最近 20 条）">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-500/10 bg-muted/50">
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
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-foreground">{generationStatusLabels[item.status] || item.status}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{metadata.templateName || item.type}</p>
                      {metadata.templateKey && <p className="text-xs text-muted-foreground">{metadata.templateKey}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">{item.creditsUsed}</td>
                    <td className="px-4 py-3 text-xs text-red-400 max-w-[320px] truncate" title={item.error || ""}>{item.error || "-"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</td>
                  </tr>
                );
              })}
              {generationRows.length === 0 && <EmptyRow colSpan={5} />}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
