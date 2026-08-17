/**
 * SEO validation against the built output.
 *
 *   npm run build && node scripts/validate-seo.mjs
 *
 * Reads `dist/` rather than the source, because what ships is the only thing a
 * crawler sees. Checks the head every locale page actually emitted, the
 * reciprocity of the hreflang graph, and that no development host leaked into
 * a public URL.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LOCALES } from '../content/types.ts';
import { canonicalUrl, LOCALE_META, pathForLocale, SITE_URL } from '../i18n/config.ts';
import { dictionaries } from '../content/index.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');

const results = [];
const pass = (name, detail = '') => results.push({ ok: true, name, detail });
const fail = (name, detail) => results.push({ ok: false, name, detail });

if (!existsSync(DIST)) {
  console.error('dist/ not found — run npm run build first');
  process.exit(1);
}

/** The built HTML for a locale, plus a few parsed pieces of its head. */
const pages = new Map();
for (const locale of LOCALES) {
  const path = pathForLocale(locale);
  const file = path === '/' ? resolve(DIST, 'index.html') : resolve(DIST, path.slice(1, -1), 'index.html');
  if (!existsSync(file)) {
    fail('every locale emits a page', `missing ${file}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  pages.set(locale, {
    html,
    title: html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '',
    description: html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '',
    canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '',
    lang: html.match(/<html lang="([^"]*)"/)?.[1] ?? '',
    dir: html.match(/<html[^>]*dir="([^"]*)"/)?.[1] ?? '',
    alternates: [...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)]
      .map((m) => ({ hreflang: m[1], href: m[2] })),
    ogImage: html.match(/<meta property="og:image" content="([^"]*)"/)?.[1] ?? '',
    ogTitle: html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? '',
    ogUrl: html.match(/<meta property="og:url" content="([^"]*)"/)?.[1] ?? '',
    twitterCard: html.match(/<meta name="twitter:card" content="([^"]*)"/)?.[1] ?? '',
    jsonLd: html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '',
  });
}

if (pages.size === LOCALES.length) pass('every locale emits a page', `${pages.size} pages`);

/* -- Head essentials -------------------------------------------------------- */
{
  const problems = [];
  for (const [locale, page] of pages) {
    if (!page.title) problems.push(`${locale}: no title`);
    if (!page.description) problems.push(`${locale}: no description`);
    if (page.canonical !== canonicalUrl(locale)) {
      problems.push(`${locale}: canonical ${page.canonical || 'missing'} != ${canonicalUrl(locale)}`);
    }
    if (page.lang !== LOCALE_META[locale].htmlLang) problems.push(`${locale}: html lang ${page.lang}`);
    const expectedDir = locale === 'ar' ? 'rtl' : 'ltr';
    if (page.dir !== expectedDir) problems.push(`${locale}: dir ${page.dir} != ${expectedDir}`);
    if (!page.ogImage) problems.push(`${locale}: no og:image`);
    if (page.twitterCard !== 'summary_large_image') problems.push(`${locale}: twitter:card ${page.twitterCard}`);
    if (page.ogUrl !== canonicalUrl(locale)) problems.push(`${locale}: og:url mismatch`);
  }
  if (problems.length === 0) pass('title, description, canonical, lang, dir, OG and Twitter present');
  else fail('title, description, canonical, lang, dir, OG and Twitter present', problems.slice(0, 6).join(' | '));
}

/* -- Titles and descriptions are per-language ------------------------------- */
{
  const titles = [...pages.values()].map((p) => p.title);
  const descriptions = [...pages.values()].map((p) => p.description);
  const duplicateTitles = titles.length !== new Set(titles).size;
  const duplicateDescriptions = descriptions.length !== new Set(descriptions).size;

  if (!duplicateTitles && !duplicateDescriptions) {
    pass('each locale has its own title and description');
  } else {
    fail(
      'each locale has its own title and description',
      `${duplicateTitles ? 'duplicate titles ' : ''}${duplicateDescriptions ? 'duplicate descriptions' : ''}`,
    );
  }
}

/* -- hreflang: complete, reciprocal, self-referencing, with x-default -------- */
{
  const problems = [];
  for (const [locale, page] of pages) {
    const map = new Map(page.alternates.map((a) => [a.hreflang, a.href]));

    for (const other of LOCALES) {
      const expected = canonicalUrl(other);
      if (map.get(LOCALE_META[other].htmlLang) !== expected) {
        problems.push(`${locale}: alternate ${other} -> ${map.get(other) ?? 'missing'}`);
      }
    }
    if (map.get('x-default') !== `${SITE_URL}/`) problems.push(`${locale}: x-default missing or wrong`);
    // Self-reference: a page must list itself among its alternates.
    if (map.get(LOCALE_META[locale].htmlLang) !== canonicalUrl(locale)) {
      problems.push(`${locale}: no self-referencing alternate`);
    }
  }
  if (problems.length === 0) {
    pass('hreflang is complete, reciprocal and self-referencing', `${LOCALES.length} locales + x-default`);
  } else {
    fail('hreflang is complete, reciprocal and self-referencing', problems.slice(0, 6).join(' | '));
  }
}

/* -- Structured data parses and names the entity ---------------------------- */
{
  const problems = [];
  for (const [locale, page] of pages) {
    if (!page.jsonLd) { problems.push(`${locale}: no JSON-LD`); continue; }
    try {
      const data = JSON.parse(page.jsonLd);
      const types = (data['@graph'] ?? []).map((node) => node['@type']);
      for (const required of ['Person', 'WebSite', 'ProfilePage']) {
        if (!types.includes(required)) problems.push(`${locale}: missing ${required}`);
      }
      const person = (data['@graph'] ?? []).find((node) => node['@type'] === 'Person');
      if (person?.name !== 'Hashem Kayyali') problems.push(`${locale}: Person.name`);
      if (person?.alternateName !== 'هاشم كيالي') problems.push(`${locale}: Person.alternateName`);
      const site = (data['@graph'] ?? []).find((node) => node['@type'] === 'WebSite');
      if (site?.name !== 'Hashem Kayyali') problems.push(`${locale}: WebSite.name should be the person`);
    } catch (error) {
      problems.push(`${locale}: JSON-LD does not parse (${error.message.slice(0, 40)})`);
    }
  }
  if (problems.length === 0) pass('structured data parses: Person, WebSite, ProfilePage');
  else fail('structured data parses: Person, WebSite, ProfilePage', problems.slice(0, 6).join(' | '));
}

/* -- Body content is in the HTML, not only after hydration ------------------ */
{
  const problems = [];
  for (const [locale, page] of pages) {
    const body = page.html.split('<div id="root">')[1] ?? '';
    const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length < 3000) problems.push(`${locale}: only ${text.length} chars of prerendered text`);
    // The projects have to be in the served markup, not injected on click.
    const cards = (body.match(/project-card__title/g) ?? []).length;
    if (cards !== 10) problems.push(`${locale}: ${cards} project cards in HTML`);
    const h1 = (page.html.match(/<h1\b/g) ?? []).length;
    if (h1 !== 1) problems.push(`${locale}: ${h1} h1 elements`);
  }
  if (problems.length === 0) {
    pass('prerendered HTML carries the localized content', 'all 10 projects, single h1');
  } else {
    fail('prerendered HTML carries the localized content', problems.slice(0, 6).join(' | '));
  }
}

/* -- robots.txt and sitemap.xml --------------------------------------------- */
{
  const problems = [];
  const robotsPath = resolve(DIST, 'robots.txt');
  const sitemapPath = resolve(DIST, 'sitemap.xml');

  if (!existsSync(robotsPath)) problems.push('robots.txt missing');
  else {
    const robots = readFileSync(robotsPath, 'utf8');
    if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) problems.push('robots.txt has no sitemap line');
    if (/Disallow:\s*\/\s*$/m.test(robots)) problems.push('robots.txt disallows the whole site');
  }

  if (!existsSync(sitemapPath)) problems.push('sitemap.xml missing');
  else {
    const sitemap = readFileSync(sitemapPath, 'utf8');
    for (const locale of LOCALES) {
      if (!sitemap.includes(`<loc>${canonicalUrl(locale)}</loc>`)) problems.push(`sitemap missing ${locale}`);
    }
    const locCount = (sitemap.match(/<loc>/g) ?? []).length;
    if (locCount !== LOCALES.length) problems.push(`sitemap has ${locCount} urls, expected ${LOCALES.length}`);
  }

  if (problems.length === 0) pass('robots.txt and sitemap.xml', `${LOCALES.length} sitemap urls`);
  else fail('robots.txt and sitemap.xml', problems.join(' | '));
}

/* -- Icons and social image exist ------------------------------------------- */
{
  const required = ['favicon.ico', 'favicon-32.png', 'icon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og-image.png', 'site.webmanifest'];
  const missing = required.filter((file) => !existsSync(resolve(DIST, file)));
  if (missing.length === 0) pass('icons, manifest and social image shipped', `${required.length} files`);
  else fail('icons, manifest and social image shipped', `missing: ${missing.join(', ')}`);
}

/* -- No development host in any public URL ---------------------------------- */
{
  const offenders = [];
  for (const [locale, page] of pages) {
    const head = page.html.split('</head>')[0];
    for (const pattern of ['localhost', '127.0.0.1', ':4173', ':4190', 'file://']) {
      if (head.includes(pattern)) offenders.push(`${locale}: ${pattern}`);
    }
  }
  for (const file of ['sitemap.xml', 'robots.txt', 'site.webmanifest']) {
    const full = resolve(DIST, file);
    if (!existsSync(full)) continue;
    const text = readFileSync(full, 'utf8');
    for (const pattern of ['localhost', '127.0.0.1']) {
      if (text.includes(pattern)) offenders.push(`${file}: ${pattern}`);
    }
  }
  if (offenders.length === 0) pass('no development host in any public URL');
  else fail('no development host in any public URL', offenders.join(' | '));
}

/* -- The head matches the dictionary it claims to render -------------------- */
{
  const problems = [];
  for (const [locale, page] of pages) {
    const dictionary = dictionaries[locale];
    const decode = (value) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    if (decode(page.title) !== dictionary.seo.title) problems.push(`${locale}: title != dictionary`);
    if (decode(page.description) !== dictionary.seo.description) problems.push(`${locale}: description != dictionary`);
  }
  if (problems.length === 0) pass('head strings come from the locale dictionaries');
  else fail('head strings come from the locale dictionaries', problems.join(' | '));
}

/* -- Report ----------------------------------------------------------------- */
const failures = results.filter((r) => !r.ok);
for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}${result.detail ? `  — ${result.detail}` : ''}`);
}
console.log(`\n${results.length - failures.length}/${results.length} SEO checks passed`);
if (failures.length > 0) process.exit(1);
