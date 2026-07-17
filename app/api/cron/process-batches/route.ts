import { NextRequest, NextResponse } from "next/server";
import {
  getBatchesNeedingProcessing,
  incrementDispatchAttempt,
  finalizeExceededBatch,
} from "@/lib/db/generation-batch-repository";

const MAX_ATTEMPTS = 3;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batches = await getBatchesNeedingProcessing();
  console.log(`[cron] Found ${batches.length} batches`);

  let dispatched = 0;
  let exceeded = 0;
  const taskSecret = process.env.TASK_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  for (const batch of batches) {
    if (batch.dispatchAttemptCount >= MAX_ATTEMPTS) {
      await finalizeExceededBatch(batch.id);
      exceeded++;
      continue;
    }

    if (!taskSecret) continue;

    await incrementDispatchAttempt(batch.id);
    fetch(`${appUrl}/api/generation-batch/${batch.id}/process`, {
      method: "POST",
      headers: { Authorization: `Bearer ${taskSecret}` },
    }).catch(() => {});
    dispatched++;
  }

  return NextResponse.json({ dispatched, exceeded, total: batches.length });
}
