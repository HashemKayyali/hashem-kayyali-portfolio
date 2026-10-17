import {connect} from './mcp-client.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const phase=process.argv[2]??'after', subset=process.argv[3];
const dir='output/playwright/signature';await mkdir(dir,{recursive:true});
const client=await connect('playwright'),records=[];
const scenes=[['home','en',1440,1000],['bike-tower','en',1440,1000],['terminal-nfc','en',1440,1000],['eventies','en',1440,1000],['bike-tower','en',390,844],['terminal-nfc','ar',390,844],['eventies','ar',1440,1000]];
try{for(const [id,locale,width,height] of scenes){
 const name=`${id}-${locale}-${width}`;if(subset&&!name.startsWith(subset))continue;
 const result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
 const context=await page.context().browser().newContext({viewport:{width:${width},height:${height}},reducedMotion:'no-preference',recordVideo:{dir:'${dir}/raw',size:{width:${width},height:${height}}}});
 const demo=await context.newPage();const errors=[];demo.on('pageerror',error=>errors.push(error.message));
 await demo.goto('http://127.0.0.1:4176/preview/${locale}/${id==='home'?'':`projects/${id}/`}');await demo.locator('h1').waitFor();await demo.waitForTimeout(1800);
 await demo.screenshot({path:'${dir}/${phase}-${name}-opening.png'});
 const screenshots=[];
 ${id==='home'?`for(let n=0;n<4;n++){await demo.mouse.wheel(0,240);await demo.waitForTimeout(350);}`:`let shot=0;const steps=demo.locator('${phase==='before'?'.case-cover,.engineering-story,.case-body,.gallery,.case-bottom':'.case-chapter,.case-closing'}');for(let i=0;i<await steps.count();i++){await steps.nth(i).scrollIntoViewIfNeeded();await demo.waitForTimeout(600);await demo.screenshot({path:'${dir}/${phase}-${name}-chapter-'+(++shot)+'.png'});screenshots.push(shot);await demo.mouse.wheel(0,260);await demo.waitForTimeout(500);}const back=demo.locator('.case-back-to-projects,.case-bottom a').first();if(await back.count()){await back.click();await demo.waitForTimeout(1000);}`}
 const proof=await demo.evaluate(()=>({path:location.pathname,motion:window.__portfolioMotion?.(),overflow:document.documentElement.scrollWidth>innerWidth+1}));
 const video=demo.video();await demo.close();await video.saveAs('${dir}/${phase}-${name}.webm');await context.close();return {name:'${name}',screenshots,errors,normalMotion:true,...proof};
 }`});records.push({name,result});if(result.isError)throw Error(JSON.stringify(result));console.log(`${phase}/${name} captured`);
}}finally{await writeFile(`${dir}/${phase}-${subset??'all'}-captures.json`,JSON.stringify(records,null,2));await client.call('browser_close');client.close();}
