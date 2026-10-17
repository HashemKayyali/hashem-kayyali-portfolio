# V2 improvement roadmap — actual-browser audit

13 October 2026. Scope: Home, Projects Gallery, a representative Bike Tower detail, About, Experience, Skills, Contact, shared navbar/language/mobile controls and RTL/LTR. Baseline: 56 actual normal-motion layouts (seven routes × EN/AR ×1920/1440/390/320), zero horizontal overflow or JS page errors. Screenshots are in `output/playwright/design-intelligence/before-*.png`. Initial full-page screenshots do **not** activate every below-fold reveal; blank offscreen stages are not evidence of missing media. Scroll-tour captures/recordings verify those stages separately.

Impact/severity use High/Medium/Low; effort is relative and deliberately avoids an invented time estimate. Rankings are evidence-based. Broader page layout work below remains awaiting the owner's visual approval.

| Rank | Finding and evidence | User / visual impact | Severity | Risk / effort | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Authentic smoke equations diverged: axis offsets, density, threshold pigment; other surfaces still used simplified/ribbon/plume modes. Direct V1/V2 source comparison and live paired field reference. | High / High | High identity mismatch | Medium / Medium | Exact V1 fragment recovered, shared Worker, original fold blend and genuine still; visual review pending |
| 2 | Language switch Bike Tower EN→AR moves reading from y1600→1725. Repeated failing browser regression, fresh trace of actual scroll. | High / Medium | High interaction defect | Low / Low | Explicit locale-only restore; regression now y1600→1600; preserve select focus |
| 3 | Case locale effect focuses h1; new restored gallery scroll can focus a remembered origin instead of select. Browser activeElement and independent review. | High keyboard / Low | Medium | Low / Low | Locale-only completion returns focus to select without scrolling; final full interaction check required |
| 4 | Mobile menu toggle's DOM position came after links although links appear below it; dismiss-on-leave could close before forward Tab reached links. | High keyboard / Medium | Medium | Low / Low | Shared DOM/visual order aligned, Escape/outside/focus tests |
| 5 | Shared header type previously 12px on profile pages vs14px on Home; active link border and unframed native select had inconsistent feedback. | Medium / High | Medium | Low / Low | Shared 44px targets, Wine underline/hover/press, native framed select |
| 6 | Product media often has sharp corners (gallery, case, Home evidence), contrary to otherwise refined portrait. Real first-viewport gallery/case screenshots and current CSS. | Medium / High | Low | Low / Low | Shared 12px / mobile8px image-depth/mask corners; reveal timelines and crop unchanged |
| 7 | Historical 25%-portrait stall was fixed by the prior session (inset units/decode/Worker); fresh baseline does not reproduce it. Startup still contains GSAP synchronous layout. | High if reproduced / High | Monitor | Medium / Medium | Preserve earlier fix and collect fresh desktop/mobile/CPU4 reveal timings; do not redesign the animation |
| 8 | Gallery: wide-screen composition capped at1200px within1920px; unequal featured media scale; labels/captions 10–11px and substantial editorial gaps. | Medium / High | Medium visual review | Medium / Medium | Separate owner-approved gallery scale/rhythm pass; retain eleven exhibits and filters |
| 9 | Case pages: oversize opening title with small metadata/captions; project-dependent crops/long chapters deserve individual review, especially Terminal mobile. Bike first-viewport and full shell evidence. | Medium / High | Medium visual review | Medium / High | Await a bounded case sample approval; do not apply generic template to all eleven |
| 10 | Contact mobile: heading and direct-contact subheading consume much of the first view; 11px direct labels and lengthy spacing. Actual EN390 screenshot. | Medium / Medium | Low | Medium / Medium | Separate readability/hierarchy pass; preserve honest draft flow and public contact facts |
| 11 | Experience: concise company grouping and genuine three Terminal roles work well; some responsibility/context labels are 11–12px and details collapsed. | Low–Medium / Medium | Low | Low / Medium | Review mobile legibility before any timeline redesign |
| 12 | Skills: genuine project-evidence links and toolkit categories work well; sticky desktop category index and dense chip wrapping need zoom/RTL follow-up. | Medium / Medium | Low | Low / Medium | Keep current system; expand only on confirmed zoom/keyboard issue |

## Strengths to preserve by experience

- **Home:** distinctive Instrument Sans name, excellent asymmetric portrait/crop and side wipe, clear project/résumé actions, approved supporting role, three authentic product compositions. Keep five-language readability and separate foreground/background budgets.
- **Gallery:** all eleven deliberate exhibits, meaningful categories, genuine/redacted media, index, native case links and filter/back memory. Initial offscreen blank masks are intentional until scrolled; audit with actual scroll.
- **Individual details:** tailored openings/architecture/build narrative, complete approved copy, evidence provenance, keyboard-native image dialog and neighbor navigation. Corner refinement does not alter content/crops.
- **About:** all six approved paragraphs, readable main column, sticky focus/index and expandable toolkit. No unsupported employment or credential edits.
- **Experience:** grouped companies, three Terminal roles under one company and genuine résumé links; native disclosure reduces density while retaining facts.
- **Skills:** existing toolkit plus source-backed project evidence rather than invented ratings.
- **Contact:** direct routes plus validated email draft, no false sending state or fabricated backend.
- **Navbar/language:** persistent, six real destinations, active case belongs to Projects, native modified clicks/select, five native language names. Avoid flag-only controls or a custom inaccessible dropdown.
- **Mobile/RTL:** existing logical grids generally reflow without overflow at320; Arabic type remains joined and uses the approved stack. Keep DOM order/focus aligned with the visible controls.

## Required next-stage gate

The owner reviews the smoke/portrait/shared UI comparison first. Further work should select **one** page family and produce a concrete visual candidate, using MASTER, before expanding scope. Candidate order: gallery scale/legibility → one representative case → contact heading/detail balance → profile labels/zoom polish. Do not treat this roadmap as approval to redesign all pages.

## Evidence limits

### Newer Creative Director brief

The owner explicitly authorized the next responsive correction plus one isolated Creative Lab; this overrides the previous page-family gate for that task only. That work is now delivered locally under `/preview/creative/<locale>/` without replacing approved routes. Current evidence and limits are in `docs/design/CREATIVE-DIRECTOR-VERIFICATION.md` and root `design-qa.md`; review screenshots/videos through `/preview/creative-review.html` on5176. Select a direction before further visual expansion or any launch.

Local Chromium traces and screenshots demonstrate this implementation, not broad WCAG compliance, physical iOS/GPU support, field Core Web Vitals, published SEO or real customer results. No browser-stack assumptions are made from a successful build. Fresh final checks and remaining limitations are in `docs/design/VERIFICATION-REPORT.md`.
