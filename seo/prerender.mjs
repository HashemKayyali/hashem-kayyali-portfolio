/**
 * Writes one static HTML file per locale into `dist/`.
 *
 *   node seo/prerender.mjs
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle). Each
 * page gets the real rendered page body plus a head built for that exact URL,
 * so a crawler — and every social preview fetcher, none of which run
 * JavaScript — receives the finished document rather than an empty root.
 *
 * Also emits robots.txt, sitemap.xml and the web manifest, all from the same
 * locale list, so the three can never disagree about which URLs exist.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { dictionaries } from '../content/index.ts';
import { profile } from '../data/profile.ts';
import { pathForLocale } from '../i18n/config.ts';
import { buildHead, canonicalUrl, LOCALES, SITE_URL } from './head.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');

const { render } = await import(pathToFileURL(resolve(ROOT, 'dist-ssr/entry-server.js')).href);

/* The client build's index.html is the template: it already carries the hashed
   script and stylesheet tags Vite generated, which must be preserved exactly. */
const template = readFileSync(resolve(DIST, 'index.html'), 'utf8');

/*
 * The asset tags are lifted from the built template rather than written out
 * here. Vite content-hashes the stylesheet and the entry script, so hardcoding
 * their paths ships pages that reference files which do not exist — the design
 * system silently 404s and every page renders unstyled.
 */
const assetTags = (pattern) => [...template.matchAll(pattern)].map((match) => match[0]);

const scriptTags = assetTags(/<script\b[^>]*><\/script>|<script\b[^>]*\/>/g).join('\n    ');
const styleTags = assetTags(/<link\b[^>]*rel="stylesheet"[^>]*>/g).join('\n    ');
const preconnectTags = assetTags(/<link\b[^>]*rel="preconnect"[^>]*>/g).join('\n    ');

if (!scriptTags) throw new Error('prerender: no script tag found in the built index.html');
if (!styleTags) throw new Error('prerender: no stylesheet link found in the built index.html');

/* Guards against the same class of mistake returning: every local stylesheet
   the pages reference has to exist as a real file in the build output. */
for (const href of [...styleTags.matchAll(/href="(\/[^"]+)"/g)].map((m) => m[1])) {
  if (!existsSync(resolve(DIST, href.slice(1)))) {
    throw new Error(`prerender: stylesheet ${href} is not present in dist/`);
  }
}

const written = [];

for (const locale of LOCALES) {
  const dictionary = dictionaries[locale];
  const body = render(locale);
  const head = buildHead(locale, dictionary, profile);
  const meta = dictionary;

  const html = `<!DOCTYPE html>
<html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}" class="scroll-smooth">
  <head>
${head}

    ${preconnectTags}
    ${styleTags}
  </head>
  <body>
    <div id="root">${body}</div>
    ${scriptTags}
  </body>
</html>
`;

  const path = pathForLocale(locale);
  const outDir = path === '/' ? DIST : resolve(DIST, path.slice(1, -1));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), html, 'utf8');

  written.push({ locale, url: canonicalUrl(locale), bytes: html.length, text: body.length });
  void meta;
}

/* ---- robots.txt ---------------------------------------------------------- */
writeFileSync(
  resolve(DIST, 'robots.txt'),
  `# https://hashemkayyali.com
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`,
  'utf8',
);

/* ---- sitemap.xml ---------------------------------------------------------
   Every entry carries the full reciprocal alternate set, so the language
   relationships are declared in the sitemap as well as in each page's head. */
const today = new Date().toISOString().slice(0, 10);

const urlEntries = LOCALES.map((locale) => {
  const alternates = LOCALES.map(
    (other) =>
      `      <xhtml:link rel="alternate" hreflang="${other}" href="${canonicalUrl(other)}" />`,
  )
    .concat(`      <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />`)
    .join('\n');

  return `  <url>
    <loc>${canonicalUrl(locale)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${locale === 'en' ? '1.0' : '0.9'}</priority>
${alternates}
  </url>`;
}).join('\n');

writeFileSync(
  resolve(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>
`,
  'utf8',
);

/* ---- web manifest -------------------------------------------------------- */
writeFileSync(
  resolve(DIST, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'Hashem Kayyali',
      short_name: 'Hashem Kayyali',
      description: dictionaries.en.seo.description,
      start_url: '/',
      display: 'standalone',
      background_color: '#4d0d1c',
      theme_color: '#4d0d1c',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

console.log('prerendered:');
for (const page of written) {
  console.log(`  ${page.url.padEnd(34)} ${String(page.bytes).padStart(7)} bytes  (body ${page.text})`);
}
console.log(`  robots.txt, sitemap.xml (${LOCALES.length} urls), site.webmanifest`);
