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
