# Atelier — luxury technical portfolio verification

Completed14 October2026 (Asia/Riyadh), following work started13 October. User accepts Product Signal and requests luxury/refined/technical colors, a suitable personal-photo position and work on the remaining pages. This explicitly expands earlier Home-only scope. Active contract: design-system/hashem-portfolio-v2/MASTER.md and docs/design/ATELIER-LUXURY-SPEC.md.

## Result

Graphite/champagne/warm ivory/petrol across V2. The accepted Home composition and route-owned GSAP are retained with warmer surfaces. Genuine portrait remains immediately visible there; About now has a dedicated framed portrait beside actual professional identity/introduction. Employer chronology uses dossier cards, Skills uses grouped tools/real project evidence, Contact has a direct-channel panel and ivory native draft form. Both project galleries and all eleven existing tailored case compositions share the identity.

Working Home: http://127.0.0.1:4176/preview/ar/. About: /preview/ar/about/. Viewer: http://127.0.0.1:5176/preview/atelier-review.html. Screenshots/recordings/traces: output/playwright/atelier. The viewer supports six pages and a case, EN/AR, laptop/mobile, historical before captures and two actual browser tours.

Checkpoint before edits: output/checkpoints/design-intelligence-before-2026-10-13-185004.zip,688 files with verified ZIP/SHA-256 manifest. Prior Product Signal QA archived at docs/design/PRODUCT-SIGNAL-QA-2026-10-13.md. Previous master archived at docs/design/PRE-ATELIER-MASTER-2026-10-13.md. Original Product Signal evidence remains preserved.

## Implementation and factual boundary

Existing product-file changes: preview/brand.css (shared semantic colors), preview/main.tsx (CSS import), preview/LightPortfolio.tsx (scoped luxury root), preview/ProfileSections.tsx (About portrait/header), preview/brand.test.mjs (test name reflects palette). Added preview/atelier.css. Existing Home/GSAP/router/gallery/case/profile/form behavior is retained. New portrait uses PROFILE_IMAGE and localized real identity/alt/location; no dictionary or media facts changed.

Local UI/UX Pro Max search returned luxury dark/gold colors but Apple Liquid Glass/fashion font guidance; those platform mismatches were rejected. One style retry returned active Minimalism & Swiss Style. Applied its grid/readability/contrast/performance guidance, retained existing self-hosted Instrument Sans/Geist and Arabic Tahoma/Arial, and added no font/dependency/generated media.

## Verification commands and evidence

- npm run typecheck: passed.
- npm run build:light: passed,170 localized route shells. Final index-DKxD7Xzv.js428.02kB/gzip144.14kB; index-DCUxGSQI.css179.78kB/gzip28.33kB. Shared application/other routes are included in this bundle.
- npm test:8/8; node --test preview/*.test.mjs:18/18; npm run validate:content:14/14. Generated dictionaries remain unchanged.
- Playwright MCP preview/atelier-audit.browser.js:196 route/locale/viewport states. Six pages at320/768/1366 across five locales; additional390/1920 EN/AR; all eleven cases across five locales; creative cases/gallery coverage. One h1, correct theme, no horizontal overflow or clipped tested headings/prose/fields/controls, no runtime/network failures or sampled text-contrast problems. route-audit.json.
- Production preview/atelier-interactions.browser.js:57 checks. About portrait/native chapter focus/toolkit disclosure, both URL families/five language switches, real four-employer chronology/details, skills categories/project links, selected filter contrast/case/Back restoration, actual dialog caption/Escape opener restoration, native draft/status/edit invalidation, mobile menu/focus, RTL and equivalent200% reflow. interactions.json.
- Existing Product Signal interaction suite rerun on current production:46 checks. Immediate portrait, Home motion progression, responsive trigger removal, live reduced-motion cleanup, native case/Back/menu/languages/CV. home-interactions.json. Total103 browser interaction assertions.
- Final filter improvements retested in30 states: both gallery families/five locales/320,768,1366. Every filter is at least44×44px; no horizontal scrolling. filter-targets.json.
- Final six-page screenshots recaptured on production at EN/AR390/1366 after corrections. Case screenshots settled after real h1/module/font/image readiness. Actual dialog caption captured at final-lightbox-caption-1366.png.
- Actual Chrome DevTools MCP: node preview/atelier-performance-mcp.mjs all atelier-final. Separate load and native-scroll traces saved; script uses already-installed official MCP, with no package installation. Isolated from recording/capture workloads.
- Native Playwright recordVideo tours at1366×768 EN and390×844 AR. Actual Home motion, shared navigation, About portrait, career detail, skill anchor, project filter/case and local email draft. No email application opened/message sent. Two recordings decode at25fps,27.44s/25.32s. Viewer playback/late seeking and image selectors verified without page/media/HTTP errors. recording-metadata.json, viewer-playback.json.
- python scripts/verify-atelier-evidence.py:688-file source audit, same HEAD, equal-density source pairs, real video-frame decoding, performance and contrast summaries. Facts/media/dependencies and existing motion/router behavior files are unchanged.

## Production lab measurements

| Mode | LCPms | CLS | Running entrance max/P95 gapms |
| --- | ---: | ---: | ---: |
| Laptop1366 |580|0|13.4/7.2|
| Mobile390 |332|0|13.7/7.1|
| CPU4 |1060|0|34.7/20.8|

Sequential profiles reuse the browser/cache; no network throttling. Startup/setup long tasks remain in raw reports, including CPU4 tasks up to207ms. These are local Chromium measurements, not universal60fps or field-performance claims.

## Self-review, fixes and practical limits

Read-only reviewer found two P2 token regressions: dialog captions inherited the newly dark legacy --white token, and selected filter counts remained grey on champagne. Corrected the actual .case-image-viewer selector/ivory caption and readable count foreground; real production dialog/filter tests confirm results. Form boundaries were darkened to exceed3:1; category-nav padding is stable in every active state. Gallery filter padding/count size was increased and retested across30 states. Reviewer rechecked fixes and found no remaining P1/P2.

The first matrix helper waited on hidden lazy images indefinitely; this was a QA synchronization issue. Closed only the owned test tab, excluded zero-size images and bounded decode waits, then reran successfully. A first portrait assertion ran before decode completion; actual image was720px/eager/visible, and the test now waits for decode. A strict creative-filter foreground equality assertion was replaced with actual contrast validation because both dark foregrounds were readable. A premature blank case screenshot was replaced by settled evidence. The local dev service stopped once; it was restarted hidden on5176, with logs saved locally. Production4176 remained available.

Independent About/portrait board was captured before implementation. Source/actual comparisons preserve palette, image and composition, with real longer dictionary copy, native select/menu and correct variable-font rendering as accepted differences. Other pages are original route treatments, not copies of absent visual references.

Tests use Chromium/Chrome and viewport emulation, not physical devices/Safari/Firefox. Text-contrast sampling covers visible regions and measured pairs, not a complete WCAG certification. Equivalent-width200% reflow is not OS zoom testing. No commit/push/merge/deploy, V1 edits, new professional claims or generated/altered project assets.
