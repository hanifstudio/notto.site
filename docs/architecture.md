# Architecture

## Overview

Orbie is a curated HTML template directory: browse templates, copy the full HTML of a free one instantly, or unlock all premium templates with a one-time $12 "Lifetime All Access" purchase. See `PRD.md` for product scope.

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
│   ├── integrations/      Vendor clients (Brevo, Contra)
│   ├── auth/               NextAuth config + session helpers
│   ├── hooks/               TanStack Query wrappers
│   ├── client/              Browser-only utilities (api-fetch, clipboard)
│   ├── shared/              Typed errors, response envelope
│   └── catalog.ts            UI-facing types (TemplateSummary) + static category taxonomy
├── drizzle/               Generated SQL migrations
├── scripts/               seed.ts, check-pattern.mjs
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
| **Integration** | `lib/integrations/*.ts` | Vendor clients (Brevo, Contra) — pure | vendor SDKs / `fetch`, `node:*`, `@/lib/shared` | services, `@/lib/db`, `next/server` |
| **Auth adapter** | `lib/auth/*.ts` | NextAuth config, session loading, current-user lookup | `@/lib/db`, `@/lib/shared` | services, integrations |
| **Shared** | `lib/shared/*.ts` | Typed errors, success/failure envelopes | (nothing internal) | everything internal |
| **Client util** | `lib/client/*.ts` | DOM code, `api-fetch`, presentation formatters | React, DOM, `@/lib/shared` | db, services, integrations |
| **TanStack Query hook** | `lib/hooks/*.ts` | React Query wrapper over an API route | `@/lib/client/api-fetch`, `next-auth/react` | services, db |
| **General client hook** | `hooks/*.ts` | Stateful UI logic (clipboard, timers) not backed by React Query | `@/lib/client/*` | services, db, integrations |

Layer boundaries are enforced by eslint `no-restricted-imports` zones (`npm run lint`) and route shape rules (`npm run check:pattern`). See `PATTERN.md`.

## Tech Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, NextAuth v5 (Credentials provider, JWT sessions — email/password only), Drizzle ORM + PostgreSQL (Neon, pooled endpoint at runtime via `postgres(url, { prepare: false })`), TanStack Query v5, Zod, Brevo (transactional email — password reset), Contra (hosted checkout for the $12 one-time purchase — **integration scaffolded, not yet implemented**; see `lib/integrations/contra.ts`).

## Data model

- `users` — email + bcrypt password hash. No OAuth, no NextAuth DB adapter (Credentials provider forces JWT sessions, so no `accounts`/`sessions` tables are needed).
- `password_reset_tokens` — single-use, sha256-hashed, 60-minute expiry.
- `templates` — slug, title, description, category, tags, `access` (`free`/`premium`), thumbnail, `source_html`, `published_at`. `source_html` is only ever returned by `POST /api/templates/[slug]/copy`, gated by `TemplateService`.
- `purchases` — one-time $12 purchase per user. `status`: `pending` (checkout session created) → `completed` (Contra webhook confirmed) or `refunded`. "All Access" = does the user have a `completed` purchase.

## Auth flow (email + password)

- Register: `POST /api/auth/register` creates the user, client then calls NextAuth's `signIn("credentials", ...)` to establish the session.
- Login: client calls NextAuth's `signIn("credentials", ...)` directly — no custom route needed.
- Forgot password: `POST /api/auth/forgot-password` always responds the same way regardless of whether the email is registered (no account-existence leak); sends a reset link via Brevo if it is.
- Reset password: `POST /api/auth/reset-password` verifies the token, updates the password, client then signs in.

## Checkout flow (Contra, $12 one-time)

1. Client calls `POST /api/checkout/session` (authenticated) → `CheckoutService.createCheckoutSession` creates a `pending` purchase row with a random reference, then calls `lib/integrations/contra.ts` to get a checkout URL.
2. Client redirects the browser to that URL.
3. Contra's webhook (`POST /api/webhooks/contra`) calls `CheckoutService.verifyAndApplyWebhook`, which verifies the signature, validates the payload, and flips the purchase to `completed` or `refunded`.
4. `/checkout/success` polls `GET /api/account` (via the `useAccount` TanStack Query hook) until `entitlement` becomes `"active"` — no client-side timer fakes activation.

**Not yet implemented:** `lib/integrations/contra.ts`'s `createCheckoutUrl` and `verifyWebhookSignature` are scaffolds that throw until Contra's actual API/webhook docs are reviewed and `CONTRA_API_KEY`/`CONTRA_PRODUCT_ID`/`CONTRA_WEBHOOK_SECRET` are set.

## SEO

The directory (`/`) and template detail pages (`/templates/[slug]`) are the product's primary surface (PRD 1.6 — no separate marketing page), so they're server-rendered rather than client-fetched:

- `app/page.tsx`, `app/templates/[slug]/page.tsx` call `TemplateService` directly (server components, allowed by the layer model) and `revalidate` every 5 minutes.
- `app/templates/[slug]/page.tsx` exports `generateStaticParams` (SSG at build time) and `generateMetadata` (per-template title/description/OG/Twitter cards, canonical URL).
- `app/sitemap.ts` lists every template plus static pages, revalidated hourly.
- `app/robots.ts` allows crawling (including AI bots — GPTBot, ClaudeBot, PerplexityBot, etc.) except `/account`, `/checkout`, `/api`.
- Root `app/layout.tsx` sets `metadataBase`, a title template, and default OG/Twitter metadata.

## Where to Put New Code

See the "Where to put new code" section in `CLAUDE.md`.
