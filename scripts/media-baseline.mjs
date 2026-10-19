// Reproducible image-performance baseline over the Chrome DevTools Protocol (no npm dependencies).
// Usage: node scripts/media-baseline.mjs [origin] [output.json] [--network=none|4g|slow4g] [--runs=N]
// Defaults: https://hashemkayyali.com, output/media-baseline/<host>-<network>.json, 4g, 1 run.
// Each scenario runs in a fresh tab with an empty HTTP cache; "warm" steps reuse the tab's cache.
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync,rmSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';

const args=process.argv.slice(2),flags=Object.fromEntries(args.filter(a=>a.startsWith('--')).map(a=>a.slice(2).split('=')));
const [originArg,outArg]=args.filter(a=>!a.startsWith('--'));
const origin=(originArg||'https://hashemkayyali.com').replace(/\/$/,''),network=flags.network||'4g',runs=Number(flags.runs||1);
const output=resolve(outArg||`output/media-baseline/${new URL(origin).host.replace(/[:.]/g,'-')}-${network}.json`);
// Throughput in bytes/s. "4g" ≈ Lighthouse desktop-ish fast mobile; "slow4g" = Lighthouse mobile simulate preset.
const NETWORKS={none:null,'4g':{latency:40,downloadThroughput:9e6/8,uploadThroughput:1.5e6/8},slow4g:{latency:150,downloadThroughput:1.6e6/8,uploadThroughput:750e3/8}};
const VIEWPORTS={'390-mobile':{width:390,height:844,deviceScaleFactor:3,mobile:true,cpu:4},'1366-laptop':{width:1366,height:768,deviceScaleFactor:1,mobile:false,cpu:1},'1920-desktop':{width:1920,height:1080,deviceScaleFactor:1,mobile:false,cpu:1}};
const chromePath=process.env.CHROME_PATH||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
if(!chromePath)throw new Error('Set CHROME_PATH to a Chrome or Edge executable.');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const profile=resolve(tmpdir(),'media-baseline-profile-'+process.pid),port=9300+Math.floor(Math.random()*500);
const chrome=spawn(chromePath,['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--hide-scrollbars','about:blank'],{stdio:'ignore'});
let browserInfo;for(let i=0;i<60&&!browserInfo;i++){try{browserInfo=await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();}catch{await sleep(250);}}
if(!browserInfo)throw new Error('Chrome did not start.');

function connect(url){
 const ws=new WebSocket(url);let id=0;const pending=new Map(),listeners=new Set();
 ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.id){const p=pending.get(message.id);pending.delete(message.id);message.error?p.reject(new Error(message.error.message)):p.resolve(message.result);}else for(const l of listeners)l(message);};
 return new Promise((ok,fail)=>{ws.onerror=fail;ws.onopen=()=>ok({
  send:(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));}),
  on:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},close:()=>ws.close()});});
}

// Registered before any page script: LCP, layout shifts and long tasks from the first frame.
const observers=`window.__perf={lcp:[],cls:0,shifts:[],long:[]};
new PerformanceObserver(l=>{for(const e of l.getEntries())__perf.lcp.push({t:Math.round(e.startTime),size:e.size,url:e.url||null,el:e.element?(e.element.tagName+'.'+String(e.element.className).slice(0,60)):null});}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput){__perf.cls+=e.value;__perf.shifts.push({t:Math.round(e.startTime),v:+e.value.toFixed(4)});}}).observe({type:'layout-shift',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries())__perf.long.push({t:Math.round(e.startTime),d:Math.round(e.duration)});}).observe({type:'longtask',buffered:true});`;

// In-page snapshot: every rendered <img>, natural vs needed pixels.
const imageAudit=`(()=>{const dpr=devicePixelRatio;return [...document.images].filter(i=>i.complete&&i.naturalWidth&&i.getBoundingClientRect().width>1).map(i=>{const r=i.getBoundingClientRect(),need=Math.round(r.width*dpr);return {src:(i.currentSrc||i.src).replace(location.origin,''),natural:i.naturalWidth,displayed:Math.round(r.width),need,ratio:+(i.naturalWidth/need).toFixed(2),inView:r.bottom>0&&r.top<innerHeight,loading:i.loading,fetchpriority:i.getAttribute('fetchpriority')};});})()`;

async function scenario(name,viewport,steps){
 const target=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
 const page=await connect(target.webSocketDebuggerUrl),vp=VIEWPORTS[viewport];
 const requests=new Map(),trace=[];let tracingDone;
 page.on(m=>{
  const p=m.params;
  if(m.method==='Network.requestWillBeSent'&&p.type==='Image')requests.set(p.requestId,{url:p.request.url.replace(origin,''),priority:p.request.initialPriority,start:p.timestamp,phase:page.phase});
  if(m.method==='Network.responseReceived'&&requests.has(p.requestId)){const r=requests.get(p.requestId);Object.assign(r,{status:p.response.status,fromCache:!!(p.response.fromDiskCache||p.response.fromMemoryCache||p.response.fromPrefetchCache),cacheControl:p.response.headers['cache-control']??p.response.headers['Cache-Control'],mime:p.response.mimeType,protocol:p.response.protocol});}
  if(m.method==='Network.requestServedFromCache'&&requests.has(p.requestId))requests.get(p.requestId).fromCache=true;
  if(m.method==='Network.loadingFinished'&&requests.has(p.requestId)){const r=requests.get(p.requestId);r.bytes=p.encodedDataLength;r.ms=Math.round((p.timestamp-r.start)*1000);}
  if(m.method==='Network.loadingFailed'&&requests.has(p.requestId))requests.get(p.requestId).failed=p.errorText;
  if(m.method==='Tracing.dataCollected')trace.push(...p.value);
  if(m.method==='Tracing.tracingComplete')tracingDone?.();
 });
 await page.send('Network.enable');await page.send('Page.enable');await page.send('Runtime.enable');
 await page.send('Network.clearBrowserCache');await page.send('Network.setCacheDisabled',{cacheDisabled:false});
 await page.send('Emulation.setDeviceMetricsOverride',vp);
 if(vp.mobile)await page.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await page.send('Emulation.setCPUThrottlingRate',{rate:network==='none'?1:vp.cpu});
 const net=NETWORKS[network];await page.send('Network.emulateNetworkConditions',net?{offline:false,...net}:{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 await page.send('Page.addScriptToEvaluateOnNewDocument',{source:observers});
 await page.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,cc',transferMode:'ReportEvents'});
 const evaluate=async expression=>(await page.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true})).result.value;
 const idle=async(quiet=1500,max=30000)=>{const start=Date.now();let last=Date.now(),count=-1;while(Date.now()-start<max){const open=[...requests.values()].filter(r=>r.bytes===undefined&&!r.failed&&!r.fromCache).length;const n=requests.size;if(n!==count||open){count=n;last=Date.now();}if(Date.now()-last>quiet)break;await sleep(150);}};
 const result={name,viewport,steps:[]};
 const ctx={page,evaluate,idle,requests,origin,
  async goto(path){page.phase??=path;const t=Date.now();const loaded=new Promise(r=>{const off=page.on(m=>{if(m.method==='Page.loadEventFired'){off();r();}});});await page.send('Page.navigate',{url:origin+path});await loaded;const load=Date.now()-t;await idle();return {load};},
  async click(selector){const box=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);if(!box)throw new Error('missing '+selector);await sleep(400);
   for(const type of ['mouseMoved','mousePressed','mouseReleased'])await page.send('Input.dispatchMouseEvent',{type,x:box.x,y:box.y,button:'left',clickCount:1});},
  async scrollThrough(){page.phase+=' (scroll)';const h=await evaluate('document.documentElement.scrollHeight');for(let y=0;y<h;y+=vp.height*0.8){await evaluate(`scrollTo(0,${y})`);await sleep(350);}await idle(1200);},
  snapshot:async label=>{const perf=await evaluate('window.__perf');const images=await evaluate(imageAudit);result.steps.push({label,lcp:perf?.lcp.at(-1)??null,cls:+(perf?.cls??0).toFixed(4),longTasks:perf?.long.length??0,longTaskMs:(perf?.long??[]).reduce((s,e)=>s+e.d,0),images});},
 };
 try{await steps(ctx);}catch(error){result.error=String(error.message||error);}
 await new Promise(r=>{tracingDone=r;page.send('Tracing.end');});
 const decodes=trace.filter(e=>e.ph==='X'&&/^(Decode Image|ImageDecodeTask|Decode LazyPixelRef)$/.test(e.name));
 result.decode={count:decodes.length,totalMs:Math.round(decodes.reduce((s,e)=>s+(e.dur||0),0)/1000),maxMs:Math.round(Math.max(0,...decodes.map(e=>e.dur||0))/1000)};
 const list=[...requests.values()];
 const fetched=list.filter(r=>!r.fromCache);const seen=new Map();for(const r of list)seen.set(r.url,(seen.get(r.url)??0)+1);
 result.imageRequests={total:list.length,network:fetched.length,fromCache:list.length-fetched.length,failed:list.filter(r=>r.failed).length,
  bytes:fetched.reduce((s,r)=>s+(r.bytes||0),0),duplicates:[...seen].filter(([,n])=>n>1).map(([url,n])=>({url,n})),
  byPhase:Object.entries(Object.groupBy(list,r=>r.phase||'?')).map(([phase,rs])=>({phase,count:rs.length,bytes:rs.filter(r=>!r.fromCache).reduce((s,r)=>s+(r.bytes||0),0)})),
  slowest:[...fetched].sort((a,b)=>(b.ms||0)-(a.ms||0)).slice(0,5).map(({url,ms,bytes,priority})=>({url,ms,bytes,priority})),
  list};
 page.close();await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(()=>{});
 return result;
}

const firstCard='.app-collection-visual a.app-cover';
const scenarios=[
 ['home','/en/',async c=>{c.page.phase='home';const {load}=await c.goto('/en/');await c.snapshot('home loaded');c.loadMs=load;await c.scrollThrough();await c.snapshot('home scrolled');}],
 ['projects','/en/projects/',async c=>{c.page.phase='projects';await c.goto('/en/projects/');await c.snapshot('projects loaded');await c.scrollThrough();await c.snapshot('projects scrolled');}],
 ['case-direct','/en/projects/eventies/',async c=>{c.page.phase='case';await c.goto('/en/projects/eventies/');await c.snapshot('case loaded');await c.scrollThrough();await c.snapshot('case scrolled');}],
 ['case-gallery','/en/projects/glitzz-lab/',async c=>{c.page.phase='case';await c.goto('/en/projects/glitzz-lab/');const has=await c.evaluate("!!document.querySelector('.evidence-slide')");if(has){await c.evaluate("document.querySelector('.evidence-slide').scrollIntoView({block:'center',behavior:'instant'})");await c.idle(1200);c.page.phase='gallery next';for(let i=0;i<4;i++){const next=await c.evaluate("(()=>{const b=[...document.querySelectorAll('button')].find(b=>/next/i.test(b.getAttribute('aria-label')||''));if(!b||b.disabled)return false;b.click();return true;})()");if(!next)break;await c.idle(800,8000);}}await c.snapshot('gallery stepped');}],
 ['flight','/en/projects/ → case',async c=>{c.page.phase='projects';await c.goto('/en/projects/');c.page.phase='flight';const before=c.requests.size;const t=Date.now();await c.click(firstCard);
  let ready=null,transitSeen=false;for(let i=0;i<200;i++){const s=await c.evaluate("({path:location.pathname,transit:!!document.querySelector('.project-transit-image'),img:(()=>{const i=document.querySelector('.case-opening-visual img');return i?{done:i.complete&&i.naturalWidth>0,src:(i.currentSrc||i.src).replace(location.origin,''),natural:i.naturalWidth,width:Math.round(i.getBoundingClientRect().width)}:null})()})");transitSeen||=s.transit;if(s.path.includes('/projects/')&&s.path.split('/').length>4&&!s.transit&&s.img?.done){ready={ms:Date.now()-t,...s.img};break;}await sleep(50);}
  await c.idle(1000);await c.snapshot('after flight');c.flight={readyMs:ready?.ms??null,transitSeen,destination:ready,requestsDuringNav:c.requests.size-before};}],
 ['gallery','/en/gallery/',async c=>{c.page.phase='gallery';await c.goto('/en/gallery/');await c.snapshot('gallery');}],
 ['journal','/en/journal/',async c=>{c.page.phase='journal';await c.goto('/en/journal/');await c.snapshot('journal');}],
 ['warm-repeat','/en/projects/ twice',async c=>{c.page.phase='cold';await c.goto('/en/projects/');c.page.phase='warm reload';await c.goto('/en/projects/');await c.snapshot('warm');}],
];
const only=flags.only?.split(',');const report={origin,network,conditions:NETWORKS[network],chrome:browserInfo.Browser,measuredAt:new Date().toISOString(),runs,results:[]};
for(let run=0;run<runs;run++)for(const viewport of Object.keys(VIEWPORTS))for(const [name,path,steps] of scenarios){if(only&&!only.includes(name))continue;
 let extra={};const r=await scenario(name,viewport,async ctx=>{await steps(ctx);extra={loadMs:ctx.loadMs,flight:ctx.flight};});Object.assign(r,{path,run},extra);report.results.push(r);
 const s=r.steps[0];console.log(`${viewport.padEnd(13)} ${name.padEnd(13)} LCP ${String(s?.lcp?.t??'-').padStart(5)}ms  img ${String(r.imageRequests.network).padStart(3)} req ${(r.imageRequests.bytes/1024).toFixed(0).padStart(6)} KB  decode ${r.decode.totalMs}ms/${r.decode.count}  CLS ${s?.cls??'-'}${r.flight?`  flight ready ${r.flight.readyMs}ms`:''}${r.error?'  ERROR '+r.error:''}`);}
chrome.kill();await sleep(500);try{rmSync(profile,{recursive:true,force:true});}catch{}
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,1)+'\n');console.log('Saved',output);
