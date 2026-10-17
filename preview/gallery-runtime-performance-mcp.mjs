import {connect} from './mcp-client.mjs';import {writeFile} from 'node:fs/promises';
const c=await connect('devtools'),results=[];
const call=async(name,args)=>{const r=await c.call(name,args);if(r.isError)throw Error(JSON.stringify(r));return r;};
try{
 await call('new_page',{url:'http://127.0.0.1:4176/preview/en/projects/'});const listing=await call('list_pages',{});const pageId=Number(listing.content.filter(x=>x.type==='text').map(x=>x.text).join('\n').match(/(?:^|\n)(\d+):.*4176/)?.[1]);
 for(const [device,viewport,cpu] of [['desktop','1440x1000x1',1],['mobile','390x844x1,mobile,touch',4]]){
 await call('emulate',{pageId,viewport,cpuThrottlingRate:cpu});await call('navigate_page',{pageId,type:'url',url:'http://127.0.0.1:4176/preview/en/projects/'});
 const r=await call('evaluate_script',{pageId,waitForStableDom:false,function:`async()=>{
 await document.fonts.ready;await new Promise(r=>setTimeout(r,1400));
 const phases=[],resources=()=>performance.getEntriesByType('resource').filter(e=>e.initiatorType==='img').map(e=>({name:e.name.split('/').pop(),bytes:e.encodedBodySize}));
 const sample=async(name,run)=>{const frames=[],longTasks=[];let alive=true,last=0;const tick=time=>{if(last)frames.push(time-last);last=time;if(alive)requestAnimationFrame(tick);};requestAnimationFrame(tick);const po=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration}))));po.observe({type:'longtask'});const start=performance.now();await run();alive=false;po.disconnect();const sorted=frames.slice().sort((a,b)=>a-b);phases.push({name,duration:performance.now()-start,frames:frames.length,median:sorted[Math.floor(sorted.length/2)],p95:sorted[Math.floor(sorted.length*.95)],max:Math.max(...frames),over50:frames.filter(f=>f>50).length,longTasks,motion:window.__portfolioMotion(),clones:document.querySelectorAll('.project-transit-image').length,hiddenTargets:document.querySelectorAll('.project-transit-target').length});};
 const initial=resources();await sample('controlled native scroll through all exhibits',async()=>{for(let step=0;step<20;step++){scrollBy({top:${device==='desktop'?330:400},behavior:'instant'});await new Promise(r=>setTimeout(r,260));}});
 const afterScroll=resources();const field=document.querySelector('.gallery-brand-field canvas');const frame=Number(field?.dataset.frame??0);await sample('offscreen gallery idle',()=>new Promise(r=>setTimeout(r,2000)));const offscreenPaints=Number(field?.dataset.frame??0)-frame;
 const card=document.querySelector('[data-gallery-project="glitzz-lab"]');card.scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>setTimeout(r,800));
 await sample('shared image opening and return',async()=>{card.dispatchEvent(new PointerEvent('pointerover',{bubbles:true}));await new Promise(r=>setTimeout(r,150));card.click();await new Promise(r=>setTimeout(r,1800));document.querySelector('.back-link').click();await new Promise(r=>setTimeout(r,1700));});
 return {device:'${device}',cpu:${cpu},viewport:[innerWidth,innerHeight],initial,afterScroll,afterTransition:resources(),offscreenPaints,phases};
 }`});results.push({device,result:r});await writeFile('output/playwright/projects-upgrade/runtime-performance-mcp.json',JSON.stringify(results,null,2));console.log(device+': scroll, offscreen idle and real shared-transition performance sampled');
 }
}finally{c.close();}
