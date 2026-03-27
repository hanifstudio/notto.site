import crypto from "crypto";
import { db } from "../db";
import {
  licenses,
  userSubscriptions,
  users,
  webhooksProcessed,
} from "@notto/shared/db";
import { eq, and } from "drizzle-orm";

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LEMONSQUEEZY_VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID;

export interface LemonSqueezyOrderWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: "orders";
    attributes: {
      store_id: number;
      customer_id: number;
      identifier: string;
      order_number: number;
      user_name: string;
      user_email: string;
      status: string;
      refunded: boolean;
      refunded_at: string | null;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface LemonSqueezyLicenseKeyWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: "license-keys";
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      order_item_id: number;
      product_id: number;
      user_name: string;
      user_email: string;
      key: string;
      key_short: string;
      activation_limit: number;
      instances_count: number;
      disabled: boolean;
      status: string;
      status_formatted: string;
      expires_at: string | null;
      created_at: string;
      updated_at: string;
    };
  };
}

export type LemonSqueezyWebhookEvent =
  | LemonSqueezyOrderWebhookEvent
  | LemonSqueezyLicenseKeyWebhookEvent;

/**
 * Verify LemonSqueezy webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
): boolean {
  if (!LEMONSQUEEZY_WEBHOOK_SECRET) {
    throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET not configured");
  }

  const hmac = crypto.createHmac("sha256", LEMONSQUEEZY_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Check if webhook event has already been processed (idempotency)
 */
export async function isWebhookProcessed(eventId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(webhooksProcessed)
    .where(eq(webhooksProcessed.eventId, eventId))
    .limit(1);

  return result.length > 0;
}

/**
 * Mark webhook event as processed
 */
export async function markWebhookProcessed(
  eventId: string,
  eventName: string,
): Promise<void> {
  await db.insert(webhooksProcessed).values({
    eventId,
    eventName,
  });
}

/**
 * Handle license_key_created webhook event
 */
export async function handleLicenseKeyCreated(
  event: LemonSqueezyLicenseKeyWebhookEvent,
): Promise<void> {
  const { data } = event;
  const orderId = data.attributes.order_id.toString();
  const userEmail = data.attributes.user_email;
  const licenseKey = data.attributes.key;

  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, userEmail))
    .limit(1);

  if (!user) {
    console.warn(`User not found for email: ${userEmail}, order: ${orderId}`);
    // Store pending license for later activation
    return;
  }

  // Use transaction for atomic updates
  await db.transaction(async (tx) => {
    // Create license record
    const [license] = await tx
      .insert(licenses)
      .values({
        userId: user.id,
        licenseKey,
        lemonsqueezyOrderId: orderId,
        status: "active",
        purchasedAt: new Date(data.attributes.created_at),
      })
      .returning();

    // Create or update subscription
    const existingSubscription = await tx
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, user.id))
      .limit(1);

    if (existingSubscription.length > 0) {
      await tx
        .update(userSubscriptions)
        .set({
          tier: "lifetime",
          isActive: true,
          licenseId: license.id,
          updatedAt: new Date(),
        })
        .where(eq(userSubscriptions.userId, user.id));
    } else {
      await tx.insert(userSubscriptions).values({
        userId: user.id,
        tier: "lifetime",
        isActive: true,
        licenseId: license.id,
      });
    }

    // Update user record
    await tx
      .update(users)
      .set({
        subscriptionTier: "lifetime",
        hasLifetimeAccess: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  });

  console.log(`License activated for user ${user.email}, order ${orderId}`);
}

/**
 * Handle order_refunded webhook event
 */
export async function handleOrderRefunded(
  event: LemonSqueezyOrderWebhookEvent,
): Promise<void> {
  const { data } = event;
  const orderId = data.id; // Use the order ID from the event

  // Find license by order ID
  const [license] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.lemonsqueezyOrderId, orderId))
    .limit(1);

  if (!license) {
    console.warn(`License not found for order: ${orderId}`);
    return;
  }

  // Use transaction for atomic updates
  await db.transaction(async (tx) => {
    // Update license status
    await tx
      .update(licenses)
      .set({
        status: "refunded",
        refundedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(licenses.id, license.id));

    // Deactivate subscription
    await tx
      .update(userSubscriptions)
      .set({
        tier: "free",
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.userId, license.userId));

    // Update user record
    await tx
      .update(users)
      .set({
        subscriptionTier: "free",
        hasLifetimeAccess: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, license.userId));
  });

  console.log(`License refunded for order ${orderId}`);
}

/**
 * Get user's subscription status
 */
export async function getUserSubscription(userId: string) {
  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  return subscription || null;
}

/**
 * Check if user has active lifetime access
 */
export async function hasLifetimeAccess(userId: string): Promise<boolean> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.hasLifetimeAccess || false;
}

/**
 * Generate checkout URL with pre-filled email using LemonSqueezy Checkouts API
 */
export async function generateCheckoutUrl(
  email: string,
  userId?: string,
): Promise<string> {
  if (!LEMONSQUEEZY_API_KEY) {
    throw new Error("LEMONSQUEEZY_API_KEY not configured");
  }
  if (!LEMONSQUEEZY_STORE_ID) {
    throw new Error("LEMONSQUEEZY_STORE_ID not configured");
  }
  if (!LEMONSQUEEZY_VARIANT_ID) {
    throw new Error("LEMONSQUEEZY_VARIANT_ID not configured");
  }

  // Prepare custom data for webhook
  const customData: Record<string, string> = {};
  if (userId) {
    customData.user_id = userId;
  }

  // Create checkout via LemonSqueezy API
  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email,
            custom: customData,
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: LEMONSQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: LEMONSQUEEZY_VARIANT_ID,
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("LemonSqueezy API error:", errorText);
    throw new Error(
      `Failed to create checkout: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    data: {
      attributes: {
        url: string;
      };
    };
  };
  const checkoutUrl = data.data.attributes.url;

  if (!checkoutUrl) {
    throw new Error("No checkout URL returned from LemonSqueezy API");
  }

  return checkoutUrl;
}

/**
 * Validate license key manually (fallback)
 */
export async function validateLicenseKey(
  licenseKey: string,
  userId: string,
): Promise<boolean> {
  const [license] = await db
    .select()
    .from(licenses)
    .where(
      and(
        eq(licenses.licenseKey, licenseKey),
        eq(licenses.userId, userId),
        eq(licenses.status, "active"),
      ),
    )
    .limit(1);

  return !!license;
}

/**
 * Get remaining lifetime slots
 * @param totalSlots - Total number of lifetime slots available (default: 10)
 * @returns Number of remaining slots
 */
export async function getRemainingSlots(
  totalSlots: number = 10,
): Promise<number> {
  const result = await db
    .select()
    .from(licenses)
    .where(eq(licenses.status, "active"));

  const soldCount = result.length;
  const remaining = Math.max(0, totalSlots - soldCount);

  return remaining;
}
