# Motion, case story and journey implementation plan

> Required execution skill: superpowers:subagent-driven-development. Fresh task owners and final independent review; no commits without owner request.

**Goal:** Implement the approved viewport entrances, complete case-body redesign and compact Experience hero/body, then complete visual and interaction QA.
**Architecture:** Scoped page components/styles plus one persistent observation hook; page-owned interaction timelines; existing router/themes/shared-media pipeline.
**Stack:** React19, TypeScript, Vite, GSAP3.15/Flip/MotionPath, native IntersectionObserver/dialog/details.
**Spec:** docs/design/MOTION-CASE-JOURNEY-SPEC.md

## Global constraints

All constraints in the approved spec bind each task. V1 read-only. No commits/push/deploy/clean/reset. No new dependencies or claims. Eleven projects/five locales. Existing case hero and image flight immutable. Existing semantic palettes/fonts. New motion has no ScrollTrigger and honors focus/reduced motion/lifecycle.

## Review focus

1. Rapid gallery selection before decode completes must settle latest selection.
2. Browser Back/deep restoration must show content immediately and leave no animation clipping.
3. Reduced-motion changes during a running timeline must restore static readable content.
4. Arabic/native keyboard and320px/iPad landscape must avoid overflow/covered controls.
5. Protected case hero/source media must remain byte/geometry-equivalent; no double motion ownership.

## Tasks

- [x]1. Global arrivals: create viewport-arrivals.ts, safe page group registration, owned observer/timeline lifecycle, integration hook in LightPortfolio. Preserve page-specific animations. Verify normal/reduced/focus/route behavior.
- [x]2. Case body/gallery: keep SignatureCaseStudy opening block untouched; redesign body in case-body.css and extracted components as necessary; improve CaseMediaGallery; replace body motion in case-motion.ts with observation. Verify all11 cases and gallery interruption/fullscreen/focus.
- [x]3. Experience: replace Journey export with ExperienceJourney module; original facts/assets; new experience-journey.css/motion; no other page profile behavior changes. Verify disclosures/card controls/reduced motion/layout.
- [x]4. Integration: root includes Experience atmosphere, import final scoped styles, fix evidence-backed common hero sizing excluding case hero; add critical meaningful regressions after baseline failures; inspect React lifecycle/a11y.
- [x]5. Full QA: commands, production viewport matrix, screenshots/contrast/keyboard/history/flight/media/performance. Fix actual findings, independent review, update MASTER/HANDOFF and verification record.

## Execution rulings

Owner approved this direction and execution in the current conversation; do not ask to reapprove this spec. Work stays in the user's running V2 checkout so the actual5176 site updates and existing uncommitted work is preserved. Verified recoverable preimplementation checkpoint: design-intelligence-before-2026-10-15-104424.zip (871 files). Do not run Git commit/worktree cleanup steps from generic skill templates; repository instructions prohibit them without explicit request.
