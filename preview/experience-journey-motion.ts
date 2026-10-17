import {useLayoutEffect,type RefObject} from 'react';
import {gsap} from 'gsap';
import {allowsMotion} from './route-motion';

/** CSS is the readable baseline. One owner for arrivals and bounded mark depth. */
export function useExperienceJourneyMotion(root:RefObject<HTMLElement|null>,locale:string) {
 useLayoutEffect(()=>{
  const element=root.current;if(!element)return;
  const media=matchMedia('(prefers-reduced-motion:no-preference)'),pointer=matchMedia('(hover:hover) and (pointer:fine)');
  let cleanup:(()=>void)|undefined;const seen=new Set<Element>();
  const configure=()=>{
   cleanup?.();const enabled=media.matches&&allowsMotion();element.dataset.journeyMotion=enabled?'interactive':'static';
   if(!enabled)return;
   let alive=true,frame=0,observer:IntersectionObserver|undefined,readiness:MutationObserver|undefined;
   const contexts=new Set<gsap.Context>();
   const own=(create:()=>void)=>{const context=gsap.context(create,element);contexts.add(context);return context;};
   const settle=()=>{for(const context of contexts)context.revert();contexts.clear();};
   const arrive=(group:HTMLElement)=>{
    if(!alive||seen.has(group))return;seen.add(group);
    if(document.hidden||group.contains(document.activeElement))return;
    own(()=>{gsap.fromTo(group,{y:16,opacity:.6},{y:0,opacity:1,duration:.55,ease:'power3.out',clearProps:'transform,opacity'});});
   };
   const observe=()=>{
    if(!alive)return;readiness?.disconnect();
    if(scrollY<80)own(()=>{gsap.fromTo(element.querySelectorAll('.journey-plane'),{y:20,rotationX:-15,opacity:.5},{y:0,rotationX:0,opacity:1,duration:.7,stagger:.055,ease:'expo.out',clearProps:'transform,opacity'});});
    if(typeof IntersectionObserver==='undefined')return;
    observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){arrive(entry.target as HTMLElement);observer?.unobserve(entry.target);}},{rootMargin:'0px 0px -5% 0px',threshold:.04});
    for(const group of element.querySelectorAll<HTMLElement>('[data-journey-reveal]')){
     if(scrollY>80&&group.getBoundingClientRect().top<innerHeight){seen.add(group);continue;}if(!seen.has(group))observer.observe(group);
    }
   };
   const routeStage=element.closest<HTMLElement>('.route-stage');
   if(routeStage&&routeStage.dataset.routeReady!=='ready'){
    readiness=new MutationObserver(()=>{if(routeStage.dataset.routeReady==='ready')observe();});readiness.observe(routeStage,{attributes:true,attributeFilter:['data-route-ready']});
   }else frame=requestAnimationFrame(observe);
   const stage=element.querySelector<HTMLElement>('.journey-plane-stage'),depth=element.querySelector<HTMLElement>('.journey-plane-depth');
   let bounds:DOMRect|undefined,pointerContext:gsap.Context|undefined,rotateX:ReturnType<typeof gsap.quickTo>|undefined,rotateY:ReturnType<typeof gsap.quickTo>|undefined;
   const reset=()=>{bounds=undefined;rotateX?.(0);rotateY?.(0);};
   const enter=(event:PointerEvent)=>{
    if(event.pointerType!=='mouse'||!pointer.matches||!depth||!stage)return;
    pointerContext?.revert();bounds=stage.getBoundingClientRect();pointerContext=gsap.context(()=>{rotateX=gsap.quickTo(depth,'rotationX',{duration:.5,ease:'power3.out'});rotateY=gsap.quickTo(depth,'rotationY',{duration:.5,ease:'power3.out'});},element);
   };
   const move=(event:PointerEvent)=>{if(!bounds||event.pointerType!=='mouse')return;rotateX?.(gsap.utils.clamp(-3,3,-(event.clientY-bounds.top-bounds.height/2)/bounds.height*6));rotateY?.(gsap.utils.clamp(-4,4,(event.clientX-bounds.left-bounds.width/2)/bounds.width*8));};
   const interrupt=()=>{settle();reset();};
   const focus=(event:FocusEvent)=>{const group=(event.target as HTMLElement).closest('[data-journey-reveal]');if(group){seen.add(group);observer?.unobserve(group);}interrupt();};
   const visibility=()=>{if(document.hidden)interrupt();};
   stage?.addEventListener('pointerenter',enter);stage?.addEventListener('pointermove',move);stage?.addEventListener('pointerleave',reset);
   element.addEventListener('focusin',focus);addEventListener('resize',interrupt,{passive:true});addEventListener('popstate',interrupt);addEventListener('hashchange',interrupt);document.addEventListener('visibilitychange',visibility);
   cleanup=()=>{alive=false;cancelAnimationFrame(frame);observer?.disconnect();readiness?.disconnect();settle();pointerContext?.revert();stage?.removeEventListener('pointerenter',enter);stage?.removeEventListener('pointermove',move);stage?.removeEventListener('pointerleave',reset);element.removeEventListener('focusin',focus);removeEventListener('resize',interrupt);removeEventListener('popstate',interrupt);removeEventListener('hashchange',interrupt);document.removeEventListener('visibilitychange',visibility);};
  };
  media.addEventListener('change',configure);pointer.addEventListener('change',configure);configure();
  return()=>{cleanup?.();media.removeEventListener('change',configure);pointer.removeEventListener('change',configure);delete element.dataset.journeyMotion;};
 },[locale]);
}
