# Signature Case Studies Implementation Plan

**Goal:** Extend the existing multipage V2 into a deep Burgundy, evidence-led engineering exhibition. The user's complete 2026-10-12 brief authorizes implementation and places visual approval after milestones A–D.

**Architecture:** Preserve React/Vite routing, dictionaries, shared media privacy mapping and existing GSAP. Add a route-loaded case-study component, project-specific presentation metadata (no duplicated professional facts), scoped motion, and a shared central palette. Use native scrolling and user-initiated navigation.

**Tech stack:** React 19, TypeScript, Vite, existing GSAP / ScrollTrigger / useGSAP, one shared fluid renderer. No new runtime libraries.

## Shared design rules
- Paper #FCFAF9; white #FFFFFF; ink #2D2428; primary #58152D; secondary #70203A; wine #3E1022; neutral warm surfaces. Official Apple imagery inspected as inspiration; these are portfolio tokens, not official Apple HEX values.
- Preserve Hero composition and three featured-project layouts. Replace pink-dominant fills, including fluid colors and static fallback.
- Use genuine project evidence and redacted derivatives. Approved dictionaries remain the only professional-fact source. New localized interface labels describe presentation, never new accomplishments.
- Editorial large imagery, readable ~65-character paragraphs, deep Burgundy markers, logical CSS for Arabic. No generic glass or badge walls.
- All motion owned by scoped useGSAP with cleanup; native scroll; no automatic navigation. Static readable reduced-motion mode.

## Review focus
- Direct details refresh, language changes, Back/Forward, and fast consecutive navigation preserve route, scroll and focus.
- All 11 projects and all five languages remain discoverable; filters must not strand items.
- Project screenshots use existing safeSource/mediaVariants mapping; dialogs restore focus and do not expose original private screenshots.
- Small 320px Arabic/German layouts, long titles, open Experience details and contact draft reset stay usable.
- No disconnected ScrollTriggers, excessive simultaneous fluid renderers, or hidden text in reduced-motion mode.

## Milestones
- [x] Checkpoint and capture the old palette/details before edits. Archive tracked and nonignored untracked files plus a SHA256 manifest without altering Git state.
- [x] A: Central tokens and shared shader/fallback. Verify contrast and live old/new comparison. Save a local checkpoint.
- [x] B: Route-loaded SignatureCaseStudy for Bike Tower, Terminal NFC and Eventies. Separate opening compositions, narratives, verified architecture/workflows, authentic media, challenges, technologies and previous/next closing. GSAP opening, masks, depth, progress and closing. Verify desktop/mobile/Arabic and safe media. Save checkpoint.
- [x] C: Refine About (all six paragraphs), Experience (all three Terminal roles), Skills (genuine project connections), Contact (all languages) and Projects index (adapted sticky collection, no scroll hijack). Keep data source single. Verify navigation/localization/keyboard/motion policy. Save checkpoint.
- [x] D: Tailor eight remaining case studies by product type and genuine evidence; expose every approved capability, consideration and narrative. No fabricated details for missing evidence. Save checkpoint.
- [x] Build/type/content/unit verification, real Playwright MCP videos and screenshots, Chrome DevTools traces and native-scroll observation. Compile review page with all routes and actual GSAP proof, performance limitations and remaining production limitations.
- [x] Stop for visual approval. No V1 changes, push, merge or deployment.

## Implemented review repairs
- Encoded /public and /@fs aliases cannot serve private originals; local checkpoint archives are also withheld. Built unsafe copies are removed without modifying sources.
- Cold lazy case fragments and history restoration wait for real route content and fonts; pending operations carry intent/route ownership and clean up. Actual RED scroll0 / targetTop1614.78 became scroll1510 / targetTop104.78, including reload.
- German320px long role title wraps inside the viewport; role hierarchy remains strongest on mobile.
- Eventies inset has explicit auto height with controlled aspect ratio; optional GSAP media targets are guarded.
- Independent React/privacy/route review closed with no remaining actionable blockers.

## Final performance investigation
- The preload-only attempt still allowed React.lazy to suspend on its first read; DevTools identified the short loading footer as the dominant cold-route CLS source. A shared case-loader now exposes the already loaded component synchronously. Initial detail loading and later navigation wait for this module before committing, while Home retains route code splitting.
- Rebuilt index-Bebr0YaR.js with85 localized route shells and55 project/locale detail routes. Fresh motion/navigation/privacy workflows pass9/9 after the loader change.
- Comparing CPU4x trace measurements with uninstrumented PerformanceObserver measurements; raw V8 API interrupt time is not automatically attributed to the fluid renderer.

## Final measured result
- Latest built source: index-Bebr0YaR.js,86 modules,85 localized shells /55 case routes.
- Shared loader repair: final Home/Bike/Eventies traces all CLS0.00; desktop LCP574/613/620ms; CPU4x mobile2353/2926/2658ms.
- No-Trace mobile observer comparison: Home median2324ms; Bike1584ms; Eventies3596ms. Native Bike scroll four long tasks, maximum105ms, no shifts/overflow. Remaining initial GSAP computed-style/layout cost is reported transparently, including intermediate slower traces.
- Review offers18 decodable actual recordings with before/after, mobile/RTL and actual GSAP registry; final report includes source paths and performance evidence.
- Implementation complete; visual approval is now the user gate. No V1 edits, push, merge or deployment.
