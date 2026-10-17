# Hashem Portfolio V2 — master design system

13 October 2026. This document codifies the owner's approved identity. The later Creative Director brief explicitly authorizes responsive geometry corrections across V2 and ONE separate Creative Lab direction. The Lab is a local visual-review candidate, not a replacement or production promotion. The prior narrow refinement boundary is superseded only within that newer brief.

## Purpose and direction

Recruiters and hiring managers should understand Hashem's R&D Product Engineering and Software Engineering work, inspect genuine evidence, then reach projects, résumé and contact without friction. Use light editorial composition: warm paper, readable ink, strong but restrained Wine accents, real product media, and organic V1 motion. Preserve eleven projects, five dictionaries and approved professional facts. Case copy follows Problem → Product Decision → Technical Solution → Stakeholder Value → Result; unsupported results stay absent.

## Existing tokens — single source of truth

`preview/brand.css` owns color values. Do not generate a competing theme, migrate to Tailwind/shadcn, or take automatic palettes from a skill search.

| Role / existing token | Value | Use |
| --- | --- | --- |
| Primary / `--burgundy` | #58152D | Actions, headings, selected states, pigment |
| Supporting / `--burgundy-secondary` | #70203A | Controlled pigment highlights and accents |
| Deep / `--wine` | #3E1022 | Stronger hover and smoke shadows |
| Paper / `--paper` | #FCFAF9 | Reading and page background |
| Reading surface / `--white` | #FFFFFF | Forms and small panels |
| Ink / `--ink` | #2D2428 | Primary reading text |
| Secondary text / `--muted` | #675E62 | Supporting text |
| Surface / `--surface` | #F1EEEB | Neutral media stage |
| Divider / `--line` | #DED6D3 | Editorial separators, not sole control boundaries |

Existing `--rose` and `--blush` are compatibility aliases to supporting Burgundy and neutral surface. They do not authorize pink accents. Reuse semantic tokens; any added component tokens must alias this palette. No destructive sync of skill-generated JSON onto existing CSS.

## Typography

Latin headings: `--font-heading: 'Instrument Sans'`; Latin body: `--font-body: 'Geist Sans'`. Both remain self-hosted variable WOFF2. Preserve the existing fallback metrics and font licensing. Arabic retains Tahoma / Arial, natural joining, zero decorative letter spacing and current larger line heights. Never split Arabic into individual characters.

Current scale: labels12–14px; body16–18px; lead19–24px; headings34–82px; approved Home signature56–110px and Lab52–112px depending on breakpoint/height (Arabic keeps its joined face and separate scale). Small legacy captions include10–13px exceptions for a later legibility pass. Heading weight500–600; reading400; navigation450–500. Long prose targets60–75 characters; mobile35–60. Preserve existing title masks and name typography.

## Composition, spacing and media

The owner's newer brief removes the whole-page1320/1200px caps. `preview/responsive-geometry.css` owns geometry tokens: gutters `clamp(16px,1.6vw,40px)`,20px tablet,16px mobile and12px at320. Reading columns retain their individual60–75ch measures. Laptop title ~82px and portrait420px at1366×768; tall desktop adapts via width/height clamps. Case hero media is bounded to1440px while the page canvas stays wide; do not constrain the outer figure height independently of its media/caption. Existing responsive breakpoints are reused; no CSS zoom/global transform scaling.

Reference spacing rhythm: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96px. Apply selectively to changed components; do not normalize whole pages as incidental cleanup. Desktop section gaps 64–96px; mobile 40–64px. Keep related image/caption/copy visually grouped.

Media: actual project sources and approved privacy-redacted derivatives only. Retain intrinsic dimensions, responsive sizes, asynchronous decoding and below-fold lazy loading. Frame refinement uses subtle 8–12px corners and a neutral border outside the existing reveal mask. Preserve the signature portrait's asymmetric 112px / mobile 85px corner, crop and motion. Avoid clipping controls or cropping product UI to satisfy a rounded frame.

## Shared navigation and language

Persistent paper navbar with 44px targets, clear current-page underline, restrained Wine hover/press background, visible focus, native links and modified clicks. Keep all six destinations; cases indicate Projects as current. Language sits before navigation so DOM, visual and keyboard order agree at every breakpoint. At ≤800px use the existing inline mobile disclosure, with clear expanded state, Escape returning focus to the trigger and dismissal when focus leaves. Toggle → Tab reaches the disclosed links. It is not a modal; do not trap keyboard focus or lock body scrolling.

Language is a native select with all five native names. Refine its containing frame and decorative chevron without replacing platform keyboard/touch behavior. The localized label remains available to assistive technology. Native selects automatically support arrows and selection; no custom menu keyboard imitation is necessary. Retain focus on language choice. Language-only navigation preserves scroll explicitly and omits the page exit animation. Ordinary page navigation still resets to top; Back/Forward still restores its saved position. Clamp naturally when the translated page is shorter.

## RTL / LTR and accessibility

Set `html.lang` and `html.dir` from the active dictionary before scroll restoration. Use inline/block logical properties; `bdi` or explicit `dir=ltr` isolates technical strings. The visible order follows DOM and keyboard order. Mirror directional reveals, not photos or product text. Test English and Arabic at 1920, 1440, 390 and 320px and smoke-test German, French and Spanish.

Keep skip link, one h1, semantic headings, meaningful image alt, labelled forms, inline validation and genuine email-draft flow. Interactive text pairs target 4.5:1; visible meaningful icons/focus target 3:1. Controls target 44×44 CSS px for comfortable touch (distinct from minimum WCAG target rules). Do not use a pale divider as the sole focus indicator. Respect 200% zoom, native controls, Escape and reduced motion. Automated/browser checks do not constitute screen-reader certification.

## Motion and performance

Preserve the GSAP portrait side wipe (1.1s power3.inOut), 1.065→1 image settle (1.35s), typography masks, project image depth and existing scoped useGSAP contexts. All inset components use `%` consistently. Decode the portrait and allow its first composited paint before starting its local clock. One owner performs font/media ScrollTrigger refresh; do not refresh the full page while the portrait is moving.

Smoke uses the exact V1 five-octave noise, q/r nested domain warp, radial twist, ribbons, folds, highlights and axis-specific offsets. Only the palette and light-surface finish differ. Retain one shared bounded worker, visible-surface copies, no overlap during portrait reveal, no continuous work while hidden/offscreen/paused, disposal on route departure and genuine still fallback. Background frame budget is separate from UI's 60fps target. Initial limits: 12fps desktop, 8fps mobile, rendering independent of uncapped DPR; increase only with measured evidence. Desktop bitmap ≤512×384, mobile ≤320×240. Prioritize input, reading and foreground entrances over decorative rendering.

Targets, not unmeasured guarantees: zero horizontal overflow at 320px; CLS <0.1 (prefer zero); no >50ms main-thread task during the portrait's central 15–75% reveal; no global GSAP FPS cap; no new runtime dependency; record production load, CPU4 and scrolling. Report remaining startup layout work separately from actual reveal stalls.

## Anti-patterns and approval boundary

No approximate CSS blobs, radial-gradient plumes, synthetic ribbons passed off as V1; no grey/pink pigment ramp, magenta glow, glass header, new font pairing, dashboard template, fabricated product evidence or broad unapproved layout changes. Do not replace quality animations with generic fades. V1 is strictly read-only. Routine bounded technical fixes proceed under the brief; broad redesign of additional pages requires a concrete visual review and owner approval.

## Skill decisions

### Creative Director review extension

`docs/design/CREATIVE-DIRECTOR-PLAN.md` defines the shared rules and actual eight-skill decisions. Approved V2 keeps its composition with responsive corrections. `/preview/creative/<locale>/` has a separate Engineering Exhibition Home/Gallery, shared verified content/native routing and scoped `.creative-lab` CSS. Physical products and software are grouped intentionally; confidential diagrams stay supplementary. It never replaces approved routes. Fonts/colors/facts/media remain unchanged.

Lab portrait wipe and settle remain exact. The field is stationary during the portrait and its original worker starts afterwards. Name masks remain, without Latin glyph splitting; passive Lab chapters initialize after portrait completion, while explicit user scrolling can initialize the needed chapter sooner. Final CPU4 central max27.9ms/P95 20.9ms, zero central long tasks; startup remains separately measured. See `docs/design/CREATIVE-DIRECTOR-VERIFICATION.md` and root `design-qa.md` for actual evidence, limits and iteration history. Promote neither direction without the owner's visual decision; no deployment/merge is implied.

UI/UX Pro Max search returned Hero + Features + CTA and Minimalism/Swiss composition: useful for hierarchy and readability. Its blue/monochrome palette and Archivo/Space Grotesk fonts were rejected as incompatible with the brief. Focus/reduced-motion and React cleanup recommendations were retained. Brand consistency, token architecture and ui-styling accessibility references inform this system; banner and slides references are supporting inventory rather than new website deliverables. See `docs/design/SKILL-CAPABILITY-MAP.md` for verified capabilities.
