# Homepage redesign — verification and handoff

The homepage now uses **Engineering Fieldnotes**: monumental identity, charcoal/ivory/citron, genuine project photography, native project selection, asymmetric work compositions, a concise engineering statement, verified career highlights and contact. Both existing homepage URL families show this one new design. Other page compositions remain intact.

## Open locally
- Built Arabic: http://127.0.0.1:4176/preview/ar/
- Built English: http://127.0.0.1:4176/preview/en/
- Screenshots and actual recording viewer: http://127.0.0.1:5176/preview/homepage-review.html
- Actual files: output/playwright/homepage-redesign/

## Recoverable checkpoint
Before edits, `python scripts/checkpoint-design-intelligence.py` created and verified `output/checkpoints/design-intelligence-before-2026-10-13-162739.zip`, with 663 files and its SHA-256 manifest. Restore only selected files into V2 after reviewing current work; the archive includes pre-existing uncommitted work. Git HEAD remains `6a1ae32c558a3ae6b93b771c8b8fd485396abe4b`. No commit, push, merge, deployment, V1 write or new dependency installation.

## Scope and facts
New implementation: EngineeringHome.tsx, engineering-home-copy.ts, engineering-home-motion.ts, engineering-home.css. Existing runtime changes: LightPortfolio.tsx (Home selection/root scope), motion.ts (stationary Home/refresh ownership), index.html and prerender.mjs (responsive Bike Tower preload). Actual dictionaries, data, public assets, other-page components and route parser are byte unchanged. The previous QA report is preserved as `docs/design/CREATIVE-DIRECTOR-QA-2026-10-13.md` and in the checkpoint.

## Verification
| Verification | Result / evidence |
|---|---|
| `npm run typecheck` | Passed, no TypeScript diagnostics |
| `npm run build:light` | Passed; 170 existing locale/route shells generated |
| `npm run validate:content` | 14/14 passed; canonical facts and five dictionaries intact |
| `node --test tests/*.test.mjs preview/*.test.mjs` | 26/26 passed, including privacy, route, locale, motion and gallery-memory regressions |
| Playwright MCP viewport matrix | 35 states: five locales × 320/390/768/1024/1366/1920/2560 CSS px; no positive document overflow, one h1, 44px project controls, no runtime errors or failed resources. `responsive-matrix.json` |
| Playwright MCP interactions | 67 passed: native selection/Space activation, case links, Back selection restoration, five locales on both URL families, language focus, direction, contrasting keyboard rings, mobile menu/Tab/Escape, reduced-motion load and live cancellation, safe NFC media, resume href and reflow. `interactions.json` |
| Non-home browser routes | 80 approved/creative locale page and selected case routes; no errors. `non-home-route-audit.json` |
| Non-home visual regression | Gallery, About, Bike Tower case and Arabic Contact at unchanged viewport/DPR/reduced-motion state: exact identical pixels. `non-home-pixel-regressions.json` |
| Facts/media preservation | Checkpoint source hash audit: all content/data/public unchanged; no baseline files missing. `source-preservation.json` |
| Resume | HTTP 200, 190494 bytes; SHA matches source. `resume-http-proof.json` |
| Visual QA | Independent board + implementation opened in combined exact-density images; fonts, rhythm, color, real imagery, content and states reviewed. Root `design-qa.md` |
| Recording playback | Four Playwright WebMs decoded and played in the actual local viewer; zero console/page errors in viewer and fresh built Home captures |

## Actual recordings
| Recording | Duration | Pixels |
|---|---:|---|
| videos/home-en-1366.webm | 12.96s | 1366×768 |
| videos/home-ar-1920.webm | 13.36s | 1920×1080 |
| videos/home-en-390.webm | 14.92s | 390×844 |
| videos/home-ar-320.webm | 15.12s | 320×740 |

These are real browser recordings at 25fps, not generated or retimed animations. Extracted contact sheets `home-*-frames.jpg` show actual frames and entrance/selection/scroll states. Contexts created for recording were closed; unrelated browser contexts were preserved. Videos predate only the Spanish label wording correction, which does not affect their English/Arabic content or behavior.

## Performance and resolved issues
Chrome DevTools MCP recorded raw load/native-scroll traces and actual rAF/long-task/LCP/CLS probes. The initial entrance overlapped startup work: CPU4 maximum running-intro gap472.4ms. The revised entrance waits fonts + two painted frames, keeps identity/actions visible immediately and arms chapter observation after entrance. Revised CPU4 running-intro max55.6ms, P9520.9ms, LCP1304ms, CLS0; laptop LCP724ms/CLS0; phone LCP456ms/CLS0. Raw `performance-*-trace.json.gz` and `performance-final-*-trace.json.gz` retain both runs. Later changes add a cancellation guard/history restoration and Spanish presentation wording; they do not change entrance timing or geometry.

Other resolved findings: legacy typography overrode the intended 500-weight heading; explicit scoped priority restores it. Charcoal/burgundy keyboard rings on dark surfaces were invisible/weak; explicit contrasting focus states now work on both homepage families. Live reduced-motion toggling originally left outer-context chapter tweens active; owned tweens now revert, queued observer callbacks are guarded, and pending frames cancel. Native Back originally reset the selected project; the validated Home history record now restores it. The first typecheck found the repository's JSX key typing restriction; keyed native media wrappers/React.FC follow its established typing pattern. Small-phone image sizing now requests sufficient pixels for its crop; preload and image sizes match. Spanish systems label describes management systems rather than an operating-system claim.

## Limits
These are local instrumented Chromium/Chrome lab results, not production field metrics or guarantees on every device. Startup long tasks remain (CPU4 124/256ms before the running entrance). 683×384 CSS-pixel reflow approximates a 1366×768 viewport at 200%; native browser zoom and physical mobile hardware were not tested. Cross-engine Safari/Firefox testing and deployment are outside this local handoff. No unresolved P0/P1/P2 visual or functional findings remain in the tested scope.
