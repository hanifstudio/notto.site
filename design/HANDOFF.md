# Orbie — design handoff for coding agents

Everything a coding agent needs to build the Orbie UI. The design lives in a pen.dev
document; this folder is its machine-readable export.

**Read `PRD.md` for behaviour, `DESIGN_SPEC.md` for intent, this file for implementation.**

---

## 1. How to use this folder

Work in this order. Do not skip step 1.

1. **`tokens.css`** — copy into the app and import after `@import "tailwindcss"`.
   Every colour, size, radius and duration below is defined there. Never hardcode a
   hex value, a font size, or a shadow that is not in this file.
2. **`screens/*.png`** — 15 canonical screens. Look at the one closest to what you
   are building; states are specified in §6–§8, not screenshotted.
3. **`html/*.html`** — open the matching file to read exact structure, spacing and
   class names. See the warning in §3 before copying anything out of it.
4. **This document, §5–§8** — component contracts, state matrix and the rules that
   are not negotiable.

```
design/
├── HANDOFF.md          ← you are here
├── tokens.css          ← Tailwind v4 @theme + base layer. Start here.
├── screens/            ← 15 canonical screens (10 desktop, 5 mobile)
└── html/               ← 11 Tailwind HTML reference renders, every state
```

## 2. Stack and routes

Next.js (App Router) + Tailwind CSS v4. Dark only — there is no light theme in phase one.

| Route | Reference image | Full states |
|---|---|---|
| `/` | `desktop-directory-default.png` · `mobile-directory-default.png` | `html/desktop-directory.html`, `html/mobile-directory.html` |
| `/` — empty result set | `desktop-directory-no-results.png` | same file (also covers loading + load failure) |
| `/` — premium copy attempt | `desktop-directory-premium-gate-dialog.png` · `mobile-detail-premium-sheet.png` | `html/components.html` |
| `/templates/[slug]` | `desktop-detail-free.png` · `desktop-detail-premium-locked.png` | `html/desktop-template-detail.html`, `html/mobile-template-detail.html` |
| `/login` `/register` `/forgot-password` `/reset-password` | `desktop-auth-login.png` · `mobile-auth-login.png` | `html/desktop-auth.html`, `html/mobile-auth.html` |
| `/account` | `desktop-account-all-access.png` · `mobile-account-free.png` | `html/desktop-account-checkout.html` |
| `/checkout/success` | `desktop-checkout-verified.png` · `desktop-checkout-verifying.png` · `mobile-checkout-verified.png` | same file |
| `/checkout/cancelled` | — | same file |
| `/terms` `/privacy` `/refunds` | `desktop-legal.png` (one template, three routes) | `html/desktop-legal.html`, `html/mobile-legal.html` |

**Only canonical screens are exported as images.** Every state that is not pictured —
loading, active filters, all three copy states, auth errors, the reset-email and
reset-success screens, free and revoked account, checkout cancelled and verification
failure, and all mobile variants — is fully designed. Read it in the matching `html/`
file, or as an exact specification in §5–§8 below. The `.pen` document holds all 59
screen frames if you need to look at one.

There is **no** landing page and **no** pricing page. `/` is the directory.

## 3. About the HTML exports — read before copying

The files in `html/` are **reference renders, not production code.**

- They are a flattened dump of the canvas: absolutely-positioned and flex divs with
  literal pixel values, plus `data-layer-name` attributes naming every node.
- Each template thumbnail is drawn as ~40 nested divs (they are miniature web pages
  built from shapes, not images). That is why `desktop-directory.html` is 577 KB.
  **In production these are real screenshot images** — see §7.
- They load Tailwind from CDN and Google Fonts directly.

Use them to answer "what is the exact padding / gap / border / class here", then write
idiomatic React components against `tokens.css`. Do not paste them into the app.

## 4. Layout rules

| Target | Width | Grid | Gutter |
|---|---|---|---|
| Wide desktop | 1440 | 4 columns | 32px |
| Laptop | 1024 | 3 columns | 32px |
| Tablet | 768 | 2 columns | 16px |
| Mobile | 390 | 1 column | 16px |

- Card grid gap: 16px. Card thumbnail aspect: **16:10**, consistent everywhere.
- Mobile order is fixed and must not change: header → intro + `$12` CTA → search →
  access filter → category chips → results. Filters are **never** put in a drawer.
- Category chips scroll horizontally on narrow screens with a 48px gradient fade at the
  trailing edge (`mobile-directory-default.png`). This is the only horizontal scroll.
- Touch targets: 44px minimum on mobile. Buttons are 40px desktop / 48–50px mobile.

## 5. Component contracts

Each maps to a named component in the .pen file and is rendered in `html/components.html`.

| Component | Props | States |
|---|---|---|
| `Wordmark` | `size?: 'sm' \| 'lg'`, `markOnly?` | — |
| `Header` | `variant: 'desktop' \| 'mobile'`, `signedIn`, `back?: {label, href}` | signed out · signed in · detail (back pill shown) |
| `SearchField` | `value`, `onChange`, `onClear` | default · focus · filled (clear button appears) · disabled |
| `Chip` | `label`, `selected`, `disabled` | default · hover · **selected (check glyph + 500 weight + strong border)** · focus · disabled |
| `AccessFilter` | `value: 'all' \| 'free' \| 'premium'` | active segment gets check + cyan tint + cyan border |
| `Badge` | `tier: 'free' \| 'premium'`, `entitled?` | Free (hollow ring) · Premium (filled gold dot) · Premium Unlocked (green check, "Included in your access") |
| `Button` | `variant: 'primary' \| 'secondary' \| 'subtle' \| 'destructive' \| 'icon'`, `icon?`, `loading`, `disabled`, `fullWidth` | default · hover · focus · disabled · loading |
| `TemplateCard` | `slug`, `title`, `category`, `tier`, `thumbnail`, `entitled`, `copyState` | see §6 |
| `RelatedCard` | `slug`, `title`, `category`, `tier` | default · hover |
| `FormField` | `label`, `value`, `type`, `help`, `error`, `disabled` | default · focus · filled (reveal control for passwords) · error · disabled |
| `Toast` | `tone: 'success' \| 'error' \| 'processing'`, `title`, `body`, `action?` | error variant never auto-dismisses |
| `EmptyState` | `icon`, `title`, `body`, `action` | no-results · load-failure |
| `SkeletonCard` | — | mirrors `TemplateCard` dimensions exactly so nothing shifts on load |
| `AccessPanel` | `status: 'free' \| 'active' \| 'revoked'`, `email`, `purchasedAt?`, `provider?`, `receiptUrl?` | three states, all designed |
| `AllAccessOffer` | `state: 'loggedOut' \| 'loggedIn' \| 'starting' \| 'failed'` | renders as `Dialog` ≥768px, `BottomSheet` below |
| `Footer` | `variant: 'desktop' \| 'mobile'` | — |

## 6. Copy — the state machine

Copy is the product's primary verb. It has one state machine, used identically on the
card and on the detail page.

```
idle ──click──▶ copying ──▶ copied  (2.5s, then back to idle)
                    └─────▶ error   (stays until dismissed or retried)

premium + !entitled ──click──▶ open AllAccessOffer (never writes to clipboard)
```

| State | Button fill | Border | Icon | Label |
|---|---|---|---|---|
| idle (free / entitled) | `--color-inset` | `--color-border` | `copy` | `Copy HTML` |
| idle (premium, locked) | `--color-inset` | `--color-border` | `lock` | `Copy HTML` (card) / `Unlock to copy — $12` (detail) |
| hover | `--color-accent-tint` | `--color-accent-border` | — | accent-coloured |
| copying | `#FFFFFF0A` | `--color-border-subtle` | `loader-circle` (spin) | `Copying…` |
| copied | `--color-success-tint` | `#35C98A59` | `check` | `HTML copied` |
| error | `--color-danger-tint` | `#E8565C59` | `circle-alert` | `Couldn't copy — retry` |

Rules:
- Feedback happens **in the button that was pressed**. The toast is secondary.
- Announce the result through `aria-live="polite"` (errors `assertive`).
- The card itself is the link to `/templates/[slug]`; the copy button is a separate
  control with its own focus ring. Do not nest a button inside an anchor — use a
  stretched-link pattern or sibling elements.

## 7. Thumbnails

The design uses ten hand-built miniature pages so the shell could be tested against
clashing art directions. **In production these become static images** — one screenshot
per template, 16:10, served from your CDN or `/public`.

- Consistent aspect ratio everywhere. `object-fit: cover`.
- `alt` text = the template title plus its category, e.g. `"Northline Studio — Agency & Studio template preview"`.
- Never overlay a large lock or blur on a premium thumbnail. The badge does that job.
- `desktop-directory-default.png` shows what a realistic spread looks like; use it to
  sanity check that the shell still reads well against light, dark, warm and loud
  thumbnails sitting next to each other.

## 8. Non-negotiable rules

**Honesty**
- The offer is always `$12 USD`, `one time`, and explicitly `not a subscription`.
- Never claim access after a checkout redirect. Access is granted only after
  server-side verification — there is a designed "Confirming your payment" state
  (`desktop-checkout-verifying.png`) for the gap, and a failure state with a support reference.
- No likes, views, ratings, trending labels, customer logos, countdowns, fake scarcity,
  or preselected marketing consent. None of these exist in the design.

**Accessibility (WCAG 2.2 AA)**
- Contrast is already solved by the tokens. `--color-fg-subtle` (4.8:1) is the floor —
  do not introduce a dimmer grey.
- Free vs Premium is never colour alone: label + marker shape. Selected chips and
  filter segments are never colour alone: check glyph + weight + border.
- One focus treatment everywhere (in `tokens.css`): 2px `--color-focus`, 3px offset.
- Form labels are always visible. Placeholders are not labels.
- Account-recovery copy must never reveal whether an email is registered — see
  `html/desktop-auth.html` (frame `Auth · sent`) for the exact wording.
- Dialogs/sheets: labelled title, trapped focus, Escape closes, close control present.
- Body text must survive 200% zoom and the 390px column.

**Do not build** (excluded from phase one)
- Marketing landing page · pricing page · live HTML preview · code/source viewer ·
  downloads or ZIPs · likes, favourites, collections, comments, view counts ·
  creator profiles or uploads · teams · admin dashboard · light mode.

## 9. Known gaps

- 1024px and 768px frames are specified in §4 but not drawn; they are the 1440 layout
  at 3 and 2 columns with the mobile gutter below 768. No new components are needed.
- Legal copy is placeholder structure only — the real Terms/Privacy/Refunds text is
  written at implementation. The template covers headings, lists, tables, contents
  navigation and reading width.
- Template names, descriptions and tags in the mockups are design placeholders, not an
  approved launch catalogue. Components are built to take shorter and longer names.
