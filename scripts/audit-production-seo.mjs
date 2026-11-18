// Read-only audit of the server-delivered HTML (no JavaScript executed), as a crawler first sees it.
// Usage: node scripts/audit-production-seo.mjs [--build | origin]
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {loadEnv} from 'vite';
import {LOCALES,LOCALE_META,SITE_URL} from '../i18n/config.ts';
import {featuredIds,projectAssets} from '../data/projectAssets.ts';
import {CORE_PAGES,PAGES,previewUrl} from '../preview/routes.ts';

const target=process.argv[2];
const built=target==='--build';
const root=resolve(import.meta.dirname,'..');
const dist=resolve(root,'dist-light-preview');
const origin=built?SITE_URL:new URL(target||SITE_URL).origin;
const local=['127.0.0.1','localhost'].includes(new URL(origin).hostname);
const buildOrigin=()=>new URL(process.env.VITE_SITE_URL||loadEnv('production',root,'VITE_').VITE_SITE_URL||SITE_URL).origin;
const canonicalOrigin=built||local?buildOrigin():origin;
const problems=[],notes=[];const titles=new Map(),descriptions=new Map();
const get=async path=>{
 if(!built)return fetch(origin+path,{redirect:'manual'});
 try{return new Response(await readFile(resolve(dist,`.${path}${path.endsWith('/')?'index.html':''}`)));}
 catch(error){if(error.code!=='ENOENT')throw error;return new Response(null,{status:404});}
};
const attr=(html,re)=>[...html.matchAll(re)].map(m=>m[1]);
const sitemapResponse=await get('/sitemap.xml');
const sitemap=await sitemapResponse.text();
const urls=attr(sitemap,/<loc>([^<]+)<\/loc>/g);
const routes=LOCALES.flatMap(locale=>[
 ...PAGES.filter(page=>page!=='admin').map(page=>({locale,page})),
 ...projectAssets.map(asset=>({locale,page:'projects',project:asset.id})),
]);
const expectedUrls=new Set(routes.map(route=>canonicalOrigin+previewUrl(route)));
if(sitemapResponse.status!==200)problems.push(`sitemap.xml: HTTP ${sitemapResponse.status}. Run npm run build for a local audit.`);
for(const url of expectedUrls)if(!urls.includes(url))problems.push(`missing sitemap URL: ${url}`);
for(const url of urls)if(!expectedUrls.has(url))problems.push(`unexpected sitemap URL: ${url}`);
if(new Set(urls).size!==urls.length)problems.push('duplicate sitemap URLs');
let checked=0;
await Promise.all(routes.map(async route=>{
 const {locale}=route,path=previewUrl(route),res=await get(path),html=await res.text();checked++;
 const fail=message=>problems.push(path+': '+message);
 if(res.status!==200)return fail('status '+res.status);
 const expected=canonicalOrigin+path;
 const canonical=attr(html,/<link rel="canonical" href="([^"]+)"/g);if(canonical.length!==1||canonical[0]!==expected)fail('canonical '+JSON.stringify(canonical));
 const ogLocale=attr(html,/<meta property="og:locale" content="([^"]+)"/g);if(ogLocale.length!==1||ogLocale[0]!==LOCALE_META[locale].ogLocale)fail('og:locale '+JSON.stringify(ogLocale));
 const ogUrl=attr(html,/<meta property="og:url" content="([^"]+)"/g);if(ogUrl.length!==1||ogUrl[0]!==expected)fail('og:url '+JSON.stringify(ogUrl));
 const alternates=[...html.matchAll(/<link\b[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"/g)];
 for(const language of [...LOCALES,'x-default']){
  const matches=alternates.filter(([,code])=>code===language);
  const alternateUrl=canonicalOrigin+previewUrl({...route,locale:language==='x-default'?'en':language});
  if(matches.length!==1||matches[0][2]!==alternateUrl)fail(`hreflang ${language} must point once to ${alternateUrl}`);
 }
 if(alternates.length!==LOCALES.length+1)fail('unexpected hreflang entries');
 const robots=attr(html,/<meta name="robots" content="([^"]+)"/g);if(robots.length!==1||robots[0]!=='index,follow,max-image-preview:large')fail('robots '+JSON.stringify(robots));
 if(/\b(?:noindex|none)\b/i.test(res.headers.get('x-robots-tag')??''))fail('X-Robots-Tag prevents indexing');
 const lang=html.match(/<html lang="([^"]+)" dir="([^"]+)"/);if(!lang||lang[1]!==locale||lang[2]!==(locale==='ar'?'rtl':'ltr'))fail('html lang/dir '+(lang?.slice(1).join('/')));
 const title=attr(html,/<title>([^<]*)<\/title>/g);if(title.length!==1||!title[0].trim())fail('title');else{titles.set(locale+'|'+title[0],[...(titles.get(locale+'|'+title[0])??[]),path]);if(title[0].length>70)notes.push(path+': title '+title[0].length+' chars');}
 const description=attr(html,/<meta name="description" content="([^"]*)"/g);if(description.length!==1||description[0].length<(locale==='ar'?35:50))fail('description '+JSON.stringify(description[0]??''));else{descriptions.set(description[0],[...(descriptions.get(description[0])??[]),path]);if(description[0].length>170)notes.push(path+': description '+description[0].length+' chars');}
 for(const name of ['og:image','twitter:image'])if((html.match(new RegExp(`(property|name)="${name}" content="${canonicalOrigin}/og-image-sterling.png"`,'g'))||[]).length!==1)fail(name+' not the Sterling card');
 if((html.match(/name="twitter:card" content="summary_large_image"/g)||[]).length!==1)fail('twitter:card');
 for(const tag of ['og:title','og:description','og:type','og:site_name','twitter:title','twitter:description'])if((html.match(new RegExp(`(property|name)="${tag}"`,'g'))||[]).length!==1)fail(tag+' count');
 const ld=attr(html,/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);const home=route.page==='home';
 if(home!==(ld.length===1))fail('JSON-LD presence');
 if(ld[0]){const data=JSON.parse(ld[0]);const types=data['@graph'].map(node=>node['@type']).sort().join();if(types!=='Person,WebPage,WebSite')fail('JSON-LD types '+types);const page=data['@graph'].find(node=>node['@type']==='WebPage');if(!/hashem-profile.webp$/.test(page?.primaryImageOfPage?.url??''))fail('WebPage.primaryImageOfPage');}
 // Check the links a crawler can use before JavaScript renders the full app.
 const raw=html.replace(/<noscript>[\s\S]*?<\/noscript>/g,'');
 const headings=attr(raw,/<h1\b[^>]*>([^<]*)<\/h1>/g);
 if(headings.length!==1||!headings[0].trim())fail('server HTML needs one nonempty <h1>');
 const links=markup=>new Set(attr(markup??'',/<a\b[^>]*\shref="([^"]+)"/g));
 for(const landmark of ['header','footer']){
  const paths=links(raw.match(new RegExp(`<${landmark}\\b[^>]*>([\\s\\S]*?)</${landmark}>`))?.[1]);
  for(const page of CORE_PAGES){const href=previewUrl({locale,page});if(!paths.has(href))fail(`no ${landmark} link to ${href}`);}
 }
 const paths=links(raw);
 for(const page of ['gallery','journal'])if(!paths.has(previewUrl({locale,page})))fail(`no link to ${page}`);
 const mainPaths=links(raw.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]);
 const projects=home?featuredIds:route.page==='projects'&&!route.project?projectAssets.map(({id})=>id):[];
 for(const project of projects)if(!mainPaths.has(previewUrl({locale,page:'projects',project})))fail(`no main content link to ${project}`);
 if(home&&!mainPaths.has(previewUrl({locale,page:'skills'})))fail('no contextual Home link to Skills');
}));
for(const [value,paths] of titles)if(paths.length>1)problems.push('duplicate title within one language "'+value+'" on '+paths.join(', '));
for(const [value,paths] of descriptions)if(paths.length>1)notes.push('shared description on '+paths.length+' pages: '+paths.slice(0,3).join(', ')+(paths.length>3?'…':''));
// Redirects, 404s, robots, assets
const expect=async(path,status,location)=>{const res=await get(path);const loc=res.headers.get('location');if(res.status!==status||(location&&loc!==location&&loc!==origin+location))problems.push(`${path}: ${res.status} ${loc??''} (expected ${status} ${location??''})`);};
if(!built){
 await expect('/',local?302:308,'/en/');
 for(const [path,to] of [
  ['/ar','/ar/'],['/en','/en/'],['/preview','/en/'],['/preview/','/en/'],['/preview/index.html','/en/'],
  ['/preview/ar/','/ar/'],['/preview/fr/index.html','/fr/'],['/preview/de/about/','/de/about/'],['/preview/es/contact','/es/contact/'],
  ['/preview/en/projects/bike-tower/','/en/projects/bike-tower/'],['/preview/ar/projects/bike-tower','/ar/projects/bike-tower/'],
  ['/preview/en/projects/eventies/index.html','/en/projects/eventies/'],['/en/index.html','/en/'],['/de/about/index.html','/de/about/'],
  ['/ar/about','/ar/about/'],['/en/projects/bike-tower','/en/projects/bike-tower/'],
 ])await expect(path,308,to);
}
if(!built&&!local){
// (.php probes are blocked earlier by Vercel's firewall with 403, so they are not used here.)
for(const path of ['/about','/xx/','/de/xyz','/ar/not-a-page/','/en/projects/nope/'])await expect(path,404);
const unknown=await get('/ar/not-a-page/');if(!(await unknown.text()).includes('noindex'))problems.push('404 page is not noindex');}
const robotsResponse=await get('/robots.txt');
const robots=await robotsResponse.text();
const directives=robots.split(/\r?\n/).filter(Boolean).sort();
if(robotsResponse.status!==200||directives.join('\n')!==['User-agent: *','Allow: /','Disallow: /api/','Disallow: /creative/',`Sitemap: ${canonicalOrigin}/sitemap.xml`].sort().join('\n'))problems.push('robots.txt does not match the public crawl policy');
for(const path of ['/en/admin/','/creative/en/',...(built?['/404.html']:[])]){
 const response=await get(path);
 if(response.status!==200||!/<meta name="robots" content="noindex\b/.test(await response.text()))problems.push(`${path}: missing nonindexable HTML`);
}
for(const asset of ['/og-image-sterling.png','/favicon.ico','/icon.svg','/icon-192.png','/apple-touch-icon.png','/site.webmanifest'])await expect(asset,200);
if(built||local)notes.push('local run: deployed Vercel routing and HTTP 404 status require a production check');
console.log(`Checked ${checked} public routes (${urls.length} sitemap URLs) in ${built?dist:origin}.`);
console.log(problems.length?`PROBLEMS (${problems.length}):\n- `+problems.join('\n- '):'PROBLEMS: none');
console.log(notes.length?`NOTES (${notes.length}):\n- `+[...new Set(notes)].slice(0,25).join('\n- '):'NOTES: none');
process.exit(problems.length?1:0);
