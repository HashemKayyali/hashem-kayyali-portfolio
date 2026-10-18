import React,{useRef} from 'react';
import Glyph from './Glyph';
import {gsap} from 'gsap';import {ScrollTrigger} from 'gsap/ScrollTrigger';import {useGSAP} from '@gsap/react';
import {useI18n} from '../i18n/useI18n';
import type {ProjectAsset} from '../data/projectAssets';
import type {Navigate,PreviewRoute} from './routes';
import {NavLink} from './PageShell';
import {ProductImage} from './PortfolioSections';
import {allowsMotion} from './route-motion';
import {pageCopy} from './page-copy';
import './collection.css';
gsap.registerPlugin(ScrollTrigger,useGSAP);
/** P2-inspired composition: a short native sticky scene, no pinned scroll or hijack.
 * Every title/link stays visible. The ordinary collection remains directly below. */
export default function CollectionScene({assets,route,navigate,filter}:{assets:ProjectAsset[];route:PreviewRoute;navigate:Navigate;filter:string}) {
 const {t,locale}=useI18n(),root=useRef<HTMLElement>(null);
 useGSAP(()=>{
  const el=root.current;if(!el)return;const mm=gsap.matchMedia();
  mm.add('(min-width:1000px) and (prefers-reduced-motion:no-preference)',()=>{
   if(!allowsMotion())return;
   const tiles=[...el.querySelectorAll<HTMLElement>('.collection-tile')];
   const tl=gsap.timeline({id:'collection:composition',scrollTrigger:{id:'collection:sticky-grid',trigger:el,start:'top 85%',end:'bottom 85%',scrub:.55}});
   tiles.forEach((tile,index)=>tl.fromTo(tile,{y:index%3===1?24:12,scale:.975},{y:index%3===1?-10:0,scale:1,ease:'power2.inOut',duration:1},index%3*.08));
  },el);return()=>mm.revert();
 },{scope:root,dependencies:[locale,filter],revertOnUpdate:true});
 return <section ref={root} className="collection-scene" aria-labelledby="collection-scene-title"><div className="collection-stage"><header><h2 id="collection-scene-title">{pageCopy[locale].allProjects}</h2><span className="index" dir="ltr">{String(assets.length).padStart(2,'0')} / 11</span></header><div className="collection-grid">{assets.map((asset,index)=><NavLink key={asset.id} className="collection-tile" route={{...route,page:'projects',project:asset.id}} navigate={navigate}><div className="collection-media"><ProductImage asset={asset} sizes="320px"/></div><span className="collection-title"><span dir="ltr">{String(index+1).padStart(2,'0')}</span><strong>{t.projects[asset.id].title}</strong><span aria-hidden="true"><Glyph name="up-right"/></span></span></NavLink>)}</div></div></section>;
}
