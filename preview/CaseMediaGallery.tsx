import React,{useLayoutEffect,useRef,useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {ArrowLeft,ArrowRight,Expand} from 'lucide-react';
import {useI18n,format} from '../i18n/useI18n';
import {caseCopy} from './case-copy';
import StoryMedia from './StoryMedia';
import {mediaFrameStyle} from './media-frame';
import {createGallerySelection} from './case-gallery-selection';

type Props={sources:string[];title:string;caption:(source:string)=>string;alternativeText?:(source:string)=>string;onOpen:(source:string,caption:string,event:React.MouseEvent<HTMLButtonElement>)=>void};

/** Embla owns the track; decode gating only decides when button intent may reach it. */
const CaseMediaGallery:React.FC<Props>=({sources,title,caption,alternativeText,onOpen})=>{
 const {t,locale}=useI18n(),labels=caseCopy[locale],rtl=locale==='ar';
 const [index,setIndex]=useState(0),[pending,setPending]=useState<number|null>(null);
 const root=useRef<HTMLDivElement>(null),shown=useRef(0),requested=useRef(0);
 const selection=useRef<ReturnType<typeof createGallerySelection>|null>(null);
 const reduced=useRef(false);
 const [viewport,embla]=useEmblaCarousel({align:'start',direction:rtl?'rtl':'ltr',loop:false,skipSnaps:false,watchFocus:false,breakpoints:{'(prefers-reduced-motion: reduce)':{duration:0}}});
 const sourceKey=sources.join('|');

 useLayoutEffect(()=>{
  const el=root.current;if(!el||!embla)return;
  const prepared=new Map<number,Promise<unknown>>();
  let disposed=false;
  const prepare=(target:number)=>{
   const previous=prepared.get(target);if(previous)return previous;
   const image=el.querySelector<HTMLImageElement>(`.evidence-slide[data-slide="${target}"] img`);
   if(!image)return Promise.reject(new Error('Missing evidence image'));
   image.loading='eager';
   const promise=image.decode().catch(error=>{
    if(!image.complete||!image.naturalWidth){if(prepared.get(target)===promise)prepared.delete(target);throw error;}
   });
   prepared.set(target,promise);return promise;
  };
  const warmNearby=(target:number)=>{
   for(const candidate of [target,target-1,target+1])if(candidate>=0&&candidate<sources.length)void prepare(candidate).catch(()=>{});
  };
  const sync=()=>{
   if(disposed)return;
   const target=embla.selectedScrollSnap();
   shown.current=target;requested.current=target;setIndex(target);warmNearby(target);
  };
  const cancel=()=>{selection.current?.cancel();requested.current=embla.selectedScrollSnap();};
  const settle=()=>{cancel();prepared.clear();embla.scrollTo(embla.selectedScrollSnap(),true);warmNearby(embla.selectedScrollSnap());};
  const reinit=()=>{cancel();prepared.clear();sync();};
  selection.current=createGallerySelection(prepare,target=>{
   if(!disposed)embla.scrollTo(target,reduced.current||document.hidden);
  },target=>{
   if(disposed)return;
   if(target===null)requested.current=embla.selectedScrollSnap();
   setPending(target);
  });
  const media=matchMedia('(prefers-reduced-motion:reduce)');
  reduced.current=media.matches;
  const motionChange=()=>{reduced.current=media.matches;settle();};
  const visibility=()=>{if(document.hidden)settle();};
  // Start nearby decodes immediately; approaching the gallery prepares every
  // mounted image, so a swipe never waits for a newly constructed slide.
  const observer=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting))return;
   sources.forEach((_,target)=>{void prepare(target).catch(()=>{});});observer.disconnect();
  },{rootMargin:'240px'});
  observer.observe(el);
  embla.on('select',sync).on('pointerDown',cancel).on('resize',settle).on('reInit',reinit);
  media.addEventListener('change',motionChange);document.addEventListener('visibilitychange',visibility);addEventListener('resize',settle,{passive:true});
  // Source replacement is the only explicit reinitialization. Selection itself
  // never rebuilds the track, its images, or the carousel instance.
  embla.reInit();sync();setPending(null);
  return()=>{
   disposed=true;selection.current?.dispose();selection.current=null;observer.disconnect();
   embla.off('select',sync).off('pointerDown',cancel).off('resize',settle).off('reInit',reinit);
   media.removeEventListener('change',motionChange);document.removeEventListener('visibilitychange',visibility);removeEventListener('resize',settle);
  };
 },[embla,sourceKey,locale]);

 useLayoutEffect(()=>{
  const el=root.current,thumbnail=el?.querySelector<HTMLElement>('.evidence-thumbnail[aria-pressed=true]'),strip=el?.querySelector<HTMLElement>('.evidence-filmstrip');
  if(!thumbnail||!strip)return;
  const item=thumbnail.getBoundingClientRect(),tray=strip.getBoundingClientRect();
  if(item.left<tray.left)strip.scrollBy({left:item.left-tray.left-4,behavior:'instant'});
  else if(item.right>tray.right)strip.scrollBy({left:item.right-tray.right+4,behavior:'instant'});
 },[index,locale]);

 const select=(target:number)=>{
  if(target<0||target>=sources.length||target===requested.current)return;
  requested.current=target;
  if(target===shown.current){selection.current?.cancel();return;}
  void selection.current?.request(target);
 };
 const active=sources[index]??sources[0];if(!active)return null;
 return <div ref={root} className="case-gallery case-gallery--carousel" dir={rtl?'rtl':'ltr'} data-count={sources.length} data-gallery-pending={pending!==null} role="region" aria-label={`${labels.gallery}: ${title}`} tabIndex={0} onKeyDown={event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  if(event.key==='Home')select(0);else if(event.key==='End')select(sources.length-1);else select(requested.current+(event.key===(rtl?'ArrowLeft':'ArrowRight')?1:-1));
 }}>
  <div className="evidence-desk"><div className="evidence-stage" aria-live="off" aria-busy={pending!==null}>
   <div className="evidence-viewport" ref={viewport} onDragStart={event=>event.preventDefault()}><div className="evidence-track">
    {sources.map((source,i)=><figure key={source} data-slide={i} className={`evidence-slide${i===index?' is-current':''}`} aria-hidden={i!==index}>
     <div className="evidence-native-frame" style={mediaFrameStyle(source)}><StoryMedia source={source} alt={alternativeText?.(source)??`${title}. ${caption(source)}`} eager={i===0} sizes="(max-width:800px) 90vw, 1050px"/></div>
    </figure>)}
   </div></div>
   <span className="evidence-stage-mark" aria-hidden="true">{String(index+1).padStart(2,'0')}<span> / {String(sources.length).padStart(2,'0')}</span></span>
  </div>
  <div className="evidence-toolbar"><p className="evidence-caption" role="status" aria-live="polite" aria-atomic="true"><bdi>{String(index+1).padStart(2,'0')} / {String(sources.length).padStart(2,'0')}</bdi><span>{caption(active)}</span></p><div className="evidence-controls">{sources.length>1&&<><button type="button" onClick={()=>select(requested.current-1)} disabled={(pending??index)===0} aria-label={t.projectModal.labels.previousImage}>{rtl?<ArrowRight size={18}/>:<ArrowLeft size={18}/>}</button><button type="button" onClick={()=>select(requested.current+1)} disabled={(pending??index)===sources.length-1} aria-label={t.projectModal.labels.nextImage}>{rtl?<ArrowLeft size={18}/>:<ArrowRight size={18}/>}</button></>}<button type="button" className="evidence-open" aria-label={format(t.projectModal.a11y.openImageFullScreen,{index:index+1})} onClick={event=>{
   selection.current?.cancel();embla?.scrollTo(shown.current,true);onOpen(active,caption(active),event);
  }}><Expand size={18}/></button></div></div></div>
  {sources.length>1&&<div className="evidence-filmstrip" aria-label={labels.gallery}>{sources.map((source,i)=><button key={source} className="evidence-thumbnail" type="button" aria-pressed={i===index} aria-label={`${title} — ${i+1} / ${sources.length}`} onClick={()=>select(i)}><span className="evidence-thumb-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><StoryMedia source={source} alt="" sizes="100px"/>{i===index&&<span className="evidence-selection-frame" aria-hidden="true"/>}</button>)}</div>}
 </div>;
};
export default CaseMediaGallery;
