import {connect} from './mcp-client.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const phase=process.argv[2]??'before',device=process.argv[3]??'desktop',rate=device==='throttled'?4:1;
const out='output/playwright/home-rescue',c=await connect('devtools');await mkdir(out,{recursive:true});
const probe=`window.homeProbe={frames:[],tasks:[],events:[]};new PerformanceObserver(l=>homeProbe.tasks.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});let previous=0;requestAnimationFrame(function frame(t){const p=document.querySelector('.portrait-reveal'),m=window.__portfolioMotion?.();if(t<7000){homeProbe.frames.push({t,gap:previous?t-previous:0,clip:p?.style.clipPath,portraitProgress:m?.timelines.find(t=>t.id==='home:portrait:reveal')?.progress,progress:m?.timelines.find(t=>t.id==='home:hero:entrance')?.progress});previous=t;requestAnimationFrame(frame)}});document.addEventListener('load',e=>{if(e.target instanceof HTMLImageElement)homeProbe.events.push({t:performance.now(),image:e.target.src.split('/').pop()})},true);document.fonts.ready.then(()=>homeProbe.events.push({t:performance.now(),fonts:true}));`;
try{
const opened=await c.call('new_page',{url:'about:blank'});await writeFile(out+'/'+phase+'-'+device+'-open.json',JSON.stringify(opened));
const listed=await c.call('list_pages',{});const str=listed.content.filter(e=>e.type==='text').map(e=>e.text).join('\n');const id=Number(str.match(/(\d+): about:blank.*selected/)?.[1]??str.match(/(\d+): about:blank/)?.[1]);if(!id)throw Error(str);
await c.call('emulate',{pageId:id,viewport:device==='desktop'?'1440x1000x1':'390x844x1,mobile,touch',cpuThrottlingRate:rate});
for(const temperature of device==='desktop'?['cold','warm']:['cold']){
const prefix=out+'/'+phase+'-'+device+'-'+temperature;
await c.call('performance_start_trace',{pageId:id,reload:false,autoStop:false,filePath:prefix+'-trace.json.gz'});
await c.call('navigate_page',{pageId:id,type:'url',url:'http://127.0.0.1:4176/preview/en/',initScript:probe});
const sample=await c.call('evaluate_script',{pageId:id,waitForStableDom:false,function:'async()=>{await new Promise(r=>setTimeout(r,7000));return {probe:homeProbe,motion:window.__portfolioMotion(),resources:performance.getEntriesByType("resource").map(e=>({name:e.name.split("/").pop(),start:e.startTime,end:e.responseEnd})),navigation:performance.getEntriesByType("navigation")[0].toJSON()}}'});
await writeFile(prefix+'-probe.json',JSON.stringify(sample,null,2));
const trace=await c.call('performance_stop_trace',{pageId:id,filePath:prefix+'-trace.json.gz'});await writeFile(prefix+'-mcp.json',JSON.stringify(trace,null,2));console.log(phase,device,temperature,'trace saved');
if(phase==='final')for(const insightName of ['ForcedReflow','LCPBreakdown']){const insight=await c.call('performance_analyze_insight',{pageId:id,insightSetId:'NAVIGATION_0',insightName});await writeFile(prefix+'-'+insightName+'.json',JSON.stringify(insight,null,2));}
}
if(device==='desktop'&&phase==='final'){
 const prefix=out+'/'+phase+'-desktop-scroll';
 await c.call('performance_start_trace',{pageId:id,reload:false,autoStop:false,filePath:prefix+'-trace.json.gz'});
 const sample=await c.call('evaluate_script',{pageId:id,waitForStableDom:false,function:`async()=>{const frames=[],tasks=[],fieldsBefore=[...document.querySelectorAll('.home-silk canvas')].map(c=>c.dataset.frame);const observer=new PerformanceObserver(l=>tasks.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration}))));observer.observe({type:'longtask'});const start=performance.now();let last=0;requestAnimationFrame(function frame(t){if(t-start<9000){frames.push({t,gap:last?t-last:0});last=t;requestAnimationFrame(frame)}});for(let i=0;i<30;i++){scrollBy({top:240,behavior:'instant'});await new Promise(r=>setTimeout(r,250))}await new Promise(r=>setTimeout(r,500));observer.disconnect();return {frames,tasks,fieldsBefore,fieldsAfter:[...document.querySelectorAll('.home-silk canvas')].map(c=>c.dataset.frame),motion:window.__portfolioMotion()}}`});
 await writeFile(prefix+'-probe.json',JSON.stringify(sample,null,2));const trace=await c.call('performance_stop_trace',{pageId:id,filePath:prefix+'-trace.json.gz'});await writeFile(prefix+'-mcp.json',JSON.stringify(trace,null,2));console.log('final desktop active-fluid scroll trace saved');
}
}finally{c.close()}
