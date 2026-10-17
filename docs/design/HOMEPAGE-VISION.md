# Homepage — Engineering Fieldnotes

The 13 October request replaces earlier homepage aesthetics. Hashem Kayyali is the protagonist; actual products provide the evidence. A charcoal masthead, monumental name, warm paper chapters and a restrained citron accent establish a new homepage identity. Existing route/page designs remain untouched.

## Shared rules
- Homepage only, on both existing approved and creative homepage URLs. Existing gallery variants and all other pages stay intact.
- Palette: charcoal #171A18, paper #F3F2EC, citron #DBF879, dark muted #ADB4AA, paper muted #5C645B. Sharp edges, fine rules, no decorative glass or generic gradients.
- Self-hosted Instrument Sans for monumental type, Geist for prose, system monospace for numbering. Existing Arabic Tahoma/Arial remains legible with independent sizing and logical direction.
- Recruiter journey: identity/roles → interactive genuine project photograph → three selected project stories → engineering approach and career evidence → contact/resume.
- Hero buttons choose one of three actual projects. No autoplay, no gesture dependency. One native case link updates with the selection; pressed state and a contextual status announcement communicate the change.
- Laptop 1366×768 uses a broad image and a compact identity rail. Wide screens cap reading and media canvas at 1880px. Mobile stacks identity before the image, wraps project controls, and retains 44px targets. No horizontal scroll or scroll hijacking.
- Motion: masked name entrance, compositor image scale/fade, short chapter entrances and restrained hover. Native scroll. No looping effect or per-character split. Static visible final states for reduced motion, low-power and save-data policies. Every animation/observer is owned and reverted on route/locale changes.
- Facts come from existing dictionaries/profile/projectAssets. Safe ProductImage/StoryMedia components preserve redaction. No invented metrics or availability claim.

## Source visual truth
Independent static composition: preview/homepage-art-direction.html. Capture at 1366×768 and 390×844 before React implementation, with density 1. Compare source and implementation together, then refine.

## Definition of done
Typecheck/build/content + relevant regression tests pass. All five locales, approved/creative Home routes, mobile menu, project selection, case navigation/back, resume, keyboard, reduced motion and overflow verified. Compare four unchanged pages before/after. Chrome DevTools traces at laptop/mobile/CPU4. Deliver actual screenshots, real browser recordings, a local review viewer and documented checkpoint. No V1 edits, push, merge or deployment.
