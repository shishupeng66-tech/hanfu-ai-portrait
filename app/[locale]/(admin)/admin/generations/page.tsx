import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { generationHistory, user } from "@/lib/db/schema";
import { GenerationsTable } from "@/features/admin/components/generations-table";

type GenerationsPageProps = {
  searchParams?: Promise<{
    query?: string;
    status?: string;
  }>;
};

function parseMetadata(metadata: string | null) {
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

export default async function AdminGenerationsPage({ searchParams }: GenerationsPageProps) {
  const params = await searchParams;
  const query = params?.query?.trim() ?? "";
  const status = params?.status ?? "all";

  const conditions = [];
  if (query) {
    const pattern = `%${query}%`;
    conditions.push(
      or(
        ilike(user.email, pattern),
        ilike(generationHistory.userId, pattern),
        ilike(generationHistory.id, pattern),
      ),
    );
  }
  if (status !== "all") {
    conditions.push(eq(generationHistory.status, status));
  }

  const rows = await db
    .select({
      id: generationHistory.id,
      userId: generationHistory.userId,
      userEmail: user.email,
      type: generationHistory.type,
      status: generationHistory.status,
      creditsUsed: generationHistory.creditsUsed,
      resultUrl: generationHistory.resultUrl,
      error: generationHistory.error,
      metadata: generationHistory.metadata,
      createdAt: generationHistory.createdAt,
      updatedAt: generationHistory.updatedAt,
    })
    .from(generationHistory)
    .leftJoin(user, eq(generationHistory.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(generationHistory.createdAt))
    .limit(200);

  const generations = rows.map((row) => {
    const metadata = parseMetadata(row.metadata);
    return {
      id: row.id,
      userId: row.userId,
      userEmail: row.userEmail,
      type: row.type,
      templateName: metadata.templateName,
      templateKey: metadata.templateKey,
      status: row.status,
      creditsUsed: row.creditsUsed,
      resultUrl: row.resultUrl,
      error: row.error,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  });

  return <GenerationsTable generations={generations} query={query} status={status} />;
}
