export type AccessLevel = "free" | "plus";
export type AccessFilter = "all" | AccessLevel;

export const DIRECTORY_PAGE_SIZE = 12;

// Manually tracked against Gumroad sales. Decrement when a $14 slot sells;
// once this hits 0, update LIFETIME_PRICE/LIFETIME_PRICE_NEXT for the new tier.
export const LIFETIME_SLOTS_LEFT = 7;
export const LIFETIME_PRICE = 14;
export const LIFETIME_PRICE_NEXT = 20;

// Shared between CheckoutService (enforces it) and AccessService (surfaces
// the next-allowed time to the client) so the account page can show a
// countdown instead of only reacting to a 429 after the user clicks.
export const ACCESS_REFRESH_COOLDOWN_SECONDS = 5 * 60;

export type TemplateSummary = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  access: AccessLevel;
  thumbnail: string;
  previewVideo?: string;
  previewVideoGrid?: string;
  publishedAt: string;
};

export const categoryOptions = [
  { label: "AI & SaaS", value: "AI & SaaS" },
  { label: "Agency & Studio", value: "Agency & Studio" },
  { label: "Portfolio", value: "Portfolio" },
  { label: "Architecture", value: "Architecture & Interiors" },
  { label: "E-commerce", value: "E-commerce" },
  { label: "Finance", value: "Finance" },
  { label: "Hospitality", value: "Hospitality & Travel" },
  { label: "Wellness", value: "Wellness" },
  { label: "Entertainment", value: "Entertainment" },
  { label: "Experimental", value: "Experimental" },
] as const;
