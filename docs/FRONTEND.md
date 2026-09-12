# Frontend architecture

The frontend is organized by responsibility so that backend integration can replace adapters without rewriting screens.

## Directory map

- `app/` — Next.js routes, route parameter parsing, global styles, fonts, and providers.
- `components/layout/` — shared product chrome plus `MinimalShell`. Authentication, account, and checkout routes intentionally use focused shells without the global header or footer.
- `components/ui/` — route-independent controls and feedback.
- `features/` — product workflows grouped by domain: access, account, auth, checkout, directory, legal, and templates.
- `hooks/` — shared state machines that coordinate UI and services.
- `lib/` — typed fixture data, content, small utilities, and backend-facing adapters.
- `styles/` — semantic styles split by shared UI and product feature; `app/globals.css` only controls import order.
- `public/thumbnails/` — public visual metadata only. Template HTML must never be placed here.

## Important boundaries

Backend is wired up — see the root `CLAUDE.md` and `PATTERN.md` for the full layer model and enforcement. The notes below are what's specific to the frontend side of that wiring.

### Template source

UI components call `useTemplateCopy` (`hooks/use-template-copy.ts`), which delegates to `lib/client/template-copy.ts` → `POST /api/templates/[slug]/copy`. The server (`TemplateService`) enforces the premium gate; the client never receives or holds premium HTML it isn't allowed to see.

### Authentication

`features/auth/auth-provider.tsx` adapts NextAuth's `useSession()` + `useAccount()` (TanStack Query, `lib/hooks/use-account.ts`) into the original `{ session, signOut }` context shape the screens already consumed, so `directory-page.tsx`, `template-detail-page.tsx`, `account-page.tsx`, etc. didn't need to change. Sign-in/register/reset actions call NextAuth's client `signIn()` and the `/api/auth/*` routes directly from `features/auth/auth-page.tsx` — they don't go through the auth context.

### Payments

`features/access/access-offer.tsx` calls `POST /api/checkout/session` and redirects to the returned Contra URL. Contra's real API isn't wired yet (`lib/integrations/contra.ts` is a scaffold — see its file comment), so this currently surfaces a "checkout isn't available yet" error in the dialog until `CONTRA_API_KEY`/`CONTRA_PRODUCT_ID` are set and the integration is implemented against the real docs.

### Catalogue

`lib/catalog.ts` now holds only the `TemplateSummary`/`AccessLevel` types and the static `categoryOptions` taxonomy. Template data itself lives in the `templates` table (Neon/Drizzle) behind `TemplateService` — `app/page.tsx` and `app/templates/[slug]/page.tsx` call it directly as server components (SSR, good for SEO). Re-seed or edit via `npm run db:seed` (`scripts/seed.ts`) or `npm run db:studio`.

### Legal content

`lib/legal-content.ts` supplies implementation copy for layout testing. It is not legal advice or launch-approved policy text; replace it after legal and business review without changing the reusable document renderer.

## Designed state previews

These URLs still force non-default states for design review, independent of real data:

- `/?view=loading`
- `/?view=error`
- `/?q=studio&access=premium`
- `/account?status=free` / `/account?status=active` / `/account?status=revoked` — overrides `AccountPage`'s `previewStatus` prop, bypassing the real session
- `/checkout/success?state=verifying` / `?state=verified` / `?state=failed`
- `/checkout/cancelled`

Real auth is live — register/log in with any email (10+ character password). `npm run db:seed` also leaves no test user; create one via `/register`, or use the local dev account created while smoke-testing this wiring: `test@example.com` / `password1234`.
