import { eq, and, ne } from "drizzle-orm";
import { subscription as subscriptionTable, user as userTable } from "@/lib/db/schema";
import type { db } from "@/lib/db";

// Type for database instance (using the actual db instance type)
export type Database = typeof db;

/**
 * Handle subscription termination events
 * @param db Database instance
 * @param eventType Webhook event type
 * @param subscriptionId Provider subscription ID
 * @param userId User ID
 * @param kind Payment kind ('subscription' or 'one_time')
 * @returns Promise that resolves to true if the event was handled, false otherwise
 */
export async function handleSubscriptionTermination(
  db: Database,
  eventType: string,
  subscriptionId: string,
  userId: string,
  kind: string
): Promise<boolean> {
  // Only process subscription termination events
  if (kind !== "subscription") {
    return false;
  }

  const terminationEvents = [
    "subscription.canceled",
    "subscription.expired",
    "subscription.cancelled", // British spelling
    "subscription.unpaid",
    "subscription.payment_failed",
  ];

  if (!terminationEvents.includes(eventType)) {
    return false;
  }

  // Determine status based on event type
  let status: string;
  if (eventType === "subscription.canceled" || eventType === "subscription.cancelled") {
    status = "canceled";
  } else if (eventType === "subscription.expired") {
    status = "expired";
  } else if (eventType === "subscription.unpaid" || eventType === "subscription.payment_failed") {
    status = "unpaid";
  } else {
    status = "canceled"; // fallback
  }

  // Update subscription status
  await db
    .update(subscriptionTable)
    .set({ status })
    .where(eq(subscriptionTable.providerSubId, subscriptionId));

  // Check if user has any other active subscriptions
  const otherActiveSubs = await db
    .select()
    .from(subscriptionTable)
    .where(
      and(
        eq(subscriptionTable.userId, userId),
        eq(subscriptionTable.status, "active"),
        ne(subscriptionTable.providerSubId, subscriptionId)
      )
    );

  // If no other active subscriptions, downgrade user to free plan
  if (otherActiveSubs.length === 0) {
    await db
      .update(userTable)
      .set({ planKey: "free" })
      .where(eq(userTable.id, userId));
  }

  return true;
}