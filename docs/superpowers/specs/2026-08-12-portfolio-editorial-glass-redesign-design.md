# Portfolio Editorial Glass Redesign

**Date:** 2026-08-12  
**Status:** Approved design specification; implementation has not started

## 1. Objective

Refine the existing React 19, TypeScript, and Vite portfolio into one coherent premium product while preserving its recognizable animated Burgundy identity and the approved Selected Projects experience.

The final visual hierarchy is:

1. Animated Burgundy global environment.
2. Translucent editorial glass section shells.
3. Animated Burgundy feature surfaces and light softly elevated supporting surfaces.
4. High-contrast Roboto Slab typography and restrained interface controls.

This is a scoped refinement of the existing production application, not a rebuild, framework migration, or content reinvention.

## 2. Evidence and baseline

The design is based on the current working tree and production build, including uncommitted approved Projects and mobile-navigation changes. Source code is authoritative; the existing `dist` directory is not.

### Current responsive measurements

- Hero at 375×667: approximately 1,293px tall.
- Hero at 768×1024: approximately 1,090px tall.
- No horizontal overflow was observed at 375px or 768px in the baseline checks.

### Current rendering architecture

- One shared WebGL context renders the Burgundy source.
- One shared requestAnimationFrame loop drives the source.
- The shader targets 30fps and caps DPR at 1.25 with viewport-dependent quality scaling.
- Burgundy card surfaces copy the shared source into 2D canvases at up to 24fps.
- Card copies subscribe only near the viewport and release their buffers offscreen.
- Rendering pauses when the document is hidden and becomes static for reduced motion.

This architecture will be preserved unless measured evidence identifies a specific defect. The shader will not be rewritten merely to accommodate the redesign.

### Current scroll baseline

A seven-second automated production-preview traversal at 1440×900 recorded:

- 17 frames longer than 20ms.
- 4 frames longer than 34ms.
- 1 shared WebGL source.
- No recorded long task during that traversal.

The measurement is a repeatable comparison baseline, not a hardware-independent performance score.

### Current build and tooling baseline

- `npm run build`: passes.
- `npm run typecheck`: fails because the untracked `data/mobile_overflow_fix_modified/` scratch snapshot is included by the broad TypeScript project scope.
- The scratch snapshot is not referenced by production source and is outside the Vite entry graph.

The first implementation change will exclude this confirmed scratch directory from TypeScript/tooling. Its archived source will not be edited as if it were part of the application.

## 3. Scope and protected work

### Sections in scope

- Hero.
- About.
- Resume.
- Professional Journey.
- What I Build / Capabilities.
- Contact.
- Desktop sidebar.
- Existing mobile navbar and drawer presentation.
- Footer, only where needed for system consistency.
- Section shells, section separation, sticky headings, entrance motion, accessibility, responsive behavior, and scroll performance.

### Selected Projects regression boundary

The approved Selected Projects implementation is protected. Preserve:

- Project order and factual content.
- Card internals and image behavior.
- Filters and filter rebasing.
- Project counter.
- Sticky stack geometry.
- `MIN_SCALE` and `MAX_DIM`.
- Scroll-linked scale and dim behavior.
- Mobile compact header behavior.
- Responsive card composition.
- Project Modal, gallery, and drawer/modal layering.

Allowed compatibility changes are limited to global Roboto Slab typography, the outer section shell, centralized anchor/sticky offsets, accessibility corrections, and changes proven necessary for integration. No aesthetic redesign of project cards is permitted.

## 4. Content integrity

All portfolio, resume, education, employment, and project facts remain evidence-locked.

About, Resume, and Professional Journey copy may be shortened, reordered, combined, or converted into shorter paragraphs and bullets when factual meaning is preserved. Repetition may be removed, but no meaningful responsibility may disappear from the section as a whole.

Do not change or invent:

- Dates.
- Job titles.
- Employer or company names.
- Employment sequence.
- Role progression.
- Technologies used.
- Responsibilities.
- Achievements or metrics.
- Seniority or ownership.
- Certifications, education, customers, or credentials.

The Terminal VR remains one employer entry containing two explicit phases:

1. Sales Representative, Jan 2025–Feb 2025.
2. Technical Operations Engineer, Feb 2025–Jul 2025.

Its presentation must preserve the customer-facing start, promotion, installation, configuration, networking, system integration, diagnostics, maintenance, and later sole responsibility for day-to-day technical operations.

## 5. Chosen visual direction

The approved direction is **Layered Editorial Glass**.

The Burgundy animation is the visual environment rather than a decorative strip. Light shells float above it without becoming opaque white pages. Animated Burgundy feature cards remain the strongest branded accents. Supporting information uses translucent, softly elevated light surfaces.

This direction was selected over an all-dark glass continuum, which would reduce editorial readability, and a conservative surface retrofit, which would not sufficiently resolve the Hero, Resume, or Journey problems.

Avoid generic AI/SaaS styling, unrelated gradients, neon colors, excessive glow, heavy plastic neumorphism, decorative particles, oversized pills, and widget-heavy dashboard layouts.

## 6. Design foundations

### 6.1 Typography

- Use Roboto Slab throughout headings, body text, navigation, buttons, labels, cards, filters, resume, contact, sidebar, and footer.
- Self-host one official Roboto Slab variable WOFF2 asset obtained from the Google Fonts Roboto Slab family distribution, retain its OFL license notice in the repository, and record the asset source in the implementation report.
- Limit the loaded range to weights 400–700.
- Preload the single primary asset once.
- Use `font-display: swap` and a stable slab-serif fallback stack.
- Remove Google Fonts loading for Inter and Manrope and all remaining Montserrat/Inter-specific declarations.
- Do not load duplicate font assets or unnecessary weights.
- Recalibrate sizes, line lengths, wrapping, buttons, filters, and navigation because Roboto Slab is wider and denser than the current fonts.

### 6.2 Spacing and radii

Use a compact shared spacing scale based on 8, 12, 16, 24, 32, 48, and 64px, with responsive interpolation only where it improves continuity.

- Major section gap on desktop: approximately 32px, tunable within 24–40px after screenshots.
- Major section gap on tablet/mobile: approximately 16px, tunable within 12–20px.
- Section-shell radius on desktop: approximately 28–32px.
- Section-shell radius on mobile: approximately 18–22px.
- Cards use smaller radii than their containing section shell to preserve hierarchy.

### 6.3 Semantic surface tokens

Create one coherent token system rather than scattered `rgba()` and blur values. Final names should follow the existing CSS architecture, but the system must cover:

- Light glass background, fallback background, border, and highlight.
- Dark glass background, border, and highlight.
- Static ambient glass shadow.
- Soft raised surface background, highlight, lower shadow, and border.
- Desktop and mobile blur values.
- Section radius and section gap.
- Mobile-navbar height, sticky top offset, anchor offset, and stack gap.
- Focus rings for light and dark surfaces.
- Motion duration and easing values.

### 6.4 Glass rendering and fallback

Glass identity must not depend on `backdrop-filter`.

The primary definition of every glass surface comes from:

- A translucent Burgundy-tinted or warm-light background with sufficient opacity for text contrast.
- A subtle border.
- A restrained inner or top-edge highlight.
- A static ambient shadow.
- Controlled color contrast against the lightest expected Burgundy frame.

Blur is progressive enhancement:

- Compact desktop surfaces may use approximately 8–10px.
- Compact mobile surfaces may use approximately 6–8px.
- Large section-shell blur is optional and must be removed or reduced if it harms scrolling.
- An `@supports (backdrop-filter: blur(...))` and `@supports (-webkit-backdrop-filter: blur(...))` enhancement may apply blur and slightly adjust background translucency.
- The default/fallback rule remains visually coherent when blur is unsupported, browser-disabled, or intentionally reduced for performance.
- Readability, boundaries, and hierarchy must remain intact with `backdrop-filter: none` forced during QA.

### 6.5 Soft elevation

Supporting light cards use restrained neumorphism-inspired elevation:

- Light translucent surface.
- Fine glass border.
- Small top-left highlight.
- Soft bottom-right shadow.
- Burgundy icon well where appropriate.
- Maximum hover lift of 1–2px.

No large shadow spreads, animated shadow blur, plastic embossing, or heavy scale effects are allowed.

## 7. Page and section architecture

### 7.1 Section shells

About, Resume, Selected Projects, and Contact receive distinct inset glass shells. Burgundy remains clearly visible in the gaps around them and subtly perceptible through them. What I Build keeps its animated Burgundy environment while using the shared section-spacing and sticky-header system.

Rounded visuals must not create unsafe sticky ancestors. If clipping is required, use an inner visual layer or pseudo-element while the semantic `<section>` remains free of scroll-producing overflow, transforms, filters, and size containment.

### 7.2 Shared sticky section headers

About, Resume, What I Build, and Contact use one shared section-scoped sticky header primitive containing:

- Section title.
- Decorative accent.
- Section description.

Both title and description remain visible throughout sticky traversal, including short mobile screens. Compactness comes from smaller responsive type, line-height, accent, padding, and description line length—not hiding or clamping the description.

Expected compact mobile sticky height beneath the navbar is roughly 100–130px and must leave meaningful content visible.

Selected Projects retains its specialized sticky header because it also owns the approved filter controls and measured control height.

Sticky headers release naturally at their section boundary. They are not fixed global overlays.

### 7.3 Containment rules

Any section hosting sticky UI must remain outside unsafe size containment. Audit all ancestors for:

- `content-visibility`.
- `contain`.
- `overflow`.
- Transforms.
- Filters.

Do not broadly remove `content-visibility` where it remains safe and beneficial. Disable it only for sticky containing blocks, sticky stacks, or dynamically measured content where containment can produce stale geometry or clipping.

### 7.4 Centralized sticky and anchor offsets

Use one centralized CSS custom-property strategy for sticky positioning and section navigation. Do not assign unrelated `scroll-margin-top` values per section.

The system will define:

- Mobile navbar height.
- A small navigation breathing gap.
- Shared section anchor offset.
- Shared sticky-header top offset.
- Projects controls/card-stack offset derived from the shared values plus measured Projects control height.

On mobile/tablet, section anchors clear the sticky mobile navbar and breathing gap. On desktop, anchors use the desktop top inset/breathing gap because navigation comes from the fixed sidebar rather than a top bar.

Apply the shared `scroll-margin-top` through the common section primitive or a common section selector. `scrollIntoView()` and direct hash navigation must produce the same unobscured result.

Verify direct navigation to About, Resume, Projects, Capabilities, and Contact from:

- Desktop sidebar at representative desktop/laptop breakpoints.
- Mobile drawer at representative phone and tablet breakpoints.
- Direct URL hash loading or equivalent browser hash navigation.

For each destination, confirm the section title is not hidden under the mobile navbar or another sticky surface, the correct navigation item becomes active, and sticky release remains correct. About, Resume, Capabilities, and Contact must also keep their descriptions visible. Projects retains its approved specialized compact title/filter behavior.

## 8. Hero design

### 8.1 Desktop

Maintain a premium two-column composition:

- Copy: approximately 58–62%.
- Portrait: approximately 30–35%.

Preserve the availability eyebrow, primary statement, role, description, three CTAs, technology metadata, portrait, and location. Improve alignment, whitespace, line length, CTA grouping, and portrait scale so the image supports rather than dominates the statement.

The Hero statement becomes the document's single `h1`. Sidebar identity is not a page heading.

### 8.2 Mobile

Mobile uses a purpose-built compact composition rather than a shrunken desktop stack:

- Portrait remains beside or near the top-right and never drops below the entire copy block.
- Availability and portrait form the opening visual zone.
- The headline begins immediately below and can use full width once it clears the portrait.
- Primary and Resume CTAs share a compact row where width permits.
- WhatsApp becomes a quieter tertiary action.
- Technology metadata becomes a compact one- or two-line group.
- Avoid `100vh`/`100svh` minimum-height traps and artificial fixed heights.

Target portrait dimensions:

- 320–359px wide viewport: approximately 104×130px.
- 360–390px: approximately 116×145px.
- 391–430px: approximately 124×155px.
- Tablet: approximately 200–240px wide, tuned against height targets.
- Desktop: approximately 320–390px wide.

Target Hero section heights, excluding the sticky mobile navbar:

- 375×667: approximately 500–550px.
- 375×812: approximately 520–570px.
- 768×1024: approximately 650–740px.

If copy cannot fit at the smallest width, reduce spacing, type, and portrait size within accessible limits before allowing the portrait to move below all content. Content remains height-driven and must not clip.

### 8.3 Hero motion

- Eyebrow: 250–350ms.
- Headline: 350–450ms.
- Supporting copy and CTAs: 300–400ms.
- Portrait fade/scale: 400–500ms.
- Stagger: approximately 40–60ms.

Do not animate individual words, blur, or expensive filters. The current typing effect may remain only if it meets the safe-visibility and reduced-motion rules; otherwise replace it with an immediate visible tagline and restrained group entrance.

## 9. Sidebar and mobile navigation

### 9.1 Desktop sidebar

Preserve identity, portrait, name, role, social links, navigation, active state, Resume download, and copyright.

Replace the opaque panel with warm translucent glass:

- Burgundy-tinted light background.
- Fine translucent border and inner highlight.
- Static ambient shadow.
- Approximately 8–10px progressive-enhancement blur if profiling permits.
- Strong text contrast.

The active navigation item and Resume download remain animated Burgundy surfaces.

### 9.2 Mobile navbar and drawer

Preserve the approved in-flow sticky navbar, menu trigger location, drawer width, backdrop, and z-index layering. Do not reintroduce a floating hamburger.

- Navbar uses the same glass language with approximately 6–8px optional blur.
- Drawer is slightly more opaque than the navbar for readability, while retaining Burgundy tint, border, and highlight.
- Active navigation and Resume download remain Burgundy features.

Accessibility behavior:

- Escape closes the drawer.
- Opening moves focus into the drawer.
- Closing restores focus to the menu trigger.
- Focus is contained while open.
- Background content becomes inert while open.
- Page scrolling is contained without layout shift.
- Project Modal remains above the drawer and its backdrop.

## 10. About

Desktop hierarchy:

1. Shared sticky About header.
2. Animated Burgundy narrative/identity card on the left.
3. Technical Toolkit on the right.
4. Concise personal metadata rail beneath both columns.

Preserve the narrative, target roles, skill groups, location, email, phone, and opportunity status. Tighten repetition while keeping all facts.

Toolkit cards use the soft-surface system with Burgundy icon wells, compact headings, refined chips, and restrained hover. Mobile stacks narrative, toolkit, then metadata without excessive nested layers.

## 11. Resume and Professional Journey

Resume uses editorial organization, not a generic dashboard visual language.

Hierarchy:

1. Shared sticky Resume header.
2. Compact editorial professional summary surface.
3. Premium professional timeline as the primary column.
4. Coherent supporting column containing the animated Burgundy Resume download feature, Education, and Core Strengths.

The supporting column begins non-sticky. It may become sticky only if later usability testing proves a clear benefit without nested sticky conflicts.

### 11.1 Professional Journey

Each experience reads primarily as a timeline entry, not a widget:

- Visual node or restrained image/logo tile.
- Clear role/company heading.
- Compact date chip.
- Location/context row.
- Two to four strongest factual bullets.
- Restrained translucent card boundary or editorial grouping.

Where shortening an entry would otherwise remove a meaningful responsibility, retain that fact in a compact supporting sentence or grouped bullet within the same Resume section.

The Terminal VR entry contains its two numbered role phases within one company block.

Timeline rail behavior:

- Static, or a very quick decorative reveal.
- No multi-second scroll-linked drawing.
- Entry entrance duration approximately 360ms.
- Entry stagger approximately 60ms.
- Optional desktop hover limited to border refinement, 1–2px lift, and node highlight.
- Mobile uses a single vertical timeline with full-width readable entries and no horizontal timeline.

## 12. What I Build / Capabilities

Retain the animated Burgundy section environment and four factual capability descriptions.

- Shared sticky title and visible description.
- Supporting cards use premium translucent soft surfaces.
- Improve icon hierarchy, title rhythm, line length, spacing, and restrained hover.
- Desktop: balanced 2×2 grid.
- Tablet: two columns where space permits.
- Mobile: one column.
- Entrance: 320–400ms with approximately 60ms stagger.
- No persistent floating animation.

## 13. Contact

Use the shared sticky Contact header with title and description always visible.

Desktop uses two columns:

- Animated Burgundy opportunity/CTA feature.
- Light translucent contact rows with restrained elevation.

Mobile stacks the feature before contact details. Preserve email, WhatsApp, phone, location, LinkedIn, and Instagram. Do not add a form.

Contact rows must support long-value wrapping, at least 44px interactive targets where applicable, clear focus states, and meaningful accessible names.

## 14. Footer

Preserve the animated Burgundy identity and current content architecture. Limit changes to:

- Roboto Slab integration.
- Shared spacing rhythm.
- Border/highlight consistency.
- Light glass social controls.
- Reduced excess mobile height.

Do not add new promotional blocks or rebuild the footer without evidence.

## 15. Motion and visibility safety

Animation is progressive enhancement; content visibility cannot depend on successful animation frames.

The shared Reveal primitive or pattern must ensure:

- Base DOM/CSS state is visible.
- No content remains indefinitely at `opacity: 0` if requestAnimationFrame pauses, the page starts backgrounded, the animation library fails, or hydration is delayed.
- Enhancement may begin around 70–80% opacity with 10–16px translation only after intersection is known.
- Headers typically use 300–400ms.
- Content groups use 320–420ms.
- Cards use 320–400ms with 50–70ms stagger.
- Only opacity and transform are animated.
- Reverse scrolling does not retrigger distracting motion.

Implement the shared Reveal primitive with IntersectionObserver plus the Web Animations API. Elements remain fully visible in their base CSS; when an element first enters the viewport and motion is allowed, `element.animate()` applies a short compositor-friendly opacity/transform keyframe sequence. If IntersectionObserver or the Web Animations API is unavailable, no entrance runs and the base visible state remains unchanged. The primitive owns no requestAnimationFrame loop and does not use React state during scrolling.

### Reduced motion

When `prefers-reduced-motion: reduce` is active:

- Content appears immediately.
- Hero typing and decorative entrance sequences are disabled.
- Nonessential scroll-linked scale/dim effects are disabled, while essential positioning remains.
- Smooth anchor scrolling becomes immediate.
- Burgundy animation renders a coherent static frame using the existing runtime behavior.

## 16. Performance constraints

Native browser scrolling remains the interaction model. Do not add Lenis or wheel-event interpolation.

Preserve:

- One WebGL context.
- One shared RAF owner.
- Current hidden-document pause.
- Current reduced-motion static rendering.
- Near-viewport 2D subscriptions.
- Offscreen buffer release.
- Existing 30fps/24fps limits and DPR cap unless measurement supports a targeted change.

Do not add:

- React state updates on every scroll frame.
- Raw scroll-event spam.
- New RAF loops for entrances or glass.
- Animated blur, filters, or large shadows.
- Permanent `will-change` across many components.
- Full-screen high-radius backdrop blur.

Large shells rely on translucent color, border, highlight, and shadow. If the after-profile is worse, reduce or remove large-surface blur before changing the Burgundy identity.

The after-profile uses the same production-preview traversal and records frame distribution, long frames, active canvases, WebGL contexts, RAF ownership, console output, and overflow. The redesign must be equal to or better than the baseline in meaningful interaction quality; any measurable regression from glass must be investigated and simplified.

## 17. Accessibility requirements

- One page `h1` in the Hero.
- Semantic section heading hierarchy.
- Navigation and complementary landmarks remain correct.
- Add a visible-on-focus skip link.
- Separate focus-ring tokens for light and Burgundy surfaces.
- Maintain readable contrast over the lightest moving Burgundy frame.
- Maintain 44×44px touch targets where practical.
- Preserve meaningful alt text and mark decorative images appropriately.
- Validate drawer and Project Modal focus containment, Escape handling, focus restoration, and background inertness.
- Validate keyboard navigation, 200% zoom, reduced motion, and a 320px-wide viewport.
- Transparency is decorative; text contrast and comprehension take priority.

## 18. Responsive verification matrix

Verify continuous resizing and, at minimum:

- 320×568.
- 360×640.
- 375×667.
- 375×812.
- 390×844.
- 430×932.
- 600×900.
- 768×1024.
- 820×1180.
- 900×900.
- 1024×768.
- 1280×800.
- 1366×768.
- 1440×900.
- 1920×1080.
- 2560×1440 when the environment permits.

Check Hero height targets, portrait placement/crop, line wrapping, sticky density/release, glass contrast, section separation, card layouts, horizontal overflow, and breakpoint transitions.

## 19. Implementation boundaries and phases

No source implementation is authorized by this document alone. Implementation starts only after this written specification is reviewed and an implementation plan is approved.

Planned phases:

0. Baseline/tooling: exclude the confirmed scratch directory, rerun typecheck/build, preserve baseline artifacts and metrics.
1. Foundations: Roboto Slab, tokens, glass fallback/enhancement, soft surfaces, section shell, sticky header, anchor offsets, and safe Reveal primitive.
2. Hero and navigation: responsive Hero, desktop sidebar glass, mobile navbar/drawer presentation and accessibility.
3. About and Capabilities.
4. Resume and Professional Journey.
5. Contact and Footer.
6. Motion integration and reduced-motion verification.
7. Performance profiling and evidence-based optimization.
8. Full responsive, accessibility, functional, Projects regression, code-review, and production verification.

After each major phase, verify the approved Projects flow before continuing. Avoid giant edits and unrelated refactors. Reusable primitives are limited to patterns that materially reduce duplication, such as the section shell/header, safe Reveal, and soft surface.

## 20. Testing and evidence

### Functional coverage

- Sidebar and drawer navigation.
- Centralized anchor offsets on desktop, phone, and tablet.
- Direct hash navigation.
- Drawer focus behavior and layering.
- Resume PDF and Word downloads.
- Contact links.
- Projects filters, filter rebasing, counters, stack, modal, gallery, and image behavior.
- Reduced-motion behavior.

### Visual coverage

Capture after implementation:

- Desktop 1440×900: Hero, About, Resume, Journey, Projects, Capabilities, Contact, and Footer.
- Mobile 375×667 and 390×844: Hero, About, Resume/Journey, Projects, Capabilities, Contact, and open drawer.
- Tablet 768×1024: Hero, About, Resume, and Projects.

Compare against current screenshots for mobile Hero height, portrait location, Burgundy visibility through/around shells, sidebar consistency, controlled card elevation, section separation, sticky behavior, Journey density, and Projects preservation.

### Glass fallback coverage

- Capture representative light and dark surfaces with normal blur support.
- Force `backdrop-filter: none` and verify the same surfaces remain readable, bounded, and visually coherent.
- Verify reduced mobile blur does not turn surfaces into opaque panels or expose unreadable text.

### Commands and production verification

Use actual repository scripts:

- `npm run typecheck`.
- `npm run build`.
- `npm run preview`.
- Existing tests if any are added or discovered during implementation.

Inspect the production preview for console errors, failed assets, responsive behavior, and interaction regressions. Do not claim scroll smoothness from build success alone.

## 21. Definition of done

The redesign is complete only when:

- Roboto Slab is consistently loaded once and used throughout.
- Hero meets the approved compact targets without placing the portrait below all copy.
- Burgundy remains recognizable globally, visible around shells, and subtly visible through them.
- Glass remains coherent without blur.
- All major sections have distinct boundaries and intentional spacing.
- About, Resume, Capabilities, and Contact retain sticky title and description.
- Centralized anchor offsets keep every navigation destination unobscured.
- Professional Journey reads as a premium editorial timeline and preserves every fact.
- Sidebar and mobile navigation share the glass language without breaking drawer behavior.
- Footer remains consistent without unnecessary rebuilding.
- Motion remains fast, restrained, safe by default, and reduced-motion compliant.
- One WebGL context and shared RAF architecture remain intact unless documented evidence justifies a targeted change.
- The final performance comparison shows no meaningful glass-induced regression.
- Projects remains visually and functionally intact.
- Accessibility, responsive, functional, typecheck, build, preview, and code-review checks pass or any residual limitation is explicitly reported.

## 22. Known risks and mitigation

- **Roboto Slab wrapping:** audit all widths and adjust typography/spacing, not factual copy, where meaning would be lost.
- **Glass compositor cost:** use blur only as an enhancement and simplify it based on the repeatable profile.
- **Sticky containment regression:** keep sticky hosts free from size containment and clipping; use inner visual layers.
- **Mobile sticky density:** preserve descriptions but tighten typography and copy length; verify on short screens.
- **Hero height pressure:** prioritize compact spacing and portrait scale; never move the portrait beneath all content as the default phone layout.
- **Projects integration:** treat current working-tree behavior as protected and test after every phase.
- **Dirty working tree:** stage and commit only files intentionally changed for each phase; never overwrite unrelated user work.
