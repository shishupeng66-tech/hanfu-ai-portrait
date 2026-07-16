import "server-only";

import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { generationBatch, generationHistory } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DbGenerationBatch = typeof generationBatch.$inferSelect;
export type DbGenerationBatchInsert = typeof generationBatch.$inferInsert;

export type CreateBatchInput = {
  userId: string;
  templateId: string;
  templateSlug: string;
  templateNameZh: string;
  templateNameEn: string;
  generationType: "trial" | "set";
  totalCredits: number;
  totalShots: number;
  trialBatchId?: string | null;
  sourceImage?: string | null;
};

export type CreateHistoryInput = {
  batchId: string;
  userId: string;
  generationType: "trial" | "set";
  shotId: string;
  shotOrder: number;
  prompt: string;
  creditsUsed: number;
  metadata?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Batch CRUD
// ---------------------------------------------------------------------------

export async function createGenerationBatch(input: CreateBatchInput): Promise<DbGenerationBatch> {
  const id = randomUUID();
  const now = new Date();

  await db.insert(generationBatch).values({
    id,
    userId: input.userId,
    templateId: input.templateId,
    templateSlug: input.templateSlug,
    templateNameZh: input.templateNameZh,
    templateNameEn: input.templateNameEn,
    generationType: input.generationType,
    totalCredits: input.totalCredits,
    totalShots: input.totalShots,
    completedShots: 0,
    failedShots: 0,
    status: "processing",
    trialBatchId: input.trialBatchId ?? null,
    sourceImage: input.sourceImage ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    userId: input.userId,
    templateId: input.templateId,
    templateSlug: input.templateSlug,
    templateNameZh: input.templateNameZh,
    templateNameEn: input.templateNameEn,
    generationType: input.generationType,
    totalCredits: input.totalCredits,
    totalShots: input.totalShots,
    completedShots: 0,
    failedShots: 0,
    status: "processing",
    trialBatchId: input.trialBatchId ?? null,
    sourceImage: input.sourceImage ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateBatchStatus(
  batchId: string,
  status: "completed" | "partial" | "failed",
): Promise<void> {
  await db
    .update(generationBatch)
    .set({ status, updatedAt: new Date() })
    .where(eq(generationBatch.id, batchId));
}

export async function incrementCompletedShots(batchId: string): Promise<void> {
  await db
    .update(generationBatch)
    .set({
      completedShots: sql`${generationBatch.completedShots} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(generationBatch.id, batchId));
}

export async function incrementFailedShots(batchId: string): Promise<void> {
  await db
    .update(generationBatch)
    .set({
      failedShots: sql`${generationBatch.failedShots} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(generationBatch.id, batchId));
}

// ---------------------------------------------------------------------------
// Trial batch lookup
// ---------------------------------------------------------------------------

export async function findTrialBatch(
  trialBatchId: string,
  userId: string,
  templateId: string,
): Promise<DbGenerationBatch | null> {
  const rows = await db
    .select()
    .from(generationBatch)
    .where(
      and(
        eq(generationBatch.id, trialBatchId),
        eq(generationBatch.userId, userId),
        eq(generationBatch.templateId, templateId),
        eq(generationBatch.generationType, "trial"),
        eq(generationBatch.status, "completed"),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function checkTrialAlreadyUsed(trialBatchId: string): Promise<boolean> {
  const rows = await db
    .select({ id: generationBatch.id })
    .from(generationBatch)
    .where(eq(generationBatch.trialBatchId, trialBatchId))
    .limit(1);

  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// History helper
// ---------------------------------------------------------------------------

export async function createGenerationHistory(input: CreateHistoryInput): Promise<string> {
  const id = randomUUID();

  await db.insert(generationHistory).values({
    id,
    userId: input.userId,
    batchId: input.batchId,
    generationType: input.generationType,
    type: "image",
    prompt: input.prompt,
    status: "processing",
    creditsUsed: input.creditsUsed,
    shotId: input.shotId,
    shotOrder: input.shotOrder,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
  });

  return id;
}

export async function updateHistoryCompleted(
  historyId: string,
  resultUrl: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await db
    .update(generationHistory)
    .set({
      status: "completed",
      resultUrl,
      metadata: metadata ? JSON.stringify(metadata) : null,
      updatedAt: new Date(),
    })
    .where(eq(generationHistory.id, historyId));
}

export async function updateHistoryFailed(
  historyId: string,
  error: string,
): Promise<void> {
  await db
    .update(generationHistory)
    .set({
      status: "failed",
      error,
      updatedAt: new Date(),
    })
    .where(eq(generationHistory.id, historyId));
}