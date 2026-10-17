import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const client=await connect('playwright'),records=[];
try {
 const result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
  const assert=(state,message)=>{if(!state)throw Error(message);};const layouts=[];
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const locale of ['en','ar','de','fr','es'])for(const width of [320,390,768,1024,1440])for(const scene of ['','projects/']) {
   await page.setViewportSize({width,height:width<700?844:1000});await page.goto('http://127.0.0.1:4176/preview/'+locale+'/'+scene);await page.locator('h1').waitFor();
   await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),locale+':'+width+':'+scene+' overflow');
   assert(await page.locator('html').getAttribute('dir')===(locale==='ar'?'rtl':'ltr'),'Direction');layouts.push({locale,width,scene:scene||'home'});
  }
  for(const [name,width,height,locale] of [['desktop',1440,1000,'en'],['mobile',390,844,'en'],['rtl',390,844,'ar']]) {
   await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4176/preview/'+locale+'/');await page.locator('.hero').waitFor();await page.waitForTimeout(1900);
   await page.screenshot({path:'output/playwright/motion-lab/overhaul-'+name+'-home.png'});
   for(const id of width===1440?['bike-tower','terminal-nfc','eventies']:['bike-tower']) {
    const project=page.locator('.featured-project[data-project="'+id+'"]');await project.scrollIntoViewIfNeeded();await page.waitForTimeout(1400);
    await page.screenshot({path:'output/playwright/motion-lab/overhaul-'+name+'-'+(id==='bike-tower'?'bike':id==='terminal-nfc'?'terminal':id)+'.png'});
   }
  }
  return {normalMotionLayouts:layouts.length,layouts,screenshots:8};
 }`});if(result.isError)throw Error(JSON.stringify(result));records.push(result);console.log('50 normal-motion Home/Projects layouts and final English/Arabic screenshots passed');
}finally{await writeFile('output/playwright/motion-lab/overhaul-final-capture.json',JSON.stringify(records,null,2));await client.call('browser_close');client.close();}
