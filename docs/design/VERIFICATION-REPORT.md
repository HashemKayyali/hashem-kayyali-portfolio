# Design intelligence / V1 smoke recovery — verification

13 October 2026. Review: `http://127.0.0.1:5176/preview/design-intelligence-review.html`. Built portfolio: `http://127.0.0.1:4176/preview/en/` and `/preview/ar/`. No publish, push or merge.

## Implementation outcome

- Exact V1 GLSL fragment copied and permanently checked against its real source digest. Five-octave domain warping and original axis-specific motion/fold blending retained. Light finish changes only ramp and omits dark vignette/grain.
- One shared Worker now paints Home and other existing fluid fields; old approximate smoke/ribbon/gradient renderer is no longer imported. Desktop512×384 /mobile320×240; no uncontrolled DPR increase. Genuine captured still replaces approximation in static fallbacks.
- Existing portrait and typography entrances remain intact. Prior inset-unit/decode/Worker repair preserved. One pre-existing TypeScript callback mismatch was corrected with a type-safe requestAnimationFrame wrapper; no appearance change.
- Shared native language select, keyboard-consistent navbar/disclosure, 44px targets and media corners refined. Language-only navigation explicitly preserves reading position and select focus, avoiding the unrelated page exit mask.
- Eleven projects, five dictionaries, approved typography/palette and privacy policy retained. Broad further page redesign awaits visual approval.

## Fresh command checks

| Command | Result |
| --- | --- |
| `npm test` | 8/8 pass |
| `node --test preview/*.test.mjs` | 17/17 pass, including exact original-shader provenance |
| `npm run typecheck` | Exit0 after fixing the existing GSAP Function callback mismatch |
| `npm run validate:content` | 14/14 pass; 11 project slugs in each of five locales, approved About/career/identity unchanged |
| `npm run build:light` | Exit0; 85 localized noindex route shells; no production deployment |
| `git diff --check` | Exit0; existing LF/CRLF notices only |
| `python scripts/audit-design-skills.py` | Seven skills discovered; local validators/searches run; two policy-mismatch exits retained in capability map |

No dependencies were added/installed by this session. Initial app JS419.32kB /142.49kB gzip; final414.65kB /140.41kB gzip. Worker2.74→4.12kB; initial CSS125.73→130.14kB /20.53→21.26kB gzip. These are build artifact sizes, not total transfer budgets or field metrics. Public/fonts/project images and canonical content sources were preserved.

## Actual Playwright MCP verification

- Baseline: 56 layouts = seven experiences × EN/AR ×1920/1440/390/320. Zero page errors/positive overflow. All 56 baseline full-page snapshots retained.
- Final: same 56-layout viewport capture and geometry audit, zero failures/errors: `after-viewport-audit-mcp.json`. Full-page final snapshot files also exist; their first batch returned a **300-second MCP transport timeout**, so geometry claims rely on the successful separate viewport rerun. Long shots show initial lazy/scroll-reveal states, not all below-fold final artwork.
- 55 mobile detail routes = all11 projects ×all5 locales, real touch/mobile Chromium390×844: no errors, no overflow, all headings and narrative chapters present; protected screenshot filters remain clear. `after-cases-mcp.json`.
- Additional header geometry at801/900/1024 across all5 locales: zero positive overflow and no header internal overflow.
- Menu: click, Escape/focus return, Enter→Tab to disclosed links, outside-pointer dismissal and page navigation. All5 languages keep select focus and correct direction. Final interaction suite has no failures/errors: `after-interactions-final-mcp.json`.
- EN→AR Bike Tower language regression was watched fail before fixing: y1600→1725. Final y1600→1600, focus remains select: `language-scroll-before-mcp.json`, `language-scroll-after-mcp.json` and final interactions.
- Worker: exactly one when active, advancing pixels/frame count; pause/resume, offscreen surface stops repainting, breakpoint resize, no Worker on About, reduced-motion transition terminates Worker and reveals portrait completely. Arabic reduced/low-power/controlled Worker-unavailable fallback creates0 Workers and displays the genuine still. DPR3 remains512×384 with1 Worker.
- Image-frame/UI screenshots were inspected directly; actual scroll recordings activate below-fold Home features and gallery. Source media and captions stay genuine or explicitly labelled conceptual as before.
- Canvas pixel-hash proof changed2309439421→4189256758 over800ms (frames1→11), verifying actual changing imagery, not just an incremented frame counter. Headless tab-fronting did not mark the other page hidden, so native tab-hidden behavior was not empirically established; hidden/pause scheduling is source-reviewed and pause/offscreen behavior is tested. See `pixel-hidden-proof-mcp.json`.

## Real recordings and screenshots

All recordings are browser-generated WebM at explicit viewport dimensions, not animation mockups:

- Original V1: `v1-en-1440-smoke-portrait.webm`, `v1-en-390-smoke-portrait.webm` (existing dist served read-only at8781).
- Pre-session V2: `before-en-1440-smoke-portrait.webm`, `before-en-390-smoke-portrait.webm`.
- Recovered V2: `after-en-1440-smoke-portrait.webm`, `after-en-390-smoke-portrait.webm`, `after-ar-1440-smoke-portrait.webm`, `after-ar-390-smoke-portrait.webm`.
- Actual tours: `after-scroll-tour-en.webm`, `after-scroll-tour-ar.webm`, `after-navigation-languages-mobile.webm`.
- Shader reference: `v1-v2-shader-reference.png`, same original geometry/time/density with V1 and editorial ramps.
- Images: `before-<locale>-<width>-<route>.png`; final viewport `after-<locale>-<width>-<route>-viewport.png`; hero/scroll/media/menu/static-mode examples indexed in the HTML review.

Root: `output/playwright/design-intelligence/`. MCP wrappers preserve executed code and results; screenshots/videos/raw traces are ignored local review artifacts, not published portfolio evidence. The local HTML reference and review tools are excluded from the production entry.

## Chrome DevTools MCP performance evidence

Direct installed DevTools MCP1.10.1 was invoked without npx/download. Direct tool trace export initially rejected this workspace's path configuration; the official local server was started with the actual V2 workspace to save traces. Seven raw `.json.gz` traces, result wrappers and frame probes are retained. `performance-summary.json` includes methodology and repeat-gap analysis.

Central15–75% of the actual1.35s portrait timeline, rAF intervals in milliseconds:

| Local run | Before p95 /max | After p95 /max | Observed LCP before→after | CLS |
| --- | --- | --- | --- | --- |
| Desktop1440 | 7.9 /14.0 | 7.2 /7.3 | 686→654ms | 0→0 |
| Mobile390 | 7.5 /28.2 | 7.8 /13.7 | 365→348ms | 0→0 |
| Mobile CPU×4 | 13.9 /15.9 | 27.8 /55.6 | 626→1251ms | 0→0 |

These local runs differ in cache/device/trace overhead and are **not** evidence of improvement in every condition. A fresh CPU×4 repeat retained max55.5ms /p95 34.8ms. Raw repeat trace shows a50.938ms RunTask containing a41.694ms GSAP animation-frame ticker call at portrait progress.6563. No smoke frame existed at that gap; primary trace first smoke was at2766ms, after portrait completion. Therefore this remaining short throttled gap is foreground GSAP scheduling cost, not confirmed smoke contention or the historical25%-freeze. PerformanceObserver central-task counts alone missed the borderline raw repeat task; the report retains the raw evidence.

The prior session's historical CPU×4 freeze approached493ms and inconsistent inset interpolation. Fresh current baseline already had the unit/decode repair and did not reproduce that freeze. This session preserved it; it does not claim to have newly fixed a bug already repaired.

Startup tasks remain (up to595ms in the main after CPU×4 sample) before the portrait clock. Foreground mask animation cost under slow CPUs is a residual optimization item; replacing the excellent reveal with a generic fade was explicitly excluded. Hardware GPU contention/driver behavior cannot be certified from local headless Chromium. Background is capped separately at12/8fps; the UI is not globally capped.

## Recoverability and preservation

Verified pre-edit archive: `output/checkpoints/design-intelligence-before-2026-10-13-123337.zip`,618 files with SHA manifest and CRC verification. No reset or deletion. Original V1 source/runtime hashes remain identical.

Final preservation check:607 existing source/assets/skill files byte-identical; only8 existing files changed in the authorized scope; no missing/unexpected files. Python-generated cache entries are excluded from that comparison. `preservation.json` lists the exact changed files. Extensive previous uncommitted work remains in place; no commit is implied.

## Failures and limits retained

- Exact-source test and language regression were intentionally red before their corresponding changes, then green.
- The first interaction script used a descendant selector for a link whose data attribute was on the link itself; corrected after inspecting real DOM. No application workaround.
- A subsequent test treated negative overflow (-15px scrollbar clearance) as failure; corrected to reject only positive overflow. Final suite passes. True touch/mobile cases separately report0.
- Full-page batch transport timeout was recovered with56 successful viewport captures/measurements. Do not imply the timed-out MCP call itself passed.
- Existing preview/README.md contains non-UTF8 bytes; an attempted additive patch was rejected atomically and the file was left byte-identical. Current continuity and measurements are in PROJECT-HANDOFF.md instead.
- Brand asset validator rejects this repository's naming/manifest conventions; token scanner reports intentional legacy/layout/shader values. Those tool-policy mismatches are documented, not silently normalized.
- No physical iPhone/Safari/Firefox run, human screen-reader certification, field Web Vitals, published SEO/deployment, or authored Rive success path is claimed. Language pixel restoration naturally clamps on shorter translated pages.
- Broader gallery/case/profile/contact scale and typography issues remain in the prioritized roadmap and require visual approval before implementation.
