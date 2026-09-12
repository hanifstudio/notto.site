import { CheckoutPage, type CheckoutState } from "@/features/checkout/checkout-page";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ state?: string | string[] }> }) {
  const params = await searchParams;
  const requested = typeof params.state === "string" ? params.state : "verifying";
  const initialState: CheckoutState = requested === "verified" || requested === "failed" ? requested : "verifying";
  return <CheckoutPage initialState={initialState} />;
}
