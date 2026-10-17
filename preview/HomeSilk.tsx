import React,{useEffect,useRef} from 'react';
import {readBrandPalette,colorVector} from './brand-palette';
import {THEMES,themeSmokeRamp} from './themes';
import {startSmokeStage} from './smoke-stage';

type Surface={canvas:HTMLCanvasElement;context:CanvasRenderingContext2D;visible:boolean};
const surfaces=new Map<HTMLCanvasElement,Surface>();
let worker:Worker|undefined,observer:IntersectionObserver|undefined,media:MediaQueryList|undefined,timer:ReturnType<typeof setTimeout>|undefined;
let busy=false,paused=false,failed=false,mobile=false,elapsed=4.2,previous=0;
const constrained=()=>{const n=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean}};return n.connection?.saveData||(n.deviceMemory??8)<=2||n.hardwareConcurrency<=2;};
const visible=()=>[...surfaces.values()].some(s=>s.visible);
const canPaint=()=>!document.hidden&&!paused&&!media?.matches&&!constrained()&&visible();

function schedule(){
 clearTimeout(timer);
 if(!worker||failed||busy||!canPaint()){previous=0;return;}
 timer=setTimeout(()=>{
  if(!worker||!canPaint())return;
  const now=performance.now();if(previous)elapsed+=Math.min((now-previous)/1000,.25);previous=now;
  busy=true;worker.postMessage({type:'frame',time:elapsed});
 },mobile?125:83);
}
function update(){
 if(worker&&(media?.matches||constrained())){clearTimeout(timer);worker.terminate();worker=undefined;busy=false;previous=0;for(const s of surfaces.values())s.canvas.style.opacity='0';}
 const hero=document.querySelector<HTMLElement>('.home-page .hero,.lab-home .hero');
 const ready=!hero||hero.dataset.portraitFinished==='complete';
 if(ready&&!worker&&!failed&&canPaint())launch();
 for(const s of surfaces.values())s.canvas.parentElement!.dataset.motion=media?.matches?'reduced':constrained()||failed?'low-power':document.hidden||paused||!s.visible?'offscreen':ready?'active':'entrance-still';
 schedule();
}
const pause=(event:Event)=>{paused=Boolean((event as CustomEvent).detail);update();};
const recolor=(event:Event)=>{const ramp=(event as CustomEvent<{ramp:string[]}>).detail?.ramp;if(worker&&ramp)worker.postMessage({type:'palette',ramp:ramp.map(colorVector),time:elapsed,duration:canPaint()?.4:0});};
// The smoke renders at the real aspect of its box, so wide or tall heroes reveal more
// of the field instead of stretching one 4:3 frame. Feature size follows the CSS height.
let size={width:512,height:384,density:1},sizeFrame=0;
function measureSize(){
 const first=surfaces.values().next().value as Surface|undefined;if(!first)return size;
 const box=first.canvas.getBoundingClientRect();if(box.width<2||box.height<2)return size;
 const budget=mobile?110_000:230_000,aspect=box.width/box.height;
 const width=Math.max(64,Math.round(Math.sqrt(budget*aspect))),height=Math.max(64,Math.round(budget/width));
 return {width,height,density:Math.min(1.6,Math.max(.6,box.height/670))};
}
function applySize(){
 sizeFrame=0;mobile=matchMedia('(max-width:700px)').matches;
 const next=measureSize();
 if(Math.abs(next.width-size.width)<6&&Math.abs(next.height-size.height)<6&&Math.abs(next.density-size.density)<.03)return;
 size=next;
 for(const s of surfaces.values()){
  // Keep the last frame on screen while the backing store changes size.
  const copy=document.createElement('canvas');copy.width=s.canvas.width;copy.height=s.canvas.height;copy.getContext('2d')?.drawImage(s.canvas,0,0);
  s.canvas.width=size.width;s.canvas.height=size.height;s.context.drawImage(copy,0,0,size.width,size.height);
 }
 worker?.postMessage({type:'resize',...size});
}
// Debounced: while an opening glides to a new height the last frame simply stretches.
let sizeTimer:ReturnType<typeof setTimeout>|undefined;
const resize=()=>{clearTimeout(sizeTimer);sizeTimer=setTimeout(()=>{if(!sizeFrame)sizeFrame=requestAnimationFrame(applySize);},160);};
let boxes:ResizeObserver|undefined;
export function registerSilk(canvas:HTMLCanvasElement){
 const context=canvas.getContext('2d',{alpha:false});if(!context)return()=>{};
 if(!surfaces.size){
  mobile=matchMedia('(max-width:700px)').matches;media=matchMedia('(prefers-reduced-motion:reduce)');elapsed=4.2;previous=0;
  observer=new IntersectionObserver(es=>{for(const e of es){const s=surfaces.get(e.target as HTMLCanvasElement);if(s)s.visible=e.isIntersecting;}update();});
  document.addEventListener('visibilitychange',update);document.addEventListener('home-portrait-complete',update);
  media.addEventListener('change',update);window.addEventListener('portfolio-motion-pause',pause);window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('portfolio-theme-change',recolor);
  boxes=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(resize);
 }
 canvas.width=size.width;canvas.height=size.height;canvas.style.opacity='0';
 surfaces.set(canvas,{canvas,context,visible:false});observer!.observe(canvas);boxes?.observe(canvas);applySize();update();
 return()=>{
  observer?.unobserve(canvas);boxes?.unobserve(canvas);surfaces.delete(canvas);
  if(surfaces.size){update();return;}
  clearTimeout(timer);clearTimeout(sizeTimer);cancelAnimationFrame(sizeFrame);sizeFrame=0;worker?.terminate();worker=undefined;observer?.disconnect();boxes?.disconnect();boxes=undefined;
  document.removeEventListener('visibilitychange',update);document.removeEventListener('home-portrait-complete',update);media?.removeEventListener('change',update);
  window.removeEventListener('portfolio-motion-pause',pause);window.removeEventListener('resize',resize);busy=false;paused=false;failed=false;previous=0;
  window.removeEventListener('portfolio-theme-change',recolor);
 };
}
function launch(){
 const first=surfaces.values().next().value;if(!first)return;
 try{
  const activeWorker=new Worker(new URL('./home-silk.worker.ts',import.meta.url),{type:'module'});worker=activeWorker;busy=true;
  activeWorker.onmessage=({data})=>{
   if(worker!==activeWorker){(data.bitmap as ImageBitmap|undefined)?.close();return;}
   busy=false;
   if(data.unavailable){failed=true;activeWorker.terminate();worker=undefined;for(const s of surfaces.values())s.canvas.style.opacity='0';update();return;}
   const bitmap=data.bitmap as ImageBitmap;
   if(canPaint())for(const s of surfaces.values()){
    if(!s.visible)continue;s.context.drawImage(bitmap,0,0,s.canvas.width,s.canvas.height);s.canvas.style.opacity='1';s.canvas.dataset.frame=String(Number(s.canvas.dataset.frame??0)+1);
   }
   bitmap.close();schedule();
  };
  activeWorker.onerror=()=>{if(worker!==activeWorker)return;busy=false;failed=true;activeWorker.terminate();worker=undefined;for(const s of surfaces.values())s.canvas.style.opacity='0';update();};
  const colors=readBrandPalette();
  const style=getComputedStyle(document.documentElement);
  const theme=THEMES.find(t=>t.id===document.documentElement.dataset.theme);
  const ramp=theme?themeSmokeRamp(theme):[colors.paper,colors.paper,style.getPropertyValue('--smoke-a').trim()||colors.primary,style.getPropertyValue('--smoke-b').trim()||style.getPropertyValue('--atelier-petrol').trim(),colors.paper];
  activeWorker.postMessage({type:'init',width:size.width,height:size.height,density:size.density,time:elapsed,ramp:ramp.map(colorVector)});
 }catch{failed=true;}
}
export default function HomeSilk({className='',stage=false}:{className?:string;stage?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null);
 // The persistent hero atmosphere renders in its own worker (smoke-stage); other fields share the bitmap renderer.
 useEffect(()=>{if(!canvas.current)return;const live=stage?startSmokeStage(canvas.current):false;return live||registerSilk(canvas.current);},[stage]);
 return <div className={`motion-field home-silk ${className}`} data-look="v1-silk" data-motion="offscreen" aria-hidden="true"><canvas ref={canvas} className="motion-field__paint"/></div>;
}
