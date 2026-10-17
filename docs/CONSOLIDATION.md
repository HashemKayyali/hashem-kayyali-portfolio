# Final Portfolio V2 consolidation —17 October2026

Owner request: consolidate the work and provide one final independent Desktop folder for continuation with Claude Code. Destination: `C:/Users/hashe/Desktop/portfolio-v2`.

## Resolution policy

The approved current UI and cloud Studio from `site-v2-light-burgundy` are authoritative. A verified923-file snapshot, including uncommitted current application files and local skills, was copied byte-for-byte before the handoff configuration changes. The new repository has its own Git objects; it is not a linked worktree, symlink, shared object alternate or dependency on the old folder.

All18 original local branch tips are recorded in `docs/consolidation/original-branch-tips.txt`. Most are already ancestors of the current line. The remaining lines are the earlier `codex/portfolio-v2-design` prototype, `codex/editorial-glass-redesign` and `portfolio-rebuild`. They introduce alternative older designs, not missing current V2 features. Their historical commits are consolidated into the final main history using the approved current tree as the explicit merge resolution. They do not replace approved typography, content, galleries or page families. This is history consolidation, not activation of all mutually incompatible historical UIs.

All other worktrees were inspected read-only. Verified recovery of287 changed/untracked files, including old work3/work4 prototypes and QA assets, is in ignored `archive/other-worktree-drafts.zip` with binary tracked-change patches and a full inventory. The current923-file source checkpoint and SHA manifest are also in `archive/`. These archives are local recovery material, excluded from Git/public output. Original worktrees/folders and their dirty work were left intact. No original branches were deleted or rewritten.

## Final-folder changes

- Default dev/build/preview commands now select `preview/vite.config.ts`, the actual approved app. Explicit `*:legacy` scripts retain the old root application's commands.
- `/` redirects to `/preview/en/` in development and built preview, matching existing Vercel root routing.
- `npm test` includes both root and preview suites; `npm run check` includes TypeScript, tests and content validation.
- `CLAUDE.md`, the current README and the final workspace ruling in AGENTS identify the correct app, design contract, cloud limits and continuation path.
- Recovery archives are explicitly withheld by the existing dev/preview media policy, including encoded and Vite filesystem aliases. A regression test covers these paths. They remain outside the production public folder.
- No cloud keys, new provider accounts, deployment, push or remote connection are part of this consolidation.

## Verification

Source baseline:74 tests passed before consolidation. Verified final-folder results:

| Check | Result |
| --- | --- |
| `npm ci` | independent local install,0 reported vulnerabilities |
| `npm run check`, including after the merge and archive-policy correction | TypeScript exit0;75 tests passed;14/14 content checks passed |
| `npm run build` | exit0,200 localized V2 route shells |
| Merge ancestry | all18 original branch tips are ancestors of final main |
| Merge resolution | `00feaaf` has the exact same tree as approved parent `ebb2b97`; old UI code was not reactivated |
| Source preservation | all923 original source/skill file hashes remain unchanged in the old folder |
| Target comparison | five handoff files changed intentionally: package.json, Vite route config, README, AGENTS and .gitignore. Final review added a narrow archive-policy fix and regression test. Other additions are handoff/audit documents |
| Repository independence | real local .git directory; no commondir, linked worktrees, symlinks or object alternates; one main branch; original-folder remote removed |
| Actual Chromium |32 EN/AR route/size samples across320/390/1440/1920: no horizontal page overflow, headings/header visible; current Home/Skills/Experience/Admin/case routes load |
| Root/API | dev5176 and built4176 roots redirect to /preview/en/; missing-cloud status/public API remain honest setup/empty states |
| Recovery privacy |12 actual HTTP checks across dev/preview return404 for plain, encoded, double-encoded, case and filesystem archive paths |
| Independent review | repository/ancestry/source completeness verified; archive exposure and inventory-link findings corrected and rechecked; no remaining finding |

`git diff --cached --check` during the initial import exposed inherited end-of-file/trailing whitespace in several previously untracked source files, literal font licenses and a pinned SVG. These are nonfunctional pre-existing formatting findings; licensed/pinned asset bytes were preserved. The scoped handoff/configuration diff check passes. No application redesign was made during consolidation.

The new folder is running at5176 and4176. `archive/final-browser-qa.json` and `archive/final-admin.png` retain local verification evidence. Real cloud account/key/migration/upload/deployment verification remains pending exactly as documented in the existing cloud setup guide. Physical-device/browser certification and search-engine launch are not claimed.
