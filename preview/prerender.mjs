import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
import {LOCALES,LOCALE_META} from '../i18n/config.ts';
import {projectAssets} from '../data/projectAssets.ts';
import {PAGES,previewUrl} from './routes.ts';
import {pageMetadata,OG_IMAGE} from './page-metadata.ts';
import {profile} from '../data/profile.ts';
import {loadEnv} from 'vite';

const root=path.resolve(import.meta.dirname,'..'),template=await readFile(path.join(root,'dist-light-preview/preview/index.html'),'utf8');
const siteUrl=process.env.VITE_SITE_URL||loadEnv('production',root,'VITE_').VITE_SITE_URL||'https://hashemkayyali.com';
const siteOrigin=new URL(siteUrl).origin;
const chunks=await readdir(path.join(root,'dist-light-preview/assets'));
const escape=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
let count=0;
for(const locale of LOCALES){const t=(await import(`../content/locales/${locale}.ts`)).default;
 const approvedRoutes=[...PAGES.map(page=>({locale,page})),...projectAssets.map(asset=>({locale,page:'projects',project:asset.id}))];
 const routes=[...approvedRoutes,...approvedRoutes.map(route=>({...route,experience:'creative'}))];
 for(const route of routes){const metadata=pageMetadata(route,t),url=previewUrl(route),directory=path.join(root,'dist-light-preview',url);
  const dictionary=chunks.find(name=>name.startsWith(locale+'-')&&name.endsWith('.js'));
  const caseScript=chunks.find(name=>name.startsWith('SignatureCaseStudy-')&&name.endsWith('.js'));
  const caseStyle=chunks.find(name=>name.startsWith('SignatureCaseStudy-')&&name.endsWith('.css'));
  const fonts=locale==='ar'?'':['instrument-sans-v2','geist-sans-v2'].map(file=>`<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/${file}.woff2">`).join('');
  const preload=`${fonts}<link rel="modulepreload" href="/assets/${dictionary}">${route.page==='home'?'<link rel="preload" as="image" fetchpriority="high" href="/images/hashem-profile.webp">':''}${route.project?`<link rel="modulepreload" href="/assets/${caseScript}"><link rel="stylesheet" href="/assets/${caseStyle}">`:''}`;
  const head=`${preload}<link rel="canonical" href="${siteOrigin}${url}"><meta property="og:url" content="${siteOrigin}${url}"><meta property="og:type" content="website"><meta property="og:locale" content="${LOCALE_META[locale].ogLocale}"><meta property="og:image" content="${siteOrigin}${OG_IMAGE}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Hashem Kayyali — R&amp;D Product Engineer and Software Engineer"><meta property="og:site_name" content="${escape(t.identity.name)}"><meta name="twitter:title" content="${escape(metadata.title)}"><meta name="twitter:description" content="${escape(metadata.description)}"><meta name="twitter:image" content="${siteOrigin}${OG_IMAGE}"><meta name="twitter:image:alt" content="${escape(t.identity.name)}"><meta name="twitter:card" content="summary_large_image"><meta property="og:title" content="${escape(metadata.title)}"><meta property="og:description" content="${escape(metadata.description)}"><meta property="og:locale" content="${LOCALE_META[locale].ogLocale}">${LOCALES.map(other=>`<link data-preview-alternate rel="alternate" hreflang="${other}" href="${siteOrigin}${previewUrl({...route,locale:other})}">`).join('')}<link data-preview-alternate rel="alternate" hreflang="x-default" href="${siteOrigin}${previewUrl({...route,locale:'en'})}">`;
  // Structured data on each language home: the site name and the person behind it (facts from the code only).
  const roles=t.identity.role.split('|').map(part=>part.trim()).filter(Boolean);
  const jsonLd=route.page==='home'&&!route.experience?`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':[
   {'@type':'WebSite','@id':`${siteOrigin}/#website`,url:`${siteOrigin}/`,name:'Hashem Kayyali',alternateName:['HK',t.identity.name].filter((name,i,all)=>all.indexOf(name)===i&&name!=='Hashem Kayyali'),inLanguage:LOCALES,publisher:{'@id':`${siteOrigin}/#person`}},
   {'@type':'Person','@id':`${siteOrigin}/#person`,name:'Hashem Kayyali',...(t.identity.name!=='Hashem Kayyali'?{alternateName:t.identity.name}:{}),url:`${siteOrigin}${url}`,image:`${siteOrigin}/images/hashem-profile.webp`,jobTitle:roles,sameAs:[profile.social.linkedin,profile.social.instagram]},
  ]}).replaceAll('<','\\u003c')}</script>`:'';
  const html=template.replace(/<script>\s*\/\/ Set the locale[\s\S]*?<\/script>/,'').replace('lang="en" dir="ltr"',`lang="${locale}" dir="${LOCALE_META[locale].dir}"`).replace(/(<meta name="robots" content=")[^"]*(")/,`$1${metadata.robots}$2`).replace(/<title>.*?<\/title>/,`<title>${escape(metadata.title)}</title>`).replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/,`$1${escape(metadata.description)}$2`).replace('</head>',head+jsonLd+'</head>').replace('<body>',`<body><noscript><p>${escape(metadata.title)}</p><p>${escape(metadata.description)}</p><p>Please enable JavaScript to view this portfolio.</p></noscript>`);
  await mkdir(directory,{recursive:true});await writeFile(path.join(directory,'index.html'),html);count++;
 }
}
// Search engines get the approved routes only; the Creative Lab review and admin stay unlisted.
// Vercel serves /404.html (status 404) for unknown URLs; it renders the app's own not-found view.
{const t=(await import('../content/locales/en.ts')).default,route={locale:'en',page:'not-found'},metadata=pageMetadata(route,t);
 const html=template.replace(/<script>\s*\/\/ Set the locale[\s\S]*?<\/script>/,'').replace(/(<meta name="robots" content=")[^"]*(")/,'$1noindex,follow$2').replace(/<title>.*?<\/title>/,`<title>${escape(metadata.title)}</title>`);
 await writeFile(path.join(root,'dist-light-preview/404.html'),html);}
const listed=LOCALES.flatMap(locale=>[...PAGES.filter(page=>!['admin','not-found'].includes(page)).map(page=>({locale,page})),...projectAssets.map(asset=>({locale,page:'projects',project:asset.id}))]);
const urls=listed.map(route=>`  <url><loc>${siteOrigin}${previewUrl(route)}</loc></url>`);
await writeFile(path.join(root,'dist-light-preview/sitemap.xml'),['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...urls,'</urlset>',''].join('\n'));
await writeFile(path.join(root,'dist-light-preview/robots.txt'),['User-agent: *','Allow: /','Disallow: /creative/','Disallow: /api/','',`Sitemap: ${siteOrigin}/sitemap.xml`,''].join('\n'));
console.log(`Generated ${count} localized V2 route shells, sitemap.xml (${listed.length} URLs) and robots.txt for ${siteOrigin}.`);
