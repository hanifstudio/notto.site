import type { Metadata } from "next";
import { CheckoutPage, type CheckoutState } from "@/features/checkout/checkout-page";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ state?: string | string[] }> }) {
  const params = await searchParams;
  const requested = typeof params.state === "string" ? params.state : "verifying";
  // "verified" is never trusted from the URL — CheckoutPage always re-derives it
  // from the authenticated account's real entitlement, never from this query param.
  const initialState: CheckoutState = requested === "failed" ? requested : "verifying";
  return <CheckoutPage initialState={initialState} />;
}
