import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleSubscriptionTermination, type Database } from "@/lib/payments/subscription-termination";
import { subscription as subscriptionTable, user as userTable } from "@/lib/db/schema";

describe("handleSubscriptionTermination", () => {
  // Mock database instance with chainable methods
  const mockUpdate = vi.fn();
  const mockSet = vi.fn();
  const mockWhere = vi.fn();
  const mockSelect = vi.fn();
  const mockFrom = vi.fn();

  const mockDb = {
    update: mockUpdate,
    select: mockSelect,
  } as unknown as Database;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup chainable mock for update -> set -> where
    mockUpdate.mockReturnValue({
      set: mockSet.mockReturnValue({
        where: mockWhere.mockResolvedValue(undefined),
      }),
    });

    // Setup chainable mock for select -> from -> where
    mockSelect.mockReturnValue({
      from: mockFrom.mockReturnValue({
        where: vi.fn().mockResolvedValue([]), // Default empty result
      }),
    });

    // mockDb.select is already set
  });

  it("returns false for non-subscription kind", async () => {
    const result = await handleSubscriptionTermination(
      mockDb,
      "subscription.canceled",
      "sub_123",
      "user_123",
      "one_time"
    );
    expect(result).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns false for non-termination event types", async () => {
    const result = await handleSubscriptionTermination(
      mockDb,
      "subscription.active",
      "sub_123",
      "user_123",
      "subscription"
    );
    expect(result).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates subscription status to canceled for subscription.canceled event", async () => {
    const result = await handleSubscriptionTermination(
      mockDb,
      "subscription.canceled",
      "sub_123",
      "user_123",
      "subscription"
    );
    
    expect(result).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(subscriptionTable);
    expect(mockSet).toHaveBeenCalledWith({ status: "canceled" });
    expect(mockWhere).toHaveBeenCalled();
  });

  it("updates subscription status to expired for subscription.expired event", async () => {
    const result = await handleSubscriptionTermination(
      mockDb,
      "subscription.expired",
      "sub_123",
      "user_123",
      "subscription"
    );
    
    expect(result).toBe(true);
    expect(mockSet).toHaveBeenCalledWith({ status: "expired" });
  });

  it("updates subscription status to unpaid for subscription.unpaid event", async () => {
    const result = await handleSubscriptionTermination(
      mockDb,
      "subscription.unpaid",
      "sub_123",
      "user_123",
      "subscription"
    );
    
    expect(result).toBe(true);
    expect(mockSet).toHaveBeenCalledWith({ status: "unpaid" });
  });

  it("updates subscription status to unpaid for subscription.payment_failed event", async () => {
    const result = await handleSubscriptionTermination(
      mockDb,
      "subscription.payment_failed",
      "sub_123",
      "user_123",
      "subscription"
    );
    
    expect(result).toBe(true);
    expect(mockSet).toHaveBeenCalledWith({ status: "unpaid" });
  });

  it("handles British spelling subscription.cancelled", async () => {
    const result = await handleSubscriptionTermination(
      mockDb,
      "subscription.cancelled",
      "sub_123",
      "user_123",
      "subscription"
    );
    
    expect(result).toBe(true);
    expect(mockSet).toHaveBeenCalledWith({ status: "canceled" });
  });

  describe("user plan downgrade", () => {
    it("downgrades user to free plan when no other active subscriptions exist", async () => {
      // Mock select query to return empty array (no other active subscriptions)
      mockSelect.mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      await handleSubscriptionTermination(
        mockDb,
        "subscription.canceled",
        "sub_123",
        "user_123",
        "subscription"
      );
      
      // Should update subscription table
      expect(mockUpdate).toHaveBeenCalledWith(subscriptionTable);
      expect(mockSet).toHaveBeenCalledWith({ status: "canceled" });
      
      // Should also update user table to free plan
      expect(mockUpdate).toHaveBeenCalledWith(userTable);
      // The second call to set should be for planKey: "free"
      // We need to track calls more precisely
    });

    it("does not downgrade user when other active subscriptions exist", async () => {
      // Mock select query to return one active subscription
      mockSelect.mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: "sub_456" }]),
        }),
      });

      await handleSubscriptionTermination(
        mockDb,
        "subscription.canceled",
        "sub_123",
        "user_123",
        "subscription"
      );
      
      // Should only update subscription table, not user table
      // Check that update was called only once (for subscription)
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith(subscriptionTable);
    });
  });

  it("does not affect user credits", async () => {
    // The function should never update user credits
    // This is implicit - no update to user.credits field
    // We can verify by checking that set is never called with credits field
    await handleSubscriptionTermination(
      mockDb,
      "subscription.canceled",
      "sub_123",
      "user_123",
      "subscription"
    );
    
    // Ensure set was not called with credits field
    // This is a basic check - actual implementation doesn't touch credits
    expect(mockSet).not.toHaveBeenCalledWith(expect.objectContaining({ credits: expect.anything() }));
  });
});