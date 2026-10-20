import {gsap} from 'gsap';
import {onLayoutResize} from './layout-resize';
import {projectAssets} from '../data/projectAssets';import type {ProjectId} from '../content/types';
import {caseOpeningSizes,storySources} from './StoryMedia';import type {PreviewRoute} from './routes';import {previewUrl} from './routes';
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
 // Same src/srcset/sizes as the case-opening cover, so this warms the exact candidate the case will pick.
 const {src,srcSet}=storySources(getStudioProjectCover(id)?.url??asset.image),key=id+':'+src;
 if(decoded.has(key))return decoded.get(key)!;
 const image=new Image();image.decoding='async';image.sizes=caseOpeningSizes;if(srcSet)image.srcset=srcSet;image.src=src;
 const result=image.decode().then(()=>image,()=>undefined);decoded.set(key,result);
 if(decoded.size>4)decoded.delete(decoded.keys().next().value!);return result;
}

/** The rectangle the image pixels actually occupy (object-fit contain letterboxes; cover/fill fill the box). */
function visibleRect(image:HTMLImageElement){
 const box=image.getBoundingClientRect(),style=getComputedStyle(image);
 const pad={l:parseFloat(style.paddingLeft)||0,r:parseFloat(style.paddingRight)||0,t:parseFloat(style.paddingTop)||0,b:parseFloat(style.paddingBottom)||0};
 const inner={left:box.left+pad.l,top:box.top+pad.t,width:Math.max(1,box.width-pad.l-pad.r),height:Math.max(1,box.height-pad.t-pad.b)};
 const ratio=image.naturalWidth&&image.naturalHeight?image.naturalWidth/image.naturalHeight:inner.width/inner.height;
 const rect=(left:number,top:number,width:number,height:number,cover:boolean)=>({left,top,width,height,right:left+width,bottom:top+height,cover});
 if(style.objectFit!=='contain'&&style.objectFit!=='scale-down')return rect(inner.left,inner.top,inner.width,inner.height,style.objectFit==='cover');
 const width=Math.min(inner.width,inner.height*ratio),height=width/ratio;
 return rect(inner.left+(inner.width-width)/2,inner.top+(inner.height-height)/2,width,height,false);
}
const radiusOf=(image:HTMLImageElement)=>parseFloat(getComputedStyle(image).borderTopLeftRadius)||parseFloat(getComputedStyle(image.parentElement!).borderTopLeftRadius)||0;
export function rememberProjectLink(route:PreviewRoute,element:HTMLElement){clicked={path:previewUrl(route),element};}
export function prepareProjectTransit(previous:PreviewRoute,next:PreviewRoute):'index'|undefined {
 intent=undefined;const link=clicked?.path===previewUrl(next)?clicked.element:undefined;clicked=undefined;
 const focus=link?.hasAttribute('data-gallery-index')?'index':document.activeElement?.hasAttribute('data-gallery-index')?'index':undefined;
 if(previous.locale!==next.locale||next.page!=='projects'||previous.project===next.project)return focus;
 if(!previous.project&&previous.page!=='projects'&&previous.page!=='home')return focus;
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
 const source=prepared.source,r=visibleRect(source),id=++activeId;
 if(r.bottom<=0||r.top>=innerHeight)return null;
 activeProject=prepared.destination.project;
 const wrapper=document.createElement('div'),image=document.createElement('img');
 wrapper.className='project-transit-image';wrapper.setAttribute('aria-hidden','true');wrapper.dataset.owner=String(id);
 const style=getComputedStyle(source);image.src=source.currentSrc||source.src;image.alt='';
 // The flying layer starts exactly on the visible image pixels: same crop rule as the source, its own radius.
 image.style.objectFit=r.cover?'cover':'fill';image.style.objectPosition=style.objectPosition;const startRadius=radiusOf(source);wrapper.style.borderRadius=startRadius+'px';
 Object.assign(wrapper.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});wrapper.append(image);document.body.append(wrapper);wrapper.style.willChange='transform,opacity';
 document.documentElement.dataset.projectTransit='leaving';stage.inert=true;
 let alive=true,didCommit=false,frame=0,handoffTimer=0,landed=false,target:HTMLImageElement|null=null,timeline:gsap.core.Timeline;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const settle=()=>{const needsCommit=!didCommit;cleanup();context.revert();if(needsCommit){didCommit=true;commit();}complete();};
 const motionChange=()=>{if(reduced.matches)settle();};
 let base={left:r.left,top:r.top};
 const follow=()=>{if(!landed||!target||!alive)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(alive&&target){const box=visibleRect(target);gsap.set(wrapper,{x:box.left-base.left,y:box.top-base.top});}});};
 const cleanup=()=>{if(!alive)return;alive=false;cancelAnimationFrame(frame);clearTimeout(handoffTimer);reduced.removeEventListener('change',motionChange);unresize();removeEventListener('scroll',follow);timeline?.kill();wrapper.remove();target?.classList.remove('project-transit-target');stage.inert=false;if(activeId===id){activeProject=undefined;cancelActive=undefined;delete document.documentElement.dataset.projectTransit;}};
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
     if(!alive)return;const to=target?visibleRect(target):undefined;
     if(!target||!to||to.width<20||to.bottom<=80||to.top>=innerHeight){timeline=gsap.timeline({id:'project:visual:fallback',onComplete:()=>{cleanup();complete();}}).to(wrapper,{opacity:0,duration:.18});return;}
     target.classList.add('project-transit-target');
     // Freeze one source texture and read settled endpoint geometry once.
     // Only compositor transforms change during the shared-image flight.
     // Inverse FLIP: the layer is re-laid out at the destination size and scaled down to the source,
     // so it is rasterised at full size (no blurry upscale that sharpened with a snap on landing).
     // When the destination file is already decoded the layer adopts it, so the handoff swaps nothing.
     if(target.complete&&target.naturalWidth&&target.currentSrc)image.src=target.currentSrc;
     const k=r.width/to.width;base={left:to.left,top:to.top};
     gsap.set(wrapper,{left:to.left,top:to.top,width:to.width,height:to.height,x:r.left-to.left,y:r.top-to.top,scaleX:k,scaleY:r.height/to.height,transformOrigin:'0 0',borderRadius:startRadius/Math.max(.05,k)});
     document.documentElement.dataset.projectTransit='arriving';
     timeline=gsap.timeline({id:'project:visual:arrive',onComplete:handoff})
      .to(wrapper,{x:0,y:0,scaleX:1,scaleY:1,borderRadius:radiusOf(target),duration:.62,ease:'power3.inOut',force3D:true})
      ;
    });
   };frame=requestAnimationFrame(arrive);
  }})
   .to(stage,{opacity:0,duration:.22,ease:'power2.inOut'},0)
   .to(wrapper,{opacity:1,duration:.18},0);
 });
 reduced.addEventListener('change',motionChange);
 const unresize=onLayoutResize(settle);
 addEventListener('scroll',follow,{passive:true});
 cancelActive=()=>{cleanup();context.revert();complete();};
 return {context,dispose:()=>{cleanup();context.revert();}};
}
