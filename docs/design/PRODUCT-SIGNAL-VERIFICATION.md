# Product Signal — Homepage redirection verification

13 October 2026. Implements the user's critical redirection, superseding the prior Engineering Fieldnotes Home. Scope: Homepage only, both existing preview URL families and all five locales. Design authority: `docs/design/PRODUCT-SIGNAL-SPEC.md`.

## Result and review

Immediate genuine portrait; cream, cobalt, forest, lavender and coral; asymmetric product-photo composition; masked name choreography; fanning evidence fragments; scroll-linked image depth and overlapping desktop project scenes; drawn scope connectors; restrained magnetic button feedback; distinct engineering, career and contact chapters.

Built Home: http://127.0.0.1:4176/preview/ar/ and /preview/en/. Review viewer: http://127.0.0.1:5176/preview/product-signal-review.html. Evidence: `output/playwright/product-signal/`. Viewer includes 35 hero captures, project/chapter captures, a full Arabic mobile page and four unaltered browser recordings.

Checkpoint created before this redirection: `output/checkpoints/design-intelligence-before-2026-10-13-171934.zip`, 678 files, verified ZIP and SHA-256 manifest. Prior Fieldnotes QA retained in `docs/design/FIELDNOTES-QA-2026-10-13.md`; prior captures/recordings remain under `output/playwright/homepage-redesign`.

## Implementation boundaries

Application changes are `preview/EngineeringHome.tsx`, `preview/engineering-home.css`, `preview/engineering-home-motion.ts`, and Home-only portrait preloading in `preview/index.html`/`preview/prerender.mjs`. Existing route parser, header behaviors, dictionaries, project/profile data, case/gallery/about/contact components, dependencies and public assets are unchanged against this checkpoint. Documentation and local evidence helpers are additional files.

Motion uses GSAP/useGSAP with route-owned context, responsive matchMedia, guarded lazy IntersectionObserver setup, bounded image/font readiness, two paint frames before playback and explicit listener/frame/timer cleanup. Portrait opacity is never animated. Sticky layers use native scroll and static anchor markers. Narrow screens and reduced/constrained motion use ordinary document flow. Live reduced-motion changes revert all Home triggers/tweens.

## Verification

- `npm run typecheck`: passed.
- `npm run build:light`: passed; 170 localized route shells. Current output `index-BKpPjH_f.js` 427.47kB /144.03kB gzip and `index-B8KOCzbN.css` 163.57kB /26.08kB gzip. Existing shared application/code for other routes accounts for part of these bundles.
- `npm test`: 8/8 passed. `node --test preview/*.test.mjs`: 18/18 passed. `npm run validate:content`: 14/14 passed; generated locales remain a no-op.
- Playwright MCP `preview/product-signal-interactions.browser.js`: 46 checks. Both Home families, five locale switches each, keyboard/source order, menu/Escape focus, genuine resume, real layer progress, dynamic responsive resize, media focus on mobile, native case/Back, live reduced motion and cleanup on exit. `interactions.json` contains results.
- Playwright MCP `preview/product-signal-capture.browser.js`: 35 viewport/locale states at320/390/768/1024/1366/1920/2560px. Immediate portrait is eager/high priority, opacity1 and visible within the first viewport in every state. Longest compact German state: top481.15 +height235 =716.15px within740px. Strict `scrollWidth-clientWidth` =0 throughout. No page errors, GSAP warnings or HTTP failures. `captures.json`.
- Actual Chrome DevTools MCP production traces: `node preview/product-signal-performance-mcp.mjs all signal-ready`. LCP, CLS, running entrance frame gaps, startup long tasks and real native-scroll traces are preserved. Exact final metrics are in `performance-summary.json`; raw traces remain available. Local measurements are not a universal frame-rate promise.
- Native Playwright recordVideo at1366×768 EN,1920×1080 AR,390×844 EN,320×740 AR. Four videos decode at25fps; durations and frame counts in `recording-metadata.json`. Real video frames are extracted into contact sheets. The initial recordings that exposed the entrance preparation jump remain in `initial-recordings/`.
- `python scripts/verify-product-signal-evidence.py`: current source hashes, unchanged Git HEAD, historical non-home UI comparison, equal-density source pairs, real video decoding, performance summaries and text contrast.

## Self-critique and corrections

The rejected design underused the portrait and offered mostly simple fade/translation motion. This redesign changes the hero, project browsing composition, section surfaces and motion architecture.

During implementation: fixed lost spaces in the name's accessible text; fractional horizontal scrolling; a null GSAP target on the NFC scene; the secondary preview covering footer/arrow details; language/nav visual order disagreeing with keyboard order; inappropriate mobile focus scroll correction; and lazy scene initialization skipped by a rapid scroll jump. The interaction suite first failed its actual layer-progression assertion; observing both markers and sticky articles resolved it, with real progress measured afterward.

Performance refinement: deferred lower-scene setup instead of initializing all animations during entrance, warmed animated media, constructed a paused timeline and waited two paint frames before playing. Real recordings then exposed a flash as visible fragments moved into their initial GSAP state. Matching waiting/preparing CSS now establishes that state before playback; the portrait remains visible throughout.

## Preservation and practical limits

Source manifest reports exact changed/missing file lists. No factual, media, package or unrelated page source changed. Read-only V1 shader/component SHA-256 values still match the preserved baseline: `1a72b2a1267887a19d6c19727e67ed84738998c8fe4c830892e7fdc1a972d45f` and `e386feb983c79fc79f884cfa64c3974f39fbc3c4a5fbcbed99411d2d226eb52a`. No commit, push, merge or deployment.

Historical screenshots: About and Arabic Contact remain pixel-identical. Gallery and Bike Tower Case match exactly outside the photograph region; photograph pixels differ slightly between capture contexts, while original media/source hashes and layout remain unchanged. The precise image-rendering/cache difference was not fully isolated; this is not reported as a four-page full-pixel match. `outside-scope-pixels.json` records the excluded media rectangles and exact result.

Tests cover local Chromium/Chrome and viewport/touch emulation, not physical phones or Safari/Firefox. The200% check uses equivalent-width reflow. CPU4 startup long tasks remain; reduced/save-data/constrained policy disables advanced motion. No artificial metrics, generated project media or new professional claims were introduced.
