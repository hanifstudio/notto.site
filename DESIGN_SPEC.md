# Notto — Design Specification

**Status:** Ready for design exploration  
**Version:** 1.0  
**Product requirements:** [`PRD.md`](./PRD.md)  
**Primary design tool:** [pen.dev](https://pen.dev)

## 1. Purpose

Create an implementation-ready responsive product design for Notto in a single editable `.pen` file. The PRD defines product behavior and technical constraints; this document defines the visual direction, required frames, states, and pen.dev deliverables.

Notto is a curated directory of complete HTML pages for people who build with AI coding tools. The product opens directly to the directory. It is not a conventional SaaS marketing site.

## 2. Design objective

The interface should make a visitor feel that Notto has strong visual taste while remaining quiet enough for the template thumbnails to be the main attraction.

The experience should feel:

- Curated, opinionated, and visually literate.
- Dark, immersive, and premium without looking theatrical.
- Fast and direct rather than feature-heavy.
- Technical enough for developers, but not like an admin dashboard.
- Distinctive without becoming another neon-heavy “AI product” interface.

A user should understand within a few seconds that they can browse complete pages, copy free HTML immediately, or pay $12 once for lifetime All Access.

## 3. Visual reference

The owner likes several UI treatments in this local HTML page:

`/Users/riaenriala/Documents/nightshift/aura/pro-templates/templates/ai-developer.html`

Use this file as **visual inspiration only**. If possible, import or inspect it in pen.dev to understand the visual details. Do not reuse its brand, page structure, copy, source code, tracking scripts, external assets, or referral logic.

### What is useful from the reference

- Near-black neutral canvas with layered charcoal surfaces.
- Fine low-contrast borders that define surfaces without heavy cards.
- Restrained cyan-to-blue accents against an otherwise neutral palette.
- Soft depth created through subtle gradients, inner highlights, and controlled shadows.
- Compact translucent or glass-like controls where readability remains strong.
- Bricolage Grotesque headings and Inter body text, light display weights, and tight headline tracking.
- Rounded pills for compact navigation and actions.
- Small, precise metadata labels and status indicators.
- Refined hover/focus feedback and slight elevation rather than dramatic movement.
- Occasional subtle grid, grain, or glow details that add atmosphere without reducing clarity.

### What not to carry over

- Do not reproduce the reference’s hero, dashboard mockup, feature sections, testimonials, pricing layout, or marketing-page structure.
- Do not let cyan/blue gradients dominate the product or make every element glow.
- Do not use a moving 3D background behind the template catalog.
- Do not overuse glassmorphism, blur, oversized rounding, or nested cards.
- Do not make Notto resemble a generic AI SaaS landing page.
- Do not allow decorative effects to compete with template thumbnails.

The reference informs the **finish and component treatment**, not Notto’s information architecture.

## 4. Product principles translated into design

1. **Directory first:** Show the catalog immediately. No full-screen hero, testimonial section, or feature tour.
2. **Thumbnails lead:** The shell is restrained; template imagery supplies most of the visual variety.
3. **Copy is primary:** “Copy HTML” must remain obvious on cards and detail pages.
4. **Plus is clear, not obstructive:** Free and Plus are easy to distinguish without covering thumbnails with large lock overlays.
5. **No fabricated social proof:** Do not show likes, views, ratings, fake trending labels, customer logos, or popularity rankings.
6. **Low friction:** Browsing and copying free templates must never be hidden behind authentication.
7. **Honest access:** Describe the offer as `$12 one time` and `Lifetime All Access`; never imply a subscription.

## 5. Visual system direction

These are starting constraints, not a request to blindly copy Tailwind defaults. Refine them into coherent pen.dev variables.

### Color

Use a dark-only interface for phase one.

- App background: near-black neutral, approximately `#08090A` to `#0B0C0E`.
- Raised surface: approximately `#111315`.
- Hover/selected surface: approximately `#181B1F`.
- Primary text: warm or neutral off-white, not pure white everywhere.
- Secondary text: readable cool gray that meets WCAG AA.
- Borders: white at roughly 8–14% opacity, adjusted for accessibility.
- Accent: restrained cyan/blue used for primary actions, selected states, focus rings, and copy confirmation.
- Success: distinct green, used primarily for successful copy/payment states.
- Warning/error: accessible amber/red, used sparingly.

Prefer large neutral areas with small points of color. Avoid a uniformly blue interface.

### Typography

- Use **Bricolage Grotesque** for headings and **Inter** for body/UI text as the implementation typefaces across the product.
- Use tabular numerals and subtle tracking for technical metadata; do not introduce a mono companion.
- Page and dialog headings may use lighter weights and tight tracking.
- Product controls and body text should prioritize legibility over fashion.
- Minimum general UI text size: 14 px. Reserve 12 px for secondary metadata only.

### Spacing and shape

- Use a consistent 4 px base spacing scale.
- Keep the catalog dense but not cramped.
- Prefer 10–14 px corner radii for controls and cards; use full pills for chips and compact actions.
- Avoid applying large 24–32 px radii to every container.
- Desktop content may use 24–32 px outer gutters; mobile should use approximately 16 px.

### Effects and motion

- Use subtle border highlights, restrained shadows, and very soft local glows.
- If grain or grid texture is used, keep it nearly imperceptible and outside thumbnail content.
- Hover transitions should generally be 150–250 ms.
- Cards may lift 1–2 px or strengthen their border on hover.
- Respect reduced-motion preferences.
- Do not make essential information dependent on hover or animation.

### Imagery

- Use realistic webpage-thumbnail placeholders with visibly different art directions, industries, and light/dark compositions.
- Keep thumbnail aspect ratios consistent across the directory.
- Do not fill the mockups with generic gradient blobs or identical AI-dashboard images.
- The interface must still look deliberate when adjacent thumbnails have conflicting colors.

## 6. Responsive layout

Design these reference widths:

| Target | Frame width | Expected directory grid |
|---|---:|---:|
| Wide desktop | 1440 px | 4 columns |
| Laptop/tablet landscape | 1024 px | 3 columns where space permits |
| Tablet | 768 px | 2 columns |
| Mobile | 390 px | 1 column |

The grid should reduce progressively without horizontal page scrolling. Category chips may scroll horizontally on narrow screens, with a visual cue that more options exist. Touch targets must be at least 44 × 44 px where practical.

On desktop, keep the directory controls visible near the top without consuming a large portion of the viewport. On mobile, preserve this order:

1. Compact header.
2. Search.
3. Access filters.
4. Horizontally scrollable category chips.
5. Results/grid.

Do not hide core filters in a drawer for the 20-template launch catalog unless the final layout clearly requires it.

## 7. Information architecture

Use the routes and behavior defined in `PRD.md`:

- `/` — directory and purchase entry point.
- `/templates/[slug]` — template details.
- `/login`.
- `/register`.
- `/forgot-password`.
- `/reset-password`.
- `/account`.
- `/checkout/success`.
- `/checkout/cancelled`.
- `/terms`, `/privacy`, and `/refunds`.

There is no separate landing page or pricing page in phase one.

## 8. Required screens and frames

Create the frames below in one `.pen` file. Desktop frames should use 1440 px width; mobile frames should use 390 px width unless specified otherwise.

### A. Directory

Create desktop and mobile frames for:

1. Default directory — logged out.
2. Directory with active search, category, and access filters.
3. No-results state with one-click reset.
4. Directory loading/skeleton state.
5. Directory metadata-load failure with retry.
6. Successful free-copy toast or inline confirmation.
7. Clipboard-copy failure with an actionable retry message.

The default directory must include:

- Notto wordmark.
- A concise product explanation, integrated compactly rather than presented as a hero.
- Search control with `Search templates…` placeholder.
- Access filters: `All`, `Free`, and `Plus`.
- Horizontally arranged category chips.
- `Log in` when signed out or `Account` when signed in.
- Primary `Get all access — $12` action for a user without access.
- Responsive thumbnail grid.
- Footer access to Terms, Privacy, Refunds, support, and the shutdown/open-source pledge.

Each template card must include:

- Dominant thumbnail.
- Title.
- Primary category.
- `Free` or `Plus` badge.
- Quick `Copy HTML` action.

The entire card opens details; the copy action must be visually and interactively distinct from the card link.

### B. Plus access dialogs

Create desktop dialog and mobile sheet treatments for:

1. Logged-out user attempting to copy Plus HTML.
2. Logged-in free user viewing the All Access offer.
3. Checkout-starting/loading state.
4. Checkout-start failure.

The offer must clearly communicate:

- `$12 USD`.
- One-time payment, not a subscription.
- Lifetime access to all plus templates under the current product assumption.
- Account required before checkout.

Use direct actions such as `Create account`, `Log in`, and `Continue to Gumroad`. Avoid manipulative urgency, countdowns, fake scarcity, or preselected marketing consent.

### C. Template details

Create desktop and mobile frames for:

1. Free template.
2. Plus template — user lacks access.
3. Plus template — entitled user.
4. Copy in progress.
5. Copy success.
6. Copy failure.

Include:

- Large static thumbnail image.
- Back-to-directory navigation.
- Title and concise description.
- Category and tags.
- Access badge.
- Prominent `Copy HTML` action.
- Instruction: `Paste the HTML into your coding agent and describe what you want to change.`
- Related templates.

Do not include a live preview, source viewer, code excerpt, download action, or embedded template HTML.

### D. Authentication

Create a consistent desktop auth frame and a mobile variant for each distinct layout:

- Log in.
- Register.
- Forgot password.
- Password-reset email sent.
- Reset password.
- Password reset successful.
- Generic form error.

Include visible labels, password visibility affordances where appropriate, inline validation, loading/disabled submit states, and generic account-recovery messaging that does not reveal whether an email exists.

Authentication should feel like part of the same product, not a separate white card pasted onto a dark background.

### E. Account

Create desktop and mobile frames for:

1. Free account.
2. Lifetime All Access account.
3. Revoked/refunded access where a status explanation is required.

Include email, access level, purchase date/provider reference when available, receipt link when available, support contact, and logout. Do not design subscription billing controls.

### F. Checkout return states

Create desktop and mobile frames for:

- Purchase verified and All Access activated.
- Payment received but verification still processing.
- Checkout cancelled.
- Verification failed or delayed, with support guidance.

A return redirect alone is not proof of payment. The UI must support a visible verification state before claiming access is active.

### G. Legal page pattern

Create one responsive legal-document template that can be reused for Terms, Privacy, and Refunds. Prioritize reading width, heading hierarchy, table/list styling, and persistent navigation back to Notto. Full legal copy is not required in the design file.

## 9. Component inventory

Build reusable pen.dev components and variants for:

- Desktop header and mobile header.
- Notto wordmark treatment.
- Search field.
- Category chip: default, hover, focus, selected, disabled.
- Segmented access filter: All, Free, Plus.
- Template card: Free/Plus × default/hover/focus/copying/copied/error.
- Free and Plus badges.
- Primary, secondary, subtle, destructive, and icon buttons.
- Dialog and mobile bottom sheet.
- Form field with default, focus, filled, error, and disabled states.
- Toast/notification: success, error, neutral processing.
- Empty, error, and loading states.
- Account/access status panel.
- Related-template card.
- Footer.

Use component slots or equivalent content overrides so titles, thumbnails, badges, and actions can change without detaching instances.

## 10. Content for mockups

Use concise, realistic product copy. Do not use lorem ipsum.

Suggested compact directory introduction:

> Distinctive, complete HTML pages for your next build. Copy one and make it yours with any coding agent.

Suggested supporting labels:

- `20 curated pages`
- `10 free`
- `Newest first`
- `HTML copied`
- `No templates match these filters.`
- `Clear search and filters`

Suggested placeholder template names:

- Signal Foundry — AI & SaaS — Free
- Northline Studio — Agency & Studio — Plus
- Index/01 — Portfolio — Free
- Still House — Architecture & Interiors — Plus
- Mono Supply — E-commerce — Plus
- Ledger Field — Finance — Free
- Dune House — Hospitality & Travel — Plus
- Soft Practice — Wellness — Free
- Afterdark FM — Entertainment — Plus
- Chromatic Type Lab — Experimental — Free

These names are design placeholders, not an approved launch catalog. Ensure components handle shorter and longer names without breaking.

## 11. Interaction and state rules

- Search and category/access filters may be combined.
- Selected filter state cannot rely on color alone.
- A free copy may complete without login.
- A plus copy checks authentication and entitlement before source is returned.
- Copy feedback must be clear and suitable for announcement by an accessible live region in implementation.
- Keep confirmation near the triggering action where possible; a global toast may provide secondary confirmation.
- Disabled states must remain readable and explain prolonged processing when relevant.
- Dialogs need a clear title, close action, keyboard-safe focus order, and obvious primary/secondary actions.
- Preserve the user’s directory context when navigating to login or purchase and returning.
- Avoid dead-end success pages: provide `Browse plus templates` or `Copy this template` as the next action.

## 12. Accessibility requirements

- Target WCAG 2.2 AA contrast.
- Do not rely on badge color alone to communicate Free versus Plus.
- Show strong, consistent keyboard focus rings.
- Provide visible labels for forms; placeholders are not labels.
- Ensure dialogs and mobile sheets have clear hierarchy and dismissal controls.
- Design meaningful thumbnail alt-text behavior for implementation.
- Keep body text readable at 200% zoom and in narrow layouts.
- Avoid tiny low-contrast metadata, especially on translucent surfaces.
- Include reduced-motion behavior in interaction annotations.

## 13. Explicit exclusions

Do not design:

- A marketing landing page.
- A dedicated pricing page.
- Live HTML previews.
- A browser code editor or source viewer.
- Downloads or ZIP bundles.
- Likes, favorites, ratings, comments, collections, view counts, or trending lists.
- Creator profiles or user uploads.
- Team or organization management.
- A graphical admin dashboard.
- Light mode for phase one.

## 14. pen.dev file requirements

Deliver one organized `notto.pen` file with:

1. A cover/read-me area describing the concept and frame map.
2. A `Foundations` area containing color, typography, spacing, radius, shadow, and motion variables.
3. A `Components` area containing named reusable components and variants.
4. A `Desktop` area containing all required desktop frames.
5. A `Mobile` area containing all required mobile frames.
6. A `Flows & Notes` area showing browse-to-copy, plus purchase, and account-recovery flows.

Use clear layer and component names. Prefer flex layout and reusable variables over fixed-position visual hacks. Keep the design practical to implement in Next.js and Tailwind CSS.

The final design must remain editable in pen.dev and should not be flattened into screenshots. Where responsive behavior cannot be represented directly, annotate the intended constraints.

## 15. Recommended design sequence for the agent

1. Read `PRD.md` and this file completely.
2. Inspect the visual reference HTML, treating it only as inspiration.
3. Establish two or three restrained visual explorations for the directory shell—not three entirely different products.
4. Select the strongest direction based on thumbnail prominence, clarity, and distinctiveness.
5. Create foundations and core components.
6. Complete the default desktop and mobile directory first.
7. Expand the chosen system across details, purchase, auth, account, checkout, and legal states.
8. Audit consistency, contrast, component reuse, overflow, long text, and mobile behavior.
9. Produce the organized `notto.pen` deliverable.

## 16. Acceptance criteria

The design is ready for implementation when:

- The directory is unmistakably the homepage and appears immediately.
- Templates remain the strongest visual elements.
- Free and Plus access are clear on every relevant surface.
- Free copy, plus gating, purchase, authentication, recovery, and account flows all have designed states.
- Desktop and mobile layouts are complete and coherent.
- The design draws useful finish from the reference without copying its page structure or becoming generic AI SaaS UI.
- Components and variables are reusable and named clearly in the `.pen` file.
- No excluded phase-one feature appears in the final frames.
- Core screens meet the accessibility requirements above.
- The result is realistic to implement with the architecture and constraints in `PRD.md`.
