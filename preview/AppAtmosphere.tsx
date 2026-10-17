import React,{useLayoutEffect,useRef} from 'react';
import HomeSilk from './HomeSilk';
import type {PreviewRoute} from './routes';

/** The same canvas follows the current opening without being remounted. */
export default function AppAtmosphere({route}:{route:PreviewRoute}){
 const root=useRef<HTMLDivElement>(null);
 const visible=['home','about','projects','experience','skills','contact','gallery','journal','admin'].includes(route.page);
 useLayoutEffect(()=>{
  const atmosphere=root.current;
  if(!atmosphere||route.project)return;
  let hero:HTMLElement|null=null,resize:ResizeObserver|undefined;
  const measure=()=>{if(hero?.isConnected)atmosphere.style.height=hero.offsetHeight+'px';};
  const attach=()=>{if(hero)return;hero=atmosphere.parentElement?.querySelector<HTMLElement>('.app-home-hero,.atelier-about-opening,.app-collection-hero,.compact-hero,.journey-opening')??null;if(!hero)return;
   if(typeof ResizeObserver!=='undefined'){resize=new ResizeObserver(measure);resize.observe(hero);}
   measure();insertion?.disconnect();
  };
  const insertion=typeof MutationObserver==='undefined'?undefined:new MutationObserver(attach);
  insertion?.observe(atmosphere.parentElement!,{childList:true,subtree:true});attach();
  const timeout=setTimeout(()=>insertion?.disconnect(),10_000);
  addEventListener('resize',measure,{passive:true});
  return()=>{clearTimeout(timeout);insertion?.disconnect();resize?.disconnect();removeEventListener('resize',measure);atmosphere.style.removeProperty('height');};
 },[route.page,route.project,route.locale]);
 return <div ref={root} className="app-atmosphere" data-visible={visible} aria-hidden="true"><HomeSilk className="app-atmosphere-paint"/></div>;
}
