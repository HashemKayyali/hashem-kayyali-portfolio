import type {RefObject} from 'react';
import {gsap} from 'gsap';import {useGSAP} from '@gsap/react';
import {allowsMotion} from './route-motion';
import {incomingProjectVisual} from './project-transit';
import {observeCaseBody} from './case-body-motion';
gsap.registerPlugin(useGSAP);
export function useCaseMotion(root:RefObject<HTMLElement|null>,key:string,rtl:boolean) {
 useGSAP(()=>{
  const el=root.current;if(!el)return;
  const mm=gsap.matchMedia();mm.add('(prefers-reduced-motion:no-preference)',()=>{
   if(!allowsMotion())return;
   const id=el.className.match(/case-study--([^ ]+)/)?.[1]??'project';
   const sharedArrival=incomingProjectVisual(id);
   const setup=()=>{
   el.dataset.entrance=sharedArrival?'complete':'running';
   if(!sharedArrival){
   const opening=gsap.timeline({id:`case:${id}:opening`,defaults:{ease:'power3.out'},onComplete:()=>{el.dataset.entrance='complete';}});
   opening.from('.case-title-text',{y:22,clipPath:rtl?'inset(0 0 0 75%)':'inset(0 75% 0 0)',duration:.95,ease:'power3.inOut',clearProps:'clipPath,transform'},0)
    .from('.case-opening .project-meta,.case-deck,.case-opening-actions',{y:12,duration:.8,stagger:.07},.1)
    .from('.case-keyline',{scaleX:0,transformOrigin:rtl?'100% 50%':'0 50%',duration:.7},.4);
   // Explicit percentage sides keep GSAP's endpoints interpolable. Unitless
   // zeros serialize to a one-value inset, leaving the cover stuck until the end.
   if(!sharedArrival)opening.fromTo('.case-opening-visual',{clipPath:rtl?'inset(0% 0% 0% 70%)':'inset(0% 70% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.1,ease:'power3.inOut',clearProps:'clipPath'},.07);
   const openingDepth=el.querySelector('.case-opening-visual .case-image-depth'),inset=el.querySelector('.case-opening-inset');
   if(openingDepth&&!sharedArrival)opening.from(openingDepth,{y:12,duration:1.1,clearProps:'transform'},.07);
   if(inset)opening.from(inset,{y:25,duration:1},.35);
   }
   return observeCaseBody(el,rtl);
   };
   // Defer case animation setup until the shared image has landed. Chapter
   // observer/layout setup stays out of the compositor-only image flight.
   const owned=gsap.context(()=>{},el);let pending=0,disposed=false,cleanup:(()=>void)|undefined;
   const begin=()=>{if(disposed)return;if(sharedArrival&&incomingProjectVisual(id)){pending=requestAnimationFrame(begin);return;}owned.add(()=>{cleanup=setup();});};
   begin();
   return()=>{disposed=true;cancelAnimationFrame(pending);cleanup?.();owned.revert();};
  },el);return()=>mm.revert();
 },{scope:root,dependencies:[key],revertOnUpdate:true});
}
