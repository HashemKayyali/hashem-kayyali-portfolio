# Cloudinary media migration: diagnosis, privacy audit, architecture and checkpoint

Branch `feature/cloudinary-media` (worktree `.worktrees/cloudinary`), based on `main` at `951e593`. The main checkout's unfinished SEO work and other local edits are untouched.

Status (19 Oct 2026): **dry run only. Nothing has been uploaded, nothing is active, nothing is deployed.** Stopped at the configuration checkpoint (section 6).

## 1. Production baseline (before)

Measured by `node scripts/media-baseline.mjs https://hashemkayyali.com output/media-baseline/production-4g.json --network=4g`.

- **Conditions:** headless Chrome 155, a fresh tab and empty HTTP cache per scenario, network emulated at 9 Mbit/s down, 1.5 Mbit/s up and 40 ms RTT. Mobile is 390×844 at DPR 3 with 4× CPU throttle and touch. Laptop is 1366×768 at DPR 1; desktop is 1920×1080 at DPR 1. One run each, so expect roughly ±15 % run-to-run noise.
- **Reproducing:** the raw JSON (every image request, priority, cache state and timing) is saved in `output/media-baseline/`, which is gitignored.

| Viewport | Scenario | LCP ms (element) | Image requests | Image KB | Image decode ms (count) | CLS | Flight ready |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 390 mobile | Home | 4032 (text `p.pulse-statement`) | 53 (42 SVG icons) | 660 | 1060 (43) | 0.080 | |
| 390 mobile | Projects + scroll | 11760 (last cover reached by scroll) | 13 | **1792** | 1798 (67) | 0.001 | |
| 390 mobile | Case (Eventies) + scroll | 5232 (text `p.case-deck`) | 9 | 1341 | **8283 (65)** | 0.112 | |
| 390 mobile | Case gallery (Glitzz, 4 steps) | 4832 (Glitzz cover) | 9 | 1222 | 1177 (43) | **0.292** | |
| 390 mobile | Projects → case flight | 4028 | 5 | 613 | 440 (33) | 0.007 | **4697 ms** |
| 390 mobile | Gallery / Journal (empty) | 2156 / 2416 (h1) | 1 | 80 | ~0 | 0.12 | |
| 1366 laptop | Home | 1156 (portrait) | 53 | 368 | 158 (41) | 0.025 | |
| 1366 laptop | Projects + scroll | 1984 (`card-cover-thumb-640`) | 12 | 546 | 251 (43) | 0.004 | |
| 1366 laptop | Case (Eventies) + scroll | 1564 (Eventies cover) | 9 | **1083** | 988 (48) | 0.010 | |
| 1366 laptop | Case gallery | 2032 | 10 | 1024 | **1673 (64)** | 0.018 | |
| 1366 laptop | Projects → case flight | 1788 | 10 | 889 | 333 (31) | 0.004 | **1697 ms** |
| 1920 desktop | Home | 1152 (portrait) | 53 | 541 | 390 (46) | 0.040 | |
| 1920 desktop | Projects + scroll | 1312 | 12 | 546 | 161 (40) | 0.002 | |
| 1920 desktop | Case (Eventies) + scroll | 1580 (text) | 9 | 1083 | **1929 (65)** | 0.006 | |
| 1920 desktop | Case gallery | 2288 | 10 | 1024 | 1414 (58) | 0.006 | |
| 1920 desktop | Projects → case flight | 2824 | 10 | 889 | 747 (30) | 0.007 | **2425 ms** |

**Delivered file width vs pixels needed.** These figures use the real file widths (`naturalWidth` is density-corrected for `srcset` images, so it was not used):

| Where | What is served | Pixels needed | Over-delivery |
| --- | --- | --- | --- |
| Case study screenshots (all viewports) | `screenshot-0N.webp`, always 1920 px (StoryMedia has no `srcset` for these) | 677 px (laptop), 901 px (desktop), 996 px (mobile) | 1.9–2.8× width, 3.6–8× pixels |
| Case opening cover (all viewports) | full 1600 px cover | 587–1050 px | 1.5–2.7× |
| Projects grid, mobile DPR 3 | full covers 1331–1600 px (130–233 KB each), because the ladder jumps 640 → full | 599–654 px | 2–2.5× |
| Projects grid, laptop | `-640` variants | 362 px | 1.8× (no 480 step) |
| Home, mobile | full Eventies and Bike Tower covers | 808 px | 1.6–2× |

**Diagnosis:**

1. **Case studies are the largest cost, and it is mostly decode, not network.** Every case screenshot is a 1920×1200 original whatever its display size. On the throttled phone, the Eventies case spent **8.3 s decoding images** (largest single decode 774 ms). `CaseMediaGallery` also decodes *every* slide eagerly as soon as the gallery comes within 240 px of the viewport. Fix: responsive widths (Cloudinary `w_` plus `srcset`) shrink decoded pixels about 4× on laptop. Phase 7 should also consider decoding only nearby slides.
2. **Mobile Projects transfers about 1.8 MB** because the `-320/-640/-960` ladder has no 1080–1280 step, so DPR 3 jumps to the full 1.3–1.6k originals. Cloudinary's dense width ladder and AVIF/WebP via `f_auto,q_auto` address this directly.
3. **Home and case LCP on mobile is text, gated by JavaScript and CPU** (4× throttle, 17–33 long tasks totalling 4.4–6.1 s), not images. The home LCP image on desktop is the local portrait, already preloaded at high priority. **Cloudinary will not improve these LCPs**, and moving the portrait would add a new connection to the critical path. It stays local.
4. **The flight transition waits on the destination image.** Ready at 1.7 s on laptop and 4.7 s on mobile. `preloadProjectImage` decodes the full 1600 px cover (`safeSource`), while the card shows a `-640` image. Responsive URLs must match between preload, flight layer and destination so nothing is fetched or decoded twice and no resolution snap occurs.
5. **Not caused by images:** 42 toolbelt SVG requests on Home (small, cached); CLS of 0.12 on the empty Gallery/Journal pages (no images there, so it comes from fonts or layout); CLS of 0.29 on the mobile case gallery, still to be traced in Phase 7.
6. **Caching works:** Vercel serves `/covers` and `/projects` with `max-age=86400, stale-while-revalidate=604800`, and a repeat load transferred **0 image bytes** on laptop and desktop. No duplicate image requests were recorded in any scenario. (Cloudinary's versioned URLs would allow `immutable` year-long caching instead of 1 day.)

## 2. Asset inventory and manifest

Generated by `node scripts/cloudinary-media.mjs`, which is a dry run with no network access:

- **`docs/engineering/CLOUDINARY-MANIFEST.md`** (human-readable). It lists every image with path, project, actual dimensions (from the file bytes), size, real format, reference count, using module, privacy class and decision.
- **`media/cloudinary-manifest.json`** (machine-readable, no secrets). It records public ID, source, dimensions, MD5/SHA-256, local fallbacks and users; the `cloudinary` field fills in only after a verified upload.

The scan follows imports from `preview/main.tsx`, so art-direction boards and dead components (`EngineeringStory.tsx`, the only user of the two concept images) don't count as usage.

| Decision | Files | Size |
| --- | --- | --- |
| **Upload, group A:** approved public originals | 30 | 3.96 MB |
| **Upload, group B:** privacy-redacted derivatives (separate OK) | 5 | 0.17 MB |
| Local width variants, kept as fallback (Cloudinary serves these widths via `w_`) | 68 | |
| Keep local: icons, SVG, brand, favicons, Sterling OG card, LCP portrait, smoke/shader stills | 88 | |
| Never: withheld by `media-policy.ts` | 47 | |
| Not referenced by the live site | 40 | |

Group A covers 11 project covers (9 owner-supplied, plus Basket Beats and Bike Tower), 2 card crops, the Eventies (4), Glitzz Lab (01–05) and Bike-Land screenshots, 4 experience logos and 3 process illustrations.

Other findings:

- Three "`.webp`" experience logos are really PNG or JPEG files (`rd-product-engineer` is a 236 KB PNG, `the-terminal-vr` a 155 KB PNG, `umniah` a JPEG). Vercel serves them as `image/webp`.
- The 6.2 MB of `engineering-process/originals/*.png` is deployed publicly but unused.
- `og-image.png` is byte-identical to `og-image-sterling.png`.
- These files were reported, not changed.

## 3. Privacy audit

- **Withheld (47 files, never uploaded):**
  - Umniah YouthConnect raw folder: 28 files.
  - The Terminal NFC raw folder: 7.
  - Bike Tower `screenshot-01…04` and thumbs: 8.
  - Glitzz Lab `screenshot-06/07` and thumbs: 4.
  - The build deletes them, and production returns **404** (checked for Umniah, Terminal NFC, Bike Tower 01 and Glitzz 06).
  - The migration script calls `withheldMedia()` twice: when it builds the plan and again just before each upload. The test `tests/cloudinary-media.test.mjs` fails if a withheld path, a raw Umniah/Terminal file or a `portfolio/studio/` ID ever enters the plan.
- **Group B (needs your explicit OK):** `terminal-nfc/redacted-invoices` and `bike-tower/redacted-interface-1…4`. These are the burned-in redacted derivatives of confidential interfaces. They are already public on the site, but a Cloudinary `upload`-type original stays reachable by URL until it is deleted in Cloudinary. The upload tool refuses them unless `--allow-derivatives` is also passed.
- **Worth confirming in group A:** `/covers/umniah-youthconnect.webp` and `/covers/terminal-nfc.webp` are the owner-supplied covers approved on 18 Oct 2026 (`data/projectAssets.ts`). Their raw folders stay withheld.
- **Metadata:** none of the 35 planned uploads contains EXIF, GPS or XMP blocks.
- **Not migrated:** source archives, `archive/`, `output/checkpoints/`, the generation-original PNGs, and anything unreferenced.

## 4. Integration architecture (verified)

**What already exists and stays unchanged:**

- **Server-side signing.** `server/studio/cloudinary.ts` signs Studio uploads only into `portfolio/studio/<uuid>` with `overwrite=false`, verifies the signature and dimensions, and only works when admin is configured.
- **Production status.** It now reports `media: true` (your three Vercel variables are live), with `database` and `admin` still false. Studio uploads therefore stay locked and nothing new is active for visitors.
- **Delivery helper.** `preview/cloudinary-delivery.ts` inserts `f_auto,q_auto,c_limit,w_N` and builds a `srcset` capped at the original width. It accepts any `res.cloudinary.com/<cloud>/image/upload/…` URL, so static assets can reuse it as they are; no second image system is needed.
- **Studio overrides.** Through `studio-media-registry.ts` they already take precedence over built-in media, and disabling one restores the built-in images.

**Planned for the static migration** (not implemented until you approve the manifest and the test upload):

- **Namespace.** Static assets go to `portfolio/projects/{project}/{asset}` and `portfolio/site/{experience|process}/{asset}`. This is separate from `portfolio/studio/`, and the Studio verifier only accepts `portfolio/studio/<uuid>`, so the two cannot collide.
- **Resolution order:** Studio override → verified Cloudinary static asset (versioned `v<version>` URL from the manifest) → current local file. A missing or unverified asset simply resolves to the local file.
- **Feature flag.** A public build flag (for example `VITE_MEDIA_CDN=cloudinary`) holds only the switch, never a secret. The cloud name comes from the recorded `secure_url`. With the flag off the site renders exactly as today, and rollback is unsetting the flag and redeploying.
- **Runtime fallback.** One `onError` per image swaps to the local `src`/`srcset` and marks the element, so a failed URL can never retry in a loop.
- **No Admin API in the browser,** no Supabase dependency, and no Cloudinary SDK: delivery uses public CDN URLs, and the migration script uses `fetch` plus a signed upload.
- **Consumers to update together** so that preload, flight layer and destination request the same URL:
  - `ProductImage` (cards and case cover).
  - `StoryMedia` (case screenshots get a real `srcset`).
  - `project-transit.ts` `preloadProjectImage`.
  - `CaseMediaGallery`, where decode warming is limited to nearby slides.
- **Crop rules.** Screenshots keep `contain` and the full frame. Basket Beats and Bike Tower currently mix a 900 px card crop (≤640 widths) with the full cover in one `srcset`, so the composition changes with DPR. The first rollout keeps that parity exactly to avoid design changes; fixing it is a separate design decision.
- **Cost control.** One width ladder (480/800/1200/1600/2000, capped at the original) gives at most about 6 derivatives per asset (about 200 in total), each generated once and cached by the CDN.
- **Unchanged:** the LCP portrait, favicons, the Sterling OG card, fonts, SVGs, smoke/shader stills and the smoke renderer.

## 5. Migration tool (`scripts/cloudinary-media.mjs`)

- **Dry run (default)** regenerates the manifest. `--check` confirms that the credentials work through a read-only Admin API usage call; it never prints values or creates anything.
- **Upload** needs `--upload --confirm=<public_id>[,…]`, naming every asset explicitly, with `--limit` up to a maximum of 10 per run. Group B also needs `--allow-derivatives`.
- **Per asset:**
  1. Re-checks the privacy policy and that the local MD5 matches the manifest.
  2. Looks the public ID up: an identical existing asset is adopted, a different one **stops the run** (never overwritten).
  3. Uploads with a signed request (`overwrite=false`, tag `portfolio-static`).
  4. Re-reads the asset from the Admin API and requires the checksum (`etag`) and dimensions to match.
  5. Records version, format, size, bytes and `secure_url` in the manifest, and appends to `docs/engineering/CLOUDINARY-UPLOAD-REPORT.md`.
- **Failures:** network errors and 5xx retry three times with 1/2/4 s backoff. 401/403, 420/429 and quota errors stop the run safely.
- **Local originals are never modified or deleted.**

## 6. Configuration checkpoint: what you need to do

Vercel already has the three variables for Production and Preview, and production confirms them (`media: true`) without exposing values. For the local test upload, the same three must exist **on this machine only**:

1. Open the Cloudinary Console → **Settings → API Keys** (the cloud name is shown at the top of the Console dashboard and on that page).
2. Create the file **`C:\Users\hashe\Desktop\portfolio-v2\.worktrees\cloudinary\.env.local`**. It is gitignored by the `.env*` rule; I have not created it. Put these three lines in it, with the values on the right of `=`:
   - `CLOUDINARY_CLOUD_NAME=`
   - `CLOUDINARY_API_KEY=`
   - `CLOUDINARY_API_SECRET=`

   Don't paste them into chat. (Alternative: `vercel link` then `vercel env pull`. That pulls *all* Preview variables, and variables marked Sensitive come back empty, so copying from the Console is simpler.)
3. In Cloudinary **Settings → Security**, confirm **Strict transformations is off**. The site requests `f_auto,q_auto,w_…` derivatives on the fly. Please don't change other security settings for this; I won't either.
4. Optional: check **Settings → Upload** for an account-level size limit (20 MB images is plenty). No unsigned upload preset is needed.
5. Tell me when the file is in place. I will then run `node scripts/cloudinary-media.mjs --check`, which reports only "present / missing", the plan name and usage, never the values.

### Prepared test upload (waiting for your authorization)

One approved, clearly public, group A asset: the Eventies cover. Eventies is a live public product, and this cover is the first project card and the source of the projects → case flight, so it exercises cards, the case opening and the transition.

```
node scripts/cloudinary-media.mjs --upload --confirm=portfolio/projects/eventies/cover
```

- Source: `/covers/eventies.webp`, 1600×960 WebP, 233 KB.
- Destination: public ID `portfolio/projects/eventies/cover`, tag `portfolio-static`.
- Afterwards: the manifest records the version and URL; nothing on the site changes (no consumer reads it until the flag exists).
- Undo: delete that one asset in the Cloudinary Media Library.

## 7. Next steps after approval

1. Run the single test upload, then compare the delivered `f_auto,q_auto,w_…` variants (format, bytes, visual quality) against the local files.
2. Implement the flagged resolver and consumers (section 4), then rerun `scripts/media-baseline.mjs` against a local or preview build with the flag on and off, under the same conditions.
3. Upload group A in batches of up to 10, and group B only if you approve it. Verify, measure again, and stop for your deployment approval.

## 8. Single test upload result (19 Oct 2026)

- `--check`: all three variables recognized; account reachable (Free plan, 0.68 % of credits used before the test).
- Uploaded **only** `portfolio/projects/eventies/cover` (version `v1792404610`, tag `portfolio-static`, type `upload`). Stored 1600×960 WebP, 238,828 bytes, byte-identical to `/covers/eventies.webp`. Recorded in `media/cloudinary-manifest.json`. No other asset was uploaded.
- Delivery through the existing `preview/cloudinary-delivery.ts`: `isCloudinaryUrl` is true and the `srcset` is 480/800/1200/1600 (capped at the original). Every width keeps the 1.6667 aspect ratio, and `w_2000` stays at 1600 (no upscale). Responses: `Cache-Control: private, no-transform, immutable, max-age=2592000`.
- **Rendering:** all variants decode in Chrome at the correct aspect ratio. No visible difference from the local files at display size (not a 1:1 pixel review).

**Size at equal width, requested with a Chrome User-Agent:**

| Width | Local | `f_auto,q_auto` (current helper) | `f_auto,q_auto:eco` | `f_avif,q_auto:eco` |
| --- | --- | --- | --- | --- |
| 320 | 20.7 KB | 30.7 KB (JPEG) | 18.3 KB WebP | 22.1 KB |
| 640 | 62.1 KB | 68.4 KB | 53.3 KB | 56.2 KB |
| 960 | 114.5 KB | 108.6 KB | 94.7 KB | 83.9 KB |
| 1200 | none | 146.2 KB | 128.8 KB | 102.0 KB |
| 1600 | 233.2 KB | 244.1 KB | 202.6 KB | 138.9 KB |

**Conclusions:**

- The local WebPs are already well compressed. With the helper's current `q_auto`, Cloudinary is **not** smaller at equal widths (+48 % to −5 %), and `f_auto` picked JPEG at 320 px.
- `q_auto:eco` is 12–18 % smaller than local at every width. The real savings come from serving the right width (section 1), not from the CDN alone.
- On this account `f_auto` never picked AVIF for Chrome. Explicit AVIF is smallest at large widths but decodes more slowly, so it needs measuring before use.
- Recommendation for the rollout: `f_auto,q_auto:eco` for static media. Studio keeps its current setting unless you decide otherwise.

## 9. Quality comparison: q_auto, q_auto:eco and q_auto:best (19 Oct 2026)

**Sample.** Approved by you, uploaded and verified byte-for-byte; no redacted asset was touched. Each image covers one media type:

| Public ID | Type |
| --- | --- |
| `eventies/cover` | Hero/cover: a graphic with text |
| `eventies/screenshot-01` | Software UI with small captions and embedded photos |
| `glitzz-lab/screenshot-03` | Case-gallery screenshot with a large heading |
| `vr-cycling/cover` | Physical product photo with on-screen text |
| `site/process/02-system` | AI illustration with gradients |

**Method.** `scripts/cloudinary-quality.html`: serve the repository root and open it. For every sample and every width the responsive `srcset` delivers (480 for laptop cards, 800 for laptop case media and mobile cards, 1200 for mobile DPR 3 and desktop case media), it fetches `f_auto` with the exact `Accept` header Chrome sends for images. It records:

- transferred bytes and format;
- decode time (median of 5 `createImageBitmap` runs, Chrome 152 on this desktop CPU, so expect roughly 4× on a mid-range phone);
- PSNR, mean SSIM and the worst 8×8 SSIM block against a lossless PNG resized by Cloudinary to the same width.

It then shows 1:1 crops at 2× and 4× of the most fragile regions.

| Sample (width) | q_auto | q_auto:eco | q_auto:best | What the site serves today |
| --- | --- | --- | --- | --- |
| Hero cover 800 | 115.1 KB, SSIM 0.996 (worst 0.97) | 86.2 KB, 0.991 (0.91) | **455 KB lossless** | 233 KB full or 114.5 KB −960 |
| Hero cover 1200 | 146.2 KB, 0.991 (0.91) | 128.8 KB, 0.988 (0.89) | 196.1 KB, 0.995 | 233 KB full |
| UI screenshot 800 | 71.7 KB, 0.995 (0.96) | 57.9 KB, 0.989 (**0.50**) | 97.1 KB, 0.997 | **254.6 KB** (always the 1920 original) |
| UI screenshot 1200 | 144.3 KB, 0.995 (0.96) | 108.5 KB, 0.992 (0.91) | 180.3 KB, 0.997 | 254.6 KB |
| Gallery screenshot 800 | 33.1 KB, 0.988 | 33.1 KB (same file) | 43.6 KB | 162.6 KB |
| Gallery screenshot 1200 | 65.9 KB, 0.991 (0.88) | 57.7 KB, 0.988 (0.80) | 90.9 KB, 0.995 | 162.6 KB |
| Product photo 480 | 44.9 KB **JPEG** | 26.0 KB WebP | 73.1 KB JPEG | 59.5 KB −640 |
| Product photo 800 | 65.4 KB, 0.980 (0.85) | 65.4 KB (same file) | 96.7 KB | 174.8 KB full at mobile DPR 3 |
| Product photo 1200 | 122.6 KB, 0.985 (0.89) | 107.3 KB, 0.981 (0.83) | 175.6 KB | 174.8 KB |
| Illustration 480 / 800 | 12.0 / 32.0 KB (0.95) | 10.6 / 25.3 KB (0.93) | 21.5 / 45.3 KB | 21.0 KB −640 |
| Illustration 1200 | 61.7 KB (0.95) | 43.8 KB (0.91) | 79.6 KB | 62.0 KB full |

**Aspect ratio:** preserved in all 57 measurements, with `c_limit` (no crop, no upscale). The decode time follows pixel count, not quality level. For example, the UI screenshot takes 6 ms at 800 px, 13 ms at 1200 px and 25 ms at today's 1920 px, regardless of q_auto, eco or best.

**Visual inspection** at 2× and 4× in Chrome. The pane renders at about 0.75 scale, so this is not a calibrated-monitor review.

- **Text:** small UI captions, on-screen game text and the large gallery heading are equally legible and edge-clean in every variant. No ringing appeared around text on any setting.
- **Photos:** skin tones, the dark background and the white headset show no blocking or colour shift at any setting.
- **Where eco loses:** the only measurable eco loss is *photographic detail inside UI screenshots*. At 800 px the Eventies screenshot's embedded venue photo (railing, flowers) softens: 16 blocks under SSIM 0.9 versus none for q_auto. It is subtle at 1:1, but it is exactly the authentic detail a case study shows.
- **Illustration:** eco smooths the paper grain slightly; no banding appeared.

**Findings that shape the policy:**

1. **`q_auto:best` is unsafe with `f_auto` on graphic and UI images.** At ≤800 px Cloudinary switched to lossless output: 455 KB for the hero at 800 (4× larger than q_auto) and 128 KB for the screenshot at 480. It is lossy only at 1200 and above. Never use it as a blanket setting.
2. **Most of the saving comes from sending the right width, not from eco.** q_auto at the delivered width cuts the case screenshot from 254.6 KB to 71.7 KB (laptop, −72 %) or 144.3 KB (mobile/desktop, −43 %). It cuts the gallery screenshot by 59–80 % and the mobile product-photo card from 174.8 KB to 65.4 KB (−63 %). Decode work falls in step.
3. **eco saves 0–30 %, unevenly.** Twice it returned the identical file (0 %). It saved 12–25 % on screenshots and covers, and 21–29 % on the illustration.
4. **`f_auto` sometimes picks JPEG at 480 px or less** (the product photo at q_auto: 44.9 KB JPEG vs 26.0 KB WebP with eco; also the hero at 320). This is Cloudinary's own choice, and it was reproducible.

### Recommended media-aware quality policy

| Media type | Assets | Setting | Why |
| --- | --- | --- | --- |
| UI screenshots, case galleries | Eventies 01–04, Glitzz 01–05 | **`q_auto`** | eco softens authentic embedded photos; q_auto is already 43–80 % smaller than today |
| Covers with UI, text or dark dashboards | Eventies, Glitzz, Umniah, Terminal NFC, Financial Ops, Outreach, Traffic Flow | **`q_auto`** | text and fine UI; dark dashboards are the most artifact-prone |
| Physical product/event photos | VR Cycling, Bike-Land (cover and screenshot), Basket Beats, Bike Tower (cover and card) | **`q_auto:eco`**, *if each asset passes the gate below* | photos hide compression well; measured worst block 0.83–0.85 |
| AI process illustrations | process 01–03 | **`q_auto:eco`**, *if it passes the gate* | 21–29 % smaller, no banding |
| Anything that fails visually at q_auto | none found | `q_auto:best`, **only at ≥1200 px** | avoids the lossless blow-up |
| Experience logos (rendered ≤320 px from 5–24 KB files) | 4 | **keep local, drop from the plan** | no measurable gain, and an extra connection |

**Gate for eco (automatic, per asset, at bulk time).** Use eco only if it saves at least 10 % *and* keeps mean SSIM ≥ 0.97 and the worst block ≥ 0.80 against the lossless reference at 800 and 1200 px. Otherwise fall back to q_auto. Results go into the manifest as a per-asset `quality` field, and the delivery helper reads it (Studio media stays on q_auto). The small-width JPEG quirk is covered because the `srcset` never offers less than 480 px for cards, and the before/after trace will show what is actually delivered.

**Unchanged:** responsive `srcset` and `sizes`, explicit width and height, `c_limit` (no crop), local files as runtime fallback, Studio precedence, `media-policy.ts` exclusions, and the 5 redacted assets (each still needs your individual approval).

### Recommended next steps (each needs your go-ahead)

1. Bulk-upload the remaining group A assets except the 4 experience logos: 25 assets, in 3 batches of ≤10, each verified by checksum. The 5 already uploaded are adopted, not re-uploaded.
2. Run the eco gate over the photo and illustration assets and record `quality` per asset.
3. Implement the flagged resolver (section 4) with the per-asset quality, then rerun `scripts/media-baseline.mjs` locally with the flag off and on under identical conditions, and report before/after.
4. Stop for your deployment approval.

## 10. Bulk upload, eco gate and flagged delivery (19 Oct 2026)

### Upload

- **Group A is complete: 26/26 verified.** That is 21 uploaded today in batches of 10, 10 and 1, plus the 5 earlier samples. Each is checked by MD5 of the delivered original against the local file and by dimensions.
- The earlier note said "25 remaining"; the correct count was 21 (30 minus 4 experience logos minus 5 already uploaded).
- **Not uploaded:**
  - the 4 experience logos (kept local by decision);
  - the 5 redacted group B assets, which each still need your individual approval;
  - all 47 withheld files.
- Log: `docs/engineering/CLOUDINARY-UPLOAD-REPORT.md`. State: `media/cloudinary-manifest.json`.

### Eco gate (`scripts/cloudinary-quality.html?gate` → `media/cloudinary-quality.json`)

| Asset | Result | Deciding measurement |
| --- | --- | --- |
| bike-tower/cover | **eco** | −15 % at 800, −28 % at 1200; SSIM ≥ 0.973, worst block ≥ 0.84 |
| process/01-context, 02-system, 03-iteration | **eco** | −20…−31 %; SSIM ≥ 0.989, worst block ≥ 0.85 |
| vr-cycling/cover | q_auto | 0 % saving at 800 (identical file) |
| bike-land-trainer/cover | q_auto | worst block 0.77 at 800 |
| bike-land-trainer/screenshot-01 | q_auto | mean SSIM 0.964 |
| basket-beats/cover | q_auto | at 960 eco switches to JPEG, worst block 0.63 |
| basket-beats/card-cover | q_auto | only 4.9 % saving at its full 900 px |
| bike-tower/card-cover | q_auto | 0 % saving |

All other assets (screenshots, UI covers) are on `q_auto` by policy. Result: **4 eco, 22 q_auto, 0 best.**

### How delivery works now (flag `VITE_MEDIA_CDN=cloudinary`, build-time, not a secret)

- **`preview/cloudinary-static.ts`** is generated by `scripts/cloudinary-media.mjs`. It maps each of 72 local paths to its verified, versioned Cloudinary original. It contains group A only, never group B.
- **`preview/static-media.ts`** provides `cdnImage()` and `localFallback()`. `cdnImage()` returns `undefined` when the flag is off or when any candidate is not verified, so the caller renders its unchanged local markup.
- **`preview/cloudinary-delivery.ts`** gains the per-asset quality option and `staticAttributes()`:
  - one source image gets the 480/800/1200/1600/2000 ladder, capped at the original;
  - a mixed card crop plus cover keeps exactly the local widths and pictures.
  - Studio media keeps `q_auto`.
- **Consumers:**
  - `ProductImage` (cards, home and gallery scenes);
  - `StoryMedia` (case opening and case gallery; the screenshots finally get a `srcset`);
  - `HomeStory` process art;
  - `project-transit.ts` preload, which now uses the case opening's own `srcset` and `sizes` (`CASE_OPENING_SIZES`) so it warms the exact candidate.
- **`preview/vite.config.ts`** adds `<link rel="preconnect" href="https://res.cloudinary.com">` only when the flag is on.
- **Flag off:** the build contains 0 Cloudinary URLs and no preconnect (the lookup is tree-shaken). The HTML and images are the local ones.
- **Unchanged:** Studio overrides still win; aspect ratios, `width`/`height`, `sizes`, `object-fit`, the LCP portrait, favicons, the Sterling OG card, smoke and themes. No SEO, prerender or GSAP files were touched.

### Verified in the browser (flag on, local build)

- **Projects page:** 8/8 visible images from Cloudinary, 0 broken, aspect ratios intact. The Bike Tower and Basket Beats cards keep their card crop.
- **Simulated Cloudinary failure:** exactly 1 error event. The image switched to `/covers/eventies-640.webp`, was marked `data-cdn-fallback="local"`, rendered, and did not retry.
- **Projects → Eventies flight:**
  - The layer starts from the card's `w_800`.
  - The destination's `w_1200` was decoded about 130 ms after the route commit, because the preload warmed the same candidate.
  - The layer adopts it before the arrival motion, so there's no resolution snap or post-landing swap, and no fallback fired.

### Rollback

1. **Instant (no code change):** remove `VITE_MEDIA_CDN` from the Vercel environment and redeploy. The site serves local files exactly as before. Nothing local was deleted.
2. **Per asset:** delete it in the Cloudinary Media Library (or rerun the script after removing its manifest entry). It drops out of `cloudinary-static.ts` and that image renders locally. Visitors already holding a cached page fall back through `onError`.
3. **Code:** revert the branch's commit(s). Studio, privacy policy and local media are unaffected.
4. **Remove all static uploads:** in Cloudinary, delete everything tagged `portfolio-static` (26 assets under `portfolio/projects` and `portfolio/site`). `portfolio/studio` is untouched.

### Production deployment checklist (for your approval later)

- [ ] Review the diff on `feature/cloudinary-media` and approve the A/B numbers below.
- [ ] Decide how this branch joins `main` alongside the unfinished SEO work in the main checkout. It has no overlapping files, but they are separate changes.
- [ ] In Vercel → Settings → Environment Variables, add **`VITE_MEDIA_CDN=cloudinary`** to Preview first. Deploy a preview and run `scripts/media-baseline.mjs` against the preview URL.
- [ ] Confirm Cloudinary **Strict transformations stays off** and that usage after the preview test is within the Free plan.
- [ ] Then add the variable to Production, deploy, and run `node scripts/audit-production-seo.mjs` plus the baseline against production.
- [ ] Rollback is step 1 above if anything looks wrong.

## 11. Before/after measurements: flag off vs on (19 Oct 2026)

**Conditions.**
- Both builds come from the same commit and are served by the same local `vite preview` (port 4178). Only `VITE_MEDIA_CDN` differs.
- Headless Chrome 155 with 9 Mbit/s, 40 ms RTT emulation; the mobile profile is DPR 3 with 4× CPU.
- 2 runs per cell, averaged. Command: `scripts/media-baseline.mjs … --runs=2`; raw JSON in `output/media-baseline/ab-*.json`; comparison script `output/media-baseline/compare.mjs`.
- **Bias:** "off" images come from localhost, while "on" images cross the real internet to Cloudinary. That penalises "on" for latency more than production would, where local files also come from Vercel's edge.

**First attempt (`f_auto`), rejected:**
- Chrome 155 advertises JPEG XL, so `f_auto` served JXL. It was not reliably smaller and decoded far slower: desktop Projects decode went 120 → 596 ms, bytes 422 → 710 KB.
- The 480/800 ladder also skipped the local 640 step.
- Fix: static assets pin `f_webp` (the same format as the local files), and the ladder includes 320/640/960. Studio media keeps `f_auto`.

**Final build vs flag off** (image KB / decode ms / LCP ms; averages of 2 runs):

| Scenario | 390 mobile | 1366 laptop | 1920 desktop |
| --- | --- | --- | --- |
| Case study (Eventies) | **1341 → 900 KB (−33 %)**, decode 963 → 508, LCP 1878 → 1524 | **1083 → 714 KB (−34 %)**, decode 614 → 442, LCP 1550 → 1358 | **1083 → 714 KB (−34 %)**, decode 1087 → 450, LCP 744 → 1110 (**+49 %**, cover LCP from the new origin in run 1) |
| Case gallery (Glitzz, 4 steps) | **1216 → 756 KB (−38 %)**, decode 979 → 340 | **1025 → 660 KB (−36 %)**, decode 993 → 426, LCP 772 → 1016 | **1025 → 660 KB (−36 %)**, decode 978 → 365, LCP 706 → 800 |
| Projects → case flight | 868 → 579 KB, ready 2622 → 3253 ms (runs: 2495/2748 vs 2630/3875) | 890 → 652 KB, ready 1624 → 1651, LCP 810 → 974 | 890 → 680 KB, ready 1626 → 1668, LCP 888 → 986 |
| Projects + scroll | **1793 → 1396 KB (−22 %)**, decode 690 → 792 | 547 → 463 KB, decode 143 → 132 | 422 → 421 KB, decode 120 → 168 |
| Home + scroll | 666 → 524 KB, decode ±noise (runs 248/1284 vs 440/464) | 374 → 361 KB, decode 134 → 224 (runs 135/312) | 490 → 513 KB, decode 219 → 388, LCP (local portrait) 780 → 938 |

**Reading:**

1. **Clear wins: case studies and case galleries on every viewport,** plus mobile Projects and flight bytes. These are the places where local files had no right-sized variant (1920 px screenshots always, and a 640 → full jump at DPR 3).
2. **Neutral on bytes: laptop/desktop cards and Home.** The local `-320/-640/-960` WebPs are already right-sized and well compressed. At 640 px Cloudinary q_auto WebP measured +10 % on Eventies and Umniah, +8 % on Glitzz, −14 % on Traffic Flow and −18 % on VR Cycling.
3. **Costs:**
   - When the LCP element is a Cloudinary image (case cover on desktop, card in the flight scenario), LCP was 150–600 ms slower. That is a new connection plus a cold derivative on first request.
   - Home's local portrait LCP was also ~150 ms slower on desktop with the flag on, which suggests early bandwidth competition.
   - Desktop Home/Projects decode rose consistently; not yet explained.
   - Mobile flight readiness is noisy (one 3.9 s run).
4. **Continuity:** aspect ratios, crops and the flight hand-off were verified in the browser; the flight never fell back.
5. **Extra requests:** the extra requests on case pages (+4) are the new 320 px renditions of screenshots used by a small element, about 50 KB in total. They are already included in the byte totals above.

### Options (your decision; nothing deployed)

- **A. Scope Cloudinary to case-study media only** (`StoryMedia` and the flight preload). Cards, Home and process art return to local files. This keeps the measured wins (−33…−38 % bytes, −28…−65 % decode) and avoids the neutral-or-worse places. Then measure on a Vercel **preview** under real network before production. *Recommended*, but it needs your OK for the preview deployment.
- **B. Keep everything as built and verify on a preview deployment.** The localhost bias may hide a real-world win for cards and Home, but the decode and LCP costs above are the risk.
- **C. No CDN for static media:** generate local 800/1200 WebP variants for screenshots and covers instead. That captures most of the byte and decode win with no new origin, but loses q_auto, eco and versioned CDN caching. The uploaded assets stay harmless and unused.

## 12. Hybrid rollout (approved direction, 19 Oct 2026)

**Rule.** Cloudinary serves **only the additional case-gallery screenshots**. Everything above the fold, every LCP candidate, every cover and the whole image flight stay on the local files.

The rule is enforced in two places:
1. The caller must opt in: only `CaseMediaGallery` passes `cdn` to `StoryMedia`.
2. `cdnRoutable()` in `preview/cloudinary-delivery.ts` only accepts `/projects/<project>/screenshot-NN.webp`, so a cover can never route to Cloudinary, even by mistake.

The flag (`VITE_MEDIA_CDN=cloudinary`) and its rollback are unchanged; with the flag off the build contains no Cloudinary code.

### Asset routing (flag on)

| Image | Where it renders | Delivery |
| --- | --- | --- |
| Project covers (`/covers/*`, Basket Beats and Bike Tower `cover.webp`) | cards, Home scenes, Projects page, case opening, gallery slide 1, flight source/preload/destination | **local** |
| Card crops (`card-cover-thumb-*`) | cards | **local** |
| Process illustrations | Home story | **local** |
| Experience logos, LCP portrait, favicons, Sterling OG card, brand, icons, smoke/shader stills | site-wide | **local** |
| Redacted derivatives (`/v2-media/terminal-*`, `bike-interface-*`) | Terminal NFC, Bike Tower galleries | **local** (never uploaded) |
| Eventies `screenshot-01…04` | Eventies case gallery and its thumbnails | **Cloudinary** `f_webp,q_auto`, width ladder |
| Glitzz Lab `screenshot-01…05` | Glitzz Lab case gallery and its thumbnails | **Cloudinary** `f_webp,q_auto` |
| Bike-Land `screenshot-01` | Bike-Land case gallery and its thumbnail | **Cloudinary** `f_webp,q_auto` |
| Withheld raw files (Umniah, Terminal NFC, Bike Tower 01–04, Glitzz 06–07) | nowhere (built out, 404) | never requested |

The other 16 verified uploads (covers, card crops, process art) stay on Cloudinary unused. They are harmless, and they let a later step move more media to Cloudinary if measurements justify it.

### Thumbnail correction

- **Before:** the filmstrip used `sizes="100px"` while its slide used `(max-width:800px) 90vw, 1050px`, so the browser picked a different file for the thumbnail. On `main` today that means an extra local cover `-320` request. With the first Cloudinary build it meant an extra `w_320` per screenshot.
- **Now:** thumbnails use the slide's `sizes`, so the browser selects the identical candidate and serves it from cache. That is one download per image, and no thumbnail ever fetches anything the gallery doesn't already load.
  - The gallery decodes every slide on approach (existing behaviour, unchanged), so this adds no bytes and no earlier requests.
  - Variant B (thumbnails with their own 320 px renditions) was measured for comparison (below).

### Git safety record

- **Checkpoint 1 (file archive):** all 20 Cloudinary-owned files (`cloudinary-checkpoint-20261019.tar`, outside the repository), with per-file SHA-256. It was extracted to a separate folder and verified byte-identical.
- **Checkpoint 2 (git):** commit `eec2eeb` on `feature/cloudinary-media`, tagged `checkpoint/cloudinary-pre-rebase-20261019` (local tag).
- **Rebase:** only after the worktree was clean, onto `main` = `49a355a` (phone scrolling), with no conflicts.
  - Main's 5 files were byte-identical to `main` afterwards, and the Cloudinary changes were byte-identical to the checkpoint.
  - `49a355a` is an ancestor of the branch.
- **Main checkout:** never touched. Its 13 uncommitted SEO/Sitelinks entries are unchanged.
- **Baseline:** a separate temporary detached worktree at `main` (`.worktrees/baseline-main`) is built and measured only as the unchanged local baseline.

### Privacy and routing verification (flag on, all 11 projects, mobile 390 and laptop 1366)

`scripts/media-baseline.mjs --only=routing` loads every case study, scrolls it and steps through every gallery slide. Results:

- **Cloudinary requests:** only Eventies 01–04, Glitzz 01–05 and Bike-Land 01; the other 8 projects request nothing from Cloudinary.
- **Covers:** all local.
- **Errors and privacy:** 0 HTTP errors, 0 broken images, 0 withheld paths requested, 0 redacted public IDs.
- **Duplicates:** **0 images fetched more than once within a page** (including the same image at two widths).

### Final interleaved comparison (bounded: 3 rounds, rotated order, all three builds served at once)

Conditions: local `vite preview`, headless Chrome 155, 9 Mbit/s and 40 ms RTT; mobile 390 px (DPR 3, 4× CPU) and desktop 1920 px. Values are the median of 3, with the range in brackets. Raw data: `output/media-baseline/interleave/`.

- **Baseline:** pristine `main` `49a355a`, all local.
- **A:** Hybrid, with thumbnails reusing the slide file.
- **B:** Hybrid, with thumbnails getting their own 320 px renditions.

| | Baseline | **Hybrid A** | Variant B |
| --- | --- | --- | --- |
| Case page, mobile: bytes / requests | 1341 KB / 9 | **986 KB / 8 (−26 %)** | 1056 KB / 13 |
| Case page, mobile: decode | 1165 ms (1041–1387) | **873 ms (777–1134)** | 587 ms (566–1012) |
| Case page, desktop: bytes / decode | 1083 KB / 1475 ms | **727 KB (−33 %) / 479 ms** | 771 KB / 464 ms |
| Case page LCP, mobile / desktop | 2076 / 872 ms | 2100 / 732 ms | 2044 / 788 ms |
| Gallery, all slides decoded after entering view, mobile | 867 ms (849–944) | **510 ms (481–666)** | 836 ms (638–1775) |
| Gallery, all slides decoded, desktop | 802 ms (760–814) | **509 ms (429–532)** | 683 ms (466–5158) |
| Gallery bytes, mobile / desktop | 1223 / 1025 KB | **842 / 644 KB (−31 % / −37 %)** | 893 / 706 KB |
| Warm reload of a case page: bytes / LCP, mobile | 1 KB / 1336 ms | **0 KB / 976 ms** | 1 KB / 1208 ms |
| Flight ready, mobile / desktop | 2557 / 1725 ms | 2696 / 1614 ms | n/a |
| Flight trials completed | 6/6 | **6/6** | n/a |
| Home (code identical in all builds): LCP, mobile | 2352 ms (2288–2800) | 2528 ms (2404–2676) | n/a |

**Decision: thumbnail variant A.**
- B saves about 200–300 ms of *total* decode, because its thumbnails decode small files. But it costs 5 extra requests and 50–70 KB.
- Those extra requests compete with the slides for bandwidth, so B's gallery takes 836 vs 510 ms (mobile) and 683 vs 509 ms (desktop) to be fully ready. That is what a visitor waits for when swiping.
- A is better on the visitor-facing metric and on bytes. Its extra decode work runs asynchronously (`decoding="async"`).

**Real improvements:** these are deterministic or consistent across every run.
- Case-page image bytes −26 % (mobile) and −33 % (desktop); case-gallery bytes −31 % and −37 %; one fewer request per case page (the local cover thumbnail duplicate is gone).
- Image decode on case pages −25 % (mobile) and −68 % (desktop); gallery fully ready −41 % (mobile) and −37 % (desktop).
- Warm reload transfers 0 image bytes.

**Measurement noise (not attributable to the hybrid):**
- Home LCP and Home decode: the code and bytes are identical in all builds, yet the medians move ±7–10 %.
- Case-page LCP: the LCP element is text or the **local** cover in all builds, so the differences fall inside the run ranges.
- Flight readiness: mobile +5 % and desktop −6 %; the medians fall inside each other's ranges, and the flight code is identical to `main`.
- Desktop Home "433 vs 548 KB": identical URLs. The baseline tool recorded 0 bytes for some responses, a tooling quirk that undercounts baseline bytes.

**Remaining regressions:** none measured beyond noise.
- Trade-off accepted with A: thumbnails decode slide-size files (about 290 ms more total decode than B on mobile, asynchronously).
- The earlier failed mobile flight trial did not reproduce: 12/12 with click diagnostics, and the click always landed on the card image.

**Still unverified (needs the Vercel Preview benchmark):**
- real-network latency to Cloudinary versus Vercel's edge;
- cold Cloudinary derivatives on first request;
- real phones.

## 13. Release (owner delegated the overnight release, 19–20 Oct 2026)

**Real-network check** (from Amman, one gallery screenshot, 6 requests each):

| | Bytes | Time to load |
| --- | --- | --- |
| Production today: local file via the Vercel edge | 162.6 KB | 130 ms (cache hit), 600–670 ms (cache miss) |
| Cloudinary `f_webp,q_auto,w_1200` | 65.9 KB | 136 ms on the first request, then **~20 ms** |

- **Pre-warm:** all 79 derivative URLs the galleries can request (10 screenshots × their width ladder) were requested once beforehand, so no visitor waits for first-time generation. All 79 returned WebP.
- **Vercel Previews** (protected, target Preview): Hybrid OFF `hashem-kayyali-portfolio-6zgsk5hjs-hashem11.vercel.app`, Hybrid ON `hashem-kayyali-portfolio-ezbpdt2m1-hashem11.vercel.app`.
  - Checked via `vercel curl`: the OFF bundle has 0 Cloudinary references; the ON bundle references the 26 approved IDs and 0 redacted ones; withheld raw files return the 404 page.
  - A browser benchmark on the previews needs a Protection Bypass secret, which was not configured. Protection stayed on.

**Default:** gallery screenshots use Cloudinary unless `VITE_MEDIA_CDN=local` is set. Setting `local` builds a site with no Cloudinary code (verified).

**Rollback:** in Vercel → Environment Variables (Production), set `VITE_MEDIA_CDN=local` and redeploy, or revert the merge commit. Local originals are untouched.
