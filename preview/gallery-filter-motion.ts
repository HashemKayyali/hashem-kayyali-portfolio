import {useLayoutEffect,useRef,type RefObject} from 'react';
import {onLayoutResize} from './layout-resize';
import {gsap} from 'gsap';import {Flip} from 'gsap/Flip';
import {allowsMotion} from './route-motion';
gsap.registerPlugin(Flip);

/** Retain project nodes; only one owner animates their layout. */
export function useGalleryFilterMotion(root:RefObject<HTMLElement|null>,filter:string,locale:string){
 const snapshot=useRef<ReturnType<typeof Flip.getState>|null>(null),active=useRef<gsap.core.Timeline|null>(null);
 const prepare=()=>{
  const grid=root.current?.querySelector<HTMLElement>('.gallery-exhibits');if(!grid)return;
  const cards=grid.querySelectorAll('.gallery-exhibit');
  // Runtime supports soft capture; its bundled type omits the kill option.
  const captureOptions={kill:false,simple:!active.current?.isActive()};
  const state=allowsMotion()?Flip.getState(cards,captureOptions):null;
  active.current?.progress(1).kill();active.current=null;
  if(!state){snapshot.current=null;return;}
  snapshot.current=state;
  grid.style.minHeight=grid.getBoundingClientRect().height+'px';
 };
 useLayoutEffect(()=>{
  const grid=root.current?.querySelector<HTMLElement>('.gallery-exhibits');if(!grid)return;
  const cards=[...grid.querySelectorAll<HTMLElement>('.gallery-exhibit')];
  cards.forEach(card=>{card.inert=card.dataset.filtered==='true';});
  const state=snapshot.current;snapshot.current=null;if(!state)return;
  if(!allowsMotion()){grid.style.removeProperty('min-height');return;}
  grid.dataset.filtering='true';
  const finish=()=>{delete grid.dataset.filtering;grid.style.removeProperty('min-height');};
  active.current=Flip.from(state,{targets:cards,absoluteOnLeave:true,scale:true,fade:true,prune:true,duration:.36,stagger:.008,ease:'power3.inOut',
   onEnter:elements=>gsap.fromTo(elements,{opacity:0,scale:.96},{opacity:1,scale:1,duration:.32,ease:'power2.out'}),
   onLeave:elements=>gsap.to(elements,{opacity:0,duration:.18,ease:'power2.out'}),onComplete:finish,onInterrupt:finish});
 },[filter,locale]);
 useLayoutEffect(()=>()=>{active.current?.progress(1).kill();active.current=null;snapshot.current=null;},[locale]);
 useLayoutEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const stop=()=>{if(reduced.matches){active.current?.progress(1).kill();active.current=null;}};
  const settle=()=>{active.current?.progress(1);};
  const focus=(event:FocusEvent)=>{if((event.target as HTMLElement).closest('.gallery-exhibit'))settle();};
  const el=root.current;el?.addEventListener('focusin',focus);const unresize=onLayoutResize(settle);
  reduced.addEventListener('change',stop);
  return()=>{el?.removeEventListener('focusin',focus);unresize();reduced.removeEventListener('change',stop);active.current?.progress(1).kill();active.current=null;snapshot.current=null;};
 },[]);
 return prepare;
}
