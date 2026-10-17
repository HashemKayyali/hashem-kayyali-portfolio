# Light Burgundy Motion — first multi-page review

Implemented in the existing `C:\Users\hashe\Desktop\site-v2-light-burgundy` checkout,
branch **codex/portfolio-v2-light-burgundy**. Starting HEAD: **6a1ae32**; approved content
base: **343257a**. The latest brief expands this first review to working Home, Projects, Skills and Contact
pages, with About, Experience and all eleven case routes prepared. Design approval remains pending. Do not push, merge or deploy.

V1 at `Desktop/site` and the rejected `Desktop/site-v2` checkout were inspected read-only.
The old V2 package/lock changes were not overwritten. Existing approved About, experience,
education, language content and other case studies are retained. The shared timeline still
has four employer groups and three distinct Terminal roles with one company logo.

## Local preview

- `npm run dev:light`: http://127.0.0.1:5176/preview/
- **Motion Lab**: http://127.0.0.1:5176/preview/motion-lab.html
- **Current premium GSAP review**: http://127.0.0.1:5176/preview/premium-review.html — paired actual browser recordings, final previews and live animation inspection.
- **Latest art-direction refinement**: the same review now pairs actual before/after recordings for desktop/mobile Hero, Arabic Hero, three featured projects and Arabic Contact. The previous review is archived in ignored `output/playwright/motion-lab/previous-premium-review.html`.
- `npm run build:light` then `npm run preview:light`: http://127.0.0.1:4176/preview/
- Home: `/preview/en/`; Projects: `/preview/en/projects/`; Skills: `/preview/en/skills/`; Contact: `/preview/en/contact/`.
- Prepared pages: `/preview/en/about/`, `/preview/en/experience/` and `/preview/en/projects/<approved-id>/`.
- Replace `en` with `ar`, `de`, `fr` or `es`. Legacy query links and unlocalized section fragments still resolve.
- Native anchors support modified clicks; shared navigation indicates the active page. Back/Forward and direct reload work.

Motion Lab is development/review tooling. It embeds the actual portfolio with native
viewport/language/scene/replay/pause/scroll controls, recorded WebM demos, before/after
comparisons and desktop/mobile/Arabic screenshots. Its review files live in ignored
`output/playwright/motion-lab` and are served by the development server; they are not
production portfolio assets. The Lab is intentionally excluded from the production build.
The isolated portfolio entry remains `noindex,nofollow` and does not change V1 preferences.

## Art direction and palette

| Purpose | Color |
| --- | --- |
| Warm paper | `#FCFAF9` |
| Reading surface | `#FFFFFF` |
| Charcoal | `#2D2428` |
| Secondary text | `#6F6269` |
| Signature burgundy | `#7D2845` |
| Muted rose | `#C78499` |
| Blush | `#F4E6EA` |
| Divider | `#E7DBDF` |

Hero hierarchy pairs the clean self-hosted Inter first name with a large self-hosted
Roboto Slab surname, then the unchanged professional title, supporting scope and clear
projects/resume actions. Arabic uses the existing Tahoma/Arial stack. The portrait retains
the real image, a professional crop and asymmetric corners. Mobile brings the portrait
beside the name and role so identity and actions fit comfortably in the first screen.

The first three project features now represent the user-selected review examples:
physical interaction, venue software operations, and a digital services platform. They
are not a ranking of the other eight projects. The other eight projects now have substantial image-led gallery presentations, rather
than a list of secondary links. Their dedicated case routes retain complete approved narratives. The selected case studies add three short
image-led stages alongside the complete original narrative. Stage descriptions read from
approved localized project data rather than inventing a second facts database.

## Motion implementation

GSAP **3.15.0**, ScrollTrigger and **@gsap/react 2.1.2** coordinate name/title entrances, image-mask reveals,
gentle image depth, restrained project exits and a scroll-linked story line/node progression.
Page scrolling stays native. There is no pinning, Lenis instance, scroll hijack or motion
gate for essential mobile supporting content. Reduced-motion content is fully visible without entrance effects. Animations
use scoped `useGSAP` and `matchMedia` cleanup on route/language/reduced-motion changes.
Featured project triggers initialize near the viewport, avoiding synchronous offscreen
layout work during Hero loading. Filters remount affected features to rebuild geometry.
Outgoing navigation uses a disposable timeline/context; cancellation and completion clear
references to departed pages. Native Back/Forward restores saved scroll positions.

The recognizable V1 fluid field is adapted into `light-warp.ts`: three noise octaves,
warm light colors, no dark vignette or grain. **One shared WebGL context** produces a
small 384 × 256 desktop or 256 × 176 mobile bitmap. The GSAP ticker schedules actual
paints at at most 12 fps desktop / 8 fps mobile without changing its global frame rate.
The same image is copied only to visible Hero / Eventies spotlight / contact canvases.
These are local accents with feathered boundaries, not a full-page background. Motion
behind real interface imagery is confined to the surrounding image stage.

Offscreen and hidden surfaces stop repainting; when no surface is active, the fluid
renderer removes its ticker callback. Reduced motion, Save-Data, ≤2GB memory, ≤2 hardware
threads or unavailable WebGL use a small static captured field without creating an active
GL renderer. GPU resources and event listeners are disposed when the last surface unmounts.
The layout and content never depend on animation or WebGL.

## Rive

Installed `@rive-app/canvas` **2.44.2**. There is no authored custom `.riv` asset.
The connected-systems signature was removed from the Hero at the user's request.
Its optional static fallback and loader remain prepared but are not imported by the portfolio entry.
The development-only `/preview/rive-demo.html` specimen exercises the keyboard/pointer fallback.
The Rive runtime and WASM are neither requested nor emitted by the current preview build.
See [RIVE-SPEC.md](RIVE-SPEC.md) for the exact authoring contract and remaining asset work.
Do not claim a working Rive animation before supplying and testing that valid custom asset.

## Current approval slice

The latest bounded refinement keeps roles/supporting copy/actions visible during the Hero
entrance, synchronizes directional name and portrait masks with a defined burgundy ribbon,
and presents the three selected projects using distinct compositions and actual interface
evidence. The new ribbon look is selected only for Hero, Eventies spotlight and Arabic Contact;
the same WebGL context renders both looks, preserving the original fluid look elsewhere.
Projects outside the screen use browser-native `content-visibility:auto` and near-viewport
GSAP initialization. Mobile Eventies accents stay inside their visual width. Arabic Contact
has balanced columns, a matching DOM/focus order, larger contact details and an explicit
two-step email-draft action. Home's built localized entry preloads its dictionary and portrait.
No new dependencies were added. See `output/playwright/motion-lab/direction-review.md`.

The 2026-10-12 premium motion iteration refines the Home Hero, Bike Tower, Terminal NFC,
Eventies features and page transitions. Experience and Skills retain their existing behavior;
their new motion treatment awaits approval. `premium-review.html` labels the Experience
recording as an existing reference. The five videos show actual normal-motion browser frames.
`window.__portfolioMotion()` reads real GSAP timelines and ScrollTriggers in this isolated preview.
See `output/playwright/motion-lab/overhaul-review.md` for current checks, component paths,
trigger names, local performance measurements and review limitations.

## Media provenance

[media-sources/README.md](media-sources/README.md) records the actual imagegen production.
Two original illustrations support the Bike Tower engineering concept and Eventies
event-service atmosphere. Both are labelled in all five languages as AI-generated
conceptual artwork, not actual deployments. No product screenshots were generated.

`public/v2-media/manifest.json` identifies real, privacy-redacted, conceptual and procedural
visuals with source/purpose/dimensions/bytes. `prepare-media.py` produces responsive WebP
derivatives and opaque redactions of actual Terminal identifiers and Bike Tower local IP
information. Original media stay unchanged. The image viewer uses the redacted derivatives.
Intrinsic dimensions, responsive source sets, lazy loading and async decoding are retained;
the portrait and active case cover are prioritized. Raw generated PNGs live outside public.

## Dependencies and security

GSAP/Rive were present only in the old worktree; they were explicitly installed here.
Two high-severity transitive development dependencies were fixed with compatible targeted
updates: **nanoid 3.3.17 → 3.3.20** and **source-map-js 1.2.1 → 1.2.2**. No force upgrades
or Vite major change. Fresh `npm audit` returned **0 vulnerabilities**.

## Verification and deliverables

`npm run typecheck`, `npm test`, `node --test preview/motion-policy.test.mjs`,
`npm run validate:content`, `npm run build:light`, `npm audit`.

- `verify.mjs`: current actual-MCP suite: 150 page layouts (six pages × five locales × five widths),
  75 selected-case layouts, all 11 English approved case narratives, filters, native image-dialog
  keyboard/focus, history/direct reload/localization, mobile menu Escape, validated contact drafts,
  resume links, unknown-route recovery, reduced/active/offscreen/hidden/constrained motion.
- `verify-mcp.mjs`: actual **Playwright MCP**, 75 selected-case layouts (three projects,
  five languages, five widths), changing fluid pixels, removed signature, story progression
  and no unnecessary Rive downloads.
- `capture-mcp.mjs`: actual **Playwright MCP** English/Arabic desktop/mobile captures.
- `record-mcp.mjs`: actual browser recordings through **Playwright MCP**, not animation mockups.
- `performance-mcp.mjs before|after`: actual **Chrome DevTools MCP** load traces and
  observed metrics; desktop normal CPU and mobile 4× CPU, localhost, warm reload.
- `mcp-client.mjs`: connects the official configured stdio MCP servers because their tools
  are not exposed directly in this desktop turn. Server tool inventories and complete
  transcripts are retained in ignored output; this is not a substitute mock server.

Before screenshots were archived from commit 6a1ae32 before implementation. Comparison
coverage is Hero desktop/mobile and Eventies case intro. New captures cover six pages and all three stories in English/Arabic desktop/mobile. The report labels local observed timings, bundle growth and asset
limits; these measurements are not Lighthouse scores, field Core Web Vitals or broad WCAG
certification. The next step is user visual approval, not a production migration.

## Multi-page foundation and honest contact flow

Home is a compact introduction with the refined Hero, one approved About paragraph, three
featured engineering stories, factual career highlights and selected real skills. Projects
presents all eleven products with six category filters. Skills reads every existing toolkit
category and item directly from the localization system; no ratings or new claims. About
retains all six approved paragraphs. Experience reuses the existing grouped timeline,
education, graduation and PDF/DOCX links. Every case keeps the complete approved narrative.

The contact form requires a name, valid email and 10–4000-character message. It validates
and prepares an encoded mailto URL, then reveals an explicit link to open the user's email
application for review and sending. Editing clears the stale draft. There is no backend,
no automatic sending and no false success message. Mailto fields use percent-encoded spaces
and CRLF body line breaks according to [RFC 6068](https://www.rfc-editor.org/rfc/rfc6068.html#section-5).

The build generates 85 localized static **route shells** with page-specific titles,
descriptions, canonical/alternate tags and correct language/direction. This is an isolated
noindex local preview, not completed production SSR/SEO migration. Existing V1 production
SEO and content sources remain unchanged. Production hosting redirects, real canonical
URLs, structured data and SSR integration belong to the subsequent approved phase.

The new shared shell provides native link behavior, active navigation, responsive menu,
page-heading focus and scoped GSAP transitions. No routing dependency was added. Reduced
motion retains content and static imagery. The terminal career line progresses on scroll.

## Review notes

A separate read-only reviewer found three defects: ambiguous localized Home fragments,
nonportable mailto encoding and missing keyboard focus on Home's heading. All were reproduced
with failing tests and fixed; corresponding pure/browser regression tests now pass.
The earlier offscreen-test timeout was a test-position error: a short About scroll still
left the Hero field intersecting the viewport. Scrolling to the career section verifies
that actual offscreen painting stops. No application workaround was introduced.

See the local [verification report](http://127.0.0.1:5176/output/playwright/motion-lab/report.html)
for fresh measured timings, bundle cost, complete screenshot links and evidence limits.
The custom Rive asset remains unavailable; its success path still needs testing after an
authored asset is supplied. The Signature Case Studies phase now implements all eleven tailored details and all profile pages; visual approval remains the next gate.

Final interaction profiling: actual DevTools MCP mobile menu/page clicks at CPU4x observed a maximum 408 ms click duration. This is a local trace, not field INP. Route-transition responsiveness needs further optimization before production; idle long-task results do not prove fast interactions. Motion Lab scene/localization/pause, both video files, review screenshots and case modified-click/back links were also verified through actual Playwright MCP.

## Deep Burgundy / Signature Case Studies

Current local visual review: http://127.0.0.1:5176/preview/signature-review.html
Built portfolio: http://127.0.0.1:4176/preview/en/

Central brand.css tokens feed the CSS and shared fluid shader/static fallback.
SignatureCaseStudy is route-loaded, uses the existing localized dictionaries and
presentation-only case-presentation metadata; no professional-fact source was duplicated.
CaseArchitecture diagrams are explicitly illustrative. Original private Umniah,
Terminal, Bike interface and Glitzz06/07 media are withheld by media-policy.ts;
approved derivatives remain available, and unsafe copies are stripped from the
V2 build. Encoded paths, Windows case and Vite public/filesystem aliases follow
the same policy. Local source checkpoints are not served through the preview.

Case motion, profile motion and the native collection composition are scoped
useGSAP/ScrollTrigger contexts with route/filter/locale cleanup. Reduced motion
retains immediate readable content and static media. Cold lazy route fragments
and Back/Forward restoration wait for mounted route content and fonts, with
intent ownership preventing stale navigation callbacks.

Actual official Playwright MCP captures, all11�5locale layouts, RTL/mobile proof,
normal and reduced-motion verification, recordings, and DevTools observations
are in output/playwright/signature and output/playwright/motion-lab.
See output/playwright/signature/review-results.md for current results and limits.
The custom .riv success path still requires a genuine authored asset; its
specification and functioning fallback remain. No push, merge or deployment.


## Home art direction review - 2026-10-13

See [Home review notes](./HOME-ART-DIRECTION.md) for the scoped implementation, asset brief, actual browser recordings and measured performance.
