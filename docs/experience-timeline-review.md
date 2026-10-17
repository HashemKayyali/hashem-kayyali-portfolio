# Professional Journey — grouped experience timeline

Implemented on `codex/experience-timeline`, based on modernization commit `5ef8f6c`. No push, merge or production deployment was performed.

## Result

- Four employer groups share one quiet burgundy glass surface, separated by subtle dividers. Role titles lead the hierarchy; company/employment, dates, and location/work mode follow on readable lines.
- The Terminal VR has one company header/logo and three vertically connected positions, newest first. Each position retains its own employment, dates, work mode and complete description.
- Eventies, independent engineering and Umniah use the same shared role component. Independent work uses a neutral briefcase symbol because no employer logo is supplied.
- First paragraphs and all career metadata remain visible. Eventies and independent work use native keyboard-accessible disclosures for their additional paragraphs, with localized labels and 44px summary targets. Terminal and Umniah descriptions stay fully visible.
- Logical grid positioning and CSS offsets mirror the logos, nodes and connecting line in Arabic RTL. Long translated titles and metadata wrap naturally.
- Experience rows have no entrance animation, dedicated shader surfaces, per-row intersection observers, or added dependencies. The profile/download/education areas retain their existing behavior.
- Expanding descriptions refreshes the project stack's absolute scroll position. A reproduced regression shrank the first pinned project to 0.932 scale after expansion; observing the page column corrected it to approximately 1.0. The browser regression check covers opening and closing descriptions.

`ExperienceTimeline`, `CompanyGroup`, `RoleEntry` and `RoleDescription` share the existing typed localized records. No employment facts were copied into component constants. An explicit comparison against the base commit confirmed that `resume.experience` is unchanged. Only the disclosure label was added to the canonical content source and synchronized legacy authoring file; all five dictionaries were regenerated.

## Visual reference and screenshots

No LinkedIn screenshots were attached to this request. The supplied hierarchy and grouped-role requirements served as the design reference, with the existing portfolio palette, fonts and glass tokens retained.

Before screenshots were captured from the unchanged development site at base `5ef8f6c`; after screenshots were captured from the built production preview. Both use headless Edge, 1440×960 desktop or 390×960 mobile, and reduced motion. Images show the full experience column with matching widths and no sticky-header screenshot overlays.

| View | Before | After |
| --- | --- | --- |
| English desktop | [PNG](../output/journey/before-en-desktop.png) | [PNG](../output/journey/after-en-desktop.png) |
| English mobile | [PNG](../output/journey/before-en-mobile.png) | [PNG](../output/journey/after-en-mobile.png) |
| Arabic desktop / RTL | [PNG](../output/journey/before-ar-desktop.png) | [PNG](../output/journey/after-ar-desktop.png) |
| Arabic mobile / RTL | [PNG](../output/journey/before-ar-mobile.png) | [PNG](../output/journey/after-ar-mobile.png) |

[Local comparison page](../output/journey/comparison.html) displays all four before/after pairs. These artifacts are ignored local review files, outside production assets.

## Verification

- `npm run typecheck`: passed.
- `npm run validate:content`: 14/14 passed, including generated-source consistency, exact About and approved role/dates.
- `npm test`: existing four locale/renderer tests passed.
- `npm run build`: passed; all five locale pages prerendered. Expected SSR-only static/dynamic dictionary import warnings remain; client locales still split into separate chunks.
- `npm run validate:seo`: 11/11 passed.
- `git diff --check`: passed.
- `scripts/verify-experience.cjs`: **37/37 scenarios passed on the final production preview**, including opening/closing descriptions and the following project stack's scroll position. The initial 36 scenarios also passed on development. All five languages were checked at 320, 390, 768, 1024 and 1440px, with four companies, six positions, one Terminal logo, vertical role order, node-to-logo alignment, connected line geometry, RTL direction, visible metadata, natural title wrapping, native disclosure Enter/Space behavior, focus outline and touch target. Normal-motion information is immediately visible. No runtime errors or failed asset responses occurred in passing runs.
- Existing portfolio QA selectors were updated to follow the new company/role markup.

Browser coverage is Edge on the local host; physical devices, Safari and assistive-technology runs were not performed. No new Lighthouse timing claim is made for this scoped redesign. The production entry changed from 417.62kB to 418.64kB raw, while CSS changed from 77.59kB to 76.03kB raw; the main runtime work removed is the three employer shader surfaces and five journey reveal observers.

## Review / reproduce

Development: `http://127.0.0.1:5173/#resume`; production preview: `http://127.0.0.1:4173/#resume`.

```powershell
Set-Location C:\Users\hashe\Desktop\site
npm run generate:content
npm run validate:content
npm run typecheck
npm test
npm run build
npm run validate:seo
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Optional browser tooling uses installed Edge and Playwright outside application dependencies, as documented in the modernization report:

```powershell
$env:PLAYWRIGHT_PACKAGE = (Resolve-Path output/browser-tooling/node_modules/playwright).Path
node scripts/verify-experience.cjs
node scripts/capture-experience.cjs after
```

Changed files: new shared component and stylesheet; Resume integration; removal of obsolete journey styles; typed disclosure label, canonical master, generator and five generated dictionaries; corrected keyed-asset comment; project stack measurement for preceding layout changes; browser verification/capture scripts and this report. Official resume downloads and other sections' content were preserved.
