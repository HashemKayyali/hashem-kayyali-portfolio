import {useLayoutEffect,type RefObject} from 'react';
import {onLayoutResize} from './layout-resize';
import {gsap} from 'gsap';
import {allowsMotion} from './route-motion';

/*
 * Owner decision (24 Oct 2026): Experience has no entrance animations at all. Even the light
 * per-card reveals stuttered on a phone while scrolling, and the page scrolled smoothly once
 * they had finished. Everything is rendered in its final state; what remains is the reading
 * state (progress line, active chapter for the desktop rail) and the desktop logo tilt on hover.
 */
export function useExperienceJourneyMotion(root:RefObject<HTMLElement|null>,locale:string) {
 useLayoutEffect(()=>{
  const element=root.current;if(!element)return;
  const media=matchMedia('(prefers-reduced-motion:no-preference)'),pointer=matchMedia('(hover:hover) and (pointer:fine)');
  let cleanup:(()=>void)|undefined;
  const configure=()=>{
   cleanup?.();const enabled=media.matches&&allowsMotion()&&pointer.matches;element.dataset.journeyMotion=enabled?'interactive':'static';
   if(!enabled)return;
   const stage=element.querySelector<HTMLElement>('.journey-plane-stage'),depth=element.querySelector<HTMLElement>('.journey-plane-depth');
   let bounds:DOMRect|undefined,pointerContext:gsap.Context|undefined,rotateX:ReturnType<typeof gsap.quickTo>|undefined,rotateY:ReturnType<typeof gsap.quickTo>|undefined;
   const reset=()=>{bounds=undefined;rotateX?.(0);rotateY?.(0);};
   const enter=(event:PointerEvent)=>{
    if(event.pointerType!=='mouse'||!depth||!stage)return;
    pointerContext?.revert();bounds=stage.getBoundingClientRect();pointerContext=gsap.context(()=>{rotateX=gsap.quickTo(depth,'rotationX',{duration:.5,ease:'power3.out'});rotateY=gsap.quickTo(depth,'rotationY',{duration:.5,ease:'power3.out'});},element);
   };
   const move=(event:PointerEvent)=>{if(!bounds||event.pointerType!=='mouse')return;rotateX?.(gsap.utils.clamp(-3,3,-(event.clientY-bounds.top-bounds.height/2)/bounds.height*6));rotateY?.(gsap.utils.clamp(-4,4,(event.clientX-bounds.left-bounds.width/2)/bounds.width*8));};
   const unresize=onLayoutResize(reset);
   stage?.addEventListener('pointerenter',enter);stage?.addEventListener('pointermove',move);stage?.addEventListener('pointerleave',reset);
   cleanup=()=>{pointerContext?.revert();unresize();stage?.removeEventListener('pointerenter',enter);stage?.removeEventListener('pointermove',move);stage?.removeEventListener('pointerleave',reset);};
  };
  // Reading state: the chapter crossing the middle of the viewport drives the rail and
  // the progress line. Transform-only writes, coalesced to one per frame.
  const folios=[...element.querySelectorAll<HTMLElement>('.journey-folio-arrival')],list=element.querySelector<HTMLElement>('.journey-folios');
  let readFrame=0;const bar=list?.querySelector<HTMLElement>('.journey-progress i');
  // Geometry is measured once (and again when the section resizes), so a scroll frame only does
  // arithmetic and one write to the progress line's own transform.
  let tops:number[]=[],listTop=0,listHeight=1,measured=false;
  const measure=()=>{
   if(!list)return;const base=scrollY,box=list.getBoundingClientRect();
   listTop=box.top+base;listHeight=Math.max(1,box.height);tops=folios.map(folio=>folio.getBoundingClientRect().top+base);measured=true;
  };
  const read=()=>{readFrame=0;if(!list)return;
   if(!measured)measure();
   const mid=innerHeight*.5,offset=scrollY;
   let active=0;tops.forEach((top,index)=>{if(top-offset<=mid)active=index;});
   if(bar)bar.style.transform=`scaleY(${Math.min(1,Math.max(0,(mid-(listTop-offset))/listHeight)).toFixed(4)})`;
   if(element.dataset.journeyActive!==String(active)){element.dataset.journeyActive=String(active);folios.forEach((folio,index)=>folio.toggleAttribute('data-active',index===active));}
  };
  const scheduleRead=()=>{if(!readFrame)readFrame=requestAnimationFrame(read);};
  addEventListener('scroll',scheduleRead,{passive:true});addEventListener('resize',scheduleRead,{passive:true});read();
  // Any height change inside the section (fonts, images, wrapping) moves the chapters.
  const resizeObserver=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(()=>{measured=false;scheduleRead();});resizeObserver?.observe(element);
  media.addEventListener('change',configure);pointer.addEventListener('change',configure);configure();
  return()=>{cancelAnimationFrame(readFrame);removeEventListener('scroll',scheduleRead);removeEventListener('resize',scheduleRead);resizeObserver?.disconnect();delete element.dataset.journeyActive;cleanup?.();media.removeEventListener('change',configure);pointer.removeEventListener('change',configure);delete element.dataset.journeyMotion;};
 },[locale]);
}
