import {connectDevtools} from './design-intelligence-mcp.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
const out='output/playwright/creative-director',label=process.argv[3]??'performance',client=await connectDevtools();
const probe=`window.creativeProbe={frames:[],tasks:[],paint:[]};new PerformanceObserver(l=>creativeProbe.tasks.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});new PerformanceObserver(l=>creativeProbe.paint.push(...l.getEntries().map(e=>({type:e.entryType,start:e.startTime,value:e.value,size:e.size})))).observe({type:'largest-contentful-paint',buffered:true});let last=0;requestAnimationFrame(function frame(t){if(t<6500){const hero=document.querySelector('.hero');creativeProbe.frames.push({t,gap:last?t-last:0,progress:window.__portfolioMotion?.().timelines.find(x=>x.id==='home:portrait:reveal')?.progress,finished:hero?.dataset.portraitFinished});last=t;requestAnimationFrame(frame)}});`;
const modes=process.argv[2]?[process.argv[2]]:['laptop','wide','mobile','cpu4'];
await mkdir(out,{recursive:true});
try{
 const opened=await client.call('new_page',{url:'about:blank'}),str=opened.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');const id=Number(str.match(/(\d+): about:blank.*selected/)?.[1]??str.match(/(\d+): about:blank/)?.[1]);if(!id)throw Error(str);
 for(const mode of modes){
  const viewport=mode==='wide'?'2560x1440x1':mode==='mobile'?'390x844x1,mobile,touch':'1366x768x1';
  await client.call('emulate',{pageId:id,viewport,cpuThrottlingRate:mode==='cpu4'?4:1});
  const prefix=out+'/'+label+'-'+mode;
  await client.call('performance_start_trace',{pageId:id,reload:false,autoStop:false});
  await client.call('navigate_page',{pageId:id,type:'url',url:'http://127.0.0.1:4176/preview/creative/en/',initScript:probe});
  const result=await client.call('evaluate_script',{pageId:id,waitForStableDom:false,function:'async()=>{await new Promise(r=>setTimeout(r,6000));return {probe:creativeProbe,hero:document.querySelector(".hero").dataset,fields:[...document.querySelectorAll(".motion-field")].map(x=>({state:x.dataset.motion,frames:x.querySelector("canvas")?.dataset.frame})),motion:window.__portfolioMotion?.(),navigation:performance.getEntriesByType("navigation")[0].toJSON()};}'});
  await writeFile(prefix+'-probe.json',JSON.stringify(result,null,2));
  const trace=await client.call('performance_stop_trace',{pageId:id,filePath:prefix+'-trace.json.gz'});await writeFile(prefix+'-trace-report.json',JSON.stringify(trace,null,2));
  console.log(mode,trace.isError?'TRACE ERROR':'load trace and foreground probe saved');
 }
 await client.call('emulate',{pageId:id,viewport:'1366x768x1',cpuThrottlingRate:1});
 await client.call('navigate_page',{pageId:id,type:'url',url:'http://127.0.0.1:4176/preview/creative/ar/projects/'});
 await client.call('performance_start_trace',{pageId:id,reload:false,autoStop:false});
 const scroll=await client.call('evaluate_script',{pageId:id,function:'async()=>{const frames=[];let last=performance.now();for(let step=0;step<30;step++){scrollBy(0,240);await new Promise(resolve=>requestAnimationFrame(t=>{frames.push(t-last);last=t;resolve();}));await new Promise(resolve=>setTimeout(resolve,50));}return {frames,y:scrollY,overflow:document.documentElement.scrollWidth-innerWidth,motion:window.__portfolioMotion?.()};}'});
 await writeFile(out+'/performance-gallery-scroll-probe.json',JSON.stringify(scroll,null,2));
 const scrollTrace=await client.call('performance_stop_trace',{pageId:id,filePath:out+'/performance-gallery-scroll-trace.json.gz'});await writeFile(out+'/performance-gallery-scroll-report.json',JSON.stringify(scrollTrace,null,2));
 console.log('Arabic gallery scroll trace saved');
}finally{client.close();}
