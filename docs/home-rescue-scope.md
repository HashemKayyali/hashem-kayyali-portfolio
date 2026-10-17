# Home visual rescue — 13 October 2026

Worktree: `site-v2-light-burgundy`, branch `codex/portfolio-v2-light-burgundy`, base `6a1ae32`.
Safe pre-edit checkpoint: `output/checkpoints/home-rescue-before-2026-10-13-103727.zip` (425 files, SHA manifest verified).

## Screenshot-first findings

- 1920 desktop: actual Home container 1200px, 360px side margins; portrait 470 × 528px; navigation 12px and technical summary 11px. The name dominates supporting information.
- 390 mobile: actual container 350px, portrait only 122 × 210px, squeezed beside the identity. 320 mobile shrinks it to 104 × 192px.
- The old Home smoke implementation adds a radial density envelope and a grey highlight ramp, replacing much of the original V1 domain-warp detail. Screenshots show broad grey/ink blobs.
- Before recordings and traces show real entrance stalls, not just recording preroll. Desktop cold trace: 195ms forced layout inside GSAP CSS initialization, 274ms task in fluid-renderer IntersectionObserver startup, and 382/257/285ms rAF gaps during the Hero.
- The old portrait inset is still 91% at master progress .265, .466 and .658; it only clears at the end. Start/end inset strings have inconsistent zero units. Preserve the side wipe, correct interpolation.

## One direction and bounded implementation

1. Home-only 1320px responsive grid, readable labels/body/actions, 560 × 620 portrait on large desktop, a full-width professional portrait on small mobile. Keep the existing editorial faces and Arabic family.
2. Use the original V1 nested q/r domain warp, radial twist, ribbon and fold equations. Ramp only warm paper and exact #58152D. One shared Home worker compiles/renders away from UI thread. Background frame budget is separate from the UI's 60fps target; reduced motion / constrained devices use a genuine shader still.
3. Keep the original 91% directional portrait mask, 1.1s power3.inOut wipe, 1.065 scale / 1.35s image settle. Normalize all inset units, decode the portrait before its local reveal, keep the rest of the Hero readable immediately. Split name once before entrance when the font is ready; no asynchronous line measurement mid-reveal. Remove duplicate Home font/image ScrollTrigger refresh ownership.
4. Preserve the three authentic featured-project compositions; enlarge their imagery and supporting typography, unify spacing and detail scale. Refine only existing About, career/skills highlights and closing CTA.
5. Match EN/AR before/after 1440,1920,390,320 screenshots, real normal-motion entrance/scroll recordings. Compare DevTools cold/warm desktop, mobile and CPU4 traces. Verify reduced motion and five locales, Home navigation and frozen source hashes.

## Frozen next-stage issues

Projects Gallery and case pages were captured but not redesigned. Gallery at1920 inherits the narrow 1200px frame; the three featured entries have highly unequal image/text scale and the large title consumes much of the first screen. Bike case hero remains centered at1200px with a very large title, small labels and little relationship between heading and overview; its long chapters need a separate rhythm/legibility pass. Terminal mobile details need their own imagery/caption and metadata balance review. See `output/playwright/home-rescue/frozen-*.png`.

Approved locale data, project assets, fonts, SEO sources, routing, Gallery and case hooks/styles remain frozen. No V1 edits, push, merge or deployment. Final Home presentation is a review candidate, awaiting the user's visual approval.
