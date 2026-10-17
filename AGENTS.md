# Portfolio repository guidance

This is Hashem Kayali's React 19, TypeScript, and Vite portfolio. Treat it primarily as a recruiter and hiring-manager tool positioning him as an R&D Product Engineer and Software Engineer. Read the relevant repository-scoped skills in `.agents/skills/` before specialized work; use `.agents/SKILLS-INVENTORY.md` to route overlapping skill names.

## Mandatory rules

- Inspect the real repository, stack, existing behavior, and evidence before editing.
- Never invent project claims, metrics, customers, technologies, results, employment, credentials, or deployment facts.
- Preserve the approved design system and current visual language; establish shared design rules before parallel design work.
- Do not redesign unrelated areas during bug fixes. Reproduce, find the root cause, make the smallest correct fix, and test nearby behavior.
- Keep portfolio project copy concise and centered on Problem → Product Decision → Technical Solution → Stakeholder Value → Result.
- Do not expose private project information, customer data, credentials, internal dashboards, source, or sensitive screenshots.
- Validate responsive behavior, accessibility, content accuracy, privacy, and regressions when relevant.
- Test before declaring completion and report the commands, artifacts, failures, and residual risks.
- Use parallel agents only after shared design rules are established; every agent inherits the approved design system.
- Framework-specific guidance activates only after stack inspection. Do not apply Next.js-only advice to this Vite repository unless an explicit migration is requested.

## Portfolio workflow

1. Research / Positioning — confirm audiences, evidence, value proposition, and recruiter journey.
2. Plan — inventory content and media; define dependencies, risks, owners, verification, and definition of done.
3. Design System — approve tokens, components, responsive behavior, motion, media, and accessibility states once.
4. Content — write concise, evidence-backed positioning and case studies; flag unsupported claims.
5. Implementation — follow the approved system and actual React/Vite architecture with scoped changes.
6. QA — test critical journeys, browsers, mobile behavior, links, metadata, content, and regressions.
7. Performance — measure production behavior before optimizing images, fonts, JavaScript, rendering, animation, or third parties.
8. Accessibility — verify semantics, keyboard, focus, contrast, motion, forms, media, zoom, and screen-reader behavior throughout.
9. SEO — validate route metadata, canonicals, sitemap, robots, internal links, OG assets, and evidence-backed schema.
10. Launch — complete security, privacy, analytics-plan, deployment, and production-readiness checks.

Role boundaries and handoffs are documented in `.agents/AGENT-ROLES.md`. Skill setup validation is available through `python .agents/scripts/validate-skills.py`.

## Portfolio V2 continuity and design contract

- Before design work, read `design-system/hashem-portfolio-v2/MASTER.md`, `docs/design/PROJECT-HANDOFF.md` and the relevant installed skill. Verified capabilities and limitations are in `docs/design/SKILL-CAPABILITY-MAP.md`.
- Preserve the approved Deep Burgundy palette, Instrument Sans / Geist Sans and the existing Arabic typography. Reuse `preview/brand.css`; generated skill suggestions do not supersede the owner-approved identity.
- Preserve successful portrait, typography, image reveal and page GSAP choreography. Diagnose execution problems with actual browser recordings/traces; do not replace excellent motion with generic fades.
- `C:/Users/hashe/Desktop/site` (V1) is strictly **read-only**, including its build/cache/Git state. V2 is the only writable application. See `docs/design/V1-SMOKE-PROVENANCE.md` for original source, literal shader recovery and deliberate light-surface adaptations.
- Inspect and preserve unrelated uncommitted/untracked work; make a verified recoverable local checkpoint before implementation. No reset/clean/push/merge/deployment without the owner's explicit request.
- Use the actual running site for visual QA at1920,1440,390,320px in English and Arabic, with remaining locale, keyboard, reduced-motion and responsive checks. Record evidence and residual risks; build/unit-test success alone does not approve visual quality.
- Broad redesign of further page families requires a concrete visual candidate and owner approval. Maintain eleven projects, five languages, privacy redactions and approved professional facts.
- The historical `.agents/AGENT-ROLES.md` and `.agents/scripts/validate-skills.py` references above were absent at the 13 October recovery baseline. Do not assume they exist. Current verified local skill audit: `python scripts/audit-design-skills.py`; inventory routing: `.agents/SKILLS-INVENTORY.md`.

## Consolidated final workspace —17 October2026

This section supersedes historical writable-folder instructions above. The owner requested one independent final folder: `C:/Users/hashe/Desktop/portfolio-v2`. Work here. Earlier `site-v2-light-burgundy` and `site` folders are reference/backups and must not be modified.

The final repository is ordinary Git on `main`, with no linked worktrees. Historical branch histories are consolidated; older alternate UI treatments remain recoverable in history and ignored local archives rather than replacing the approved UI. Standard `npm run dev`, `npm run build` and `npm run preview` target `preview/`, the actual current app. Root `App.tsx`/`sections` are legacy. Start with `CLAUDE.md`, `docs/CONSOLIDATION.md` and the existing master/handoff. `npm run check` verifies TypeScript, the full test suite and content. Cloud accounts/keys remain pending; see `docs/design/CLOUD-STUDIO-SETUP.md`. All existing content, design and privacy rules continue to apply.
