import {gsap} from 'gsap';
import {projectAssets} from '../data/projectAssets';import type {ProjectId} from '../content/types';
import {safeSource} from './StoryMedia';import type {PreviewRoute} from './routes';import {previewUrl} from './routes';
import {galleryMemory} from './gallery-memory';
import {getStudioProjectCover} from './studio-media-registry';
type Intent={source:HTMLImageElement;destination:PreviewRoute;origin?:ProjectId};
let clicked:{path:string;element:HTMLElement}|undefined,intent:Intent|undefined,activeId=0,activeProject:ProjectId|undefined;
let cancelActive:(()=>void)|undefined;
export const cancelProjectTransit=()=>cancelActive?.();
export const projectVisualInFlight=()=>Boolean(document.querySelector('.project-transit-image'));
const decoded=new Map<string,Promise<HTMLImageElement|undefined>>();
export function preloadProjectImage(id:ProjectId){
 const asset=projectAssets.find(a=>a.id===id);if(!asset)return Promise.resolve(undefined);
 const source=getStudioProjectCover(id)?.url??(id==='umniah-youthconnect'?'/v2-media/umniah-architecture.svg':safeSource(asset.image)),key=id+':'+source;
 if(decoded.has(key))return decoded.get(key)!;
 const image=new Image();image.decoding='async';image.src=source;
 const result=image.decode().then(()=>image,()=>undefined);decoded.set(key,result);
 if(decoded.size>4)decoded.delete(decoded.keys().next().value!);return result;
}
export function rememberProjectLink(route:PreviewRoute,element:HTMLElement){clicked={path:previewUrl(route),element};}
export function prepareProjectTransit(previous:PreviewRoute,next:PreviewRoute):'index'|undefined {
 intent=undefined;const link=clicked?.path===previewUrl(next)?clicked.element:undefined;clicked=undefined;
 const focus=link?.hasAttribute('data-gallery-index')?'index':document.activeElement?.hasAttribute('data-gallery-index')?'index':undefined;
 if(previous.locale!==next.locale||next.page!=='projects'||previous.project===next.project)return focus;
 if(!previous.project&&previous.page!=='projects'&&previous.page!=='home')return focus;
 // This protected case opens with semantic architecture rather than an image.
 if(next.project==='umniah-youthconnect')return focus;
 const origin=next.project??galleryMemory.read(next.locale).origin??previous.project;
 const source=link?.querySelector<HTMLImageElement>('.gallery-artwork img,.neighbor-visual img,.project-media-primary img')??(previous.project?document.querySelector<HTMLImageElement>('.case-opening-visual img'):document.querySelector<HTMLImageElement>(`[data-project="${next.project}"] .gallery-artwork img,[data-home-scene="${next.project}"] .project-media-primary img`));
 if(!source?.complete||!source.naturalWidth)return focus;const r=source.getBoundingClientRect();
 if(r.bottom<=90||r.top>=innerHeight||r.width<20||r.height<20)return focus;
 intent={source,destination:next,origin};
 return focus;
}
export const incomingProjectVisual=(id:string)=>activeProject===id;
/** A transient image owns its geometry while React commits the actual next route.
 * It is never a screenshot, never interactive, and never survives cancellation. */
export function runProjectTransit(stage:HTMLElement,commit:()=>void,complete:()=>void){
 const prepared=intent;intent=undefined;
 if(!prepared?.source.isConnected)return null;
 const source=prepared.source,r=source.getBoundingClientRect(),id=++activeId;
 if(r.bottom<=0||r.top>=innerHeight)return null;
 activeProject=prepared.destination.project;
 const wrapper=document.createElement('div'),image=document.createElement('img');
 wrapper.className='project-transit-image';wrapper.setAttribute('aria-hidden','true');wrapper.dataset.owner=String(id);
 const style=getComputedStyle(source);image.src=source.currentSrc||source.src;image.alt='';image.style.objectFit=style.objectFit;image.style.objectPosition=style.objectPosition;wrapper.style.borderRadius=style.borderRadius;
 Object.assign(wrapper.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});wrapper.append(image);document.body.append(wrapper);wrapper.style.willChange='transform,opacity';
 document.documentElement.dataset.projectTransit='leaving';stage.inert=true;
 let alive=true,didCommit=false,frame=0,handoffTimer=0,landed=false,target:HTMLImageElement|null=null,timeline:gsap.core.Timeline;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const settle=()=>{const needsCommit=!didCommit;cleanup();context.revert();if(needsCommit){didCommit=true;commit();}complete();};
 const motionChange=()=>{if(reduced.matches)settle();};
 const follow=()=>{if(!landed||!target||!alive)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(alive&&target){const box=target.getBoundingClientRect();gsap.set(wrapper,{x:box.left-r.left,y:box.top-r.top});}});};
 const cleanup=()=>{if(!alive)return;alive=false;cancelAnimationFrame(frame);clearTimeout(handoffTimer);reduced.removeEventListener('change',motionChange);removeEventListener('resize',settle);removeEventListener('scroll',follow);timeline?.kill();wrapper.remove();target?.classList.remove('project-transit-target');stage.inert=false;if(activeId===id){activeProject=undefined;cancelActive=undefined;delete document.documentElement.dataset.projectTransit;}};
 const handoff=()=>{
  if(!alive||!target)return;landed=true;document.documentElement.dataset.projectTransit='settling';
  const destination=target;
  let revealing=false,promoted=false;
  const reveal=()=>{if(!alive||revealing)return;revealing=true;clearTimeout(handoffTimer);landed=false;timeline=gsap.timeline({id:'project:visual:handoff',onComplete:()=>{cleanup();complete();}}).to(wrapper,{opacity:0,duration:.12,onStart:()=>destination.classList.remove('project-transit-target')});};
  // A decoded source remains visible even on a slow destination request.
  // If that request fails, the authentic cached cover is the safe fallback.
  const fallback=()=>{if(!alive||promoted||revealing)return;promoted=true;clearTimeout(handoffTimer);destination.srcset='';destination.src=image.src;void destination.decode().then(reveal,reveal);};
  handoffTimer=window.setTimeout(fallback,4000);
  void destination.decode().then(reveal,fallback);
 };
 const context=gsap.context(()=>{
  timeline=gsap.timeline({id:'project:visual:exit',onComplete:()=>{
   if(!alive)return;stage.inert=false;didCommit=true;commit();document.documentElement.dataset.projectTransit='arriving';
   const started=performance.now();document.documentElement.dataset.projectTransit='preparing';
   const arrive=()=>{
    if(!alive)return;
    target=prepared.destination.project?document.querySelector<HTMLImageElement>(`.case-study--${prepared.destination.project} .case-opening-visual img`):document.querySelector<HTMLImageElement>(`[data-project="${prepared.origin}"] .gallery-artwork img,[data-home-scene="${prepared.origin}"] .project-media-primary img`);
    const nextStage=document.querySelector<HTMLElement>('.route-stage');
    if(target&&nextStage!==stage)target.classList.add('project-transit-target');
    if((!target||nextStage===stage||nextStage?.dataset.routeReady!=='ready')&&performance.now()-started<750){frame=requestAnimationFrame(arrive);return;}
    frame=requestAnimationFrame(()=>{
     if(!alive)return;const to=target?.getBoundingClientRect();
     if(!target||!to||to.width<20||to.bottom<=80||to.top>=innerHeight){timeline=gsap.timeline({id:'project:visual:fallback',onComplete:()=>{cleanup();complete();}}).to(wrapper,{opacity:0,duration:.18});return;}
     target.classList.add('project-transit-target');
     // Freeze one source texture and read settled endpoint geometry once.
     // Only compositor transforms change during the shared-image flight.
     gsap.set(wrapper,{scale:1,transformOrigin:'0 0'});document.documentElement.dataset.projectTransit='arriving';
     timeline=gsap.timeline({id:'project:visual:arrive',onComplete:handoff})
      .to(wrapper,{x:to.left-r.left,y:to.top-r.top,scaleX:to.width/r.width,scaleY:to.height/r.height,duration:.56,ease:'power3.inOut',force3D:true})
      ;
    });
   };frame=requestAnimationFrame(arrive);
  }})
   .to(stage,{opacity:0,duration:.22,ease:'power2.inOut'},0)
   .to(wrapper,{opacity:1,duration:.18},0);
 });
 reduced.addEventListener('change',motionChange);
 addEventListener('resize',settle,{passive:true});
 addEventListener('scroll',follow,{passive:true});
 cancelActive=()=>{cleanup();context.revert();complete();};
 return {context,dispose:()=>{cleanup();context.revert();}};
}
