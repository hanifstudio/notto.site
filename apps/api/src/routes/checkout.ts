import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import {
  generateCheckoutUrl,
  getRemainingSlots,
} from "../services/lemonsqueezy";
import { db } from "../db";
import { users } from "@notto/shared/db";
import { eq } from "drizzle-orm";

const app = new Hono();

/**
 * Generate checkout URL for current user
 * POST /checkout
 */
app.post("/", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    // Get user email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Generate checkout URL
    const checkoutUrl = await generateCheckoutUrl(user.email, userId);

    return c.json({ checkoutUrl });
  } catch (error) {
    console.error("Checkout URL generation error:", error);
    return c.json({ error: "Failed to generate checkout URL" }, 500);
  }
});

/**
 * Get remaining lifetime slots
 * GET /checkout/slots
 */
app.get("/slots", async (c) => {
  try {
    const remaining = await getRemainingSlots(10); // 10 total slots
    const total = 10;
    const sold = total - remaining;

    return c.json({
      total,
      sold,
      remaining,
    });
  } catch (error) {
    console.error("Failed to get remaining slots:", error);
    return c.json({ error: "Failed to get remaining slots" }, 500);
  }
});

export default app;
