---
name: ingest-template
description: Sanitize an Aura template HTML file and add it to Notto's template catalog. Use whenever the user gives one or more file paths from aura/pro-templates/templates (or asks to sanitize/ingest/backfill a template), per PRD.md section 3.5.
---

# Ingest an Aura template into Notto

Input: one or more paths under `/Users/riaenriala/Documents/nightshift/aura/pro-templates/templates/*.html`. If no path was given, ask for one.

Run every step below, in order, without re-asking whether to do them — this is the agreed pipeline (see PRD.md §3.5 for the source spec; the steps below are the trial-scoped version actually in use).

## 1. Strip tracking

Check for both of these independently — a template can have either, both, or neither:

- **GA4 block**, delimited with `<!-- aura-ga4-start -->` ... `<!-- aura-ga4-end -->` (a `<script src="googletagmanager.com/gtag/js?id=...">` plus an inline `gtag()` init). Remove the whole delimited block.
- **PromoteKit referral-cookie injection** — a single `<script>` near the very top of `<head>`, functionally `try{if(window.parent&&window.parent!==window){window.parent.promotekit_referral="...";window.parent.document.cookie="promotekit_referral=...;path=/;domain=.aura.build;max-age=31536000"}}catch(e){}`. Only fires inside Aura's own editor iframe (dead once copied standalone), but it's PRD §3.5's named example of a "known referral-cookie injection block" — always strip it when present. Not every template has this (seen in roughly half of templates so far); grep for `promotekit` to check. **Formatting varies** — some templates minify it onto one line, others pretty-print it multi-line with indentation and spaces around `=` (`luxury-furniture.html`) — match on the substance (the `promotekit_referral`/`window.parent`/`document.cookie` tokens) with whitespace-tolerant regex, not an exact literal string, or a differently-formatted copy will silently slip through.

Grep the rest of the file for other tracking/referral patterns too — don't assume these are the only two forms Aura has ever used.

## 2. Check for real self-promotion, not just a fictional brand name

Some source pages are Aura's own product marketing (not a neutral template) — e.g. a page that pitches "Aura" as the actual AI page-builder product, with a real contact address like `help@aura.page`. Grep body copy for "Aura" used as a marketing subject ("Aura analyzes...", "Aura generates...") vs. a fictional client/company name in a demo (e.g. a demo "VR Game Agency" happening to be named Aura is fine, leave it).

If it's real self-promotion: invent a plausible fictional product name for the page's own theme, swap every visible brand mention (title, header/logo, CTAs, footer copyright, body copy) to it, and replace any real contact email with `hello@example.com`. Don't touch internal `data-*`/`id`/`<meta name="aura-...">` attributes here — that's step 3.

Self-promotion isn't always the whole page — it can be a single leftover mention, e.g. a fake testimonial quote saying "Aura's exclusive framework brings ambitious founders together" (`endurance-race-71.html`). Grep `grep -n 'Aura' file.html` for every literal hit and read each one; when the page already has its own established brand name (nav logo, hero heading), prefer reusing THAT name over inventing a new one — it's usually just a stray leftover, not a real "which name do we pick" decision. Same idea for a bare visible "Aura" used as placeholder logo text (`elysian.html`, footer-corner logo badge) when the rest of the page already says "Elysian" everywhere else — swap the one outlier to match, don't invent something new.

## 3. Remove dead platform code — only what's actually dead

Aura-generated pages often carry:
- `<script id="aura-preview-performance-controller">...</script>` in `<head>` — talks to a parent iframe via `postMessage` that won't exist once copied out of Aura's editor. Self-contained; safe to delete entirely.
- `<meta name="aura-font-heading-class">`, `aura-font-body-class`, `aura-font-heading-label`, `aura-font-body-label`, `disabled-font-classes` — editor-only bookkeeping, not read by anything at render time. Safe to delete.

Also seen: an `<!-- Background (component) added by Aura -->` HTML comment (invisible when rendered, but visible in view-source, which people copying this HTML will do — remove it) and elements with an `aura-` prefixed class/id that are otherwise completely normal, working, third-party embeds (e.g. `class="aura-background-component"` wrapping a real `my.spline.design` or Unicorn Studio (`data-us-project`) embed). For that last kind: grep the file for the class/id name — if nothing else references it (no matching CSS rule, no `getElementById`/`querySelector` call), it's just cosmetic naming from Aura's tooling and safe to rename to something generic (don't delete the element, just the "aura" string in its class/id).

A third case: a self-contained, purely-internal `aura-`-prefixed naming convention that IS load-bearing but ISN'T tied to any external resource — e.g. a scroll-reveal animation system where every animated element carries `class="... aura-reveal"` and a script does `document.querySelectorAll('.aura-reveal')` / `classList.contains('aura-reveal')` (`finex-gaming-98.html`). Unlike the video-controller/testimonial-rotator cases, this is safe to rename — just do it consistently everywhere in the file (every class attribute occurrence AND every script reference to the same string, e.g. `aura-reveal` → `reveal-in`), not a partial rename. Also seen: a whole family of CSS class/animation names prefixed `aura2-`/`aura-` (e.g. `aura2-rise`, `aura2-float`, `aura-clock-face`, `aura-clock-ticks`, `@keyframes aura2FloatSoft`) — this one's lower-value to rename (styled by rules elsewhere in the same file, not visible, more surface area for a typo) so leaving it alone is fine too; renaming isn't wrong, just not necessary.

Before deleting or renaming ANYTHING with "aura" in its name, grep the whole file for other references to the same identifier. Some `data-aura-*`/`id="...-aura"` attributes ARE load-bearing and tied to something you can't safely rename in one file's context (a video hover/loop controller, a testimonial rotator's `getElementById` calls) — leave those completely alone. When in doubt, grep for the exact string outside of the element's own tag/selector to see if something else actually reads it before touching it.

Not every "aura"-named thing is worth touching even when it'd be safe to: `<style id="aura-editor-visibility-style">.invisible { visibility: hidden !important; }</style>` (`lumen-portfolio.html`, `luminal-studio.html`) defines a real, possibly-used-elsewhere `.invisible` utility class — the class itself has nothing to do with Aura, only the `<style>` tag's own `id` does, and that id is never rendered or visible in any way. Leave things like this alone; renaming an already-invisible internal id has no benefit.

Also: a template's design can coincidentally be branded "Aura" as its own fictional product/company name with nothing to do with Aura the page-builder (`luxury-furniture.html` — title, header logo, and hero heading are ALL "Aura", consistently, as a furniture brand; no self-promotional marketing-subject language, no real contact info). That's the same "fictional name happens to match" exception from step 2 — leave it completely alone, don't rename it to avoid confusion.

## 4. Mirror third-party-hosted assets to Cloudflare R2

Any image or video referenced from a Supabase bucket (or other stranger's storage — check the domain) gets mirrored:

- Bucket: `notto` (S3-compatible endpoint + credentials already in `.env.local` as `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET_NAME`/`R2_ENDPOINT`/`R2_PUBLIC_URL`). Public at `https://file.notto.site`.
- R2 key = the original path after `/storage/v1/object/public/` (e.g. `assets/assets/<uuid>_3840w.webp`). This naturally dedupes across templates that share Aura's common asset bucket — check with `aws s3api head-object --bucket notto --endpoint-url "$R2_ENDPOINT" --region auto --key <key>` before downloading/re-uploading; skip on success. (In practice, hits have been rare — most assets are per-template UUIDs — but the check is cheap.)
- Download with `curl`, upload with `aws s3api put-object --bucket notto --endpoint-url "$R2_ENDPOINT" --region auto --key <key> --body <file> --content-type <mime>` (credentials via `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` env vars, sourced from `.env.local`'s `R2_*` vars).
- Get content-type right per extension — `.mp4` needs `video/mp4` explicitly (it doesn't default correctly); fix a wrong one after the fact with `aws s3api copy-object ... --metadata-directive REPLACE --content-type video/mp4`.
- Rewrite every reference to the original URL in the HTML to `https://file.notto.site/<key>`.
- Images already on a stable CDN (e.g. `images.unsplash.com`, `i.pravatar.cc`, `randomuser.me`, `cdn.midjourney.com`, `grainy-gradients.vercel.app`) can stay hotlinked — no need to mirror those.

**Watch for a different problem: hotlinked real third-party brand assets.** Some templates pull a real, unrelated, currently-operating company's actual logo/icon straight from that company's own production CDN (seen: `axiom-digital.html` hotlinking `huly.io/_next/static/media/*.svg` — Huly's real logo and feature icons, used as decorative "app icons" in a fake dashboard mockup and a feature grid). This is a different risk than Aura's own tracking — it's someone else's live brand asset, both a stability risk (their CDN, not ours) and a brand-misuse risk if shipped as part of a resellable template. Grep image `src`/`url()` domains for anything that isn't a known stable public asset CDN (Unsplash, Supabase-then-mirrored, Google Fonts, etc.) and isn't one of Aura's own domains — if it resolves to a real company's own site, don't mirror it (that would make the licensing problem worse, not better) and don't just hotlink it either. Replace it with a generic icon from a library already loaded on the page (Iconify's `solar:` set has shown up often — pick a semantically matching icon, e.g. `solar:refresh-circle-linear` for "sync").

**Also watch for a proprietary Aura script hosted on their own live domain** (not a public CDN) — e.g. `<script src="https://www.aura.build/FxFilter.js"></script>`, seen driving a custom `--fx-filter` CSS custom property (blur/liquid-glass/noise effects) on `axion-agent.html`. This is an ongoing dependency on a competitor's own infrastructure — remove the script tag outright rather than leave it. The custom property that references it becomes inert (no visual effect) once the script is gone; that's an acceptable degradation, not something to try to reimplement. (Also seen on `interstell-logistics.html` and `digital-creative-agency.html` elsewhere in the source pool — check for `aura.build` domain references, not just the literal word "aura", since this one doesn't show up in a same-word grep for tracking.)

## 5. Get thumbnail from seed.json; title from the page's own `<title>` tag

`/Users/riaenriala/Documents/nightshift/aura/pro-templates/seed.json` has `slug`, `title`, `thumbnail_url`, `html_file` for all 218 templates. Its `thumbnail_url` is reliable — look it up by slug and mirror it to R2 same as step 4, key convention `preview-images/<slug>.png`. Its `title` field is NOT what you want for the catalog — it's a generic SEO-boilerplate label (e.g. "Barbershop Landing Page Template"), not the designed brand name. Use the page's own `<title>` tag instead (e.g. `<title>BLADE & CO. | Premium Barbershop</title>` → "Blade & Co. — Premium Barbershop"): clean up casing/separators but keep the actual name/tagline the template was designed with.

## 6. Draft description/category/tags/access

Not in `seed.json` — write these from the page's own content. Valid categories, from `lib/catalog.ts`'s `categoryOptions` (check that file directly if it may have changed): AI & SaaS, Agency & Studio, Portfolio, Architecture & Interiors, E-commerce, Finance, Hospitality & Travel, Wellness, Entertainment, Experimental. Some templates won't map cleanly (e.g. a barbershop has no dedicated category) — closest available wins, no need to flag every imperfect fit. These are curation calls the user may edit later — that's expected, not a sign something went wrong.

## 7. Skip security/accessibility/breakage review

Per explicit user instruction, don't add a11y/security/breakage audit or auto-fix passes right now — the templates already look good and the user is worried an audit pass would break them. (This exemption is for the current trial phase, not a permanent policy — PRD.md's real publish gate at §3.5 still requires it eventually.)

## 8. Ingest into the database as `published`

Add/update an entry in a manifest JSON (array of `{ slug, sourceHtmlPath, title, description, category, tags, access, thumbnail, status }` — `sourceHtmlPath` resolves relative to the manifest file's own directory), then from the orbie repo root:

```
npm run db:ingest -- <path-to-manifest.json>
```

This runs `scripts/ingest-templates.ts`, which reads `sourceHtml` from disk per entry and upserts by slug. Default `status` to `"published"` — don't wait to be asked to flip it live (user's explicit instruction, 2026-09-12: "next time lo langsung flip otomatis aja"). Draft rows are filtered out of `listTemplateSummaries()`/`getTemplateBySlug()` (see `lib/db/templates.ts`) if a `draft` is ever needed for a specific reason (e.g. a template with an unresolved content problem like real third-party brand exposure that isn't safely fixable) — but that's the exception now, not the default.

## 9. Visual QA — no browser automation

Never reach for `claude-in-chrome` tools or Playwright for this (user has explicitly and repeatedly declined both). Instead hand the user the sanitized file's path and let them open it in their own browser.

## 10. Save a flat local backup outside the repo

Copy the final sanitized HTML to:

```
/Users/riaenriala/Documents/nightshift/orbie-sanitized-templates/<slug>.html
```

Flat files only — no per-template subfolders, no metadata sidecar files (a prior folder-per-template + meta.json layout was tried and the user found it annoying to review). Keep this in sync whenever the sanitized HTML changes.
