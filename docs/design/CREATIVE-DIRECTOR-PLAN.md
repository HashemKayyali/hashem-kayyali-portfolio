# Creative director review — 13 October 2026

Owner brief: correct approved V2 responsive geometry, then build ONE separate fully working Creative Lab. The new brief explicitly authorizes widening the composition and exploring a new layout within the established identity; earlier narrow-scope constraints in MASTER are superseded only for this review task. V1 remains read only. No publication, dependencies or generated imagery.

## Shared rules before implementation

Direction: Engineering exhibition. A wide editorial canvas, a concise identity opening, an architectural portrait window and an evidence rail. Physical products get photographed stages; software gets restrained application frames; confidential systems get text-led entries with small existing explanatory diagrams. Eleven genuine projects, five dictionaries, no new professional claims.

Use the existing paper / Wine palette and Instrument Sans / Geist / Tahoma. Full-width composition gutters: 16px laptop, 24–40px desktop, 12–16px phone. Reading columns retain a 60–70ch ceiling. Body 16–18px; labels 12–14px. No global scaling. Laptop portrait ~420px approved / ~380px Lab; display names ~80–90px. At large widths expand the grid and evidence rail, not the text measure. Arabic joining and logical layout remain intact.

Approved V2 gets geometry-only CSS after the existing cascade. Creative Lab gets explicit `/preview/creative/<locale>/` routes and scoped styles, a new Home and Gallery, and the existing accessible shared navigation/cases/profile pages. Route and locale state have one owner. Native links, Back, filter restoration, focus and locale scroll preservation remain valid. Portrait wipe and exact V1 shader stay; no pinning in Lab and no new animation framework.

## Skill decisions actually applied

- UI UX Pro Max: local searches `editorial asymmetric portfolio`, `responsive typography navigation`, `scroll reveal reduced motion`, `performance layout effects`. Adopt asymmetric grid, restrained type hierarchy, readable line measure, native scroll, scoped cleanup, reduced motion and keyboard focus. Reject generic black/white palette, alternative fonts, brutalist colors, five-layer parallax and pinned complex presets.
- Design system: primitive colors stay in brand.css; shared responsive geometry tokens feed component sizes. New Lab component styles alias existing tokens.
- UI styling: semantic controls, 44px touch controls, responsive grids, shrinkable columns and visible focus. Retain plain CSS / React; no shadcn/Tailwind migration.
- Brand: same verified identity, eleven projects, truthful status/captions; no invented award/client/metric.
- Design + frontend design: independent static art-direction board with real assets precedes the new React composition; deliberate varied frames and hierarchy instead of a uniform card template.
- Responsive design: width AND height-aware laptop geometry, content reflow for 320/390, broad desktop canvas, natural RTL and long German labels.
- Product design QA: before/after viewport evidence and independent source-board comparison; fix material findings, recapture and record iterations in root design-qa.md.

## Implementation and verification

1. Verified ZIP checkpoint of existing work; collect Home/Gallery EN/AR baseline at all eight required sizes.
2. Correct approved V2 geometry; inspect representative actual case/profile layouts; typecheck and preview tests; milestone checkpoint.
3. Capture a static design board at 1366 and 390 before implementing Lab; add isolated routes with round-trip tests, new Home/Gallery and bounded scoped motion.
4. Build production preview, compare eight sizes EN/AR; exercise every project, all five locales, filters, navigation, Back, language scroll, focus, reduced motion and zoom. Fix material defects.
5. Actual GSAP videos, foreground frame probe and Chrome DevTools load/scroll traces. Review startup work separately from portrait reveal; do not infer a hardware guarantee.
6. Read-only peer review after shared rules and implementation; address defects. Final checkpoint and evidence report with actual results and remaining limitations. Lab promotion awaits owner visual review.

Definition of done: two independently reachable local experiences; all real content retained; critical journeys work; required viewport evidence, videos and measured performance exist; relevant checks pass or clearly documented failures remain. No claim of completion based on screenshots alone.
