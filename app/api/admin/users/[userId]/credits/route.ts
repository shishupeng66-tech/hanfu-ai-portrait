import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, creditLedger } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdminApi } from "@/lib/auth/admin-api";

export async function POST(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const adminAccess = await requireAdminApi(request.headers);
    if (!adminAccess.ok) {
      return adminAccess.response;
    }
    
    const body = await request.json();
    const { amount, reason } = body;
    const delta = Number(amount);
    const normalizedReason = typeof reason === "string" ? reason.trim() : "";

    if (!Number.isFinite(delta) || delta === 0) {
      return NextResponse.json(
        { error: "Amount is required and must be non-zero" },
        { status: 400 }
      );
    }

    if (!normalizedReason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      );
    }

    const targetUser = await db
      .select({ credits: user.credits })
      .from(user)
      .where(eq(user.id, params.userId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser[0].credits + delta < 0) {
      return NextResponse.json(
        { error: "Credits cannot be negative" },
        { status: 400 }
      );
    }
    
    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({
          credits: sql`${user.credits} + ${delta}`,
          updatedAt: new Date(),
        })
        .where(eq(user.id, params.userId));
      
      const ledgerEntry: typeof creditLedger.$inferInsert = {
        id: crypto.randomUUID(),
        userId: params.userId,
        delta,
        reason: normalizedReason,
      };

      await tx.insert(creditLedger).values(ledgerEntry);
    });
    
    const updatedUser = await db
      .select({ credits: user.credits })
      .from(user)
      .where(eq(user.id, params.userId))
      .limit(1);
    
    return NextResponse.json({ 
      success: true,
      credits: updatedUser[0]?.credits 
    });
  } catch (error) {
    console.error("Failed to update credits:", error);
    return NextResponse.json(
      { error: "Failed to update credits" },
      { status: 500 }
    );
  }
}
