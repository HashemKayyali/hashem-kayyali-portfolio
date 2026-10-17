import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright');const records=[];
const call=async(name,args)=>{const result=await client.call(name,args);records.push({name,result});if(result.isError)throw new Error(JSON.stringify(result));return result;};
try {
 await call('browser_navigate',{url:'http://127.0.0.1:4176/preview/'});
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  await call('browser_run_code_unsafe',{code:`async(page)=>{
   const context=await page.context().browser().newContext({viewport:{width:${width},height:${height}},reducedMotion:'no-preference',recordVideo:{dir:'output/playwright/motion-lab/recordings',size:{width:${width},height:${height}}}});
   const demo=await context.newPage();
   await demo.goto('http://127.0.0.1:4176/preview/?lang=en');await demo.locator('.hero h1').waitFor();await demo.waitForTimeout(2400);
   for(const section of ['projects','skills','contact']) {if(${width}<801)await demo.locator('.navigation-toggle').click();await demo.locator('nav a[href="/preview/en/'+section+'/"]').click();await demo.locator('main h1').waitFor();await demo.waitForTimeout(1400);await demo.evaluate(()=>scrollTo({top:450,behavior:'smooth'}));await demo.waitForTimeout(900);}
   for(const project of ['bike-tower','terminal-nfc','eventies']) {
    await demo.goto('http://127.0.0.1:4176/preview/?lang=en&project='+project);await demo.locator('.case-intro h1').waitFor();await demo.waitForTimeout(1400);
    for(const index of [0,1,2]) {await demo.locator('.story-step').nth(index).evaluate(el=>el.scrollIntoView({behavior:'smooth',block:'center'}));await demo.waitForTimeout(1800);}
   }
   const video=demo.video();await demo.close();await video.saveAs('output/playwright/motion-lab/${name}-motion.webm');await context.close();return {recording:'${name}-motion.webm',width:${width},height:${height}};
  }`});console.log(name+' motion recorded through Playwright MCP');
 }
} finally {await writeFile('output/playwright/motion-lab/mcp-motion-recording-session.json',JSON.stringify(records,null,2));await client.call('browser_close');client.close();}
