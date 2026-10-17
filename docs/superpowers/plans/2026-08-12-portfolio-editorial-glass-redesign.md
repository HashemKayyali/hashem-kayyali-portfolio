# Portfolio Editorial Glass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the existing portfolio into a responsive Layered Editorial Glass experience with a compact Hero, editorial professional timeline, accessible sticky navigation, restrained motion, and performance equal to or better than the recorded baseline while preserving the approved Projects experience.

**Architecture:** Keep the existing React/Vite page structure and shared Burgundy WebGL runtime. Add a small set of focused presentation primitives—a blur-independent surface token system, a section-scoped sticky header/shell, and an IntersectionObserver + Web Animations API Reveal—then migrate only the non-Projects sections to them. Treat native scrolling, centralized CSS offsets, progressive-enhancement blur, and visible-by-default content as invariants.

**Tech Stack:** React 19.2, TypeScript 5.8, Vite 6, Framer Motion 12 (protected Projects motion and modal/drawer transitions only), CSS/Tailwind generated utilities, IntersectionObserver, Web Animations API, Playwright CLI, WebGL/Canvas 2D.

## Global Constraints

- Work from the current working tree because it contains uncommitted approved Projects and mobile-navigation work. Do not create an isolated worktree from `HEAD` unless those changes are first preserved with the user's approval.
- Before Task 1, create a dedicated checkpoint commit containing only the confirmed approved Portfolio/Projects/mobile-navigation production state. Record its SHA as `APPROVED_BASELINE_CHECKPOINT`; this is the redesign diff base.
- Never stage or commit unrelated dirty files. Every commit command in this plan uses explicit paths.
- Keep React + TypeScript + Vite; do not migrate frameworks or add a smooth-scroll library.
- Preserve the global Burgundy shader identity, one shared WebGL context, one shared RAF owner, 30fps source limit, 24fps near-viewport card copies, offscreen buffer release, hidden-document pause, reduced-motion static frame, and current DPR cap unless repeated evidence justifies a targeted adjustment.
- Protect Selected Projects card internals, order, facts, filters, filter rebasing, counter, modal/gallery, image behavior, sticky stack geometry, `MIN_SCALE`, `MAX_DIM`, and scroll-linked scale/dim architecture.
- Do not migrate Selected Projects motion into the new generic Reveal primitive.
- Preserve every factual About, Resume, Journey, education, employment, and project detail. The Terminal VR remains one employer with two explicit role phases.
- Use Roboto Slab weights 400–700 throughout. Load one official Latin variable WOFF2 file, preload it once, retain its OFL notice, and remove duplicate Inter/Manrope/Montserrat loading.
- Treat Hero measurements as responsive target ranges, never fixed heights: 500–550px at 375×667, 520–570px at 375×812, and 650–740px at 768×1024, excluding the sticky mobile navbar.
- Never meet a Hero target by clipping content, hiding required content, forcing overflow, or placing the portrait beneath the entire content block.
- About, Resume, What I Build, and Contact sticky headers always keep both title and description visible. Projects retains its specialized title/filter implementation.
- Centralize mobile navbar, sticky-header, section-anchor, and Projects stack offsets with CSS custom properties. Do not add arbitrary per-section `top` or `scroll-margin-top` values.
- Glass readability must come from translucent color, border, highlight, contrast, and shadow. `backdrop-filter` is optional progressive enhancement.
- If glass produces a measurable performance regression, reduce or remove `backdrop-filter` first; preserve the Burgundy shader and translucent surface design.
- Generic entrances use IntersectionObserver + WAAPI, remain visible by default, animate only opacity/transform, and own no RAF loop or per-scroll React state.
- Run the identical production scroll benchmark at least three times before and three times after. Compare medians and the distribution of p50/p95/p99/max/frames-over-threshold values, not one run.
- Verify Roboto Slab for one font request, successful fallback/swap, CLS, and responsive wrapping in Hero, Sidebar, Projects filters, and Resume.
- Test before declaring completion and report commands, screenshots, artifacts, failures, and residual risks.

---

## File Structure and Ownership

### Create

- `components/Reveal.tsx` — visible-by-default generic entrance primitive using IntersectionObserver and WAAPI; never imported by `sections/Portfolio.tsx` or `components/ui/feature-shader-cards.tsx`.
- `public/fonts/roboto-slab-latin-wght-normal.woff2` — one official Google Fonts Latin variable asset covering weights 400–700.
- `public/fonts/OFL.txt` — Roboto Slab license notice from the official Google Fonts distribution.
- `docs/qa/portfolio-redesign-verification.md` — final commands, measurements, screenshot index, accessibility results, Projects regression results, and compromises.

### Modify

- `tsconfig.json` — exclude confirmed scratch/QA artifact directories from TypeScript source discovery.
- `index.html` — remove Google Fonts connections/stylesheet, preload the one local Roboto Slab asset, retain existing metadata/styles.
- `index.css` — typography, semantic tokens, shells, sticky/anchor offsets, glass fallback/enhancement, soft surfaces, responsive layouts, timeline, navigation, footer, focus, and reduced-motion rules.
- `App.tsx` — skip link, main-content target, section-gap container, and shared mobile-menu trigger reference/inert integration.
- `components/SectionWrapper.tsx` — general sticky title/description architecture and Projects measured-control compatibility.
- `components/Sidebar.tsx` — glass presentation hooks, correct heading semantics, drawer focus/escape/inert behavior, and shared trigger reference.
- `sections/Hero.tsx` — compact responsive composition and fast visible-safe Hero entrance.
- `sections/About.tsx` — editorial two-column composition, tightened factual copy, soft toolkit surfaces, metadata rail.
- `sections/Resume.tsx` — editorial summary/supporting stack and redesigned Professional Journey.
- `sections/Services.tsx` — sticky-aware Burgundy section and soft capability cards.
- `sections/Contact.tsx` — sticky-aware glass layout and accessible contact rows.
- `components/Footer.tsx` — typography and compact consistency refinements only.

### Protected/read-only except proven compatibility fixes

- `sections/Portfolio.tsx`.
- `components/ui/feature-shader-cards.tsx`.
- `components/ProjectModal.tsx`.
- `components/ui/global-burgundy-warp-background.tsx`.
- `components/ui/burgundy-warp-background.tsx`.
- `components/ui/burgundy-warp-runtime.ts`.
- `data/profile.ts` — source of factual truth; change only if restructuring data becomes strictly necessary, never to alter facts.

### QA artifacts, not committed unless explicitly requested

- `output/playwright/performance/`.
- `output/playwright/redesign/`.
- `output/playwright/accessibility/`.

---

### Phase 0: Checkpoint the approved current application state

**Files:**
- Inspect: every path reported by `git status --short`
- Stage only if confirmed approved: `App.tsx`, `components/CustomCursor.tsx` deletion, `components/SectionWrapper.tsx`, `components/Sidebar.tsx`, `components/ui/feature-shader-cards.tsx`, `index.css`, `sections/Portfolio.tsx`
- Never stage: `data/mobile_overflow_fix_modified/**`, `dist/**`, `output/**`, `.agents/**`, `.claude/**`, or unrelated repository/user files
- Record: `docs/qa/approved-baseline-checkpoint.txt` after the checkpoint SHA exists

**Interfaces:**
- Consumes: the current dirty working tree and the approved Projects/mobile-navigation behavior audited during brainstorming.
- Produces: a clean production-source checkpoint commit and the exact `APPROVED_BASELINE_CHECKPOINT` SHA used by Task 13.

- [ ] **Step 1: Inventory the complete dirty tree without changing it**

Run:

```powershell
git status --short
git diff --stat
git diff --name-status
git ls-files --others --exclude-standard
```

Classify every path as one of: approved application state, scratch/generated artifact, repository guidance/documentation, or ambiguous. Do not stage an ambiguous path.

- [ ] **Step 2: Inspect every candidate approved production diff**

Run:

```powershell
git diff -- App.tsx components/CustomCursor.tsx components/SectionWrapper.tsx components/Sidebar.tsx components/ui/feature-shader-cards.tsx index.css sections/Portfolio.tsx
```

Confirm the candidate set contains only the already-audited approved changes: removal of the custom cursor, in-flow mobile navbar/drawer layering repair, sticky Projects header/control measurement, Projects filter rebasing and stack geometry, approved project-card composition, and the CSS required by those behaviors. Confirm `MIN_SCALE`, `MAX_DIM`, project order/content, modal/gallery, and Burgundy runtime identity are not altered beyond that approved state.

- [ ] **Step 3: Stop on ambiguity**

If any candidate hunk cannot be tied to the approved current site, leave the whole ambiguous file unstaged and report its path and hunk summary to the user before proceeding. Do not split or rewrite an ambiguous file merely to make the checkpoint clean.

- [ ] **Step 4: Verify the candidate application state before staging**

Run:

```powershell
npm run build
```

Expected: PASS. Typecheck may still fail only because the confirmed scratch directory remains in TypeScript discovery; that is repaired in Task 1.

- [ ] **Step 5: Stage only the confirmed approved production paths**

Run exactly:

```powershell
git add -- App.tsx components/CustomCursor.tsx components/SectionWrapper.tsx components/Sidebar.tsx components/ui/feature-shader-cards.tsx index.css sections/Portfolio.tsx
git diff --cached --stat
git diff --cached --name-status
```

Expected: the staged set contains only the seven confirmed application paths. Scratch/generated/guidance/plan files remain unstaged.

- [ ] **Step 6: Review the staged checkpoint and commit it**

Run:

```powershell
git diff --cached --check
git diff --cached
git commit -m "chore: checkpoint approved portfolio interactions"
```

Do not alter the approved Projects implementation while creating this commit.

- [ ] **Step 7: Record the true redesign base**

Run:

```powershell
$env:APPROVED_BASELINE_CHECKPOINT = (git rev-parse HEAD).Trim()
$env:APPROVED_BASELINE_CHECKPOINT
```

Use `apply_patch` to create `docs/qa/approved-baseline-checkpoint.txt` containing exactly the SHA plus this label:

```text
APPROVED_BASELINE_CHECKPOINT=<actual 40-character SHA>
```

All later review commands read the value from this file rather than hard-coding a commit.

- [ ] **Step 8: Confirm no production source remains unintentionally dirty**

Run:

```powershell
git status --short
git status --short -- App.tsx index.html index.css index.tsx components sections data/profile.ts types.ts vite.config.ts tsconfig.json package.json package-lock.json
```

Expected: no tracked production source path is dirty. `data/mobile_overflow_fix_modified/`, `dist/`, `output/`, repository guidance, and the intentional checkpoint-record/plan documentation may remain untracked or separately dirty, but must not be staged into the application checkpoint.

---

### Task 1: Preserve the baseline and repair TypeScript scope

**Files:**
- Modify: `tsconfig.json`
- Inspect only: `data/mobile_overflow_fix_modified/**`
- Artifacts: `output/playwright/performance/before-run-{1,2,3}.txt`

**Interfaces:**
- Consumes: current production preview and the approved dirty working tree.
- Produces: passing typecheck/build baseline and three comparable pre-redesign scroll runs.

- [ ] **Step 1: Reconfirm the scratch directory is outside production**

Run:

```powershell
git status --short -- data/mobile_overflow_fix_modified
rg -n "mobile_overflow_fix_modified" App.tsx index.tsx components sections data vite.config.ts package.json -g '!data/mobile_overflow_fix_modified/**'
```

Expected: the directory is untracked and the second command returns no production references.

- [ ] **Step 2: Capture exact pre-change repository state**

Run:

```powershell
git status --short
git rev-parse --short HEAD
npm run build
```

Expected: build passes; save the commit id and dirty-file list in the Task 1 working notes without staging them.

- [ ] **Step 3: Start the production preview and open a named browser session**

Run from the repository root:

```powershell
New-Item -ItemType Directory -Force output/playwright/performance | Out-Null
npm run preview -- --host 127.0.0.1 --port 4173
```

In a second terminal, run:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=perf-before open http://127.0.0.1:4173
npx --yes --package @playwright/cli playwright-cli -s=perf-before resize 1440 900
```

Expected: production preview opens at 1440×900 with no application runtime error beyond any already-recorded missing favicon baseline.

- [ ] **Step 4: Run the identical seven-second scroll measurement three times**

For runs 1, 2, and 3, execute the following unchanged `eval`, teeing each CLI result to the matching artifact file:

```powershell
$benchmark = @'
() => new Promise(resolve => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  const frames = [];
  const longTasks = [];
  let observer;
  try {
    observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) longTasks.push(entry.duration);
    });
    observer.observe({ entryTypes: ['longtask'] });
  } catch {}
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const startedAt = performance.now();
  let previous = startedAt;
  const step = now => {
    frames.push(now - previous);
    previous = now;
    const progress = Math.min(1, (now - startedAt) / 7000);
    window.scrollTo(0, maxScroll * progress);
    if (progress < 1) return requestAnimationFrame(step);
    observer?.disconnect();
    const sorted = [...frames].sort((a, b) => a - b);
    const percentile = ratio => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] || 0;
    resolve(JSON.stringify({
      duration: now - startedAt,
      frames: frames.length,
      average: frames.reduce((sum, value) => sum + value, 0) / frames.length,
      p50: percentile(0.50),
      p95: percentile(0.95),
      p99: percentile(0.99),
      max: Math.max(...frames),
      over20: frames.filter(value => value > 20).length,
      over34: frames.filter(value => value > 34).length,
      longTasks,
      longTaskTotal: longTasks.reduce((sum, value) => sum + value, 0),
      scrollHeight: document.documentElement.scrollHeight,
      canvases: document.querySelectorAll('canvas').length,
      webglSources: document.querySelectorAll('canvas[data-warp-source="shared-webgl"]').length
    }));
  };
  requestAnimationFrame(step);
})
'@
1..3 | ForEach-Object {
  npx --yes --package @playwright/cli playwright-cli --raw -s=perf-before eval $benchmark |
    Tee-Object -FilePath "output/playwright/performance/before-run-$_.txt"
}
```

Expected: three complete JSON results using the same viewport, duration, and traversal; `webglSources` equals 1 in every run.

- [ ] **Step 5: Record the before distribution**

Use the raw JSON artifacts to record all three values plus the median for `average`, `p50`, `p95`, `p99`, `max`, `over20`, `over34`, and `longTaskTotal` in `output/playwright/performance/before-summary.md`. Do not collapse the evidence to the median alone.

```powershell
function Get-Median([double[]]$values) {
  $ordered = @($values | Sort-Object)
  $count = $ordered.Count
  if ($count % 2 -eq 1) { return $ordered[[math]::Floor($count / 2)] }
  return ($ordered[$count / 2 - 1] + $ordered[$count / 2]) / 2
}

$runs = 1..3 | ForEach-Object {
  Get-Content -LiteralPath "output/playwright/performance/before-run-$_.txt" -Raw |
    ConvertFrom-Json
}
$metrics = 'average','p50','p95','p99','max','over20','over34','longTaskTotal','canvases','webglSources'
$rows = foreach ($metric in $metrics) {
  $values = @($runs | ForEach-Object { [double]($_.$metric) })
  "| $metric | $($values[0]) | $($values[1]) | $($values[2]) | $(Get-Median $values) |"
}
@(
  '# Before redesign scroll benchmark',
  '',
  '| Metric | Run 1 | Run 2 | Run 3 | Median |',
  '|---|---:|---:|---:|---:|'
) + $rows | Set-Content -LiteralPath 'output/playwright/performance/before-summary.md'
```

- [ ] **Step 6: Write the failing typecheck evidence**

Run:

```powershell
npm run typecheck
```

Expected: FAIL only on unresolved imports inside `data/mobile_overflow_fix_modified/`.

- [ ] **Step 7: Exclude the confirmed scratch and generated QA directories**

Add this top-level property beside `compilerOptions` in `tsconfig.json`:

```json
"exclude": [
  "data/mobile_overflow_fix_modified",
  "dist",
  "output"
]
```

- [ ] **Step 8: Verify the tooling repair**

Run:

```powershell
npm run typecheck
npm run build
```

Expected: both PASS; no scratch file is edited or deleted.

- [ ] **Step 9: Commit only the TypeScript scope repair**

```powershell
git add -- tsconfig.json
git commit -m "chore: exclude portfolio scratch files from typecheck"
```

---

### Task 2: Establish Roboto Slab and semantic visual tokens

**Files:**
- Create: `public/fonts/roboto-slab-latin-wght-normal.woff2`
- Create: `public/fonts/OFL.txt`
- Modify: `index.html`
- Modify: `index.css:1-115`

**Interfaces:**
- Consumes: existing CSS variables and generated utility classes.
- Produces: `Roboto Slab` font family, surface/focus/spacing/motion custom properties, and blur-independent glass classes used by every later task.

- [ ] **Step 1: Download and verify the official font asset**

Fetch the official Google Fonts CSS for `Roboto Slab` variable weights 400–700 with a modern browser user agent, select the Latin `woff2` source, save it as `public/fonts/roboto-slab-latin-wght-normal.woff2`, and download `https://raw.githubusercontent.com/google/fonts/main/ofl/robotoslab/OFL.txt` to `public/fonts/OFL.txt`.

Run:

```powershell
$headers = @{ 'User-Agent' = 'Mozilla/5.0' }
$css = (Invoke-WebRequest -Uri 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400..700&display=swap' -Headers $headers).Content
$css | Set-Content -LiteralPath output/playwright/performance/roboto-slab-source.css
$css
```

Expected: the CSS contains a variable `font-weight: 400 700`, `font-display: swap`, and a Latin `woff2` URL. Download that exact Latin URL to the required filename. Verify both files are non-empty with `Get-Item`.

- [ ] **Step 2: Replace remote font loading with one local preload**

Remove the Google Fonts preconnects and stylesheet from `index.html`. Add:

```html
<link
  rel="preload"
  href="/fonts/roboto-slab-latin-wght-normal.woff2"
  as="font"
  type="font/woff2"
  crossorigin
>
```

Keep the existing generated Tailwind and `index.css` stylesheet links in their current order.

- [ ] **Step 3: Define the local font face and system tokens**

At the beginning of `index.css`, define:

```css
@font-face {
  font-family: 'Roboto Slab';
  src: url('/fonts/roboto-slab-latin-wght-normal.woff2') format('woff2');
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
}

:root {
  --font-slab: 'Roboto Slab', 'Rockwell', 'Roboto Serif', Georgia, serif;
  --burgundy: #4d0d1c;
  --burgundy-deep: #300510;
  --glass-light-bg: rgba(255, 250, 248, 0.82);
  --glass-light-bg-fallback: rgba(255, 250, 248, 0.94);
  --glass-light-border: rgba(255, 255, 255, 0.64);
  --glass-dark-bg: rgba(40, 3, 14, 0.72);
  --glass-dark-border: rgba(255, 255, 255, 0.18);
  --glass-highlight: rgba(255, 255, 255, 0.54);
  --glass-shadow: 0 18px 48px rgba(38, 2, 12, 0.16);
  --glass-blur-desktop: 10px;
  --glass-blur-mobile: 7px;
  --surface-radius: 2rem;
  --surface-radius-mobile: 1.25rem;
  --section-gap: 2rem;
  --section-gap-mobile: 1rem;
  --focus-light: #ffffff;
  --focus-dark: #4d0d1c;
  --motion-fast: 180ms;
  --motion-enter: 360ms;
  --motion-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
```

Tune exact alpha values during visual QA, but do not create parallel ad-hoc glass systems.

- [ ] **Step 4: Make the default glass rule readable without blur**

Define the default/fallback surface first, then enhance it:

```css
.glass-surface {
  background: var(--glass-light-bg-fallback);
  border: 1px solid var(--glass-light-border);
  box-shadow: inset 0 1px 0 var(--glass-highlight), var(--glass-shadow);
}

@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-surface {
    background: var(--glass-light-bg);
    -webkit-backdrop-filter: blur(var(--glass-blur-desktop));
    backdrop-filter: blur(var(--glass-blur-desktop));
  }
}
```

Add a mobile override using `--glass-blur-mobile`. Large section shells should initially use no real blur; add it later only if before/after profiling supports it.

- [ ] **Step 5: Replace every font family declaration**

Set `body`, form controls, `.font-heading`, timeline headings, project-card headings, mobile-nav identity, and footer headings to `var(--font-slab)`. Remove Inter, Manrope, and Montserrat declarations from application-authored CSS.

Run:

```powershell
rg -n "Inter|Manrope|Montserrat|fonts.googleapis|fonts.gstatic" index.html index.css components sections
```

Expected: no old font-loading/family references remain.

- [ ] **Step 6: Build and verify one font request and fallback/swap behavior**

Run `npm run build`, start production preview, then use Playwright CLI:

```javascript
await page.addInitScript(() => {
  window.__layoutShifts = [];
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.__layoutShifts.push(entry.value);
    }
  }).observe({ type: 'layout-shift', buffered: true });
});
await page.goto('http://127.0.0.1:4173');
await page.evaluate(() => document.fonts.ready);
const evidence = await page.evaluate(() => ({
  family: getComputedStyle(document.body).fontFamily,
  loaded400: document.fonts.check('400 16px "Roboto Slab"'),
  loaded700: document.fonts.check('700 32px "Roboto Slab"'),
  fontRequests: performance.getEntriesByType('resource')
    .filter(entry => entry.name.includes('roboto-slab') || entry.name.endsWith('.woff2'))
    .map(entry => entry.name),
  cls: window.__layoutShifts.reduce((sum, value) => sum + value, 0)
}));
```

Expected: body uses Roboto Slab, both weights return true, exactly one WOFF2 request is present, and CLS is recorded for comparison rather than assumed. Block the font request once and confirm the fallback stack renders readable content without horizontal overflow.

- [ ] **Step 7: Capture wrapping evidence at critical surfaces**

At 320×568, 375×667, 768×1024, 1280×800, and 1440×900, inspect and screenshot Hero headline/CTAs, Sidebar or mobile navbar labels, Projects filters, and Resume headings/bullets. Record any wrap-induced overflow before moving to layout work.

- [ ] **Step 8: Verify and commit the typography foundation**

```powershell
npm run typecheck
npm run build
git add -- index.html index.css public/fonts/roboto-slab-latin-wght-normal.woff2 public/fonts/OFL.txt
git commit -m "feat: establish Roboto Slab glass design foundations"
```

---

### Task 3: Build safe Reveal and section shell/header primitives

**Files:**
- Create: `components/Reveal.tsx`
- Modify: `components/SectionWrapper.tsx`
- Modify: `index.css:97-115, 493-623`

**Interfaces:**
- Produces:
  - `RevealProps { as?: 'div' | 'header' | 'article' | 'aside'; children: React.ReactNode; className?: string; delay?: number; duration?: number; distance?: number; }`
  - `SectionWrapperProps` retains `id`, `title`, `subtitle`, `children`, `className`, `variant`, and `stickyControls`.
  - CSS variables `--mobile-nav-height`, `--nav-breathing-gap`, `--section-anchor-offset`, `--sticky-top-base`, `--section-controls-height`, and `--stack-gap`.
- Consumed by: Hero (generic non-Projects entrance), About, Resume, Services, Contact, and Footer.

- [ ] **Step 1: Write the visible-fallback browser assertion before creating Reveal**

Record a Playwright CLI check that will be rerun after the component is used:

```javascript
await page.addInitScript(() => {
  Object.defineProperty(Element.prototype, 'animate', { value: undefined, configurable: true });
});
await page.goto('http://127.0.0.1:4173');
const hidden = await page.locator('[data-reveal]').evaluateAll(elements =>
  elements.filter(element => {
    const style = getComputedStyle(element);
    return style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none';
  }).length
);
```

Expected after implementation: `hidden` equals 0 even when WAAPI is unavailable.

- [ ] **Step 2: Implement `Reveal.tsx` without Framer Motion or RAF ownership**

Use a ref and `useEffect` to:

1. Return immediately for reduced motion, missing IntersectionObserver, or missing `element.animate`.
2. Observe once with a small negative bottom margin.
3. On first intersection, disconnect and call `element.animate()` with opacity `[0.78, 1]` and transform ``[`translate3d(0, ${distance}px, 0)`, 'translate3d(0, 0, 0)']``.
4. Use `duration`, `delay`, `fill: 'none'`, and the shared cubic-bezier easing.
5. Cancel the Animation and disconnect the observer on cleanup.
6. Render with `data-reveal` but no hidden initial class/style.

Do not import this component in `sections/Portfolio.tsx` or `components/ui/feature-shader-cards.tsx`.

- [ ] **Step 3: Generalize SectionWrapper sticky headings**

Refactor `SectionWrapper` so every titled section renders title, accent, and subtitle inside `.section-sticky`. Keep the existing measured `stickyControls` block inside the same sticky surface and continue publishing its real height to `--section-controls-height` for Projects.

Required rules:

- The `<section>` is the sticky containing block.
- The section owns no scroll-producing overflow, transform, filter, or size containment.
- A pseudo-element/inner layer draws the rounded shell.
- Generic headings never hide or clamp their subtitle.
- Compact mobile sticky headers remain roughly 100–130px tall beneath the navbar while retaining title and description and leaving meaningful content visible.
- Projects retains its compact filter treatment and measured stack offset.
- Sticky header itself is not wrapped in Reveal.

- [ ] **Step 4: Centralize anchor and sticky offsets**

Replace the existing offset declarations with:

```css
:root {
  --mobile-nav-height: 4.25rem;
  --nav-breathing-gap: 0.75rem;
  --sticky-top-base: var(--mobile-nav-height);
  --section-anchor-offset: calc(var(--mobile-nav-height) + var(--nav-breathing-gap));
  --stack-gap: 0.9rem;
}

.content-section {
  scroll-margin-top: var(--section-anchor-offset);
}

@media (min-width: 1280px) {
  :root {
    --sticky-top-base: 0px;
    --section-anchor-offset: 1rem;
  }
}
```

Projects card top remains derived from `--sticky-top-base + --section-controls-height + --stack-gap`; do not introduce a new numeric top value.

- [ ] **Step 5: Implement section gap/shell rules without sticky clipping**

Use outer section margins/gaps and a pseudo-element or inner layer for glass visuals. Default section shells use fallback background/border/highlight/shadow and expose Burgundy around and subtly through them. Keep What I Build Burgundy-transparent. Remove opaque `bg-white`/`bg-mist` section presentation without making body text low contrast.

- [ ] **Step 6: Verify sticky containment and fallback behavior**

In production preview:

- Force `backdrop-filter: none` and confirm shell boundaries/readability.
- Inspect computed `content-visibility`, `contain`, `overflow`, `transform`, and `filter` on every sticky ancestor.
- Scroll each general header to section end and confirm natural release.
- At 375×667 confirm every general sticky header retains description and leaves content visible.

- [ ] **Step 7: Verify Projects was not migrated**

Run:

```powershell
rg -n "Reveal" sections/Portfolio.tsx components/ui/feature-shader-cards.tsx
rg -n "MIN_SCALE|MAX_DIM|useScroll|useTransform" sections/Portfolio.tsx
```

Expected: first command returns no matches; second retains all protected motion constants/hooks.

- [ ] **Step 8: Verify and commit primitives**

```powershell
npm run typecheck
npm run build
git add -- components/Reveal.tsx components/SectionWrapper.tsx index.css
git commit -m "feat: add safe reveals and sticky glass sections"
```

---

### Task 4: Recompose the Hero responsively

**Files:**
- Modify: `sections/Hero.tsx`
- Modify: `index.css`

**Interfaces:**
- Consumes: `Reveal`, typography/surface/motion tokens.
- Produces: one `h1`, compact top-right portrait composition, responsive CTA/meta groups, measurable content-driven Hero.

- [ ] **Step 1: Record failing responsive measurements**

Before changing Hero, measure `#home.getBoundingClientRect().height`, portrait bounding box, overflow delta, and portrait position relative to the copy at 375×667, 375×812, and 768×1024. Expected baseline: Hero exceeds approved ranges and portrait follows the whole copy block.

- [ ] **Step 2: Replace the single grid with named semantic regions**

Structure the Hero as:

```tsx
<section id="home" className="hero">
  <div className="hero__inner">
    <div className="hero__intro">...</div>
    <h1 className="hero__title">...</h1>
    <p className="hero__role">...</p>
    <p className="hero__summary">...</p>
    <div className="hero__actions">...</div>
    <div className="hero__meta">...</div>
    <div className="hero__portrait">...</div>
  </div>
</section>
```

Preserve all required content and links. Remove `min-h-[100svh]` and the nested viewport minimums.

- [ ] **Step 3: Implement the phone grid that anchors portrait top-right**

Use CSS grid areas so intro and portrait share the opening zone, while title/role/summary/actions/meta span the full width below. Apply approximate portrait sizes 104×130, 116×145, and 124×155px across the specified phone ranges. Use tested `object-position` that keeps the face visible.

- [ ] **Step 4: Implement tablet and desktop compositions**

At tablet, keep portrait alongside content with a 200–240px width and reduce vertical padding to fit 650–740px content-driven height. At desktop, restore a 58–62% / 30–35% two-column relationship with portrait width approximately 320–390px and no headline dominance from the image.

- [ ] **Step 5: Make CTAs and metadata compact without hiding them**

Place View Projects and Download Resume in one compact row where width permits, allow wrapping below 360px, keep WhatsApp visually tertiary, retain accessible touch targets, and condense technology metadata to one or two lines.

- [ ] **Step 6: Replace unsafe typing/entrance dependence**

Render `profile.tagline` directly in markup so it is present before effects. Use Reveal only for generic Hero groups, with 40–60ms incremental delays and 250–500ms durations. Do not animate individual words or use blur/filter. Under reduced motion, all content is immediately final.

- [ ] **Step 7: Measure target ranges without fixed heights**

At each viewport, record:

```javascript
({
  heroHeight: document.getElementById('home').getBoundingClientRect().height,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  portrait: document.querySelector('.hero__portrait').getBoundingClientRect(),
  actions: document.querySelector('.hero__actions').getBoundingClientRect()
})
```

Expected: 500–550px at 375×667, 520–570px at 375×812, 650–740px at 768×1024, overflow 0, CTAs visible, portrait near the top-right. If a range is missed, adjust spacing/type/portrait within accessible limits; never add fixed height, clipping, or hidden required content.

- [ ] **Step 8: Verify and commit Hero**

```powershell
npm run typecheck
npm run build
git add -- sections/Hero.tsx index.css
git commit -m "feat: compact the responsive portfolio hero"
```

---

### Task 5: Integrate skip navigation and accessible glass navigation

**Files:**
- Modify: `App.tsx`
- Modify: `components/Sidebar.tsx`
- Modify: `index.css`

**Interfaces:**
- Produces:
  - `MobileNavProps { onOpen: () => void; isOpen: boolean; triggerRef: React.RefObject<HTMLButtonElement | null>; }`
  - `SidebarProps` adds `triggerRef: React.RefObject<HTMLButtonElement | null>`.
  - `main#main-content[tabIndex=-1]` and `.skip-link`.
- Consumes: glass/focus tokens and centralized anchor offsets.

- [ ] **Step 1: Add the skip-link target**

In `App.tsx`, create a `mobileMenuButtonRef`, add `<a className="skip-link" href="#main-content">Skip to main content</a>`, and give `<main>` `id="main-content"` and `tabIndex={-1}`. Pass the same trigger ref to Sidebar and MobileNav.

- [ ] **Step 2: Correct sidebar heading semantics**

Replace the sidebar identity `<h1>` with a styled paragraph or non-page-heading element. Keep the Hero as the only `h1`. Add `aria-current={active ? 'page' : undefined}` to navigation buttons so active state is programmatically exposed and testable.

- [ ] **Step 3: Implement drawer focus lifecycle**

When `isOpen` becomes true:

- Save the previously focused element.
- Lock body scrolling without shifting page width.
- Add `inert` to `main#main-content`.
- Focus the drawer close button.
- Listen for Escape and close.
- Trap Tab/Shift+Tab between visible focusable drawer controls.

On cleanup/close:

- Remove `inert` and scroll lock.
- Restore focus to `triggerRef.current`, falling back to the saved element.
- Remove listeners.

Keep Project Modal z-index above drawer/backdrop.

- [ ] **Step 4: Apply glass presentation without weakening fallback**

Use `.glass-surface` plus sidebar/mobile-specific opacity and borders. Desktop blur may be 8–10px and navbar 6–8px only inside the `@supports` enhancement. The drawer fallback remains more opaque for readability. Keep active navigation and Resume actions as Burgundy animated surfaces.

- [ ] **Step 5: Verify navigation anchor offsets from desktop and mobile**

At 1440×900, click About, Resume, Projects, Capabilities, and Contact from desktop sidebar. At 375×667 and 768×1024, open the drawer before each destination and click the corresponding button.

For each click, evaluate:

```javascript
const section = document.getElementById(targetId);
const heading = section.querySelector('h2');
({
  sectionTop: section.getBoundingClientRect().top,
  headingTop: heading.getBoundingClientRect().top,
  navBottom: document.querySelector('.mobile-nav')?.getBoundingClientRect().bottom ?? 0,
  activeLabel: document.querySelector('nav button[aria-current="page"]')?.textContent
})
```

Expected: heading is unobscured; shared-section descriptions remain visible; Projects keeps its approved specialized layout; active state matches destination.

- [ ] **Step 6: Verify direct hash navigation**

Open `/#about`, `/#resume`, `/#portfolio`, `/#services`, and `/#contact` at desktop, phone, and tablet sizes. Confirm the same offset behavior as click navigation.

- [ ] **Step 7: Verify keyboard behavior**

Using Playwright snapshot refs:

- Tab to and activate skip link; focus reaches main.
- Open drawer by keyboard.
- Confirm close button receives focus.
- Cycle Tab and Shift+Tab without escaping drawer.
- Press Escape; drawer closes and focus returns to trigger.
- Confirm background controls are not reachable while open.

- [ ] **Step 8: Verify and commit navigation changes**

```powershell
npm run typecheck
npm run build
git add -- App.tsx components/Sidebar.tsx index.css
git commit -m "feat: refine accessible glass navigation"
```

---

### Task 6: Redesign About and Capabilities with shared surfaces

**Files:**
- Modify: `sections/About.tsx`
- Modify: `sections/Services.tsx`
- Modify: `index.css`

**Interfaces:**
- Consumes: SectionWrapper sticky header, Reveal, glass/soft-surface tokens.
- Produces: editorial About layout, compact metadata rail, and responsive capability grid.

- [ ] **Step 1: Tighten About copy without losing facts**

Split the existing narrative into shorter scannable paragraphs or a compact lead plus support sentence. Preserve software, product development, real-world systems, user-focused interfaces, backend services, connected hardware, testing, practical problem solving, technical operations, customer-facing experience, installation, support, explanation, and real-environment use.

- [ ] **Step 2: Recompose About**

Keep the animated Burgundy narrative card on the left and Technical Toolkit on the right at desktop. Use soft surfaces for skill groups, retain every tool/technology, and place Location, Email, Phone, and Status in one concise metadata rail beneath both columns.

- [ ] **Step 3: Add generic entrances only to About content**

Wrap narrative/toolkit/metadata groups or individual toolkit cards in Reveal with 50–70ms stagger. Do not wrap the sticky header or Burgundy animation runtime.

- [ ] **Step 4: Redesign Capabilities cards**

Keep the animated Burgundy section environment and all four capability facts. Apply soft translucent cards with Burgundy icon wells, improved line length, 1–2px hover lift, and 320–400ms Reveal entrances. Use 2×2 desktop/tablet where space permits and one column on mobile.

- [ ] **Step 5: Verify responsive and sticky behavior**

At 320×568, 375×667, 768×1024, 1024×768, and 1440×900 verify no technology chip overflow, visible sticky title/description, natural header release, readable fallback without blur, and Burgundy visibility around/through About.

- [ ] **Step 6: Run Projects smoke check**

Open Projects, switch All → R&D / IoT → All, open Eventies, navigate one gallery image, close modal, and confirm stack scale/dim still works.

- [ ] **Step 7: Verify and commit About/Capabilities**

```powershell
npm run typecheck
npm run build
git add -- sections/About.tsx sections/Services.tsx index.css
git commit -m "feat: redesign about and capabilities sections"
```

---

### Task 7: Build the editorial Resume and Professional Journey

**Files:**
- Modify: `sections/Resume.tsx`
- Modify: `index.css:116-286` and Resume-specific additions
- Inspect: `data/profile.ts` experience facts

**Interfaces:**
- Consumes: SectionWrapper, Reveal, BurgundyWarpBackground, exact `experience` data.
- Produces: editorial summary, vertical timeline entries, Terminal VR role-progression block, and non-sticky supporting Resume stack.

- [ ] **Step 1: Create a factual content ledger before editing**

Copy every current experience title, period, location, role phase, and detail bullet into working notes. Map each fact to its planned output bullet/supporting sentence. Do not proceed while any source fact lacks a destination.

- [ ] **Step 2: Tighten the professional summary**

Remove repeated phrasing between `profile.professionalSummary` and the appended sentence while preserving web, desktop, cross-platform, automation, computer vision, embedded/connected systems, technical operations, integration, troubleshooting, customer-facing experience, requirements, interface design, implementation, hardware integration, testing, and deployment preparation.

- [ ] **Step 3: Replace the document/dashboard feel with editorial hierarchy**

Use a restrained summary surface followed by a dominant timeline column and a supporting stack. Keep the Resume download feature animated Burgundy. Education and Core Strengths use soft translucent surfaces. Do not make the support stack sticky initially.

- [ ] **Step 4: Rebuild Journey entries as premium timeline articles**

Each entry contains image/node, role/company heading, date chip, location/context, and 2–4 scannable factual bullets. Combine overlapping sentences only when every responsibility remains represented.

For The Terminal VR, render one company article with:

```text
01 Sales Representative — Jan 2025–Feb 2025
02 Technical Operations Engineer — Feb 2025–Jul 2025
```

Keep promotion and all sales/technical/sole-operations facts within that one entry.

- [ ] **Step 5: Replace slow timeline motion**

Make the rail static or animate it once in no more than 360ms. Use Reveal for each generic experience article at approximately 360ms with 60ms stagger. Remove the existing 1.05-second scroll-drawn rail and nested per-child Framer variants. Keep base content visible.

- [ ] **Step 6: Verify the content ledger**

Compare rendered text to the Task 7 factual ledger. Confirm no date, title, location, employer, role sequence, technology, responsibility, education fact, or seniority claim changed or disappeared.

- [ ] **Step 7: Verify responsive editorial behavior**

At 320×568, 375×667, 390×844, 768×1024, 1024×768, and 1440×900 verify date-chip wrapping, readable bullets, one-column mobile timeline, visible sticky description, no horizontal timeline, no nested sticky conflict, and no SaaS-like widget grid.

- [ ] **Step 8: Verify Resume downloads and Projects**

Confirm PDF and Word links return 200/download responses. Repeat the Projects filter/modal/stack smoke check.

- [ ] **Step 9: Verify and commit Resume**

```powershell
npm run typecheck
npm run build
git add -- sections/Resume.tsx index.css
git commit -m "feat: redesign the professional journey timeline"
```

---

### Task 8: Refine Contact and Footer

**Files:**
- Modify: `sections/Contact.tsx`
- Modify: `components/Footer.tsx`
- Modify: `index.css:287-484` and Contact-specific additions

**Interfaces:**
- Consumes: SectionWrapper, Reveal, surface tokens, BurgundyWarpBackground.
- Produces: sticky Contact layout, accessible contact rows, and compact consistent Footer.

- [ ] **Step 1: Recompose Contact**

Keep the animated Burgundy opportunity feature and all current contact methods. Use a balanced desktop two-column layout and mobile feature-first stack. Contact rows use soft translucent surfaces, wrap long values, and expose meaningful link names.

- [ ] **Step 2: Apply generic entrances**

Use Reveal for the Contact feature and contact rows with 50–70ms stagger. Keep the sticky header visible and unanimated by Reveal.

- [ ] **Step 3: Refine Footer without rebuilding it**

Retain existing brand copy, navigation, social links, email, back-to-top action, copyright, location, and Burgundy animation. Apply Roboto Slab, consistent borders/highlights, glass social controls, and reduced mobile spacing only.

- [ ] **Step 4: Verify contact semantics and targets**

Check email, phone, WhatsApp, LinkedIn, and Instagram hrefs; ensure linked rows have accessible names; confirm interactive sizes are at least 44px where practical; inspect focus rings on both light and Burgundy surfaces.

- [ ] **Step 5: Verify responsive and fallback behavior**

At 320×568, 375×667, 768×1024, and 1440×900 verify sticky title/description, long email wrapping, no overlap, Footer compaction, Burgundy visibility, and readable glass with blur disabled.

- [ ] **Step 6: Verify and commit Contact/Footer**

```powershell
npm run typecheck
npm run build
git add -- sections/Contact.tsx components/Footer.tsx index.css
git commit -m "feat: refine contact and footer surfaces"
```

---

### Task 9: Verify safe motion, reduced motion, and failure fallbacks

**Files:**
- Modify if findings require: `components/Reveal.tsx`
- Modify if findings require: `sections/Hero.tsx`
- Modify if findings require: `sections/Resume.tsx`
- Modify if findings require: `index.css`

**Interfaces:**
- Consumes: all generic Reveal consumers and protected Projects motion.
- Produces: evidence that generic content never depends on animation completion and Projects remains separate.

- [ ] **Step 1: Verify WAAPI-unavailable fallback**

Create a new browser context that removes `Element.prototype.animate` before page scripts, load the production preview, visit every section, and assert every `[data-reveal]` element has nonzero opacity, visible display/visibility, and nonempty bounding dimensions.

- [ ] **Step 2: Verify IntersectionObserver-unavailable fallback**

Repeat with `window.IntersectionObserver = undefined` before page scripts. Expected: all generic content is immediately visible and no runtime error appears.

- [ ] **Step 3: Verify backgrounded/paused-frame safety**

Load the page, immediately open another tab, wait, return, and confirm Hero, About, Resume, Capabilities, Contact, and Footer content is visible. Check console for animation errors.

- [ ] **Step 4: Verify reduced motion**

Use `page.emulateMedia({ reducedMotion: 'reduce' })`, reload, and confirm:

- Generic entrances are skipped.
- Hero tagline is immediately complete.
- Smooth anchor scrolling is disabled.
- Burgundy renders a coherent static frame.
- Projects scale/dim decorative motion is disabled through its existing `useReducedMotion` path.
- Sticky positioning, drawer, modal, and content visibility still work.

- [ ] **Step 5: Prove Projects remains on its protected architecture**

```powershell
rg -n "Reveal" sections/Portfolio.tsx components/ui/feature-shader-cards.tsx
rg -n "useReducedMotion|useScroll|useTransform|MIN_SCALE|MAX_DIM" sections/Portfolio.tsx
```

Expected: no Reveal import/use in protected files; protected motion remains.

- [ ] **Step 6: Apply only evidence-backed corrections and commit if needed**

If no correction is needed, do not create an empty commit. If corrections are needed:

```powershell
git add -- components/Reveal.tsx sections/Hero.tsx sections/Resume.tsx index.css
git commit -m "fix: harden portfolio motion fallbacks"
```

---

### Task 10: Run three after benchmarks and tune glass performance

**Files:**
- Modify if measurement requires: `index.css`
- Modify shader runtime only with separate evidence and approval: `components/ui/global-burgundy-warp-background.tsx`, `components/ui/burgundy-warp-background.tsx`
- Artifacts: `output/playwright/performance/after-run-{1,2,3}.txt`, `output/playwright/performance/after-summary.md`

**Interfaces:**
- Consumes: Task 1 benchmark code and viewport unchanged.
- Produces: three-run before/after distribution comparison and evidence-backed glass tuning.

- [ ] **Step 1: Build and serve the final candidate**

```powershell
npm run typecheck
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

- [ ] **Step 2: Run the exact Task 1 benchmark three times**

Use a new `perf-after` browser session at 1440×900. Define the same benchmark body and save raw results to `after-run-1.txt`, `after-run-2.txt`, and `after-run-3.txt`:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=perf-after open http://127.0.0.1:4173
npx --yes --package @playwright/cli playwright-cli -s=perf-after resize 1440 900
$benchmark = @'
() => new Promise(resolve => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  const frames = [];
  const longTasks = [];
  let observer;
  try {
    observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) longTasks.push(entry.duration);
    });
    observer.observe({ entryTypes: ['longtask'] });
  } catch {}
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const startedAt = performance.now();
  let previous = startedAt;
  const step = now => {
    frames.push(now - previous);
    previous = now;
    const progress = Math.min(1, (now - startedAt) / 7000);
    window.scrollTo(0, maxScroll * progress);
    if (progress < 1) return requestAnimationFrame(step);
    observer?.disconnect();
    const sorted = [...frames].sort((a, b) => a - b);
    const percentile = ratio => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] || 0;
    resolve(JSON.stringify({
      duration: now - startedAt,
      frames: frames.length,
      average: frames.reduce((sum, value) => sum + value, 0) / frames.length,
      p50: percentile(0.50),
      p95: percentile(0.95),
      p99: percentile(0.99),
      max: Math.max(...frames),
      over20: frames.filter(value => value > 20).length,
      over34: frames.filter(value => value > 34).length,
      longTasks,
      longTaskTotal: longTasks.reduce((sum, value) => sum + value, 0),
      scrollHeight: document.documentElement.scrollHeight,
      canvases: document.querySelectorAll('canvas').length,
      webglSources: document.querySelectorAll('canvas[data-warp-source="shared-webgl"]').length
    }));
  };
  requestAnimationFrame(step);
})
'@
1..3 | ForEach-Object {
  npx --yes --package @playwright/cli playwright-cli --raw -s=perf-after eval $benchmark |
    Tee-Object -FilePath "output/playwright/performance/after-run-$_.txt"
}
```

Expected: each run reports one WebGL source and completes the same seven-second top-to-bottom traversal.

- [ ] **Step 3: Compare full distributions and medians**

Create `after-summary.md` with a table containing all three before values, before median, all three after values, after median, and median delta for:

- average frame interval.
- p50.
- p95.
- p99.
- maximum frame interval.
- frames over 20ms.
- frames over 34ms.
- long-task total.
- canvas count.
- WebGL source count.

Do not call the redesign smoother based on the best run or median alone; inspect variance and outliers across all six runs.

Generate the comparison table with:

```powershell
function Get-Median([double[]]$values) {
  $ordered = @($values | Sort-Object)
  $count = $ordered.Count
  if ($count % 2 -eq 1) { return $ordered[[math]::Floor($count / 2)] }
  return ($ordered[$count / 2 - 1] + $ordered[$count / 2]) / 2
}
function Get-Runs([string]$label) {
  return @(1..3 | ForEach-Object {
    Get-Content -LiteralPath "output/playwright/performance/$label-run-$_.txt" -Raw |
      ConvertFrom-Json
  })
}
$before = Get-Runs 'before'
$after = Get-Runs 'after'
$metrics = 'average','p50','p95','p99','max','over20','over34','longTaskTotal','canvases','webglSources'
$rows = foreach ($metric in $metrics) {
  $beforeValues = @($before | ForEach-Object { [double]($_.$metric) })
  $afterValues = @($after | ForEach-Object { [double]($_.$metric) })
  $beforeMedian = Get-Median $beforeValues
  $afterMedian = Get-Median $afterValues
  "| $metric | $($beforeValues -join ', ') | $beforeMedian | $($afterValues -join ', ') | $afterMedian | $($afterMedian - $beforeMedian) |"
}
@(
  '# Before/after scroll benchmark',
  '',
  '| Metric | Before runs | Before median | After runs | After median | Median delta |',
  '|---|---|---:|---|---:|---:|'
) + $rows | Set-Content -LiteralPath 'output/playwright/performance/after-summary.md'
```

- [ ] **Step 4: Isolate glass cost first if regression exists**

If the after distribution is measurably worse, temporarily force:

```css
*, *::before, *::after {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}
```

Rerun at least three diagnostic passes. If the distribution recovers, reduce or remove blur from the largest/persistent surfaces, starting with section shells, then sidebar/navbar. Preserve translucent backgrounds, borders, highlights, shadows, and the Burgundy shader.

- [ ] **Step 5: Investigate other costs only if blur isolation does not explain them**

Check persistent `will-change`, shadow count, active canvas subscriptions, image decoding, sticky layout invalidation, ResizeObserver churn, and new listeners. Do not rewrite or reduce the Burgundy shader unless traces isolate it as the remaining cause and visual comparison confirms an acceptable targeted change.

- [ ] **Step 6: Rerun the three-run after set after tuning**

Discard superseded after artifacts only from the comparison note, not from raw evidence. Capture a fresh final set of three identical runs and update the distribution table.

- [ ] **Step 7: Commit only evidence-backed performance changes**

If CSS tuning was required:

```powershell
git add -- index.css
git commit -m "perf: reduce glass compositor cost"
```

If no code change was required, do not create an empty commit.

---

### Task 11: Run Projects regression and critical-flow verification

**Files:**
- Modify only for proven regression: owning file from the protected boundary
- Artifacts: `output/playwright/redesign/projects-*.png`

**Interfaces:**
- Consumes: complete redesign candidate.
- Produces: regression evidence for Projects, drawer/modal layering, downloads, contact, and anchors.

- [ ] **Step 1: Verify filters and rebasing**

At desktop and mobile, scroll into the Projects stack, select every filter, confirm visible cards match category, counter rebases correctly, controls remain visible, and returning to All restores order.

- [ ] **Step 2: Verify stack geometry and motion**

At 375×667, 768×1024, and 1440×900, scroll through at least the first three cards and verify sticky pinning, overlap, `MIN_SCALE`, `MAX_DIM`, short-list behavior, no clipping, no horizontal overflow, and reduced-motion behavior.

- [ ] **Step 3: Verify modal/gallery**

Open a project, navigate all available gallery controls, test keyboard focus/Escape, inspect responsive image fit, close, and confirm focus returns to the project trigger.

- [ ] **Step 4: Verify drawer/modal layering**

Open/close the drawer, then Project Modal, and inspect backdrop/drawer/modal stacking. The hamburger must never float above the drawer; modal must remain topmost.

- [ ] **Step 5: Verify downloads/contact/anchors**

Confirm Resume PDF/DOCX, email, phone, WhatsApp, LinkedIn, Instagram, skip link, sidebar destinations, drawer destinations, and direct hashes.

- [ ] **Step 6: Apply the smallest owning fix if a regression is found**

Do not redesign protected code. Reproduce, identify the exact root cause, patch only the owning compatibility rule, rerun the affected flow plus neighboring behavior, and commit explicit paths with a `fix:` message describing the regression.

---

### Task 12: Complete responsive, accessibility, visual, and production QA

**Files:**
- Create: `docs/qa/portfolio-redesign-verification.md`
- Modify only for proven finding: exact owning source/CSS file
- Artifacts: `output/playwright/redesign/**`, `output/playwright/accessibility/**`

**Interfaces:**
- Consumes: final candidate and Tasks 1–11 evidence.
- Produces: review-ready verification report and required screenshots.

- [ ] **Step 1: Run the viewport matrix and continuous resize audit**

Check 320×568, 360×640, 375×667, 375×812, 390×844, 430×932, 600×900, 768×1024, 820×1180, 900×900, 1024×768, 1280×800, 1366×768, 1440×900, 1920×1080, and 2560×1440 when supported. Drag continuously through breakpoints. Record Hero heights, overflow, sticky density/release, wrapping, portrait crop, glass readability, and layout transitions.

- [ ] **Step 2: Capture required screenshots**

Capture:

- 1440×900: Hero, About, Resume, Professional Journey, Projects, What I Build, Contact, Footer.
- 375×667 and 390×844: Hero, About, Resume/Journey, Projects, Capabilities, Contact, drawer open.
- 768×1024: Hero, About, Resume, Projects.
- Representative light/dark glass with normal blur and forced `backdrop-filter: none`.

- [ ] **Step 3: Verify Roboto Slab final behavior**

Repeat Task 2 font evidence on production preview. Record:

- Exactly one local WOFF2 request and no Google Fonts request.
- `document.fonts.check` success at 400 and 700.
- CLS from a clean reload.
- Fallback readability with the font blocked.
- Final wrapping/overflow screenshots for Hero, Sidebar/mobile navbar, Projects filters, and Resume.

- [ ] **Step 4: Run accessibility checks**

Verify semantic headings/landmarks, skip link, full keyboard journey, visible focus, drawer and modal focus traps, Escape/focus restoration, contrast over moving Burgundy, 200% zoom, 320px layout, touch targets, image alternatives, reduced motion, and blur-disabled readability.

- [ ] **Step 5: Run final production commands**

```powershell
npm run typecheck
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Inspect console and network logs. Expected: no new runtime errors, failed font/image assets, or unhandled warnings. Report the existing favicon baseline separately if still present.

- [ ] **Step 6: Write the verification report**

In `docs/qa/portfolio-redesign-verification.md`, record:

- Files changed.
- Commands and results.
- Before/after three-run performance tables and medians.
- WebGL contexts and RAF owners before/after.
- Font request/CLS/fallback evidence.
- Hero measured ranges.
- Anchor navigation results.
- Viewports and screenshots.
- Accessibility findings.
- Projects regression results.
- Glass fallback result.
- Remaining compromises and risks.

- [ ] **Step 7: Commit the verification report and any final proven fixes separately**

For final source fixes, stage only owning files and commit with a specific `fix:` message. Then commit the report:

```powershell
git add -- docs/qa/portfolio-redesign-verification.md
git commit -m "docs: record portfolio redesign verification"
```

---

### Task 13: Perform final code review and completion gate

**Files:**
- Review: all files changed since the SHA stored in `docs/qa/approved-baseline-checkpoint.txt`
- Modify only for valid findings: exact owning files

**Interfaces:**
- Consumes: complete implementation, production evidence, and design spec.
- Produces: reviewed final branch with no known blocking finding.

- [ ] **Step 1: Review the scoped diff**

Run:

```powershell
$env:APPROVED_BASELINE_CHECKPOINT = ((Get-Content -LiteralPath 'docs/qa/approved-baseline-checkpoint.txt' -Raw).Trim() -replace '^APPROVED_BASELINE_CHECKPOINT=', '')
git cat-file -e "$env:APPROVED_BASELINE_CHECKPOINT^{commit}"
git diff --stat "$env:APPROVED_BASELINE_CHECKPOINT..HEAD"
git diff "$env:APPROVED_BASELINE_CHECKPOINT..HEAD" -- App.tsx index.html index.css components sections tsconfig.json docs/qa public/fonts
```

Review specifically for duplicated glass values, opaque section shells, unsupported claims, lost responsibilities, expensive filters/shadows, unsafe sticky ancestors, arbitrary offsets, permanent `will-change`, new RAF/scroll loops, dead CSS, drawer/modal accessibility, and Projects changes.

- [ ] **Step 2: Request independent code review using the required review workflow**

Invoke `requesting-code-review`, provide the approved design spec, this plan, the SHA stored as `APPROVED_BASELINE_CHECKPOINT`, and the verification report. Require reviewers to prioritize functional regressions, performance, accessibility, content accuracy, and Projects protection over subjective restyling.

- [ ] **Step 3: Validate and apply review findings**

Use `receiving-code-review`: reproduce each factual finding, reject unsupported preference changes, make the smallest correct fix, and rerun the owning task's verification plus Projects smoke coverage.

- [ ] **Step 4: Run verification-before-completion**

Freshly rerun typecheck, build, production preview critical flows, required responsive screenshots affected by final fixes, reduced motion, blur-disabled glass, and the final three-run benchmark if any performance-relevant CSS/runtime changed after Task 10.

- [ ] **Step 5: Confirm completion criteria**

Do not declare completion unless:

- Hero is content-driven and within approved target ranges without clipping.
- Shared sticky titles/descriptions and centralized anchors work.
- Burgundy remains visible and unchanged in identity.
- Glass works without blur and causes no meaningful benchmark regression.
- Roboto Slab loads once with verified fallback/CLS/wrapping.
- Resume/Journey is editorial and fact-complete.
- Projects, drawer, modal/gallery, downloads, contact links, keyboard, focus, reduced motion, 200% zoom, typecheck, build, and preview pass.

If any item remains weak, return to the owning task rather than reporting completion.
