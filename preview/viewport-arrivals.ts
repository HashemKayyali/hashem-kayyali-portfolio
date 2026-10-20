import {useLayoutEffect,type RefObject} from 'react';
import {onLayoutResize} from './layout-resize';
import {gsap} from 'gsap';
import {allowsMotion} from './route-motion';
import {arrivalDisposition} from './viewport-arrivals-model';

// Only gaps between established page timelines belong to this observer. The
// gallery and Contact already own their complete entrance; Case/Experience own
// their redesigned bodies. Never add an ancestor of an existing moving target.
const groups=[
 '.pulse-work-heading',
 '.home-story .story-heading',
 '.story-method-foot',
 '.story-contact-heading',
 '.dossier-index',
 '.dossier-toolkit>header',
 '.dossier-signoff',
 '.wb-inventory-heading',
 '.wb-inventory-foot',
 '.not-found',
].join(',');
const protectedTargets=[
 '[data-arrivals-owned]', '.signature-case', '.case-body', '.case-opening',
 '.experience-page', '.profile-journey', '.experience-journey',
 '.site-header', '.compact-footer', '.shared-hero-portrait',
 '[data-home-scene]', '.app-cover', '.gallery-exhibit',
 '.project-media-primary', '.project-transit-target',
 '.dossier-folio', '.dossier-tool', '.story-chapter', '.story-sheet',
 '.story-contact-action', '.story-contact-word', '.wb-inspector',
 '.wb-section-heading', '.wb-categories', '.wb-tool', '.wb-capabilities', '.desk-direct', '.desk-compose',
].join(',');
type Arrival={node:HTMLElement;state:'deferred'|'armed'|'running'|'settled';context?:gsap.Context;timeline?:gsap.core.Timeline};

/** Once per settled route: native observation, bounded timelines, visible CSS. */
export function useViewportArrivals(root:RefObject<HTMLDivElement|null>,key:string){
 useLayoutEffect(()=>{
  const shell=root.current;if(!shell)return;
  // Unsupported observation keeps the unmodified, readable server/CSS state.
  if(typeof IntersectionObserver==='undefined'||typeof MutationObserver==='undefined')return;
  let alive=true,frame=0,stage:HTMLElement|null=null,paused=false,sequence=0;
  const records=new Map<HTMLElement,Arrival>(),pending=new Set<HTMLElement>();
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const connection=(navigator as Navigator&{connection?:EventTarget}).connection;
  const enabled=()=>!paused&&!document.hidden&&!reduced.matches&&allowsMotion();
  const settledRoute=()=>stage?.isConnected&&stage.dataset.routeReady==='ready';
  const settle=(record:Arrival)=>{
   observer.unobserve(record.node);record.timeline?.kill();record.timeline=undefined;
   // One non-nested context also reverts the preparation set. Completing a
   // fromTo startAt helper could otherwise resurrect a hidden initial frame.
   record.context?.revert();record.context=undefined;record.state='settled';
   record.node.dataset.viewportEntrance='settled';
  };
  const settleAll=()=>records.forEach(settle);
  const enter=(record:Arrival,index=0)=>{
   if(!alive||record.state==='settled'||record.state==='running')return;
   if(!enabled()||!settledRoute()||record.node.contains(document.activeElement)){settle(record);return;}
   if(!record.node.isConnected){settle(record);return;}
   record.state='running';record.node.dataset.viewportEntrance='running';observer.unobserve(record.node);
   try{
    record.context?.add(()=>{
     record.timeline=gsap.timeline({id:`arrivals:${key}:${sequence++}`,onComplete:()=>settle(record)})
      .to(record.node,{y:0,rotationX:0,opacity:1,duration:.95,delay:Math.min(index,3)*.07,ease:'expo.out',clearProps:'transform,opacity'});
    });
   }catch{settle(record);}
  };
  const observer=new IntersectionObserver(entries=>{
   let index=0;
   for(const entry of entries){
    const record=records.get(entry.target as HTMLElement);if(!record)continue;
    if(!enabled()){settle(record);continue;}
    // A jump or Back restoration can skip the intersection band entirely.
    if(entry.boundingClientRect.bottom<=0){settle(record);continue;}
    if(entry.isIntersecting)enter(record,index++);
   }
  },{rootMargin:'0px 0px -5% 0px',threshold:0});
  const prepare=(node:HTMLElement)=>{
   if(!alive||!settledRoute()||!node.isConnected)return;
   if(node.closest(protectedTargets)||node.querySelector(protectedTargets))return;
   const previous=records.get(node);if(previous&&previous.state!=='deferred')return;
   const record=previous??{node,state:'deferred' as const};records.set(node,record);
   const rect=node.getBoundingClientRect();
   const disposition=arrivalDisposition({top:rect.top,bottom:rect.bottom,width:rect.width,height:rect.height,viewportHeight:innerHeight,rendered:node.getClientRects().length>0&&!node.closest('[hidden],[inert],[aria-hidden=true]'),focused:node.contains(document.activeElement),allowed:enabled()});
   if(disposition==='settled'){settle(record);return;}
   if(disposition==='deferred')return;
   try{
    record.context=gsap.context(()=>{gsap.set(node,{y:36,rotationX:-3,transformPerspective:900,opacity:0});},stage!);
    record.state='armed';node.dataset.viewportEntrance='armed';observer.observe(node);
   }catch{settle(record);}
  };
  const collect=(node:Element)=>{
   if(node instanceof HTMLElement&&node.matches(groups))pending.add(node);
   node.querySelectorAll<HTMLElement>(groups).forEach(target=>pending.add(target));
  };
  const flush=()=>{
   frame=0;if(!alive)return;
   const next=shell.querySelector<HTMLElement>('.route-stage');
   if(next!==stage){settleAll();stage=next;if(stage)collect(stage);}
   if(!settledRoute())return;
   for(const record of records.values())if(!record.node.isConnected){settle(record);records.delete(record.node);}
   pending.forEach(prepare);pending.clear();
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(flush);};
  const mutations=new MutationObserver(changes=>{
   for(const change of changes){
    if(change.type==='attributes'){
     if(change.target===stage&&change.attributeName==='data-route-ready'){
      if(!settledRoute())settleAll();else if(stage)collect(stage);
      schedule();continue;
     }
     // Filter/disclosure changes retry only deferred descendants. Retained
     // lists never replay already settled groups or scan the whole route.
     if(change.target instanceof Element){
      const changed=change.target;
      for(const record of records.values())if(record.state==='deferred'&&(changed===record.node||changed.contains(record.node)))pending.add(record.node);
      if(pending.size)schedule();
     }
     continue;
    }
    // Ignore changing text/status nodes. Only newly attached candidate groups
    // or route stages cause work; styles written by GSAP are never observed.
    for(const node of change.addedNodes)if(node instanceof Element){
     if(node.matches('.route-stage')||node.querySelector('.route-stage'))schedule();
     if(stage?.contains(node)){collect(node);if(pending.size)schedule();}
    }
    for(const node of change.removedNodes)if(node instanceof Element){
     for(const record of records.values())if(node===record.node||node.contains(record.node)){settle(record);records.delete(record.node);}
    }
   }
  });
  const focus=(event:FocusEvent)=>{if(!(event.target instanceof Node))return;for(const record of records.values())if(record.node.contains(event.target))settle(record);};
  const policy=()=>{if(!enabled())settleAll();};
  const resize=()=>settleAll();
  const pause=(event:Event)=>{paused=Boolean((event as CustomEvent).detail);policy();};
  const history=()=>settleAll();
  shell.addEventListener('focusin',focus);
  reduced.addEventListener('change',policy);connection?.addEventListener('change',policy);
  document.addEventListener('visibilitychange',policy);
  const unresize=onLayoutResize(resize);addEventListener('popstate',history);
  addEventListener('portfolio-motion-pause',pause);
  mutations.observe(shell,{childList:true,subtree:true,attributes:true,attributeFilter:['data-route-ready','hidden','aria-hidden','inert','data-show','data-filtered']});
  flush();
  return()=>{
   alive=false;cancelAnimationFrame(frame);mutations.disconnect();observer.disconnect();
   shell.removeEventListener('focusin',focus);reduced.removeEventListener('change',policy);
   connection?.removeEventListener('change',policy);document.removeEventListener('visibilitychange',policy);
   unresize();removeEventListener('popstate',history);removeEventListener('portfolio-motion-pause',pause);
   settleAll();records.forEach(record=>delete record.node.dataset.viewportEntrance);records.clear();pending.clear();
  };
 },[key,root]);
}
