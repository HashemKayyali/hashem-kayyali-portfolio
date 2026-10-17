import {connect} from './mcp-client.mjs';import {mkdir,writeFile} from 'node:fs/promises';
const out='output/playwright/signature';await mkdir(out,{recursive:true});const c=await connect('playwright'),records=[];
try{for(const [locale,width,height] of [['en',1440,1000],['ar',390,844]]){
const result=await c.call('browser_run_code_unsafe',{code:`async(page)=>{
 const context=await page.context().browser().newContext({viewport:{width:${width},height:${height}},reducedMotion:'no-preference',recordVideo:{dir:'${out}/raw',size:{width:${width},height:${height}}}}),demo=await context.newPage(),proof=[];
 for(const id of ['basket-beats','glitzz-lab','umniah-youthconnect','vr-cycling','bike-land-trainer','financial-operations','outreach-automation','traffic-flow-analytics']){
  await demo.goto('http://127.0.0.1:4176/preview/${locale}/projects/'+id+'/');await demo.locator('.signature-case').waitFor();await demo.waitForTimeout(1250);await demo.screenshot({path:'${out}/remaining-'+id+'-${locale}-${width}.png'});
  for(let i=0;i<2;i++){await demo.mouse.wheel(0,220);await demo.waitForTimeout(400);}proof.push({id,path:await demo.evaluate(()=>location.pathname),motion:await demo.evaluate(()=>window.__portfolioMotion()),overflow:await demo.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)});
 }
 const video=demo.video();await demo.close();await video.saveAs('${out}/remaining-cases-${locale}-${width}.webm');await context.close();return proof;
 }`});records.push(result);if(result.isError)throw Error(JSON.stringify(result));console.log(`${locale}/${width} eight case entrances captured`);
}}finally{await writeFile(`${out}/remaining-cases-proof.json`,JSON.stringify(records,null,2));await c.call('browser_close');c.close();}
