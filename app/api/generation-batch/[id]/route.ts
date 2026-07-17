import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generationBatch, generationHistory } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getActiveSessionUser } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const access = await getActiveSessionUser(req.headers);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const userId = access.user.id;

  const batchRows = await db
    .select()
    .from(generationBatch)
    .where(eq(generationBatch.id, id))
    .limit(1);

  const batch = batchRows[0];
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  if (batch.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const histories = await db
    .select({
      id: generationHistory.id,
      shotId: generationHistory.shotId,
      shotOrder: generationHistory.shotOrder,
      status: generationHistory.status,
      resultUrl: generationHistory.resultUrl,
      error: generationHistory.error,
      createdAt: generationHistory.createdAt,
    })
    .from(generationHistory)
    .where(eq(generationHistory.batchId, id))
    .orderBy(asc(generationHistory.shotOrder));

  const total = batch.totalShots || 1;
  const progress = total > 0
    ? Math.round(((batch.completedShots || 0) / total) * 100)
    : 0;
  const isTerminal = batch.status === "completed" || batch.status === "failed";
  const canRetry = !isTerminal || batch.status === "partial";

  return NextResponse.json({
    batchId: batch.id,
    generationType: batch.generationType,
    status: batch.status,
    totalCredits: batch.totalCredits,
    refundedCredits: batch.refundedCredits,
    totalShots: batch.totalShots,
    completedShots: batch.completedShots,
    failedShots: batch.failedShots,
    trialBatchId: batch.trialBatchId,
    templateNameZh: batch.templateNameZh,
    templateNameEn: batch.templateNameEn,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
    progress,
    canRetry,
    isTerminal,
    histories: histories.map((h) => ({
      id: h.id,
      shotId: h.shotId,
      shotOrder: h.shotOrder,
      status: h.status,
      resultUrl: h.resultUrl,
      error: h.error,
      createdAt: h.createdAt,
    })),
  });
}