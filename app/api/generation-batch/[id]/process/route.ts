import { NextRequest, NextResponse } from "next/server";
import { processSetBatch } from "@/lib/jobs/generation-worker";
import { getBatchById } from "@/lib/db/generation-batch-repository";

/**
 * Internal worker trigger endpoint.
 * Protected by TASK_SECRET — only callable by internal services, not users.
 */
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
    return NextResponse.json({ error: "Only set batches can be processed" }, { status: 400 });
  }

  if (batch.status === "completed" || batch.status === "failed") {
    return NextResponse.json(
      { error: `Batch is already ${batch.status}` },
      { status: 409 },
    );
  }

  // Fire-and-forget from this endpoint
  processSetBatch(batchId).catch((err) => {
    console.error("[process] Worker error:", err);
  });

  return NextResponse.json({ success: true, batchId });
}