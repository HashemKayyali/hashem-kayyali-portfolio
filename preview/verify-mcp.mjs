import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright');const records=[];
const call=async(name,args)=>{const result=await client.call(name,args);records.push({name,result});if(result.isError)throw new Error(JSON.stringify(result));return result;};
try {
 await call('browser_navigate',{url:'http://127.0.0.1:4176/preview/'});
 await call('browser_emulate_media',{reducedMotion:'reduce'});
 for(const locale of ['en','ar','de','fr','es']) {
  const result=await call('browser_run_code_unsafe',{code:`async(page)=>{
   const layouts=[];
   for(const project of ['bike-tower','terminal-nfc','eventies'])for(const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4176/preview/?lang=${locale}&project='+project);await page.locator('.story-step').first().waitFor();await page.evaluate(()=>document.fonts.ready);
    const state=await page.evaluate(()=>({dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth>innerWidth,steps:document.querySelectorAll('.story-step').length,concepts:document.querySelectorAll('.concept-visual').length,broken:[...document.images].filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.src),sources:[...document.querySelectorAll('.gallery img')].map(img=>img.src)}));
    if(state.overflow||state.steps!==3||state.broken.length||state.dir!==('${locale}'==='ar'?'rtl':'ltr'))throw new Error(JSON.stringify({project,width,state}));
    if(project==='terminal-nfc'&&state.sources.some(src=>!src.includes('/v2-media/')))throw new Error('Unredacted Terminal media');
    layouts.push({project,width,...state});
   }
   return layouts;
  }`});
  console.log(`${locale}: 15 case layouts verified with Playwright MCP`);
 }
 await call('browser_resize',{width:1440,height:1000});await call('browser_emulate_media',{reducedMotion:'no-preference'});
 const lifecycle=await call('browser_run_code_unsafe',{code:`async(page)=>{
  const assert=(state,message)=>{if(!state)throw new Error(message);};
  await page.goto('http://127.0.0.1:4176/preview/');await page.locator('.hero h1').waitFor();
  await page.waitForFunction(()=>document.querySelector('.hero-field').dataset.motion==='active');
  const sample=()=>page.locator('.hero-field canvas').evaluate(canvas=>({frame:Number(canvas.dataset.frame),pixels:canvas.toDataURL()}));
  const first=await sample();await page.waitForTimeout(500);const second=await sample();assert(second.frame>first.frame&&second.pixels!==first.pixels,'Fluid does not evolve');
  assert(await page.locator('.connected-signature').count()===0,'Removed hero signature reappeared');
  const runtime=await page.evaluate(()=>performance.getEntriesByType('resource').map(entry=>entry.name).filter(name=>/rive.*(wasm|js)|\.riv/.test(name)));assert(runtime.length===0,'Fallback unnecessarily downloads Rive');
  await page.locator('.home-bottom').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.hero-field').dataset.motion==='offscreen');const paused=await sample();await page.waitForTimeout(300);assert((await sample()).frame===paused.frame,'Offscreen repainting');
  await page.goto('http://127.0.0.1:4176/preview/?project=bike-tower');await page.locator('.engineering-story').waitFor();
  await page.evaluate(()=>{const story=document.querySelector('.engineering-story');scrollTo(0,story.offsetTop-300);});await page.waitForTimeout(250);
  const start=Number(await page.locator('.engineering-story').getAttribute('data-progress'));
  await page.locator('.story-step').last().scrollIntoViewIfNeeded();await page.waitForTimeout(250);const end=Number(await page.locator('.engineering-story').getAttribute('data-progress'));assert(end>start,'ScrollTrigger story progression');
  await page.goto('http://127.0.0.1:4176/preview/');await page.locator('.hero h1').waitFor();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.hero-field').dataset.motion==='reduced');const reduced=await sample();await page.waitForTimeout(400);assert((await sample()).pixels===reduced.pixels,'Reduced-motion paints moving frame');
  return {fluidPaints:second.frame-first.frame,offscreenPaused:true,signatureRemoved:true,riveDownloadCount:runtime.length,scrollProgress:[start,end],reducedStatic:true};
 }`});
 console.log(lifecycle.content.filter(x=>x.type==='text').map(x=>x.text).join('\n'));
 await call('browser_console_messages',{level:'error',all:true,filename:'output/playwright/motion-lab/mcp-functional-console.txt'});
} finally {await writeFile('output/playwright/motion-lab/mcp-functional-verification.json',JSON.stringify(records,null,2));await client.call('browser_close');client.close();}
