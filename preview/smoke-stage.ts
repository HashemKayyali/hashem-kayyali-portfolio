import {colorVector} from './brand-palette';
import {THEMES,themeSmokeRamp} from './themes';

/*
 * Main-thread side of the hero smoke: transfers the persistent atmosphere canvas to a worker
 * once and only sends sizes, palette and run state. Returns false when OffscreenCanvas
 * transfer is unavailable so the caller can fall back to the bitmap renderer.
 */
type Stage={worker:Worker;canvas:HTMLCanvasElement;observer:ResizeObserver;visible:IntersectionObserver;cleanup:()=>void};
let stage:Stage|undefined;

export function canUseSmokeStage(canvas:HTMLCanvasElement){
 return typeof (canvas as HTMLCanvasElement&{transferControlToOffscreen?:unknown}).transferControlToOffscreen==='function'&&typeof OffscreenCanvas!=='undefined'&&typeof Worker!=='undefined';
}

const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const constrained=()=>{const n=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean}};return Boolean(n.connection?.saveData)||(n.deviceMemory??8)<=2||n.hardwareConcurrency<=2;};
const activeTheme=(id=document.documentElement.dataset.theme)=>THEMES.find(t=>t.id===id)??THEMES[0];
const currentRamp=()=>themeSmokeRamp(activeTheme()).map(colorVector);
// The side fade is drawn in the frame toward the page paper; it mirrors for right-to-left pages.
const paperOf=(id?:string)=>colorVector(activeTheme(id).colors.paper);
const fadeDirection=()=>document.documentElement.dir==='rtl'?-1:1;
const measure=(canvas:HTMLCanvasElement)=>{const box=canvas.getBoundingClientRect();return {width:Math.max(1,box.width),height:Math.max(1,box.height),dpr:Math.min(devicePixelRatio||1,2),density:Math.min(1.6,Math.max(.6,box.height/670)),mobile:matchMedia('(max-width:700px)').matches};};

let scheduled:{canvas:HTMLCanvasElement;cancel:()=>void}|undefined;
/** Runs after the entrance has settled: page load, a short pause, then an idle moment (capped). */
function afterEntrance(callback:()=>void){
 let done=false,timer:ReturnType<typeof setTimeout>|undefined;
 const go=()=>{if(!done){done=true;callback();}};
 const idle=()=>{timer=setTimeout(()=>{if(typeof requestIdleCallback==='function')requestIdleCallback(go,{timeout:1200});else go();},700);};
 if(document.readyState==='complete')idle();else addEventListener('load',idle,{once:true});
 return ()=>{done=true;clearTimeout(timer);removeEventListener('load',idle);};
}

export function startSmokeStage(canvas:HTMLCanvasElement):(()=>void)|false{
 // The atmosphere canvas is persistent; a repeated mount (StrictMode, HMR) reuses its worker.
 if(stage?.canvas===canvas)return stage.cleanup;
 if(scheduled?.canvas===canvas)return scheduled.cancel;
 if(!canUseSmokeStage(canvas))return false;
 // Starting WebGL (context, shader compile) mid-entrance stalled the page; it now starts once the entrance
 // has settled, and the first frames fade in over the static glow behind the canvas (CSS transition).
 canvas.style.opacity='0';
 const cancel=afterEntrance(()=>{scheduled=undefined;boot(canvas);});
 scheduled={canvas,cancel:()=>{cancel();scheduled=undefined;}};
 return scheduled.cancel;
}

function boot(canvas:HTMLCanvasElement){
 let offscreen:OffscreenCanvas;
 try{offscreen=canvas.transferControlToOffscreen();}catch{canvas.style.opacity='0';return;}
 const worker=new Worker(new URL('./smoke-stage.worker.ts',import.meta.url),{type:'module'});
 const host=canvas.parentElement!;
 let onScreen=true,lastSize='';
 const run=()=>{const live=onScreen&&!document.hidden&&!reduced()&&!constrained();worker.postMessage({type:'run',running:live});host.dataset.motion=reduced()?'reduced':constrained()?'low-power':live?'active':'offscreen';};
 const resize=()=>{const m=measure(canvas),key=[m.width,m.height,m.dpr].map(Math.round).join('x');if(key===lastSize)return;lastSize=key;worker.postMessage({type:'resize',...m});};
 const recolor=(event:Event)=>{const detail=(event as CustomEvent<{id?:string;ramp:string[]}>).detail;if(detail?.ramp)worker.postMessage({type:'palette',ramp:detail.ramp.map(colorVector),paper:paperOf(detail.id),duration:reduced()?0:.6});};
 worker.onmessage=({data})=>{
  // Once frames carry their own fade, the GPU mask is dropped (style rule on [data-renderer=stage]).
  if(data.type==='ready'){canvas.style.opacity='1';host.dataset.renderer='stage';}
  else if(data.type==='unavailable'){canvas.style.opacity='0';host.dataset.motion='low-power';delete host.dataset.renderer;}
  else if(data.type==='stats')canvas.dispatchEvent(new CustomEvent('smoke-stats',{detail:data}));
 };
 const m=measure(canvas);lastSize=[m.width,m.height,m.dpr].map(Math.round).join('x');
 worker.postMessage({type:'init',canvas:offscreen,ramp:currentRamp(),paper:paperOf(),fade:fadeDirection(),time:4.2,...m},[offscreen]);
 const direction=new MutationObserver(()=>worker.postMessage({type:'fade',fade:fadeDirection()}));direction.observe(document.documentElement,{attributes:true,attributeFilter:['dir']});
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 const visible=new IntersectionObserver(([entry])=>{onScreen=entry.isIntersecting;run();});visible.observe(canvas);
 const motion=matchMedia('(prefers-reduced-motion:reduce)');
 document.addEventListener('visibilitychange',run);motion.addEventListener('change',run);window.addEventListener('portfolio-theme-change',recolor);
 run();
 const cleanup=()=>{};
 stage={worker,canvas,observer,visible,cleanup};
 (canvas as HTMLCanvasElement&{__smokeStats?:()=>void}).__smokeStats=()=>worker.postMessage({type:'stats'});
}
