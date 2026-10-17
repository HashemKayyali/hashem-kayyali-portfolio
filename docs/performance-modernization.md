# Measured performance modernization

The original production build is preserved in `output/modernization-baseline/dist`.
The baseline is the old ten-project site; the final build also includes the
approved larger content and eleventh project. Timings compare complete builds,
not an isolated attribution of every improvement.

## Baseline evidence and priorities

- Initial JavaScript: **585,399 bytes**, **179,537 bytes gzip**. ProjectModal was
  already a separate 9,974-byte chunk (3,066 gzip). All five dictionaries were
  in the initial entry.
- CSS: entry 76,044 bytes (14,368 gzip), plus public Tailwind 55,135 bytes
  (8,328 gzip). This existing CSS arrangement is retained.
- Lighthouse loaded the profile and three experience images: 494,019 bytes
  before counting two icon requests. The R&D logo alone was 242,159 bytes and
  Terminal logo 158,782 bytes, despite their small rendered size.
- Inter and Roboto Slab downloaded 82,592 bytes. Google Fonts used `swap`, but
  the cross-origin stylesheet and two origin connections remained necessary.
- The global WebGL loop already stopped while hidden and with reduced motion.
  Visible copies used a 15fps delivery cadence. The second shader compiled on
  page initialization even before a custom surface was visible; positive
  intersection margins kept near-screen surfaces drawing. Lenis ran an autoRAF
  loop on touch devices and hidden documents.

Priorities were inactive locale payload, oversized small images, unnecessary
shader/smooth-scroll work, and the font network dependency. Gallery originals,
official resume files, burgundy palettes, and the lazy detail modal are retained.

## Implemented changes

- The browser fetches only its URL locale before hydration. Prerendering and
  validation still consume all complete generated dictionaries. A switch commits
  the dictionary, language, metadata, direction and URL together; the latest
  request wins, rejected requests retain the prior page and can be retried.
  The saved-root preference is applied once, so browser Back can reach English.
- Existing project card crops and experience assets now have 320/640 named WebP
  derivatives. Aspect ratio and transparency are preserved; small logos are
  not upscaled. The 12 retained thumbnail sources total 837,332 bytes, versus
  125,808 for the 320 variants (85.0% less) and 300,194 for the 640 variants
  (64.1% less). This is an asset inventory, not a
  claim that every image is fetched on the initial navigation.
- Inter normal 300–800 and Roboto Slab normal 400–800 are self-hosted as
  variable Latin/Latin Extended WOFF2 subsets. The Latin files total 82,492
  bytes; Unicode ranges fetch extended subsets only when used. `swap` and the
  existing Arabic system fallback remain. Official sources and licenses are in
  `public/fonts/SOURCES.md`, `INTER-OFL.txt`, and `ROBOTO-SLAB-LICENSE.txt`.
- The custom-ramp shader context compiles only on first visible demand.
  Offscreen subscribers unsubscribe; hidden documents do not deliver frames.
  Mobile global rendering is constrained to 20fps, while surface copies remain
  15fps. Resize no longer reads layout on every drawn frame.
- Reduced motion and save-data / two-core / 2GB-or-less reported devices receive
  a static field. A durable snapshot preserves it for newly visible subscribers
  after WebGL discards a composited drawing buffer; resize redraws even when the
  clock is fixed. CSS fallbacks retain the supplied palette if WebGL is unavailable.
- Lenis only runs with a fine pointer, visible document, and normal motion.
  Touch scrolling stays native, hidden pages destroy its loop, modal pause is
  retained across visibility changes, and native anchor fallback honors reduced motion.

## Repeatable audit

Install the official audit tool outside application dependencies:

```powershell
npm install --prefix output/performance-tooling --no-audit --no-fund lighthouse@13.5.0
node scripts/performance-server.mjs output/modernization-baseline/dist 4174
node scripts/performance-server.mjs dist 4180
```

In another terminal:

```powershell
node scripts/performance-lighthouse.mjs http://127.0.0.1:4174/ output/modernization-baseline/lighthouse-mobile-edge-2.json
node scripts/performance-lighthouse.mjs http://127.0.0.1:4180/ output/modernization-final/lighthouse-mobile.json
node scripts/performance-report.mjs output/modernization-baseline/lighthouse-mobile-edge-2.json output/modernization-final/lighthouse-mobile.json
node scripts/performance-inventory.mjs dist output/modernization-final/asset-inventory.json
node --test tests/performance.test.mjs
python scripts/performance-images.py
```

Both audit servers use the same no-store, uncompressed local hosting. Gzip
figures are measured separately with Node gzip and describe compressible asset
size, not the bytes this server transferred. No production deployment was audited.
Lighthouse 13.5.0 ran on headless Microsoft Edge 155, mobile 412×823, DPR1.75,
simulated mobile network 150ms RTT / 1,638.4Kbps, 4× CPU slowdown. Storage reset
was enabled. The explicit DevTools port avoids Edge launch detection issues.

## Lab results

| Metric | Baseline audit | Modernized audit |
| --- | ---: | ---: |
| Lighthouse mobile performance | 33 | 40 |
| LCP | 8.542s | 6.017s |
| TBT | 1,499ms | 1,533ms |
| CLS | 0 | 0 |
| Initial JavaScript, decoded bytes | 585,399 | 450,601 |
| Initial images, decoded bytes including icons | 495,667 | 120,263 |
| Font bytes | 82,592 | 82,492 |
| Total transferred bytes, uncompressed local server | 1,386,776 | 889,569 |
| Network requests | 14 | 14 |
| Failed network requests | 0 | 0 |

LCP fell 29.6%, image payload 75.7%, and total transfer 35.9% in this pair.
**TBT did not improve**; it was 34ms higher. Lighthouse's script-evaluation
diagnostic fell from 4,238ms to 1,679ms, while style/layout increased from
2,610ms to 3,420ms. These are whole-build trace observations; they do not prove
the cause of each remaining long task. Mobile blocking time remains a material
limitation and needs further profiling on representative devices.

Final production asset measurement, after the privacy rebuild: the entry is
417,623 bytes (131,517 gzip), and English is 33,191 bytes (10,007 gzip). Initial
English JavaScript therefore totals **450,814 bytes / 141,524 gzip**, down **23.0% /
21.2%** from baseline despite the expanded approved content. Arabic, the largest
locale, totals 463,633 bytes / 143,025 gzip. The other four dictionaries and the
detail modal are fetched on demand. The final stylesheet is 77,587 bytes
(14,642 gzip), plus the unchanged public Tailwind stylesheet and 1,566-byte
(419 gzip) local font CSS. Inventory JSON records exact individual assets.

Both successful runs emitted a warning that the host CPU was slower than
Lighthouse expected (benchmark indices 640 baseline, 649.5 final). Each value
above comes from one successful run per build; the tool, browser and explicit
throttling/hosting settings match, but host background load is not controlled.
The measured modernized build preceded the final below-fold outreach privacy
fix: its raster cover/gallery were quarantined and replaced by two safe,
illustrative SVGs. That project was not requested during either first-navigation
audit. The final asset inventory is refreshed after the privacy rebuild; the
lab timing and network table retains the measured audit build's values.
Two earlier attempts failed before
measurement: Chrome DevTools `Network.setUserAgentOverride` timeout and Edge
dynamic debug-port detection. Those attempts provide no scores. Lab timings
remain sensitive to host load and should be repeated on representative devices.
INP was not measured: no real-user interaction dataset is available; TBT is a
lab metric and is not presented as INP.

## Validation and budgets

Scoped Node tests cover last-request-wins language switching, rejected request
retry without partial commit, hidden-page delivery, palette grouping, cadence,
unsubscribe and fixed-clock redraw. Production typecheck, build, SEO/content,
browser language/history/layout/gallery checks are part of integrated QA.
The scoped test command passed all four tests, and `npm run typecheck` exited 0.
Pillow verification checked all 26 initially generated variants for exact
dimensions, preserved aspect ratio and alpha mode; two outreach variants were
subsequently quarantined with their source media, leaving 24 public variants.
Read-only post-privacy verification checked all 12 retained source dimensions
and bytes plus all 24 public variant dimensions, bytes and alpha modes.
Integrated browser QA recorded 34
functional checks with no failures or runtime errors, plus navigation/history
verification in all five languages.

Future regression budgets: initial entry plus active dictionary under 150KB gzip,
no inactive locale or gallery requests before use, small experience thumbnails
under 25KB each, no continuous WebGL or Lenis work while hidden/reduced-motion,
and lab CLS no higher than 0.1. LCP/TBT score targets require a stable
representative test environment; the local score is evidence, not a guarantee.
