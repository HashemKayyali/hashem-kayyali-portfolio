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
const currentRamp=()=>{const theme=THEMES.find(t=>t.id===document.documentElement.dataset.theme)??THEMES[0];return themeSmokeRamp(theme).map(colorVector);};
const measure=(canvas:HTMLCanvasElement)=>{const box=canvas.getBoundingClientRect();return {width:Math.max(1,box.width),height:Math.max(1,box.height),dpr:Math.min(devicePixelRatio||1,2),density:Math.min(1.6,Math.max(.6,box.height/670)),mobile:matchMedia('(max-width:700px)').matches};};

export function startSmokeStage(canvas:HTMLCanvasElement):(()=>void)|false{
 // The atmosphere canvas is persistent; a repeated mount (StrictMode, HMR) reuses its worker.
 if(stage?.canvas===canvas)return stage.cleanup;
 if(!canUseSmokeStage(canvas))return false;
 let offscreen:OffscreenCanvas;
 try{offscreen=canvas.transferControlToOffscreen();}catch{return false;}
 const worker=new Worker(new URL('./smoke-stage.worker.ts',import.meta.url),{type:'module'});
 const host=canvas.parentElement!;
 let onScreen=true,lastSize='';
 const run=()=>{const live=onScreen&&!document.hidden&&!reduced()&&!constrained();worker.postMessage({type:'run',running:live});host.dataset.motion=reduced()?'reduced':constrained()?'low-power':live?'active':'offscreen';};
 const resize=()=>{const m=measure(canvas),key=[m.width,m.height,m.dpr].map(Math.round).join('x');if(key===lastSize)return;lastSize=key;worker.postMessage({type:'resize',...m});};
 const recolor=(event:Event)=>{const ramp=(event as CustomEvent<{ramp:string[]}>).detail?.ramp;if(ramp)worker.postMessage({type:'palette',ramp:ramp.map(colorVector),duration:reduced()?0:.6});};
 worker.onmessage=({data})=>{
  if(data.type==='ready')canvas.style.opacity='1';
  else if(data.type==='unavailable'){canvas.style.opacity='0';host.dataset.motion='low-power';}
  else if(data.type==='stats')canvas.dispatchEvent(new CustomEvent('smoke-stats',{detail:data}));
 };
 const m=measure(canvas);lastSize=[m.width,m.height,m.dpr].map(Math.round).join('x');
 worker.postMessage({type:'init',canvas:offscreen,ramp:currentRamp(),time:4.2,...m},[offscreen]);
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 const visible=new IntersectionObserver(([entry])=>{onScreen=entry.isIntersecting;run();});visible.observe(canvas);
 const motion=matchMedia('(prefers-reduced-motion:reduce)');
 document.addEventListener('visibilitychange',run);motion.addEventListener('change',run);window.addEventListener('portfolio-theme-change',recolor);
 run();
 const cleanup=()=>{};
 stage={worker,canvas,observer,visible,cleanup};
 (canvas as HTMLCanvasElement&{__smokeStats?:()=>void}).__smokeStats=()=>worker.postMessage({type:'stats'});
 return cleanup;
}
