# Notto — Product Requirements Document

**Status:** Draft for approval  
**Version:** 1.0  
**Date:** 2026-09-12  
**Owner:** Notto  
**Product type:** Curated HTML template directory

## 1. Executive Summary

### 1.1 Product vision

Notto is a curated directory of distinctive, complete HTML pages for people building products with AI coding tools. Users can discover a design, copy the entire HTML file in one action, and paste it into Claude Code, Codex, Cursor, or another coding agent or development harness.

Notto exists to counter “AI slop”: the increasingly generic, overly tidy, and repetitive visual style produced by default AI-generated interfaces. It prioritizes opinionated designs that help builders start from a stronger visual direction without locking them into a proprietary editor, framework, or platform.

### 1.2 Core problem

AI-assisted builders can generate functional websites quickly, but the resulting designs frequently look interchangeable. Existing inspiration galleries often provide screenshots without implementation, while component directories commonly provide isolated sections rather than complete pages. Recreating a distinctive screenshot still requires substantial prompting and iteration.

Notto closes the gap between inspiration and implementation by providing complete, copyable HTML pages.

### 1.3 Value proposition

> Distinctive, complete HTML pages you can copy directly into your favorite coding agent—without another generic AI design.

Notto differentiates itself through:

- Complete HTML pages rather than isolated components.
- Immediate source-code access rather than a proprietary visual builder.
- Compatibility with any coding agent or development stack.
- Deliberate curation around distinctive visual direction.
- A focused directory without likes, fake trending scores, social feeds, or other engagement clutter.
- Simple pricing: one payment for permanent access.

### 1.4 Target users

**Primary users**

- AI-assisted developers using Claude Code, Codex, Cursor, and similar tools.
- Indie hackers and founders building product websites.
- Developers who need a visually differentiated starting point.

**Secondary users**

- Designers who can work with HTML.
- Agencies and freelancers producing websites for clients.
- Non-specialist product builders comfortable giving code to an AI agent.

### 1.5 Business model

- **Free tier:** Ten curated templates available to copy without an account.
- **All Access:** One-time payment of **$12 USD**.
- All Access unlocks all plus templates published at launch and, unless revised before launch, future templates added to Notto.
- No subscription, trial, usage credits, or per-template purchase in phase one.
- Payments are processed through a hosted Gumroad product checkout.

### 1.6 Phase-one scope

Phase one launches with **20 templates**:

- 10 free templates.
- 10 plus templates.
- A diverse mix of visual styles and use cases.
- Every template sanitized and manually approved before publication.

The product opens directly to the directory. There is no separate marketing landing page.

### 1.7 Goals

- Help a visitor find a distinctive page quickly.
- Make copying a free template nearly frictionless.
- Demonstrate enough plus value to support a $12 purchase.
- Deliver an end-to-end flow from discovery through payment and plus copying.
- Establish a safe, repeatable process for publishing the remaining 194 templates in phase two.

### 1.8 Provisional 90-day success metrics

| Metric | Initial target |
|---|---:|
| Unique directory visitors | 5,000 |
| Successful template copies | 1,000 |
| Paying customers | 100 |
| Visitor-to-paid conversion | 2% or greater |
| Gross revenue | $1,200 or greater |
| Refund rate | Below 5% |
| Published-template critical breakage | 0 |

These targets are initial planning benchmarks. They should be reviewed after 30 days of real traffic.

### 1.9 Product principles

1. **Directory first:** The product itself is the homepage.
2. **Source over lock-in:** Users receive understandable, editable HTML.
3. **Distinctive over generic:** Curation is the product advantage.
4. **Fast over feature-heavy:** Discovery and copying should take seconds.
5. **Trust over inflated engagement:** Do not display fabricated popularity signals.
6. **Quality over catalog size:** Only reviewed templates are published.

## 2. User Experience & Functionality

### 2.1 Information architecture

| Route | Purpose |
|---|---|
| `/` | Main template directory, product explanation, filters, and purchase entry point |
| `/templates/[slug]` | Template details and copy action |
| `/login` | Existing-user login |
| `/register` | Account creation |
| `/forgot-password` | Password-reset request |
| `/reset-password` | Password reset using a short-lived token |
| `/account` | Access status, purchase information, and logout |
| `/checkout/success` | Return state after successful Gumroad checkout |
| `/checkout/cancelled` | Return state after an abandoned or cancelled checkout, if Gumroad supports it |
| `/terms` | Terms of service and template license |
| `/privacy` | Privacy policy |
| `/refunds` | Refund policy |

Pricing does not require a dedicated page in phase one. It appears in the directory header and in the plus access dialog.

### 2.2 Directory experience

The directory should follow the supplied reference structurally without copying its identity:

- Dark, immersive interface.
- Compact header with an Notto wordmark.
- Horizontally scrollable category chips.
- Dense responsive thumbnail grid.
- Large imagery with minimal card metadata.
- Four columns on wide desktop screens, reducing responsively on smaller screens.
- The catalog appears immediately, without a traditional hero or marketing section.

The header includes:

- Notto wordmark or temporary text logo.
- Search control.
- “Free” and “All templates” access filters.
- Login or Account action.
- Primary “Get all access — $12” action for users without plus access.

Each template card includes:

- Thumbnail.
- Template title.
- Primary category.
- Free or Plus badge.
- Quick-copy action.

Card behavior:

- Selecting the card opens the template details page.
- Selecting copy on a free card copies the complete HTML immediately.
- Selecting copy on a plus card checks authentication and entitlement.
- Logged-out users are asked to create an account or log in before purchasing.
- Logged-in users without access see the $12 All Access offer.
- Entitled users receive the complete plus HTML.

### 2.3 Discovery and filtering

Phase one includes:

- Case-insensitive text search across title, description, category, and tags.
- Category chips derived from the launch catalog.
- Access filters: All, Free, and Plus.
- Newest-first sorting.
- Clear empty states with a one-click reset.
- URL query parameters for active search and filters where practical, allowing filtered views to be shared.

Recommended initial taxonomy:

- AI & SaaS
- Agency & Studio
- Portfolio
- Architecture & Interiors
- E-commerce
- Finance
- Hospitality & Travel
- Wellness
- Entertainment
- Experimental

A template has one primary category and may have multiple tags. Categories should be assigned during curation rather than inferred at request time.

Phase one excludes trending, popularity, view counts, likes, favorites, and collections because Notto has no reliable behavioral data at launch.

### 2.4 Template details

The details page includes:

- Large thumbnail image only.
- Template title.
- Concise description.
- Category and tags.
- Free or Plus access label.
- “Copy HTML” call to action.
- Short instruction: paste the copied HTML into a coding agent and describe the desired changes.
- Related templates selected by category or tags.

The details page must not:

- Render or execute the template HTML.
- Expose a live preview URL.
- Embed the plus source in page markup, React payloads, static assets, or client-side bundles.
- Display a full source-code viewer.

### 2.5 Copy interaction

Copy is Notto’s primary activation event.

Required behavior:

1. User selects “Copy HTML.”
2. The application verifies access on the server.
3. The complete sanitized HTML is returned only when access is permitted.
4. The browser writes the content to the clipboard.
5. The interface confirms success with a clear “HTML copied” state.
6. If clipboard access fails, the interface explains how to retry; phase one does not provide a file download.
7. A successful copy event is recorded without storing the copied HTML in analytics.

For free templates, the endpoint permits anonymous access. For plus templates, the endpoint requires an authenticated session with an active lifetime entitlement.

The interface should never claim that source code can be made impossible to redistribute after an entitled user receives it. Notto provides access control, not DRM.

### 2.6 Authentication

Phase one uses Notto-owned email-and-password authentication backed by Neon.

Required capabilities:

- Registration with normalized, unique email address.
- Secure password hashing using an audited implementation of Argon2id or an equivalent modern password-hashing algorithm.
- Login and logout.
- Secure server-side sessions.
- Password reset through a short-lived, single-use email token.
- Generic authentication error messages that do not reveal whether an email exists.
- Rate limits for registration, login, and password-reset requests.
- Session invalidation following a password reset.

OAuth, social login, passkeys, teams, and organization accounts are excluded from phase one.

Free templates do not require an account. An account is required before beginning plus checkout so a purchase can be attached to a stable Notto user.

### 2.7 Purchase and entitlement flow

The intended flow is:

1. A user attempts to copy a plus template or selects “Get all access — $12.”
2. If logged out, the user registers or logs in.
3. Notto starts or links to a Gumroad-hosted one-time product checkout.
4. The user completes the $12 purchase on Gumroad.
5. Notto verifies the completed purchase through Gumroad's `sale`/`refund` resource-subscription callbacks, cross-checked against `GET /v2/sales/:id` (Gumroad's callbacks carry no signature, so the API re-fetch is the trust anchor, not the callback body alone).
6. Notto records the purchase idempotently.
7. A permanent All Access entitlement is granted to the user.
8. The user returns to Notto and can copy any plus template.

The browser redirect alone must not be treated as proof of payment. Automated plus provisioning requires verifiable server-to-server purchase data or a provider-issued signed token.

Contra was evaluated first and ruled out (see § "Contra integration capability" below): it exposes no public API, no webhooks, and no export, so automated verification isn't possible there at all. Gumroad was selected instead — it has real `GET /v2/sales` and `resource_subscriptions` webhooks for both sale and refund events, with lighter seller onboarding than Stripe/Lemon Squeezy/Polar.sh (which all require Stripe-equivalent business verification).

### 2.8 Account experience

The account page includes:

- Account email.
- Access level: Free or Lifetime All Access.
- Purchase date and provider reference when available.
- Link to the Gumroad receipt or order when available.
- Support contact.
- Logout action.

There is no billing-management interface because the phase-one product is a one-time purchase.

### 2.9 Refund policy

Proposed policy:

- A customer may request a refund within seven days of purchase only if the account has not successfully copied a plus template.
- Once plus source code has been accessed, the purchase is non-refundable except where applicable law requires otherwise.
- An approved refund revokes the associated plus entitlement.
- Refund decisions and entitlement changes must be auditable.

Final wording requires legal review and must be compatible with Gumroad’s product and refund policies.

### 2.10 Shutdown and open-source pledge

Notto intends to publish both the application source code and the full template collection if the service permanently shuts down.

The public promise should be concise and should not imply that secrets, customer records, payment data, private keys, or third-party-licensed assets will be released. Before publication, Notto must select licenses that cover the application and templates and confirm that included third-party assets can legally be redistributed under those licenses.

### 2.11 User stories and acceptance criteria

#### Browse templates

**As a visitor, I want to browse distinctive templates immediately so that I can find a useful visual direction without reading a landing page.**

Acceptance criteria:

- The directory is the root page.
- Published templates appear in a responsive grid.
- Cards clearly distinguish Free from Plus.
- No login wall appears while browsing.

#### Search and filter

**As a visitor, I want to narrow the catalog so that I can find a relevant design quickly.**

Acceptance criteria:

- Search matches title, description, category, and tags.
- Category and access filters can be combined.
- The empty state explains that no templates matched and offers reset.

#### Copy a free template

**As a visitor, I want to copy a free template without registering so that I can evaluate Notto immediately.**

Acceptance criteria:

- Free copy does not require authentication.
- The complete sanitized HTML is placed on the clipboard.
- A success or actionable failure message appears.
- The event is recorded for product analytics.

#### Purchase All Access

**As a registered user, I want to pay once so that I can access every plus template permanently.**

Acceptance criteria:

- The displayed price is $12 USD one time.
- Checkout clearly states that this is not a subscription.
- Access is granted only after verified payment.
- Repeated payment notifications do not create duplicate purchases or entitlements.

#### Copy a plus template

**As an entitled customer, I want to copy plus HTML as easily as free HTML.**

Acceptance criteria:

- Plus source is returned only after a server-side session and entitlement check.
- Copy completes without revealing unrelated templates.
- Successful plus access is recorded for refund-policy enforcement and product analytics.

#### Recover an account

**As a user who forgot a password, I want to reset it securely so that I can recover purchased access.**

Acceptance criteria:

- Reset tokens expire and can be used only once.
- Existing sessions are invalidated after reset.
- Purchased entitlement remains attached to the account.

### 2.12 Explicit non-goals

Phase one does not include:

- A separate landing or marketing page.
- Live HTML previews.
- A browser code editor or full source viewer.
- Downloadable files or ZIP archives.
- Individual page sections or component-level copying.
- AI template customization inside Notto.
- Framework-specific React, Vue, or Svelte versions.
- Favorites, likes, view counts, trending, or collections.
- User comments, ratings, uploads, or creator profiles.
- Per-template purchases.
- Subscriptions or multiple paid tiers.
- Team accounts.
- A graphical administration dashboard.
- Native mobile applications.

## 3. Technical Specifications

### 3.1 Proposed architecture

- **Application:** Next.js App Router with TypeScript.
- **UI:** Tailwind CSS and accessible custom components.
- **Hosting:** Vercel or an equivalent Node-compatible platform.
- **Database:** Neon Postgres.
- **Authentication:** Notto-owned credential and session system using audited cryptographic libraries.
- **Payments:** Gumroad hosted one-time product checkout, behind a payment-provider adapter.
- **Template source:** Private object storage or another server-only content store; never a public application asset.
- **Thumbnails:** Public CDN/object storage with responsive image sizes.
- **Email:** Transactional provider for password-reset messages; provider remains to be selected.
- **Testing:** Unit/integration tests plus Playwright for core browser journeys and template visual checks.

### 3.2 Data model

#### `users`

- `id` — UUID primary key.
- `email` — normalized unique email.
- `password_hash` — modern password hash.
- `email_verified_at` — nullable timestamp if verification is enabled.
- `created_at`, `updated_at`.

#### `sessions`

- `id` — UUID primary key.
- `user_id` — foreign key.
- `token_hash` — hash of opaque session token; raw token is never stored.
- `expires_at`, `last_seen_at`, `created_at`.
- Optional device and revocation metadata.

#### `password_reset_tokens`

- `id` — UUID primary key.
- `user_id` — foreign key.
- `token_hash`.
- `expires_at`, `used_at`, `created_at`.

#### `templates`

- `id` — UUID primary key.
- `slug` — unique stable URL identifier.
- `title`.
- `description`.
- `primary_category`.
- `tags` — structured array or related table.
- `thumbnail_url`.
- `access_level` — `free` or `plus`.
- `status` — `draft`, `sanitized`, `reviewed`, `published`, or `archived`.
- `source_storage_key` — server-only object identifier.
- `source_checksum` — used for integrity and version verification.
- `published_at`, `sanitized_at`, `reviewed_at`, `created_at`, `updated_at`.

#### `purchases`

- `id` — UUID primary key.
- `user_id` — foreign key.
- `provider` — initially `gumroad`.
- `external_purchase_id` — unique when provided.
- `purchaser_email`.
- `amount_minor` — expected value `1200`.
- `currency` — expected value `USD`.
- `status` — `pending`, `paid`, `refunded`, `disputed`, or `invalid`.
- `purchased_at`, `refunded_at`, `created_at`, `updated_at`.

#### `entitlements`

- `id` — UUID primary key.
- `user_id` — foreign key.
- `type` — `all_access_lifetime`.
- `status` — `active` or `revoked`.
- `source_purchase_id` — foreign key.
- `granted_at`, `revoked_at`.

The entitlement is separate from the payment record so access can be revoked, restored, or migrated without rewriting purchase history.

#### `template_copy_events`

- `id` — UUID primary key.
- `template_id` — foreign key.
- `user_id` — nullable for anonymous free copies.
- `anonymous_session_id` — privacy-preserving identifier where permitted.
- `result` — `success`, `denied`, or `failed`.
- `source` — `directory` or `details`.
- `created_at`.

#### `payment_events`

- `id` — UUID primary key.
- `provider`.
- `external_event_id` or deterministic event hash.
- `event_type`.
- `processing_status`.
- `received_at`, `processed_at`.
- Minimal sanitized metadata needed for audit and retry.

A unique provider/event constraint prevents duplicate processing.

### 3.3 Server interfaces

Indicative interfaces:

- `GET /api/templates` — published metadata only; never includes HTML.
- `GET /api/templates/[slug]` — metadata and related templates.
- `POST /api/templates/[slug]/copy` — access check, source retrieval, and copy-event creation.
- `POST /api/auth/register`.
- `POST /api/auth/login`.
- `POST /api/auth/logout`.
- `POST /api/auth/forgot-password`.
- `POST /api/auth/reset-password`.
- `POST /api/checkout/session` — creates or returns the appropriate Gumroad checkout destination when supported.
- `POST /api/webhooks/gumroad` — verified provider callback/webhook when supported.
- `GET /api/account` — account and entitlement status.

Sensitive operations must validate input, enforce rate limits, use same-origin protections, and return minimal data.

### 3.4 Plus-source protection

- Plus HTML must not exist under `public/`.
- Plus HTML must not be imported into client components.
- Metadata queries must never select or serialize source content.
- The copy endpoint retrieves one requested object only after authorization.
- Private source objects use unguessable storage keys and server credentials.
- Responses containing HTML use `Cache-Control: private, no-store`.
- Logs and error reporting must not capture returned HTML.
- The endpoint is rate-limited to reduce automated bulk extraction.

These controls prevent accidental public exposure. They cannot prevent an authorized buyer from saving or redistributing code already delivered to their browser; licensing and enforcement address that risk.

### 3.5 Template ingestion and sanitization

The existing source collection contains 214 HTML files and associated metadata. Publication uses a controlled pipeline rather than modifying every file blindly.

#### Workflow

1. Preserve an immutable raw source copy.
2. Select a candidate template.
3. Inventory scripts, stylesheets, fonts, images, forms, iframes, and network destinations.
4. Remove known Aura referral injection, Google Analytics identifiers, and unrelated tracking code.
5. Remove or neutralize forms, links, or scripts that transmit visitor information to third parties unless essential and explicitly approved.
6. Preserve design dependencies such as Tailwind CDN, Iconify, GSAP, and fonts only when required.
7. Move critical images to Notto-controlled storage where licensing permits.
8. Format only when doing so does not change behavior.
9. Validate that the HTML parses and that all expected assets load.
10. Render at desktop and mobile sizes in an isolated browser.
11. Review screenshots and browser-console/network errors.
12. Calculate a checksum and mark the version reviewed.
13. Publish metadata and sanitized source.

#### Safe automated removals

- Known referral-cookie injection blocks.
- Known Aura Google Analytics blocks and identifiers.
- Duplicate metadata or clearly unrelated tracking pixels.
- Comments used solely to delimit removed tracking code.

#### Changes requiring manual review

- Inline scripts controlling animation or interaction.
- Third-party script tags not on the dependency allowlist.
- Forms and API requests.
- Canvas, WebGL, and animation libraries.
- External images or videos whose availability or license is uncertain.
- Any change that alters classes, CSS, or DOM structure.

#### Publication quality gate

A template cannot reach `published` status until:

- Tracking and referral code are removed.
- No suspicious or unintended data transmission is observed.
- Desktop and mobile layouts receive visual approval.
- Required images, fonts, styles, and scripts load successfully.
- No critical console errors occur.
- Complete HTML can be copied and parsed after retrieval.
- Title, description, category, tags, access level, and thumbnail are approved.

### 3.6 Launch catalog selection

The first 20 templates should be selected for breadth rather than filename order. The collection should avoid ten visually similar AI/SaaS pages.

Selection criteria:

- Strong thumbnail and immediately legible concept.
- Distinct visual identity.
- Working external dependencies.
- Responsive behavior or a reasonable path to repair it.
- Variety across light/dark, editorial/technical, and restrained/experimental styles.
- Variety across categories and customer use cases.
- No unresolved asset-licensing concern.

The free group should be genuinely useful and representative of quality. Plus should offer equal or greater quality, not merely additional quantity.

### 3.7 Payment integrity

Before granting access, Notto must verify:

- Provider authenticity.
- Unique external purchase or event identity.
- Successful/paid status.
- Product identity matches Notto All Access.
- Amount is $12.00 unless an approved discount is introduced.
- Currency is USD.
- Purchase maps to the authenticated Notto account through signed metadata, a verified email, or another provider-supported mechanism.

Payment event handling must be idempotent. Gumroad exposes refund and dispute events via `resource_subscriptions`; both revoke access automatically (a dispute is treated the same as a refund conservatively, since the schema has no separate disputed state).

Provider-specific logic must remain behind an adapter so a future migration does not require changes to directory or entitlement code.

### 3.8 Security and privacy requirements

- TLS is required in production.
- Session cookies are `HttpOnly`, `Secure`, and `SameSite=Lax` or stricter.
- Session identifiers are random, opaque, rotated after login, and stored hashed.
- Passwords are never logged or encrypted reversibly.
- Authentication endpoints have IP- and account-aware rate limits.
- State-changing requests use origin/CSRF protection.
- Database queries are parameterized through a safe query layer.
- Authorization is enforced on the server, not inferred from UI state.
- Secrets remain in managed environment variables.
- Error messages do not disclose secrets, source HTML, password hashes, or provider payloads.
- Dependency and secret scanning run in CI.
- Only minimal personal data is collected.
- Legal pages identify retention, deletion, payment-provider, and analytics behavior.

### 3.9 Accessibility requirements

- Core workflows are keyboard accessible.
- Visible focus states are preserved.
- Text and controls meet WCAG 2.2 AA contrast targets.
- Category chips and dialogs expose correct accessible names and states.
- Copy feedback is announced through a non-disruptive live region.
- Thumbnails have meaningful alternative text.
- Reduced-motion preferences are respected in the Notto interface.

### 3.10 Performance requirements

- Directory Largest Contentful Paint target: 2.5 seconds or less at the 75th percentile on typical mobile connections.
- Cumulative Layout Shift target: 0.1 or less.
- Thumbnails are resized, compressed, lazy-loaded below the fold, and served with dimensions.
- Metadata responses may be cached; source responses may not be publicly cached.
- Initial directory JavaScript remains limited; filtering 20 launch records should not require repeated database requests.
- The interface remains usable if analytics or nonessential third-party services fail.

### 3.11 Analytics and observability

Required product events:

- Directory viewed.
- Search performed.
- Category/access filter selected.
- Template details viewed.
- Free copy attempted and completed.
- Plus copy denied for missing login or entitlement.
- Checkout started.
- Purchase verified.
- Plus copy completed.
- Refund requested and approved.

Operational monitoring includes:

- Authentication error rate.
- Copy endpoint errors and latency.
- Payment verification failures.
- Broken thumbnail and dependency reports.
- Unexpected plus-source access denials.

Analytics must not store template source, passwords, reset tokens, session tokens, or full payment payloads.

### 3.12 Launch acceptance criteria

Notto is ready for public phase-one launch when:

- Twenty approved templates are published: ten Free and ten Plus.
- The directory, search, filters, details, and responsive layouts pass browser testing.
- Anonymous free copying works end to end.
- Registration, login, logout, and password reset work end to end.
- A real or provider-sandbox Gumroad purchase can be verified automatically and grants lifetime access.
- An entitled user can copy every plus launch template.
- A non-entitled user cannot retrieve plus HTML through documented or obvious public routes.
- Duplicate payment notifications do not grant duplicate or inconsistent access.
- Refund handling and entitlement revocation are tested to the extent supported by Gumroad.
- Terms, privacy, refund policy, and template license are published.
- Core metrics and error monitoring are active.
- No published template contains known Aura referral or analytics code.
- No critical accessibility, security, or template-breakage issue remains open.

## 4. Risks & Roadmap

### 4.1 Primary risks

#### Contra integration capability — resolved, switched to Gumroad

**Risk (as written pre-spike):** Contra may support hosted product sales without exposing the webhook, API, signed callback, customer metadata, or refund events required for automatic Notto entitlements.

**Outcome of the phase-zero spike:** Confirmed against Contra's own help center — Contra exposes **no public API, no webhooks, no Zapier/Make integration, and no export**; the transaction dashboard is UI-only. Its "Digital Products" and "Payment Links" features land buyers on Contra's own success screen with no configurable redirect and no signed callback, so automated verification isn't possible on Contra at all, not even partially.

Lemon Squeezy and Polar.sh were considered as alternatives but both now require Stripe-equivalent business/KYC verification (Lemon Squeezy: 1–4+ week payout verification since its 2024 Stripe acquisition; Polar.sh: built on Stripe Connect Express, up to 14-day account review) — the exact friction this PRD's audience wants to avoid.

**Decision:** Switched to **Gumroad**. Email-only seller signup (selling starts immediately; identity verification only gates payout), a real `GET /v2/sales/:id` API, and `resource_subscriptions` webhooks for `sale` and `refund` events (form-encoded, unsigned — verified server-to-server against the API rather than via signature). See `docs/architecture.md` § "Checkout flow (Gumroad, $12 one-time)" and `lib/integrations/gumroad.ts`.

**Mitigation carried forward:** Payment logic stays behind the `lib/integrations/*` adapter so a future provider change doesn't touch directory or entitlement code. Do not trust success-page redirects alone — every purchase is confirmed via Gumroad's API before granting access.

#### Plus source redistribution

**Risk:** A legitimate buyer can save and redistribute HTML after copying it.

**Impact:** Revenue leakage and unauthorized sharing.

**Mitigation:** Use clear licensing, server-side access controls, access logs, reasonable rate limits, and customer support. Do not add invasive DRM that harms the promised copy experience.

#### Third-party asset and script reliability

**Risk:** Templates depend on external fonts, CDNs, images, scripts, or assets that can disappear or change.

**Impact:** Copied templates may look broken or introduce privacy/security issues.

**Mitigation:** Maintain an allowlist, migrate critical assets when permitted, record dependencies, and test each version before publication.

#### Licensing ambiguity

**Risk:** Notto may own the HTML while individual images, fonts, libraries, or brand assets have separate terms.

**Impact:** Legal complaints or inability to honor the shutdown open-source pledge.

**Mitigation:** Complete an asset-license review, document exceptions, replace unclear assets, and select explicit application/template licenses.

#### Custom authentication complexity

**Risk:** Building credential authentication introduces account-takeover, session, password-reset, and email-delivery risks.

**Impact:** Loss of paid access, customer trust, or private data.

**Mitigation:** Use audited cryptographic/session libraries, keep the feature set narrow, conduct security testing, and avoid inventing cryptographic primitives.

#### Low perceived plus value at launch

**Risk:** Ten plus templates may feel insufficient even at $12.

**Impact:** Weak conversion.

**Mitigation:** Select plus templates for exceptional variety and quality, clearly include future additions in All Access if approved, and publish phase-two additions consistently.

#### $12 lifetime sustainability

**Risk:** A low one-time price produces no recurring revenue while creating ongoing hosting, support, and content costs.

**Impact:** The business may become expensive to maintain.

**Mitigation:** Monitor acquisition cost, support cost, and conversion. Reserve the ability to raise the price for new buyers while honoring existing lifetime access.

### 4.2 Phase 0 — Feasibility and content preparation

- ~~Confirm Contra's automated purchase-verification options.~~ Done — Contra has none; switched to Gumroad (see § "Contra integration capability").
- Confirm how a Gumroad purchase maps to a Notto user — via the `reference` query param echoed back in `url_params`, not email alone.
- ~~Confirm refund/dispute event availability.~~ Done — Gumroad's `resource_subscriptions` supports both.
- Choose private source and public thumbnail storage.
- Choose transactional email provider.
- Select the 20-template launch catalog.
- Establish sanitization checks and review rubric.
- Finalize commercial template license and shutdown pledge language.

**Exit condition:** No unresolved blocker prevents secure payment-to-entitlement automation.

### 4.3 Phase 1 — Directory MVP

- Build the directory-first interface.
- Add search, category chips, access filters, and newest sorting.
- Add template details and related templates.
- Implement anonymous free copying.
- Implement Neon-backed registration, sessions, and password reset.
- Implement Gumroad one-time checkout and verified lifetime entitlement.
- Implement plus copying and account status.
- Publish 10 free and 10 plus sanitized templates.
- Add legal pages, analytics, monitoring, and production hardening.

**Exit condition:** All launch acceptance criteria pass.

### 4.4 Phase 2 — Catalog expansion

- Sanitize and release the remaining 194 templates in reviewed batches.
- Improve categories and tags based on search behavior.
- Introduce an internal publishing/admin workflow if metadata files become inefficient.
- Add automated dependency checks and periodic broken-asset scans.
- Improve related-template ranking.
- Review pricing after observing conversion and support costs.

### 4.5 Future opportunities, subject to evidence

- Framework-specific template variants.
- Section-level extraction.
- Template downloads or project bundles.
- Favorites or private collections.
- AI-assisted template adaptation.
- Creator submissions and revenue sharing.
- Team licensing.

These features require demonstrated customer demand and are not commitments.

## 5. Open Questions

The following do not block approval of the product concept, but phase-zero items must be resolved before public launch:

1. ~~**Contra verification:**~~ Resolved — Contra provides none of these (no API, no webhook, no export). Switched to Gumroad, which provides `GET /v2/sales/:id` plus `resource_subscriptions` webhooks.
2. **Account mapping:** Resolved — Notto attaches its internal `reference` (a random UUID) to the Gumroad checkout URL as a query param, which Gumroad echoes back in the sale's `url_params`; not reconciled by email alone.
3. **Checkout returns:** Gumroad's default post-purchase experience is its own success screen (product access + email receipt); whether a custom cancel/return URL can be configured for `/checkout/cancelled` is still unconfirmed and not blocking (the happy path doesn't depend on it).
4. ~~**Refund events:**~~ Resolved — yes, via the `refund` (and `dispute`) `resource_subscriptions` webhook.
5. **All Access scope:** Does the $12 purchase contractually include every future Notto template, or only the collection available at purchase? The current PRD assumes future templates are included.
6. **Commercial license:** May customers use templates in unlimited personal and commercial projects, including client work? May they resell an end product but not redistribute the template source as a template?
7. **Open-source licenses:** Which licenses will apply to the application and templates after shutdown, and how will incompatible third-party assets be excluded or replaced?
8. **Shutdown definition:** What objective event triggers the open-source release, and who can perform the release if the founder is unavailable?
9. **Storage provider:** Which private object store will hold HTML and which public CDN will hold thumbnails?
10. **Email provider:** Which service will send password-reset and security messages?
11. **Email verification:** Is email verification required before checkout, or is verified payment identity sufficient?
12. **Analytics provider:** Should Notto use a privacy-focused hosted product or store only first-party events in Neon?
13. **Legal identity:** What business/person name and jurisdiction should appear in Terms and Privacy?
14. **Support address and domain:** Replace `support@notto.site` and development URLs after a domain is acquired; ownership of `notto.site` is not assumed.
15. **Launch catalog:** Final approval is required for the curated 10 Free and 10 Plus templates before sanitization begins.
