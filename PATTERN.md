# API Route Pattern — Enforcement Guide

**This file describes what is mechanically enforced.** The request path is Component → Hook → API Route → Service → Database, with Integration, Auth adapter, Shared, and Client util as additional named layers. See `CLAUDE.md` for the layer table and `docs/architecture.md` for the full system design.

## Enforcement

Two hard-failing checks:

```bash
npm run lint             # layer boundaries (eslint no-restricted-imports)
npm run check:pattern    # route shape (scripts/check-pattern.mjs)
```

Both run on every commit via the pre-commit hook (`.githooks/pre-commit`), wired through `core.hooksPath` (installed automatically by `npm install`'s `prepare` script once this is a git repo; run `git config core.hooksPath .githooks` manually otherwise). Bypass with `git commit -n` only for work already known to be non-compliant.

## Layer Boundary Enforcement — `npm run lint`

`no-restricted-imports` zones in `eslint.config.mjs`:

| Zone | Deny list |
|---|---|
| `app/**/*.ts` (excl. `app/api/**`) | `@/lib/db`, `@/lib/db/**`, `drizzle-orm*`, `postgres`, `@/lib/integrations/**` — server files like `sitemap.ts`/`robots.ts` can call services, not DB/integrations |
| `app/api/**/route.ts` | `@/lib/db`, `@/lib/db/**`, `drizzle-orm*`, `postgres`, `@/lib/integrations/**` — routes delegate to services |
| `lib/services/**` | other services, `next/server`, `@/lib/hooks/**`, `hooks/**`, `@/lib/auth/**`, `drizzle-orm`, `postgres`, bare `@/lib/db`/`@/lib/db/schema` imports (must import a named function from `@/lib/db/<module>`) |
| `lib/db/**` | `@/lib/services/**`, `@/lib/integrations/**`, `next/server` |
| `lib/integrations/**` | `@/lib/services/**`, `next/server`, `@/lib/db`, `@/lib/db/**` |
| `lib/auth/**` | `@/lib/services/**`, `@/lib/integrations/**` |
| `lib/hooks/**` | `@/lib/services/**`, `@/lib/db**` |
| `hooks/**` (top-level, general client hooks) | `@/lib/services/**`, `@/lib/db**`, `@/lib/integrations/**` |
| `lib/client/**` | `@/lib/db`, `@/lib/db/**`, `@/lib/services/**`, `@/lib/integrations/**` |
| `components/**`, `features/**`, `app/**/*.tsx` | `@/lib/services/**`, `@/lib/db`, `@/lib/db/**`, `@/lib/integrations/**` |
| `app/**/page.tsx`, `app/**/layout.tsx` | `@/lib/db`, `@/lib/db/**`, `@/lib/integrations/**` (server components can call services; declared last so it wins over the components zone) |

## Route Shape Enforcement — `npm run check:pattern`

Per route, enforced via regex in `scripts/check-pattern.mjs`:

**File-level:**
- **`service`** — imports exactly one `@/lib/services/*` service.

**Handler-level (per HTTP method):**
- **`auth`** — calls `getCurrentUser()` and the guard actually `return`s (not an empty `if`).
- **`service`** — actually calls the imported service in this handler (not a dead import).
- **`try-catch`** — every handler wrapped in try/catch.
- **`error-handling`** — catch block calls `console.error()` or `handleApiError()`.
- **`zod`** — a handler that genuinely reads the body (`request.json()`) validates it with `.safeParse()`. Routes that delegate body parsing entirely to a service (e.g. the Contra webhook) are exempt — validation still happens, just one layer down.
- **`response-shape`** — non-redirect failures return `fail()` or `handleApiError()`.
- **`envelope`** — non-redirect, non-exempt handlers return through `ok()` or `handleApiError()`.
- **`no-manual-status`** — no hand-built `NextResponse.json({ ... }, { status })`.

Redirects (`NextResponse.redirect()`) skip `response-shape` and `envelope`.

## Exemptions

Declared in `EXEMPT` at the top of `scripts/check-pattern.mjs`, each with a reason. `"rule"` exempts a rule for every handler in the file; `"rule:METHOD"` (e.g. `"auth:GET"`) exempts only that handler — prefer the scoped form. The checker warns to stderr on a misspelled rule or method name.

Current exemptions (5 entries):

```
"app/api/auth/[...nextauth]/route.ts": rules: "*"
  → Re-exports NextAuth's handlers; no handler body to inspect.

"app/api/auth/register/route.ts": rules: ["auth"]
  → Public: registration creates the user, so there's no caller to authenticate.

"app/api/auth/forgot-password/route.ts": rules: ["auth"]
  → Public: must work for a signed-out visitor who forgot their password.

"app/api/auth/reset-password/route.ts": rules: ["auth"]
  → Public: authenticated by the single-use reset token, not a session.

"app/api/templates/[slug]/copy/route.ts": rules: ["auth", "zod"]
  → Public: free templates are copyable without an account; TemplateService
    enforces the premium gate. No request body is read.

"app/api/webhooks/contra/route.ts": rules: ["auth", "zod"]
  → Public: authenticated via the Contra signature header, not a user
    session. Body parsing/validation happens inside CheckoutService.
```

## Reference Implementation

```typescript
import { getCurrentUser } from "@/lib/auth/server-auth";
import { WidgetService } from "@/lib/services/widget.service";
import { ok, fail, handleApiError } from "@/lib/shared/api-response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", "UNAUTHORIZED", 401);

    const data = await WidgetService.listForUser(user.id);
    return ok(data);
  } catch (error) {
    return handleApiError(error, "GET /api/widgets");
  }
}
```

For POST/PATCH/PUT that read a body, validate with zod:

```typescript
import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/server-auth";
import { WidgetService } from "@/lib/services/widget.service";
import { ok, fail, handleApiError } from "@/lib/shared/api-response";

const createSchema = z.object({ name: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", "UNAUTHORIZED", 401);

    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return fail("Invalid request body", "VALIDATION_ERROR", 400);

    const widget = await WidgetService.create(user.id, parsed.data);
    return ok(widget, 201);
  } catch (error) {
    return handleApiError(error, "POST /api/widgets");
  }
}
```

## Error Handling — Typed Errors and Envelopes

- **Success:** `{ success: true, data: <payload> }` via `ok(data, status?)`.
- **Failure:** `{ success: false, error: { message, code } }` via `fail(message, code, status)` or `handleApiError(error, context)`.

Services throw typed errors from `@/lib/shared/errors`: `ApiError` (base), `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `BadGatewayError` (502), `InternalServerError` (500). `handleApiError()` maps `ApiError` subclasses to their status/code without logging (expected operational errors); unknown errors are logged server-side with context and returned as a generic 500 — never leak an unexpected message (stack traces, connection strings) to the client.

## Verification Commands

```bash
npm run lint              # 0 no-restricted-imports violations
npm run check:pattern     # all routes compliant
npm run typecheck         # next typegen + tsc --noEmit, no errors
npm run build              # production build succeeds
```

Run after every task touching `app/api/**`, `lib/**`, or the layer boundaries above.
