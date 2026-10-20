import {useLayoutEffect,type RefObject} from 'react';
import {onLayoutResize} from './layout-resize';
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
    own(()=>{
     if(!group.matches('.journey-folio-arrival')){gsap.fromTo(group,{y:30,opacity:0},{y:0,opacity:1,duration:.9,ease:'expo.out',clearProps:'transform,opacity'});return;}
     // A chapter unfolds in reading order: marker, period and title, context, then each role card.
     const rtl=document.documentElement.dir==='rtl';
     // Most chapters have no context paragraphs; an empty target only makes GSAP warn.
     const context=group.querySelectorAll('.journey-responsibilities li,.journey-entry-context p');
     const timeline=gsap.timeline({defaults:{ease:'expo.out'}});
     if(context.length)timeline.fromTo(context,{y:18,opacity:0},{y:0,opacity:1,duration:.8,stagger:.05,clearProps:'transform,opacity'},.2);
     timeline
      .fromTo(group.querySelector('.journey-track-index'),{scale:0,opacity:0},{scale:1,opacity:1,duration:.7,clearProps:'transform,opacity'},0)
      .fromTo(group.querySelectorAll('.journey-company-header>*'),{x:rtl?28:-28,opacity:0},{x:0,opacity:1,duration:.95,stagger:.08,clearProps:'transform,opacity'},.05)
      // Role cards rise and unfold from their top edge. Transform/opacity only: the former clip-path
      // reveal repainted every large card on every frame and made the chapter arrivals stutter.
      .fromTo(group.querySelectorAll('.journey-role'),{y:24,scaleY:.94,opacity:0,transformOrigin:'50% 0%'},{y:0,scaleY:1,opacity:1,duration:1.05,stagger:.14,clearProps:'transform,opacity,transformOrigin'},.28)
      .fromTo(group.querySelectorAll('.journey-role-points li'),{y:14,opacity:0},{y:0,opacity:1,duration:.7,stagger:.04,clearProps:'transform,opacity'},.5);
    });
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
   element.addEventListener('focusin',focus);const unresize=onLayoutResize(interrupt);addEventListener('popstate',interrupt);addEventListener('hashchange',interrupt);document.addEventListener('visibilitychange',visibility);
   cleanup=()=>{alive=false;cancelAnimationFrame(frame);observer?.disconnect();readiness?.disconnect();settle();pointerContext?.revert();stage?.removeEventListener('pointerenter',enter);stage?.removeEventListener('pointermove',move);stage?.removeEventListener('pointerleave',reset);element.removeEventListener('focusin',focus);unresize();removeEventListener('popstate',interrupt);removeEventListener('hashchange',interrupt);document.removeEventListener('visibilitychange',visibility);};
  };
  // Reading state: the chapter crossing the middle of the viewport drives the rail and
  // the progress line. Transform-only writes, coalesced to one per frame.
  const folios=[...element.querySelectorAll<HTMLElement>('.journey-folio-arrival')],list=element.querySelector<HTMLElement>('.journey-folios');
  let readFrame=0;const bar=list?.querySelector<HTMLElement>('.journey-progress i');
  // All reads first, then one write to the progress line's own transform. (Writing an inherited
  // custom property on the chapter list restyled every chapter on each scroll frame, and reading
  // layout after that write forced a synchronous reflow: the Journey page stuttered while scrolling.)
  const read=()=>{readFrame=0;if(!list)return;
   const mid=innerHeight*.5,box=list.getBoundingClientRect();
   let active=0;folios.forEach((folio,index)=>{if(folio.getBoundingClientRect().top<=mid)active=index;});
   if(bar)bar.style.transform=`scaleY(${Math.min(1,Math.max(0,(mid-box.top)/Math.max(1,box.height))).toFixed(4)})`;
   if(element.dataset.journeyActive!==String(active)){element.dataset.journeyActive=String(active);folios.forEach((folio,index)=>folio.toggleAttribute('data-active',index===active));}
  };
  const scheduleRead=()=>{if(!readFrame)readFrame=requestAnimationFrame(read);};
  addEventListener('scroll',scheduleRead,{passive:true});addEventListener('resize',scheduleRead,{passive:true});read();
  media.addEventListener('change',configure);pointer.addEventListener('change',configure);configure();
  return()=>{cancelAnimationFrame(readFrame);removeEventListener('scroll',scheduleRead);removeEventListener('resize',scheduleRead);delete element.dataset.journeyActive;cleanup?.();media.removeEventListener('change',configure);pointer.removeEventListener('change',configure);delete element.dataset.journeyMotion;};
 },[locale]);
}
