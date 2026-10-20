import {ScrollTrigger} from 'gsap/ScrollTrigger';

/*
 * Temporary physical-device trace, loaded only with ?motionDebug=1 (main.tsx). Bounded to 90 s and
 * 3000 events; no console output, no text content, no query strings or storage. "Share trace" hands
 * sanitized JSON to the iOS share sheet (or the clipboard). Remove once the iPhone issue is closed.
 */
export function startMotionDebug(){
 const t0=performance.now(),until=t0+90_000,events:unknown[]=[],gaps=[0,0,0,0];// >20, >34, >50, >100 ms
 const now=()=>Math.round(performance.now()-t0);
 const viewport=()=>({w:innerWidth,h:innerHeight,ch:document.documentElement.clientHeight,vv:Math.round(visualViewport?.height??0),y:Math.round(scrollY)});
 const log=(type:string,extra:object={})=>{if(events.length<3000&&performance.now()<until)events.push({t:now(),type,...extra});};
 let last=0,frames=0;
 const frame=(time:number)=>{
  if(time>until){log('capture-end');return;}
  if(last){const gap=time-last;frames++;if(gap>20)gaps[0]++;if(gap>34)gaps[1]++;if(gap>50){gaps[2]++;log('long-frame',{ms:Math.round(gap),...viewport(),path:location.pathname});}if(gap>100)gaps[3]++;}
  last=time;requestAnimationFrame(frame);
 };
 requestAnimationFrame(frame);
 // Long frames are filtered by the hidden/visible lifecycle (a background tab is not a stutter).
 document.addEventListener('visibilitychange',()=>{last=0;log('visibility',{hidden:document.hidden});});
 addEventListener('pageshow',event=>log('pageshow',{persisted:event.persisted}));
 addEventListener('resize',()=>log('resize',viewport()),{passive:true});
 visualViewport?.addEventListener('resize',()=>log('vv-resize',viewport()));
 addEventListener('popstate',()=>log('popstate',{path:location.pathname,...viewport()}));
 addEventListener('portfolio-theme-change',()=>log('theme',{id:document.documentElement.dataset.theme}));
 let refreshStart=0;
 ScrollTrigger.addEventListener('refreshInit',()=>{refreshStart=performance.now();});
 ScrollTrigger.addEventListener('refresh',()=>log('st-refresh',{ms:Math.round(performance.now()-refreshStart),triggers:ScrollTrigger.getAll().length,y:Math.round(scrollY)}));
 // Entrance resets and stack mode flips: a repeat on the same node is the bug this trace looks for.
 const names=new WeakMap<Element,number>();let next=0;
 new MutationObserver(changes=>{for(const change of changes){const node=change.target as HTMLElement;if(!names.has(node))names.set(node,next++);
  log(change.attributeName!,{node:names.get(node),cls:node.classList[0],value:node.getAttribute(change.attributeName!),y:Math.round(scrollY)});}})
  .observe(document.body,{subtree:true,attributes:true,attributeFilter:['data-viewport-entrance','data-stack','data-route-ready']});
 let smoke:unknown;document.addEventListener('smoke-stats',event=>{smoke=(event as CustomEvent).detail;},true);
 const button=Object.assign(document.createElement('button'),{type:'button',textContent:'Share trace'});
 button.style.cssText='position:fixed;z-index:2147483647;left:8px;bottom:calc(8px + env(safe-area-inset-bottom));padding:8px 12px;font:13px system-ui;background:#111;color:#fff;border:1px solid #fff;border-radius:6px;opacity:.85';
 button.addEventListener('click',async()=>{
  document.querySelectorAll<HTMLCanvasElement&{__smokeStats?:()=>void}>('canvas').forEach(canvas=>canvas.__smokeStats?.());
  await new Promise(resolve=>setTimeout(resolve,150));
  const motion=(window as Window&{__portfolioMotion?:()=>{timelines:{id:string;active:boolean}[];triggers:unknown[]}}).__portfolioMotion?.();
  const trace=JSON.stringify({ua:navigator.userAgent,dpr:devicePixelRatio,elapsed:now(),frames,gaps:{over20:gaps[0],over34:gaps[1],over50:gaps[2],over100:gaps[3]},viewport:viewport(),
   activeTimelines:motion?.timelines.filter(timeline=>timeline.active).map(timeline=>timeline.id),triggers:motion?.triggers.length,smoke,events});
  try{if(navigator.share)await navigator.share({title:'motion trace',text:trace});else{await navigator.clipboard.writeText(trace);button.textContent='Copied';}}catch{}
 });
 document.body.append(button);
}
