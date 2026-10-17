# Installed design skill capability map

Verified locally on 13 October 2026. All seven installed `SKILL.md` files were read completely. Discovery source: `.agents/skills/`; machine inventory (paths, hashes, every script, reference and CSV row count): `output/playwright/design-intelligence/skills/inventory.json`. No dependency, external account, paid API or generated AI image was used.

| Installed skill | Actual local resources | Verified execution | Portfolio V2 application / scope |
| --- | --- | --- | --- |
| ui-ux-pro-max | 5 Python scripts; standard-library BM25; 12 domain datasets, 22 stacks and reasoning profiles | Data validator passes; system, UX, React and GSAP searches execute offline | Used for editorial hierarchy, focus, reduced motion and lifecycle cleanup. Existing approved Wine/fonts override generated theme recommendations. Use React stack, not Next.js or native app stack. |
| design | 8 scripts; logo, CIP and icon datasets and reference routing | Logo style and CIP deliverable searches return actual local results | Used to route brand → tokens → accessibility. Logo/CIP/icon generation is separate Gemini work, unnecessary for this existing portfolio. |
| design-system | 9 scripts; token/spec references; eight slide datasets | Token generator help works; token validator scans preview; slide layout search works | Used to codify existing CSS tokens and component states in MASTER. Do not overwrite them with generated starter theme. Slide search useful only for a comparison report, not portfolio layouts. |
| ui-styling | 2 Python scripts, component/accessibility/responsive references | Both CLI help commands work; no installation/config generation performed | Used for semantic controls, keyboard/focus and composition principles. Tailwind/shadcn migrations are expressly excluded. |
| brand | 4 Node CJS scripts and 11 references | MASTER context extraction succeeds; asset validator and token scan report real findings | Used for color/font/media consistency and evidence provenance. Campaign naming conventions do not match this repository; do not rename assets to satisfy them. |
| banner-design | SKILL + banner sizes/styles reference; no bundled scripts | File availability verified; generation/export workflow not executed | Hero composition reference only. Social/ad/print banners and external image-generation dependencies do not belong to this refinement. |
| slides | SKILL + 5 presentation references; no bundled scripts | File availability verified; no deck created | Inventory only. A web comparison report suffices; adding Chart.js or a slide deck would expand scope. |

## Dataset facts, not catalog marketing counts

Direct CSV counts: 192 product/color/reasoning rows each; 119 UX guidelines; 74 font pairings; 105 icons; 17 motion rows; 25 charts; 1,934 Google font rows; 88 style rows (includes catalog statuses and nonactive entries, not a claim of 88 active/searchable styles). React stack has 61 rows. `validate_data.py` confirms 12 domain files / 22 stack files. Logo datasets have 55 rows each; CIP deliverables 50, styles/industries/mockup contexts 20 each; icon styles 15. The full inventory preserves exact per-file counts. Do not infer online catalog freshness from a local CSV.

## Searches actually used and decisions

All command arguments and stdout/stderr are retained in `output/playwright/design-intelligence/skills/check-*.txt`.

- `engineering portfolio editorial --design-system`: returns Hero + Features + CTA, Minimalism/Swiss and a monochrome/blue palette with Archivo/Space Grotesk. Composition is relevant to the recruiter journey. Palette/font output was **rejected**, not persisted as MASTER. Curated MASTER retains the user's identity.
- `focus not obscured --domain ux`: returns the matching focus visibility rules; retained for sticky navigation and keyboard checks. AA and enhanced AAA distinctions are respected.
- `animation cleanup effects --stack react`: returns cleanup, unnecessary effects and dependency rules; retained for worker/listener and route ownership.
- `scroll reveal cleanup --domain gsap`: reviewed as advisory; existing scoped useGSAP choreography stays intact rather than replacing it with a preset.
- Logo `minimalist editorial` and CIP `business card`: prove both local BM25 engines function. Results are not authorization to regenerate the identity.
- Slide `before after -d layout`: verifies a genuine comparison layout result; use real screenshots/recordings with equal treatment, no fabricated transformation data or testimonials.

## Dependencies and availability

Python 3.14.6 and Node are installed. UI/UX and logo/CIP/slide searches are offline. Token generation/validation and brand context extraction are local Node/file operations. Pillow, NumPy and Matplotlib are present; `google.genai` and Python Playwright are absent. Actual Playwright MCP and Chrome DevTools MCP are available; the official installed DevTools server 1.10.1 is invoked directly for writable trace output. No npx/download is necessary.

Gemini image/SVG/CIP generation requires a configured key, Google SDK and network access; the SDK is absent and authorization was not granted. Pexels/Unsplash fetching, hosted font/catalog refresh, image services and Pinterest browsing are external workflows and were not executed. Native browser screenshot/video export works locally and records the real site; it does not generate project evidence.

`ui-styling` installation script would install dependencies and change theme setup; only `--help` was run. A successful help invocation proves CLI entry, not a successful installation. Likewise token generator help proves CLI availability, not that generated tokens match this portfolio. No account connections, Rive authoring or custom .riv success path were verified.

## Verified limitations / failures

- Brand `validate-asset.cjs` exits 1 for the existing `home-silk-still.webp`: it demands campaign-style filenames and a separate `.assets/manifest.json`. This is a policy mismatch, not a broken image. The portfolio uses `public/v2-media/manifest.json` and its existing hyphenated names.
- `validate-tokens.cjs --dir preview/` exits 1 with 17 raw hex occurrences and 1,727 pixel declarations at inventory time. It is a broad heuristic including intentional shader/legacy/layout values, not a requirement to rewrite the whole site. New shared CSS uses existing color aliases; the exact V1 shader's coefficients remain unchanged.
- AGENTS originally refers to absent `.agents/SKILLS-INVENTORY.md`, `.agents/AGENT-ROLES.md`, and `.agents/scripts/validate-skills.py`. A concise inventory pointer is restored; the absent roles document and historical validator are not silently fabricated. Use `python scripts/audit-design-skills.py` for this verified setup audit.
- Banner/slides describe other skills and tools not installed under `.agents/skills/` (for example ai-artist/ai-multimodal/frontend-design). Their workflows are not fully available merely because the SKILL.md exists.

## Relevant references read

`design/references/design-routing.md`; `design-system/references/token-architecture.md`; `brand/references/consistency-checklist.md`; `ui-styling/references/shadcn-accessibility.md`. These inform MASTER and scoped native React/CSS work. All other discovered references are listed, with actual paths, in the machine inventory for future task-specific consultation.

## Other skills used for this session

Superpowers using-superpowers / brainstorming: recover context and use the already specified bounded design brief. Systematic-debugging: compare original shader and reproduce language scroll movement before fixes. Test-driven-development: preserve failing browser proof and exact-shader recovery test before implementation. Verification-before-completion: fresh checks and actual-browser evidence. Requesting-code-review: independent read-only reviewer of this session's delta against the checkpoint. React-best-practices: listener cleanup, transient state in refs/module runtime, native control semantics and Vite-appropriate review; no Next.js guidance applied.
