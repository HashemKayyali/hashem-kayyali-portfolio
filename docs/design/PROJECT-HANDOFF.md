# Portfolio V2 — persistent handoff

## UI polish, mobile menu and Lenis —17 October2026

Owner asked for a full UI audit across phone, iPad (both orientations) and desktop, keeping the approved design. Fixes live in `preview/ui-polish.css` (loaded last, `:root`-scoped so lazily loaded page CSS cannot override it), `preview/smooth-scroll.ts`, `preview/ui-motion.ts`, `PageShell.tsx`, `case-body-motion.ts` and `SignatureCaseStudy.tsx`.

- Navbar ≤800px: the open menu previously rendered links inside the 68px header, overlapping the language/theme controls; at 320px Arabic the language button covered the Close button. It is now a full sheet under the header (numbered links, Studio disclosure, Email/WhatsApp/LinkedIn shortcuts), GSAP clip/stagger opening, CSS close, scroll lock, Escape/outside/route/resize close. Drawn Plus/Chevron icons replace the `+`/`⌄` glyphs; header gains a hairline shadow when scrolled.
- Phone spacing/content: Home method steps show their explanations again and the sticky image no longer letterboxes; project filters are one swipeable row (auto-centres the chosen pill); case chapter bar is one 44px swipeable row; last stacked Home card loses its trailing gap; footer Contact link meets 44px.
- Case chapters are numbered and listed in reading order for engineering-first cases (7 of 11 read 01→03→02 before); the bar marks the chapter being read. About toolkit index `05 /` → `05`; Skills label `tools` → `Tools` (and locale equivalents).
- Lenis (owner-approved exception recorded in MASTER): desktop fine pointer only, 1.4s expo settle on the GSAP ticker, ScrollTrigger synced, nested scrollers native, inertia cancelled on route changes; in-page anchors glide below the header (native smooth on touch, instant with reduced motion) and move focus. Subtle magnetic lean on primary actions (mouse only).

Verified: `npm run check` (TypeScript, 75 tests, 14/14 content), `npm run build` (200 shells), 120 page×device×locale layout probes (320/390 phone, 820×1180 and 1180×820 tablet, 1440/1920 desktop, EN/AR) with no horizontal overflow or console errors, menu keyboard/tap/Escape/lock/resize tests at 390, 768, 320 AR and reduced motion, and Lenis wheel/anchor/Back/route/reduced/phone tests on dev and the built preview. Not verified: physical devices, Safari/Firefox.

## Final independent folder —17 October2026

The owner requested consolidation for Claude Code. The authoritative writable folder is now `C:/Users/hashe/Desktop/portfolio-v2`, an independent repository on one `main` branch with no linked worktrees or remote. All18 prior local branch tips are in its history; the approved current V2 tree wins over incompatible older designs. Other uncommitted drafts and the verified923-file source snapshot are preserved in ignored, HTTP-withheld `archive/`. Original folders remain unchanged. Read `CLAUDE.md` and `docs/CONSOLIDATION.md` for exact decisions and recovery.

Default `npm run dev/build/preview` commands now run the current V2 app in `preview/`; `/` redirects to `/preview/en/`. `npm run check` passes TypeScript,75 tests and14 content checks; build200 route shells and32 actual-browser size/locale samples pass. Dev5176 and built4176 are running from this final folder. No visual redesign, cloud connection or deployment occurred during consolidation. Existing cloud account/key limits and noindex policy remain.

## Latest approved compact portfolio and cloud Studio —16 October2026

All owner-approved UI work and the Supabase/Cloudinary/Vercel foundation are implemented in V2. Compact Home/About, phone sticky method images, equal career rows, always-visible Experience roles/raw marks, compact Skills with nearby phone results, Skills/Contact heroes and Embla case galleries are active. Existing case hero composition, facts, privacy,11 cases/five locales/five editions and shared portrait are retained. New Gallery/Journal/Admin routes are accessible at /preview/en/gallery/, /preview/en/journal/, /preview/en/admin/ (Arabic equivalents work). Studio is deliberately empty/read-only until provider accounts/keys are supplied;8080 is the server password default, with a separate required session secret. No live cloud persistence/deployment is claimed.

Fresh checks: typecheck,74 tests,14 content checks, build200 shells, responsive Chromium matrices and independent review. Actual browser fixture tests exercise publishing CRUD and project-image propagation. See docs/design/COMPACT-STUDIO-VERIFICATION.md for evidence, fixes and browser/account limits; docs/design/CLOUD-STUDIO-SETUP.md is the next connection checklist. Latest verified checkpoint: output/checkpoints/design-intelligence-before-2026-10-15-233934.zip (889 files). Dev5176 and built4176 run locally. No V1 writes, commit/push/merge/deployment.

## Approved motion / case stories / professional journey —15 October2026

The owner explicitly approved the inline visual direction and execution. Implementation is complete in the existing V2 checkout: meaningful viewport GSAP arrivals, a fully redesigned case body/gallery with exact original hero retained, and a compact Experience smoke hero using authentic company logos/R&D photo plus native career disclosures. New motion uses IntersectionObserver/Flip/bounded timelines without ScrollTrigger. Existing facts, all11 projects/five locales, five editions, shared image flight and Home/About stationary portrait/canvas remain. Common Home/About/Projects density is shortened (601px total at up to800px); case openings are excluded. No new dependencies/assets or V1 changes.

Recoverable checkpoint: output/checkpoints/design-intelligence-before-2026-10-15-104424.zip,871 files. Final typecheck,37 tests,14 content checks and build170 shells pass. Actual Chromium QA:224 broad layout states,44 all-case states,45 final common-hero states,30 palette groups/1430 samples, interaction/history/locale/form/focus/reduced-motion traces and independent read-only review. Sixteen before/after case-hero geometry samples and exact opening source comparison pass. Legacy body-grid collision, Glitzz contrast, hidden pending decode and tablet collection containment were fixed. Report: docs/design/MOTION-CASE-JOURNEY-VERIFICATION.md; final ledger/spec/plan and structured output/verification artifacts point to evidence and physical-device/browser limits. Active preview: http://127.0.0.1:5176/preview/ar/. No commit/push/deployment.

## Sterling black / silver smoke —15 October2026

Owner requests black/silver-gray smoke with very little gold. Only metal's smoke palette in themes.ts changes: silver static smokeA, steel-gray fourth ramp stop and a pale warm final highlight (low-weight shader highlight channel). Existing interface gold accents, other four themes, shader/worker, opacity, soft edge and geometry stay unchanged. Live baseline sampled48.3% strongly warm pixels; after the change the same threshold (R−B>18) detects0% in inspected frames while luminance range remains157.9/255. This threshold measures broad gold patches, not the faint highlight tint. Four existing theme tests and npm run build:light pass (170 shells). Eighteen production states pass: en/ar1920/1440/390/320, six cold About/Projects/Eventies routes and four reduced-motion desktop/mobile states; silver/gray fallback remains present, no overflow/browser errors. Internal1440px visual review confirms silver-first smoke. Checkpoint: design-intelligence-before-2026-10-15-103646.zip,871 verified files.

## Independent R&D workspace photograph —15 October2026

Owner supplies WhatsApp Image 2026-10-15 at1.32.25PM.jpeg for the independent R&D entry. data/profile.ts maps its stable independent ID to /experience/independent-rd.webp; the existing shared consumers automatically show its320px thumbnail in Home career rows and Experience markers. ExperienceAsset.altKey is optional for this decorative owner-supplied photograph; all actual employer mappings/labels/facts remain unchanged. Two contained, proportion-preserving metadata-free WebP derivatives are public:640×628 (37,478 bytes) and320×314 (13,806 bytes); original file is unchanged. Existing rendering remains52/40px Home and60/48px Experience, with aria-hidden imagery and native company text. Twenty-two production browser states pass: en/ar1920/1440/390/320 in both pages plus de/fr/es390px. All images decode, fit within frames, retain four entries and have no overflow/browser errors. Internal1440px Home visual inspection, npm run typecheck and npm run build:light pass. Checkpoint: design-intelligence-before-2026-10-15-103401.zip,869 verified files.

## Softer smoke / solid-background boundary —15 October2026

Owner requests a visibly gradual fade at the inward smoke edge. Live inspection confirmed the previous horizontal mask reached full opacity after32% of its width. atelier-app-shell.css now uses seven alpha stops (0/.03/.12/.32/.62/.86/1), reaching full opacity at78%, with shared90deg/270deg direction for English/Arabic. Vertical fade, five palettes/exposure, worker/shader and hero/portrait geometry remain unchanged. npm run build:light passes (170 shells). Twenty-four production browser states pass: en/ar1920/1440/390/320, all five theme selections, persistent Home→About canvas/photo identity, six en/ar About/Projects/Eventies cold routes and four reduced-motion states. No overflow/browser errors observed. Internal1440px English/Arabic visual review confirms the softer boundary. QA initially expected maskComposite to serialize as one value; Chromium reports intersect, intersect for the two mask layers, so the probe was corrected without changing application behavior. Checkpoint: design-intelligence-before-2026-10-15-103034.zip,869 verified files.

## Home method board / divider spacing —15 October2026

Owner requests a small gap below the sticky process illustration board. Live reproduction confirmed its bottom clamp touched the method-footer rule (0px). home-story.css changes story-visual margin-top:28px to margin-block:28px, reserving28px at the sticky bottom limit. Existing mobile margin:0 override and original GSAP choreography stay intact. Four live desktop scroll positions retain exactly28px; twelve en/ar normal/reduced states at1920/1440/390/320 pass with no overflow, and internal desktop visual review confirms the gap. npm run build:light passes (170 shells). Checkpoint: design-intelligence-before-2026-10-15-102836.zip,869 verified files.

## Champagne / Sterling smoke mixing —15 October2026

Owner asks for clearer smoke color mixing in these two editions. Baseline live inspection found both still at legacy0.14 opacity/33.333% glow with repeated page-background ramp stops, compared with0.9/70% in the other editions. themes.ts now supplies separate five-stop Champagne/petrol/ivory and silver/steel/gold ramps; themes.css applies consistent0.9 desktop/0.38 mobile exposure to all editions. All existing UI color roles and the other three smoke ramps remain unchanged. A discovered legacy atelier.css reset now excludes app-atmosphere-paint, restoring the English reduced-motion gradient. Shader, worker, masks, motion and hero/media geometry remain unchanged.

Verified: four theme unit tests (new regression failed before implementation),23 preview unit tests, npm run typecheck and final npm run build:light (170 shells). Production browser:23 responsive/cold/reduced groups (en/ar1920/1440/390/320 plus About/Projects/Eventies cold routes); six remaining-locale phone states; rapid alternating choices retain the canvas and advance10 frames; actual pixel samples contain both warm and cool pigments (Champagne27%/59%, Sterling49%/40% at the sampled frames);190 semantic contrast samples pass across six Home/About/Projects states. Final production build adds ten en/ar reduced-motion checks across all five editions with gradients present and two keyboard selection/focus-return checks. No browser errors in the responsive probe; no overflow or stranded theme transitions observed. Internal visual inspection covers both desktop editions and Arabic320px. Reduced-motion fallback remains a static gradient; sampled pigment proportions naturally change with animation time. Checkpoint: design-intelligence-before-2026-10-15-101902.zip,869 verified files. Live: http://127.0.0.1:5176/preview/en/.

## Home process links removed —15 October 2026

Owner removes the Eventies/Bike Tower/Basket Beats buttons from the three Home engineering-method steps. HomeStory drops that project mapping/import and those links only; steps, copy, three process illustrations, About action and actual selected-project cards remain. The owned GSAP text reveal targets h3/p; obsolete local link CSS is removed. Eleven responsive/locale checks, real en/ar story motion/cleanup/reduced-motion proof, typecheck and build:light pass. Production also confirms Glitzz's inverse diagram surface after a full cache-bypassing reload; hash-only navigation had retained an older stylesheet in the QA tab. Checkpoint: design-intelligence-before-2026-10-15-101250.zip,869 verified files.

## Glitzz engineering companion surface —14 October 2026

Owner makes the box under Communication inside the workflow use the opposite light theme partner. A Glitzz-only engineering architecture selector in surface-refinement.css supplies panel background/ink/muted/accent/border roles; diagram content, layout and motion are unchanged. Thirty en/ar/five-theme/1440–390–320 states and330 computed text contrast samples pass(min4.82:1), with no overflow;1920 production visual check and build:light pass. Checkpoint: design-intelligence-before-2026-10-14-193146.zip,869 verified files.

## Case hero action order and inverse surfaces —14 October 2026

Owner moves Visit Live Project into the case hero before Explore the engineering, both using the active theme's light panel/dark panel-ink pair. SignatureCaseStudy uses the original liveUrl only for the two public projects, removes the duplicated closing live button and preserves private-source copy and existing explore anchor. surface-refinement.css scopes the inverse actions; explicit child button styling defeats the older generic secondary-action rule's higher :is specificity. Forty layouts across five locales/two public cases/four widths, a private case/explore anchor, five palette contrast pairs(10.75–13.56:1), keyboard focus, typecheck/build and production visual review pass. Hero645px laptop height/motion/media remain. Checkpoint: design-intelligence-before-2026-10-14-192551.zip,869 verified files.

## Home career logos —14 October 2026

Owner adds company logos to Home03 career rows. HomeStory reuses the three original experienceAssets (Eventies, Terminal VR, Umniah), beside company names, contained52px desktop/40px phone images in60/48px theme-field frames. Independent work retains its unbranded source entry. Four records, original copy, themes and GSAP selectors remain. Fifteen live layouts across five locales at1440/390/320 pass;1920 production visual review, typecheck/build and scoped whitespace check pass. Checkpoint: design-intelligence-before-2026-10-14-192258.zip,869 verified files.

## Experience company marks —14 October 2026

Owner requests larger company logos. Scoped atelier.css increases desktop marker/image48/38→72/60px and mobile38/29→56/48px, uses contain/full-logo rendering, and adjusts the logical timeline gutter to preserve16px desktop/9px phone card separation. Existing assets, facts and motion are unchanged. Eight live en/ar layout checks at1920/1440/390/320 pass with no clipping/overlap/overflow; production visual inspection and build:light pass. Checkpoint: design-intelligence-before-2026-10-14-191934.zip,869 verified files.

## Latest Skills interaction workbench —14 October 2026

Skills only now uses one compact tool inventory/category Flip workbench, MotionPath logo relay, genuine project inspector with decoded image handoff/3D aperture, clamped pointer response and four native folding capability panels. Exact32 tools/five categories/four capabilities and all locale facts remain. Preserve the existing hero background, five companion palettes and all other page motion. No ScrollTrigger, scroll listeners or continuous ticker on Skills. Every context has one native-media owner; settle completes owning animation IDs, never fromTo startAt helpers. A single inert departing tray and visible-only Flip measurement improve normal interaction cost. Report/spec: `docs/design/SKILLS-WORKBENCH-VERIFICATION.md`, `docs/design/SKILLS-WORKBENCH-SPEC.md`. Checkpoint859 files181201. Live http://127.0.0.1:5176/preview/ar/skills/.

## Latest raised companion surfaces and process art —14 October2026

Owner makes Home Eventies/process board, Experience/Skills/Capabilities boxes light using the active edition panel, with coherent elevation and raised/inset-arrow controls. `surface-refinement.css` owns the scoped update; preserve facts, five palettes/smoke, hero/portrait geometry and GSAP/image flight. Portrait caption dark backplate removed; English selected-work heading stays one line responsively. Three temporary built-in ImageGen concepts live in `public/engineering-process/`, wired through `process-illustrations.ts`; authentic project media stays unchanged. Report: `docs/design/RAISED-SURFACES-PROCESS-ART-VERIFICATION.md` (80 layouts,860 contrast samples,20 focus states,5story/6navigation/10continuity groups,30 tests,typecheck/build).

## Latest continuous image toolkit —14 October 2026

Owner removes Pause and visible hover/focus stops. Home retains45 factual labels/two GSAP counterflow rows; all entries now use local contained SVG images in the original38px ivory tile, including colored concepts without official branding.18 original assets unchanged;24 pinned new files with licenses/hashes. Preserve resize phase, hidden/offscreen suspension, reduced/constrained static reading, hero/photo/smoke and image transit. Verification: `docs/design/CONTINUOUS-TOOLBELT-VERIFICATION.md` (48 UI groups,four real seam boundaries,five theme states,30 tests,typecheck/build). This supersedes older Pause/focus-hover toolbelt rules.

## Latest corrected pigment editions —14 October 2026

Owner replaces pale wine/pink with deep Wine/ivory, Onyx/Stone with deep Teal/soft gray, Espresso/Rose with Aubergine/silver. Edition names: Champagne, Bordeaux, Petrol, Aubergine, Sterling; old internal IDs preserve saved choices. Contrast icon/current-name trigger and joined two-color samples replace painting icon/pills. Three corrected editions use explicit five-stop smoke ramps shared by cold/live delivery and0.9 desktop/0.38 mobile exposure, overriding the legacy0.14 rule. Preserve current/metal palettes, masks, mirrored footprint, geometry, shader and worker lifecycle. Report: `docs/design/PIGMENT-EDITIONS-VERIFICATION.md` (34 UI groups,670 contrast samples,six navigation groups,30 unit tests,typecheck/build).

## Latest palettes and Home story — 14 October 2026

Owner authorizes five complete palettes: current Graphite/Champagne, Burgundy/Soft Ivory, Onyx/Stone, Espresso/Rose, Black/Silver/Gold. themes.ts owns semantic roles, safe preference and cancellable native320ms palette blend; themes.css maps existing aliases. ThemeMenu sits beside Language; smoke worker uniforms interpolate in place without restart. Original assets retain authentic colors. Home02/03/04 use HomeStory.tsx, scoped home-story.css and owned GSAP: three chapters/single evidence timeline, four factual career entries, compact correspondence finale. Main/image/hero geometry stay protected. Verification: `docs/design/THEMES-HOME-STORY-VERIFICATION.md` (75 layouts,24 interactions,5 motion,6 route blends,10 continuity,contrast corrections,29 unit tests/14 content checks). CPU4 snapshot capture retains isolated gaps; normal measured P95~7.2ms. Live http://127.0.0.1:5176/preview/ar/.

## Latest hero grouping and toolbelt — 14 October 2026

Home/About/Projects text grouping improves via scoped hero-toolbelt.css, preserving shared hero heights/photo/smoke. Home strip is now two GSAP logo/icon rails with45 unique source-backed entries,18 pinned local SVG assets, labels and Pause/Resume/static policies. Final typecheck/build,27 tests,14 content checks,47 UI groups, actual four seam boundaries,10 continuity groups and2 image/Back checks pass. Report/checkpoint: `docs/design/HERO-TOOLBELT-VERIFICATION.md`,766 entries145142. Existing shared route/image/smoke/photo implementations unchanged. Live http://127.0.0.1:5176/preview/ar/.

## Latest About dossier — 14 October 2026

Owner authorizes About body/content redesign with protected hero. AboutDossier.tsx keeps accepted hero markup/geometry, adds compact signal rail/editorial folios/toolkit matrix and About-owned GSAP in about-motion.ts. Six paragraphs/four titles/32 tools preserve exact five-language dictionaries. Main1440EN15% shorter, scope/product folios37–38% smaller. Final typecheck/build,27 tests,14 content checks,20 UI groups, actual motion/resize probe and10 Home/About continuity groups pass (same photo/canvas, geometrydelta0). Report: `docs/design/ABOUT-DOSSIER-VERIFICATION.md`. Checkpoint759 entries142831. Live http://127.0.0.1:5176/preview/ar/about/. Other pages/shared smoke/image/nav code unchanged.

## Latest Back-to-case reveal fix — 14 October 2026

Terminal Back cover freeze reproduced despite a decoded image. Unitless clip inset endpoint serialized to one value, making GSAP jump at completion. Explicit four percentage sides in case-motion.ts restore continuous reveal, preserving timing/RTL/shared-image guard. TDD probe1→89 intermediate states;10 history groups and2 shared-image checks pass, with typecheck/build and19 tests. Report/checkpoint: `docs/design/CASE-HISTORY-REVEAL-FIX.md`,756-entry snapshot142020. Existing image-flight implementation unchanged.

## Experience heading label — 14 October 2026

Owner requests04 / Professional Profile above Professional Journey, matching Skills hierarchy. The inherited `.section-heading>div` flex row caused side-by-side placement. One scoped `.profile-journey .profile-heading>div{display:block}` in profile-pages.css fixes it without changing Skills/other headings. Build passes;8 actual production EN/AR320/390/1440/1920 states show label above title, alignment0px, gap18.8–20.4px and no overflow. DevTools live5176 English inspected. Checkpoint141855 contains756 verified entries. No V1/dependency/Git/deployment mutations.

## Latest smoke edge coverage — 14 October 2026

Shared hero atmosphere now spans full screen width rather than content gutters, removing the side cut. Inward gradient/Arabic mirroring, content gutters, portrait geometry, hero height and persistent canvas remain. Build and32 responsive EN/AR hero states pass; actual Home/About nodes and bounds remain stable. Report/checkpoint: `docs/design/SMOKE-EDGE-FIX.md`,755 entries141614. Application change is one CSS rule.

## Latest navbar opacity fix — 14 October 2026

Reproduced locale transition then page change leaving header/footer opacity0. Reversible GSAP entrance captured the exit's hidden style; `preview/motion.ts` now seeds the persistent shell's visible CSS opacity baseline before recording entrance. Existing fades/design/image travel unchanged. Regression66 groups, fade/filter evidence, typecheck/build and13 focused/unit tests pass. Report/checkpoint: `docs/design/NAVBAR-CONTINUITY-FIX.md`,752-entry snapshot141055. Live dev5176 fixed.

## Latest Contact-only redesign — 14 October 2026

Compact correspondence desk replaces the oversized Contact UI; approved identity/factual channels unchanged. Controlled draft values survive locale changes, native validation and explicit email-app handoff remain, with localized copy-email feedback. Contact-owned GSAP contexts/listeners/timer clean up. Typecheck/build,27 tests,14 content checks,21 production browser groups and internal DevTools visuals pass. Form1440EN484.2px (before722.2). Checkpoint `output/checkpoints/design-intelligence-before-2026-10-14-134930.zip`,746 verified files. Report/limits: `docs/design/CONTACT-DESK-VERIFICATION.md`. Live http://127.0.0.1:5176/preview/ar/contact/. No other page redesign, V1 writes, dependencies, commit/push/merge/deploy or new review site.

## Latest compact folios and transition readiness — 14 October 2026

Projects hero remains exactly as accepted; collection below is asymmetric compact folios with GSAP Flip, retained/inert filtered nodes and interruptible motion. Languages fade out/in after dictionary/font readiness, preserving reading/focus and gallery selection. Case evidence desk is smaller and related projects are compact dossiers. Shared-image path remains560ms; its implementation now waits for destination decode before the120ms texture handoff, eliminating the reproduced slow-load blank gap. Home/About portrait/canvas continuity remains. Checkpoint: `output/checkpoints/design-intelligence-before-2026-10-14-131007.zip`,739 verified entries. Current report/limits: `docs/design/ATELIER-FLOW-VERIFICATION.md`. Live http://127.0.0.1:5176/preview/ar/projects/. No V1 writes, dependency changes, commit, push, merge or deploy.

## Latest fixed hero and stationary portrait — 14 October 2026

Home/About/Projects/details share an exact responsive complete opening height, including Home's footer strip. One portrait and one canvas survive Home/About changes; only copy animates. Scroll restoration occurs before paint after fonts/content/filter readiness, and heading focus cannot override restored origin focus. Shared project-image travel implementation remains byte-for-byte unchanged. Checkpoint: `output/checkpoints/design-intelligence-before-2026-10-14-122328.zip`, 733 verified files. Current verification and remaining limits: `docs/design/ATELIER-CONTINUITY-VERIFICATION.md`. Review the existing live application at http://127.0.0.1:5176/preview/ar/; no new review site. No V1 changes, commit/push/merge/deploy or dependency installation.

Updated: 13 October 2026. This session implements the attached Design Intelligence / V1 Smoke Recovery brief. V2 is the only writable application; `C:/Users/hashe/Desktop/site` is strictly read-only. No reset, clean, push, merge, deployment, dependency installation, paid API or image generation is authorized.

## Latest portfolio — Atelier luxury identity

The user accepts Product Signal and explicitly requests luxury/refined/technical colors, a suitable portrait position and extending work to the remaining pages. Scope is now V2-wide; earlier Home-only/Wine restrictions are superseded. Active contract: design-system/hashem-portfolio-v2/MASTER.md and docs/design/ATELIER-LUXURY-SPEC.md. Verification: docs/design/ATELIER-VERIFICATION.md and current root design-qa.md.

Graphite/champagne/ivory/petrol; immediate Home portrait/GSAP preserved, dedicated About portrait opening, career dossier cards, skills matrix, contact desk, both galleries and eleven case treatments. Facts/media/dependencies and existing router/motion/form behavior are unchanged. Checkpoint: output/checkpoints/design-intelligence-before-2026-10-13-185004.zip,688 files. Prior QA/master archived with PRODUCT-SIGNAL-QA/PRE-ATELIER-MASTER names under docs/design.

Viewer: http://127.0.0.1:5176/preview/atelier-review.html. Built Home/About: http://127.0.0.1:4176/preview/ar/ and /preview/ar/about/.196 route states,103 interaction assertions,30 final filter states,26 source tests/content14 checks and two real browser tours. Dark/light contrast and actual dialog/filter regressions resolved. Dev5176 restarted hidden if needed; output/playwright/atelier/dev-server.log and dev-server-error.log. No V1 writes, commit/push/merge/deploy.

## Historical homepage — Product Signal

The user's **Critical Redirection** explicitly rejects Engineering Fieldnotes and supersedes earlier Home visual restrictions. Active Home is now cream/cobalt/forest/lavender/coral, with the genuine portrait immediately visible, real project fragments, GSAP entrance choreography and native-scroll desktop scene layering. Homepage only. Read `docs/design/PRODUCT-SIGNAL-SPEC.md`, `docs/design/PRODUCT-SIGNAL-VERIFICATION.md` and current root `design-qa.md`.

Active viewer: `http://127.0.0.1:5176/preview/product-signal-review.html`. Built Home remains `http://127.0.0.1:4176/preview/ar/` and `/preview/en/`. Checkpoint before this redirection: `output/checkpoints/design-intelligence-before-2026-10-13-171934.zip`,678 files. Current evidence is isolated in `output/playwright/product-signal`; the previous QA is archived in `docs/design/FIELDNOTES-QA-2026-10-13.md`. Only five application files changed against this checkpoint; facts/assets/dependencies and other page components are unchanged. No V1 writes, push/merge/deploy or commit.

## Historical homepage — Engineering Fieldnotes

The later **Complete Homepage Redesign** request supersedes earlier homepage aesthetics. Both approved and creative Home URLs now use `preview/EngineeringHome.tsx`: charcoal/ivory/citron, monumental identity, actual selectable project media and a new Home-owned motion hook. This exception applies only to Home; all other page designs retain their existing system. Read `docs/design/HOMEPAGE-VISION.md`, `docs/design/HOMEPAGE-REDESIGN-VERIFICATION.md` and the current root `design-qa.md` for the active Home implementation and evidence. The previous QA is archived in `docs/design/CREATIVE-DIRECTOR-QA-2026-10-13.md`.

Latest review: `http://127.0.0.1:5176/preview/homepage-review.html`. Built Home: `http://127.0.0.1:4176/preview/ar/` and `/preview/en/`. Pre-redesign verified checkpoint: `output/checkpoints/design-intelligence-before-2026-10-13-162739.zip` (663 files). 35 viewport/locale captures,67 browser interactions,80 non-home routes,4 exact-pixel outside-scope comparisons and4 real recordings passed. History restores the selected Home project; live reduced-motion changes cancel pending/active work. The earlier sections below preserve historical recovery/refinement decisions, not constraints on this new homepage.

## Recovery baseline

- Branch: `codex/portfolio-v2-light-burgundy`; starting HEAD `6a1ae32`.
- The working tree already contained a complete uncommitted multi-page portfolio, eleven cases, five locales, typography, privacy-redacted media, GSAP choreography, Home worker and previous browser review suites. Do not interpret these files as changes by this session.
- Verified pre-edit ZIP: `output/checkpoints/design-intelligence-before-2026-10-13-123337.zip`, 618 files, matching SHA-256 manifest. It includes tracked, untracked and installed local skill files; generated builds, node_modules and prior output are excluded. Existing output is retained in place.
- Previous session evidence: `docs/home-rescue-scope.md`, `preview/README.md`, `preview/HOME-ART-DIRECTION.md`, `output/playwright/home-rescue`, `output/playwright/projects-upgrade`.
- Missing baseline scaffolding: `.agents/SKILLS-INVENTORY.md`, `.agents/AGENT-ROLES.md`, `.agents/scripts/validate-skills.py` are referenced by AGENTS but absent. Seven skill directories exist; report actual availability rather than assuming the referenced setup.

## Current architecture and scope

- React 19 / TypeScript / Vite. Local V2 lives under `preview/`, builds to `dist-light-preview`; canonical content remains under `content/`, `i18n/`, `data/`.
- `npm run build:light`; built URL `http://127.0.0.1:4176/preview/en/` (an existing server owns this port). `npm run dev:light` uses 5176.
- Identity: `preview/brand.css` already uses #58152D / #70203A / #3E1022 / #FCFAF9. Latin faces are Instrument Sans / Geist Sans; Arabic remains Tahoma / Arial.
- Home: `HomeSilk.tsx` + `home-silk.worker.ts`; other surfaces: `fluid-renderer.ts` + `light-warp.ts`. Home currently delays its worker until portrait completion. Existing normalized inset mask and image decode fix must be preserved.
- Original source: V1 `components/ui/global-burgundy-warp-background.tsx` and `burgundy-warp-runtime.ts`. V1 has five-octave nested domain warping, vector-specific time offsets, aspect correction and a five-stop pigment ramp.
- Narrow authorized implementation: authentic shader recovery, confirmed motion bugs, shared navigation/language/frames. Broad gallery, case, profile and contact redesign requires the owner's visual approval.

## Progress

- [x] Read user brief, repository instructions, previous Home scope, current stack and Git changes.
- [x] Verified recoverable source checkpoint before product edits.
- [x] Read all seven installed SKILL.md files; local UX, system and React searches execute successfully.
- [x] Capability map and curated MASTER.
- [x] Fresh actual-browser baseline and traces.
- [x] Bounded smoke/navigation/frame implementation and regression verification.
- [x] Browser comparison gallery, recordings, final measurements and roadmap.

Resume from this checklist; update this document with actual evidence and limitations. Do not claim a former review's timing as a fresh result.

## Completed refinement / next-session entry

- Open `http://127.0.0.1:5176/preview/design-intelligence-review.html` for the actual V1/pre-session V2/recovered V2 videos, paired EN/AR four-width images, scroll tours, language/menu evidence and limitations. Built V2 remains at4176. Broad further page redesign awaits the owner's visual approval.
- Contract: `design-system/hashem-portfolio-v2/MASTER.md`; capabilities: `docs/design/SKILL-CAPABILITY-MAP.md`; original source: `docs/design/V1-SMOKE-PROVENANCE.md`; remaining issues: `docs/design/V2-IMPROVEMENT-ROADMAP.md`; evidence/risks: `docs/design/VERIFICATION-REPORT.md`.
- Runtime imports the verbatim V1 fragment in `preview/v1-warp-shader.ts`; editorial finish only changes pigment uniforms and omits vignette/grain. Original digest/geometry are tested. `HomeSilk.tsx` owns one shared Worker; `fluid-renderer.ts` is a registration bridge. Legacy `light-warp.ts` is not imported by the app. Genuine `v1-warp-still.webp` is registered in the existing manifest.
- Mask/decode chronology is preserved. One existing TypeScript Function-to-rAF mismatch was corrected by a callback wrapper. No new runtime dependencies or AI assets.
- main.tsx preserves language-only scroll/select focus, excluding gallery-origin focus restoration. Header DOM/visible order is signature → language → mobile toggle → navigation; forward Tab reaches links. shared-refinement.css is bounded to navigation/frames/fallback.
- Fresh checks: npm test8/8, preview tests17/17, typecheck exit0, content14/14, build85 shells, diff check exit0. Actual MCP:56 EN/AR layouts at1920/1440/390/320;55 true mobile cases across5 languages;15 intermediate header checks; menu/focus/scroll/pause/offscreen/route/reduced/low-power/unavailable-Worker/DPR checks pass. Independent reviewer found a focus issue, reproduced and fixed.
- Evidence: ignored `output/playwright/design-intelligence`. Full-page batch hit a300s transport timeout after writing snapshots; separate56-case viewport audit succeeded. Descendant-locator and negative-overflow test mistakes were corrected without app workarounds. Existing preview/README.md has non-UTF8 bytes and was left byte-identical; use this current handoff instead of its historical measurements.
- Residual: CPU×4 shows a~56ms foreground GSAP gap and startup tasks up to595ms. Raw repeat trace's50.938ms task occurs before smoke starts; no historical25%-freeze reproduced. Do not advertise universally improved performance or physical-device/WCAG certification.
- Preservation:607 existing non-cache files unchanged; only8 existing files changed in scope; no missing/unexpected files; V1 hashes unchanged. Original618-file ZIP remains recoverable. AGENTS was appended. `.agents/SKILLS-INVENTORY.md` now points to actual setup; historical roles/validator files remain absent.

## Creative Director handoff — newer brief

The owner subsequently authorized responsive correction plus ONE separate Creative Lab. See `docs/design/CREATIVE-DIRECTOR-PLAN.md`, `CREATIVE-DIRECTOR-VERIFICATION.md` and root `design-qa.md`; those supersede the old narrow page-family gate within this review scope. ApprovedV2 uses wide adaptive geometry; Lab lives under `/preview/creative/<locale>/` with new Home/Gallery, shared native routing, safe media and verified5-locale content. Both remain local noindex review candidates, no promotion/deployment.

Final checks: typecheck;8 base+18 preview tests;14 content checks;170 built shells;32 final Lab viewport states;85 locale routes;26 interactions;12 corrected wide case openings. Six real recordings (three wide recaptured after final media sizing), source comparisons and raw DevTools traces are in `output/playwright/creative-director`. CPU4 central portrait max27.9/P95 20.9ms with no central long tasks; startup985ms remains. Initial mobile implicit grid,320px header wrap,dev RTL bootstrap,double eager image and wide case-figure containment issues are corrected and recorded. Final read-only reviewer found no material defect.

Review URLs: `http://127.0.0.1:4176/preview/creative/ar/`, `http://127.0.0.1:4176/preview/ar/`, comparison/video viewer `http://127.0.0.1:5176/preview/creative-review.html`.4176 was restarted as a standalone hidden process after the prior managed server stopped during recording. All subsequent recordings/download checks passed. Native browser zoom/physical devices/other browsers/screen-reader certification remain explicit test gaps. V1 is still read-only; source/facts/media preserved, checkpoints verified. Owner should choose the stronger direction before any promotion.
