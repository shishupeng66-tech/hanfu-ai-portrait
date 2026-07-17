import { NextRequest, NextResponse } from "next/server";
import {
  getBatchesNeedingProcessing,
  incrementDispatchAttempt,
  finalizeExceededBatch,
} from "@/lib/db/generation-batch-repository";
import { processSetBatch } from "@/lib/jobs/generation-worker";

const MAX_ATTEMPTS = 3;

export async function GET(req: NextRequest) {
  // Verify Vercel Cron secret
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batches = await getBatchesNeedingProcessing();
  console.log(`[cron] Found ${batches.length} batches to process`);

  let dispatched = 0;
  let exceeded = 0;

  for (const batch of batches) {
    if (batch.attemptCount >= MAX_ATTEMPTS) {
      await finalizeExceededBatch(batch.id);
      exceeded++;
      console.log(`[cron] Batch ${batch.id.substring(0, 12)} exceeded max attempts — finalized`);
      continue;
    }

    await incrementDispatchAttempt(batch.id);
    dispatched++;

    // Fire worker (async, don't block the cron loop)
    processSetBatch(batch.id).catch((err) => {
      console.error(`[cron] Worker error for batch ${batch.id.substring(0, 12)}:`, err);
    });
  }

  return NextResponse.json({
    dispatched,
    exceeded,
    total: batches.length,
  });
}