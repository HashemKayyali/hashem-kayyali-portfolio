import {gsap} from 'gsap';
import {allowsMotion} from './route-motion';

/** Chapters reveal once on approach. Focus and restored reading positions settle immediately. */
export function observeCaseBody(el:HTMLElement,rtl:boolean){
 const stage=el.closest<HTMLElement>('.route-stage');
 let alive=true,cleanup:(()=>void)|undefined,readiness:MutationObserver|undefined,timer:ReturnType<typeof setTimeout>|undefined;
 const begin=()=>{
  if(!alive||cleanup||!el.isConnected)return;
  readiness?.disconnect();if(timer)clearTimeout(timer);
  cleanup=observeReadyCaseBody(el,rtl);
 };
 if(stage&&stage.dataset.routeReady!=='ready'){
  if(typeof MutationObserver!=='undefined'){
   readiness=new MutationObserver(()=>{if(stage.dataset.routeReady==='ready')begin();});
   readiness.observe(stage,{attributes:true,attributeFilter:['data-route-ready']});
   // A failed route/font readiness leaves the original readable static body.
   timer=setTimeout(()=>{readiness?.disconnect();if(stage.dataset.routeReady==='ready')begin();},4000);
  }
 }else begin();
 return()=>{alive=false;readiness?.disconnect();if(timer)clearTimeout(timer);cleanup?.();};
}

function observeReadyCaseBody(el:HTMLElement,rtl:boolean){
 const body=el.querySelector<HTMLElement>('.case-body');if(!body||typeof IntersectionObserver==='undefined')return ()=>{};
 const chapters=[...body.querySelectorAll<HTMLElement>('.case-chapter')],seen=new Set<HTMLElement>();
 const records=new Map<HTMLElement,{context:gsap.Context;timeline:gsap.core.Timeline;targets:HTMLElement[]}>();
 let alive=true;
 const settle=(chapter:HTMLElement)=>{
  const record=records.get(chapter);if(!record)return;
  record.timeline.totalProgress(1);record.context.revert();records.delete(chapter);
  record.targets.forEach(node=>{node.style.removeProperty('transform');node.style.removeProperty('opacity');});
 };
 const initialize=(chapter:HTMLElement,animate:boolean)=>{
  if(!alive)return;
  if(seen.has(chapter)){if(!animate)settle(chapter);return;}
  seen.add(chapter);observer.unobserve(chapter);
  if(!animate||document.hidden||!allowsMotion())return;
  const targets=[...chapter.querySelectorAll<HTMLElement>(':scope > .case-chapter-heading,:scope > .case-story-reading,:scope > .case-ownership-reading,:scope > .case-architecture,:scope > .decision-list,:scope > .case-neighbors,:scope > .container > .case-chapter-heading,:scope > .container > .capability-list')];
  if(!targets.length)return;
  let timeline!:gsap.core.Timeline;
  try{
   const context=gsap.context(()=>{
    gsap.set(targets,{y:20,x:rtl?4:-4,opacity:.4});
    timeline=gsap.timeline({id:`case:body:${chapter.id||'capabilities'}`})
     .to(targets,{y:0,x:0,opacity:1,duration:.72,stagger:.065,ease:'power3.out',clearProps:'transform,opacity'});
   },chapter);
   records.set(chapter,{context,timeline,targets});
  }catch{targets.forEach(node=>{node.style.removeProperty('transform');node.style.removeProperty('opacity');});}
 };
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){const chapter=entry.target as HTMLElement;initialize(chapter,entry.boundingClientRect.bottom>0);}
 },{threshold:.08,rootMargin:'0px 0px -4% 0px'});
 // Native history/hash restoration has already chosen a reading position. Its
 // currently visible content must remain immediately readable without a reveal.
 const restored=scrollY>32;
 for(const chapter of chapters){const box=chapter.getBoundingClientRect();if(box.bottom<=0||restored&&box.top<innerHeight)initialize(chapter,false);else observer.observe(chapter);}
 const focus=(event:FocusEvent)=>{const chapter=(event.target as HTMLElement).closest<HTMLElement>('.case-chapter');if(chapter)initialize(chapter,false);};
 const settleAll=()=>{for(const chapter of records.keys())settle(chapter);};
 const hidden=()=>{if(document.hidden)settleAll();};
 const connection=(navigator as Navigator&{connection?:EventTarget}).connection;
 const constrained=()=>{if(!allowsMotion())settleAll();};
 body.addEventListener('focusin',focus);addEventListener('resize',settleAll,{passive:true});document.addEventListener('visibilitychange',hidden);connection?.addEventListener('change',constrained);
 const untrack=trackChapters(body);
 return()=>{alive=false;untrack();observer.disconnect();settleAll();body.removeEventListener('focusin',focus);removeEventListener('resize',settleAll);document.removeEventListener('visibilitychange',hidden);connection?.removeEventListener('change',constrained);};
}

/** Marks the chapter being read in the sticky chapter bar and keeps it in view on narrow screens. */
function trackChapters(body:HTMLElement){
 const nav=body.querySelector<HTMLElement>('.case-chapter-nav');
 const links=new Map([...(nav?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')??[])].map(link=>[decodeURIComponent(link.hash.slice(1)),link]));
 const chapters=[...links.keys()].map(id=>document.getElementById(id)).filter((node):node is HTMLElement=>!!node&&body.contains(node));
 if(!nav||!chapters.length||typeof IntersectionObserver==='undefined')return()=>{};
 const visible=new Set<HTMLElement>();
 const mark=()=>{
  const current=chapters.find(chapter=>visible.has(chapter));
  for(const [id,link] of links){if(id===current?.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
  const link=current&&links.get(current.id);
  if(link&&nav.scrollWidth>nav.clientWidth+1){
   const a=link.getBoundingClientRect(),n=nav.getBoundingClientRect();
   nav.scrollBy({left:a.left+a.width/2-(n.left+n.width/2),behavior:allowsMotion()?'smooth':'auto'});
  }
 };
 // A thin band just below the sticky bar decides which chapter is being read.
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)entry.isIntersecting?visible.add(entry.target as HTMLElement):visible.delete(entry.target as HTMLElement);mark();},{rootMargin:'-30% 0px -60% 0px'});
 chapters.forEach(chapter=>observer.observe(chapter));
 return()=>{observer.disconnect();links.forEach(link=>link.removeAttribute('aria-current'));};
}
