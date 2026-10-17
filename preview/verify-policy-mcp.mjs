import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright');let result;
try {
 await client.call('browser_navigate',{url:'http://127.0.0.1:4176/preview/en/'});
 result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
  const results=[];
  for(const policy of ['save-data','low-memory','no-webgl']) {
   const context=await page.context().browser().newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'});
   await context.addInitScript(policy=>{window.createdGL=0;const getContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...rest){if(type.includes('webgl')){window.createdGL++;if(policy==='no-webgl')return null;}return getContext.call(this,type,...rest);};if(policy==='save-data')Object.defineProperty(navigator,'connection',{value:{saveData:true}});if(policy==='low-memory')Object.defineProperty(navigator,'deviceMemory',{value:2});},policy);
   const test=await context.newPage();await test.goto('http://127.0.0.1:4176/preview/en/');await test.waitForFunction(()=>document.querySelector('.hero-field')?.dataset.motion==='low-power');await test.waitForTimeout(400);
   const sample=()=>test.locator('.hero-field canvas').evaluate(canvas=>({pixels:canvas.toDataURL(),frame:canvas.dataset.frame,createdGL:window.createdGL}));
   const before=await sample();await test.waitForTimeout(350);const after=await sample();if(before.pixels!==after.pixels||before.frame!==after.frame)throw new Error(policy+' keeps repainting');if(policy!=='no-webgl'&&after.createdGL!==0)throw new Error('Constrained device created WebGL');results.push({policy,static:true,createdGL:after.createdGL});await context.close();
  }
  await page.goto('http://127.0.0.1:4176/preview/en/');await page.waitForFunction(()=>document.querySelector('.hero-field')?.dataset.motion==='active');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>document.querySelector('.hero-field').dataset.motion==='hidden');const frame=await page.locator('.hero-field canvas').getAttribute('data-frame');await page.waitForTimeout(400);if(await page.locator('.hero-field canvas').getAttribute('data-frame')!==frame)throw new Error('Hidden page repaints');
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>document.querySelector('.hero-field').dataset.motion==='active');
  return {policies:results,hiddenPaused:true,visibleResumed:true};
 }`});if(result.isError)throw new Error(JSON.stringify(result));console.log('Save-Data, low-memory, unavailable WebGL and hidden-page lifecycle passed');
} finally {await writeFile('output/playwright/motion-lab/mcp-policy-verification.json',JSON.stringify(result,null,2));await client.call('browser_close');client.close();}
