import {connect} from './mcp-client.mjs';import {writeFile} from 'node:fs/promises';
const c=await connect('playwright'),out='output/playwright/projects-upgrade',records=[];
try {
 for(const locale of ['en','ar'])for(const width of [1440,390,320]) {
 const r=await c.call('browser_run_code_unsafe',{code:`async(page)=>{
 const width=${width},locale='${locale}',out='${out}',height=width===1440?1000:844;
 const context=await page.context().browser().newContext({viewport:{width,height},reducedMotion:'no-preference',...(width!==320?{recordVideo:{dir:out+'/raw-after',size:{width,height}}}:{})});
 const p=await context.newPage(),errors=[],samples=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4176/preview/'+locale+'/projects/');await p.locator('.project-exhibition').waitFor();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1300);
 await p.screenshot({path:out+'/after-'+locale+'-'+width+'-opening.png'});samples.push(await p.evaluate(()=>window.__portfolioMotion()));
 for(let i=0;i<(width===1440?22:35);i++){await p.mouse.wheel(0,width===1440?300:255);await p.waitForTimeout(width===1440?360:380);if(i===2||i===5||i===12)samples.push(await p.evaluate(()=>window.__portfolioMotion()));}
 await p.waitForTimeout(650);await p.screenshot({path:out+'/after-'+locale+'-'+width+'-index.png'});
 const galleryVideo=p.video();await p.close();if(galleryVideo)await galleryVideo.saveAs(out+'/after-'+locale+'-'+width+'-gallery.webm');await context.close();
 const details=await page.context().browser().newContext({viewport:{width,height},reducedMotion:'no-preference',...(width!==320?{recordVideo:{dir:out+'/raw-after',size:{width,height}}}:{})});
 const q=await details.newPage();q.on('pageerror',e=>errors.push(e.message));await q.goto('http://127.0.0.1:4176/preview/'+locale+'/projects/');await q.locator('.project-exhibition').waitFor();await q.waitForTimeout(1200);
 await q.evaluate(()=>scrollTo({top:document.querySelector('.gallery-featured').getBoundingClientRect().top+scrollY-110,behavior:'instant'}));await q.waitForTimeout(1100);await q.screenshot({path:out+'/after-'+locale+'-'+width+'-gallery.png'});
 const card=q.locator('[data-gallery-project=bike-tower]');await card.scrollIntoViewIfNeeded();await q.waitForTimeout(600);await card.hover();await q.waitForTimeout(350);const origin=await q.evaluate(()=>scrollY);await card.click();await q.waitForURL('**/projects/bike-tower/');await q.waitForTimeout(150);samples.push(await q.evaluate(()=>({motion:window.__portfolioMotion(),ghosts:document.querySelectorAll('.project-transit-image').length})));await q.waitForTimeout(1300);await q.screenshot({path:out+'/after-'+locale+'-'+width+'-detail.png'});
 await q.locator('.neighbor--1').scrollIntoViewIfNeeded();await q.waitForTimeout(700);await q.locator('.neighbor--1').click();await q.waitForTimeout(1600);const next=q.url();await q.locator('.neighbor--0').scrollIntoViewIfNeeded();await q.waitForTimeout(650);await q.locator('.neighbor--0').click();await q.waitForTimeout(1600);const previous=q.url();
 await q.locator('.back-link').click();await q.waitForURL('**/preview/'+locale+'/projects/');await q.waitForTimeout(1400);const returned=await q.evaluate(()=>({scroll:scrollY,ghosts:document.querySelectorAll('.project-transit-image').length,stale:window.__portfolioMotion().triggers.filter(t=>!t.connected)}));
 await q.locator('[data-gallery-filter=businessSystem]').click();await q.waitForTimeout(700);await q.screenshot({path:out+'/after-'+locale+'-'+width+'-filter.png'});await q.locator('[data-gallery-filter=all]').click();await q.locator('[data-project=glitzz-lab]').scrollIntoViewIfNeeded();await q.waitForTimeout(1200);await q.screenshot({path:out+'/after-'+locale+'-'+width+'-collection.png'});
 const video=q.video();await q.close();if(video)await video.saveAs(out+'/after-'+locale+'-'+width+'-transitions.webm');await details.close();return {locale,width,normalMotion:true,origin,returned,next,previous,samples,errors};
 }`});records.push({locale,width,result:r});await writeFile(out+'/after-capture-mcp.json',JSON.stringify(records,null,2));if(r.isError)throw Error(JSON.stringify(r));console.log(locale+' '+width+': screenshots and normal-motion gallery/transitions captured');
 }
}finally{await c.call('browser_close');c.close();}
