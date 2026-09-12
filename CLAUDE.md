# Orbie

Curated HTML template directory. Copy a complete page, paste it into a coding agent. See `PRD.md` for product scope.

## Architecture

Single Next.js app (no monorepo). Strict layer separation — never skip layers. Eight named layers enforce clear responsibilities:

```
Component → Hook → API Route → Service → Database
                   ↓
               Auth Adapter
                   ↓
               Shared Helpers
```

- **Component** (`components/**`, `features/**`, `app/**/*.tsx`): UI. Calls a hook, or receives data as props from a server component. Never imports a service, the DB, or a vendor client.
- **Hook** (`lib/hooks/*.ts`): TanStack Query wrapper only — calls an API route via `fetch`. Used selectively (see below), not for everything.
- **Client util** (`lib/client/*.ts`): browser-only code — `api-fetch.ts`, clipboard, DOM helpers. Imports React/DOM/`@/lib/shared`, never a backend layer.
- **General client hooks** (top-level `hooks/*.ts`): stateful React hooks that aren't TanStack Query wrappers (timers, clipboard state). May call `lib/client/*`; never a service, the DB, or a vendor client.
- **API route** (`app/api/**/route.ts`): auth check + input validation only. Calls exactly one service.
- **Service** (`lib/services/*.service.ts`): business logic + data transformation. Calls the DB layer and integrations — never another service.
- **Database** (`lib/db/*.ts`): Drizzle queries only. Zero business logic.
- **Integration** (`lib/integrations/*.ts`): vendor clients (Brevo, Contra) — pure, no DB access.
- **Auth adapter** (`lib/auth/*.ts`): NextAuth config + session loading. May import `@/lib/db`, never services or integrations.
- **Shared** (`lib/shared/*.ts`): typed errors, response envelope. Imports nothing internal.

This pattern MUST be followed for every feature. Breaking it blocks code review.

Responses are typed envelopes: `{ success: true, data }` or `{ success: false, error: { message, code } }`, returned via `ok()` / `fail()` / `handleApiError()` from `@/lib/shared/api-response`.

**Enforcement:** layer boundaries via eslint (`no-restricted-imports` zones in `eslint.config.mjs`), route shape via `scripts/check-pattern.mjs`, both run by the pre-commit hook (`npm run lint && npm run check:pattern`). See `PATTERN.md` for all rules. See `docs/architecture.md` for the full system design and where to put new code.

## Where to put new code

- **New DB query** → `lib/db/<entity>.ts`. Drizzle only, no business logic.
- **New business rule** → `lib/services/<name>.service.ts`. Calls `lib/db/*` and `lib/integrations/*`.
- **New vendor integration** → `lib/integrations/<vendor>.ts`. Pure client, no DB, no services.
- **New page/layout (server component)** — may call `@/lib/services/*` directly and render server-side. Best for SEO-relevant content (the directory and template detail pages are server-rendered for exactly this reason — see `app/page.tsx`, `app/templates/[slug]/page.tsx`).
- **New client mutation** (form submit, button action) — call the API route via `lib/client/api-fetch.ts` (`apiFetch`/`apiPost`/`apiPatch`) directly from the component. Don't reach for TanStack Query unless caching genuinely helps (see below).
- **New TanStack Query hook** — only where client-side caching or repeated reads across components justify it. Today: `useAccount` (entitlement status read in the account page, premium copy gate, and the checkout verification poll).

## Testing

No test suite exists yet. When adding one, follow the screenbolt-new precedent: unit-test services (business logic lives there), mock the DB layer, not the API routes.

## Before Substantial Changes

Read `docs/architecture.md` for system design and `PRD.md` for product scope.

## Repository Conventions

- Commit messages start with a verb: "feat:", "fix:", "refactor:", "docs:".
- `.env.local` holds real secrets (gitignored); `.env.example` documents every variable with empty values.
