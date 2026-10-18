import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pageMetadata,clampDescription} from '../preview/page-metadata.ts';
import {PAGES} from '../preview/routes.ts';
import {projectAssets} from '../data/projectAssets.ts';

const LOCALES=['en','ar','de','fr','es'];
const dictionaries=Object.fromEntries(await Promise.all(LOCALES.map(async locale=>[locale,(await import(`../content/locales/${locale}.ts`)).default])));
const routes=locale=>[...PAGES.filter(page=>page!=='admin').map(page=>({locale,page})),...projectAssets.map(asset=>({locale,page:'projects',project:asset.id}))];

test('Descriptions keep whole sentences and fit search snippets',()=>{
 assert.equal(clampDescription('Short and complete.'),'Short and complete.');
 const long='First sentence explains the product in a useful amount of detail for readers. Second sentence adds more context about the architecture and delivery. Third sentence would overflow.';
 const clamped=clampDescription(long);assert.ok(clamped.length<=160);assert.ok(clamped.endsWith('.'));assert.ok(!clamped.includes('Third'));
 const run=clampDescription('word '.repeat(60));assert.ok(run.length<=160&&run.endsWith('…'));
 assert.equal(clampDescription('  spaced\n  text  '),'spaced text');
});
test('Every indexable page in every language has a unique title and a 35–160 character description',()=>{
 for(const locale of LOCALES){const titles=new Set();
  for(const route of routes(locale)){const data=pageMetadata(route,dictionaries[locale]);
   assert.ok(!titles.has(data.title),`${locale} duplicate title ${data.title}`);titles.add(data.title);
   assert.ok(data.description.length>=35&&data.description.length<=160,`${locale} ${route.page} ${route.project??''}: ${data.description.length}`);
   assert.equal(data.robots,'index,follow');}}
});
test('Admin, Creative Lab and not-found stay out of search results',()=>{
 for(const route of [{locale:'en',page:'admin'},{locale:'ar',page:'not-found'},{locale:'de',page:'home',experience:'creative'}])assert.equal(pageMetadata(route,dictionaries[route.locale]).robots,'noindex,nofollow');
});
test('Vercel routing: no catch-all rewrite, permanent redirects only, and every page/project has a slashless redirect',()=>{
 const vercel=JSON.parse(fs.readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
 assert.equal(vercel.rewrites,undefined,'unknown paths must return 404, not the app shell');
 assert.ok(vercel.redirects.every(rule=>rule.permanent===true));
 assert.ok(!vercel.redirects.some(rule=>/\(\.\*\)/.test(rule.source)&&rule.destination==='/en/'),'unknown URLs are never sent to the homepage');
 const pageRule=vercel.redirects.find(rule=>rule.source.startsWith('/:locale(en|ar|de|fr|es)/:page('));
 const projectRule=vercel.redirects.find(rule=>rule.source.startsWith('/:locale(en|ar|de|fr|es)/projects/:project('));
 const listed=source=>source.match(/:(?:page|project)\(([^)]+)\)/)[1].split('|');
 assert.deepEqual(listed(pageRule.source).sort(),PAGES.filter(page=>page!=='home').sort(),'slashless page redirects match the route list');
 assert.deepEqual(listed(projectRule.source).sort(),projectAssets.map(asset=>asset.id).sort(),'slashless project redirects match the project list');
 assert.ok(vercel.headers.some(rule=>rule.source==='/assets/(.*)'&&rule.headers.some(h=>/immutable/.test(h.value))));
 const security=vercel.headers.find(rule=>rule.source==='/(.*)').headers.map(h=>h.key);
 for(const header of ['X-Content-Type-Options','Referrer-Policy','X-Frame-Options','Permissions-Policy'])assert.ok(security.includes(header),header);
});
