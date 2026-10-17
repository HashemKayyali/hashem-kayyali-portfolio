import {connect} from './mcp-client.mjs';
import {writeFile} from 'node:fs/promises';
const label=process.argv[2]??'signature-bike-scroll',target=process.argv[3]??'http://127.0.0.1:4176/preview/en/projects/bike-tower/';
const client=await connect('devtools'),records=[];
const call=async(name,args)=>{const result=await client.call(name,args);records.push({name,args,result});if(result.isError)throw Error(JSON.stringify(result));return result;};
try{
 await call('new_page',{url:target});
 const listing=await call('list_pages',{}),pageId=Number(listing.content.map(x=>x.text??'').join('\n').match(/(?:^|\n)(\d+):.*4176/)?.[1]);
 await call('emulate',{pageId,viewport:'390x844x1,mobile,touch',cpuThrottlingRate:4});await call('navigate_page',{pageId,type:'url',url:target});
 await call('evaluate_script',{pageId,function:`async()=>{await new Promise(resolve=>setTimeout(resolve,1700));window.scrollQA={tasks:[],shifts:[]};window.scrollTaskObserver=new PerformanceObserver(list=>window.scrollQA.tasks.push(...list.getEntries().map(entry=>({time:entry.startTime,duration:entry.duration}))));window.scrollTaskObserver.observe({type:'longtask'});window.scrollShiftObserver=new PerformanceObserver(list=>window.scrollQA.shifts.push(...list.getEntries().map(entry=>({time:entry.startTime,value:entry.value,recentInput:entry.hadRecentInput}))));window.scrollShiftObserver.observe({type:'layout-shift'});}`});
 await call('performance_start_trace',{pageId,reload:false,autoStop:false});
 for(let step=0;step<7;step++){await call('press_key',{pageId,key:'PageDown'});await call('evaluate_script',{pageId,function:`async()=>{await new Promise(resolve=>setTimeout(resolve,450));return {scroll:scrollY,overflow:document.documentElement.scrollWidth>innerWidth};}`});}
 const sample=await call('evaluate_script',{pageId,function:`()=>{window.scrollTaskObserver.disconnect();window.scrollShiftObserver.disconnect();return {...window.scrollQA,triggers:window.__portfolioMotion().triggers,overflow:document.documentElement.scrollWidth>innerWidth,note:'Actual PageDown input through Chrome DevTools MCP; native scrolling, mobile CPU4x local lab.'};}`});
 await writeFile(`output/playwright/motion-lab/${label}-performance.json`,JSON.stringify(sample,null,2));await call('performance_stop_trace',{pageId,filePath:`output/playwright/motion-lab/${label}-trace.json.gz`});console.log('Actual native project scrolling traced at mobile CPU4x');
}finally{await writeFile(`output/playwright/motion-lab/${label}-devtools-session.json`,JSON.stringify(records,null,2));client.close();}
