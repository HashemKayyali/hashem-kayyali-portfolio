import { connect } from './mcp-client.mjs';
import { writeFile } from 'node:fs/promises';
const label = process.argv[2] ?? 'after';
const target=process.argv[3]??'http://127.0.0.1:4176/preview/?lang=en';
const client = await connect('devtools');
const records=[];
const call = async (name,args) => { const result=await client.call(name,args); records.push({name,args,result}); if(result.isError) throw new Error(JSON.stringify(result)); return result; };
try {
  const created=await call('new_page',{url:target});
  const pageText=created.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
  console.log(pageText.slice(0,800));
  const pages=await call('list_pages',{});
  const listing=pages.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
  const pageId=Number(listing.match(/(?:^|\n)(\d+):.*4176/)?.[1]);
  if(!Number.isFinite(pageId)) throw new Error(listing);
  for(const [device,viewport,cpu] of [['desktop','1440x1000x1',1],['mobile','390x844x1,mobile,touch',4]]) {
    await call('emulate',{pageId,viewport,cpuThrottlingRate:cpu});
    await call('navigate_page',{pageId,url:target,type:'url'});
    const trace=await call('performance_start_trace',{pageId,reload:true,autoStop:true,filePath:`output/playwright/motion-lab/${label}-${device}-trace.json.gz`});
    await writeFile(`output/playwright/motion-lab/${label}-${device}-performance.json`,JSON.stringify(trace,null,2));
    console.log(device,trace.content.filter(x=>x.type==='text').map(x=>x.text).join('\n').split('Available insights:')[0].slice(-1700));
    const traceText=trace.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
    for(const insightName of ['LCPBreakdown','ForcedReflow','CLSCulprits'])if(traceText.includes('insight name: '+insightName)) {
      const insight=await call('performance_analyze_insight',{pageId,insightSetId:'NAVIGATION_0',insightName});
      await writeFile(`output/playwright/motion-lab/${label}-${device}-${insightName}.json`,JSON.stringify(insight,null,2));
    }
    const lcp=await call('evaluate_script',{pageId,waitForStableDom:false,function:`async()=>{let result;const observer=new PerformanceObserver(list=>{const entry=list.getEntries().at(-1);result={time:entry.startTime,size:entry.size,element:entry.element?.outerHTML};});observer.observe({type:'largest-contentful-paint',buffered:true});await new Promise(resolve=>setTimeout(resolve,100));observer.disconnect();return result;}`});
    await writeFile(`output/playwright/motion-lab/${label}-${device}-lcp-element.json`,JSON.stringify(lcp,null,2));
    if(label==='after'||label==='overhaul-after'||label.startsWith('direction')) {
      const sample=await call('evaluate_script',{pageId,waitForStableDom:false,function:`async()=>{const field=document.querySelector('.hero-field canvas');const start=performance.now(),frame=Number(field.dataset.frame);const longTasks=[];const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(entry=>({start:entry.startTime,duration:entry.duration}))));observer.observe({type:'longtask'});await new Promise(resolve=>setTimeout(resolve,3000));observer.disconnect();return {viewport:[innerWidth,innerHeight],duration:performance.now()-start,fluidPaints:Number(field.dataset.frame)-frame,longTasks,resources:performance.getEntriesByType('resource').map(entry=>({name:entry.name.split('/').pop(),bytes:entry.encodedBodySize})),motionState:field.parentElement.dataset.motion};}`});
      await writeFile(`output/playwright/motion-lab/${label}-${device}-idle.json`,JSON.stringify(sample,null,2));
    }
  }
} finally { await writeFile(`output/playwright/motion-lab/${label}-devtools-session.json`,JSON.stringify(records,null,2)); client.close(); }
