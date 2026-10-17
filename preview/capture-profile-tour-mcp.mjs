import {connect} from './mcp-client.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const out='output/playwright/signature';await mkdir(out,{recursive:true});
const c=await connect('playwright'),rows=[];
try{for(const [locale,width,height] of [['en',1440,1000],['ar',390,844]]){
 const result=await c.call('browser_run_code_unsafe',{code:`async(page)=>{
 const assert=(v,m)=>{if(!v)throw Error(m);};
 const context=await page.context().browser().newContext({viewport:{width:${width},height:${height}},reducedMotion:'no-preference',recordVideo:{dir:'${out}/raw',size:{width:${width},height:${height}}}});
 const demo=await context.newPage(),proof=[],errors=[];demo.on('pageerror',e=>errors.push(e.message));
 await demo.goto('http://127.0.0.1:4176/preview/${locale}/projects/');await demo.locator('main h1').waitFor();await demo.waitForTimeout(1300);
 assert(await demo.locator('.collection-tile').count()===11,'Collection lost project');
 assert(await demo.locator('[data-project]').count()===11,'Main collection lost project');
 await demo.screenshot({path:'${out}/collection-${locale}-${width}.png'});
 ${width>700?`await demo.locator('.collection-scene').scrollIntoViewIfNeeded();await demo.waitForTimeout(400);const start=await demo.locator('.collection-tile').first().evaluate(e=>getComputedStyle(e).transform);for(let i=0;i<3;i++){await demo.mouse.wheel(0,160);await demo.waitForTimeout(500);}const end=await demo.locator('.collection-tile').first().evaluate(e=>getComputedStyle(e).transform);assert(start!==end,'Sticky grid transform did not advance');proof.push({collectionTransforms:[start,end],registry:await demo.evaluate(()=>window.__portfolioMotion())});await demo.screenshot({path:'${out}/collection-sticky-${locale}-${width}.png'});`:''}
 const filters=demo.locator('.filters button');for(let i=1;i<await filters.count();i++){await filters.nth(i).click();await demo.waitForTimeout(280);const ordinary=await demo.locator('[data-project]').count();const tiles=await demo.locator('.collection-tile').count();assert(ordinary===tiles&&ordinary>0,'Filter collection mismatch');assert(await filters.nth(i).getAttribute('aria-pressed')==='true','Filter state');proof.push({filter:i,projects:ordinary});}await filters.first().click();
 for(const route of ['about','experience','skills','contact']){
  const nav=demo.locator('#primary-navigation a[href="/preview/${locale}/'+route+'/"]');if(await nav.isVisible())await nav.click();else{await demo.locator('.navigation-toggle').click();await nav.click();}
  await demo.locator('main h1').waitFor();await demo.waitForTimeout(1000);
  if(route==='about'){await demo.locator('.profile-chapter').first().scrollIntoViewIfNeeded();await demo.waitForTimeout(500);}
  if(route==='experience'){const group=demo.locator('[data-company="terminal"]');await group.scrollIntoViewIfNeeded();await demo.waitForTimeout(230);proof.push({page:route,registry:await demo.evaluate(()=>window.__portfolioMotion())});await demo.waitForTimeout(650);const disclosure=group.locator('summary');if(await disclosure.count())await disclosure.first().click();await demo.waitForTimeout(500);}
  if(route==='skills'){await demo.locator('.skill-category-nav a').nth(2).click();await demo.waitForTimeout(600);}
  if(route==='contact'){await demo.locator('input[name="name"]').fill('Portfolio preview');await demo.locator('input[name="email"]').fill('preview@example.com');await demo.locator('textarea').fill('Local preview of the email draft workflow.');await demo.locator('form button[type="submit"]').click();await demo.waitForTimeout(700);assert(await demo.locator('a[href^="mailto:"]').count()>0,'Draft link absent');}
  await demo.screenshot({path:'${out}/tour-'+route+'-${locale}-${width}.png'});proof.push({page:route,path:await demo.evaluate(()=>location.pathname),overflow:await demo.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)});
  for(let i=0;i<2;i++){await demo.mouse.wheel(0,240);await demo.waitForTimeout(350);}
 }
 const video=demo.video();await demo.close();await video.saveAs('${out}/profile-tour-${locale}-${width}.webm');await context.close();return {locale:'${locale}',width:${width},normalMotion:true,proof,errors};
 }`});rows.push(result);if(result.isError)throw Error(JSON.stringify(result));console.log(`${locale}/${width} full profile/collection tour captured`);
}}finally{await writeFile(`${out}/profile-tour-proof.json`,JSON.stringify(rows,null,2));c.close();}
