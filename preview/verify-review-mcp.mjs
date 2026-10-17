import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright');let result;
try {
 await client.call('browser_navigate',{url:'http://127.0.0.1:5176/preview/motion-lab.html'});
 result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
  const assert=(state,message)=>{if(!state)throw new Error(message);};
  await page.locator('iframe').waitFor();const frame=page.frames().find(frame=>frame!==page.mainFrame());await frame.locator('.hero').waitFor();
  await page.locator('#scene').selectOption('skills');await frame.locator('.skill-matrix').waitFor();assert(frame.url().includes('/preview/en/skills/'),'Motion Lab scene routing');
  await page.locator('#locale').selectOption('ar');await frame.locator('.skill-matrix').waitFor();await frame.waitForFunction(()=>document.documentElement.lang==='ar');assert(await frame.locator('html').getAttribute('dir')==='rtl','Lab RTL');
  await page.locator('#scene').selectOption('home');await frame.locator('.hero').waitFor();await frame.waitForFunction(()=>document.querySelector('.hero-field')?.dataset.motion==='active');await page.locator('#pause').click();await frame.waitForFunction(()=>document.querySelector('.hero-field').dataset.motion==='hidden');await page.locator('#pause').click();await frame.waitForFunction(()=>document.querySelector('.hero-field').dataset.motion==='active');
  assert(await page.locator('video').count()===2,'Missing motion recordings');
  for(const source of await page.locator('video').evaluateAll(els=>els.map(el=>el.src))){const response=await page.request.head(source);assert(response.ok(),'Missing recording '+source);}
  await page.goto('http://127.0.0.1:5176/output/playwright/motion-lab/report.html');await page.locator('h1').waitFor();
  await page.evaluate(async()=>{document.querySelectorAll('img').forEach(img=>img.loading='eager');await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});assert(await page.locator('img').count()===6,'Missing page previews');assert(await page.evaluate(()=>[...document.images].every(image=>image.naturalWidth>0)),'Broken review screenshot');
  await page.goto('http://127.0.0.1:4176/preview/en/projects/bike-tower/');await page.locator('.back-link').waitFor();const popupPromise=page.context().waitForEvent('page');await page.locator('.back-link').click({modifiers:['Control']});const popup=await popupPromise;await popup.locator('.filters').waitFor();assert(page.url().includes('/bike-tower/'),'Modified click intercepted');await popup.close();await page.locator('.back-link').click();await page.locator('.filters').waitFor();assert(page.url().includes('/projects/#projects'),'Case back navigation');
  return {labScenes:true,labRTL:true,pauseResume:true,recordings:2,reportScreenshots:6,caseBack:true,modifiedClick:true};
 }`});if(result.isError)throw new Error(JSON.stringify(result));console.log('Motion Lab, review media, case back links and modified clicks passed');
} finally {await writeFile('output/playwright/motion-lab/review-tool-verification.json',JSON.stringify(result,null,2));await client.call('browser_close');client.close();}
