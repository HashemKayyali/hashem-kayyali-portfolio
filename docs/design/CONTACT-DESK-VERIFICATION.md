# Contact correspondence desk — 14 October 2026

Owner authorized a complete Contact-only redesign with smaller components. Spec: `CONTACT-DESK-SPEC.md`. Existing graphite/champagne/petrol/ivory and Libre Caslon Condensed/Almarai remain. No other page redesign.

## Result and implementation

`preview/ContactDesk.tsx` replaces the old oversized Contact block with a short localized heading, direct Email/WhatsApp channels, compact LinkedIn/Instagram cards, actual identity/location and an ivory compose sheet. Desktop name/email share a row; phone layouts stack native fields. The sheet keeps the explicit Prepare → Open email draft workflow, real recipient and original explanatory copy. Email-copy utility adds localized success/refusal feedback. No sending, backend, persistence or analytics were added.

At production1440 English, main height changes1070.7→687.5px and form722.2→484.2px (33% smaller). At1920 the compose sheet is487.4px high and container bounded1520px. Inputs remain46px high/16px text, textarea126px with manual vertical resize, interactive targets at least44px. Long translations naturally require more mobile height; no fixed-height clipping or hidden essential content.

Contact-owned GSAP entrance and arrow focus/hover motion use scoped cleanup. They do not replay on locale changes; existing route/language fades remain responsible for page transitions. Live reduced motion settles static state. The controlled form has no locale key, preserving entered values and prepared URI during language changes. Editing invalidates a stale draft. Native invalid controls and trimmed-message validation expose localized status; a prepared anchor receives keyboard focus without launching an email app.

Visual QA caught a single trailing email character at390px, narrow social-handle wrapping at320px and legacy container max-width specificity. Mobile decorative icons/arrows make room for complete addresses; the contact stylesheet loads last and its container selector wins without changing shared geometry.

## Verification

- Before implementation, `preview/contact-desk.browser.js` failed: form722.2px and all entered fields lost after EN→AR. Final probe passes:484.2px and all three values retained.
- `npm run typecheck`, `npm run build:light`: exit0;170 localized route shells. Final entry466.75kB/gzip158.40, CSS277.27kB/gzip39.49. No package changes.
- `npm test`:8/8; `node --test preview/*.test.mjs`:19/19, including existing mailto/header-injection tests; `npm run validate:content`:14/14.
- `preview/contact-desk-qa.browser.js`:21 production groups pass, zero page errors. EN/AR320/390/1366/1440/1920; DE/FR/ES390/1440. Zero horizontal overflow, labelled native controls,16px field text,44px targets, four factual channels, settled visible stage.
- Empty native validation, whitespace-only message refusal, encoded ampersands, real recipient, prepared-link focus, locale-preserved fields/URI, stale-draft removal, clipboard success/refusal feedback and keyboard Tab/Enter order pass. Clipboard API boundary was stubbed; no real user clipboard or external application was touched.
- Reduced-motion Contact has no active Contact timeline and opacity1. Pointer interaction followed by native Home navigation removes Contact DOM/timelines and settles stageopacity1. A640px viewport additionally checks zoom-sized reflow; this is not a physical-browser zoom or screen-reader certification.
- Chrome DevTools production screenshots inspected internally: EN/AR desktop1440/1920 and narrow320/390 views. Complete addresses, RTL, field frames, social labels and comfortable scale checked. Playwright confirms the actual dev5176 Arabic Contact is available, form479.5px high. No new review site, comparisons or media deliverable created.

## Recoverability and scope

Checkpoint `output/checkpoints/design-intelligence-before-2026-10-14-134930.zip` and manifest:746 entries, rechecked ZIP integrity, no missing baseline files. Before these documentation updates, only baseline `preview/Pages.tsx` and `preview/main.tsx` differ: Contact block/import cleanup and one scoped stylesheet import. Home/Skills/NotFound function bodies are unchanged after newline normalization; all other baseline application files, factual dictionaries, assets, dependency files and shared routing/motion remain identical. New Contact component/CSS/browser probes and scoped docs are additions. Preexisting dirty/untracked work is preserved. V1 was not written. No commit, push, merge or deployment.

Limits: local/emulated Chromium checks do not certify every physical browser, assistive technology or GPU. Email app opening/actual sending and real clipboard permission prompts were intentionally not exercised; the preserved mailto handoff still depends on the visitor's configured mail application.
