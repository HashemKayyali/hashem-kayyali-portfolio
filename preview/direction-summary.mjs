import {readFile,writeFile} from 'node:fs/promises';
const root='output/playwright/motion-lab/';
const extract=result=>{const text=result.content.filter(item=>item.type==='text').map(item=>item.text).join('\n');const json=text.match(/### Result\s*\n([\s\S]*?)\n###/)?.[1]??text.match(/```json\n([\s\S]*?)\n```/)?.[1];return json?JSON.parse(json):null;};
const videoAudit=extract(JSON.parse(await readFile(root+'direction-opening-video-audit.json','utf8')));
const index={};
for(const phase of ['before','after']){
 const records=JSON.parse(await readFile(root+'direction-'+phase+'-recordings.json','utf8'));
 for(const record of records){const proof=extract(record.result);index[record.name]??={};index[record.name][phase]={...proof,firstVisibleFrame:videoAudit.results.find(result=>result.source==='direction-'+phase+'-'+record.name+'.webm')?.firstVisibleFrame};}
}
index['projects-mobile'].before={note:'Genuine previous mobile review recording; includes Hero, projects and navigation. No new navigation/load timestamps available for this archived capture.',firstVisibleFrame:videoAudit.results.find(result=>result.source==='direction-before-projects-mobile.webm')?.firstVisibleFrame};
await writeFile(root+'direction-index.json',JSON.stringify(index,null,2));
const metrics={};
for(const device of ['desktop','mobile']){
 const result=JSON.parse(await readFile(root+'direction-final-'+device+'-performance.json','utf8'));const text=result.content.filter(item=>item.type==='text').map(item=>item.text).join('\n');metrics[device]={lcpMs:Number(text.match(/LCP: (\d+) ms/)?.[1]),cls:Number(text.match(/CLS: ([\d.]+)/)?.[1]),idle:extract(JSON.parse(await readFile(root+'direction-final-'+device+'-idle.json','utf8')))};
}
const scrolling=extract(JSON.parse(await readFile(root+'direction-scroll-performance.json','utf8')));
await writeFile(root+'direction-measurements.json',JSON.stringify({metrics,scrolling,videoAudit},null,2));
console.log(JSON.stringify({metrics:Object.fromEntries(Object.entries(metrics).map(([device,data])=>[device,{lcpMs:data.lcpMs,cls:data.cls,idlePaints:data.idle?.fluidPaints,idleLongTasks:data.idle?.longTasks?.length}])),scrolling:{overflow:scrolling?.overflow,shifts:scrolling?.shifts,longTasks:scrolling?.tasks,triggerIds:scrolling?.triggers?.map(trigger=>trigger.id)},opening:Object.fromEntries(['hero-desktop','hero-mobile','hero-rtl'].map(name=>[name,{before:index[name].before.opening,after:index[name].after.opening,beforeVisible:index[name].before.firstVisibleFrame,afterVisible:index[name].after.firstVisibleFrame}])),oldRecording:videoAudit.results[0]},null,2));
