# Compact portfolio and cloud Studio verification —16 October2026

Owner approved the concrete visual candidate and all interface changes, and selected Supabase data, Cloudinary files and Vercel hosting with accounts to follow later. This implementation is limited to writable V2. The verified pre-implementation checkpoint is `output/checkpoints/design-intelligence-before-2026-10-15-233934.zip` (889 files). No reset, clean, commit, push, merge, account creation or deployment occurred.

## Delivered behavior

- Shared compact1280px content measure, smaller controls retaining44px targets, content-driven Home/About heroes and centered phone identity. Skills/Contact now use the shared smoke hero. Existing five palettes, typefaces, original media and stationary Home/About portrait node remain.
- Home engineering story uses native sticky geometry and a bounded GSAP sequence at phone and desktop sizes. All three images change with the current chapter; phone paragraphs and excess board chrome are hidden. Career rows use equal responsive heights and small inline indices.
- Experience exposes all six original roles without opening disclosures. Authentic logos/R&D photo are unboxed, with captions. Skills retains32 factual tools/five categories/four capabilities, compact chips and phone evidence immediately after the selected chip. No new ScrollTrigger is used.
- Case galleries use pinned Embla8.6 React, stable mounted slides, decode-gated latest intent, nearby image preparation, native pointer drag, RTL/keyboard, responsive resizing and fullscreen focus return. The existing detail-hero structure/composition remains protected.
- Five-locale Gallery, Journal and Admin routes share the existing shell/theme. Public pages start honestly empty. Admin prepares image-only project overrides, media upload, accessible descriptions, editorial drafts/publication, order and deletion. Authored project facts remain in code.
- Same handler serves the Vite API and Vercel Node endpoint. Supabase migration, server-only configuration, signed/verified Cloudinary uploads, single-admin8080 sessions and deployment configuration are prepared. See `CLOUD-STUDIO-SETUP.md` for setup and limits.

## Fresh verification evidence

| Check | Result |
| --- | --- |
| `npm run typecheck` | exit0 |
| `node --test tests/*.test.mjs preview/*.test.mjs` |74 passed,0 failed |
| `npm run validate:content` |14/14 passed;11 projects/five locale dictionaries/facts retained |
| `npm run build:light` | exit0;200 localized route shells |
| `git diff --check` | exit0; pre-existing line-ending notices only |
| Actual local HTTP API5176/4176 | missing providers produce configuredfalse/empty public data; unauthorized writes401 |
| Browser bundle boundary | no server auth, Cloudinary verification or Supabase implementation in browser chunks |
| Independent final read-only review | previous findings corrected; no remaining actionable finding reported |

Actual Chromium layout evidence includes18 initial and72 development samples at390/1440 and320/768/1024/1920, followed by81 production page samples across all five languages at320/390/820/1180/1440/2560/3840. Measurements cover phone, tablet portrait/landscape and desktop CSS viewports; they do not certify physical monitor inches. Matrices reported no horizontal page overflow, duplicate main landmarks or hidden headings. The final production matrix also verifies header containment.44 additional case samples cover all eleven cases in English/Arabic at390/1440; no broken evidence images or page overflow. Cold decode samples taken at80ms were followed by explicit pending=false/last-image settlement probes rather than treating network decoding as completed motion.

Interaction evidence: phone engineering story progresses01→02→03 with a sticky board and hidden paragraphs; phone selected-tool result is its immediate DOM sibling; gallery End/Home/rapid next/RTL keys/resize/fullscreen and focus return; shared portrait node survives Home→About; browser Back returns to a fully visible case image/header; desktop and phone Studio navigation; five real theme-menu selections produce their expected light companion panels. Controlled API fixtures exercise admin login, draft save, edit, publish, public read, unpublish, delete and logout; gallery publish/filter/dialog/focus; project save and propagation of per-project alt through hero, gallery and fullscreen. Fixture data is not persisted or shipped as portfolio content.

## Findings corrected

-320px menu wrapped beyond the fixed header; narrowed language control and kept the header row intact. Centered the flex-based phone name explicitly. A historical selector overrode the intended phone action size; increased the scoped selector so compact hero actions retain a single text line.
- Lazy Studio routes could insert their hero after atmosphere measurement; a bounded insertion observer attaches the resize observer when the real hero exists.
- A delayed editorial save could pair a new identity with another draft; atomic reducer identity/draft transitions, request tokens and pending-control locks prevent the race. Failed writes preserve the unsaved draft.
- Long-list ordering used a200-ID payload; adjacent transactional movement now operates on the complete real order. Read sorting shares the RPC's ID tie-breaker; new rows append after max saved position.
- Replayed upload registration could erase published alternative text; ignore-duplicate registration returns the existing record. Editing image metadata cannot remove required alt.
- Public project consumers discarded per-project alt and related cards ignored saved covers; shared resolution now supplies descriptions and covers consistently.

## Artifacts

Ignored local artifacts: `output/compact-initial.json`, `compact-matrix.json`, `compact-production-matrix.json`, `compact-interactions.json`, `compact-cases-themes.json`, `studio-browser-qa.json`, plus final phone/history/project Studio records and the matching `compact-*.png` / `studio-*-fixture*.png` captures. The candidate source/image remains in `output/compact-studio-candidate/`. Source specs and implementation plan are under `docs/design/COMPACT-STUDIO-PROPOSAL.md` and `docs/superpowers/plans/2026-10-16-compact-studio.md`.

## Explicit remaining environment limits

No real cloud accounts/keys exist yet. Supabase SQL/RLS/RPC execution, real Cloudinary upload/video playback and actual Vercel deployment/routing require the owner's accounts and must be checked after connection. Provider tests use controlled boundaries; they do not prove external service configuration. Public feeds currently return the first200 published records; the admin reads all pages. Cloudinary originals remain after website-record deletion. Basic login throttling is per process, not distributed. Existing review noindex remains intentional.

Browser verification used local Chromium, emulated CSS sizes and pointer/keyboard interactions. Physical iPhone/iPad, Safari/Firefox, assistive-technology certification and fresh CPU-throttled production performance profiling were not performed. No universal frame-rate or WCAG certification claim is made.
