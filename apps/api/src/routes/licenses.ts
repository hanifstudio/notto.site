import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import {
  getUserSubscription,
  hasLifetimeAccess,
  validateLicenseKey,
} from "../services/lemonsqueezy";

const app = new Hono();

/**
 * Get current user's subscription status
 * GET /licenses/validate
 */
app.get("/validate", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    const subscription = await getUserSubscription(userId);
    const lifetime = await hasLifetimeAccess(userId);

    return c.json({
      tier: subscription?.tier || "free",
      isActive: subscription?.isActive || false,
      hasLifetimeAccess: lifetime,
    });
  } catch (error) {
    console.error("License validation error:", error);
    return c.json({ error: "Failed to validate license" }, 500);
  }
});

/**
 * Manually validate a license key (fallback)
 * POST /licenses/activate
 */
app.post("/activate", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const { licenseKey } = await c.req.json();

    if (!licenseKey) {
      return c.json({ error: "License key required" }, 400);
    }

    const isValid = await validateLicenseKey(licenseKey, userId);

    if (!isValid) {
      return c.json({ error: "Invalid license key" }, 400);
    }

    return c.json({ message: "License activated successfully" });
  } catch (error) {
    console.error("License activation error:", error);
    return c.json({ error: "Failed to activate license" }, 500);
  }
});

export default app;
