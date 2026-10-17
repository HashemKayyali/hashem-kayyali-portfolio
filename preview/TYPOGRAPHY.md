# V2 editorial typography

Scope: the existing Deep Burgundy V2 at `C:/Users/hashe/Desktop/site-v2-light-burgundy`, branch `codex/portfolio-v2-light-burgundy`. Approved layout, content, translations, assets and route structure preserved. No V1 edits or Git integration.

- `typography.css`: one Latin-only type layer after the existing style sheets. Instrument Sans headings/name/role/project titles, 500–700; Geist Sans body/navigation/controls/technical text, 400–600. Fluid desktop/mobile scale, lighter tracking, tuned reading rhythm. Every rule excludes Arabic RTL.
- `public/fonts/v2-fonts.css`: restricted variable WOFF2 faces, swap display, adjusted Arial fallback widths/ascent/descent. Instrument width axis fixed at 100. Two files total 52,092 bytes, including approved Latin Extended characters. OFL licenses and upstream hashes recorded in `public/fonts/V2-SOURCES.md`. Existing Arabic-related font definitions unchanged.
- `index.html` / `prerender.mjs`: early locale bootstrap in development; parser-visible font preloads in all Latin production route shells, no Arabic font preloads. No remote font services.
- `home-motion.ts`: genuine GSAP SplitText from the installed GSAP 3.15 package, measured after Instrument Sans loads; responsive autoSplit and accessible labels. Existing name mask/master entrance retained. Split markup/tweens revert on route/locale/reduced-motion changes. Font failure keeps readable fallback and original animation. Arabic remains unsplit. Other heading animations continue to use their existing transform/clip paths, with existing fonts-ready ScrollTrigger refreshes.

Verification report and screenshots: `/output/playwright/typography/results.md`. Review: `http://127.0.0.1:5176/preview/typography-review.html`. Latest built site: `http://127.0.0.1:4176/preview/en/`.

Primary references: [Instrument upstream](https://github.com/google/fonts/tree/main/ofl/instrumentsans), [Geist upstream](https://github.com/google/fonts/tree/main/ofl/geist), [Vercel font](https://vercel.com/font), [GSAP SplitText](https://gsap.com/docs/v3/Plugins/SplitText/).
