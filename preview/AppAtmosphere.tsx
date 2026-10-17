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
  // Route changes glide the persistent smoke to the next opening's height instead of
  // snapping (a snapped bottom edge read as a flashing line). Resizes stay instant.
  let routeChange=Boolean(atmosphere.style.height);const settle=setTimeout(()=>{routeChange=false;},900);
  const measure=()=>{
   if(!hero?.isConnected)return;
   const next=hero.offsetHeight,current=atmosphere.getBoundingClientRect().height;
   if(routeChange&&current&&Math.abs(next-current)>2&&allowsMotion()){gsap.to(atmosphere,{height:next,duration:.75,ease:'expo.out',overwrite:true});}
   else if(!routeChange){gsap.killTweensOf(atmosphere,'height');atmosphere.style.height=next+'px';}
  };
  const attach=()=>{if(hero)return;hero=atmosphere.parentElement?.querySelector<HTMLElement>('.app-home-hero,.atelier-about-opening,.app-collection-hero,.compact-hero,.journey-opening')??null;if(!hero)return;
   if(typeof ResizeObserver!=='undefined'){resize=new ResizeObserver(measure);resize.observe(hero);}
   measure();insertion?.disconnect();
  };
  const insertion=typeof MutationObserver==='undefined'?undefined:new MutationObserver(attach);
  insertion?.observe(atmosphere.parentElement!,{childList:true,subtree:true});attach();
  const timeout=setTimeout(()=>insertion?.disconnect(),10_000);
  const resized=()=>{routeChange=false;measure();};addEventListener('resize',resized,{passive:true});
  return()=>{clearTimeout(timeout);clearTimeout(settle);insertion?.disconnect();resize?.disconnect();removeEventListener('resize',resized);};
 },[route.page,route.project,route.locale]);
 return <div ref={root} className="app-atmosphere" data-visible={visible} aria-hidden="true"><HomeSilk className="app-atmosphere-paint"/></div>;
}
