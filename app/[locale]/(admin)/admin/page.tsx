import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { creditLedger, generationHistory, payment, user } from "@/lib/db/schema";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";

export default async function AdminPage() {
  const [
    todayUsers,
    todayGenerations,
    todayCompletedGenerations,
    todayFailedGenerations,
    todayRevenue,
    todayCreditsUsed,
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
      recentFailedGenerations={recentFailedGenerations}
      recentPayments={recentPayments}
    />
  );
}
