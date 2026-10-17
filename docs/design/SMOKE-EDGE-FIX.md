# Hero smoke to screen edge — 14 October 2026

Owner requests removing the hard side cut from the hero smoke. Actual production1920 EN showed the atmosphere inside the content gutter: left48px/right48.2px, with its paint ending at1856.8 while client width1905. The inset container caused the vertical cut.

One CSS rule in `preview/atelier-app-shell.css` now gives the persistent atmosphere100% width and no maximum width. Text/media containers keep their existing gutters. Existing64% desktop paint, mirrored Arabic positioning, horizontal/vertical gradient masks, opacity, worker/shader, header offset and hero heights remain unchanged. Mobile paint still spans100%. This applies consistently to Home/About/Projects/details because they share the same persistent surface.

`npm run build:light` exits0 and generates170 localized shells. Actual production browser geometry:32 states, EN/AR at320/390/1440/1920 across Home/About/Projects/Eventies; maximum paint edge gap0.2px due to subpixel rounding, zero horizontal overflow, original gradient masks/header offset intact.1920EN portrait rectangle exactly unchanged and hero still837px high. Internal DevTools visual inspection of1920EN and390AR confirms edge coverage and inward blend. Native mobile Home→About retains identical canvas/photo nodes with0px atmosphere geometry delta and visible header.

Checkpoint `output/checkpoints/design-intelligence-before-2026-10-14-141614.zip` and manifest:755 entries, ZIP rechecked. Before report updates, the only changed baseline file is the single CSS rule; application behavior, factual content, media, fonts and shared motion are untouched. No V1 writes, dependency changes, commit/push/merge/deploy or extra review site. Evidence is from local/emulated Chromium, not every physical device.
