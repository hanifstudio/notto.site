/**
 * Gumroad integration — hosted checkout for Notto Lifetime Access (see LIFETIME_PRICE in lib/catalog.ts).
 *
 * Gumroad's resource_subscription callbacks are unsigned (no HMAC header), so
 * two safeguards stand in for signature verification:
 *
 * 1. The callback URL registered with Gumroad (via `PUT /v2/resource_subscriptions`,
 *    once each for the `sale`, `refund`, and `dispute` resource names) embeds a
 *    shared secret as a `token` query param, plus an `event` query param naming
 *    which resource_name it was registered for — only Gumroad's registered
 *    callbacks know the secret, and `event` tells the handler which transition
 *    to apply without having to infer it from the response shape.
 * 2. The `sale_id` from the body is re-fetched server-to-server from
 *    `GET /v2/sales/:id` using GUMROAD_ACCESS_TOKEN, confirming it's a real
 *    sale on our account (and getting its authoritative `refunded` state)
 *    before anything is trusted.
 *
 * Checkout correlation: the pending purchase's `reference` is appended to the
 * product URL as `?reference=<uuid>`, and Gumroad echoes URL params back in a
 * ping's `url_params` dictionary (confirmed against the `URLParams
 * map[string]string` field in github.com/maragudk/gumroad's PingRequest
 * struct — a real, working Gumroad API client). Verified live against our own
 * account: `GET /v2/sales` does **not** include `url_params` at all — it's
 * ping-only — so `reference` must be read from the raw ping body itself
 * (`url_params[reference]`, Rails' bracket notation for a nested form field),
 * not re-derived from the API fetch. An earlier draft got this backwards and
 * silently dropped every reference, which is why first-purchase testing saw
 * no entitlement — every real ping returned 409 "no reference" once traced
 * through `vercel logs`.
 *
 * Note: a `disputed` boolean was assumed on the sale object in an earlier
 * draft too, and also doesn't appear in any real Gumroad client library
 * checked (maragudk/gumroad's PingRequest, antiwork/gumroad-cli's sale
 * view/list structs) — dropped in favor of the explicit `event` query param.
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

export function createCheckoutUrl(input: { reference: string; customerEmail: string; offerCode?: string }): string {
  const productUrl = requireEnv("GUMROAD_PRODUCT_URL");
  const url = new URL(productUrl);
  // Skips Gumroad's product landing page and opens the payment form directly
  // (gumroad.com/help/article/144-send-customers-directly-to-your-payment-form).
  url.searchParams.set("wanted", "true");
  url.searchParams.set("reference", input.reference);
  url.searchParams.set("email", input.customerEmail);
  // Must be set before `wanted=true` triggers the add-to-cart redirect, or it
  // won't reach the cart — trial-period testing aid, see route.ts comment.
  if (input.offerCode) url.searchParams.set("offer_code", input.offerCode);
  return url.toString();
}

export function isValidWebhookToken(token: string | null): boolean {
  const expected = requireEnv("GUMROAD_WEBHOOK_TOKEN");
  return token !== null && token === expected;
}

export type GumroadWebhookEvent = "sale" | "refund" | "dispute";

const GUMROAD_WEBHOOK_EVENTS: readonly GumroadWebhookEvent[] = ["sale", "refund", "dispute"];

export function isGumroadWebhookEvent(value: string | null): value is GumroadWebhookEvent {
  return value !== null && (GUMROAD_WEBHOOK_EVENTS as readonly string[]).includes(value);
}

export interface GumroadSale {
  saleId: string;
  email: string;
  refunded: boolean;
}

/** Confirms a sale_id from an inbound ping is real by re-fetching it from Gumroad's API. */
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
    refunded: Boolean(sale.refunded),
  };
}

/**
 * Extracts the checkout `reference` from a ping's raw form-encoded body.
 * Gumroad sends nested params in Rails bracket notation, so the field arrives
 * flattened as the literal key `url_params[reference]` — not a nested object.
 */
export function extractReference(params: URLSearchParams): string | null {
  return params.get("url_params[reference]");
}

/**
 * Lists sale IDs for a buyer email — the self-service fallback when a
 * webhook never arrived or was dropped (`GET /v2/sales` supports `email` per
 * Gumroad's view_sales scope). Only IDs come back; each is re-verified
 * through `fetchSale` before being trusted, same as an inbound ping.
 */
export async function findSaleIdsByEmail(email: string): Promise<string[]> {
  const accessToken = requireEnv("GUMROAD_ACCESS_TOKEN");
  const url = new URL(`${GUMROAD_API_BASE}/sales`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("email", email);

  const response = await fetch(url.toString());
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new GumroadApiError(`Gumroad sales lookup for ${email} failed.`);
  }

  return (json.sales ?? []).map((sale: { id: string }) => sale.id);
}
