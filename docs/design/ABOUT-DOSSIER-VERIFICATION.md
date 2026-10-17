# About engineering dossier verification — 14 October 2026

Owner requests an About-only UI redesign, smaller components and stronger GSAP, protecting the existing hero background. Spec: `ABOUT-DOSSIER-SPEC.md`. `AboutDossier.tsx` keeps the entire accepted hero markup/height/portrait slot and replaces the body. The shared atmosphere, portrait, route/nav/image transitions, palette/fonts and facts are unchanged.

## Design and size

Five-part engineering signal rail; wrapping reading index; four numbered editorial folios: wide ivory professional scope, paired analysis/collaboration, full-width product improvement with three desktop text columns. Five compact toolkit drawers form a two-column technical matrix, adapting to one on phones. Decorative registration marks/rules, restrained petrol surfaces and original typography keep the current identity. Actual category counts describe the listed technologies, never proficiency.

At1440EN, main2383.4→2022.8px (15% shorter). Scope280.8→177.6px (37% smaller); product-development450.7→280.4px (38% smaller). Desktop drawers approximately58px collapsed with44px+ targets. Long approved paragraphs naturally require more vertical reading on narrow phones;17–18px Latin/14px Arabic text remains readable rather than shrinking it to force a short page. Hero645px and exact1920/1440 portrait bounds are preserved.

## GSAP and interactions

`about-motion.ts` owns scrub-linked signal/folio rules, staggered signal/text/ordinal reveals, active reading index and measured native disclosure-height tweens. Text stays readable before reveal; there is no pinning, scroll capture, hero shader/parallax change or new dependency. Rapid toggles start from their live height/intended state. Resize/reduced motion settle disclosures; locale changes preserve their native open state. Native index anchors transfer focus to the intended heading, and keyboard Enter/Space operate summaries. Scoped contexts, listeners, pending refresh frames and triggers clean up on departure.

Official GSAP [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and [matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/) informed scrub and media/context ownership. Local UI Pro Max Motion-Driven and scroll-reveal searches informed composition and motion; pinning and unrelated sci-fi palette suggestions were not applied. UI styling and React review were scoped to this Vite implementation.

## Evidence

- `npm run typecheck`: final pass after explicitly typing the native-details callback. Initial typecheck had two untyped generic query errors; no casts or dependency updates were used.
- `npm run build:light`: final exit0,170 localized shells. Entry474.25kB/gzip160.48; CSS288.14kB/gzip40.53. Final browser checks wait for completed build output.
- `npm test`:8/8; `node --test preview/*.test.mjs`:19/19; `npm run validate:content`:14/14.
- `preview/about-dossier.browser.js`:20 final production groups, zero page errors. EN/AR320/390/768/1440/1920; DE/FR/ES390/1440. Exact comparison against the five generated source dictionaries: all6 paragraphs,4 chapter titles and32 toolkit entries unchanged. Zero page overflow, component bounds within viewport and44px+ interactive heights.
- Drawer has32 distinct sampled heights; eight rapid reversals settle correctly. Open drawer survives EN→AR with97px panel, no stale inline styles or inert content. Keyboard close/open, live reduced motion, native reading-index focus and departure cleanup all pass;0 About triggers/timelines remain and headeropacity1.
- `preview/about-motion-proof.browser.js`: final scroll sampling98 paragraph transforms,34 signal-line transforms,66 folio-rule transforms. Actual RAF intervals give p957.1ms/max14ms in the local browser; this is bounded observation, not a universal frame-rate guarantee. Resize during drawer motion settles the intended open state with97px panel and no stale styles/inert content.
- `preview/atelier-continuity-interactions.browser.js`:10 final groups pass. EN/AR320/390/1440/1920 Home↔About round trips keep identical canvas/photo nodes, portrait and atmosphere geometry delta0px, translated-copy motion and one document. Rapid navigation and reduced motion remain functional.
- Internal Chrome visual inspection:1440EN body,1920AR body,390AR and320EN body/toolkit views. QA corrected an unused colored signal-grid cell on phones/tablets by spanning the fifth signal across the remaining columns. Native drawers/Latin technology names, RTL, borders and reading scale checked. No new review site or screenshot/video deliverable.

The browser fixture first attempted an unsupported VM-side dynamic import; source comparison now imports the local generated dictionaries within the browser. A strict locator matching five drawers was narrowed to the first. These were harness corrections, not product failures. First motion sample used the prior build during a CSS build; final proof and full UI suite were rerun after build completion.

## Recoverability and limits

Checkpoint `output/checkpoints/design-intelligence-before-2026-10-14-142831.zip`,759 entries plus manifest, ZIP rechecked. Before these report updates, baseline changes were only `ProfileSections.tsx` (About export/component extraction) and `main.tsx` (one scoped stylesheet import). Journey/Role/Company source bodies exactly match the checkpoint; every other baseline file, including all shared hero/smoke/image/nav code, dictionaries, privacy assets, fonts, dependencies and V1, is unchanged. New About component, CSS, motion hook, spec and browser probes are additions. Preexisting work preserved; no commit/push/merge/deploy.

Local/emulated Chromium checks do not certify all physical devices, browser engines or screen readers. Native keyboard/focus/reduced motion and contrast-token checks were exercised; no screen-reader certification or universal zero-jank claim is made. Long mobile reading remains intentional to preserve approved professional content.
