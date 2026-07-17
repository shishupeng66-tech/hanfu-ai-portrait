import { NextRequest, NextResponse } from "next/server";
import { processNextBatchShot } from "@/lib/jobs/generation-worker";
import { getBatchById } from "@/lib/db/generation-batch-repository";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: batchId } = await params;

  // Validate TASK_SECRET
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.TASK_SECRET || ""}`;
  if (!process.env.TASK_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const batch = await getBatchById(batchId);
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  if (batch.generationType !== "set") {
    return NextResponse.json({ error: "Only set batches supported" }, { status: 400 });
  }

  if (batch.status === "completed" || batch.status === "partial" || batch.status === "failed") {
    return NextResponse.json(
      { error: `Batch is already ${batch.status}`, batchId, batchStatus: batch.status },
      { status: 409 },
    );
  }

  const result = await processNextBatchShot(batchId);

  return NextResponse.json(result);
}
