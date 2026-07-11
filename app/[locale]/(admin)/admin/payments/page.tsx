import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { payment, user } from "@/lib/db/schema";
import { PaymentsTable } from "@/features/admin/components/payments-table";

type PaymentsPageProps = {
  searchParams?: Promise<{
    query?: string;
    status?: string;
    type?: string;
  }>;
};

export default async function AdminPaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams;
  const query = params?.query?.trim() ?? "";
  const status = params?.status ?? "all";
  const type = params?.type ?? "all";

  const conditions = [];
  if (query) {
    const pattern = `%${query}%`;
    conditions.push(
      or(
        ilike(user.email, pattern),
        ilike(payment.id, pattern),
        ilike(payment.providerPaymentId, pattern),
      ),
    );
  }
  if (status !== "all") {
    conditions.push(eq(payment.status, status));
  }
  if (type !== "all") {
    conditions.push(eq(payment.type, type));
  }

  const payments = await db
    .select({
      id: payment.id,
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      userEmail: user.email,
      amountCents: payment.amountCents,
      currency: payment.currency,
      status: payment.status,
      type: payment.type,
      planKey: payment.planKey,
      creditsGranted: payment.creditsGranted,
      createdAt: payment.createdAt,
    })
    .from(payment)
    .leftJoin(user, eq(payment.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(payment.createdAt))
    .limit(200);

  return <PaymentsTable payments={payments} query={query} status={status} type={type} />;
}
