import {connectDevtools} from './design-intelligence-mcp.mjs';
import {writeFile} from 'node:fs/promises';
const phase=process.argv[2]??'before',out='output/playwright/design-intelligence',client=await connectDevtools();
const probe=`window.designProbe={frames:[],tasks:[]};new PerformanceObserver(l=>designProbe.tasks.push(...l.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});let previous=0;requestAnimationFrame(function frame(t){if(t<6500){const h=document.querySelector('.hero');designProbe.frames.push({t,gap:previous?t-previous:0,progress:window.__portfolioMotion?.().timelines.find(x=>x.id==='home:portrait:reveal')?.progress,clip:document.querySelector('.portrait-reveal')?.style.clipPath,finished:h?.dataset.portraitFinished,smoke:document.querySelector('.home-silk canvas')?.dataset.frame});previous=t;requestAnimationFrame(frame)}});`;
try{
 const opened=await client.call('new_page',{url:'about:blank'}),str=opened.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');const id=Number(str.match(/(\d+): about:blank.*selected/)?.[1]??str.match(/(\d+): about:blank/)?.[1]);if(!id)throw Error(str);
 for(const device of process.argv[3]?[process.argv[3]]:['desktop','mobile','cpu4']){
  await client.call('emulate',{pageId:id,viewport:device==='desktop'?'1440x1000x1':'390x844x1,mobile,touch',cpuThrottlingRate:device==='cpu4'?4:1});
  const prefix=out+'/'+phase+'-'+device;
  await client.call('performance_start_trace',{pageId:id,reload:false,autoStop:false});
  await client.call('navigate_page',{pageId:id,type:'url',url:'http://127.0.0.1:4176/preview/en/',initScript:probe});
  const result=await client.call('evaluate_script',{pageId:id,waitForStableDom:false,function:'async()=>{await new Promise(r=>setTimeout(r,6000));return {probe:designProbe,hero:document.querySelector(".hero").dataset,fields:[...document.querySelectorAll(".motion-field")].map(x=>({state:x.dataset.motion,frames:x.querySelector("canvas").dataset.frame})),navigation:performance.getEntriesByType("navigation")[0].toJSON()};}'});
  await writeFile(prefix+'-probe-mcp.json',JSON.stringify(result,null,2));
  const trace=await client.call('performance_stop_trace',{pageId:id,filePath:prefix+'-trace.json.gz'});await writeFile(prefix+'-trace-mcp.json',JSON.stringify(trace,null,2));
  console.log(phase,device,trace.isError?'TRACE ERROR':'trace and frame probe saved');
 }
}finally{client.close();}
