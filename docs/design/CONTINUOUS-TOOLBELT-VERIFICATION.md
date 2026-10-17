# Continuous technical rails —14 October 2026

Owner requests removing Pause and preventing mouse hover from stopping the Home toolkit. Keep the approved two GSAP counterflow rows, source-backed labels and compact original logo tile. All45 entries now use local SVG images:18 unchanged brand assets plus24 new symbol/pictogram files, reused where appropriate. Concepts without a product logo use colored illustrative symbols rather than branding for an unsupported technology. All badges remain38×38px with30px contained artwork and the original ivory background across all five themes.

## Scope and recovery

Checkpoint: `output/checkpoints/design-intelligence-before-2026-10-14-171915.zip`,813 verified entries. Before documentation, comparison found only four existing files changed: `preview/SkillToolbelt.tsx`, `preview/hero-toolbelt.css`, its browser probe and `public/v2-icons/SOURCES.json`. No missing checkpoint files; all18 original SVG hashes remain identical. New assets/script/probe are additive. Hero copy/geometry, shared portrait/smoke, navigation and project image transit sources remain byte-identical. No V1 writes, dependencies, commit, push, merge or deployment.

## Behavior and artwork

Pause UI/manual state and mouse/focus pause handlers are removed. A visible normal-motion rail keeps moving under pointer or keyboard focus. The original speed42/38px per second, seamless duplicates, locale directions, phase-preserving resize and cleanup remain. Hidden/offscreen resource suspension and static horizontally readable reduced/constrained behavior remain. The owner's requested continuous interaction supersedes the older Pause/focus-hover design contract; this change is not a claim of pause/stop accessibility conformance.

`scripts/prepare-toolbelt-pictograms.py` fetches inert assets from pinned primary upstream sources and extends the manifest without overwriting original logos. Colored concept artwork: [Icons8 Flat Color Icons](https://github.com/icons8/flat-color-icons/tree/1bf90d5ff118bc6690120ff9fdfe234565b7e414), whose [license](https://github.com/icons8/flat-color-icons/blob/1bf90d5ff118bc6690120ff9fdfe234565b7e414/LICENSE.md) permits MIT use. Bluetooth: [Simple Icons13.21.0](https://github.com/simple-icons/simple-icons/blob/13.21.0/icons/bluetooth.svg), blue fill applied and recorded. The legacy Wi-Fi XML preamble/external DTD is stripped before validating; entities, active content and external references are rejected. Sources, license copies, original/delivered hashes and modifications are local in `public/v2-icons/`.24 additional files total17,939bytes. No runtime external image requests or invented skills.

## Fresh verification

- `npm run typecheck`: exit0.
- `npm test`:8/8; `node --test preview/*.test.mjs`:22/22.
- `npm run build:light`: exit0,170 route shells. Main348.19kB/gzip106.36; CSS316.81kB/gzip44.43; existing GSAP split147.38kB/gzip57.61.
- `preview/toolbelt-continuous.browser.js`: failing baseline had1button, stopped on hover,19images and26inline glyphs; after change0buttons, playing under hover,45images/0inline glyphs.
- `preview/hero-toolbelt.browser.js`:48 passing groups,0page errors. Home/About/Projects at EN/AR320,390,1440,1920; DE/FR/ES390,1440. All images decoded; all45 names preserved and approved source matches; consistent badges;0overflow; equal protected hero/atmosphere heights. Actual elapsed motion continues under hover/focus; offscreen suspension, static reduced reading, resize/language switch and departure cleanup pass.
- `preview/toolbelt-loop-proof.browser.js`: four real GSAP seam boundaries (two rows×EN/AR), visible labels identical across wrap; displacement0.38–0.42px at±5ms.
- All five themes:45decoded images, identical tile colors and continuously playing rails.
-42 manifest hashes validated; original18 logo bytes unchanged; all delivered SVGs have no DTD/entity declarations.
- Chrome DevTools visual inspection: EN1440 and AR390, compact images and readable label rhythm, no Pause button or broken image. The initial Wi-Fi preview during file creation retained a cached missing image; full fresh decode passed in both browsers after assets existed. Browser harness strict38px equality was corrected for transform rounding38.0000267px; Windows occlusion suspended all page frames despite visible state, resolved by `page.bringToFront()` in the motion probe without changing application timing.

Evidence: `output/playwright/design-intelligence/toolbelt-continuous-matrix.json`. Live: http://127.0.0.1:5176/preview/en/. Automated and emulated checks do not certify physical-device performance or an overall accessibility standard. No additional review site, user screenshot comparison or recording was created.
