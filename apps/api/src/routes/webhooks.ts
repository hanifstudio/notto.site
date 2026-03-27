import { Hono } from "hono";
import {
  verifyWebhookSignature,
  isWebhookProcessed,
  markWebhookProcessed,
  handleLicenseKeyCreated,
  handleOrderRefunded,
  type LemonSqueezyWebhookEvent,
} from "../services/lemonsqueezy";

const app = new Hono();

/**
 * LemonSqueezy webhook handler
 * POST /webhooks/lemonsqueezy
 */
app.post("/lemonsqueezy", async (c) => {
  try {
    // Get raw body and signature
    const rawBody = await c.req.text();
    const signature = c.req.header("x-signature");

    if (!signature) {
      return c.json({ error: "Missing signature" }, 400);
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return c.json({ error: "Invalid signature" }, 401);
    }

    // Parse event
    const event: LemonSqueezyWebhookEvent = JSON.parse(rawBody);
    const eventId = event.data.id;
    const eventName = event.meta.event_name;

    // Check idempotency
    const alreadyProcessed = await isWebhookProcessed(eventId);
    if (alreadyProcessed) {
      console.log(`Webhook ${eventId} already processed, skipping`);
      return c.json({ message: "Already processed" }, 200);
    }

    // Handle different event types
    switch (eventName) {
      case "license_key_created":
        await handleLicenseKeyCreated(event as any);
        break;

      case "order_refunded":
        await handleOrderRefunded(event as any);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventName}`);
    }

    // Mark as processed
    await markWebhookProcessed(eventId, eventName);

    return c.json({ message: "Webhook processed successfully" }, 200);
  } catch (error) {
    console.error("Webhook processing error:", error);
    return c.json(
      {
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

export default app;
