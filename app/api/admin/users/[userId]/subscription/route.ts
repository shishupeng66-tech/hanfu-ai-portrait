import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/auth/admin-api";

const validPlans = new Set(["free", "plus_monthly", "pro_monthly", "proplus_yearly"]);
const validStatuses = new Set(["active", "inactive", "canceled"]);

export async function POST(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const adminAccess = await requireAdminApi(request.headers);
    if (!adminAccess.ok) {
      return adminAccess.response;
    }
    
    const body = await request.json();
    const { planKey, status } = body;
    
    if (typeof planKey !== "string" || typeof status !== "string") {
      return NextResponse.json(
        { error: "Plan key and status are required" },
        { status: 400 }
      );
    }

    if (!validPlans.has(planKey) || !validStatuses.has(status)) {
      return NextResponse.json(
        { error: "Invalid plan key or status" },
        { status: 400 }
      );
    }

    if (planKey === "free" && status === "active") {
      return NextResponse.json(
        { error: "Free plan cannot be active subscription status" },
        { status: 400 }
      );
    }

    const targetUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, params.userId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    await db
      .update(user)
      .set({
        planKey,
        updatedAt: new Date(),
      })
      .where(eq(user.id, params.userId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const adminAccess = await requireAdminApi(request.headers);
    if (!adminAccess.ok) {
      return adminAccess.response;
    }
    
    // Cancel user's subscription (set to free plan)
    await db
      .update(user)
      .set({
        planKey: "free",
        updatedAt: new Date(),
      })
      .where(eq(user.id, params.userId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
