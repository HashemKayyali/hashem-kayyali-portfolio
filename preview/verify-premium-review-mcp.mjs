import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright');let result;
try {
 result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
  const assert=(state,message)=>{if(!state)throw Error(message);};const requests=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('http://127.0.0.1:5176/preview/rive-demo.html');const fallback=page.locator('.connected-signature');await fallback.waitFor();
  assert(await fallback.getAttribute('data-renderer')==='static-fallback','False Rive completion');await fallback.focus();await page.keyboard.press('Enter');assert(await fallback.getAttribute('aria-pressed')==='true','Keyboard fallback');await page.keyboard.press('Space');assert(await fallback.getAttribute('aria-pressed')==='false','Keyboard toggle');assert(!requests.some(url=>/\\.riv(?:$|\\?)|\\.wasm/.test(url)),'Unnecessary Rive download');
  await page.goto('http://127.0.0.1:5176/preview/premium-review.html');await page.locator('video').first().waitFor();assert(await page.locator('video').count()===5,'Five videos missing');
  const videos=await page.locator('video').evaluateAll(async elements=>{
   const proof=[];for(const video of elements){video.preload='auto';video.load();await new Promise((resolve,reject)=>{video.addEventListener('loadedmetadata',resolve,{once:true});video.addEventListener('error',reject,{once:true});});proof.push({src:video.currentSrc,duration:video.duration,width:video.videoWidth,height:video.videoHeight});}return proof;
  });assert(videos.every(video=>video.duration>3&&video.width>0),'Invalid browser recording');
  const hero=page.locator('video').first();for(const [name,time] of [['early',.45],['settled',2.8]]){await hero.evaluate((video,time)=>new Promise(resolve=>{video.addEventListener('seeked',resolve,{once:true});video.currentTime=time;}),time);await hero.screenshot({path:'output/playwright/motion-lab/overhaul-video-'+name+'.png'});}
  await page.evaluate(async()=>{document.querySelectorAll('img').forEach(img=>img.loading='eager');await Promise.all([...document.images].map(img=>img.decode()));});
  const frame=page.frames().find(frame=>frame.url().endsWith('/preview/en/'));await frame.locator('.hero').waitFor();await page.locator('#inspect').click();assert((await page.locator('#registry').innerText()).includes('hero:depth'),'Review registry');
  await page.locator('#locale').selectOption('ar');await frame.waitForURL('**/preview/ar/');await frame.locator('.hero').waitFor();await page.locator('#size').selectOption('320');await frame.locator('.hero').waitFor();await frame.waitForFunction(()=>document.documentElement.dir==='rtl'&&innerWidth===320);assert(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Review mobile RTL');
  return {videos,keyboardFallback:true,noRiveRequests:true,liveRegistry:true,reviewRTL:true};
 }`});if(result.isError)throw Error(JSON.stringify(result));console.log('Five recordings decode; live review, 320px RTL and keyboard Rive fallback passed');
}finally{await writeFile('output/playwright/motion-lab/overhaul-review-tools.json',JSON.stringify(result,null,2));await client.call('browser_close');client.close();}
