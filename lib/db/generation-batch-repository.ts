import "server-only";

import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { generationBatch, generationHistory } from "@/lib/db/schema";
import { eq, and, sql, isNull, lt, or } from "drizzle-orm";

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

export const SHOT_MAX_ATTEMPTS = 3;
export const SHOT_HEARTBEAT_TIMEOUT_MS = 120_000;

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
    status: "pending",
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
    status: "pending" as const,
    trialBatchId: input.trialBatchId ?? null,
    sourceImage: input.sourceImage ?? null,
    workerStartedAt: null,
    heartbeatAt: null,
    attemptCount: 0,
    lastError: null,
    refundedCredits: 0,
    lockedAt: null,
    lockedBy: null,
    queuedAt: null,
    dispatchAttemptCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateBatchStatus(
  batchId: string,
  status: "pending" | "processing" | "completed" | "partial" | "failed",
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
    status: input.generationType === "set" ? "pending" : "processing",
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

// ---------------------------------------------------------------------------
// Phase 8.3.3 — Shot-level atomic claim
// ---------------------------------------------------------------------------

export async function claimNextHistory(batchId: string, workerId: string) {
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - SHOT_HEARTBEAT_TIMEOUT_MS);

  const rows = await db
    .update(generationHistory)
    .set({
      status: "processing" as const,
      lockedAt: now,
      lockedBy: workerId,
      startedAt: now,
      heartbeatAt: now,
      attemptCount: sql`${generationHistory.attemptCount} + 1`,
      updatedAt: now,
    })
    .where(
      eq(
        generationHistory.id,
        sql`(
          select ${generationHistory.id}
          from ${generationHistory}
          where ${generationHistory.batchId} = ${batchId}
            and ${generationHistory.type} = 'image'
            and (
              ${generationHistory.status} = 'pending'
              or (
                ${generationHistory.status} = 'processing'
                and (
                  ${generationHistory.heartbeatAt} is null
                  or ${generationHistory.heartbeatAt} < ${staleThreshold}
                )
              )
              or (
                ${generationHistory.status} = 'failed'
                and ${generationHistory.attemptCount} < ${SHOT_MAX_ATTEMPTS}
              )
            )
          order by ${generationHistory.shotOrder} asc nulls last, ${generationHistory.createdAt} asc
          for update skip locked
          limit 1
        )`,
      ),
    )
    .returning();

  return rows[0] ?? null;
}

/** Update shot heartbeat */
export async function updateShotHeartbeat(historyId: string): Promise<void> {
  await db
    .update(generationHistory)
    .set({ heartbeatAt: new Date(), updatedAt: new Date() })
    .where(eq(generationHistory.id, historyId));
}

/** Set shot as completed */
export async function completeShot(historyId: string, resultUrl: string): Promise<void> {
  await db
    .update(generationHistory)
    .set({
      status: "completed",
      resultUrl,
      lockedAt: null,
      lockedBy: null,
      heartbeatAt: null,
      lastError: null,
      error: null,
      updatedAt: new Date(),
    })
    .where(eq(generationHistory.id, historyId));
}

/** Set shot as failed */
export async function failShot(historyId: string, error: string): Promise<void> {
  await db
    .update(generationHistory)
    .set({
      status: "failed",
      error,
      lastError: error,
      lockedAt: null,
      lockedBy: null,
      heartbeatAt: null,
      updatedAt: new Date(),
    })
    .where(eq(generationHistory.id, historyId));
}

/** Check if batch has any remaining pending/processing/failed-under-limit shots */
export async function batchHasRemainingShots(batchId: string): Promise<boolean> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generationHistory)
    .where(
      and(
        eq(generationHistory.batchId, batchId),
        eq(generationHistory.type, "image"),
        or(
          eq(generationHistory.status, "pending"),
          eq(generationHistory.status, "processing"),
          and(
            eq(generationHistory.status, "failed"),
            lt(generationHistory.attemptCount, SHOT_MAX_ATTEMPTS),
          ),
        ),
      ),
    );

  return (rows[0]?.count ?? 0) > 0;
}

/** Get batch completion stats */
export async function getBatchCompletionStats(batchId: string) {
  const rows = await db
    .select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`coalesce(sum(case when ${generationHistory.status} = 'completed' then 1 else 0 end), 0)::int`,
      failed: sql<number>`coalesce(sum(case when ${generationHistory.status} = 'failed' then 1 else 0 end), 0)::int`,
    })
    .from(generationHistory)
    .where(
      and(
        eq(generationHistory.batchId, batchId),
        eq(generationHistory.type, "image"),
      ),
    );

  return {
    total: rows[0]?.total ?? 0,
    completed: rows[0]?.completed ?? 0,
    failed: rows[0]?.failed ?? 0,
  };
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

// ---------------------------------------------------------------------------
// Phase 8.3.1 — Task locking & heartbeat
// ---------------------------------------------------------------------------

const HEARTBEAT_TIMEOUT_MS = 120_000; // 2 min — if no heartbeat, task is stale

/**
 * Atomically try to lock a batch for processing.
 * Only locks if: status is "processing" or "pending", and (not locked OR locked by a stale worker).
 * Returns the updated batch row if lock acquired, null otherwise.
 */
export async function tryLockBatch(
  batchId: string,
  workerId: string,
): Promise<DbGenerationBatch | null> {
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - HEARTBEAT_TIMEOUT_MS);

  const rows = await db
    .update(generationBatch)
    .set({
      lockedAt: now,
      lockedBy: workerId,
      workerStartedAt: now,
      heartbeatAt: now,
      attemptCount: sql`${generationBatch.attemptCount} + 1`,
      updatedAt: now,
    })
    .where(
      and(
        eq(generationBatch.id, batchId),
        or(
          eq(generationBatch.status, "processing"),
          eq(generationBatch.status, "pending"),
        ),
        or(
          isNull(generationBatch.lockedAt),
          lt(generationBatch.lockedAt, staleThreshold),
        ),
      ),
    )
    .returning();

  return rows[0] ?? null;
}

/** Update heartbeat timestamp */
export async function updateHeartbeat(batchId: string): Promise<void> {
  await db
    .update(generationBatch)
    .set({ heartbeatAt: new Date(), updatedAt: new Date() })
    .where(eq(generationBatch.id, batchId));
}

/** Record refund amount atomically */
export async function addRefundedCredits(
  batchId: string,
  amount: number,
): Promise<void> {
  await db
    .update(generationBatch)
    .set({
      refundedCredits: sql`${generationBatch.refundedCredits} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(generationBatch.id, batchId));
}

/** Clear trialBatchId (all-fail release) */
export async function clearTrialBatchId(batchId: string): Promise<void> {
  await db
    .update(generationBatch)
    .set({ trialBatchId: null, updatedAt: new Date() })
    .where(eq(generationBatch.id, batchId));
}

/** Record last error */
export async function setLastError(
  batchId: string,
  error: string,
): Promise<void> {
  await db
    .update(generationBatch)
    .set({ lastError: error, updatedAt: new Date() })
    .where(eq(generationBatch.id, batchId));
}

/** Get batch by id */
export async function getBatchById(
  batchId: string,
): Promise<DbGenerationBatch | null> {
  const rows = await db
    .select()
    .from(generationBatch)
    .where(eq(generationBatch.id, batchId))
    .limit(1);
  return rows[0] ?? null;
}

/** Get all pending/failed histories for a batch (for worker to process) */
export async function getPendingOrFailedHistories(batchId: string) {
  return db
    .select()
    .from(generationHistory)
    .where(
      and(
        eq(generationHistory.batchId, batchId),
        or(
          eq(generationHistory.status, "pending"),
          eq(generationHistory.status, "failed"),
        ),
      ),
    )
    .orderBy(generationHistory.shotOrder);
}

// ---------------------------------------------------------------------------
// Phase 8.3.2 — Dispatch & recovery
// ---------------------------------------------------------------------------

const MAX_ATTEMPTS = 3;
const HEARTBEAT_TIMEOUT_MS_2 = 120_000; // 2 min

/** Increment dispatch attempt count and set queuedAt */
export async function incrementDispatchAttempt(batchId: string): Promise<void> {
  await db
    .update(generationBatch)
    .set({
      dispatchAttemptCount: sql`${generationBatch.dispatchAttemptCount} + 1`,
      queuedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(generationBatch.id, batchId));
}

/** Get batches that need processing (pending or stale processing) */
/* async function getBatchesNeedingProcessingLegacy(): Promise<DbGenerationBatch[]> {
  const staleThreshold = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS_2);

  return db
    .select()
    .from(generationBatch)
    .where(
      and(
        eq(generationBatch.generationType, "set"),
        or(
          // pending — never started
          and(
            eq(generationBatch.status, "pending"),
            isNull(generationBatch.lockedAt),
          ),
          // processing but heartbeat stale
          and(
            eq(generationBatch.status, "processing"),
            lt(generationBatch.heartbeatAt, staleThreshold),
          ),
        ),
        // under max attempts
        lt(generationBatch.attemptCount, MAX_ATTEMPTS),
      ),
    )
    .limit(10);
} */

export async function getBatchesNeedingProcessing(): Promise<DbGenerationBatch[]> {
  const staleThreshold = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS_2);

  return db
    .select()
    .from(generationBatch)
    .where(
      and(
        eq(generationBatch.generationType, "set"),
        or(
          eq(generationBatch.status, "pending"),
          eq(generationBatch.status, "processing"),
        ),
        lt(generationBatch.dispatchAttemptCount, MAX_ATTEMPTS),
        sql`exists (
          select 1
          from ${generationHistory}
          where ${generationHistory.batchId} = ${generationBatch.id}
            and ${generationHistory.type} = 'image'
            and (
              ${generationHistory.status} = 'pending'
              or (
                ${generationHistory.status} = 'processing'
                and (
                  ${generationHistory.heartbeatAt} is null
                  or ${generationHistory.heartbeatAt} < ${staleThreshold}
                )
              )
              or (
                ${generationHistory.status} = 'failed'
                and ${generationHistory.attemptCount} < ${SHOT_MAX_ATTEMPTS}
              )
            )
        )`,
      ),
    )
    .limit(10);
}

/** Finalize a batch that exceeded max attempts */
export async function finalizeExceededBatch(batchId: string): Promise<void> {
  const batch = await getBatchById(batchId);
  if (!batch) return;

  if (batch.completedShots > 0) {
    await updateBatchStatus(batchId, "partial");
  } else {
    await updateBatchStatus(batchId, "failed");
  }

  await db
    .update(generationBatch)
    .set({
      lastError: `Exceeded max attempts (${MAX_ATTEMPTS}). completedShots=${batch.completedShots}, failedShots=${batch.failedShots}`,
      updatedAt: new Date(),
    })
    .where(eq(generationBatch.id, batchId));
}
