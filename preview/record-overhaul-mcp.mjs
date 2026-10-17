import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright'),records=[];
try {
 for(const [name,width,height,scene] of [['home',1440,900,'home'],['featured',1440,900,'featured'],['navigation',1440,900,'navigation'],['experience-existing',1440,900,'experience'],['mobile',390,844,'mobile']]) {
  const result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
   const context=await page.context().browser().newContext({viewport:{width:${width},height:${height}},reducedMotion:'no-preference',recordVideo:{dir:'output/playwright/motion-lab/recordings',size:{width:${width},height:${height}}}});
   const demo=await context.newPage();
   await demo.goto('http://127.0.0.1:4176/preview/en/'+('${scene}'==='experience'?'experience/':''));await demo.locator('h1').waitFor();await demo.waitForTimeout(2200);
   const samples=[await demo.evaluate(()=>window.__portfolioMotion())];
   if('${scene}'==='home')await demo.waitForTimeout(1800);
   if(['featured','mobile'].includes('${scene}')) {
    for(let step=0;step<18;step++){await demo.mouse.wheel(0,180);await demo.waitForTimeout(420);if(step%5===0){await demo.waitForTimeout(700);samples.push(await demo.evaluate(()=>window.__portfolioMotion()));}}
   }
   if(['navigation','mobile'].includes('${scene}')) {
    for(const path of ['projects','contact','']) {
     if(${width}<801)await demo.locator('.navigation-toggle').click();
     await demo.locator('.site-header nav a[href="/preview/en/'+(path?path+'/':'')+'"]').click();
     await demo.waitForURL('**/preview/en/'+(path?path+'/':''));await demo.waitForTimeout(1700);
     samples.push(await demo.evaluate(()=>window.__portfolioMotion()));
    }
   }
   if('${scene}'==='experience')for(let step=0;step<11;step++){await demo.mouse.wheel(0,120);await demo.waitForTimeout(500);}
   await demo.waitForTimeout(700);
   const video=demo.video();await demo.close();await video.saveAs('output/playwright/motion-lab/overhaul-${name}.webm');await context.close();return {recording:'overhaul-${name}.webm',width:${width},height:${height},motion:'no-preference',samples};
  }`});
  records.push({name,result});if(result.isError)throw Error(JSON.stringify(result));
  console.log(name+': actual normal-motion browser recording saved');
 }
}finally{await writeFile('output/playwright/motion-lab/overhaul-recordings.json',JSON.stringify(records,null,2));await client.call('browser_close');client.close();}
