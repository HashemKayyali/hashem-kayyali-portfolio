import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright');
try {
 const result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
  const assert=(value,message)=>{if(!value)throw new Error(message);};
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('http://127.0.0.1:4176/preview/en/');
  await page.locator('h1').waitFor();
  const heroSamples=[];for(let index=0;index<9;index++){heroSamples.push(await page.evaluate(()=>({name:getComputedStyle(document.querySelector('.hero-name-part')).transform,opacity:getComputedStyle(document.querySelector('.hero-name-part')).opacity,mask:getComputedStyle(document.querySelector('.portrait-reveal')).clipPath,registry:window.__portfolioMotion()})));await page.waitForTimeout(120);}
  assert(new Set(heroSamples.map(sample=>sample.name)).size>1,'Hero typography is static');
  assert(new Set(heroSamples.map(sample=>sample.mask)).size>1,'Portrait mask is static');
  assert(heroSamples.some(sample=>sample.registry.timelines.some(animation=>animation.id==='hero:entrance'&&animation.active)),'No active GSAP Hero timeline');
  await page.waitForTimeout(700);
  await page.evaluate(()=>{
   window.outgoingSamples=[];
   document.addEventListener('click',()=>{
    const end=performance.now()+650;
    const sample=()=>{window.outgoingSamples.push({path:location.pathname,opacity:document.querySelector('.route-stage')?Number(getComputedStyle(document.querySelector('.route-stage')).opacity):1});if(performance.now()<end)requestAnimationFrame(sample);};
    requestAnimationFrame(sample);
   },{once:true});
  });
  await page.locator('.site-header nav a[href="/preview/en/projects/"]').click();
  await page.waitForURL('**/preview/en/projects/');await page.waitForTimeout(1000);
  const outgoingSamples=await page.evaluate(()=>window.outgoingSamples);
  const outgoing=outgoingSamples.find(sample=>sample.path==='/preview/en/'&&sample.opacity<1);
  assert(outgoing,'Navigation replaced the page immediately; coordinated outgoing animation missing: '+JSON.stringify(outgoingSamples));
  assert(await page.locator('main h1').count()===1,'Incoming page missing');
  for(let index=0;index<3;index++){await page.locator('.featured-project').nth(index).scrollIntoViewIfNeeded();await page.waitForTimeout(350);}
  const registry=await page.evaluate(()=>window.__portfolioMotion());
  assert(registry.triggers.filter(trigger=>trigger.id?.startsWith('project:')).length===9,'Missing actual project ScrollTriggers');
  for(const index of [2,1,0]){await page.locator('.filters button').nth(index).click();await page.waitForTimeout(150);const state=await page.evaluate(()=>window.__portfolioMotion());assert(state.triggers.every(trigger=>trigger.connected),'Detached trigger survived filter change: '+JSON.stringify(state.triggers.filter(trigger=>!trigger.connected)));const ids=state.triggers.map(trigger=>trigger.id).filter(Boolean);assert(new Set(ids).size===ids.length,'Duplicate triggers after filter change');}
  await page.evaluate(()=>scrollTo(0,650));await page.waitForTimeout(200);
  const contactBounds=await page.locator('.site-header nav a[href="/preview/en/contact/"]').boundingBox();await page.mouse.click(contactBounds.x+contactBounds.width/2,contactBounds.y+contactBounds.height/2);await page.waitForURL('**/contact/');await page.waitForTimeout(950);
  assert((await page.evaluate(()=>window.__portfolioMotion())).triggers.length===0,'ScrollTriggers leaked into Contact');
  await page.goBack();await page.waitForURL('**/projects/');await page.waitForTimeout(1000);
  const restored=await page.evaluate(()=>scrollY);assert(Math.abs(restored-650)<4,'Back did not restore scroll position: '+restored);
  await page.locator('.site-header nav a[href="/preview/en/contact/"]').click();await page.waitForTimeout(55);
  await page.locator('.site-header nav a[href="/preview/en/projects/"]').click();await page.waitForTimeout(900);
  assert(page.url().endsWith('/projects/'),'Latest navigation intent lost');
  assert(await page.locator('.route-stage').evaluate(el=>!el.inert&&Number(getComputedStyle(el).opacity)===1),'Canceling transition left page hidden/inert');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
  assert((await page.evaluate(()=>window.__portfolioMotion())).triggers.length===0,'Reduced motion retains ScrollTriggers');
  await page.locator('.site-header nav a[href="/preview/en/"]').click();await page.waitForURL('**/preview/en/');await page.waitForTimeout(100);
  const staticState=await page.evaluate(()=>({opacity:getComputedStyle(document.querySelector('.hero-name-part')).opacity,transform:getComputedStyle(document.querySelector('.hero-name-part')).transform,mask:getComputedStyle(document.querySelector('.portrait-reveal')).clipPath,fluid:document.querySelector('.hero-field').dataset.motion,registry:window.__portfolioMotion()}));
  assert(staticState.opacity==='1'&&staticState.transform==='none'&&staticState.mask==='none'&&staticState.fluid==='reduced','Reduced motion content is hidden/moving');
  assert(await page.locator('.connected-signature').count()===0,'Removed signature restored');
  return {outgoing,outgoingSamples,heroSamples,registry,restored,staticState};
 }`});
 await writeFile('output/playwright/motion-lab/overhaul-functional.json',JSON.stringify(result,null,2));
 if(result.isError)throw new Error(JSON.stringify(result));console.log('Active GSAP Hero, all project triggers, filter cleanup, trusted-pointer history restoration, rapid cancellation and reduced motion passed');
} finally {await client.call('browser_close');client.close();}
