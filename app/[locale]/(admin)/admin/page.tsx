import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditLedger, generationHistory, payment, user } from "@/lib/db/schema";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";

function getLast7Days() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
}

export default async function AdminPage() {
  const [
    todayUsers,
    todayGenerations,
    todayCompletedGenerations,
    todayFailedGenerations,
    todayRevenue,
    todayCreditsUsed,
    generationTrendRows,
    revenueTrendRows,
    recentFailedGenerations,
    recentPayments,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(sql`${user.createdAt} >= date_trunc('day', now())`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(generationHistory)
      .where(sql`${generationHistory.createdAt} >= date_trunc('day', now())`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(generationHistory)
      .where(sql`${generationHistory.createdAt} >= date_trunc('day', now()) and ${generationHistory.status} = 'completed'`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(generationHistory)
      .where(sql`${generationHistory.createdAt} >= date_trunc('day', now()) and ${generationHistory.status} = 'failed'`),
    db
      .select({ total: sql<number>`COALESCE(sum(${payment.amountCents}), 0)` })
      .from(payment)
      .where(sql`${payment.createdAt} >= date_trunc('day', now()) and ${payment.status} = 'succeeded'`),
    db
      .select({ total: sql<number>`COALESCE(sum(abs(${creditLedger.delta})), 0)` })
      .from(creditLedger)
      .where(sql`${creditLedger.createdAt} >= date_trunc('day', now()) and ${creditLedger.delta} < 0`),
    db
      .select({
        date: sql<string>`to_char(${generationHistory.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`,
      })
      .from(generationHistory)
      .where(sql`${generationHistory.createdAt} >= date_trunc('day', now()) - interval '6 days'`)
      .groupBy(sql`to_char(${generationHistory.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${generationHistory.createdAt}, 'YYYY-MM-DD')`),
    db
      .select({
        date: sql<string>`to_char(${payment.createdAt}, 'YYYY-MM-DD')`,
        totalCents: sql<number>`COALESCE(sum(${payment.amountCents}), 0)`,
      })
      .from(payment)
      .where(sql`${payment.createdAt} >= date_trunc('day', now()) - interval '6 days' and ${payment.status} = 'succeeded'`)
      .groupBy(sql`to_char(${payment.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${payment.createdAt}, 'YYYY-MM-DD')`),
    db
      .select({
        id: generationHistory.id,
        userEmail: user.email,
        status: generationHistory.status,
        error: generationHistory.error,
        createdAt: generationHistory.createdAt,
      })
      .from(generationHistory)
      .leftJoin(user, eq(generationHistory.userId, user.id))
      .where(eq(generationHistory.status, "failed"))
      .orderBy(desc(generationHistory.createdAt))
      .limit(8),
    db
      .select({
        id: payment.id,
        userEmail: user.email,
        amountCents: payment.amountCents,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.createdAt,
      })
      .from(payment)
      .leftJoin(user, eq(payment.userId, user.id))
      .orderBy(desc(payment.createdAt))
      .limit(8),
  ]);

  const days = getLast7Days();
  const generationTrendMap = new Map(generationTrendRows.map((item) => [item.date, Number(item.count ?? 0)]));
  const revenueTrendMap = new Map(revenueTrendRows.map((item) => [item.date, Number(item.totalCents ?? 0) / 100]));

  const totalTodayGenerations = Number(todayGenerations[0]?.count ?? 0);
  const completedTodayGenerations = Number(todayCompletedGenerations[0]?.count ?? 0);

  return (
    <AdminDashboard
      stats={{
        todayUsers: Number(todayUsers[0]?.count ?? 0),
        todayGenerations: totalTodayGenerations,
        todaySuccessRate:
          totalTodayGenerations > 0
            ? Math.round((completedTodayGenerations / totalTodayGenerations) * 100)
            : 0,
        todayFailedGenerations: Number(todayFailedGenerations[0]?.count ?? 0),
        todayRevenue: Number(todayRevenue[0]?.total ?? 0) / 100,
        todayCreditsUsed: Number(todayCreditsUsed[0]?.total ?? 0),
      }}
      generationTrend={days.map((date) => ({ date, value: generationTrendMap.get(date) ?? 0 }))}
      revenueTrend={days.map((date) => ({ date, value: revenueTrendMap.get(date) ?? 0 }))}
      recentFailedGenerations={recentFailedGenerations}
      recentPayments={recentPayments}
    />
  );
}
