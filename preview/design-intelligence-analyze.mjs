import {readFile,writeFile} from 'node:fs/promises';
const out='output/playwright/design-intelligence';
function result(wrapper){const text=wrapper.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');const raw=text.match(/### Result\n([\s\S]*?)\n###/)?.[1]??text.match(/```json\n([\s\S]*?)\n```/)?.[1]??text.match(/```\n([\s\S]*?)\n```/)?.[1];if(!raw)throw Error('No JSON result in MCP wrapper');return JSON.parse(raw);}
const rows=[];
for(const phase of ['before','after'])for(const device of ['desktop','mobile','cpu4']){
 const data=result(JSON.parse(await readFile(out+'/'+phase+'-'+device+'-probe-mcp.json','utf8')));
 const central=data.probe.frames.filter(f=>f.progress>=.15&&f.progress<=.75),gaps=central.map(f=>f.gap).sort((a,b)=>a-b);
 const start=central[0]?.t??0,end=central.at(-1)?.t??0;
 const tasks=data.probe.tasks.filter(t=>t.start<end&&t.start+t.duration>start);
 const trace=JSON.parse(await readFile(out+'/'+phase+'-'+device+'-trace-mcp.json','utf8'));
 const text=trace.content.filter(x=>x.type==='text').map(x=>x.text).join('\n');
 rows.push({phase,device,revealSamples:gaps.length,revealMedian:gaps[Math.floor(gaps.length/2)],revealP95:gaps[Math.floor(gaps.length*.95)],revealMax:gaps.at(-1),revealLongTasks:tasks.length,revealWindow:[start,end],startupTasks:data.probe.tasks.filter(t=>t.start<start),hero:data.hero,LCP:Number(text.match(/LCP: ([\d,]+) ms/)?.[1]?.replaceAll(',','')),CLS:Number(text.match(/CLS: ([\d.]+)/)?.[1]),fields:data.fields});
}
await writeFile(out+'/performance-summary.json',JSON.stringify({method:'Actual official Chrome DevTools MCP traces and requestAnimationFrame probe; central 15–75% of the real 1.35s portrait timeline. Local Chromium, localhost, DPR1, no network throttling; CPU4 is an emulated slowdown. Background 12/8fps scheduling is independent of UI rate. Warm tool/browser variation is not field evidence.',rows},null,2));
console.log(JSON.stringify(rows,null,2));
