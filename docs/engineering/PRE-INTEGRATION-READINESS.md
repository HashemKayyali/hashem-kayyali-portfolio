# Pre-integration readiness report — 18 October 2026

Scope: nonvisual engineering, security, SEO and integration-readiness audit of the active portfolio (`preview/`, `server/studio/`, `api/`, `studio/`, `supabase/`, `vercel.json`). Baseline: production and `main` at `de87350` (tag `checkpoint/pre-audit-2026-10-18`). All work is local and **not deployed**. No external accounts, secrets, databases or Cloudinary resources were created or touched.

## 1. Executive summary

The public portfolio is healthy: no dependency vulnerabilities, no console errors or overflow across 120 page/device/locale probes, and correct redirects and SEO tags in production. The audit found and fixed:

- **one critical issue:** a default admin password, `8080`;
- **seven high-priority issues:** non-distributed throttling, non-revocable sessions, no MFA, soft 404s, a CSS syntax error that silently dropped the smoke-window fade, a 3× full-page restyle on every automatic theme change, and (fixed and deployed earlier this session) app blanking after deploys;
- **twelve medium items.**

The Studio code is now prepared to fail closed, with scrypt-hashed credentials, TOTP in production, database-backed revocable sessions and distributed throttling. The migrations are verified on PostgreSQL 17, and 111 automated tests pass (75 before).

**Decision:** the codebase is ready to *begin* connecting Supabase and Cloudinary in the order given in [CLOUD-STUDIO-SETUP.md](../design/CLOUD-STUDIO-SETUP.md). The admin must not be enabled in production until this commit is deployed and the real-account acceptance checklist passes. Section 11 lists what remains.

## 2. Readiness matrix

| Area | Decision | Basis |
| --- | --- | --- |
| Public portfolio | **READY WITH CONDITIONS** | All checks pass locally. Conditions: deploy, then confirm the new Vercel 404/redirect behaviour on production (modelled locally only); owner approval of the restored smoke-window fade (F7). |
| Studio Admin | **READY WITH CONDITIONS** for connection; **NOT VERIFIED** with real accounts | Fails closed today (production status: admin unavailable). Requires generated credentials, TOTP, Supabase and the acceptance checklist. |
| Supabase integration | **READY WITH CONDITIONS** | Both migrations and both rollbacks pass 73 checks on PostgreSQL 17 (PGlite) with Supabase-like roles. Not yet run on Supabase itself (PostgREST, managed default grants). |
| Cloudinary integration | **READY WITH CONDITIONS** | Signing, receipt verification, rejection clean-up and delivery URLs are unit-tested against Cloudinary's documented algorithms. Real upload/destroy/derivatives are not yet verified. |
| Google Search Console | **NOT VERIFIED** | No access from this environment. Instructions in section 8. |

## 3. Findings

Severity: **P0** critical security, **P1** high (security, correctness or user-visible failure), **P2** medium, **P3** low/informational. All P0–P2 items are fixed locally unless marked otherwise.

| ID | Sev | Finding | Files | Root cause | Fix | Test |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | P0 | Admin password fell back to `8080` when unset; `.env.example` and docs prescribed `8080`; the password was a plaintext env var. Not exploitable today (admin disabled: no session secret), but it would be on activation: 10,000 combinations against an 8/min per-instance limit. | `server/studio/auth.ts`, `config.ts`, `.env.example`, `docs/design/CLOUD-STUDIO-SETUP.md`, `CLAUDE.md` | Owner convenience default kept from the first Studio build | No default. Only `ADMIN_PASSWORD_HASH` (scrypt N=2^15, r=8, p=1) is accepted; a plaintext `ADMIN_PASSWORD` disables admin; weak scrypt parameters are refused; `npm run studio:password` enforces strength (14+ chars, variety, no common words or sequences). | config fail-closed tests; `8080` refused; strength rules; hash parsing |
| F2 | P1 | Sign-in throttle was in-memory per serverless instance (reset on cold start, not shared, bypassable by IP rotation; keyed on raw `x-forwarded-for`). | `handler.ts` | Process-local `Map` | Database-backed throttle (`studio_auth_record_failure`/`gate`): 5 per client and 30 global per 15 min, 15-min lock, correct password refused while locked, keyed HMAC of the platform IP header (raw IPs never stored), fails closed if the store is unavailable. | throttle, global ceiling, reset, fail-closed tests; SQL contract |
| F3 | P1 | Logout only cleared the browser cookie; a copied cookie stayed valid for 8 hours. | `auth.ts`, `handler.ts` | Stateless signed cookie | Cookie seals a reference to a `studio_admin_sessions` row; logout revokes it; "Sign out everywhere" revokes all; password-hash or secret rotation invalidates every cookie. | logout-replay, sign-out-everywhere, rotation, deleted-row tests |
| F4 | P1 | No second factor for a public admin login. | `auth.ts`, `config.ts`, `StudioAdmin.tsx` | Not implemented | RFC 6238 TOTP (no dependency), required when `VERCEL_ENV=production`, ±1 step drift, replay blocked by `studio_auth_consume_totp`; the replay store is consulted only after both factors are correct. | RFC vectors, wrong/missing/replayed/old codes, drift |
| F5 | P1 | After a deploy, an open tab clicking to a page whose code chunk was gone did nothing; a failing lazy Studio page blanked the whole app. | `preview/main.tsx`, `creative-loader.ts` | No failure path, no error boundary | Full-page navigation fallback and a route error boundary that reloads once. *Fixed and deployed in b66ea50.* | browser history suite |
| F6 | P1 | Unknown paths under a language (e.g. `/en/projects/does-not-exist.php`) returned 200 with the app shell (soft 404). | `vercel.json` | Catch-all rewrite `/:locale/:path(.*)` | Catch-all removed (every real page is a prerendered file); slashless known pages and projects get 308s to their canonical URL; everything else serves `404.html` with status 404 and `noindex`. | `tests/seo-routing.test.mjs` (route lists stay in sync); path-to-regexp model. **Production verification pending.** |
| F7 | P1 | A stray `}` in `ui-polish.css` made browsers discard the next rule: the hero smoke window's vertical fade (`mask-image`). Production computed `mask-image: none`, a hard bright edge on the divider under the hero. It also caused the long-standing build warning. Likely the "flashing separator line" previously reported but not reproduced. | `preview/ui-polish.css` | Unbalanced brace | Brace removed; all stylesheets now balance; build warning gone. **Visible change, owner approval required**: [before](../../preview/review-assets/r4/smoke-before-projects.png) / [after](../../preview/review-assets/r4/smoke-after-projects.png). | brace scan; computed style before/after |
| F8 | P1 | Each automatic 30 s theme change ran three full-document restyles (~1,590 elements, 75–130 ms each on desktop): a 204 ms long task and a 396 ms frame on desktop, and a 778 ms frame on 4× throttled phone. | `preview/themes.ts`, `themes.css` | Toggling `data-theme-transition` on `<html>` matched a broad descendant rule, twice per change | Typed view transition (`startViewTransition({update, types:['theme-auto']})` with the correct receiver) and CSS on `:active-view-transition-type(theme-auto)`; graceful fallback to an instant change without View Transition types; the cycle is off on constrained devices. | traces (section 6), lifecycle tests |
| F9 | P2 | A signed upload that later failed verification (size, format, dimensions) stayed public in Cloudinary. | `server/studio/cloudinary.ts` | Cloudinary cannot enforce byte limits on signed uploads | Signed `destroy` with CDN invalidation for rejected uploads; nothing registered. | 3 rejection cases with signature check |
| F10 | P2 | Studio media would be delivered as originals (up to 20 MB). | `preview/cloudinary-delivery.ts`, `PortfolioSections.tsx`, `StoryMedia.tsx`, `StudioPages.tsx` | Raw `secure_url` rendering | `f_auto,q_auto,c_limit,w_N` derivatives with `srcset` (never upscaled); videos `q_auto`; look-alike hosts pass through untouched. | `cloudinary-delivery.test.mjs` |
| F11 | P2 | Every page view would trigger three database queries (public content `no-store`). | `handler.ts`, `StudioProvider.tsx` | No caching | Edge cache `s-maxage=60, stale-while-revalidate=300`; a signed-in admin can force a fresh copy after saving. | caching test |
| F12 | P2 | `x-default` hreflang was removed when the app booted (client head update). | `preview/page-metadata.ts` | Client rebuilt alternates without it | Same six alternates as the shell. | browser suite |
| F13 | P2 | Raw HTML had no links; non-JavaScript crawlers could only use the sitemap. | `preview/prerender.mjs` | Empty app shell | Localized `<noscript>` navigation to all pages and 11 projects in every shell. | production SEO audit |
| F14 | P2 | Gallery/Journal descriptions were sub-lines only; project descriptions 290–350 chars. | `preview/page-metadata.ts` | Raw copy used as meta | Gallery/Journal use intro plus line; descriptions clamped to ≤160 chars at sentence boundaries. | `seo-routing.test.mjs` (all 5 languages) |
| F15 | P2 | Missing foreign-key indexes; reorder RPC lacked the advisory lock used by move. | `supabase/migrations/*` | Oversight | Indexes added in `202610180001`; lock added in b66ea50. | SQL contract |
| F16 | P2 | Unexpected server failures were not logged. | `handler.ts` | Silent catch | Sanitized `console.error` (name and message only; no bodies or secrets). | log-no-secrets test |
| F17 | P2 | The theme cycle could repaint the page while someone types (contact form, Studio editor). | `preview/theme-cycle.ts` | Not considered | Focused fields defer the change. | lifecycle test |
| F18 | P2 | Docs prescribed `8080`, old `/preview/` URLs and an outdated noindex note. | `README.md`, `CLAUDE.md`, `MASTER.md`, `CLOUD-STUDIO-SETUP.md` | Drift | Updated; setup guide rewritten as an ordered procedure. | — |
| F19 | P3 | `?action=status` is public and lists missing setting names (reveals whether TOTP is configured). | `config.ts` | Design | Kept (names only, no values; useful for setup). Consider hiding after activation. | status no-values test |
| F20 | P3 | Deleted Studio records keep Cloudinary originals publicly reachable. | design decision | Owner choice | Documented under Privacy. Optional future "also delete original". | — |
| F21 | P3 | Phone residual: one unavoidable full restyle (~200–275 ms at 4× CPU) per automatic theme change. | CSS size | 409 KB stylesheet and root custom properties | Reduced from three restyles to one; constrained devices excluded. Further reduction needs CSS consolidation. | traces |
| F22 | P3 | Unused variables/params (TS6133) in `engineering-home-motion.ts`, `Pages.tsx`, `PageShell.tsx`, `PortfolioSections.tsx`, `StudioAdmin.tsx`; legacy root app and Rive/Framer deps (not shipped). | various | Leftovers | Not changed (cosmetic). | — |
| F23 | P3 | Project titles repeat across languages (proper nouns); German home title 75 chars; HK logo tap target 32 px wide; Skills status line truncates on small phones. | content/UI | — | Acceptable or pre-existing; noted. | — |

## 4. Reproduction evidence (selected)

- **F1:** before, `createStudioHandler({env:{ADMIN_SESSION_SECRET:…}})` accepted `{password:'8080'}`. Now `studioStatus({...,ADMIN_PASSWORD:'8080'}).admin === false`, and `8080` gets 401/503.
- **F6:** `curl -I https://hashemkayyali.com/en/projects/does-not-exist.php` returns 200 (production today).
- **F7:** production `getComputedStyle(document.querySelector('.app-atmosphere')).maskImage === 'none'`; local returns `linear-gradient(…)`. The build warning "Unexpected `}`" is reproduced on the baseline commit.
- **F8:** Chrome trace at the change showed three `Document::recalcStyle` of ~1,590 elements (130/131/73 ms); after the fix, none over 50 ms on desktop.

## 5. Fixes implemented (this phase, local)

Admin auth rewrite (`auth.ts`, `config.ts`, `handler.ts`, `errors.ts`, `database.ts`), migration `202610180001_studio_admin_security.sql` plus rollbacks, Cloudinary reject clean-up and delivery transforms, edge caching, TOTP field and "Sign out everywhere" (5 languages), `npm run studio:password`, Vercel routing, SEO metadata, noscript navigation, theme-transition performance and cycle safeguards, CSS brace, docs.

## 6. Tests and results

| Suite | Result |
| --- | --- |
| `npm run check`: TypeScript, unit/integration/security tests, content validation | **111/111 tests, 14/14 content checks** (75 tests before) |
| Studio API security (`tests/studio-api.test.mjs`) | 35 tests: config fail-closed, no default, strength, hashing, login, cookie flags, logout replay, sign-out-everywhere, tampered/foreign/expired cookies, password rotation, throttle and lock bypass, global ceiling, fail-closed store, TOTP (RFC vectors, replay, drift), origin, body size, all admin routes 401, injection, signing, forged receipts, verified upload, rejected-upload destroy, URL validation, RPC atomicity, secret-free errors and logs, caching |
| Migration contract (`supabase/tests/migration-contract.mjs`, PostgreSQL 17 via PGlite) | **73/73**: apply/re-apply, anon/authenticated denied on 8 tables and RPCs despite permissive default grants, constraints, FK restrict, move/reorder/replace semantics and failures, throttle/lock/global/window, TOTP replay, sessions, SECURITY INVOKER plus empty `search_path` on all 9 functions, RLS, both rollbacks |
| Theme cycle (`preview/theme-cycle.test.mjs`) | 9/9: 30 s steps and loop, stored choice, manual stop, reduced motion, constrained devices, background tab, no concurrent timers, scroll/typing/menu/dialog/transition deferral, cleanup |
| SEO and routing (`tests/seo-routing.test.mjs`) | 4/4: unique titles per language, 35–160 char descriptions, noindex policy, Vercel rules in sync with routes/projects, security and cache headers |
| Dependency audit | `npm audit`: 0 vulnerabilities |
| Build | Clean (CSS warning resolved); 200 shells, sitemap 95 URLs; `verify-exhibition-seo` 100 shells |
| SEO audit, local build (`scripts/audit-production-seo.mjs`) | 95/95 sitemap URLs: no problems |
| Browser regressions (built site, desktop and phone) | 20/20: clean project URLs, Back restores position, Forward, refresh on nested project, direct Arabic URL, x-default after hydration, single `og:locale`, theme-color, admin setup state/noindex, no errors |
| Theme cycle in browser | Sterling first, 31 s then 62 s steps, manual pick persists across reload, reduced motion never cycles, deferred while scrolling, Arabic phone, 1 view transition per change, manual pick mid-blend lands cleanly |
| Theme-change performance (real GPU) | Desktop: long tasks 204 ms → **none** (3 runs); worst frame 396 ms → 42–111 ms. Phone 4× CPU: long task 305–460 ms → 197–275 ms; frame 778 ms → 424–605 ms (residual F21) |
| 120-page layout probe (320/390 phones, 820×1180 and 1180×820 tablets, 1440/1920; EN/AR; dev server) | **120/120: 0 console errors, 0 horizontal overflow** |

Not run: physical phones, Safari, Firefox, real Supabase/Cloudinary/Vercel preview.

## 7. Security assessment

- **Authentication:** strong hash only, no default, fail-closed configuration, TOTP in production, constant-time comparisons, scrypt cost ~150 ms per attempt.
- **Sessions:** HMAC-sealed HttpOnly `SameSite=Strict` `Secure` cookie scoped to `/api/studio`; server-side revocation; 8 h absolute lifetime.
- **CSRF:** same-origin check on every non-GET (including sign-in); GET actions never mutate.
- **Brute force:** distributed throttle with global ceiling; IP privacy by keyed hash.
- **Authorization:** every admin action requires an active session (tested route by route).
- **Input:** strict allowlists for resources, fields, UUIDs, project IDs, URLs (HTTPS LinkedIn/Instagram only, no credentials) and sizes; React escaping; DB check constraints mirror the API.
- **Secrets:** server-only; never in responses, logs, the bundle or `VITE_` variables.
- **Headers:** HSTS, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy.
- **Residual risks:**
  - No CSP yet (inline locale script needs a hash; recommended next).
  - Vercel Firewall rate limiting (paid tiers) was evaluated but not used.
  - Owner lockout is possible by design (15 min).
  - Public media remains reachable after record deletion.
  - Single-owner model; no audit log.

## 8. Technical SEO and Search Console

Production today: canonical/hreflang/x-default, `og:locale` exactly once on all 95 pages, Sterling OG/X card, JSON-LD WebSite+Person on 5 homes, 308 redirects from `/preview/…`, sitemap/robots correct. Fixed locally: soft 404s (F6), crawlable links (F13), description lengths (F14), x-default after hydration (F12).

**Search Console (pending, needs your account):**
1. Use a Domain property `hashemkayyali.com`, verified by DNS TXT.
2. Sitemaps: submit `https://hashemkayyali.com/sitemap.xml` and remove any old `/preview/` sitemap.
3. After deploy, URL Inspection: run Test live URL on `/en/`, `/ar/` and one project, then Request indexing.
4. Inspecting `/preview/ar/` should show "Page with redirect", which is expected.
5. Pages report: "Not found (404)" → Validate fix. Watch for "Soft 404"; it should clear after F6 deploys.
6. Check "Duplicate, Google chose different canonical": expect none.

Google decides timing; nothing here proves indexing.

## 9. Supabase readiness

Tables, foreign keys (restrict on media in use, cascade on overrides), indexes, RLS on all 8 tables with no policies (deny-all for browser roles), explicit revokes from `anon`/`authenticated`, grants to `service_role` only, 9 functions `SECURITY INVOKER` with empty `search_path`, validated RPC inputs, advisory locks for ordering, published/draft isolation in server queries, rollbacks.

Conditions:
- Run both migrations in order on the real project, then run the verification queries in the setup guide.
- Use the `sb_secret_` key server-side only.
- Confirm Supabase's managed default privileges don't re-grant (the migration revokes explicitly).

## 10. Cloudinary readiness

Signed uploads with unique `portfolio/studio/<uuid>` IDs, `overwrite=false`, allowed formats per kind (no SVG), 30-minute sealed receipts, response-signature verification, authoritative metadata re-fetch, size/format/dimension limits with signed clean-up on rejection, idempotent registration (duplicate receipts return the existing record), constructed delivery URLs, `f_auto,q_auto` responsive derivatives, video posters at `so_0,w_1000`, provider failures surfaced without detail.

Conditions:
- Keep strict transformations off (or allowlist the widths used).
- Run the acceptance checklist, including oversized and SVG uploads.
- Decide whether deletion should also remove originals (F20).

## 11. Remaining risks and required approvals

1. **Your approval to push and deploy** this commit (including the visible smoke-fade restoration F7).
2. **After deploy:** confirm production routing (soft 404s gone, slashless 308s), run the SEO audit against production, and complete the Search Console steps.
3. **Before enabling admin in production:**
   - generate credentials and TOTP with `npm run studio:password -- --session --totp`;
   - create Supabase and run the migrations;
   - create Cloudinary;
   - pass the acceptance checklist locally, then on production.
4. **Optional next hardening:** Content-Security-Policy, Cloudinary account upload limits, hiding the status details after activation.

## 12. Deployment and rollback plan

- **Deploy:** push `main` to `live` and `origin`. Vercel builds automatically.
- **Verify:**
  - `node scripts/audit-production-seo.mjs` (expects 0 problems, including 404s and slashless 308s);
  - `curl -s https://hashemkayyali.com/api/studio?action=status` should show admin false with `ADMIN_PASSWORD_HASH` listed;
  - spot-check `/ar/`, a project and the Projects hero edge.
- **Rollback:** Vercel "Promote" the previous deployment (instant), or `git revert` the commit and push. The checkpoint tag `checkpoint/pre-audit-2026-10-18` marks the pre-audit state. No database state exists yet, so a code rollback carries no data risk.
