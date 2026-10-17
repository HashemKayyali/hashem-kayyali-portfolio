# Fixed hero and stationary portrait — 14 October 2026

Owner request: equal opening heights on Home/About/Projects, inline Arabic Projects heading when space permits, stationary photo and smoke between Home/About, smooth component changes, preserve shared project-image travel. This is a scoped correction to the accepted graphite/champagne/petrol, Libre Caslon Condensed/Almarai system.

## Cause and correction

Before correction at 1920px Arabic, openings measured Home 737.49px, About 576px, Projects 595.20px and Glitzz detail 731.60px. Separate portrait components remounted inside the animated route stage; About also used a smaller frame. Intrinsic content exceeded the previous min-height. A 15ch heading constraint forced Projects onto two lines.

`SharedHeroPortrait.tsx` now remains mounted outside the changing stage, with a shared reserved slot and identical Home/About position, dimensions and frame. `AppAtmosphere.tsx` keeps one canvas and uses common responsive bounds. The fixed opening includes Home's technical footer strip; visual QA caught that it otherwise sat outside the height measurement. At 1440px the complete opening is 645px, at 1920px 837px, at 390px 781px and at 320px 821px, across all four page families. Width/height remain responsive rather than a universal fixed pixel size.

Home/About copy changes through bounded GSAP motion. The portrait parallax is removed to honor the explicit stationary-image requirement; the cold Home title choreography and lower scroll stack remain. Heading width is unrestricted, allowing the Arabic Projects title on one line at desktop sizes.

Route scroll restoration now runs before paint, after the actual content, restored filter and fonts exist. Previously a deferred frame could expose new content at an old deep scroll position. Heading focus also runs as a layout effect, so it cannot overwrite restored origin focus afterward. Owned observers, version guards and font readiness remain. `project-transit.ts` is byte-for-byte unchanged; its destination readiness handshake still receives the settled route.

## Recoverability and scope

Checkpoint: `output/checkpoints/design-intelligence-before-2026-10-14-122328.zip` and adjacent manifest. Rechecked ZIP integrity and all 733 entries; no missing baseline files. Changes are limited to route/hero continuity, the new portrait/CSS, scoped compact diagram sizing and QA harnesses. Facts, public project media, font files, package manifests and V1 are unchanged from this checkpoint. No commit, push, merge, deployment or dependency installation.

## Verification

- `npm run typecheck`: exit 0.
- `npm run build:light`: exit 0; 170 localized route shells. Final entry JS 431.64kB / gzip 145.37kB; CSS 254.13kB / gzip 37.02kB.
- `npm test`: 8/8. `node --test preview/*.test.mjs`: 18/18.
- `npm run validate:content`: 14/14; eleven projects, five locales, professional facts and privacy policy preserved.
- `preview/atelier-continuity-check.browser.js`: final production 78 states pass. EN/AR at 320/390/1440/1920, DE/FR/ES at 390/1440, Home/About/Projects/Glitzz. Complete opening and smoke bounds match, Home/About portrait geometry matches, no horizontal overflow, desktop Projects title fits. All eleven case openings additionally fit at 320px in EN/AR.

- `preview/atelier-continuity-interactions.browser.js`: final production 10 groups pass. Eight Home→About→Home probes in EN/AR at 320/390/1440/1920 sampled 387–399 frames each. Same DOM photo and canvas, opacity 1/visible throughout; portrait and smoke rectangle deltas 0px; copy has 65–107 distinct transforms; one document. Rapid 70ms navigation returns to a non-inert, visible Home. Live reduced-motion mode retains the portrait and static smoke policy.
- `preview/atelier-exhibition-production.browser.js`: final production 18 groups pass. All six filters at EN/AR 320/768/1366/2560. Four actual Glitzz shared-image arrivals at 390/1366: 80–81 moving image transforms, no repeated title entrance, one document, no leftover overlay. Back preserves filter, origin focus and scroll with 0px error in all four final runs. Six GSAP gallery probes preserve native ratio, one visible slide, reduced-motion interruption and fullscreen Escape focus.
- Final native DevTools trace: four warm Home/About hops at 1440px Arabic, CPU 1x/no network throttle, observed CLS 0.00. Actual evaluated URL is Home; the trace tool summary retained an older Bike Tower URL label. Traced RAF probe: 609 intervals, p95 7.1ms, max 69.3ms, two long tasks 65/56ms. Forced-reflow insight totals 30ms across the capture, predominantly GSAP/layout measurement. An immediate untraced four-hop probe gives 629 intervals, p95 7.2ms, max 21ms, no tasks ≥50ms, one document and scroll 0. These are local samples, not a universal frame-rate guarantee; remaining traced spikes are documented rather than hidden.

## Failures found and repaired

The first narrow-case pass found the Umniah architecture diagram touching its footer; compact typography/padding now fit all existing nodes without removing content. An early Back probe found heading focus overriding the origin link after scroll restoration; layout effect ordering resolves it. A dev geometry harness sampled a transient missing hero; final production harness waits for the actual opening and route readiness before measuring. Warm lazy-image reveal timing also needed an 800ms settle in the existing Back harness; tests preserve actual clicks and verify focus and scroll rather than weakening assertions.

## Visual inspection and limits

Chrome DevTools inspected actual 1920px Arabic Projects, 1440px English Home/About and Arabic About, plus mobile Arabic Home/About and 320px case bounds. Native frames remain complete and the portrait stays adjacent to mobile copy. Language-menu opening and Arabic→English selection at 390px preserved scroll 0 and returned focus to the trigger. Fixed mobile opening height deliberately leaves breathing room after shorter About copy, to preserve the requested route continuity.

Local Chromium production/emulated viewport results do not guarantee every physical device or refresh rate. Earlier native DevTools trace export was rejected by the MCP path allowlist; native capture worked without export. No raw trace file is claimed or linked. No new review/comparison site, screenshot gallery or animation recording deliverable was created; the existing live site is the review surface.

Dev: http://127.0.0.1:5176/preview/ar/ and `/preview/ar/about/`, `/preview/ar/projects/`. Production QA: port 4176.
