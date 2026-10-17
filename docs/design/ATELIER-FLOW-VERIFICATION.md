# Compact folios and transition readiness — 14 October 2026

Scope: owner explicitly requests a different Projects collection, smoother language/filter/page transitions, smaller evidence viewer and redesigned detail related projects. The existing collection hero must remain. Current graphite/champagne/petrol and Libre Caslon Condensed/Almarai retained. Spec: `ATELIER-FLOW-SPEC.md`.

## Recoverability and preservation

Checkpoint `output/checkpoints/design-intelligence-before-2026-10-14-131007.zip` plus manifest: 739 entries, ZIP rechecked, no missing baseline files. The Projects hero markup is exactly identical to this checkpoint; new CSS does not target that hero. Dictionaries, assets, package files, approved facts/privacy and V1 are unchanged. No dependency install, commit, push, merge or deploy. Existing dev5176 and production4176 servers remain running. Existing live site is the review surface; no new comparison/review site or screenshot/recording deliverable.

## Design and motion

- Alternating wide horizontal folios for Eventies/Bike Tower/Basket Beats/Terminal, then compact three-column work; filtered collections three columns, tablet two, phone one. No section of duplicated selected studies, eleven real projects preserved. Native-ratio cover frames and all approved summaries/status/technology stay accessible without hover.
- Compact wrapping filter index, active state, contextual count, 44px targets and focus. GSAP Flip captures the current live position before settling an interrupted animation. Eleven actual project nodes remain mounted; filtered nodes are inert/hidden, and leaving/entering nodes fade while retained cards change position. Filtering no longer tears down/recreates the gallery hook or refreshes every ScrollTrigger. Resize, focus, reduced motion, locale change and unmount settle/clean up owned motion.
- Locale transition fades translated surfaces out in 180ms, waits for dictionary/font preparation and reading-position restoration, then fades in over 280ms. Two RAFs expose the true zero-opacity first frame before playback. The smoke stays mounted. Header/photo/footer translated surfaces participate; they remain stationary for ordinary Home/About navigation. The selected case gallery image now survives locale changes.
- The evidence desk is bounded at 1080px wide and 240–390px high, with complete images, compact horizontal thumbnails, previous/next/Home/End/RTL support and full-size dialog/Escape focus. Related projects are two small directional dossiers. Umniah's related preview uses the already-approved public architecture SVG rather than squeezing an unreadable text diagram into a thumbnail; its illustration label remains accurate.

## Reproduced defects and fixes

Before implementation, locale content opacity never changed (minimum1 for both dictionaries), filtered-out Bike Tower unmounted/recreated, and the evidence stage measured532.8px at1440. The new browser probe reproduces these before the change and passes afterward. A real-GSAP unit test failed because locale exit translated the reading surface; it now verifies fade-only motion and cancellation restoration.

Important image-arrival defect: delaying the original Eventies cover by1700ms at390px produced110 sampled blank frames after the shared image disappeared. Arrival previously waited for geometry, not image decode. The shared image still walks with the same frozen texture and 560ms transform path; now it stays at the destination until the real image decodes, then hands off over120ms. It follows the target on scroll while waiting. If the destination fails or exceeds4s, the authentic cached source cover is used as a safe fallback. Resize/reduced-motion/navigation cancellation remove the clone, timeout, scroll listener and hidden-target class.

QA additionally found an old `grid-column:auto!important` rule overriding the mosaic, a long related-project title overflowing at320, and persistent header/photo opacity0 when reduced motion interrupted a locale entrance. Scoped rules, shrinkable wrapping title and explicit static-state restoration resolve them. The GSAP runtime supports soft capture (`kill:false`); its bundled TypeScript interface omits that field. A typed options variable handles this without `any`, casts or dependency updates.

## Commands and browser evidence

- `npm run typecheck`: passed after the options typing correction.
- `npm run build:light`: final exit0,170 localized shells. Entry JS461.03kB/gzip156.77; CSS265.55kB/gzip38.13. GSAP Flip accounts for the added runtime; no package changes.
- `npm test`:8/8; `node --test preview/*.test.mjs`:19/19. `npm run validate:content`:14/14.
- `atelier-flow.browser.js`: final fade minimum0 for old/new dictionary, final opacity1/trigger focus; retained card identities and101 transform states; evidence height388.8px at1440.
- `atelier-flow-matrix.browser.js`:54 final production states pass. EN/AR320/390/1440/1920; DE/FR/ES390/1440; all eleven related-project areas additionally tested at320 in EN/AR. No page/card overflow. Four rapid 55ms filter sequences settle with11 active nodes and no inert/absolute/invisible leftovers.
- `atelier-image-readiness.browser.js`:342 final frames sampled with1700ms delayed cover,0 blank frames, decoded visible final image and no overlay.
- Locale probe: Home/About/Projects/Eventies/Contact EN→AR preserve reading/focus and finish visible. Deep Eventies retains image3/5 and its gallery reading position. Reduced motion during the fade restores stage/header/photo to opacity1 and idle.
- `atelier-continuity-interactions.browser.js`:10 final groups pass, including eight Home/About round trips at four EN/AR widths. Same DOM photo/canvas, photo/smoke rectangle delta0px, one document, no stuck rapid navigation, reduced motion supported.

- `atelier-exhibition-production.browser.js`:18 groups pass. Six filters at four EN/AR widths; four shared-image/Back round trips preserve filter, origin focus and scroll (0px error), with79–81 image transforms, no repeated title choreography, one document and no residual overlay. Six actual GSAP evidence transitions preserve native ratios, full-image frames, one visible slide, reduced-motion interruption and dialog Escape focus.
- Additional failed-cover request probe: destination promotes the real cached Eventies640px thumbnail, fully decoded, no overlay or hidden-target leftovers. Projects EN→AR→DE→FR→ES→EN finishes at opacity1, trigger focus, one document and zero overflow; menu End/Escape restores trigger focus.

## Runtime measurement and limits

Native DevTools trace on actual production1440×1000, CPU1x/no network throttle: four filters plus Eventies/Back. Before the last filter optimization, traced796 RAF intervals p9513.6ms/max104.3ms and76/50/63ms long tasks; ForcedReflow insight reported47ms. An immediate untraced filter sample gave525 intervals,p957.2ms/max28.2ms and no long tasks. The trace tool retains an older URL label; actual evaluated URL/script hash establish the tested route. Programmatic click/route probes reported CLS1.87, including deliberate collection reflow without native recent-input flags; that is not presented as field CWV.

Follow-up optimization: only departing cards use absolute positioning; retained cards stay in the grid. Duration360ms with8ms stagger bounds the filter transition, and the active dot always reserves space so labels do not shift. Final native Playwright clicks at1440:428 intervals,p957.2ms/max27.9ms, no tasks≥50ms, CLS0 with six recent-input shifts excluded. Final untraced Chrome Eventies/Glitzz plus Back sample:1082 intervals,p957.2ms/max27.7ms, no long tasks, one document and zero overlay leftovers. A fixed-time first timing actor queried the second link before Back was settled; rerun waits for the settled gallery and stops sampling in finally. Native trace data stays in MCP; no raw trace export/file is claimed.

These are bounded local Chromium measurements. The traced spikes and hardware/network limits remain documented; no universal60fps/zero-jank guarantee is made.

## Research and inspection

Official GSAP [Flip](https://gsap.com/docs/v3/Plugins/Flip/), [getState](https://gsap.com/docs/v3/Plugins/Flip/static.getState%28%29/), [context](https://gsap.com/docs/v3/GSAP/gsap.context%28%29/) and [refresh](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh%28%29/) informed layout transforms, owned cleanup and avoiding unnecessary refresh. Local UI Pro Max Flip/filter searches found no verified preset after retry; official docs were used. Local Cancellable State Transitions/React cleanup guidelines matched. React review covered owned listeners/timers/contexts, stable IDs, effect dependencies, native control semantics and Vite-specific applicability; no Next-only migration.

Chrome DevTools actual visual inspection:1440 English collection and1920 Arabic collection,390 Arabic evidence desk, related-area/mobile checks. Complete covers, correct ordering, readable copy, wrapping labels and localized native controls checked. Local/emulated Chromium results are not guarantees for every physical GPU, refresh rate or network. Remaining measured timing limits belong in the runtime section, not a claim of universal zero jank.
