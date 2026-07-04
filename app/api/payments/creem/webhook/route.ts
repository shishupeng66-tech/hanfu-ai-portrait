import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payments/creem";
import { db } from "@/lib/db";
import { creditLedger, payment as paymentTable, subscription as subscriptionTable, user as userTable } from "@/lib/db/schema";
import { isPackKey, isSubscriptionKey, oneTimePacks, subscriptionPlans, PlanKey } from "@/constants/billing";
import {
  computeInitialGrant,
  getGrantSchedule,
  deleteSubscriptionSchedule,
  resetSubscriptionSchedule,
} from "@/lib/billing/subscription";
import { and, eq, sql } from "drizzle-orm";
import { handleSubscriptionTermination } from "@/lib/payments/subscription-termination";
import { sendPurchaseEmail } from "@/lib/email";

type CreemMetadata = {
  userId?: string;
  key?: string;
  kind?: "subscription" | "one_time";
  subscriptionId?: string;
};

type CreemDateValue = string | number | Date | null | undefined;

type CreemPeriodInfo = {
  end?: CreemDateValue;
  ends_at?: CreemDateValue;
  end_at?: CreemDateValue;
};

type CreemOrderObject = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  metadata?: CreemMetadata;
  subscription_id?: string;
  subscription?: {
    id?: string;
  };
  subscriptionId?: string;
  current_period_end?: CreemDateValue;
  current_period_end_at?: CreemDateValue;
  current_period?: CreemPeriodInfo;
  billing_period?: CreemPeriodInfo;
  next_payment_at?: CreemDateValue;
  next_payment_date?: CreemDateValue;
  next_billing_at?: CreemDateValue;
  next_billing_date?: CreemDateValue;
};

type CreemWebhookObject = {
  id?: string;
  order_id?: string;
  metadata?: CreemMetadata;
  order?: CreemOrderObject;
  checkout?: {
    id?: string;
    order_id?: string;
    metadata?: CreemMetadata;
    order?: CreemOrderObject;
  };
  subscription?: {
    id?: string;
  };
  subscriptionId?: string;
  last_transaction_id?: string;
  last_transaction?: {
    id?: string;
    order?: string;
  };
  product?: {
    price?: number;
    currency?: string;
  };
  current_period_end?: CreemDateValue;
  current_period_end_at?: CreemDateValue;
  currentPeriodEnd?: CreemDateValue;
  currentPeriodEndAt?: CreemDateValue;
  current_period?: CreemPeriodInfo;
  currentPeriod?: CreemPeriodInfo;
  billing_period?: CreemPeriodInfo;
  billingPeriod?: CreemPeriodInfo;
  next_payment_at?: CreemDateValue;
  next_payment_date?: CreemDateValue;
  next_billing_at?: CreemDateValue;
  next_billing_date?: CreemDateValue;
};

type CreemWebhookEvent = {
  id?: string;
  eventType?: string;
  object?: CreemWebhookObject | null;
};

function getErrorMessage(error: unknown, fallback = "Unknown error") {
  return error instanceof Error ? error.message : fallback;
}

const subscriptionTerminationEvents = new Set([
  "subscription.canceled",
  "subscription.expired",
  "subscription.cancelled",
  "subscription.unpaid",
  "subscription.payment_failed",
]);

function firstString(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    const timestamp = value > 1e12 ? value : value * 1000;
    const parsed = new Date(timestamp);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function extractSubscriptionId(
  type: string | undefined,
  mainObject: CreemWebhookObject,
  metadata: CreemMetadata,
): string | undefined {
  const nestedSubscriptionId = firstString(
    mainObject?.order?.subscription_id,
    mainObject?.subscription?.id,
    mainObject?.order?.subscription?.id,
    mainObject?.order?.subscriptionId,
    mainObject?.checkout?.order?.subscription_id,
    mainObject?.checkout?.order?.subscription?.id,
    mainObject?.checkout?.order?.subscriptionId,
    mainObject?.subscriptionId,
    metadata?.subscriptionId,
  );

  if (nestedSubscriptionId) return nestedSubscriptionId;
  return type?.startsWith("subscription.") ? firstString(mainObject?.id) : undefined;
}

function extractTransactionOrOrderId(type: string | undefined, mainObject: CreemWebhookObject): string | undefined {
  if (type === "subscription.paid") {
    return firstString(
      mainObject?.last_transaction_id,
      mainObject?.last_transaction?.id,
      mainObject?.last_transaction?.order,
      mainObject?.order?.id,
      mainObject?.order_id,
      mainObject?.checkout?.order?.id,
      mainObject?.checkout?.order_id,
      mainObject?.checkout?.id,
    );
  }

  if (type === "checkout.completed") {
    return firstString(
      mainObject?.order?.id,
      mainObject?.order_id,
      mainObject?.checkout?.order?.id,
      mainObject?.checkout?.order_id,
      mainObject?.checkout?.id,
      mainObject?.id,
    );
  }

  return firstString(
    mainObject?.last_transaction_id,
    mainObject?.last_transaction?.id,
    mainObject?.last_transaction?.order,
    mainObject?.order?.id,
    mainObject?.order_id,
    mainObject?.checkout?.order?.id,
    mainObject?.checkout?.order_id,
    mainObject?.checkout?.id,
    mainObject?.id,
  );
}

function buildSubscriptionPeriodPaymentId(subscriptionId: string, currentPeriodEnd: Date | null) {
  if (!currentPeriodEnd) return undefined;
  const periodDay = currentPeriodEnd.toISOString().slice(0, 10);
  return `creem:sub:${subscriptionId}:period:${periodDay}`;
}

export async function POST(req: NextRequest) {
  // Read raw body for signature verification
  const rawBody = await req.text();
  
  // Verify signature
  const ok = verifyWebhookSignature(req.headers, rawBody);
  if (!ok) {
    // Silent fail for signature verification to avoid log spam from retries
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Parse the webhook event
  let event: CreemWebhookEvent;
  try {
    const parsedEvent = JSON.parse(rawBody) as unknown;
    if (!parsedEvent || typeof parsedEvent !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    event = parsedEvent as CreemWebhookEvent;
  } catch (error: unknown) {
    console.error("[Creem Webhook] Failed to parse JSON:", getErrorMessage(error));
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Event id (used for idempotency)
  const eventId = event?.id as string | undefined;

  try {
    // Handle Creem webhook structure
    const type = event.eventType;
    console.log(`[Creem Webhook] Event received: ${type ?? "unknown"}`);
    
    // Get the main object
    const mainObject: CreemWebhookObject = event.object ?? {};
    
    // Extract metadata from the correct location based on event type
    let metadata: CreemMetadata = {};
    let paymentId: string | undefined;
    let amountCents = 0;
    let currency = "usd";
    
    if (type === "checkout.completed") {
      // For checkout.completed, metadata is in the checkout object
      metadata = mainObject?.metadata || mainObject?.checkout?.metadata || mainObject?.order?.metadata || {};
      amountCents = mainObject?.order?.amount || 0;
      currency = mainObject?.order?.currency || "USD";
    } else if (type === "subscription.paid" || type === "subscription.active") {
      // For subscription events, metadata should be in the subscription object
      metadata = mainObject?.metadata || mainObject?.checkout?.metadata || mainObject?.order?.metadata || {};
      amountCents = mainObject?.product?.price || 0;
      currency = mainObject?.product?.currency || "USD";
    } else {
      metadata = mainObject?.metadata || mainObject?.checkout?.metadata || mainObject?.order?.metadata || {};
    }

    const subscriptionId = extractSubscriptionId(type, mainObject, metadata);

    const extractCurrentPeriodEnd = (): Date | null => {
      const candidates = [
        mainObject?.current_period_end,
        mainObject?.current_period_end_at,
        mainObject?.currentPeriodEnd,
        mainObject?.currentPeriodEndAt,
        mainObject?.current_period?.end,
        mainObject?.current_period?.ends_at,
        mainObject?.current_period?.end_at,
        mainObject?.currentPeriod?.end,
        mainObject?.currentPeriod?.ends_at,
        mainObject?.billing_period?.end,
        mainObject?.billing_period?.ends_at,
        mainObject?.billing_period?.end_at,
        mainObject?.billingPeriod?.end,
        mainObject?.billingPeriod?.ends_at,
        mainObject?.billingPeriod?.end_at,
        mainObject?.next_payment_at,
        mainObject?.next_payment_date,
        mainObject?.next_billing_at,
        mainObject?.next_billing_date,
        mainObject?.order?.current_period_end,
        mainObject?.order?.current_period_end_at,
        mainObject?.order?.current_period?.end,
        mainObject?.order?.current_period?.ends_at,
        mainObject?.order?.current_period?.end_at,
        mainObject?.order?.billing_period?.end,
        mainObject?.order?.billing_period?.ends_at,
        mainObject?.order?.billing_period?.end_at,
        mainObject?.order?.next_payment_at,
        mainObject?.order?.next_payment_date,
        mainObject?.order?.next_billing_at,
        mainObject?.order?.next_billing_date,
        mainObject?.checkout?.order?.current_period_end,
        mainObject?.checkout?.order?.current_period_end_at,
        mainObject?.checkout?.order?.current_period?.end,
        mainObject?.checkout?.order?.current_period?.ends_at,
        mainObject?.checkout?.order?.current_period?.end_at,
        mainObject?.checkout?.order?.billing_period?.end,
        mainObject?.checkout?.order?.billing_period?.ends_at,
        mainObject?.checkout?.order?.billing_period?.end_at,
        mainObject?.checkout?.order?.next_payment_at,
        mainObject?.checkout?.order?.next_payment_date,
        mainObject?.checkout?.order?.next_billing_at,
        mainObject?.checkout?.order?.next_billing_date,
      ];

      for (const candidate of candidates) {
        const parsed = parseDateValue(candidate);
        if (parsed) return parsed;
      }
      return null;
    };
    
    const userId = metadata.userId;
    const key = metadata.key;
    const kind = metadata.kind;

    // Handle subscription lifecycle events without requiring checkout metadata.
    if (type && subscriptionTerminationEvents.has(type)) {
      if (!subscriptionId) {
        console.warn(`[Creem Webhook] ${type} missing subscription id; acknowledging`);
        return NextResponse.json({ received: true });
      }

      const subRows = await db
        .select()
        .from(subscriptionTable)
        .where(eq(subscriptionTable.providerSubId, subscriptionId))
        .limit(1);

      const existingSubscription = subRows[0];
      if (!existingSubscription) {
        console.warn(`[Creem Webhook] ${type} subscription not found: ${subscriptionId}; acknowledging`);
        return NextResponse.json({ received: true });
      }

      await handleSubscriptionTermination(
        db,
        type,
        subscriptionId,
        existingSubscription.userId,
        "subscription"
      );

      console.log(`[Creem Webhook] ${type} handled for subscription ${subscriptionId}`);
      return NextResponse.json({ received: true });
    }

    if (type === "subscription.active" && subscriptionId) {
      await db
        .update(subscriptionTable)
        .set({ status: "active" })
        .where(eq(subscriptionTable.providerSubId, subscriptionId));
      console.log(`[Creem Webhook] subscription.active handled for subscription ${subscriptionId}`);
      return NextResponse.json({ received: true });
    }

    console.log(
      `[Creem Webhook] Resolved refs type=${type ?? "unknown"} subscriptionId=${subscriptionId ?? "none"} ` +
        `kind=${kind ?? "none"} key=${key ?? "none"} userId=${userId ? "[present]" : "none"}`
    );

    // Only process payment-related events
    const shouldProcessPayment = type === "checkout.completed" || type === "subscription.paid";
    
    if (!shouldProcessPayment) {
      if (!type) {
        // If event type is missing, just acknowledge
        return NextResponse.json({ received: true });
      }

      // For other non-payment events, just acknowledge
      return NextResponse.json({ received: true });
    }

    if (!userId || !key || !kind) {
      // Don't log details to avoid PII exposure
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    let creditsToGrant = 0;
    let planKey: PlanKey | null = null;
    const paymentType: "one_time" | "subscription" = kind;
    let scheduleResetContext: {
      subscriptionId: string;
      schedule: NonNullable<ReturnType<typeof getGrantSchedule>>;
      grantsRemaining: number;
      totalCreditsRemaining: number;
      nextGrantAt: Date | null;
    } | null = null;

    if (kind === "one_time" && isPackKey(key)) {
      creditsToGrant = oneTimePacks[key].credits;
    } else if (kind === "subscription" && isSubscriptionKey(key)) {
      planKey = key;
      const plan = subscriptionPlans[key];
      const schedule = getGrantSchedule(key);

      if (schedule && subscriptionId) {
        const initialGrant = computeInitialGrant(schedule);
        creditsToGrant = initialGrant.creditsNow;
        scheduleResetContext = {
          subscriptionId,
          schedule,
          grantsRemaining: initialGrant.grantsRemaining,
          totalCreditsRemaining: initialGrant.totalCreditsRemaining,
          nextGrantAt: initialGrant.nextGrantAt,
        };
      } else {
        creditsToGrant = plan.creditsPerCycle;
      }
    } else {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const derivePeriodEndFromPlan = (): Date | null => {
      if (!planKey) return null;
      const cycle = subscriptionPlans[planKey].cycle;
      const result = new Date();
      if (cycle === "month") {
        result.setMonth(result.getMonth() + 1);
      } else {
        result.setFullYear(result.getFullYear() + 1);
      }
      return result;
    };

    const currentPeriodEnd = extractCurrentPeriodEnd() ?? derivePeriodEndFromPlan();
    const stableTransactionOrOrderId = extractTransactionOrOrderId(type, mainObject);

    if (kind === "subscription" && subscriptionId) {
      paymentId =
        buildSubscriptionPeriodPaymentId(subscriptionId, currentPeriodEnd) ??
        (stableTransactionOrOrderId
          ? `creem:sub:${subscriptionId}:payment:${stableTransactionOrOrderId}`
          : undefined);
    } else {
      paymentId = stableTransactionOrOrderId;
    }

    if (!paymentId && eventId) {
      console.warn(`[Creem Webhook] Falling back to event id for idempotency: ${eventId}`);
      paymentId = eventId;
    }

    if (!paymentId) return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });

    console.log(
      `[Creem Webhook] Resolved payment id=${paymentId} rawPaymentRef=${stableTransactionOrOrderId ?? "none"} ` +
        `periodEnd=${currentPeriodEnd?.toISOString() ?? "none"}`
    );

    // Idempotency: if payment already recorded, skip.
    const existing = await db
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.providerPaymentId, paymentId));
    if (existing.length > 0) {
      console.log(`[Creem Webhook] already processed payment id=${paymentId}; skipping`);
      return NextResponse.json({ received: true });
    }

    let existingSubscriptionRows: Array<typeof subscriptionTable.$inferSelect> = [];
    if (kind === "subscription" && planKey && subscriptionId) {
      existingSubscriptionRows = await db
        .select()
        .from(subscriptionTable)
        .where(eq(subscriptionTable.providerSubId, subscriptionId))
        .limit(1);

      const existingSubscription = existingSubscriptionRows[0];
      if (existingSubscription?.currentPeriodEnd && currentPeriodEnd) {
        const incomingEnd = currentPeriodEnd.getTime();
        const existingEnd = existingSubscription.currentPeriodEnd.getTime();
        const sameCycleToleranceMs = 36 * 60 * 60 * 1000;

        if (incomingEnd <= existingEnd + sameCycleToleranceMs) {
          const previousSubscriptionPayments = await db
            .select({ id: paymentTable.id })
            .from(paymentTable)
            .where(
              and(
                eq(paymentTable.userId, userId),
                eq(paymentTable.type, "subscription"),
                eq(paymentTable.planKey, planKey),
              ),
            )
            .limit(1);

          if (previousSubscriptionPayments.length > 0) {
            console.log(
              `[Creem Webhook] already processed subscription cycle subscriptionId=${subscriptionId} ` +
                `periodEnd=${currentPeriodEnd.toISOString()}; skipping`
            );
            return NextResponse.json({ received: true });
          }
        }
      }
    }

    // Insert payment record
    await db.insert(paymentTable).values({
      id: paymentId,
      provider: "creem",
      providerPaymentId: paymentId,
      userId,
      amountCents,
      currency: currency.toLowerCase(),
      status: "succeeded",
      type: paymentType,
      planKey: planKey ?? undefined,
      creditsGranted: creditsToGrant,
      raw: JSON.stringify(event).slice(0, 65000),
    });

    // Only upsert subscription record for actual subscription payments
    // NOT for one-time purchases even if they have a subscription_id
    if (kind === "subscription" && paymentType === "subscription" && planKey && subscriptionId) {
      if (existingSubscriptionRows.length === 0) {
        await db.insert(subscriptionTable).values({
          id: subscriptionId,
          provider: "creem",
          providerSubId: subscriptionId,
          userId,
          planKey,
          status: "active",
          currentPeriodEnd: currentPeriodEnd ?? null,
          raw: JSON.stringify(mainObject).slice(0, 65000),
        });
      } else {
        const updatePayload: Partial<typeof subscriptionTable.$inferInsert> = {
          status: "active",
          planKey,
        };

        if (currentPeriodEnd) {
          updatePayload.currentPeriodEnd = currentPeriodEnd;
        }

        await db
          .update(subscriptionTable)
          .set(updatePayload)
          .where(eq(subscriptionTable.providerSubId, subscriptionId));
      }
    }

    await db.transaction(async tx => {
      if (creditsToGrant > 0) {
        console.log(
          `[Creem Webhook] Granting credits amount=${creditsToGrant} paymentId=${paymentId} ` +
            `reason=${paymentType === "one_time" ? "one_time_pack" : "subscription_cycle"}`
        );

        await tx
          .update(userTable)
          .set({ credits: sql`${userTable.credits} + ${creditsToGrant}` })
          .where(eq(userTable.id, userId));

        await tx.insert(creditLedger).values({
          id: paymentId,
          userId,
          delta: creditsToGrant,
          reason: paymentType === "one_time" ? "one_time_pack" : "subscription_cycle",
          paymentId,
        });
      } else {
        console.log(`[Creem Webhook] No credits to grant for paymentId=${paymentId}`);
      }

      if (planKey && kind === "subscription") {
        await tx
          .update(userTable)
          .set({ planKey })
          .where(eq(userTable.id, userId));
      }

      if (kind === "subscription" && subscriptionId) {
        if (scheduleResetContext) {
          await resetSubscriptionSchedule(
            {
              subscriptionId: scheduleResetContext.subscriptionId,
              userId,
              derivedSchedule: scheduleResetContext.schedule,
              grantsRemaining: scheduleResetContext.grantsRemaining,
              totalCreditsRemaining: scheduleResetContext.totalCreditsRemaining,
              nextGrantAt: scheduleResetContext.nextGrantAt,
            },
            tx,
          );
        } else {
          await deleteSubscriptionSchedule(subscriptionId, tx);
        }
      }
    });

    // Get user email for sending notification
    const userResult = await db
      .select({ email: userTable.email })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (userResult && userResult.length > 0) {
      const userEmail = userResult[0].email;
      
      // Prepare order details
      const orderDetails = {
        orderId: paymentId,
        plan: planKey || key,
        amount: `$${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`,
        credits: creditsToGrant,
        type: paymentType,
      };

      // Send purchase confirmation email
      try {
        await sendPurchaseEmail(userEmail, orderDetails);
      } catch (emailError) {
        // Don't fail the webhook if email fails
        console.error("[Payment Email] Failed to send purchase email:", emailError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    // Log only critical errors
    console.error("[Creem Webhook] Critical error:", getErrorMessage(error));
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
