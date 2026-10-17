# Atelier cover deck and handoff —14 October2026

User-directed quality changes only; retained approved colors, fonts, smoke, RTL mirror and authentic assets. Recoverable checkpoint before changes: output/checkpoints/design-intelligence-before-2026-10-13-234508.zip (717 files). No commit, push, merge, deploy or V1 edits.

## Implementation

- Grouped hero role, name and description together so the tall adjacent portrait cannot distribute their mobile spacing. Measured390 English role→name5px and name→description7px; desktop description8px.
- One genuine cover per Home/Projects discovery card. All existing additional detail evidence remains. Native aspect-ratio reservation fixes lazy-image zero-height/layout changes without cropping.
- Balanced Home card columns, quieter shadow and fine metadata rules. Native sticky deck preserves scroll flow; route-owned GSAP scales earlier surfaces to.965 as the next card arrives.14px layer offsets, actual trailing content spacer and responsive card-height guard keep variable-height cards readable. Short landscape/reduced motion use normal flow; keyboard focus reveals obscured earlier cards.
- Shared-image arrival now waits for the new route's scroll restoration before measuring its destination. Fixed source texture and CSS box, transform-only travel, brief destination handoff and owned cleanup. The original deep-Home reproduction had zero moving frames because destination geometry was measured while still scrolled down; corrected reproduction travels to the actual settled image.
- Locale anchor capture selects the painted stacked card rather than an underlying overlapping card.

## Fresh verification

- npm run typecheck: exit0. npm run build:light: exit0,170 localized route shells. Latest asset index-1QcLXtO7.js431.33kB/gzip145.27kB; index-D48EftJ3.css222.67kB/gzip33.58kB.
- npm test:8/8; node --test preview/*.test.mjs:18/18, zero failures. No changed dictionaries/project claims; baseline hash audit confirms factual sources, dependencies, media and fonts unchanged, no missing baseline files.
- Playwright MCP preview/atelier-stack-check.browser.js:28 production route/viewport states plus3 responsive/reduced-motion checks, zero page errors or tested overflow. EN/AR Home320/390/768/1366/1920/2560; Projects and all three featured cases390/1366. Every discovery card has one image, additional detail galleries preserved, close text gaps, actual stacked layer order/GSAP progress verified.844×390 landscape uses readable flow; live reduced-motion toggling cleans and restores the deck.
- Playwright MCP preview/atelier-stack-interactions.browser.js: four actual Basket Beats handoffs EN/AR390/1366.74–78 distinct moving transforms; one constant CSS box; endpoint error below.01px. Native Back restores Home scroll within.81px. Painted-card locale anchor, keyboard visibility of obscured first-card CTA, resize settlement and latest header navigation pass. No surviving overlay/hidden target/inert stage; zero page errors.
- Additional production Eventies and Bike Tower handoffs EN/AR390:75–80 distinct moving transforms, visible detail endpoints and zero surviving overlays.
- Actual Chrome DevTools mobile390 Arabic hero visually inspected, as well as earlier English mobile/laptop covers and stacked deck states. No new review/comparison website, screenshots for delivery or recordings.
- Warm actual Chrome deep-Home Basket Beats flight:94 moving frames; max7.5ms/P957.2ms, fixed CSS box and exact destination. This is local lab evidence, not universal60fps certification. Earlier documented cold setup costs remain a limitation; physical devices/Safari/Firefox not tested.

One interaction harness initially used Playwright locator.click on a sticky language trigger; its automatic scroll-into-view changed the reading position before the native click. Repeated with actual viewport mouse coordinates: opening does not scroll, and translation keeps the painted Basket Beats card. No product workaround for this harness behavior.

Live dev: http://127.0.0.1:5176/preview/ar/ and /preview/en/. Built verification: http://127.0.0.1:4176/preview/ar/.
