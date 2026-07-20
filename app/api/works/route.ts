import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generationHistory, generationBatch } from "@/lib/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import { getActiveSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const access = await getActiveSessionUser(req.headers);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const userId = access.user.id;

  const works = await db
    .select({
      id: generationHistory.id,
      resultUrl: generationHistory.resultUrl,
      templateSlug: generationBatch.templateSlug,
      templateNameZh: generationBatch.templateNameZh,
      templateNameEn: generationBatch.templateNameEn,
      generationType: generationHistory.generationType,
      createdAt: generationHistory.createdAt,
      status: generationHistory.status,
    })
    .from(generationHistory)
    .innerJoin(generationBatch, eq(generationHistory.batchId, generationBatch.id))
    .where(
      and(
        eq(generationHistory.userId, userId),
        eq(generationHistory.status, "completed"),
        isNotNull(generationHistory.resultUrl),
      ),
    )
    .orderBy(desc(generationHistory.createdAt));

  const formattedWorks = works.map((work) => ({
    id: work.id,
    image: work.resultUrl,
    templateSlug: work.templateSlug,
    templateName: work.templateNameZh || work.templateNameEn || work.templateSlug || "Untitled",
    generationType: work.generationType,
    status: work.status,
    createdAt: work.createdAt?.toISOString() || new Date().toISOString(),
    // TODO: 以下字段后续可以从 metadata 中提取，先用默认值
    credits: 1,
    isFavorited: false,
    styleName: work.generationType === "trial" ? "Trial" : "Full Set",
  }));

  return NextResponse.json({
    works: formattedWorks,
    total: formattedWorks.length,
  });
}
