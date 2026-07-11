import Link from "next/link";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { creditLedger, payment, user } from "@/lib/db/schema";
import type { Locale } from "@/i18n.config";
import { cn } from "@/lib/utils";

type PaymentDetailPageProps = {
  params: Promise<{
    locale: Locale;
    id: string;
  }>;
};

const statusLabels: Record<string, string> = {
  succeeded: "成功",
  completed: "已完成",
  paid: "已支付",
  pending: "待处理",
  failed: "失败",
  canceled: "已取消",
};

const typeLabels: Record<string, string> = {
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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 break-all text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isGood = status === "succeeded" || status === "completed" || status === "paid";
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

export default async function AdminPaymentDetailPage({ params }: PaymentDetailPageProps) {
  const { locale, id } = await params;

  const rows = await db
    .select({
      id: payment.id,
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      userId: payment.userId,
      userEmail: user.email,
      userName: user.name,
      amountCents: payment.amountCents,
      currency: payment.currency,
      status: payment.status,
      type: payment.type,
      planKey: payment.planKey,
      creditsGranted: payment.creditsGranted,
      raw: payment.raw,
      createdAt: payment.createdAt,
    })
    .from(payment)
    .leftJoin(user, eq(payment.userId, user.id))
    .where(eq(payment.id, id))
    .limit(1);

  const record = rows[0];

  if (!record) {
    return (
      <div className="space-y-6">
        <Link href={`/${locale}/admin/payments`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          返回订单与支付
        </Link>
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">订单不存在</h1>
          <p className="mt-2 text-sm text-muted-foreground">该订单可能不存在，或 ID 不正确。</p>
        </div>
      </div>
    );
  }

  const ledgerRows = await db
    .select()
    .from(creditLedger)
    .where(eq(creditLedger.paymentId, record.id))
    .limit(10);

  const webhookStatus = record.raw ? "已接收并处理" : "无原始 webhook 记录";
  const grantStatus =
    record.creditsGranted > 0
      ? ledgerRows.length > 0
        ? "已发放"
        : "可能未写入流水"
      : "无积分发放";

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/payments`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        返回订单与支付
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">支付详情</h1>
        <p className="text-sm text-muted-foreground">{record.id}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field
          label="用户"
          value={
            <Link href={`/${locale}/admin/users/${record.userId}`} className="text-amber-200 hover:text-amber-100">
              {record.userEmail || record.userName || record.userId}
            </Link>
          }
        />
        <Field label="Creem 订单 ID" value={record.providerPaymentId} />
        <Field label="支付状态" value={<StatusBadge status={record.status} />} />
        <Field label="Webhook 状态" value={webhookStatus} />
        <Field label="积分发放状态" value={grantStatus} />
        <Field label="发放积分数量" value={record.creditsGranted.toLocaleString()} />
        <Field label="产品类型" value={typeLabels[record.type] || record.type} />
        <Field label="套餐/积分包" value={record.planKey ? planLabels[record.planKey] || record.planKey : "-"} />
        <Field label="金额" value={`${(record.amountCents / 100).toFixed(2)} ${record.currency.toUpperCase()}`} />
        <Field label="支付渠道" value={record.provider} />
        <Field label="创建时间" value={format(new Date(record.createdAt), "yyyy-MM-dd HH:mm")} />
        <Field label="积分流水条数" value={ledgerRows.length.toLocaleString()} />
      </div>

      <section className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">关联积分流水</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-500/10 bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">流水 ID</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">变动</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">原因</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/5">
              {ledgerRows.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs text-muted-foreground">{item.id}</td>
                  <td className={cn("px-4 py-3 text-right text-sm font-medium", item.delta > 0 ? "text-emerald-300" : "text-red-300")}>
                    {item.delta > 0 ? "+" : ""}{item.delta}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{item.reason}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</td>
                </tr>
              ))}
              {ledgerRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">暂无关联积分流水</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
