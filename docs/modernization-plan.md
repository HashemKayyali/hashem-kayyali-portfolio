# Portfolio modernization implementation plan

> For agentic workers: use subagent-driven-development and dispatching-parallel-agents for independent domains; verify integration before committing.

**Goal:** Align all five languages with the supplied professional record and eleven project stories, improve discovery and reading, and measure loading improvements.

**Architecture:** Keep React/Vite, SSR prerendering, semantic localized content, existing burgundy palettes, glass surfaces, navigation and galleries. Version a public-only canonical content master; generate dictionaries mechanically. Evolve the existing models rather than replacing the application.

**Spec:** User attachment `Pasted text.txt`, copied locally to `output/modernization-spec.md`.

**Tech stack:** React 19, TypeScript, Vite, Framer Motion, Lenis, existing WebGL shared renderer.

## Constraints and shared design rules

- Work only on `codex/portfolio-modernization`; no production deploy, merge, or push to main.
- Preserve current burgundy colors, typography, spacing tokens, glass surfaces, sidebar, card media-left layout, and modal/gallery keyboard behavior.
- Approved user copy and dates are facts; no seniority in primary identity, fabricated metrics, private repository links or business screenshots.
- Official PDF/DOCX remain untouched; flag stale content.
- Fully support en/ar/de/fr/es and logical RTL layout.
- Keep all public content regenerable on a clean checkout.

## Review focus

- Long translated titles at 390px and 1366px; no horizontal overflow or clipped text.
- Three Terminal VR roles have their own dates, employment, mode and description.
- Financial system is present in every locale, filter, modal and media; use a clearly illustrative diagram if safe public screenshots are unavailable.
- Locale switching preserves complete content and does not race or mix languages.
- Reduced motion, hidden page and offscreen surfaces stop unnecessary rendering.

## Tasks

- [x] 1. Baseline: preserve current production output, inventory bundle/media, run Lighthouse mobile where available. Record real tool conditions and limitations.
- [x] 2. Content: update canonical identity, four About reading groups preserving all six approved paragraphs, four experience groups, graduation details and eleven distinct project stories in five languages. Add stable financial project ID, localized name, filter/media record, structured source validation. Regenerate all dictionaries and verify deterministic output.
- [x] 3. UX integration: render About reading groups, keyed experience assets, role-level metadata and paragraphs, university/dates, compact project narrative sections and long-title handling. Preserve lightbox, scrolling and keyboard/focus behavior.
- [x] 4. Performance: audit before changes; optimize actual image/font/JS/rendering bottlenecks while preserving SEO and recognizable effects. Compare baseline and final under same conditions.
- [x] 5. SEO and consistency: update structured Person identity and alumni information, metadata and social-preview visible copy. Run content checks, typecheck, build and SEO validator.
- [x] 6. Functional/visual QA: all languages and RTL, mobile/laptop/desktop, all filters, eleven details, gallery/fullscreen, navigation, downloads and public links. Inspect screenshots; independent review and fix regressions.
- [x] 7. Deliver: commit locally, retain preview and report including project copy, facts, performance numbers, changed files, assumptions and remaining limitations. No production actions.

## Execution rulings / progress

- User explicitly authorized implementation of the supplied complete spec; no additional design approval needed for these scoped refinements.
- Dedicated branch in the explicitly requested local workspace isolates changes from main; workspace was clean before branch creation.
- Original ignored master contains authoring-only metadata; publish a reviewed public-only `content/master.json` as the reproducible canonical source. Keep the legacy local master synchronized for local authoring compatibility.
- Baseline production build copied to `output/modernization-baseline/dist` before edits.

- Completed content14/14, typecheck,4Node tests, production/prerender build, SEO11/11,44browser scenarios and independent review; screenshots and actual paired mobile measurements recorded in the implementation/performance reports.
- Outreach privacy review replaced exposed inbox media with labeled SVG illustrations; original files preserved outside public assets in ignored output.
- Local commit delivery retains this branch and checkout; production integration remains subject to the user's next instruction.
