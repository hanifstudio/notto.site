export type AccessLevel = "free" | "premium";

export type TemplateSummary = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  access: AccessLevel;
  thumbnail: string;
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
