/**
 * Gumroad integration — hosted checkout for Notto Lifetime Access (see LIFETIME_PRICE in lib/catalog.ts).
 *
 * Gumroad's Ping/resource_subscription callbacks are unsigned (no HMAC header),
 * so two safeguards stand in for signature verification:
 *
 * 1. The callback URL registered with Gumroad (via `PUT /v2/resource_subscriptions`
 *    for both the `sale` and `refund` resource names) embeds a shared secret as
 *    a `token` query param — only Gumroad's registered callback knows it.
 * 2. Every inbound event is re-fetched server-to-server from
 *    `GET /v2/sales/:id` using GUMROAD_ACCESS_TOKEN before it's trusted, so a
 *    leaked callback URL alone can't forge a completed sale.
 *
 * Checkout correlation: the pending purchase's `reference` is appended to the
 * product URL as `?reference=<uuid>`. Gumroad echoes back any URL params on a
 * purchase in the ping's `url_params[reference]` field, which is how a given
 * sale is matched back to the purchase row `CheckoutService` created.
 */

export class GumroadNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GumroadNotConfiguredError";
  }
}

export class GumroadApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GumroadApiError";
  }
}

const GUMROAD_API_BASE = "https://api.gumroad.com/v2";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new GumroadNotConfiguredError(`${name} is not set.`);
  }
  return value;
}

export function createCheckoutUrl(input: { reference: string; customerEmail: string }): string {
  const productUrl = requireEnv("GUMROAD_PRODUCT_URL");
  const url = new URL(productUrl);
  url.searchParams.set("reference", input.reference);
  url.searchParams.set("email", input.customerEmail);
  return url.toString();
}

export function isValidWebhookToken(token: string | null): boolean {
  const expected = requireEnv("GUMROAD_WEBHOOK_TOKEN");
  return token !== null && token === expected;
}

export interface GumroadSale {
  saleId: string;
  email: string;
  reference: string | null;
  refunded: boolean;
  disputed: boolean;
}

/** The only trust anchor for an inbound ping — re-fetches the sale straight from Gumroad's API. */
export async function fetchSale(saleId: string): Promise<GumroadSale> {
  const accessToken = requireEnv("GUMROAD_ACCESS_TOKEN");
  const url = new URL(`${GUMROAD_API_BASE}/sales/${encodeURIComponent(saleId)}`);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString());
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new GumroadApiError(`Gumroad sale ${saleId} could not be verified.`);
  }

  const sale = json.sale;
  return {
    saleId: sale.id,
    email: sale.email,
    reference: sale.url_params?.reference ?? null,
    refunded: Boolean(sale.refunded),
    disputed: Boolean(sale.disputed),
  };
}
