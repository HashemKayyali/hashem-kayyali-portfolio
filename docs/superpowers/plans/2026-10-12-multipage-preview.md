# Light Burgundy Multi-Page Preview Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline. The user requests a working first preview, then visual approval; implementation runs inline, with the final read-only review required by the review skill.

**Goal:** Build a working premium Home, Projects, Skills and Contact foundation and prepare About, Experience and all 11 case routes using approved content.

**Architecture:** Retain the existing React/Vite V2 worktree, content dictionaries, three visual stories, shared GSAP/ScrollTrigger and fluid renderer. A small path router owns localized page identity/history. Shared navigation, local metadata/static route shells and accessible page focus wrap purpose-specific pages. The contact form validates input and prepares a real mailto draft without pretending to send.

**Tech Stack:** React 19, Vite 6, TypeScript, GSAP 3.15 / ScrollTrigger; prepared Rive loader with honest SVG fallback; existing imagegen assets; actual Playwright / Chrome DevTools MCP.

**Spec:** `C:/Users/hashe/.codex/attachments/4f13c894-1e55-4698-9501-da81f7450c61/Pasted text.txt`

## Global Constraints

- Work only in `site-v2-light-burgundy`, branch `codex/portfolio-v2-light-burgundy`; preserve V1 and old V2 changes.
- No reset, overwrite of unrelated work, merge, push or deployment.
- Preserve approved identity, six About paragraphs, graduated status, grouped Terminal roles, all 11 projects and five languages.
- No invented facts, skills, proficiency, customers, results, UI evidence or .riv asset.
- Stop after first working multi-page preview for visual approval.

## Review Focus

- Direct refresh/deep links must render the intended V2 page rather than V1's root entry.
- Rapid language/history changes must keep complete content, page, slug and RTL consistent.
- Mobile navigation and long translated headings must remain usable at 320px.
- Contact validation must prevent malformed drafts and explicitly describe the real action.
- Motion cleanup must survive repeated route changes, reduced motion and constrained devices.

### Task 1: Routing and direct-link delivery

- [x] Add failing pure tests for localized paths, query compatibility, unknown slugs and contact draft validation.
- [x] Implement `routes.ts`, localized UI-only copy and contact model.
- [x] Configure dev/preview fallback only for V2 page paths; generate static localized route shells and metadata after build.
- [x] Run tests/typecheck and inspect a direct project/page request.

### Task 2: Shared shell and meaningful pages

- [x] Add responsive active navigation, page focus/history and GSAP transitions with cleanup.
- [x] Build Home: existing refined hero, concise approved About, three featured products, factual career highlights and selected real skills.
- [x] Build Projects: all 11, category filters, large imagery with varied composition and genuine status/link distinctions.
- [x] Build Skills: all approved categories/items, no proficiency ratings.
- [x] Build Contact: actual links plus validated draft form, controlled motion and clear result.
- [x] Prepare full About, grouped Experience, education/resume and all existing case routes.

### Task 3: First-review evidence

- [x] Test all page routes, back/forward, languages, keyboard/mobile navigation, filters/contact, reduced motion and media through actual Playwright MCP.
- [x] Capture desktop/mobile/RTL previews and actual GSAP recordings; update Motion Lab and comparisons.
- [x] Profile final Home / navigation with actual Chrome DevTools MCP, disclose limits and bundle/latency changes.
- [x] Verify untouched worktrees and fresh audit/build/content tests; present the local preview and stop for approval.

## Execution ledger

- Task 1 complete: route/contact tests observed failing before implementation, then passing. Legacy fragments restricted to unlocalized links after review. Dev and preview resolve localized direct paths; build emits 85 localized route shells.
- Task 2 complete: six purposeful pages plus eleven cases reuse approved dictionaries. Responsive navigation, page focus and route-scoped GSAP retain native scrolling. Contact prepares a reviewed mailto draft, never claims delivery.
- Task 3 complete: actual official MCP evidence retained in ignored output. 150 page layouts and 75 visual-case layouts; all eleven English case narratives, filters/history/reload/RTL/menu/dialog/contact/resume verified. Four existing tests, six pure tests, fourteen content checks, typecheck, build and audit pass. Desktop/mobile/Arabic screenshots and real WebM recordings produced.
- Ruling: static localized route shells remain noindex rather than migrating production SEO now — the user requires approval of the first preview before final website work. Cost: production SSR/structured-data/hosting integration remains for the approved phase.
- Ruling: unavailable authored Rive asset uses the working accessible fallback and documented asset contract — a fabricated .riv or false completion claim would violate the brief. Cost: genuine Rive success-path validation remains pending the asset.
- Final review: separate read-only agent, no writes. Three P2 findings (Home fragment, mailto encoding, Home heading focus) reproduced RED then fixed GREEN. No additional blocking motion/privacy/fallback issues.
- Source safety: active branch codex/portfolio-v2-light-burgundy; V1 clean; old V2 retains only its pre-existing package/lock modifications. No reset, merge, push or deployment.
- Approval boundary: implementation stops at this first working multi-page preview, as the user's latest brief explicitly requires.

Final interaction profiling: actual DevTools MCP mobile menu/page clicks at CPU4x observed a maximum 408 ms click duration. This is a local trace, not field INP. Route-transition responsiveness needs further optimization before production; idle long-task results do not prove fast interactions. Motion Lab scene/localization/pause, both video files, review screenshots and case modified-click/back links were also verified through actual Playwright MCP.
