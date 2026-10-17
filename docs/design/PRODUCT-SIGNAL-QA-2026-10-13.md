# Product Signal — Homepage QA

**Source visual truth:** `preview/product-signal-board.html`, independently created and captured before rebuilding React Home. Source screenshots `output/playwright/product-signal/source-1366.png` and `source-390.png`. Active brief `docs/design/PRODUCT-SIGNAL-SPEC.md`; prior QA archived in `docs/design/FIELDNOTES-QA-2026-10-13.md`.

**Implementation:** local production Home, existing approved/creative URL families and five locales. Top of page, fonts/images decoded and actual `data-intro=complete`. Evidence isolated in `output/playwright/product-signal/`.

**Normalization:** CSS1366×768/DPR1 produces1366×768 pixels for both source and implementation; CSS390×844/DPR1 produces390×844 pixels for both. No resampling/device chrome. Combined `comparison-final-1366.png` and `comparison-final-390.png` were opened together. Equal-density focused `comparison-detail-1366.png` and `comparison-detail-390.png` were also opened together. Arabic/other locales are assessed against genuine content and responsive requirements, not represented as English-source clones.

## Comparison history and corrected findings

1. **Immediate identity [P1]:** rejected Home hid a late-loading portrait on mobile. Genuine portrait is now prominent, eager/high-priority and preloaded. Its opacity/mask is never animated.35 states confirm first-viewport visibility, including German320px.
2. **Typography/layout [P2]:** split masks initially concatenated accessible name text. Explicit spaces preserve the correct name. Scoped overflow-x:clip removes fractional horizontal scrolling while preserving sticky flow. Laptop name86px/gutters24px.
3. **Composition [P2]:** absent NFC secondary media caused a GSAP null-target warning; conditional setup resolves it. Secondary previews moved above footer/corner details. Three final scene captures show readable metadata and authentic imagery.
4. **Keyboard [P2]:** initial visual nav order disagreed with DOM Tab order. Language now visually precedes navigation. Sticky focus correction applies only to desktop keyboard targets actually obscured by a later card; mobile/native pointer focus preserves scroll.
5. **Actual scroll [P2]:** interaction run initially failed its real layer-progress assertion after a rapid jump. Observing both static markers and sticky articles initializes scenes after jumps too. Rerun confirms intermediate layer progress, responsive removal and cleanup on case navigation.
6. **Motion preparation [P2]:** all-scene setup produced a467ms CPU4 task. Lazy setup, bounded decode, paused timeline construction and two paint frames improve sequencing. Real recordings exposed a flash into GSAP start states. Waiting/preparing CSS now matches initial transforms/opacity; portrait remains unaffected. Earlier recordings preserved in initial-recordings; final clips recapture the correction.

## Required fidelity surfaces

- **Fonts/typography:** self-hosted Instrument Sans display/Geist reading UI, variable550 display weight and deliberate tracking. Arabic uses Tahoma/Arial, untracked and separately sized. English hero matches independent board. All locales wrap cleanly320–2560px.
- **Spacing/layout rhythm:** asymmetric hero with central portrait/fanned evidence; mobile identity/actions above portrait and two fragments. Three layered desktop project scenes, dark engineering chapter, compact real career, coral contact. Paired hero comparisons preserve the board's hierarchy. Functional actions are larger; roles retain authentic dictionary line breaks.
- **Colors/tokens:** paper#F4F3ED, ink#202823, cobalt#244CE8, forest#153F38, lavender#DCE0FF, coral#F58A70. Measured text ratios in contrast.json:13.60 ink/paper,5.50 muted/paper,6.41 white/cobalt,10.41 pale/forest,11.62 ink/lavender,6.30 ink/coral,8.75 muted/dark chapter. Focus cobalt on light surfaces/pale rings on dark scenes.
- **Images/asset fidelity:** genuine portrait, Bike Tower installation, Eventies screenshots, sanitized NFC interface. Existing ProductImage/StoryMedia privacy derivatives remain. Useful crops and subjects match source; no generated portrait, fake product or invented dashboard.
- **Copy/content:** actual dictionaries/profile/project data supply names, roles, scope, project summaries/technologies/status, career and contact. Approach uses the real analysis/engineering-decisions section title. No new metrics/clients/results/employment/credentials; source hashes preserve all facts/assets.

## Interaction, motion and regression evidence

35 viewport/locale states;46 browser checks; typecheck/production build;26 source tests and14 content checks. Native cases/Back, ten locale switch sequences, keyboard order/focus, mobile menu/Escape, real layer progress, live reduced motion, ordinary mobile flow, safe media and CV. No page errors, GSAP warnings or HTTP failures in capture matrix. Chrome DevTools MCP production traces include laptop/mobile/CPU4 and native scroll; summaries retain startup long tasks.

Four real Playwright videos at1366EN/1920AR/390EN/320AR, unaltered25fps. All four played in the actual browser, with advancing currentTime, correct native dimensions/durations and no media/page errors. Review image selectors decoded every project/chapter/full-page asset. Recordings include entrance, CTA/menu, layered work, engineering/contact. Initial versions retained as diagnosis evidence. Results: viewer-playback.json and recording-metadata.json.

## Accepted differences and limits

Native select/menu/Lucide controls replace schematic board glyphs. Larger44px actions, authentic role line breaks and caption spacing are intentional. Connector artwork communicates scope; it is not an invented technical diagram. Lower chapters are original compositions judged against the brief/real assets, not an absent full-page reference.

About/Contact historical captures are pixel-identical. Gallery/Case UI outside photographs is pixel-identical; photograph pixels differ slightly across historical contexts and precise raster/cache cause is not fully isolated. Media rectangles are explicitly excluded in this UI comparison; no four-page full-pixel claim. Exact source hashes preserve media, dependencies and unrelated page code.

Local Chromium/Chrome emulation, not physical hardware/Safari/Firefox. Equivalent-width200% reflow. Sequential final traces reuse browser/cache; earlier separate CPU4 trace offers a colder comparison. Startup long tasks remain, with no every-device60fps promise. No unresolved P1/P2 defects; broader-browser and photographic comparison limits documented.

**Implementation checklist:** complete — scoped Home, immediate genuine portrait, five locales, responsive layout, cancellable GSAP, native controls/keyboard/reduced motion, content/source preservation, build/regressions, paired visual comparison, real recordings and actual viewer playback. Final35 captures and46 interactions reran after the preparation-state correction.

**final result:** passed

Full commands/checkpoint/trace paths: `docs/design/PRODUCT-SIGNAL-VERIFICATION.md`.
