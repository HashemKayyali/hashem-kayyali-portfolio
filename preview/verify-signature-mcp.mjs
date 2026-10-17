import {connect} from './mcp-client.mjs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';

// Genuine official Playwright MCP via the existing stdio bridge. No app changes.
const base=(process.env.SIGNATURE_BASE??'http://127.0.0.1:4176').replace(/\/$/,'');
const out='output/playwright/signature';
const locales=['en','ar','de','fr','es'];
const ids=['eventies','glitzz-lab','umniah-youthconnect','terminal-nfc','bike-tower','basket-beats','vr-cycling','bike-land-trainer','financial-operations','outreach-automation','traffic-flow-analytics'];
const smoke=process.argv.includes('--smoke');
const workflowOnly=process.argv.includes('--workflows');
const facts={};
for(const locale of locales){
 const source=await readFile(new URL(`../content/locales/${locale}.ts`,import.meta.url),'utf8');
 const match=source.match(/const \w+: Dictionary = ([\s\S]*);\s*export default/);
 if(!match)throw Error(`Cannot read approved dictionary ${locale}`);
 facts[locale]=JSON.parse(match[1]).projects;
}
await mkdir(out,{recursive:true});
const records=[],failures=[];
const client=await connect('playwright');

function resultValue(result){
 const text=result.content?.filter(item=>item.type==='text').map(item=>item.text).join('\n')??'';
 const match=text.match(/### Result\s*\n([\s\S]*?)\n### /);
 return match?JSON.parse(match[1]):null;
}

// Serialized as inline MCP browser code, with inputs supplied as JSON literals.
function helpers(){
 const assert=(value,label)=>{if(!value)throw Error(label);};
 const normalize=value=>value.replace(/\s+/g,' ').trim();
 const unsafe=url=>/\/projects\/umniah-youthconnect\/.+\.(?:webp|png|jpe?g)/i.test(url)
  ||/\/projects\/glitzz-lab\/(?:thumbs\/)?screenshot-0[67]\./i.test(url)
  ||/\/projects\/the-terminal-nfc\/.+\.(?:webp|png|jpe?g)/i.test(url)
  ||/\/projects\/bike-tower\/(?:thumbs\/)?screenshot-\d+\./i.test(url);
 const ready=async(page,id)=>{
  await page.locator(`.signature-case.case-study--${id}`).waitFor({state:'visible',timeout:20000});
  await page.waitForFunction(()=>typeof window.__portfolioMotion==='function');
 };
 const motion=page=>page.evaluate(()=>window.__portfolioMotion());
 const clean=async(page,id)=>{
  const state=await motion(page),triggers=state.triggers;
  assert(triggers.every(trigger=>trigger.connected!==false),'Disconnected ScrollTrigger remains');
  assert(triggers.filter(trigger=>String(trigger.id).startsWith('case:')).every(trigger=>String(trigger.id).startsWith(`case:${id}:`)),'Previous case ScrollTrigger remains after route');
  return state;
 };
 const privacy=async(page,requests)=>{
  const urls=await page.locator('img').evaluateAll(images=>images.flatMap(img=>[img.getAttribute('src')??'',img.getAttribute('srcset')??'',img.currentSrc]));
  assert(!urls.some(unsafe),'Private original image is referenced in DOM');
  assert(!requests.some(unsafe),'Private original image was requested');
  return {images:urls.length/3,unsafeImageReferences:0,unsafeImageRequests:0};
 };
 const images=async(page)=>{
  const images=page.locator('.signature-case img');let checked=0;
  for(let i=0;i<await images.count();i++){
   const img=images.nth(i);
   if(!await img.isVisible())continue;
   await img.scrollIntoViewIfNeeded();
   await img.evaluate(img=>new Promise((resolve,reject)=>{
    if(img.complete){img.naturalWidth?resolve(true):reject(Error('Visible image failed'));return;}
    const timer=setTimeout(()=>reject(Error('Visible image load timeout')),12000);
    img.addEventListener('load',()=>{clearTimeout(timer);resolve(true);},{once:true});
    img.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Visible image failed'));},{once:true});
   }));checked++;
  }
  return checked;
 };
 const factsCheck=async(page,copy)=>{
  const fields=['title','short','overview','purpose','contribution','engineering','status'];
  const values=fields.map(key=>({key,value:copy[key]})).concat(['capabilities','considerations','technology'].flatMap(key=>copy[key].map((value,index)=>({key:`${key}[${index}]`,value}))));
  return page.locator('.signature-case').evaluate((root,values)=>{
   const normalize=value=>value.replace(/\s+/g,' ').trim();
   const nodes=[...root.querySelectorAll('h1,h2,h3,p,li,figcaption,.case-status')];
   const exposed=node=>{for(let el=node;el&&el!==root.parentElement;el=el.parentElement){const style=getComputedStyle(el);if(style.display==='none'||style.visibility==='hidden'||el.getAttribute('aria-hidden')==='true')return false;}return true;};
   const missing=values.filter(({value})=>!nodes.some(node=>normalize(node.innerText)===normalize(value)&&exposed(node))).map(({key})=>key);
   return {approvedFields:values.length,missing};
  },values);
 };
 return {assert,normalize,unsafe,ready,motion,clean,privacy,images,factsCheck};
}

async function layout(page,config){
 const {assert,unsafe,ready,motion,clean,privacy,images,factsCheck}=helpers();
 const {base,locale,width,height,ids,facts,out}=config;
 const errors=[],requests=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>requests.push(request.url()));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width,height});
 const results=[];
 for(const id of ids){
  requests.length=0;errors.length=0;
  try{
   await page.goto(`${base}/preview/${locale}/projects/${id}/`);
   await ready(page,id);
   assert(await page.locator('h1').count()===1,'Expected one h1');
   assert(await page.locator('h1').innerText()===facts[id].title,'Localized title differs');
   const direction=await page.evaluate(()=>document.documentElement.dir);
   assert(direction===(locale==='ar'?'rtl':'ltr'),'Incorrect document direction');
   const content=await factsCheck(page,facts[id]);
   assert(!content.missing.length,`Approved fields missing or altered: ${content.missing.join(', ')}`);
   const loadedImages=await images(page);
   const geometry=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,height:document.documentElement.scrollHeight,scrollY}));
   assert(Math.max(geometry.document,geometry.body)<=width+1,'Document overflow');
   const state=await clean(page,id);
   assert(state.triggers.length===0,'Reduced motion created ScrollTriggers');
   const media=await privacy(page,requests);
   assert(!errors.length,'Browser page error');
   results.push({id,locale,width,height,passed:true,direction,...content,loadedImages,geometry,...media,reducedMotionTriggers:state.triggers.length});
  }catch(error){
   const screenshot=`${out}/error-${locale}-${width}-${id}.png`;
   // Avoid capturing actual private pixels if a privacy assertion found exposure.
   const leaked=requests.some(unsafe)||(await page.locator('img').evaluateAll(images=>images.map(img=>img.currentSrc||img.getAttribute('src')||''))).some(unsafe);
   if(!leaked)await page.screenshot({path:screenshot,fullPage:false}).catch(()=>{});
   results.push({id,locale,width,height,passed:false,error:error.message,screenshot:leaked?null:screenshot,pageErrors:errors.map(()=> 'Browser page error')});
  }
 }
 return {kind:'layout',locale,width,height,reducedMotion:true,results};
}

async function workflow(page,config){
 const {assert,unsafe,ready,motion,clean,privacy,images}=helpers();
 const {base,out,ids}=config;
 const checks=[],errors=[],requests=[],missingTargetWarnings=[];
 const inspectConsole=(message,sourcePage)=>{if(message.type()==='warning'&&/GSAP target.*not found/i.test(message.text()))missingTargetWarnings.push({route:new URL(sourcePage.url()).pathname,classification:'Missing GSAP target'});};
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>requests.push(request.url()));
 page.on('console',message=>inspectConsole(message,page));
 const run=async(name,test)=>{try{checks.push({name,passed:true,...await test()});}catch(error){const screenshot=`${out}/error-flow-${name}.png`;const leaked=requests.some(unsafe)||(await page.locator('img').evaluateAll(images=>images.map(img=>img.currentSrc||img.getAttribute('src')||''))).some(unsafe);if(!leaked)await page.screenshot({path:screenshot}).catch(()=>{});checks.push({name,passed:false,error:error.message,screenshot:leaked?null:screenshot});}};
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await run('withheld-direct-media',async()=>{
  const paths=['/projects/umniah-youthconnect/cover.webp','/projects/umniah-youthconnect/card-cover.webp','/projects/umniah-youthconnect/thumbs/cover.webp','/projects/umniah-youthconnect/screenshot-10.webp','/projects/umniah-youthconnect/thumbs/screenshot-10.webp','/projects/glitzz-lab/screenshot-06.webp','/projects/glitzz-lab/screenshot-07.webp','/projects/glitzz-lab/thumbs/screenshot-06.webp'];
  const withheld=[];
  for(const path of paths){const response=await page.request.get(`${base}${path}`);withheld.push({path,status:response.status()});assert(response.status()===404,'Withheld media direct URL did not return 404');}
  return {withheld};
 });
 await run('cold-deep-fragment-refresh',async()=>{
  const context=await page.context().browser().newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  const cold=await context.newPage();const measurements=[],coldErrors=[],coldRequests=[];
  cold.on('pageerror',error=>coldErrors.push(error.message));cold.on('request',request=>coldRequests.push(request.url()));cold.on('console',message=>inspectConsole(message,cold));
  try{
   await cold.goto(`${base}/preview/en/projects/bike-tower/#case-engineering`);
   for(const phase of ['cold-direct','direct-reload']){
    if(phase==='direct-reload')await cold.reload();
    await ready(cold,'bike-tower');
    await cold.evaluate(()=>document.fonts.ready);
    await cold.waitForFunction(()=>{const target=document.querySelector('#case-engineering');return target&&scrollY>0&&target.getBoundingClientRect().top<=150;},{},{timeout:12000});
    const measurement=await cold.evaluate(()=>({hash:location.hash,scrollY,targetTop:document.querySelector('#case-engineering').getBoundingClientRect().top,fontsStatus:document.fonts.status}));
    assert(measurement.hash==='#case-engineering','Direct fragment was lost');assert(measurement.scrollY>0&&measurement.targetTop<=150,'Engineering deep fragment did not reach target');assert(measurement.fontsStatus==='loaded','Fragment measured before fonts loaded');
    await clean(cold,'bike-tower');await privacy(cold,coldRequests);measurements.push({phase,...measurement});
   }
   await cold.screenshot({path:`${out}/cold-fragment-engineering.png`});assert(!coldErrors.length,'Cold fragment browser page error');
   return {freshBrowserContext:true,measurements};
  }finally{await context.close();}
 });
 await run('opening-and-scroll',async()=>{
  await page.goto(`${base}/preview/en/projects/bike-tower/`);await ready(page,'bike-tower');
  const early=await page.evaluate(()=>({motion:window.__portfolioMotion(),mask:getComputedStyle(document.querySelector('.case-opening-visual')).clipPath,title:getComputedStyle(document.querySelector('.case-title-text')).transform}));
  assert(early.motion.timelines.some(t=>t.id==='case:bike-tower:opening'&&t.active&&t.progress<1),'No active case opening timeline');
  await page.screenshot({path:`${out}/motion-opening-early.png`});
  await page.waitForFunction(()=>document.querySelector('.signature-case')?.dataset.entrance==='complete');
  const settled=await page.locator('.case-opening-visual').evaluate(el=>getComputedStyle(el).clipPath);
  assert(early.mask!==settled,'Opening mask did not change');
  await page.screenshot({path:`${out}/motion-opening-settled.png`});
  const initial=await motion(page);
  const initialReading=initial.triggers.find(t=>t.id==='case:bike-tower:reading')?.progress;
  assert(initial.triggers.some(t=>t.id==='case:bike-tower:system'),'Missing engineering system trigger');
  assert(initial.triggers.some(t=>String(t.id).startsWith('case:bike-tower:evidence:')),'Missing evidence triggers');
  await page.locator('#case-engineering').scrollIntoViewIfNeeded();await page.waitForTimeout(900);
  const engineering=await motion(page);
  assert(engineering.triggers.find(t=>t.id==='case:bike-tower:system')?.progress>0,'Engineering trigger did not respond to native scroll');
  await page.locator('.case-build .case-evidence').last().scrollIntoViewIfNeeded();await page.waitForTimeout(1100);
  const evidence=await clean(page,'bike-tower');
  assert(evidence.triggers.some(t=>String(t.id).startsWith('case:bike-tower:evidence:')&&t.progress>0),'Evidence trigger did not respond');
  const reading=evidence.triggers.find(t=>t.id==='case:bike-tower:reading')?.progress;
  assert(reading>initialReading,'Reading progress did not increase');
  await page.screenshot({path:`${out}/motion-evidence.png`});
  await privacy(page,requests);
  return {earlyMask:early.mask,settledMask:settled,openingActive:true,initialReading,reading,engineeringTriggers:engineering.triggers.filter(t=>String(t.id).startsWith('case:')),evidenceTriggers:evidence.triggers.filter(t=>String(t.id).startsWith('case:'))};
 });
 await run('gallery-escape-focus',async()=>{
  await page.goto(`${base}/preview/en/projects/terminal-nfc/`);await ready(page,'terminal-nfc');await page.waitForTimeout(1500);
  const opener=page.locator('.case-evidence-button').first();await opener.scrollIntoViewIfNeeded();await opener.focus();await page.keyboard.press('Enter');
  await page.locator('.case-image-viewer[open]').waitFor();
  const image=page.locator('.case-image-viewer[open] img');await image.waitFor();
  await page.waitForFunction(()=>document.querySelector('.case-image-viewer[open] img')?.naturalWidth>0);
  const source=await image.getAttribute('src');assert(source.startsWith('/v2-media/terminal-'),'Gallery did not use redacted derivative');
  await privacy(page,requests);await page.screenshot({path:`${out}/gallery-redacted.png`});
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.case-image-viewer[open]'));
  assert(await opener.evaluate(el=>el===document.activeElement),'Gallery did not restore opener focus');
  return {source,escapeClosed:true,focusRestored:true};
 });
 await run('manual-neighbors-history-refresh',async()=>{
  await page.goto(`${base}/preview/en/projects/bike-tower/`);await ready(page,'bike-tower');await page.waitForTimeout(1500);
  const original=await page.url(),neighbor=page.locator('.case-neighbor.neighbor--1'),next=await neighbor.getAttribute('href');
  await neighbor.scrollIntoViewIfNeeded();await neighbor.click();await page.waitForURL(`**${next}`);await ready(page,'basket-beats');await page.waitForTimeout(1400);await clean(page,'basket-beats');
  assert(await page.locator('h1').evaluate(el=>el===document.activeElement),'Neighbor destination title lacks focus');
  await page.reload();await ready(page,'basket-beats');await page.waitForTimeout(1400);assert((await page.url()).endsWith(next),'Deep refresh lost case route');await clean(page,'basket-beats');
  await page.goBack();await ready(page,'bike-tower');await page.waitForTimeout(1400);await clean(page,'bike-tower');assert(await page.url()===original,'Back lost original case');
  await page.goForward();await ready(page,'basket-beats');await page.waitForTimeout(1400);await clean(page,'basket-beats');
  const previous=page.locator('.case-neighbor.neighbor--0');await previous.scrollIntoViewIfNeeded();await previous.click();await ready(page,'bike-tower');await page.waitForTimeout(1400);await clean(page,'bike-tower');
  return {manualNext:true,manualPrevious:true,directRefresh:true,backForward:true};
 });
 await run('language-and-rapid-navigation',async()=>{
  await page.goto(`${base}/preview/en/projects/terminal-nfc/`);await ready(page,'terminal-nfc');await page.waitForTimeout(1400);
  await page.locator('.language-select select').selectOption('ar');await page.waitForURL('**/preview/ar/projects/terminal-nfc/');await ready(page,'terminal-nfc');await page.waitForTimeout(1400);
  assert(await page.evaluate(()=>document.documentElement.dir)==='rtl','Language switch retained LTR');await clean(page,'terminal-nfc');
  await page.locator('.language-select select').selectOption('en');await page.waitForURL('**/preview/en/projects/terminal-nfc/');await ready(page,'terminal-nfc');await page.waitForTimeout(1400);
  // Dispatch existing user-click intents synchronously while the exit is active.
  await page.evaluate(()=>{
   document.querySelector('.case-neighbor.neighbor--0').click();
   document.querySelector('.case-neighbor.neighbor--1').click();
  });
  await page.waitForURL('**/preview/en/projects/bike-tower/');await ready(page,'bike-tower');await page.waitForTimeout(1700);await clean(page,'bike-tower');
  assert(await page.evaluate(()=>document.querySelector('.route-stage')?.inert)===false,'Latest route remains inert');
  assert(await page.locator('h1').evaluate(el=>el===document.activeElement),'Latest route heading lacks focus');
  return {languagePreservedCase:true,rtl:true,rapidLatestWins:true,route:await page.evaluate(()=>location.pathname)};
 });
 await run('all-case-normal-motion-cleanup',async()=>{
  const registry=[];
  // In-app navigation across all case routes exercises cleanup, unlike page.goto.
  await page.goto(`${base}/preview/en/projects/eventies/`);await ready(page,'eventies');await page.waitForTimeout(1400);
  for(let i=0;i<ids.length;i++){
   const id=ids[i];await ready(page,id);await page.waitForTimeout(1400);
   const state=await clean(page,id);assert(state.triggers.some(t=>t.id===`case:${id}:reading`),'Missing case reading trigger');registry.push({id,triggers:state.triggers.filter(t=>String(t.id).startsWith('case:')).length});
   await privacy(page,requests);
   if(i<ids.length-1){const next=page.locator('.case-neighbor.neighbor--1');await next.scrollIntoViewIfNeeded();await next.click();}
  }
  // Leaving a case removes case triggers; other profile/page motion is allowed.
  await page.locator('.case-back-to-projects').click();await page.locator('.filters').waitFor();await page.waitForTimeout(1400);
  const after=await motion(page);assert(!after.triggers.some(t=>String(t.id).startsWith('case:')),'Case triggers remain on Projects index');assert(after.triggers.every(t=>t.connected!==false),'Disconnected triggers remain on index');
  return {registry,indexCaseTriggers:0};
 });
 await run('mobile-normal-and-reduced-cleanup',async()=>{
  await page.setViewportSize({width:390,height:844});await page.goto(`${base}/preview/ar/projects/eventies/`);await ready(page,'eventies');await page.waitForTimeout(1400);
  const state=await clean(page,'eventies');assert(state.triggers.some(t=>t.id==='case:eventies:reading'),'Mobile motion missing');
  const loadedImages=await images(page);await privacy(page,requests);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mobile normal-motion overflow');
  await page.screenshot({path:`${out}/mobile-ar-normal.png`});
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(400);
  const reduced=await motion(page);assert(reduced.triggers.length===0,'Motion preference change leaves ScrollTriggers');
  await page.locator('.case-neighbor.neighbor--1').click();await ready(page,'glitzz-lab');
  assert((await motion(page)).triggers.length===0,'Reduced-motion route creates ScrollTriggers');
  return {mobileNormalTriggers:state.triggers.length,loadedImages,reducedMotionTriggers:0};
 });
 checks.push({name:'browser-errors',passed:errors.length===0&&missingTargetWarnings.length===0,count:errors.length,missingTargetWarnings,caseOpeningsWarningChecked:['bike-tower','umniah-youthconnect']});
 return {kind:'workflow',checks};
}

async function call(name,fn,config){
 const code=`async(page)=>{const helpers=${helpers.toString()};return await (${fn.toString()})(page,${JSON.stringify(config)});}`;
 const raw=await client.call('browser_run_code_unsafe',{code});
 await writeFile(`${out}/${name}-mcp.json`,JSON.stringify(raw,null,2));
 const value=raw.isError?null:resultValue(raw);
 if(raw.isError||!value){failures.push({name,error:'MCP call failed; inspect raw artifact'});records.push({name,passed:false});console.log(`${name}: MCP failure`);return;}
 records.push({name,...value});
 const items=value.results??value.checks??[];
 for(const item of items)if(!item.passed)failures.push({name,...item});
 console.log(`${name}: ${items.filter(item=>item.passed).length}/${items.length} passed`);
 await writeFile(`${out}/verification-progress.json`,JSON.stringify({base,records,failures},null,2));
}

try{
 if(!workflowOnly)for(const locale of smoke?['en']:locales)for(const width of smoke?[390]:[1440,390])await call(`layout-${locale}-${width}`,layout,{base,locale,width,height:width===1440?1000:844,ids:smoke?['bike-tower','terminal-nfc','umniah-youthconnect']:ids,facts:facts[locale],out});
 if(!smoke&&!workflowOnly)await call('layout-ar-320',layout,{base,locale:'ar',width:320,height:780,ids,facts:facts.ar,out});
 await call('workflows',workflow,{base,out,ids});
}finally{
 const summary={base,smoke,workflowOnly,verifiedAt:new Date().toISOString(),expectedLayouts:workflowOnly?0:smoke?3:121,layouts:records.filter(r=>r.kind==='layout').flatMap(r=>r.results),workflows:records.find(r=>r.kind==='workflow')?.checks??[],failures,passed:failures.length===0};
 await writeFile(`${out}/verification${workflowOnly?'-workflows-final':''}.json`,JSON.stringify(summary,null,2));
 await client.call('browser_close').catch(()=>{});client.close();
}
if(failures.length){console.error(`${failures.length} signature verification failures. See ${out}/verification${workflowOnly?'-workflows-final':''}.json`);process.exitCode=1;}
else console.log(`${workflowOnly?0:smoke?3:121} case/locale/viewport layouts and actual motion/navigation/privacy workflows passed.`);
