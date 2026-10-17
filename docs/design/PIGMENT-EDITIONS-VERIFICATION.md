# Pigment editions —14 October 2026

Owner rejects pale wine/pink, Onyx/Stone and Espresso/Rose. Replaced those palettes throughout the shared role system: Bordeaux (deep Wine/ivory), Petrol (deep Teal/soft gray), Aubergine (dark eggplant/silver). Champagne and Sterling retain their existing color values. Stable internal IDs and stored preferences remain compatible; no pink/rose presentation label or literal pastel pigment remains in the three corrected palettes.

Theme trigger now uses the existing Lucide Contrast icon and selected edition name. Mobile retains a44px icon control with the full accessible name; dropdown samples are joined two-color rectangles. Names translated in all five UI locales. No generated icons, additional library or external assets.

## Actual root cause and correction

The earlier `.light-portfolio.luxury-portfolio .motion-field` rule won specificity over the shared atmosphere rule: actual smoke host opacity was0.14, regardless of the palette's requested exposure. Corrected only the three changed editions with a scoped rule:0.9 desktop,0.38 at≤800px to retain text contrast on narrow screens. Preserve64% desktop footprint, Arabic mirroring, full mobile footprint and all horizontal/bottom masks. Small portrait captions have a dark88% composited backplate without geometry changes.

New editions specify five pigment stops rather than repeating the page color at the first two stops. Deep pigment and light neutral occupy separate fold/ribbon stages; initial launch and live palette events both call `themeSmokeRamp`. Same shader, time, worker, canvas and portrait; reduced mode uses matching CSS pigments. Current Champagne ramp/fallback/exposure remain unchanged. No image recoloring or project-copy changes.

## Fresh verification

- Checkpoint: `output/checkpoints/design-intelligence-before-2026-10-14-165558.zip`,811 entries, script reports verified.
- `preview/pigment-editions.browser.js`:34 groups; EN/AR1920/1440/390/320 × three editions; menu≥44px/no overflow/new icon, same canvas/photo/header, actual unmasked canvas tonal range135–148/255 at1440. Nine cold About/Projects/Eventies routes keep correct exposure and repaint; reduced fallback takes deep Teal. A serialized CSS color appeared as `color(srgb…)`, so the probe compares the resolved pigment rather than assuming `rgb(…)`. The harness resets reduced motion at entry after an earlier failed probe retained that setting.
- `preview/theme-contrast.browser.js`:25 palette/page groups,670 actual stable text/control samples, zero failures. `preview/themes.test.mjs`:three tests, including11 semantic pairs per palette, allowlisted storage, deep pigment/light partner/chromatic channel assertions and unchanged original ramp.
- `preview/theme-navigation.browser.js`:six groups; rapid latest selection, unavailable native transition fallback, EN/AR shared-image flights79/82 distinct transforms, no overlays/hidden targets/inert stage, one document, theme and navbar survive language/Back.
- `npm test`:8/8; `node --test preview/*.test.mjs`:22/22; `npm run typecheck`:exit0; `npm run build:light`:exit0,170 shells. Main358.33kB/gzip108.86, unchanged GSAP147.38/gzip57.61, CSS317.57/gzip44.54. No shader/worker-runtime or Home story-motion edits.
- Actual DevTools inspection: EN1440 wine/teal/aubergine heroes and AR390 final dropdown. Strong paired pigments, smooth inward/bottom blending, authentic portrait, clear opposite text surface and joined palette samples. Real screenshot references supplied by the owner informed hues; no fake project evidence or new review site.

No V1 writes, push/merge/deployment, commits, dependencies or unrelated page redesign. Palette blending retains the previously verified cancellable native snapshot policy; the earlier stressed CPU capture limitation remains, and this palette-only work makes no new universal performance claim. Browser/emulation and sampled contrasts do not constitute a complete WCAG or physical-device certification.
