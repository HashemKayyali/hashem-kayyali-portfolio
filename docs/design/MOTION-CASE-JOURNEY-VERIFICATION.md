# Approved motion, case stories and professional journey — 15 October 2026

## Outcome and scope

Implemented the visual direction explicitly approved by the owner in the current conversation. Existing five editions, typography, authentic photographs/logos, eleven projects, five locales and canonical professional facts remain. The generated visual candidate guided composition only; no generated project or employer evidence was added.

- Meaningful viewport arrivals fill gaps between existing page timelines. Native IntersectionObserver starts bounded GSAP timelines; established portrait, image flight, Home, About, Projects and Skills choreography retain ownership.
- Project detail bodies now use compact editorial chapters, contribution and capability panels, original architecture, engineering decisions and related-project folios. The entire case opening remains unchanged.
- Gallery selection decodes incoming media before committing, preserves the readable current image, and accepts only the latest pending intent. Contained images, perspective transitions, Flip selection frame, thumbnails, keyboard navigation and native fullscreen dialog replace the previous oversized gallery.
- Experience has a compact shared-smoke opening with four authentic company/R&D planes, bounded pointer response and anchor selection. Compact native career disclosures retain every role, date, point, education item, strength and resume download.
- Common Home/About/Projects heroes are shorter, with a 601px total height at widths up to 800px, and a bounded desktop scale. Home/About preserve the exact same live portrait and canvas. Detail openings are explicitly excluded from this density change.

No new ScrollTrigger is used by the new arrivals, Case body/gallery or Experience. Successful legacy motion elsewhere remains. No dependency installation, V1 writes, Git commit/reset/clean/push/merge or deployment.

## Preservation

Recoverable checkpoint: `output/checkpoints/design-intelligence-before-2026-10-15-104424.zip`, 871 verified files, with companion manifest. Existing dirty/untracked work was retained.

The exact normalized `const opening` block in SignatureCaseStudy matches the checkpoint; SHA-256:
`3920a195903e88f1f0d5e88e52b59cc4ab4746da5af7ab122511beaf0f3f1007`.
Fourteen protected source files compared byte-for-byte without differences: profile/project data, theme roles, brand CSS, project transit, shared portrait, architecture, original case styles/continuity and applicable i18n sources. Existing content validation also confirms the complete five dictionaries and approved facts.

Sixteen before/after production geometry comparisons (Eventies/NFC, English/Arabic, nominal 1920/1440/390/320px viewports) retain case-opening heights 837/645/781/821px and y=68px. The taller small-phone case opening remains deliberately unchanged under the owner's explicit hero restriction.

Experience source-retention artifact: `output/playwright/experience-journey/source-retention.json`; all five locales retain the 71 checked source strings, four companies, six roles, eight strengths, original resume links and four authentic images.

## Fresh commands

All executed after the final application changes and confirmed with process exit code 0:

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `node --test tests/*.test.mjs preview/*.test.mjs` | 37 passed, 0 failed |
| `npm run validate:content` | 14/14 passed |
| `npm run build:light` | Passed; 170 localized V2 route shells |
| `git diff --check` | Passed after removing one trailing blank line in the touched route component |

New focused tests cover latest-selection/decode races, cancellation/unmount, decode failure, restored/focused/restricted arrivals and filtered/unattached geometry. Existing routing, privacy, theme, contact-draft, locale-loading, source-shader and gallery-memory tests also pass.

Final production bundle names: `index-DRNMy0CK.js`, `index-fXA4wG_F.css`, `SignatureCaseStudy-Ke9enxkt.js`, `SignatureCaseStudy-DAp3cb3y.css`. The existing smoke worker remains `home-silk.worker-DaJ9VMcr.js`.

## Actual-browser layout and visual review

Production was exercised at http://127.0.0.1:4176/preview/ using Playwright Chromium. The existing live development site remains http://127.0.0.1:5176/preview/. No separate review website or additional app tab was created.

- 176 English/Arabic layout states: eight page families at 320×740, 390×844, 768×1024, 820×1180, 1024×768, 1180×820, 1366×768, 1440×900, 1920×1080, 2560×1440 and 3840×2160.
- 48 remaining-locale states: German/French/Spanish, eight page families at 320px and 1440px.
- 44 case states: all eleven cases, English/Arabic at 320px and 1440px; forty actual galleries and four deliberately image-free protected Umniah states.
- 45 final production common-hero states after the final density adjustment: all five locales, Home/About/Projects at 320/390/768px. All hero content and project covers remain within bounds.
- No document overflow, sampled clipped text, missing/duplicate main region, hidden header or browser error in those matrices.
- Internal visual inspection covered full Experience/Case pages, English/Arabic phone overviews, gallery with decoded thumbnails at phone/tablet, portrait/landscape tablets, common hero density and the Glitzz diagram. Lazy media was explicitly decoded before lower-page gallery captures.

The broad matrices preceded the final common-hero 641→601px density adjustment; the 45-state production pass and final phone/tablet inspection cover that final adjustment. No other page geometry changed afterward.

Internal captures: `output/qa-2026-10-15-*.png`, `output/visual-final/`. Reusable broad layout probe: `preview/motion-case-journey-layout.browser.js`. These artifacts are verification evidence, not a screenshot deliverable.

## Motion and functional evidence

- Four English/Arabic desktop/phone gallery groups pass. Sampled transitions have 75–83 distinct transform states and remain nonblank. Rapid selection settles the latest input. Arrows, Home/End, RTL direction, fullscreen, Escape/focus return and live reduced-motion cancellation pass.
- Four Experience groups pass native anchor selection, rapid company switching, keyboard disclosure, focus below the fixed header, additional role details and live reduced-motion cancellation. One company is initially expanded; original details remain available.
- Six theme/navigation groups and ten Back/Forward/history groups pass: rapid theme/latest intent, native View Transition fallback, locale switching, uninterrupted header, project image walking, interrupted navigation and restored case reveal. Image-flight and Back reveal traces contain 81 and 94 distinct states respectively.
- Global arrival trace records 68 distinct transforms; live reduced motion settles registered groups to full opacity and cleared transforms. Contact at 320×568 starts the offscreen compose sheet armed, then records 78 transform states/72 intermediate-opacity frames and a settled readable result.
- Contact local draft preparation and language-value/URI retention pass in English and Arabic. No email or external message was sent.
- Four final Home→About checks at 390px/1440px in English/Arabic preserve the exact live portrait node, live canvas node and portrait x/y/width.
- Held gallery decode followed by an explicitly simulated hidden-document event commits the latest image in a static settled state. Opening a second headless tab did not change document.hidden; this is recorded as simulation coverage, not a native background-tab assertion.
- Thirty palette groups across English desktop/Arabic phone, all five themes and Experience/Eventies/Glitzz pass 1,430 computed semantic text/background samples; minimum sampled normal-text contrast is 4.83:1. This samples resolved solid/alpha semantic surfaces, not every antialiased pixel or gradient.
- Local production gallery interaction sample: 319 frames, median 6.9ms, P95 7.1ms, maximum 13.6ms, zero observed long tasks. This is one runtime/device sample, not a universal smoothness guarantee.

Structured results are saved in `output/verification/motion-case-journey-results.json` and `motion-case-journey-final-checks.json`.

## Findings fixed during review

1. A legacy global `.case-body` grid rule collided with the new body wrapper. The new scoped owner explicitly resets block layout/gap/padding.
2. Legacy Glitzz diagram variables produced poor contrast on the new transparent dark surface. Its body diagram now uses a matching light companion panel and correct node/caption roles; every edition was rechecked.
3. A pending image decode could begin a transition after document visibility changed. Commit now settles statically while hidden.
4. Projects hero covers exceeded the available tablet width. A bounded 420px visual stage and adjusted card offsets keep all five locale variants contained.
5. A dark copy rectangle was visible behind Projects hero text. The narrow collection-copy background override restores the continuous smoke surface.
6. Missing ResizeObserver/MutationObserver capabilities now use safe measured/static fallbacks in the new integration and Experience motion.

Independent final read-only review found no remaining actionable defect in the changed scope after these corrections.

## Limits

The responsive checks emulate CSS viewports in Chromium; they do not certify physical iPads, iOS Safari, every browser, native zoom, screen readers or every 22–32 inch monitor/DPR combination. Monitor inches alone do not specify a CSS viewport. No accessibility certification or new CPU-throttled performance result is claimed. Detail hero height remains unchanged by request. No deployment was performed.
