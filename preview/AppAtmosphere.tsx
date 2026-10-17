import React,{useLayoutEffect,useRef} from 'react';
import {gsap} from 'gsap';
import HomeSilk from './HomeSilk';
import {allowsMotion} from './route-motion';
import type {PreviewRoute} from './routes';

/** The same canvas follows the current opening without being remounted. */
export default function AppAtmosphere({route}:{route:PreviewRoute}){
 const root=useRef<HTMLDivElement>(null);
 const visible=['home','about','projects','experience','skills','contact','gallery','journal','admin'].includes(route.page);
 useLayoutEffect(()=>{
  const atmosphere=root.current;
  if(!atmosphere||route.project)return;
  let hero:HTMLElement|null=null,resize:ResizeObserver|undefined;
  // Route changes glide the persistent smoke window to the next opening's height
  // (a snapped bottom edge read as a flashing line, a late snap as a jump).
  // Glide by default; snap only on first paint and while the window itself is resizing.
  let resizing=false,resizeTimer:ReturnType<typeof setTimeout>|undefined;
  const measure=()=>{
   if(!hero?.isConnected)return;
   const next=hero.offsetHeight,current=atmosphere.getBoundingClientRect().height;
   // A suspended or departing opening can report 0px; following it made the smoke dip.
   if(next<2||Math.abs(next-current)<=1)return;
   // Every measurement converges on the current opening: glide during a route change,
   // snap for window resizes. (Skipping a 0px start once left the smoke hidden.)
   if(!resizing&&atmosphere.style.height&&allowsMotion())gsap.to(atmosphere,{height:next,duration:.8,ease:'expo.out',overwrite:true});
   else{gsap.killTweensOf(atmosphere,'height');atmosphere.style.height=next+'px';}
  };
  // Lazy pages can keep the previous page on screen for a moment, so the opening is
  // re-resolved on every DOM change and only a connected, current opening is followed.
  const selector='.app-home-hero,.atelier-about-opening,.app-collection-hero,.compact-hero,.journey-opening';
  let frame=0;
  const attach=()=>{frame=0;
   const next=atmosphere.parentElement?.querySelector<HTMLElement>(`.route-stage ${selector.split(',').join(',.route-stage ')}`)??atmosphere.parentElement?.querySelector<HTMLElement>(selector)??null;
   if(next===hero&&hero?.isConnected)return;
   resize?.disconnect();hero=next;if(!hero)return;
   if(typeof ResizeObserver!=='undefined'){resize=new ResizeObserver(()=>{if(hero?.isConnected)measure();});resize.observe(hero);}
   measure();
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(attach);};
  const insertion=typeof MutationObserver==='undefined'?undefined:new MutationObserver(schedule);
  insertion?.observe(atmosphere.parentElement!,{childList:true,subtree:true});attach();
  
  const resized=()=>{resizing=true;clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{resizing=false;},250);measure();};addEventListener('resize',resized,{passive:true});
  return()=>{cancelAnimationFrame(frame);clearTimeout(resizeTimer);insertion?.disconnect();resize?.disconnect();removeEventListener('resize',resized);};
 },[route.page,route.project,route.locale]);
 return <div ref={root} className="app-atmosphere" data-visible={visible} aria-hidden="true"><HomeSilk className="app-atmosphere-paint" stage/></div>;
}
