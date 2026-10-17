# Overnight Projects experience — implementation / checkpoints

User authorizes autonomous implementation and reasonable decisions within the approved V2 design, followed by final review. Work only in the existing V2 checkout, no V1 edits or integration/deployment. Existing Home and editorial typography verified complete from the production build and previous evidence.

## Direction

A product exhibition: a large typographic opening, one composed sticky scene containing the three genuinely featured projects (Bike Tower, Terminal NFC and Eventies), followed by eight individually weighted editorial exhibits. The complete collection remains discoverable via category filters and a compact project index; no duplicate generic card grid. Mobile reflows into purpose-designed image-led stories, without sticky/pinned dead space. All copy/metadata joins existing dictionaries/assets; illustrative/protected media remains labelled.

The approved Sticky Grid Scroll reference informs a single short CSS-sticky stage, column reveal, scale/offset choreography and shared GSAP timeline. Native scrolling, no scroll hijacking, no auto-navigation. D1 informs staged clip-path/image continuity with decoded intent-only image preloads and route-owned transition cleanup, not its rainbow shader or auto-next behavior.

## Milestones

- [x] 0: branch/status verified, typography/Home completed, baseline source checkpoint saved.
- [x] 1: capture baseline; implement exhibition and category filters, persistent discovery state and keyboard access.
- [x] 2: shared gallery/detail image continuity, back/forward restoration, Next/Previous and lifecycle cleanup.
- [x] 3–4: Deep Burgundy tokens, selected fonts/Arabic preserved, responsive typography/motion polish.
- [x] 5: actual Playwright MCP screenshots/videos/functional flows, Chrome DevTools MCP performance, TS/build/content/SEO/regressions.
- [x] 6: visual self-review/corrections completed; final review-package browser validation passed, with source checkpoint recorded alongside the baseline.

References: https://tympanus.net/Tutorials/StickyGridScroll/ and https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/

Baseline: output/checkpoints/projects-before-2026-10-13.zip and manifest, recoverable locally and withheld over HTTP.

First actual normal-motion workflow: gallery R&D filter → Bike Tower, one shared image during arrival, zero after completion; back-link preserves filter and scroll, no stale triggers or page errors. Before implementation the same browser Back flow reset the filter to All.

Files: ProjectGallery.tsx / project-gallery.css (composition), gallery-motion.ts (one stage and viewport-owned exhibits), gallery-memory.ts (validated locale-specific discovery state), project-transit.ts (one cancellable image transition and bounded image intent cache), main.tsx/PageShell.tsx/route-motion.ts/case-motion.ts (shared navigation integration). Obsolete Projects rendering removed from PortfolioSections.tsx; Home remains its existing renderer.

## Final corrections and verification

Read-only code review found four ordinary-flow issues: consecutive gallery history entries, index-origin keyboard focus, destination geometry while the ancestor moves, and filtering during image arrival. Corrected each; also validated obsolete history filters before readiness gating. Seven actual MCP browser regressions passed, including live reduced-motion switching and rapid header cancellation.

Removed duplicate global font/image ScrollTrigger refreshes on gallery/case routes; their dedicated hooks own readiness. The existing pure route exit helper was extracted into route-exit.ts so the pre-existing real GSAP context ownership test can run in Node without importing browser/JSX modules. No animation design changed in that extraction.

Playwright MCP: 30 five-language/viewport/motion layout combinations, ten locale/device workflows with all six filters, 55 direct case routes; zero page errors. Production build and TypeScript passed; content 14/14, compatibility canonical SEO 11/11 and active V2 route SEO 85/85. Eight root Node regressions and sixteen V2 tests passed.

DevTools MCP before/final load samples: desktop LCP 453 / 421 ms; CPU 4× mobile 1930 / 1991 ms, CLS zero throughout. Earlier new-gallery mobile samples were 1639 and 2268 ms: individual local samples vary and LCP elements differ; no general speedup is claimed. Three-second idle samples have zero long tasks, and offscreen fluid paints are zero. Warm case opening/return still has occasional CPU 4× mount tasks (332 ms maximum in the final interaction sample). Larger desktop imagery has an explicit initial byte cost; mobile uses three responsive image requests versus six before. Full raw values/conditions are preserved in the review report.

Baseline hash comparison checked 403 source files: only the eight intended integration/test files changed, no unexpected differences. Approved dictionaries, project assets, fonts, Home styling and case-study layouts remain unchanged. V1 is clean, V2 branch/HEAD unchanged. No push/merge/deployment.

Late pixel-level review caught an opaque fluid layer covering some RTL filter labels and an unbroken German headline clipped by the gallery boundary. Raised the filters above the field, kept supporting copy on a quiet paper surface, restricted the field height, fitted the German title and anchored authentic web imagery to its readable left edge. Thirty additional final paint/heading checks passed across all five locales, three widths and normal/reduced motion.

Review: preview/projects-review.html. Report: output/playwright/projects-upgrade/results.md. Before/after screenshots: 51; real normal-motion recordings: 12 (four baseline, eight final). English/Arabic 1440/390/320 and German/French/Spanish 320 previews included. All 12 recordings play, 12 comparison selections and detail images decode, review page fits 1440/390/320, preview links return 200. Baseline fixture 4177 stopped; built app 4176 and review/dev server 5176 remain available. Source baseline and final checkpoints are recoverable under output/checkpoints and withheld from HTTP.
