# Skills workbench — 14 October 2026

Brief: `SKILLS-WORKBENCH-SPEC.md`. Owner requests Skills only, protected hero background, smaller components and advanced GSAP without ScrollTrigger. Applied local UI/UX Pro Max, UI Styling and Design routing, with the approved identity. Primary GSAP references: [Flip](https://gsap.com/docs/v3/Plugins/Flip/), [MotionPathPlugin](https://gsap.com/docs/v3/Plugins/MotionPathPlugin/) and [quickTo](https://gsap.com/docs/v3/GSAP/gsap.quickTo%28%29/). This is original work, not a screenshot clone.

## Delivered design

One category-controlled technical workbench replaces repeated tool/evidence lists. All 32 exact localized tools, five source categories and four source capability descriptions remain. Local image marks match the Home toolkit. The evidence inspector uses the original canonical-English technology matcher and narrow aliases, actual project titles, safe ProductImage assets and native case links. There are no proficiency scores, new technologies or claims.

The hero groups the existing title/context more tightly; its background remains transparent over the same application surface. Main height at 1440px English falls from 3896.81px to about 1580.75px, approximately 59% shorter. Five/four/three/two-column tools and six/three/two-column category controls reflow without global scaling. Theme companion surfaces and raised actions remain consistent. Phone All mode intentionally exposes the full 32-item inventory; choosing a domain shows 5–8 items.

Owned GSAP interactions: Flip tool reassembly, a single departing tray, a fitted category indicator, curved MotionPath logo relay, retained outgoing image until the next asset is decoded, aperture/3D preview reveal, one clamped quickTo pointer focal point, and Flip/hinge native capability disclosures. The logo path runs only when both ends are visible. Selection survives case visits and language changes. Skills creates zero ScrollTriggers, scroll listeners or continuous ticker work; other pages retain their approved motion.

## Problems found and corrected

- Rapid filter interruption originally killed Flip child tweens before taking state, leaving absolute positioning behind. getState now captures the current visual position and lets Flip finish its own interrupted state. The final design measures only visible tools and exits one inert tray, avoiding dozens of absolute grid conversions.
- Device/media changes exposed conflicting nested context ownership. The page now has native media subscriptions and exactly one owner for each bounded GSAP context; no nested manual/matchMedia double cleanup.
- The resize settle loop rendered fromTo startAt helper tweens, restoring the hidden first frame after an animation had completed. Settle now completes identified owning animations only. Real Chrome desktop-to-touch/mobile checks retain complete images and clean caption styles.
- Immediate project swaps could flash the new image before decode/reveal. An inert outgoing copy remains until decoded handoff, and is removed on completion or cancellation.
- The original inspector stage could overlap long project titles/actions with its selector. Contained full images, a bounded two-line title/summary and a 370px stage resolve the tested locale layouts.
- An initial focus probe incorrectly used programmatic focus after a mouse interaction. The final check uses real keyboard modality before inspecting focus-visible.

## Evidence and commands

- `npm run typecheck`: pass.
- `npm test`: 8 passed; existing preview test suites: 22 passed.
- `npm run validate:content`: 14/14 passed.
- `npm run build:light`: pass; 170 localized route shells. Main JS 364.82kB / 111.32kB gzip; main CSS 347.16kB / 47.66kB gzip; GSAP chunk 163.52kB / 64.77kB gzip. MotionPath adds no installed dependency. The original worker chunk remains unchanged.
- Playwright `skills-workbench-layouts.browser.js`: 20 locale/viewport groups and 100 category states at 1920,1440,390,320px across en/ar/de/fr/es. Exact labels/counts, all logos, capability count, no overflow/clipped controls/action overlap, header visibility and zero triggers checked.
- Playwright `skills-workbench-palettes.browser.js`: 20 production groups / 2000 computed contrast checks across five palettes, English/Arabic and 1440/320px; native keyboard focus checks pass.
- `skills-workbench-interactions.browser.js`: actual intermediate Flip/tray, curved logo, image aperture and pointer states; rapid filters/previews/disclosures; mirrored category keyboard; reduced-motion cancellation; resize; real case navigation and Back across five languages.
- A separate 10-cycle preview/pointer check verifies in-place en→ar selection/root continuity and departing-page cleanup. Real Chrome DevTools touch emulation verifies the pointer-mode transition not simulated by a plain desktop viewport resize. Internal visual inspection used the actual site on desktop/laptop/phone, not a comparison site.

Final Chrome production 1440px normal-CPU sample: four category changes, 510 frame intervals, median 7ms, P95 13.9ms, maximum 48.7ms, zero observed long tasks, no leftover ghosts or preview styles. Earlier individual absolute conversions produced 99–164ms tasks; the departing-tray architecture removed them in this sample. These are local measurements, not universal device guarantees. Synthetic CPU4 stress still produces isolated 116–343ms tasks and an 882.5ms frame gap despite P95 improving to 35ms; preserve this limitation for future broader performance work. Reduced/constrained motion remains static.

## Recovery and scope

Checkpoint: `output/checkpoints/design-intelligence-before-2026-10-14-181201.zip`, 859 files verified. Pre-documentation comparison found only Pages.tsx and main.tsx changed among existing files, with no missing files. New Skills implementation/probes/docs are additive. Original five dictionaries, eleven projects, media/assets, Home/About/Projects/Contact/Experience source, typography/palettes, hero/portrait, continuous toolkit, smoke shader/worker and project transit are byte-identical. No V1 changes, dependency updates, commit, push, merge or deployment. Local dev5176 and built4176 remain running.
