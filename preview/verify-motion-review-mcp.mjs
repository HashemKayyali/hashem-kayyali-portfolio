import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright'),records=[];
try {
 for(const test of ['rtl','filter']) {
 const result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
 const assert=(value,message)=>{if(!value)throw Error(message);};
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:1000});
 if('${test}'==='rtl') {
  await page.goto('http://127.0.0.1:4176/preview/en/');await page.locator('h1').waitFor();await page.waitForTimeout(1600);
  await page.locator('select').selectOption('ar');await page.waitForURL('**/preview/ar/');
  const mask=await page.locator('.portrait-reveal').evaluate(el=>getComputedStyle(el).clipPath);
  const values=mask.match(/inset\\(([^)]+)/)[1].replaceAll('%','').trim().split(/\\s+/).map(Number);
  assert(values[1]===0&&values[3]>0,'Arabic portrait reveals from previous LTR direction: '+mask);
  await page.waitForTimeout(1600);await page.locator('select').selectOption('en');await page.waitForURL('**/preview/en/');
  const reverse=await page.locator('.portrait-reveal').evaluate(el=>getComputedStyle(el).clipPath);
  const back=reverse.match(/inset\\(([^)]+)/)[1].replaceAll('%','').trim().split(/\\s+/).map(Number);
  assert(back[1]>0&&back[3]===0,'English portrait retains RTL direction: '+reverse);
  return {mask,reverse};
 }
 await page.goto('http://127.0.0.1:4176/preview/en/projects/');await page.locator('h1').waitFor();await page.waitForTimeout(1400);
 await page.locator('.featured-project[data-project="eventies"]').scrollIntoViewIfNeeded();await page.waitForTimeout(1600);
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(300);await page.locator('.filters button').nth(1).click();await page.waitForTimeout(400);
 const geometry=await page.evaluate(()=>{const rect=document.querySelector('.featured-project[data-project="eventies"]').getBoundingClientRect();return {expected:Math.round(rect.top+scrollY-innerHeight*.88),actual:window.__portfolioMotion().triggers.find(trigger=>trigger.id?.includes('eventies')&&trigger.id.endsWith(':reveal')).start};});
 assert(Math.abs(geometry.expected-geometry.actual)<3,'Filter retained outdated trigger position: '+JSON.stringify(geometry));return geometry;
 }`});records.push({test,result});console.log(test,result.isError?'FAILED':'PASS');
 }
 await writeFile('output/playwright/motion-lab/overhaul-review-regressions.json',JSON.stringify(records,null,2));
 if(records.some(record=>record.result.isError))throw Error(JSON.stringify(records));
}finally{await client.call('browser_close');client.close();}
