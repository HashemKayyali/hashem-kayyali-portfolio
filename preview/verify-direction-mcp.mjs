import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright'),records=[];
const call=async code=>{const result=await client.call('browser_run_code_unsafe',{code});records.push(result);if(result.isError)throw Error(JSON.stringify(result));return result;};
try{
 for(const locale of ['en','ar','de','fr','es']){
  await call(`async(page)=>{
   const assert=(state,message)=>{if(!state)throw Error(message);};const layouts=[];
   for(const reducedMotion of ['no-preference','reduce'])for(const scene of ${JSON.stringify(locale==='ar'?['','projects/','contact/']:['','projects/'])})for(const width of [320,390,768,1024,1440]){
    await page.emulateMedia({reducedMotion});await page.setViewportSize({width,height:844});await page.goto('http://127.0.0.1:4176/preview/${locale}/'+scene);await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
    const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,dir:document.documentElement.dir,h1:document.querySelectorAll('main h1').length,broken:[...document.images].filter(img=>img.complete&&!img.naturalWidth).map(img=>img.src)}));
    assert(!state.overflow&&state.h1===1&&!state.broken.length,'${locale}:'+scene+':'+width+':'+reducedMotion+' '+JSON.stringify(state));assert(state.dir===('${locale}'==='ar'?'rtl':'ltr'),'Direction');
    if(reducedMotion==='reduce'){assert((await page.evaluate(()=>window.__portfolioMotion())).triggers.length===0,'Reduced-motion trigger leak');if(scene==='')assert(await page.locator('.hero-role-primary').evaluate(el=>getComputedStyle(el).opacity==='1'),'Essential role hidden');}
    layouts.push({scene,width,reducedMotion,...state});
   }return layouts;
  }`);console.log(locale+': normal/reduced scoped layouts passed');
 }
 await call(`async(page)=>{
  const assert=(state,message)=>{if(!state)throw Error(message);};await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4176/preview/ar/contact/');await page.locator('#contact-name').waitFor();
  assert(await page.locator('.contact-page-grid > :first-child').evaluate(el=>el.classList.contains('direct-contact')),'Arabic DOM/focus order');assert((await page.locator('.contact-form-region').boundingBox()).x<(await page.locator('.direct-contact').boundingBox()).x,'RTL column proportions');assert(await page.locator('#contact-email').getAttribute('dir')==='ltr','Email direction');
  await page.locator('#contact-name').fill('هاشم');await page.locator('#contact-email').fill('review@example.com');await page.locator('#contact-message').fill('رسالة تحقق محلية دون إرسال البريد.');await page.locator('button[type=submit]').click();await page.locator('.prepared-draft').waitFor();const href=await page.locator('.prepared-draft').getAttribute('href');assert(href.startsWith('mailto:')&&decodeURIComponent(href).includes('رسالة تحقق'),'Contact does not create the expected draft');assert((await page.locator('.prepared-draft').textContent()).includes('مسودة'),'Misleading send action');await page.locator('#contact-message').fill('تعديل المسودة يلغي رابطها القديم.');assert(await page.locator('.prepared-draft').count()===0,'Stale draft');
  for(const [name,width,height] of [['projects',1440,1000],['projects-mobile',390,844]]){
   await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4176/preview/en/');await page.locator('.hero').waitFor();
   for(const id of ['bike-tower','terminal-nfc','eventies']){const project=page.locator('.featured-project[data-project="'+id+'"]');await project.scrollIntoViewIfNeeded();await page.waitForTimeout(1400);assert(await project.locator('.project-secondary img').evaluate(img=>img.complete&&img.naturalWidth>0),'Secondary evidence missing');const src=await project.locator('.project-secondary img').getAttribute('src');assert(id==='eventies'||src.startsWith('/v2-media/'),'Raw private media request');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Scrolled project overflow');await page.screenshot({path:'output/playwright/motion-lab/direction-after-'+name+'-'+id+'.png'});if(id==='bike-tower')await page.screenshot({path:'output/playwright/motion-lab/direction-after-'+name+'.png'});}
  }return {emailDraft:true,noSendPerformed:true,rtlColumns:true,focusOrder:true,privacyDerivatives:true,projectScreenshots:6};
 }`);console.log('Arabic contact behavior/order and desktop/mobile genuine-media visual checks passed');
}finally{await writeFile('output/playwright/motion-lab/direction-functional.json',JSON.stringify(records,null,2));await client.call('browser_close');client.close();}
