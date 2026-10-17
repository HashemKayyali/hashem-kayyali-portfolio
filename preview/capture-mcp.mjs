import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const server=process.argv[2]??'4176';
const client=await connect('playwright');const records=[];
const call=async(name,args)=>{const result=await client.call(name,args);records.push({name,args,result});if(result.isError)throw new Error(JSON.stringify(result));return result;};
try {
 await call('browser_emulate_media',{reducedMotion:'reduce'});
 for(const [size,width,height,locale] of [['desktop',1440,1000,'en'],['mobile',390,844,'en'],['arabic-desktop',1440,1000,'ar'],['arabic-mobile',390,844,'ar']]) {
  await call('browser_resize',{width,height});
  for(const project of ['hero','projects','skills','contact','about','experience','bike-tower','terminal-nfc','eventies']) {
   const isCase=['bike-tower','terminal-nfc','eventies'].includes(project);const url=`http://127.0.0.1:${server}/preview/${locale}/${project==='hero'?'':isCase?`projects/${project}/`:`${project}/`}`;
   await call('browser_navigate',{url});
   await call('browser_run_code_unsafe',{code:`async(page)=>{await page.locator('h1').waitFor();await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(img=>img.loading='eager');await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});return {title:await page.title(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),images:await page.locator('img').count()};}`});
   await call('browser_take_screenshot',{filename:`output/playwright/motion-lab/${size}-${project}.png`,scale:'css'});
   if(isCase) {
    await call('browser_run_code_unsafe',{code:`async(page)=>{await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);document.querySelector('.site-header').style.position='static';});const box=await page.locator('.engineering-story').boundingBox();await page.screenshot({path:'output/playwright/motion-lab/${size}-${project}-story.png',fullPage:true,clip:{x:0,y:box.y,width:${width},height:box.height}});await page.screenshot({path:'output/playwright/motion-lab/${size}-${project}-full.png',fullPage:true});await page.evaluate(()=>document.querySelector('.site-header').style.position='');return {story:box.height};}`});
   }
   if(!isCase) await call('browser_run_code_unsafe',{code:`async(page)=>{await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});await page.screenshot({path:'output/playwright/motion-lab/${size}-${project}-full.png',fullPage:true});}`});
   console.log(`${size}/${project} captured with Playwright MCP`);
  }
 }
 const consoleResult=await call('browser_console_messages',{level:'error',all:true});
 await writeFile('output/playwright/motion-lab/mcp-console.json',JSON.stringify(consoleResult,null,2));
} finally {await writeFile('output/playwright/motion-lab/playwright-capture-session.json',JSON.stringify(records,null,2));await client.call('browser_close');client.close();}
