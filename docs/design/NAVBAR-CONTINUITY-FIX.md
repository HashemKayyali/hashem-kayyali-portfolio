# Persistent navigation opacity — 14 October 2026

Owner reports intermittent disappearing navigation during page changes. Reproduced on the real production application: EN Contact → Arabic → Projects. Header/footer opacity1 after the language transition, then0 after the page change, while stageopacity1 and no active route timeline remained. This is a state restoration bug, not layout/display or a missing component.

Root cause: language exit intentionally leaves persistent translated shell nodes at opacity0. The reversible GSAP entrance captures that hidden inline style as its original state. Even after completing and clearing opacity, the entrance context later reverts to its captured zero when another route starts. Ordinary route entrance only animates the changing stage, leaving the shell invisible.

Minimal fix in `preview/motion.ts`: before recording a new reversible entrance, remove the owned opacity property from persistent header/portrait/footer, establishing their visible CSS baseline. This is synchronous before paint; the language `fromTo` still sets the initial fade state within the same setup. No CSS override, animation timing, route architecture, layout, portrait geometry or shared-image path was changed.

## Evidence

- `preview/navbar-continuity.browser.js`: failed before (header/footer0 after next page), passes after (all settled opacity1).
- `preview/navbar-regressions.browser.js`:66 production groups pass, zero page errors; header/footer minima across settled checkpoints1. EN↔AR at320/390/1440/1920 followed by six page destinations; DE/FR/ES/AR/EN follow-ups; page interruption65ms into locale entrance; history Back with locale changes; live reduced motion. Same document and usable non-inert stage remain.
- `preview/atelier-flow.browser.js`: existing locale fade minima0 for both old/new language and final1, language-trigger focus; filter nodes retained with99 transform states; evidence stage388.8px. Fade behavior remains intact.
- `npm run typecheck`, `npm run build:light`: exit0,170 localized shells. `node --test preview/route-motion.test.mjs preview/motion-policy.test.mjs`:5/5. `npm test`:8/8.
- Actual Chrome DevTools dev5176 repeated the reproduction sequence after the fix and confirms header/footer/stage1. Internally inspected the resulting Arabic Projects navigation screenshot.
- Shared-image native Eventies/Back checks at390/1440 after EN→AR pass: header stays opacity1 in every sampled frame,157/160 distinct flight transforms, one document, zero residual overlays. Header opacity fix leaves image walking intact.

Checkpoint before implementation: `output/checkpoints/design-intelligence-before-2026-10-14-141055.zip`,752 verified entries plus manifest. All existing work preserved, no V1 writes, package change, commit/push/merge/deploy. The code change is one scoped baseline normalization in the global motion hook; regression probes and this report are additions. Local/emulated Chromium evidence is bounded, not certification of every browser/device.
