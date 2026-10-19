# Sitelinks eligibility — audit, changes and Search Console checklist

Google chooses Sitelinks itself. This work makes the five main pages (About, Projects, Experience, Skills, Contact) easy to discover and identify. It does not guarantee that Sitelinks will appear, or when.

## Production audit (19 Oct 2026, before these changes)

Checked by fetching HTML with a Googlebot user agent, without running JavaScript (`node scripts/audit-production-seo.mjs`).

| Area | Result |
| --- | --- |
| Status / redirects | All 95 sitemap URLs return 200. `/` → `/en/`, `www` → apex, `http` → `https`, slashless → slash and `/preview/…` → `/<locale>/…` are all single 308s. Unknown URLs return 404 with `noindex`. |
| Canonical | One self-canonical per page on `https://hashemkayyali.com/<locale>/<page>/`, matching `og:url`. |
| hreflang | en, ar, de, fr, es and x-default (→ en) on every page, reciprocal. |
| robots | `index,follow` on public pages. `noindex` on admin, 404 and the Creative Lab. robots.txt blocks `/creative/` and `/api/` and lists the sitemap. |
| Sitemap | 95 URLs: 5 locales × (home, 5 main pages, gallery, journal, 11 projects). All five main pages are listed in all five languages. |
| Structured data | `WebSite` and `Person` on each language home only. Kept unchanged. |
| **Gap 1** | **The server HTML had no `<h1>`.** The body was empty apart from `<noscript>`. |
| **Gap 2** | Plain links without JavaScript existed only inside `<noscript>`, which is a weak signal. |
| **Gap 3** | Titles were generic labels ("About \| Hashem Kayyali"), and descriptions often left out the name (for example, "Selected projects showcasing practical ideas…"). |
| **Gap 4** | The footer linked only to Contact. About, Experience and Contact pages had no links into related pages. |

## Changes (local, not deployed)

- `preview/page-metadata.ts`: `SEO_PAGES` gives each of the five pages a unique, descriptive title (≤60 characters) and description (≤160 characters) in all five languages. Every description is based on facts in `content/locales`.
- `preview/prerender.mjs`: each prerendered page now has real content inside `#root`: a header link list to the five pages, the page's `<h1>` (the same text the app renders), its description, related-page links, and links to every project, Gallery and Journal. React replaces this content when the app mounts. While the app loads normally the content is invisible. It only appears after 2.5 s (a slow load) or when JavaScript is off.
- Footer (`PageShell.tsx`): on every page, a "Site pages" nav linking to all five pages replaces the single Contact link. It uses the same type and colour, and Contact keeps its arrow.
- Contextual links: the About sign-off links to Experience and Skills. The Experience "Core strengths" block links to Skills and Projects, using the existing download-link style. Home already links to Projects, About, Experience and Contact, and Skills already links to Projects.
- `scripts/audit-production-seo.mjs`: now fails if a page's server HTML lacks exactly one `<h1>` or plain links to all five pages (outside `<noscript>`).

The visible H1s ("About", "Skills", …) were kept as designed. If you want more descriptive visible H1s, that is a copy and design decision for you; the descriptive wording now lives in the titles and descriptions.

## Test results (local production build)

- `npm run check`: typecheck, 121/121 tests and 14/14 content checks pass.
- `node scripts/audit-production-seo.mjs http://127.0.0.1:4176`: 95/95 URLs pass, with no problems. (Redirect and 404 checks only run against production.)
- Browser: the shell is replaced on mount and there is one H1 per page. The footer and contextual links work at EN 390px and AR 320px, with no horizontal overflow and 44px touch targets.
- Not yet verified: production, physical devices, and the full 1440/1920 and tablet visual pass. Screenshots were unavailable in this session.

## Google Search Console checklist (after deploy)

1. **Property:** use the Domain property `hashemkayyali.com`, verified by DNS, so www, http and https are all covered.
2. **Sitemap:** go to Sitemaps and submit (or resubmit) `https://hashemkayyali.com/sitemap.xml`. Expect Success with 95 discovered URLs.
3. **URL Inspection:** do this for each language home and the five main pages in English, and at least once in Arabic:
   - `/en/`, `/en/about/`, `/en/projects/`, `/en/experience/`, `/en/skills/`, `/en/contact/`, `/ar/` and `/ar/about/`.
   - Run **Test live URL**. Check that the page is indexable, that "User-declared canonical" and "Google-selected canonical" are the same URL, and that the rendered HTML (View tested page → HTML) has the page H1 and the header and footer links.
   - Click **Request indexing**. This has a daily quota, so prioritise `/en/` and the five English pages.
4. **Pages report (Indexing → Pages):** watch for the five pages × five languages moving into "Indexed". Investigate any "Duplicate, Google chose different canonical", "Crawled – currently not indexed" or "Alternate page with proper canonical" entries on main pages. That last one is expected only for non-main URLs.
5. **Performance → Search results:** filter by the query `Hashem Kayyali` (and `هاشم كيالي`), then use the Pages tab to see which main pages get impressions. Sitelinks do not have their own report. Look for the main pages getting impressions on brand queries, and check the live results page manually.
6. **Enhancements / Rich results:** test `/en/` in the Rich Results Test or Schema validator. Expect `WebSite` and `Person` with no errors; no rich result is promised.
7. **Links report:** after a few weeks, Internal links should show the five main pages near the top.
8. **Recheck monthly:** run `node scripts/audit-production-seo.mjs` against production after each deploy.

There is no setting to request Sitelinks. Google removed manual Sitelink demotion in 2016, so the only controls are site structure, clear titles, and `noindex` for pages that should never appear.
