import {useLayoutEffect,useRef,type RefObject} from 'react';
import {gsap} from 'gsap';
import {allowsMotion} from './route-motion';
import {arrivalDisposition} from './viewport-arrivals-model';

type Arrival={node:HTMLElement;state:'armed'|'running'|'settled';context?:gsap.Context;timeline?:gsap.core.Timeline};
const arrivalGroups='.desk-introduction,.desk-email-pair,.desk-whatsapp,.desk-socials,.desk-signature,.desk-compose';

/** Contact owns its arrivals; the clickable channel hit areas stay stationary. */
export function useContactDeskMotion(root:RefObject<HTMLElement|null>,locale:string){
 const entered=useRef(false);
 useLayoutEffect(()=>{
  const el=root.current;if(!el)return;
  if(typeof IntersectionObserver==='undefined'||typeof MutationObserver==='undefined')return;
  const stage=el.closest<HTMLElement>('.route-stage'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const connection=(navigator as Navigator&{connection?:EventTarget}).connection;
  const records=new Map<HTMLElement,Arrival>(),disposers:Array<()=>void>=[];
  const interactions=gsap.context(()=>{},el);
  let alive=true,frame=0,initialized=false,paused=false,header:gsap.Context|undefined;
  const allowed=()=>!paused&&!document.hidden&&!reduced.matches&&allowsMotion();
  const ready=()=>!stage||stage.dataset.routeReady==='ready';
  const settle=(record:Arrival)=>{
   observer.unobserve(record.node);record.timeline?.kill();record.timeline=undefined;
   record.context?.revert();record.context=undefined;record.state='settled';
   record.node.dataset.contactEntrance='settled';
  };
  const settleAll=()=>{header?.revert();header=undefined;records.forEach(settle);};
  const enter=(record:Arrival,index:number)=>{
   if(!alive||record.state!=='armed')return;
   if(!allowed()||!ready()||record.node.contains(document.activeElement)){settle(record);return;}
   observer.unobserve(record.node);record.state='running';record.node.dataset.contactEntrance='running';
   try{
    record.context?.add(()=>{
     const timeline=gsap.timeline({id:`contact:arrival:${index}`,onComplete:()=>settle(record)});record.timeline=timeline;
     timeline.to(record.node,{y:0,opacity:1,duration:.55,ease:'power3.out',clearProps:'transform,opacity'},0);
     const edge=record.node.querySelector('.desk-compose-edge');
     if(edge)timeline.fromTo(edge,{scaleX:0},{scaleX:1,duration:.65,ease:'power3.out',transformOrigin:locale==='ar'?'100% 50%':'0 50%',clearProps:'transform'},.04);
    });
   }catch{settle(record);}
  };
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    const record=records.get(entry.target as HTMLElement);if(!record)continue;
    if(!allowed()||entry.boundingClientRect.bottom<=0){settle(record);continue;}
    if(entry.isIntersecting)enter(record,[...records.keys()].indexOf(record.node));
   }
  },{rootMargin:'0px 0px -4% 0px',threshold:0});
  const initialize=()=>{
   frame=0;if(!alive||initialized||!ready())return;initialized=true;
   const firstEntry=!entered.current;entered.current=true;
   if(allowed()&&firstEntry&&!el.querySelector('.contact-opening')?.contains(document.activeElement)){
    header=gsap.context(()=>{gsap.from(el.querySelectorAll('.contact-opening>*'),{y:10,duration:.42,stagger:.035,ease:'power3.out',clearProps:'transform',id:'contact:desk:header'});},el);
   }
   el.querySelectorAll<HTMLElement>(arrivalGroups).forEach(node=>{
    const record:Arrival={node,state:'settled'};records.set(node,record);
    const box=node.getBoundingClientRect();
    const disposition=arrivalDisposition({top:box.top,bottom:box.bottom,width:box.width,height:box.height,viewportHeight:innerHeight,rendered:node.getClientRects().length>0,focused:node.contains(document.activeElement),allowed:allowed()});
    if(disposition!=='armed'){settle(record);return;}
    try{
     record.context=gsap.context(()=>{gsap.set(node,{y:18,opacity:0});},el);
     record.state='armed';node.dataset.contactEntrance='armed';observer.observe(node);
    }catch{settle(record);}
   });
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(initialize);};
  const readiness=new MutationObserver(()=>{if(ready())schedule();else settleAll();});
  if(stage)readiness.observe(stage,{attributes:true,attributeFilter:['data-route-ready']});
  el.querySelectorAll<HTMLAnchorElement>('.desk-channel').forEach(link=>{
   const arrow=link.querySelector('.desk-arrow');if(!arrow)return;
   const enter=()=>{if(allowed())interactions.add(()=>{gsap.to(arrow,{x:document.documentElement.dir==='rtl'?-3:3,y:-3,duration:.23,overwrite:true});});};
   const leave=()=>{if(allowed())interactions.add(()=>{gsap.to(arrow,{x:0,y:0,duration:.28,overwrite:true});});};
   link.addEventListener('pointerenter',enter);link.addEventListener('pointerleave',leave);link.addEventListener('focus',enter);link.addEventListener('blur',leave);
   disposers.push(()=>{link.removeEventListener('pointerenter',enter);link.removeEventListener('pointerleave',leave);link.removeEventListener('focus',enter);link.removeEventListener('blur',leave);});
  });
  const focus=(event:FocusEvent)=>{if(!(event.target instanceof Node))return;header?.revert();header=undefined;records.forEach(record=>{if(record.node.contains(event.target as Node))settle(record);});};
  const policy=()=>{if(!allowed()){settleAll();interactions.revert();}};
  const pause=(event:Event)=>{paused=Boolean((event as CustomEvent).detail);policy();};
  const resize=()=>settleAll();
  el.addEventListener('focusin',focus);reduced.addEventListener('change',policy);connection?.addEventListener('change',policy);
  document.addEventListener('visibilitychange',policy);addEventListener('resize',resize,{passive:true});addEventListener('popstate',resize);addEventListener('portfolio-motion-pause',pause);
  schedule();
  return()=>{
   alive=false;cancelAnimationFrame(frame);readiness.disconnect();observer.disconnect();
   el.removeEventListener('focusin',focus);reduced.removeEventListener('change',policy);connection?.removeEventListener('change',policy);
   document.removeEventListener('visibilitychange',policy);removeEventListener('resize',resize);removeEventListener('popstate',resize);removeEventListener('portfolio-motion-pause',pause);
   disposers.forEach(dispose=>dispose());interactions.revert();settleAll();records.forEach(record=>delete record.node.dataset.contactEntrance);
  };
 },[root,locale]);
}
