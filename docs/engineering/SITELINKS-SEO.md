# Sitelinks audit and Search Console checklist

Google automatically decides whether to show sitelinks and which destinations to include. Clear titles, headings and internal links help Google understand the site hierarchy. [Google Search Central's sitelinks guidance](https://developers.google.com/search/docs/appearance/sitelinks)

## 11 November 2026 audit

The active site is a React 19 and Vite app with build-time HTML in `dist-light-preview`. Home is `/<locale>/`. About, Projects, Experience, Skills and Contact are dedicated `/<locale>/<page>/` routes. Header items use ordinary anchor `href`s and React handles same-tab navigation. Fragments such as `#vision-work` and `#gallery-directory` are in-page shortcuts. The existing biography, case collection, work history, skills evidence and contact options serve distinct purposes, so the six routes cover the main navigation without additional landing pages.

| Signal | Live observation before the local changes |
| --- | --- |
| Titles and headings | All 95 sitemap pages returned HTTP 200 with a distinct title within their locale and a server H1. The German Home title was the only title flagged by the audit for length. |
| Canonical and languages | All sitemap pages were self-canonical and provided reciprocal equivalents in English, Arabic, German, French and Spanish, with `x-default` pointing to the equivalent English page. |
| Sitemap and robots | 30 main pages, 55 case pages and 10 Journal/Gallery pages. Public pages allowed indexing. Admin and Creative Lab carried `noindex`, unknown routes returned 404, and robots.txt allowed crawling `/preview/` redirects while blocking `/creative/` and `/api/`. |
| Redirects | HTTP and `www` redirected to the HTTPS apex on the tested URL. `/` and `/preview/` redirected to `/en/`. Slashless nested preview paths took two redirects. `/preview/index.html` returned an indexable template with no canonical. Direct localized `index.html` URLs returned duplicate HTML with a canonical pointing to the directory URL. |
| Internal links | The header had all six destinations. The rendered footer lacked Home and the homepage lacked a contextual Skills link. The fallback HTML linked all 11 case studies from every page footer and omitted the main destination links from that footer. |
| Indexing | Public search surfaced older home content. It does not establish per-URL Google indexing or Google's selected canonicals. The live public Studio feed reported zero published posts and zero gallery items, which limits the content available for indexing on those pages. |

### Local changes for review

- Add a localized Skills link to the Home engineering section and include Home in the shared footer. The prerendered header and footer link the six main pages. Home presents the three featured cases and the Projects directory links all 11 case studies in each locale. Each case fallback includes its existing public overview. Gallery and Journal remain discoverable through Studio and the HTML fallback.
- Keep the configured canonical origin through React navigation and locale changes. Shorten the German Home search title using its approved roles. Keep all 95 URLs eligible for indexing.
- Send `/preview/index.html`, localized `index.html` aliases and slashless `/preview/` links directly to the corresponding canonical directory URL with permanent redirects. Local Vite preview exercises the same public alias patterns.
- Point `npm run validate:seo` at the V2 build. The audit checks the expected sitemap inventory, exact alternate destinations and return links, canonical and indexability signals, server headings and the main and secondary crawl paths. It also checks redirect responses when run against an HTTP origin.

### Verification

- `npm run check` passed TypeScript, 146 tests and 14 content checks. `npm run build` produced 200 route shells and a 95-URL sitemap. `npm run validate:seo` and `node scripts/audit-production-seo.mjs http://127.0.0.1:4176` checked all 95 public routes.
- Vercel's routing compiler resolved 479 aliases directly and left all 95 canonical paths intact. The running Vite preview returned 470 direct 308s, including query-string cases. Its existing media guard returned 404 on 10 literal Umniah case `index.html` aliases. The canonical case routes returned 200.
- Chromium verified 45 rendered URLs across the five locales, keyboard navigation, locale switching and browser Back. The changed links fit at 1920, 1440, 390 and 320 px in English and Arabic and at 390 px in German, French and Spanish. Home → Projects → Eventies also worked with JavaScript disabled in English and Arabic. The evidence is in `archive/seo-qa-2026-11-11/`.

The changes are local and await review before deployment. The updated redirect rules still need a live Vercel check after release.

### Google Search Console validation

1. Open the DNS-verified Domain property for `hashemkayyali.com`. Record the indexed status and Google-selected canonical for the six English URLs before release, if available.
2. After an approved release, run `node scripts/audit-production-seo.mjs` against the live domain. Submit `https://hashemkayyali.com/sitemap.xml` under **Sitemaps** and check that Google reads the 95 intended URLs.
3. Inspect `/en/`, `/en/about/`, `/en/projects/`, `/en/experience/`, `/en/skills/` and `/en/contact/`. Use **Test live URL** and check the tested HTML for the heading, links, canonical and locale alternates. Use the indexed inspection result to compare the user-declared and Google-selected canonicals. Request indexing for the main English URLs once the live tests pass. Repeat inspection for representative URLs in all five locales and sample a project, Journal and Gallery. [Google's URL Inspection guide](https://support.google.com/webmasters/answer/9012289)
4. Use **Page indexing** to investigate duplicate, crawled-but-unindexed or soft-404 classifications on canonical destinations. Use **Performance → Search results** with branded query filters such as `Hashem Kayyali` and `هاشم كيالي` to compare destination impressions after recrawling. Observe sitelinks separately on live branded results.

## Historical audit from 19 October 2026

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
