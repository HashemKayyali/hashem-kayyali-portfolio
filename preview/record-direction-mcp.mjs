import {connect} from './mcp-client.mjs';
import {writeFile,readFile} from 'node:fs/promises';
const phase=process.argv[2]??'before';
const selection=process.argv[3];
const client=await connect('playwright'),records=selection?JSON.parse(await readFile('output/playwright/motion-lab/direction-'+phase+'-recordings.json','utf8')).filter(record=>!record.name.startsWith(selection)):[];
try {
 for(const [name,locale,width,height,scene] of [['hero-desktop','en',1440,1000,'hero'],['hero-mobile','en',390,844,'hero'],['hero-rtl','ar',390,844,'hero'],['projects','en',1440,1000,'projects'],['projects-mobile','en',390,844,'projects'],['contact-rtl','ar',1440,1000,'contact'],['contact-rtl-mobile','ar',390,844,'contact']]) {
  if(selection&&!name.startsWith(selection))continue;
  const result=await client.call('browser_run_code_unsafe',{code:`async(page)=>{
   const context=await page.context().browser().newContext({viewport:{width:${width},height:${height}},reducedMotion:'no-preference',recordVideo:{dir:'output/playwright/motion-lab/recordings',size:{width:${width},height:${height}}}});
   await context.addInitScript(()=>{window.opening={paints:[],rootAt:null,heroAt:null};new PerformanceObserver(list=>window.opening.paints.push(...list.getEntries().map(entry=>({name:entry.name,ms:entry.startTime})))).observe({type:'paint',buffered:true});const observe=new MutationObserver(()=>{if(!window.opening.rootAt&&document.querySelector('#root')?.children.length)window.opening.rootAt=performance.now();if(!window.opening.heroAt&&document.querySelector('.hero'))window.opening.heroAt=performance.now();});observe.observe(document,{subtree:true,childList:true});});
   const start=Date.now(),demo=await context.newPage(),created=Date.now();const navigationStart=Date.now();
   await demo.goto('http://127.0.0.1:4176/preview/${locale}/'+('${scene}'==='contact'?'contact/':''));await demo.locator('h1').waitFor();await demo.waitForTimeout(2400);
   await demo.screenshot({path:'output/playwright/motion-lab/direction-${phase}-${name}.png'});
   if('${scene}'==='projects') {
    await demo.locator('.home-projects').scrollIntoViewIfNeeded();await demo.waitForTimeout(1000);
    for(const id of ['bike-tower','terminal-nfc','eventies']) {await demo.locator('.featured-project[data-project="'+id+'"]').scrollIntoViewIfNeeded();await demo.waitForTimeout(1500);await demo.screenshot({path:'output/playwright/motion-lab/direction-${phase}-'+id+'.png'});for(let step=0;step<4;step++){await demo.mouse.wheel(0,100);await demo.waitForTimeout(300);}}
   }
   if('${scene}'==='contact'){await demo.locator('#contact-name').fill('هاشم');await demo.locator('#contact-email').fill('review@example.com');await demo.locator('#contact-message').fill('معاينة محلية لتنسيق صفحة التواصل.');await demo.locator('button[type="submit"]').click();await demo.locator('.prepared-draft').waitFor();await demo.waitForTimeout(900);}
   const proof=await demo.evaluate(()=>({opening:window.opening,motion:window.__portfolioMotion(),path:location.pathname}));const video=demo.video();await demo.close();await video.saveAs('output/playwright/motion-lab/direction-${phase}-${name}.webm');await context.close();return {name:'${name}',motion:'no-preference',pageCreationMs:created-start,prerollBeforeNavigationMs:navigationStart-start,...proof};
  }`});records.push({name,result});if(result.isError)throw Error(JSON.stringify(result));console.log(phase+'/'+name+': normal-motion browser video, screenshot and opening timestamps saved');
 }
}finally{await writeFile('output/playwright/motion-lab/direction-'+phase+'-recordings.json',JSON.stringify(records,null,2));await client.call('browser_close');client.close();}
