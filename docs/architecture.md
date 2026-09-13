# Architecture

## Overview

Notto is a curated HTML template directory: browse templates, copy the full HTML of a free one instantly, or unlock all plus templates with a one-time $12 "Lifetime All Access" purchase. See `PRD.md` for product scope.

Single Next.js app (App Router) — no monorepo, no separate client app.

## Repo layout

```
orbie/
├── app/                 Routes, API routes, SEO files (sitemap.ts, robots.ts)
├── features/            UI composition per product workflow (auth, directory, templates, checkout, account, access, legal)
├── components/          Route-independent UI (layout chrome, ui primitives)
├── hooks/               General client-side React hooks (not TanStack Query wrappers — see lib/hooks)
├── lib/
│   ├── db/               Drizzle schema + query-only modules
│   ├── services/          Business logic
│   ├── integrations/      Vendor clients (Brevo, Gumroad)
│   ├── auth/               NextAuth config + session helpers
│   ├── hooks/               TanStack Query wrappers
│   ├── client/              Browser-only utilities (api-fetch, clipboard)
│   ├── shared/              Typed errors, response envelope
│   └── catalog.ts            UI-facing types (TemplateSummary) + static category taxonomy
├── drizzle/               Generated SQL migrations
├── scripts/               ingest-templates.ts, check-pattern.mjs
├── CLAUDE.md              Repo-wide house rules
├── PATTERN.md              Enforcement rules (this doc's sibling)
└── docs/architecture.md    (this file)
```

## Backend Layer Model

| Layer | Path | Responsibility | May import | Must not import |
|---|---|---|---|---|
| **Route** | `app/api/**/route.ts` | Auth check, input validation, call one service | `@/lib/services`, `@/lib/auth`, `@/lib/shared` | `@/lib/db`, `@/lib/integrations`, `drizzle-orm`, `postgres` |
| **Service** | `lib/services/*.service.ts` | Business logic, data transformation, call DB + integrations | `@/lib/db`, `@/lib/integrations`, `@/lib/shared` | other services, `@/lib/auth`, `next/server`, `drizzle-orm`, `postgres` |
| **Database** | `lib/db/*.ts` | Drizzle queries only | `drizzle-orm`, schema | services, integrations, `next/server` |
| **Integration** | `lib/integrations/*.ts` | Vendor clients (Brevo, Gumroad) — pure | vendor SDKs / `fetch`, `node:*`, `@/lib/shared` | services, `@/lib/db`, `next/server` |
| **Auth adapter** | `lib/auth/*.ts` | NextAuth config, session loading, current-user lookup | `@/lib/db`, `@/lib/shared` | services, integrations |
| **Shared** | `lib/shared/*.ts` | Typed errors, success/failure envelopes | (nothing internal) | everything internal |
| **Client util** | `lib/client/*.ts` | DOM code, `api-fetch`, presentation formatters | React, DOM, `@/lib/shared` | db, services, integrations |
| **TanStack Query hook** | `lib/hooks/*.ts` | React Query wrapper over an API route | `@/lib/client/api-fetch`, `next-auth/react` | services, db |
| **General client hook** | `hooks/*.ts` | Stateful UI logic (clipboard, timers) not backed by React Query | `@/lib/client/*` | services, db, integrations |

Layer boundaries are enforced by eslint `no-restricted-imports` zones (`npm run lint`) and route shape rules (`npm run check:pattern`). See `PATTERN.md`.

## Tech Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, NextAuth v5 (Credentials provider, JWT sessions — email/password only), Drizzle ORM + PostgreSQL (Neon, pooled endpoint at runtime via `postgres(url, { prepare: false })`), TanStack Query v5, Zod, Brevo (transactional email — password reset), Gumroad (hosted checkout for the $12 one-time purchase; see `lib/integrations/gumroad.ts`).

## Data model

- `users` — email + bcrypt password hash. No OAuth, no NextAuth DB adapter (Credentials provider forces JWT sessions, so no `accounts`/`sessions` tables are needed).
- `password_reset_tokens` — single-use, sha256-hashed, 60-minute expiry.
- `templates` — slug, title, description, category, tags, `access` (`free`/`plus`), thumbnail, `source_html`, `published_at`. `source_html` is only ever returned by `POST /api/templates/[slug]/copy`, gated by `TemplateService`.
- `purchases` — one-time $12 purchase per user. `status`: `pending` (checkout session created) → `completed` (Gumroad sale confirmed) or `refunded`. "All Access" = does the user have a `completed` purchase.

## Auth flow (email + password)

- Register: `POST /api/auth/register` creates the user, client then calls NextAuth's `signIn("credentials", ...)` to establish the session.
- Login: client calls NextAuth's `signIn("credentials", ...)` directly — no custom route needed.
- Forgot password: `POST /api/auth/forgot-password` always responds the same way regardless of whether the email is registered (no account-existence leak); sends a reset link via Brevo if it is.
- Reset password: `POST /api/auth/reset-password` verifies the token, updates the password, client then signs in.

## Checkout flow (Gumroad, $12 one-time)

Contra was evaluated first (see PRD § "Contra integration capability") and ruled out: it exposes no public API, no webhooks, and no export — the transaction dashboard is UI-only. Gumroad was chosen instead: email-only seller signup (no Stripe-style business verification gate), a real `GET /v2/sales/:id` API, and `resource_subscriptions` webhooks for both `sale` and `refund` events.

1. Client calls `POST /api/checkout/session` (authenticated) → `CheckoutService.createCheckoutSession` creates a `pending` purchase row with a random reference, then calls `lib/integrations/gumroad.ts` to build the checkout URL (`GUMROAD_PRODUCT_URL?reference=<uuid>&email=<customerEmail>`).
2. Client redirects the browser to that URL.
3. Gumroad's callback (`POST /api/webhooks/gumroad?token=...`) calls `CheckoutService.verifyAndApplyWebhook`. Gumroad's callbacks are **unsigned** and **form-encoded** (not JSON), so authenticity comes from two layers instead of an HMAC check: the `token` query param on the registered callback URL (`GUMROAD_WEBHOOK_TOKEN`), then a mandatory re-fetch of the sale from `GET /v2/sales/:id` before trusting it. The purchase is matched by the `reference` echoed back in the sale's `url_params`, then flipped to `completed` or `refunded` based on the sale's authoritative `refunded` flag.
4. `/checkout/success` polls `GET /api/account` (via the `useAccount` TanStack Query hook) until `entitlement` becomes `"active"` — no client-side timer fakes activation.

**One-time external setup (not app code):** the `sale` and `refund` resource subscriptions are registered once per environment via `PUT https://api.gumroad.com/v2/resource_subscriptions` (`access_token`, `resource_name`, `post_url` pointing at `/api/webhooks/gumroad?token=<GUMROAD_WEBHOOK_TOKEN>`) — there's no persistent UI for this, it's a one-off API call per environment.

## SEO

The directory (`/`) and template detail pages (`/templates/[slug]`) are the product's primary surface (PRD 1.6 — no separate marketing page), so they're server-rendered rather than client-fetched:

- `app/page.tsx`, `app/templates/[slug]/page.tsx` call `TemplateService` directly (server components, allowed by the layer model) and `revalidate` every 5 minutes.
- `app/templates/[slug]/page.tsx` exports `generateStaticParams` (SSG at build time) and `generateMetadata` (per-template title/description/OG/Twitter cards, canonical URL).
- `app/sitemap.ts` lists every template plus static pages, revalidated hourly.
- `app/robots.ts` allows crawling (including AI bots — GPTBot, ClaudeBot, PerplexityBot, etc.) except `/account`, `/checkout`, `/api`.
- Root `app/layout.tsx` sets `metadataBase`, a title template, and default OG/Twitter metadata.

## Where to Put New Code

See the "Where to put new code" section in `CLAUDE.md`.
