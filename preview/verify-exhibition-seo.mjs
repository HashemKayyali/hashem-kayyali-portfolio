import {readFile,readdir} from 'node:fs/promises';import {LOCALES,LOCALE_META} from '../i18n/config.ts';import {projectAssets} from '../data/projectAssets.ts';import {PAGES,previewUrl} from './routes.ts';import {pageMetadata} from './page-metadata.ts';
const origin=new URL(process.env.VITE_SITE_URL||'https://hashemkayyali.com').origin;
let checked=0;for(const locale of LOCALES){const t=(await import('../content/locales/'+locale+'.ts')).default;for(const route of [...PAGES.map(page=>({locale,page})),...projectAssets.map(a=>({locale,page:'projects',project:a.id}))]){
 const url=previewUrl(route),html=await readFile('dist-light-preview'+url+'index.html','utf8'),meta=pageMetadata(route,t);
 if(!html.includes('lang="'+locale+'" dir="'+LOCALE_META[locale].dir+'"')||!html.includes('<title>'+meta.title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')+'</title>')||!html.includes('name="robots" content="'+meta.robots+'"')||!html.includes('rel="canonical" href="'+origin+url+'"'))throw Error('Head mismatch '+url);
 for(const other of LOCALES)if(!html.includes('hreflang="'+other+'" href="'+origin+previewUrl({...route,locale:other})+'"'))throw Error('Alternate missing '+url);
 const files=[...html.matchAll(/(?:href|src)="(\/assets\/[^"#]+|\/fonts\/[^"#]+)"/g)].map(m=>m[1]);for(const path of files)await readFile('dist-light-preview'+path);
 if(locale==='ar'&&html.includes('as="font"'))throw Error('Arabic V2 font preload');checked++;
 }}const sitemap=await readFile('dist-light-preview/sitemap.xml','utf8'),robots=await readFile('dist-light-preview/robots.txt','utf8');
if(sitemap.includes('/admin/')||sitemap.includes('/creative/')||!sitemap.includes(origin+'/preview/en/')||!robots.includes('Sitemap: '+origin+'/sitemap.xml'))throw Error('Sitemap/robots mismatch');
console.log('PASS active V2 SEO route shells, localized metadata, canonical/hreflang, robots, asset/font references:',checked);
