# Analytics phase closure

Status: **CLOSED** (verified on https://hashemkayyali.com on 2026-11-18, Asia/Amman).

## Release

- Release commit: `6cfaae5` (analytics: `e020289` + project config `6cfaae5`), fast-forward onto `live/main` from `2d7cfcf`. This closure document is a docs-only follow-up commit.
- Production deployment of the release: `dpl_EJVbogvFhUoP6eZ3UuVHCGtQW69B` (Vercel project `hashem-kayyali-portfolio`, `prj_S6lUBdHcoGvjIqA2n2q3MyMUBYj1`, Ready, aliased to hashemkayyali.com and www).
- Deploys come from Git remote `live` (`HashemKayyali/hashem-kayyali-portfolio`), not `origin`.
- Supabase project: **`dxqkxjmpsjrpqmnhjzzo`** (`hashem-portfolio-studio`, organization `glitzz-lab`), shared with Studio; Analytics objects are separate (`analytics_events`, two functions). Free plan, no paid add-ons.
- The Terminal NFC organization was never used for the live site. A mistaken project `ymwdkycrtuzksefdkrgj` (`portfolio-analytics`) exists in that organization; it is unused (no code references it, no live request targets it) and can be deleted by the owner. It was not deleted automatically.

## Architecture

- Browser (public pages, lazy, after `load`, only on hashemkayyali.com): `analytics/tracker.ts` sends one beacon per page view (including client-side navigation) to `/api/analytics`; `analytics/presence.ts` joins the Realtime Presence channel `site-presence` keyed by an anonymous visitor id (tabs of one browser share the key, so they count once).
- `/api/analytics` (`server/analytics/handler.ts`): POST validates and drops non-production origins and bots, derives device, source, country (Vercel header) and calls `track_event`; GET returns aggregates only from `insights_summary` (CDN-cached 20 s).
- `/insights` (`insights/`): standalone noindex page, no login, aggregates only. It observes Presence but never tracks itself.
- Owner exclusion: `localStorage.hk_ax=1`, shared by all tabs of that browser; stops page views and presence.
- Visitor = anonymous browser id; session = 30 min inactivity (id shared across tabs); all days use Asia/Amman.

## Migrations (additive only)

`supabase/analytics/202611180001_analytics.sql`, `…0002_session_source.sql`, `…0003_track_event_caps.sql`. Applied to the project as `analytics_events_and_functions` (0001+0002 combined) and `analytics_track_event_caps`. No Studio object was touched. The 0003 file records the two added lines; the full function lives in the database.

## Evidence

- Local: 153/153 `npm test`, `tsc` clean, production build, sitemap 95 URLs without `/insights`.
- Live database (public key only): 15/15 checks in `scripts/analytics-live-test.mjs` (RLS denies read/insert/update/delete of raw rows, idempotent event ids, constraint rejection, per-visitor limit, aggregate-only summary, range validation, Presence dedupe across tabs, observer not counted, tab close, reconnect).
- Production (real Chrome session): page views recorded for `/en/`, `/en/projects/` (client-side navigation) and `/en/about/` with country JO, one visitor and one session across two tabs; `/insights` showed 1 visitor on 2 tabs, then 0 after the tabs closed; date filters (today, yesterday, week, 7d, month, 30d, 90d, custom) returned data; after enabling exclusion, a new tab made no analytics or Realtime request and added no row.
- A real external visitor (Google search, mobile) was recorded during the test; that data is kept. All test rows (43 earlier, 3 from the production check, later live-test rows) were deleted; only real rows remain.
- Live bundle references only `dxqkxjmpsjrpqmnhjzzo`; no `sb_secret`/`service_role`.
- SEO regression: `audit-production-seo.mjs` 95 URLs, no problems (note: `/de/` title is 75 characters). `/insights`: `X-Robots-Tag: noindex, nofollow` and `<meta name="robots" content="noindex, nofollow">`; not in sitemap; not blocked in robots.txt.

## Security review of the public RPCs

- `analytics_events`: RLS on, no policies, all grants revoked; the public key cannot select/insert/update/delete.
- `insights_summary(date,date)`: returns only aggregates (counts, top-10 lists, DB size and row count). No visitor or session ids.
- `track_event(...)`: public write by design (like any analytics beacon). Validation by CHECK constraints, idempotent by event id, timestamps from the server clock. Caps: 40 events/min per visitor id, 60/min and 5000/day globally.
- **Spoofing limit:** the per-visitor limit keys on a client-supplied id, so an attacker can rotate random ids to bypass it. The global caps bound the damage (at most 5000 rows/day, about 1 MB/day) but a flood can (a) skew the numbers, including fake countries/sources if the RPC is called directly (the API's origin check does not protect direct RPC calls), and (b) deny real visits for the rest of the day (fail closed, preferred over exceeding the free plan). There is no authentication, so the numbers are estimates, not audited counts.
- Existing, not changed here: Studio's `public.rls_auto_enable()` is executable by `anon`/`authenticated` (advisor WARN). Owner may revoke it after confirming Studio does not call it through the API.

## Limits

- Live count: Presence drops a visitor when the server notices the closed socket (seconds, up to about a minute). Hidden/idle tabs still count. Visitors are browsers, not people.
- Dashboard numbers can lag up to about 80 s (CDN cache + 60 s refresh).
- Free plan: Realtime 200 concurrent connections and 2M messages/month; DB 500 MB (currently about 12 MB). Rows older than 400 days are pruned opportunistically (no cron). If Supabase is down the site is unaffected (beacons fail silently, dashboard shows an unavailable message).
- Not verified: effect on Lighthouse/field performance (the tracker is lazy and about 18 KB gzip for Presence); behaviour at free-plan Realtime limits.

## Owner actions

1. Optionally delete the unused NFC project `ymwdkycrtuzksefdkrgj` in the Terminal NFC organization.
2. The Chrome used for testing has Exclude-my-visits switched on; toggle it on `/insights` if unwanted.
3. Review the `rls_auto_enable` advisory.
