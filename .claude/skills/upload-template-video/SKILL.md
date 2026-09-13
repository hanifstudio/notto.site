---
name: upload-template-video
description: Compress and ingest a template preview video (from ~/Downloads/<slug>.mp4) into R2 + the templates table's previewVideo/previewVideoGrid columns. Use whenever the user gives one or more local .mp4 paths and asks to add/upload/replace a template preview video.
---

# Upload a template preview video

Input: one or more local file paths, normally `/Users/riaenriala/Downloads/<slug>.mp4`. The filename (minus extension) is expected to match a template's `slug` exactly — that's the naming convention the user has used every time so far.

Run every step below, in order, without re-asking whether to do them — this is the agreed pipeline.

## 0. Match filenames to slugs, and check what already has video

For each input file, the basename must equal an existing `templates.slug`. Query the DB to confirm the slug exists and to see whether it already has `previewVideo` set:

```ts
// via: bash -c 'set -a && source .env.local && set +a && npx tsx ./__orbie_check.ts'
import { inArray } from "drizzle-orm";
import { db } from "./lib/db";
import { templates } from "./lib/db/schema";
db.select({ slug: templates.slug, previewVideo: templates.previewVideo })
  .from(templates)
  .where(inArray(templates.slug, [...slugs]))
  .then((rows) => { /* diff against input slugs */ });
```

- A slug not found in the DB: flag it, don't guess — don't silently skip or invent one.
- A slug that **already has** `previewVideo` set: **skip it** by default and tell the user which ones were skipped and why (they've often pasted a broad Finder selection that overlaps with an already-processed batch — seen repeatedly). Only reprocess an already-covered slug if the user has explicitly said they re-recorded/remade that specific video (then treat it as a replacement, see step 4 on cache-busting).

Run this check even for a single file — it's cheap and has caught accidental duplicate batches before.

## 1. Compress two variants per video

One video is used in two places with very different size/quality needs, so always produce both:

- **Hero** (template detail page, large/sharp): scale to at most 1280px wide (never upscale — use `'min(1280,iw)':-2`, not a bare `1280:-2`, since source footage has come in at 1152×648), 24fps, CRF 26.
- **Grid** (directory card hover preview, small and decorative): scale to at most 640px wide (`'min(640,iw)':-2`), 20fps, CRF 32 — much more aggressive, it's tiny on screen.

Both: h264 high profile, yuv420p, no audio track (`-an` — source clips have had none so far, but strip it regardless since neither placement plays sound), `-movflags +faststart` for progressive playback.

```bash
ffmpeg -y -i "$src" -vf "scale='min(1280,iw)':-2" -r 24 \
  -c:v libx264 -preset slow -crf 26 -profile:v high -pix_fmt yuv420p \
  -an -movflags +faststart "$hero"

ffmpeg -y -i "$src" -vf "scale='min(640,iw)':-2" -r 20 \
  -c:v libx264 -preset slow -crf 32 -profile:v high -pix_fmt yuv420p \
  -an -movflags +faststart "$grid"
```

Typical output: hero ~1.5–3.5MB, grid ~200–650KB, scaling with source clip length (clips have ranged ~5–36s).

## 2. Content-hash the upload key — never overwrite a bare `<slug>.mp4` key

R2 objects are uploaded with `Cache-Control: public, max-age=31536000, immutable` (see step 3) — a browser that has ever fetched a given URL will **never** re-check it. Overwriting the same key when a video gets re-recorded silently strands anyone who already loaded the old one. Once bitten by this (the `ai-product-studio` replace), the fix is: key = slug + a content hash, so a re-record always gets a brand new URL.

```bash
hash=$(shasum -a 256 "$hero" | cut -c1-10)
heroKey="preview-videos/$slug-$hash.mp4"
gridKey="preview-videos/$slug-$hash-grid.mp4"
```

## 3. Upload to Cloudflare R2

Same bucket/credentials as image mirroring (see `.claude/skills/ingest-template/SKILL.md` step 4): `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/`R2_BUCKET_NAME`/`R2_ENDPOINT`/`R2_PUBLIC_URL` in `.env.local`, public at `https://file.notto.site`.

```bash
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
aws s3api put-object --bucket "$R2_BUCKET_NAME" --endpoint-url "$R2_ENDPOINT" --region auto \
  --key "$heroKey" --body "$hero" \
  --content-type "video/mp4" \
  --cache-control "public, max-age=31536000, immutable"
# same for $gridKey / $grid
```

Verify with `curl -sI` afterward — check for `200`, `content-type: video/mp4`, and the `cache-control` header actually landed.

## 4. Update the DB

```ts
// via: bash -c 'set -a && source .env.local && set +a && npx tsx ./__orbie_update.ts'
import { eq } from "drizzle-orm";
import { db } from "./lib/db";
import { templates } from "./lib/db/schema";
db.update(templates)
  .set({
    previewVideo: `https://file.notto.site/${heroKey}`,
    previewVideoGrid: `https://file.notto.site/${gridKey}`,
    updatedAt: new Date(),
  })
  .where(eq(templates.slug, slug))
  .returning({ slug: templates.slug });
```

No schema/migration work needed — `templates.previewVideo` and `templates.previewVideoGrid` (nullable `text`) already exist, as does all the plumbing through `lib/db/templates.ts` → `lib/catalog.ts` (`TemplateSummary.previewVideo?`/`previewVideoGrid?`) → `lib/services/template.service.ts`. `scripts/ingest-templates.ts`'s manifest type also already has optional `previewVideo`/`previewVideoGrid` fields for future from-scratch template ingestion.

The UI is already wired and needs no further changes for a new template:
- **Detail page** (`features/templates/template-detail-page.tsx`): renders `<video autoPlay muted loop playsInline>` with `poster={thumbnail}` when `previewVideo` is set, else falls back to the static `<Image>`.
- **Grid card** (`features/directory/template-card.tsx`): renders a hidden `<video preload="none">` using `previewVideoGrid ?? previewVideo`, played on `onMouseEnter` (with `.catch(() => {})` — swallows the benign `AbortError` from a fast hover-out interrupting `play()`) and paused/reset on `onMouseLeave`.

If a template has no video at all, both places cleanly fall back to the thumbnail image — nothing else needs to check for its presence.

## 5. Batching many files — avoid the inline `for`-loop shell quirk

In this sandboxed shell, a `for slug in ...; do ...; done` typed directly into a Bash tool call intermittently fails with spurious `command not found` for otherwise-normal binaries (`ls`, `awk`, `ffprobe`) even though `type`/`PATH` show them present. Workaround that has reliably worked: write the loop to a `.sh` file in the scratchpad dir and invoke it as `bash /path/to/script.sh`, rather than passing the loop inline. Same for the DB-update step — write one `.ts` file that loops over all slugs/URLs and run it once.

For more than ~5 files, run the compress+upload script with `run_in_background: true` on the Bash tool (it's slow — two `ffmpeg` encodes per file) and pick the DB update back up once the completion notification arrives, rather than blocking the conversation on it.

## 6. Report back

Tell the user: which slugs were processed, which were skipped (already had video) and why, which were flagged as not found, and the resulting count of templates with a preview video vs. total templates in the catalog (`SELECT COUNT(*) ... WHERE preview_video IS NOT NULL` vs. total row count) — don't just assume full coverage, check it.
