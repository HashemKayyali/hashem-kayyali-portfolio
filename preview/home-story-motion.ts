import type {RefObject} from 'react';
import {useGSAP} from '@gsap/react';
import {gsap} from 'gsap';
import {allowsMotion} from './route-motion';

gsap.registerPlugin(useGSAP);
/** Native sticky layout and one bounded evidence sequence, on every viewport. */
export function useHomeStoryMotion(root:RefObject<HTMLDivElement|null>,locale:string){
 useGSAP(()=>{
  const element=root.current;if(!element)return;
  const chapters=[...element.querySelectorAll<HTMLElement>('[data-story-chapter]')];
  const sheets=[...element.querySelectorAll<HTMLElement>('[data-story-sheet]')];
  const method=element.querySelector<HTMLElement>('.story-method-layout');
  if(!method||sheets.length!==3)return;
  let alive=true,frame=0,selected=-1,inView=true,header=0;
  const media=matchMedia('(prefers-reduced-motion:reduce)');
  const wide=matchMedia('(min-width:900px) and (min-height:650px)');
  const owned=gsap.context(()=>{},element),arrivals=new Map<HTMLElement,gsap.core.Timeline>();
  let sequence:gsap.core.Timeline,transition:gsap.core.Tween|undefined;
  const assemble=()=>owned.add(()=>{
   transition?.kill();sequence?.kill();
   gsap.set(sheets,{autoAlpha:0,y:wide.matches?70:12,rotation:index=>wide.matches&&index===1?2:0,scale:1,transformOrigin:'50% 80%'});gsap.set(sheets[0],{autoAlpha:1,y:0,rotation:wide.matches?-2:0});
   sequence=gsap.timeline({paused:true,id:'home-story:sheets'})
    .to(sheets[0],{autoAlpha:0,y:wide.matches?-25:-8,scale:wide.matches?.93:1,rotation:wide.matches?-4:0,duration:1,ease:'none'},0)
    .to(sheets[1],{autoAlpha:1,y:0,rotation:0,duration:1,ease:'none'},0)
    .to(sheets[1],{autoAlpha:0,y:wide.matches?-25:-8,scale:wide.matches?.93:1,rotation:wide.matches?-4:0,duration:1,ease:'none'},1)
    .to(sheets[2],{autoAlpha:1,y:0,rotation:0,duration:1,ease:'none'},1);
   if(selected>=0)sequence.time(selected);
  });
  assemble();
  element.dataset.storyMotion='native';
  const measure=()=>{
   frame=0;if(!alive||!inView)return;
   // Follow the chapter beside the sticky image, just below the fixed header.
   // The active step is the one passing the centre of the sticky board, so each image
   // arrives while the board is actually on screen beside its text.
   // Header height is cached (reset on resize): reading computed style each scroll frame forced a style flush.
   if(!header)header=parseFloat(getComputedStyle(element).getPropertyValue('--app-header-height'))||68;
   const board=element.querySelector<HTMLElement>('.story-visual')?.getBoundingClientRect();
   const line=board&&board.height?Math.min(Math.max(board.top+board.height*.4,header+120),innerHeight*.72):Math.min(innerHeight*.35,header+120);
   let next=0;
   chapters.forEach((chapter,index)=>{if(chapter.getBoundingClientRect().top<=line)next=index;});
   if(next===selected)return;selected=next;
   element.dataset.storyChapter=String(next);
   chapters.forEach((chapter,index)=>chapter.dataset.active=String(index===next));
   transition?.kill();
   if(!media.matches&&allowsMotion())transition=sequence!.tweenTo(next,{duration:.42,ease:'power2.inOut'});
   else sequence!.time(next);
   const meter=element.querySelector<HTMLElement>('.story-board-meter i');if(meter)meter.style.transform=`scaleX(${(next+1)/3})`;
  };
  const schedule=()=>{if(!frame&&alive)frame=requestAnimationFrame(measure);};
  const resized=()=>{header=0;schedule();};
  const motionChange=()=>{transition?.kill();if(selected>=0)sequence!.time(selected);for(const animation of arrivals.values())animation.progress(1);schedule();};
  const observer=typeof IntersectionObserver==='undefined'?undefined:new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(entry.target===method){inView=entry.isIntersecting;if(inView)schedule();continue;}
    if(!alive||!entry.isIntersecting||arrivals.has(entry.target as HTMLElement))continue;
    const node=entry.target as HTMLElement;observer?.unobserve(node);
    if(media.matches||!allowsMotion()||node.getBoundingClientRect().top<0)continue;
    owned.add(()=>{
     const animation=gsap.timeline({id:`home-story:arrival:${arrivals.size}`});
     if(node.matches('.story-contact'))animation
      .fromTo(node.querySelectorAll('.story-contact-word'),{yPercent:105},{yPercent:0,duration:1,stagger:.065,ease:'power4.out',clearProps:'transform'},0)
      .fromTo(node.querySelector('.story-correspondence-rule'),{scaleX:0},{scaleX:1,duration:1,ease:'power3.inOut'},.1)
      .fromTo(node.querySelector('.story-contact-action'),{y:16,opacity:.3},{y:0,opacity:1,duration:.7,ease:'power3.out',clearProps:'transform,opacity'},.2);
     else {
      const targets=node.matches('.story-chapter')?node.querySelectorAll('.story-step-label,h3,p'):node.querySelectorAll('.story-career-company,.story-career-role,.story-career-period');
      animation.fromTo(targets,{y:16,opacity:.3},{y:0,opacity:1,duration:.65,stagger:.055,ease:'power3.out',clearProps:'transform,opacity'});
      if(node.matches('.story-career-entry'))animation.fromTo(node.querySelector('.story-career-rule'),{scaleX:0},{scaleX:1,duration:.8,ease:'power3.inOut'},0);
     }
     arrivals.set(node,animation);
    });
   }
  },{rootMargin:'0px 0px -6% 0px',threshold:0});
  observer?.observe(method);
  element.querySelectorAll<HTMLElement>('.story-chapter,.story-career-entry,.story-contact').forEach(node=>observer?.observe(node));
  const focus=(event:FocusEvent)=>{const target=event.target as HTMLElement;for(const [node,animation] of arrivals)if(node.contains(target))animation.progress(1);};
  const action=element.querySelector<HTMLElement>('.story-contact-action'),arrow=action?.querySelector('svg');
  let x:ReturnType<typeof gsap.quickTo>|undefined,y:ReturnType<typeof gsap.quickTo>|undefined,bounds:DOMRect|undefined;
  owned.add(()=>{if(arrow){x=gsap.quickTo(arrow,'x',{duration:.35,ease:'power3.out'});y=gsap.quickTo(arrow,'y',{duration:.35,ease:'power3.out'});}});
  const enter=(event:PointerEvent)=>{if(event.pointerType==='mouse'&&!media.matches)bounds=action?.getBoundingClientRect();};
  const move=(event:PointerEvent)=>{if(!bounds||event.pointerType!=='mouse'||!allowsMotion())return;x?.(gsap.utils.clamp(-6,6,(event.clientX-bounds.left-bounds.width/2)*.08));y?.(gsap.utils.clamp(-5,5,(event.clientY-bounds.top-bounds.height/2)*.08));};
  const leave=()=>{bounds=undefined;x?.(0);y?.(0);};
  action?.addEventListener('pointerenter',enter);action?.addEventListener('pointermove',move);action?.addEventListener('pointerleave',leave);action?.addEventListener('blur',leave);
  const resize=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(schedule);resize?.observe(method);
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resized,{passive:true});media.addEventListener('change',motionChange);wide.addEventListener('change',assemble);element.addEventListener('focusin',focus);
  measure();
  return()=>{alive=false;cancelAnimationFrame(frame);transition?.kill();observer?.disconnect();resize?.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',resized);media.removeEventListener('change',motionChange);wide.removeEventListener('change',assemble);element.removeEventListener('focusin',focus);action?.removeEventListener('pointerenter',enter);action?.removeEventListener('pointermove',move);action?.removeEventListener('pointerleave',leave);action?.removeEventListener('blur',leave);owned.revert();element.dataset.storyMotion='static';delete element.dataset.storyChapter;chapters.forEach(chapter=>delete chapter.dataset.active);};
 },{scope:root,dependencies:[locale],revertOnUpdate:true});
}
