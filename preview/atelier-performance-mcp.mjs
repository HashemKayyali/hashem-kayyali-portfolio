import {connectDevtools} from './design-intelligence-mcp.mjs';
import {writeFile,mkdir} from 'node:fs/promises';

const out='output/playwright/atelier',label=process.argv[3]??'atelier-performance',client=await connectDevtools();
const probe=`window.homeProbe={frames:[],tasks:[],lcp:[],layout:[]};new PerformanceObserver(l=>homeProbe.tasks.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});new PerformanceObserver(l=>homeProbe.lcp.push(...l.getEntries().map(e=>({start:e.startTime,size:e.size})))).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>homeProbe.layout.push(...l.getEntries().filter(e=>!e.hadRecentInput).map(e=>e.value))).observe({type:'layout-shift',buffered:true});let last=0;requestAnimationFrame(function tick(t){if(t<6500){homeProbe.frames.push({t,gap:last?t-last:0,state:document.querySelector('[data-home-intro]')?.dataset.intro});last=t;requestAnimationFrame(tick)}});`;
await mkdir(out,{recursive:true});
try{
 const opened=await client.call('new_page',{url:'about:blank'}),str=opened.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
 const id=Number(str.match(/(\d+): about:blank.*selected/)?.[1]??str.match(/(\d+): about:blank/)?.[1]);if(!id)throw Error(str);
 for(const mode of process.argv[2]&&process.argv[2]!=='all'?[process.argv[2]]:['laptop','mobile','cpu4']){
  await client.call('emulate',{pageId:id,viewport:mode==='mobile'?'390x844x1,mobile,touch':'1366x768x1',cpuThrottlingRate:mode==='cpu4'?4:1});
  await client.call('performance_start_trace',{pageId:id,reload:false,autoStop:false});
  await client.call('navigate_page',{pageId:id,type:'url',url:'http://127.0.0.1:4176/preview/en/',initScript:probe});
  const result=await client.call('evaluate_script',{pageId:id,waitForStableDom:false,function:'async()=>{await new Promise(r=>setTimeout(r,6000));return {probe:homeProbe,hero:document.querySelector("[data-home-intro]").dataset,motion:window.__portfolioMotion?.(),navigation:performance.getEntriesByType("navigation")[0].toJSON()};}'});
  await writeFile(`${out}/${label}-${mode}-probe.json`,JSON.stringify(result,null,2));
  const trace=await client.call('performance_stop_trace',{pageId:id,filePath:`${out}/${label}-${mode}-trace.json.gz`});await writeFile(`${out}/${label}-${mode}-report.json`,JSON.stringify(trace,null,2));
  await client.call('take_screenshot',{pageId:id,filePath:`${out}/devtools-${label}-${mode}.png`});
  console.log(mode,trace.isError?'TRACE ERROR':'load trace, screenshot and actual rAF probe saved');
 }
 await client.call('emulate',{pageId:id,viewport:'1366x768x1',cpuThrottlingRate:1});
 await client.call('performance_start_trace',{pageId:id,reload:false,autoStop:false});
 const scroll=await client.call('evaluate_script',{pageId:id,function:'async()=>{let deltas=[],last=0;const frame=t=>{if(last)deltas.push(t-last);last=t;};let active=true;requestAnimationFrame(function sample(t){frame(t);if(active)requestAnimationFrame(sample);});for(let step=0;step<25;step++){scrollBy(0,130);await new Promise(r=>setTimeout(r,80));}active=false;return {deltas,y:scrollY,overflow:document.documentElement.scrollWidth-innerWidth,motion:window.__portfolioMotion?.()};}'});
 await writeFile(`${out}/${label}-scroll-probe.json`,JSON.stringify(scroll,null,2));
 const trace=await client.call('performance_stop_trace',{pageId:id,filePath:`${out}/${label}-scroll-trace.json.gz`});await writeFile(`${out}/${label}-scroll-report.json`,JSON.stringify(trace,null,2));
 console.log('Home native-scroll trace saved');
}finally{client.close();}
