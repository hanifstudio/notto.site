import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const templateAccess = pgEnum("template_access", ["free", "plus"]);
export const templateStatus = pgEnum("template_status", ["draft", "published"]);
export const purchaseStatus = pgEnum("purchase_status", [
  "pending",
  "completed",
  "refunded",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Rate-limits POST /api/account/refresh (self-service Gumroad reconciliation) to once per 5 minutes.
  lastAccessRefreshAt: timestamp("last_access_refresh_at", { withTimezone: true }),
});

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("password_reset_tokens_user_id_idx").on(table.userId)],
);

export const templates = pgTable(
  "templates",
  {
    slug: text("slug").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    access: templateAccess("access").notNull().default("free"),
    status: templateStatus("status").notNull().default("draft"),
    thumbnail: text("thumbnail").notNull(),
    previewVideo: text("preview_video"),
    previewVideoGrid: text("preview_video_grid"),
    sourceHtml: text("source_html").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // Covers the directory's keyset-paginated listing query: filter by status
  // (always) and access/category (often), ordered by published_at/slug.
  (table) => [
    index("templates_status_published_at_idx").on(table.status, table.publishedAt.desc(), table.slug.desc()),
    index("templates_status_access_idx").on(table.status, table.access),
    index("templates_status_category_idx").on(table.status, table.category),
  ],
);

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: purchaseStatus("status").notNull().default("pending"),
    provider: text("provider").notNull().default("gumroad"),
    providerReference: text("provider_reference"),
    amountCents: integer("amount_cents").notNull().default(1200),
    currency: text("currency").notNull().default("usd"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("purchases_user_id_idx").on(table.userId),
    index("purchases_provider_reference_idx").on(table.providerReference),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
  passwordResetTokens: many(passwordResetTokens),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, { fields: [purchases.userId], references: [users.id] }),
}));
