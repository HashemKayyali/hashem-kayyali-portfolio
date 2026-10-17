# Engineering Fieldnotes — Homepage QA

**Source visual truth:** `preview/homepage-art-direction.html`, created and captured before React implementation. Source screenshots: `output/playwright/homepage-redesign/source-1366.png` and `source-390.png`.

**Implementation:** built local `/preview/en/`, `/preview/ar/` and corresponding creative homepage paths. Default project Bike Tower, top of Home, fonts loaded, `data-intro=complete`. Implementation images: `final-en-1366.png` and `final-en-390.png` in the same output directory.

**Normalization:** CSS1366×768/DPR1 → both source and implementation1366×768 pixels; CSS390×844/DPR1 → both390×844 pixels. No resampling, browser chrome or device frame. Combined full-view files: `comparison-final-1366.png` (2732×768) and `comparison-final-390.png` (780×844). These were opened together, not judged from separate views. Focused typography/media pairs: `comparison-detail-1366.png` and `comparison-detail-390.png`; these retain equal-density source/implementation crops. Arabic and other locales are assessed against the multilingual/responsive brief and genuine dictionary content, not claimed as English-source clones.

## Comparison history and resolved findings

1. **Typography [P2]:** the inherited generic heading rule overrode intended weight500/tracking−.065em with weight600/tracking−.035em. Evidence: `iteration-1-ready-1366.png`, `iteration-2-en-390.png` and measured computed font styles. Fix: Home-owned specificity and explicit display typography. `comparison-iteration-3-1366.png`/`comparison-iteration-3-390.png` were recaptured and opened together with the source; exact intended family, weight and tracking now match.
2. **Focus/contrast [P2]:** primary-button focus outline matched the charcoal surface; creative Home inherited burgundy rings. Browser RED evidence: primary outline and background both rgb(23,26,24), creative ring rgb(88,21,45). Fix: sufficiently specific explicit citron rings on dark surfaces and dark rings on paper/citron surfaces. Browser GREEN: rgb(219,248,121) primary ring on both URL families. `focus-approved.png`/`focus-creative.png` and `interactions.json` provide post-fix evidence. Footer contact also explicitly receives the paper foreground.
3. **Small-phone image quality [P2]:** a 320w source could undersupply the tall cropped hero. Fix: minimum500px responsive sizing selects640w; preload and rendered image use identical sizes/srcset. Final matrix verifies actual hero source at each width. Final phone image remains the genuine Bike Tower photograph; no recreated product art.
4. **Motion [P2]:** initial CPU4 entrance overlapped startup and had a472.4ms running-intro frame gap. Fix: settle fonts/two frames before entering, retain immediately visible identity/actions, defer chapter observation, remove competing initial selection animation. Revised trace max55.6ms/P9520.9ms. An active chapter tween also survived live reduced-motion changes; it now reverts, pending frames cancel and queued observer callbacks are guarded. GREEN: no active timelines and chapter opacity1 within200ms of preference change.
5. **Navigation state [P2]:** selecting Eventies → opening case → native Back returned to Bike Tower. Fix: validated Home-specific history record, isolated by locale/experience. Both homepage URL families now restore Eventies; tested in `interactions.json`.

Early `iteration-1-1366.png`/`iteration-1-390.png` were captured while the browser was backgrounded and before the entrance finished; they are animation-state evidence, not the passing static comparison. Final captures bring the page to front and wait for actual readiness. All findings above are resolved before passing this report.

## Required fidelity surfaces

- **Fonts/typography:** self-hosted Instrument Sans500 display, Geist reading/UI; independent Arabic Tahoma/Arial sizing and logical RTL. Hero family/weight/tracking match source. Headlines wrap cleanly at320–2560px and in all five languages; no text truncation. Longer German/French roles wrap rather than shrink. Actual career/contact regions reviewed in `final-career-en-1366.png` and `final-contact-ar-1366.png`.
- **Spacing/layout rhythm:** wide masthead, compact identity rail and large horizontal photograph match the board hierarchy. Final media track is modestly wider than the schematic board; mask padding protects descending letters. These are accepted implementation differences. Mobile explicitly stacks name/roles/actions before the photograph, with44px native project controls; paper work, approach, career and citron contact chapters were inspected in full-page and region captures.
- **Colors/tokens:** charcoal#171A18, ivory#F3F2EC and citron#DBF879 apply only to Home. Actual text contrast ratios: dark/paper15.64, muted/dark8.26, muted/paper5.46, accent/dark14.79. `contrast.json`. Focus works on both URL families; active project has pressed semantics as well as accent color.
- **Images/asset fidelity:** actual Bike Tower installation, Eventies screenshot, sanitized NFC interface and supplied Hashem portrait. Correct subjects and useful crops retained; mobile hero receives adequate pixels. Original customer-sensitive screenshots are not rendered. Native Lucide navigation/control icons intentionally implement the schematic board's directional glyphs; no fake logo, CSS product art or generated photograph substitutes.
- **Copy/content:** owner identity, roles, location, engineering statement, project description/technology, career and public contact come directly from unchanged approved source dictionaries/profile/assets. Additional labels are translated presentation text. Spanish management-systems wording avoids implying an operating-system project. No new professional claims or invented metrics.

## Interactions, accessibility and regression evidence

35 viewport/locale states,67 interaction checks,80 non-home route checks. Native case links, history Back, Space-activated project selection, pressed state/status announcement, language selection/focus, mobile menu/Tab/Escape, reduced motion at load/during animation, safe media and resume were tested. Fresh built Home and review viewer have zero console/page errors. Four outside-scope pages compare pixel-identically against pre-change captures. Actual local video playback was verified for all four recordings; extracted frames show genuine entrance/selection/scroll motion.

## Acceptable differences and remaining limits

Native globe/select/menu/visible focus and real SVG control icons add functional UI to the schematic source board. Minor media-track/mask-spacing differences preserve its composition. Desktop/mobile source pairs match the chosen visual direction; lower-page compositions are evaluated against `docs/design/HOMEPAGE-VISION.md` and genuine media, not represented as a clone of an absent full-page source.

No unresolved P0/P1/P2 findings. P3: further photographic material could broaden evidence in a future content update, requiring authentic supplied assets. Tests are local Chromium/Chrome, not Safari/Firefox or physical mobile hardware. The200% zoom check is equivalent-width reflow; lab performance includes startup long tasks and does not guarantee every frame on every device.

**Implementation checklist:** completed — scoped Home, exact content/media preservation, all five locales, native controls/navigation, keyboard contrast, responsive layouts, cancellable motion, typecheck/build/regressions, independent visual comparison, real recordings and recoverable checkpoint. Full commands and trace/recording details: `docs/design/HOMEPAGE-REDESIGN-VERIFICATION.md`.

**final result:** passed

Previous completed gallery/refinement QA is archived at `docs/design/CREATIVE-DIRECTOR-QA-2026-10-13.md`; that historical pass is not evidence for the current redesigned Home.
