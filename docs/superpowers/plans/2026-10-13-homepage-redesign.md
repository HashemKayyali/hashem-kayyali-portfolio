# Engineering Fieldnotes Homepage Implementation Plan

> Inline execution, explicitly authorized autonomously by the user. No direction/approval handoff. Keep all existing uncommitted work and checkpoint it; no commits or deployment.

**Goal:** Replace only the homepage with an original, responsive engineering portfolio.
**Architecture:** A standalone EngineeringHome component and scoped stylesheet. A component-owned motion hook and typed multilingual presentation labels. LightPortfolio selects this Home for both homepage URL families; existing Header functionality and all non-home views remain unchanged.
**Tech Stack:** React 19, TypeScript, Vite, installed GSAP/useGSAP, native controls.
**Spec:** docs/design/HOMEPAGE-VISION.md

## Constraints and review focus
V1 read only; no dependencies or fabricated facts; preserve five locales and privacy-safe assets. Test long French/German labels, Arabic bidi, smallest viewport, rapid selection/route changes, reduced motion. Existing native header/menu and language functionality remain available.

### Task 1: Establish visual and behavioral evidence
- [x] Snapshot current workspace and unchanged-page screenshots.
- [x] Create/capture independent hero source board at 1366/390.
- [x] Run a browser acceptance assertion for project selection against current Home and observe expected failure (feature absent).

### Task 2: Build scoped Home
- [x] Create preview/EngineeringHome.tsx, preview/engineering-home.css, preview/engineering-home-motion.ts and preview/engineering-home-copy.ts.
- [x] Integrate in preview/LightPortfolio.tsx; add new Home ownership to preview/motion.ts without changing other-page behavior.
- [x] Verify native project selection updates image/title/link, route and locale changes clean up, reduced motion presents all content.

### Task 3: Refine and verify
- [x] Capture laptop/desktop/mobile across five languages; inspect actual images, wrapping, focus and interactions.
- [x] Compare source/implementation together and fix substantive issues.
- [x] Run typecheck, build, regression/content tests, unchanged-page comparisons and file preservation audit.
- [x] Profile built Home with Chrome DevTools MCP, capture real browser recordings, save QA/report and local review viewer.

Completion evidence: root design-qa.md and docs/design/HOMEPAGE-REDESIGN-VERIFICATION.md. Ruling: image preload follows the newly critical Bike Tower hero; index/prerender Home-only preload branches were updated. Real browser red/green tests justify project-history restoration and live motion cancellation. Existing runtime edits remain four files; all facts/media and non-home components are unchanged.

Ruling: user explicitly supersedes preservation of homepage aesthetics and authorizes autonomous direction. Existing branch is already isolated V2; a verified archive preserves the complete pre-change state. Inline code implementation; read-only final reviewer after shared rules are established.
