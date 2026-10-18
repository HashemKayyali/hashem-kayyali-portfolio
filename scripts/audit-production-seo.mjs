// Read-only audit of the server-delivered HTML (no JavaScript executed), as a crawler first sees it.
// Usage: node scripts/audit-production-seo.mjs [origin]   (default https://hashemkayyali.com)
const origin=(process.argv[2]||'https://hashemkayyali.com').replace(/\/$/,'');
// Shell checks run anywhere; Vercel redirect/404 behaviour is only meaningful on the deployed site.
const local=/127\.0\.0\.1|localhost/.test(origin),canonicalOrigin=local?'https://hashemkayyali.com':origin;
const LOCALES={en:'en_US',ar:'ar_JO',de:'de_DE',fr:'fr_FR',es:'es_ES'};
const problems=[],notes=[];const titles=new Map(),descriptions=new Map();
const get=(path,init={})=>fetch(origin+path,{redirect:'manual',...init});
const attr=(html,re)=>[...html.matchAll(re)].map(m=>m[1]);
const sitemap=await (await get('/sitemap.xml')).text();
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replace(canonicalOrigin,origin));
if(urls.length===0)problems.push('sitemap has no URLs');
let checked=0;
await Promise.all(urls.map(async url=>{
 const path=new URL(url).pathname,locale=path.split('/')[1],res=await get(path),html=await res.text();checked++;
 const fail=message=>problems.push(path+': '+message);
 if(res.status!==200)return fail('status '+res.status);
 const expected=canonicalOrigin+path;
 const canonical=attr(html,/<link rel="canonical" href="([^"]+)"/g);if(canonical.length!==1||canonical[0]!==expected)fail('canonical '+JSON.stringify(canonical));
 const ogLocale=attr(html,/<meta property="og:locale" content="([^"]+)"/g);if(ogLocale.length!==1||ogLocale[0]!==LOCALES[locale])fail('og:locale '+JSON.stringify(ogLocale));
 const ogUrl=attr(html,/<meta property="og:url" content="([^"]+)"/g);if(ogUrl.length!==1||ogUrl[0]!==expected)fail('og:url '+JSON.stringify(ogUrl));
 const hreflang=attr(html,/hreflang="([^"]+)"/g);if(hreflang.sort().join()!==['ar','de','en','es','fr','x-default'].join())fail('hreflang '+hreflang.join());
 const robots=attr(html,/<meta name="robots" content="([^"]+)"/g);if(robots.length!==1||robots[0]!=='index,follow')fail('robots '+JSON.stringify(robots));
 const lang=html.match(/<html lang="([^"]+)" dir="([^"]+)"/);if(!lang||lang[1]!==locale||lang[2]!==(locale==='ar'?'rtl':'ltr'))fail('html lang/dir '+(lang?.slice(1).join('/')));
 const title=attr(html,/<title>([^<]*)<\/title>/g);if(title.length!==1||!title[0].trim())fail('title');else{titles.set(locale+'|'+title[0],[...(titles.get(locale+'|'+title[0])??[]),path]);if(title[0].length>70)notes.push(path+': title '+title[0].length+' chars');}
 const description=attr(html,/<meta name="description" content="([^"]*)"/g);if(description.length!==1||description[0].length<(locale==='ar'?35:50))fail('description '+JSON.stringify(description[0]??''));else{descriptions.set(description[0],[...(descriptions.get(description[0])??[]),path]);if(description[0].length>170)notes.push(path+': description '+description[0].length+' chars');}
 for(const name of ['og:image','twitter:image'])if((html.match(new RegExp(`(property|name)="${name}" content="${canonicalOrigin}/og-image-sterling.png"`,'g'))||[]).length!==1)fail(name+' not the Sterling card');
 if((html.match(/name="twitter:card" content="summary_large_image"/g)||[]).length!==1)fail('twitter:card');
 for(const tag of ['og:title','og:description','og:type','og:site_name','twitter:title','twitter:description'])if((html.match(new RegExp(`(property|name)="${tag}"`,'g'))||[]).length!==1)fail(tag+' count');
 const ld=attr(html,/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);const home=/^\/(en|ar|de|fr|es)\/$/.test(path);
 if(home!==(ld.length===1))fail('JSON-LD presence');
 if(ld[0]){const data=JSON.parse(ld[0]);const types=data['@graph'].map(node=>node['@type']).sort().join();if(types!=='Person,WebSite')fail('JSON-LD types '+types);}
 if(!/<noscript>[\s\S]*<a href="\//.test(html))notes.push(path+': no crawlable links without JavaScript');
}));
for(const [value,paths] of titles)if(paths.length>1)problems.push('duplicate title within one language "'+value+'" on '+paths.join(', '));
for(const [value,paths] of descriptions)if(paths.length>1)notes.push('shared description on '+paths.length+' pages: '+paths.slice(0,3).join(', ')+(paths.length>3?'…':''));
// Redirects, 404s, robots, assets
const expect=async(path,status,location)=>{const res=await get(path);const loc=res.headers.get('location');if(res.status!==status||(location&&loc!==location&&loc!==origin+location))problems.push(`${path}: ${res.status} ${loc??''} (expected ${status} ${location??''})`);};
if(!local){for(const [path,to] of [['/','/en/'],['/ar','/ar/'],['/en','/en/'],['/preview','/en/'],['/preview/','/en/'],['/preview/ar/','/ar/'],['/preview/en/projects/bike-tower/','/en/projects/bike-tower/'],['/preview/de/about/','/de/about/']])await expect(path,308,to);
// (.php probes are blocked earlier by Vercel's firewall with 403, so they are not used here.)
for(const path of ['/about','/xx/','/de/xyz','/ar/not-a-page/','/en/projects/nope/'])await expect(path,404);
for(const [path,to] of [['/ar/about','/ar/about/'],['/en/projects/bike-tower','/en/projects/bike-tower/']])await expect(path,308,to);
const unknown=await get('/ar/not-a-page/');if(!(await unknown.text()).includes('noindex'))problems.push('404 page is not noindex');}
const robots=await (await get('/robots.txt')).text();if(!robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)||!/Disallow: \/api\//.test(robots)||/Disallow: \/preview/.test(robots))problems.push('robots.txt');
for(const asset of ['/og-image-sterling.png','/favicon.ico','/icon.svg','/icon-192.png','/apple-touch-icon.png','/site.webmanifest'])await expect(asset,200);
if(local)notes.push('local run: Vercel redirects and 404 status not checked');
console.log(`Checked ${checked} sitemap URLs on ${origin}.`);
console.log(problems.length?`PROBLEMS (${problems.length}):\n- `+problems.join('\n- '):'PROBLEMS: none');
console.log(notes.length?`NOTES (${notes.length}):\n- `+[...new Set(notes)].slice(0,25).join('\n- '):'NOTES: none');
process.exit(problems.length?1:0);
