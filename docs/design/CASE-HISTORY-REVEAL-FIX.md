# Case image reveal after browser Back — 14 October 2026

Owner reports a partially revealed cover pausing then suddenly appearing after browser Back, with Terminal NFC evidence. Reproduced on production EN Terminal → Contact → native Back. Cover was decoded throughout, timeline progressed, but its computed clip remained `inset(0px 70% 0px 0px)` at300ms and700ms before jumping to unmasked. Regression probe recorded175 frames and only1 intermediate reveal state.

Root isolated with the actual installed GSAP in Chromium: a tween ending at unitless `inset(0 0 0 0)` serializes to one-value `inset(0px)`, so GSAP cannot continuously interpolate the four-side start. At25/50/75% progress it retained70% clipping. Ending with explicit percentage sides yielded52.5/35/17.5% at the same linear checkpoints.

Minimal fix: `preview/case-motion.ts` uses explicit four percentage sides for both image-reveal endpoints, mirrored for RTL. Existing1100ms duration,70ms offset, easing, cleanup, title choreography and incoming shared-image guard remain. No routing, loading, content/media or image-flight change.

## Verification

- `preview/case-history-reveal.browser.js`: failed before, passes after;168 sampled frames,89 intermediate reveal states, decoded from start and final clipnone.
- `preview/case-history-regressions.browser.js`:10 production groups pass. Terminal NFC/Eventies, EN/AR at390/1440,45–94 intermediate states, decoded final images, clipnone, headeropacity1, one document, no residual overlays. Live reduced-motion interruption, Forward and Back interrupted during entrance also settle correctly.
- First extended test used fixed elapsed time and then treated Back's immediately changed URL as mounted content. It reported an unfinished final frame/async image and later timed out on an interruption before route commit. The harness now awaits actual case DOM and entrance completion; it interrupts the real entrance rather than the outgoing page. No additional application change was made for these test timing errors.
- Native Terminal card→detail→Back at390/1440 preserves81 distinct shared-image transforms, no replayed cover clipping and zero overlays. `project-transit.ts` remains identical to the checkpoint.
- `npm run typecheck`, `npm run build:light`: exit0,170 localized shells. `node --test preview/*.test.mjs`:19/19.
- DevTools actual dev5176 repeats native history Back and samples continuous reveal/final unmasked cover. Bounded local/emulated Chromium checks do not guarantee every device's frame rate.

Checkpoint `output/checkpoints/design-intelligence-before-2026-10-14-142020.zip`,756 entries with manifest, ZIP rechecked. Before these report updates the only changed baseline application file is `preview/case-motion.ts`; two regression probes are additions. Existing dirty work, privacy-safe assets, dictionaries, fonts, dependencies and V1 remain unchanged. No commit/push/merge/deploy or new review site.
