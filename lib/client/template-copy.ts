import { ApiClientError, apiPost } from "./api-fetch";

export class PremiumAccessRequiredError extends Error {
  constructor() {
    super("Lifetime All Access is required for this template.");
    this.name = "PremiumAccessRequiredError";
  }
}

/** Calls POST /api/templates/[slug]/copy — the server enforces the premium gate. */
export async function getTemplateSource(slug: string): Promise<string> {
  try {
    const { source } = await apiPost<{ source: string }>(`/api/templates/${slug}/copy`, {});
    return source;
  } catch (error) {
    if (error instanceof ApiClientError && error.code === "PREMIUM_ACCESS_REQUIRED") {
      throw new PremiumAccessRequiredError();
    }
    throw error;
  }
}

export async function writeToClipboard(source: string) {
  if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
  await navigator.clipboard.writeText(source);
}
