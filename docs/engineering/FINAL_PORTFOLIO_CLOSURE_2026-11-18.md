# Final portfolio closure — 2026-11-18

Status: **PORTFOLIO ENGINEERING: CLOSED** for everything deployed. One open owner decision (uncommitted SEO work, see Repository).

## Release state

- Production: https://hashemkayyali.com on Vercel project `hashem-kayyali-portfolio` (`prj_S6lUBdHcoGvjIqA2n2q3MyMUBYj1`), Git remote `live`, branch `main`.
- Hardening release: commit `5585cd9`, deployment `dpl_Bnfe3jhuhydrB3m37rj4HG4HvRdF` (Ready, aliased to hashemkayyali.com and www). This closure document is a docs-only follow-up commit with its own deployment; the code in production is `5585cd9`.
- Supabase: `dxqkxjmpsjrpqmnhjzzo` (`hashem-portfolio-studio`, org `glitzz-lab`), Free plan, $0.

## Repository synchronization

- Before: `portfolio-v2` `main` at `2d7cfcf` with uncommitted owner work (13 modified files, untracked `.codex/` and `docs/content/PORTFOLIO_FULL_CONTENT_AUDIT.md`); `portfolio-v2-analytics` worktree on `feat/analytics` with the released code.
- Recovery points (kept): git ref `refs/backup/owner-wip-20261118` (snapshot of the working tree), branch `backup/main-2d7cfcf`, and `C:\Users\hashe\Desktop\portfolio-v2-backup-20261118\` (patch of tracked changes plus copies of the untracked files).
- Action: stash, fast-forward `main` to `live/main`, stash pop. One textual conflict in `preview/vite.config.ts` (two independent import additions) was resolved by keeping both. The owner's changes re-apply exactly (same 13 files, 176 insertions / 61 deletions as before). Nothing was discarded, reset or force-pushed. `npm install` added `@supabase/realtime-js` to `node_modules`; `tsc` is clean.
- Local `main` now tracks `live/main`. `main` and `feat/analytics` carry the same released code.
- Intentional divergence: `origin` (`HashemKayyali/portfolio`) is NOT connected to Vercel. Its `main` holds an earlier mistaken push of the analytics commit plus its revert (`277737e`). It was not touched, force-pushed or merged into production. Pushing there never deploys.
- **Owner decision:** the uncommitted work in `portfolio-v2` (sitelinks SEO: `vercel.json` index.html redirects, `preview/prerender.mjs`, `page-metadata.ts`, audit script, etc.) is NOT deployed and not reviewed here. Production currently answers `/en/index.html` with 200 (canonical `/en/`) because those redirects are in that uncommitted work.

## Security

- `track_event` hardening (applied, verified): the public function is now gated by a server-only ingest token. `public.analytics_ingest` (RLS, no grants) stores only its SHA-256; the plaintext is the sensitive Vercel Production variable `ANALYTICS_INGEST_TOKEN`, read only by `/api/analytics`. A call without the right token raises 42501. The handler fails closed (503, no write) if the variable is missing. The legacy 9-argument signature had its grants revoked (not dropped; the drop was declined, the function is unreachable to anon). Idempotency (event id) and caps (40/min per visitor, 60/min and 5000/day global) are unchanged.
- Verified on production: a POST through `/api/analytics` writes a row; a direct anon RPC call returns 401/42501; a request with another Origin is dropped (204, no write); real beacons and the dashboard work after the change.
- What this does NOT do: the Origin check does not stop direct HTTP abuse (anyone can send a forged `Origin` header to `/api/analytics`). Remaining protections there are the validation, the per-IP in-memory limit of the handler (per serverless instance, so soft) and the database caps. An attacker can still skew counts or use the day's 5000-event budget (the table fails closed). It cannot read rows or exceed the caps. The privileged credential is not in any browser bundle; the browser carries only the publishable key.
- The token is also not a Studio credential: Studio's `SUPABASE_SECRET_KEY` is not used by Analytics.
- `insights_summary` review: returns counts, top-10 paths/projects/sources/countries/devices/languages, row count and database size. No visitor/session ids, no raw rows. Intentionally public.
- Studio warning `public.rls_auto_enable()`: it is the body of the event trigger `ensure_rls` (enables RLS on new public tables); the repo does not call it; it cannot do anything when called over RPC (event-trigger type). Grants to `public`, `anon`, `authenticated` were revoked (migration `analytics_revoke_legacy_track_event_and_rls_auto_enable`). Verified in a rolled-back probe that creating a table in `public` still gets RLS enabled automatically. No Studio table or policy was touched.

## Analytics accuracy (current deployment)

- Real Chrome on production (earlier today, still the same logic): page views for `/en/`, `/en/projects/` (client-side navigation) and `/en/about/`; one visitor and one session across tabs; Presence showed 1 visitor on 2 tabs and dropped after closing; owner exclusion produced no analytics or Realtime requests and no rows; filters today / yesterday / week / 7d / month / 30d / 90d / custom returned data; Asia/Amman day boundary confirmed in SQL (20:59:59Z → previous day, 21:00:00Z → next day) and by unit tests of the Monday-week and month presets.
- Database live checks (public key only): 13/13 after hardening (RLS denies read/insert/update/delete, direct track_event forbidden incl. legacy signature, constraints, aggregate-only summary, range validation, Presence dedupe, observer not counted, tab close, reconnect).
- Failure handling: unit tests (Supabase down → 503 without throwing; dashboard shows an unavailable message). Not exercised against a real Supabase outage.
- Cache: the summary is CDN-cached 20 s (+60 s stale) and the dashboard refreshes every 60 s, so numbers can lag up to about 80 s.
- Production-only tracking: hostname allow-list in the browser and Origin check in the API; localhost and preview hosts are dropped.
- Test data: all test rows removed; production currently holds only real visitor rows (5 at last check).

## Performance (Lighthouse 13, mobile emulation, headless, https://hashemkayyali.com)

- `/en/`: performance 80, FCP 1.2 s, LCP 1.2 s, TBT 820 ms, CLS 0.
- `/en/projects/eventies/`: performance 98, FCP 1.2 s, LCP 1.2 s, TBT 140 ms, CLS 0.
- Lighthouse sets `navigator.webdriver`, so the tracker does not run there; analytics cannot have contributed to these numbers. The tracker is loaded dynamically after `load` and idle, and public tabs do not subscribe to presence events (only join and track). The home TBT is from the existing hero animation; it was not compared with a pre-analytics baseline.

## SEO (live, `scripts/audit-production-seo.mjs`)

95 sitemap URLs checked, no problems (canonical, five-language hreflang, og, robots, lang/dir, titles; note: `/de/` title is 75 characters). `/insights`: not in sitemap, `X-Robots-Tag: noindex, nofollow` and meta noindex, not disallowed in robots.txt. `/preview/en/` and `/en/projects` redirect (308); journal, gallery, projects, project pages, `/ar/` return 200; unknown paths 404.

## Tests actually executed

`npm test` 154/154, `tsc`, production build (95 URLs), `scripts/analytics-live-test.mjs` 13/13, production SEO audit, Lighthouse x2, real-browser checks listed above.

## Free-plan usage and cost

Database about 12 MB of 500 MB; Realtime limits 200 concurrent / 2M messages per month; no paid add-ons enabled; budget $0.

## Unresolved, non-critical

- Presence is per browser, not per person; idle hidden tabs still count; a closed tab disappears after the server notices the socket (seconds to about a minute).
- Origin spoofing and ID rotation can skew counts within the 5000/day cap (see Security).
- Legacy `track_event(uuid,…)` and the helper function remain in the database with revoked grants (could be dropped on request).
- Home TBT 820 ms (pre-existing; not part of this closure).

## Infrastructure cleanup

The mistaken project `ymwdkycrtuzksefdkrgj` (`portfolio-analytics`, Terminal NFC org): not referenced by any source file in `portfolio-v2` or by the live bundle (searched at 6cfaae5 and now). Deleting it is safe for the portfolio. It was not deleted and needs a separate owner approval. The Terminal NFC database `vgzharpbnpkemrhfvals` was never touched.

## Owner actions

1. Decide what to do with the uncommitted sitelinks SEO work in `portfolio-v2` (review, commit, deploy via `live`, or discard).
2. Approve deletion of `ymwdkycrtuzksefdkrgj` when wanted.
3. Chrome used for testing still has "Exclude my visits" on; toggle on `/insights` if desired.
4. Keep `ANALYTICS_INGEST_TOKEN` in Vercel Production; if it is rotated, update `public.analytics_ingest.token_hash` to the new SHA-256 in the same step.

## Google Search Console checklist

1. Property `https://hashemkayyali.com/` (domain or URL-prefix): Sitemaps → submit `https://hashemkayyali.com/sitemap.xml`; expect 95 discovered URLs.
2. URL Inspection on `/en/`, `/en/projects/`, `/en/about/`, `/en/contact/`, a project page and one `/ar/` page; confirm "URL is on Google" or request indexing only for pages not yet indexed.
3. Pages report: review "Not indexed" reasons (expected: `/insights` noindex, redirects, `/creative/`); check duplicate/canonical issues across locales.
4. International targeting is via hreflang; check there are no hreflang errors in the page-level reports.
5. Branded search ("Hashem Kayyali"): watch Performance by query/page for 4 to 8 weeks. Sitelinks are chosen by Google and cannot be requested or promised.
