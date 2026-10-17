import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
import {LOCALES,LOCALE_META} from '../i18n/config.ts';
import {projectAssets} from '../data/projectAssets.ts';
import {PAGES,previewUrl} from './routes.ts';
import {pageMetadata} from './page-metadata.ts';
import {loadEnv} from 'vite';

const root=path.resolve(import.meta.dirname,'..'),template=await readFile(path.join(root,'dist-light-preview/preview/index.html'),'utf8');
const siteUrl=process.env.VITE_SITE_URL||loadEnv('production',root,'VITE_').VITE_SITE_URL||'http://127.0.0.1:4176';
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
  const head=`${preload}<link rel="canonical" href="${siteOrigin}${url}"><meta property="og:title" content="${escape(metadata.title)}"><meta property="og:description" content="${escape(metadata.description)}"><meta property="og:locale" content="${LOCALE_META[locale].ogLocale}">${LOCALES.map(other=>`<link data-preview-alternate rel="alternate" hreflang="${other}" href="${siteOrigin}${previewUrl({...route,locale:other})}">`).join('')}`;
  const html=template.replace(/<script>\s*\/\/ Set the locale[\s\S]*?<\/script>/,'').replace('lang="en" dir="ltr"',`lang="${locale}" dir="${LOCALE_META[locale].dir}"`).replace(/<title>.*?<\/title>/,`<title>${escape(metadata.title)}</title>`).replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/,`$1${escape(metadata.description)}$2`).replace('</head>',head+'</head>').replace('<body>',`<body><noscript><p>${escape(metadata.title)}</p><p>${escape(metadata.description)}</p><p>JavaScript is required for this interactive local preview.</p></noscript>`);
  await mkdir(directory,{recursive:true});await writeFile(path.join(directory,'index.html'),html);count++;
 }
}
console.log(`Generated ${count} localized V2 route shells with page-specific metadata. Review remains noindex; production SEO sources are unchanged.`);
