import {connect} from './mcp-client.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
const mode=process.argv[2]??'record',client=await connect('playwright'),dir='output/playwright/home-art-direction';
await mkdir(dir,{recursive:true});let result;
const scenes=[['en',1440,1000],['en',390,844],['ar',1440,1000],['ar',390,844]];
try {
 if(mode==='record') {
  result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
   const records=[];for(const [locale,width,height] of ${JSON.stringify(scenes)}){
    const context=await page.context().browser().newContext({viewport:{width,height},reducedMotion:'no-preference',recordVideo:{dir:'${dir}/raw',size:{width,height}}});
    const demo=await context.newPage(),errors=[];demo.on('pageerror',error=>errors.push(error.message));
    await demo.goto('http://127.0.0.1:4176/preview/'+locale+'/');await demo.locator('h1').waitFor();
    const early=await demo.evaluate(()=>({clip:getComputedStyle(document.querySelector('.portrait-reveal')).clipPath,motion:window.__portfolioMotion()}));
    await demo.waitForTimeout(1800);const name=locale+'-'+width;await demo.screenshot({path:'${dir}/after-'+name+'-hero.png'});
    for(const [index,selector] of ['.home-about','.featured-project--0','.featured-project--1','.featured-project--2','.home-bottom','.home-invitation'].entries()){
     await demo.locator(selector).scrollIntoViewIfNeeded();await demo.waitForTimeout(1100);await demo.screenshot({path:'${dir}/after-'+name+'-chapter-'+index+'.png'});
     await demo.mouse.wheel(0,220);await demo.waitForTimeout(450);
    }
    const proof=await demo.evaluate(()=>({motion:window.__portfolioMotion(),fields:[...document.querySelectorAll('.home-page .motion-field')].map(e=>({class:e.className,look:e.dataset.look,state:e.dataset.motion})),overflow:document.documentElement.scrollWidth>innerWidth+1}));
    const video=demo.video();await demo.close();await video.saveAs('${dir}/after-'+name+'.webm');await context.close();records.push({name,early,errors,...proof});
   }return records;
  }`});
 } else {
  const facts={};for(const locale of ['en','ar','de','fr','es']){const t=(await import('../content/locales/'+locale+'.ts')).default;facts[locale]=[t.identity.name,t.hero.headline,t.hero.supporting,t.about.sections[0].paragraphs[0],t.about.toolkitIntro,t.contact.heading,t.contact.supporting,...['bike-tower','terminal-nfc','eventies'].flatMap(id=>[t.projects[id].title,t.projects[id].short,t.projects[id].status]),...t.resume.experience.slice(0,3).flatMap(e=>[e.company,e.roles?.[0]?.title??e.role,e.roles?.[0]?.period??e.period])];}
  result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
   const assert=(value,message)=>{if(!value)throw Error(message);},facts=${JSON.stringify(facts)},layouts=[],errors=[],warnings=[];
   const context=await page.context().browser().newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
   await context.addInitScript(()=>{window.__ownedGLCount=0;const contexts=new WeakSet(),original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){const result=original.call(this,type,...args);if(result&&(type==='webgl'||type==='webgl2'||type==='experimental-webgl')&&!contexts.has(result)){contexts.add(result);window.__ownedGLCount++;}return result;};});
   const demo=await context.newPage();demo.on('pageerror',e=>errors.push(e.message));demo.on('console',m=>{if(m.type()==='warning')warnings.push(m.text());if(m.type()==='error')errors.push(m.text());});
   for(const locale of Object.keys(facts))for(const width of [320,390,768,1440]){
    await demo.setViewportSize({width,height:width<701?844:1000});await demo.goto('http://127.0.0.1:4176/preview/'+locale+'/');await demo.locator('h1').waitFor();await demo.waitForTimeout(350);
    const data=await demo.evaluate(expected=>{const normalize=s=>s.replace(/\s+/g,' ').trim(),body=normalize(document.body.textContent);return {overflow:document.documentElement.scrollWidth>innerWidth+1,dir:document.documentElement.dir,h1:document.querySelectorAll('h1').length,missing:expected.filter(s=>!body.includes(normalize(s))),smoke:document.querySelectorAll('.home-page [data-look="smoke"]').length,gl:window.__ownedGLCount,images:[...document.querySelectorAll('main img')].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),masks:[...document.querySelectorAll('.home-page .motion-field')].map(e=>getComputedStyle(e).maskImage)};},facts[locale]);
    assert(!data.overflow&&data.h1===1&&!data.missing.length&&!data.images.length,'Layout/content failed '+locale+'/'+width+':'+JSON.stringify(data));assert(data.smoke===4&&data.gl<=1,'Shared smoke failed');assert(data.dir===(locale==='ar'?'rtl':'ltr'),'Direction failed');assert(data.masks.every(mask=>mask==='none'),'Translucent motion mask reintroduced');layouts.push({locale,width,...data});
   }
   await demo.setViewportSize({width:1440,height:1000});await demo.goto('http://127.0.0.1:4176/preview/en/');await demo.waitForTimeout(350);
   const early=await demo.evaluate(()=>({clip:getComputedStyle(document.querySelector('.portrait-reveal')).clipPath,progress:window.__portfolioMotion().timelines.find(t=>t.id==='home:hero:entrance')?.progress}));
   await demo.waitForTimeout(1600);assert(await demo.locator('.hero').getAttribute('data-entrance')==='complete','Hero entrance did not complete');
   const pixel=()=>demo.evaluate(()=>{const canvas=document.querySelector('.hero-field canvas'),scratch=document.createElement('canvas');scratch.width=canvas.width;scratch.height=canvas.height;const sampling=scratch.getContext('2d',{willReadFrequently:true});sampling.drawImage(canvas,0,0);const data=sampling.getImageData(0,0,canvas.width,canvas.height).data;let checksum=0;for(let i=0;i<data.length;i+=17)checksum=(checksum*31+data[i])>>>0;return {checksum,frame:Number(canvas.dataset.frame),state:canvas.parentElement.dataset.motion};});
   const first=await pixel();await demo.waitForTimeout(1100);const second=await pixel();assert(first.checksum!==second.checksum&&second.frame>first.frame,'Smoke is static');assert(second.frame-first.frame<=16,'Paint cap exceeded');
   for(const selector of ['.home-about','.home-projects>.page-section-title','.featured-project--0','.featured-project--1','.featured-project--2','.home-bottom','.home-invitation']){await demo.locator(selector).scrollIntoViewIfNeeded();await demo.waitForTimeout(1050);}
   const played=await demo.evaluate(()=>({motion:window.__portfolioMotion(),rule:getComputedStyle(document.querySelector('.home-about .home-section-rule')).transform,fields:[...document.querySelectorAll('.home-page .motion-field')].map(e=>({look:e.dataset.look,state:e.dataset.motion,frame:e.querySelector('canvas').dataset.frame}))}));
   assert(played.motion.triggers.every(t=>t.connected),'Detached ScrollTrigger');assert(played.motion.triggers.some(t=>t.id==='home:invitation:flow'&&t.progress>0),'CTA flow inactive');assert(played.motion.triggers.filter(t=>t.id?.startsWith('home:project:')).length===9,'Featured stories missing');
   const off=await pixel();await demo.waitForTimeout(700);const offEnd=await pixel();assert(off.state==='offscreen'&&off.frame===offEnd.frame,'Offscreen Hero keeps painting');
   await demo.locator('.featured-project--0 .project-destination').focus();await demo.waitForTimeout(150);const focusedMask=await demo.locator('.featured-project--0 .project-media-reveal').evaluate(e=>getComputedStyle(e).clipPath);assert(focusedMask==='none'||!/[1-9]/.test(focusedMask),'Focused image remains masked');
   await demo.locator('.hero .button-primary').click();await demo.waitForURL('**/en/projects/');await demo.waitForTimeout(800);assert(!(await demo.evaluate(()=>window.__portfolioMotion().triggers)).some(t=>t.id?.startsWith('home:')),'Home triggers leaked to Projects');assert(await demo.locator('.project-index-entry,.featured-project').count()>=11,'Projects collection lost entries');
   await demo.goBack();await demo.locator('.home-page').waitFor();await demo.waitForTimeout(900);assert(await demo.locator('[data-look="smoke"]').count()===4,'Back failed');
   await demo.emulateMedia({reducedMotion:'reduce'});await demo.waitForTimeout(200);assert((await demo.evaluate(()=>window.__portfolioMotion().triggers)).length===0,'Reduced motion triggers remain');
   const reducedFrame=await pixel();await demo.waitForTimeout(550);const reducedEnd=await pixel();assert(reducedFrame.frame===reducedEnd.frame,'Reduced smoke continues painting');
   for(const locale of Object.keys(facts)){await demo.goto('http://127.0.0.1:4176/preview/'+locale+'/');await demo.locator('h1').waitFor();assert((await demo.evaluate(()=>window.__portfolioMotion().triggers)).length===0,'Reduced route creates triggers');assert(!await demo.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'Reduced layout overflow');}
   await demo.setViewportSize({width:390,height:844});await demo.goto('http://127.0.0.1:4176/preview/ar/');await demo.screenshot({path:'${dir}/reduced-ar-390.png'});
   await context.close();assert(!errors.length&&!warnings.length,'Browser messages:'+JSON.stringify({errors,warnings}));return {layouts,early,smoke:{first,second,off,offEnd,reducedFrame,reducedEnd},played,focusedMask,normalMotion:true,reducedLocales:5,errors,warnings};
  }`});
 }
 console.log(mode+' actual Playwright MCP completed');if(result.isError)throw Error(JSON.stringify(result));
}finally{await writeFile(dir+'/'+mode+'-mcp.json',JSON.stringify(result,null,2));await client.call('browser_close');client.close();}
