import type {RefObject} from 'react';
import {gsap} from 'gsap';import {ScrollTrigger} from 'gsap/ScrollTrigger';import {useGSAP} from '@gsap/react';
import {allowsMotion} from './route-motion';
gsap.registerPlugin(ScrollTrigger,useGSAP);

/** About owns its reading choreography; the shared hero stays untouched. */
export function useAboutMotion(root:RefObject<HTMLElement|null>,locale:string){
 useGSAP(()=>{
  const el=root.current;if(!el)return;
  let alive=true,refreshFrame=0;
  const refresh=()=>{cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(()=>{if(alive)ScrollTrigger.refresh();});};
  const media=gsap.matchMedia();
  media.add({motion:'(prefers-reduced-motion:no-preference)',reduced:'(prefers-reduced-motion:reduce)'},()=>{
   if(!allowsMotion())return;
   const rtl=locale==='ar',owned=gsap.context(()=>{},el),pending=new Map<HTMLDetailsElement,{tween:gsap.core.Tween;open:boolean}>();
   gsap.fromTo('.dossier-signal-line',{scaleX:0},{scaleX:1,ease:'none',transformOrigin:rtl?'100% 50%':'0 50%',scrollTrigger:{id:'about:signal:line',trigger:'.dossier-signals',start:'top 90%',end:'bottom 60%',scrub:.25}});
   gsap.from('.dossier-signals li',{y:36,opacity:0,duration:.95,stagger:.08,ease:'expo.out',clearProps:'transform,opacity',scrollTrigger:{id:'about:signal:reveal',trigger:'.dossier-signals',start:'top 90%'}});
   gsap.from('.dossier-index a',{y:18,opacity:0,duration:.8,stagger:.06,ease:'expo.out',clearProps:'transform,opacity',scrollTrigger:{id:'about:index:reveal',trigger:'.dossier-index',start:'top 92%'}});
   gsap.from('.dossier-tool',{y:30,opacity:0,duration:.9,stagger:.07,ease:'expo.out',clearProps:'transform,opacity',scrollTrigger:{id:'about:tools:reveal',trigger:'.dossier-tools',start:'top 88%'}});
   const folios=[...el.querySelectorAll<HTMLElement>('[data-dossier-folio]')],links=[...el.querySelectorAll<HTMLElement>('[data-dossier-link]')];
   const activate=(index:number)=>links.forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
   folios.forEach((folio,index)=>{
    const heading=folio.querySelector('h2'),ordinal=folio.querySelector('.dossier-ordinal');
    const reveal=gsap.timeline({id:`about:folio:${index}:reveal`,scrollTrigger:{id:`about:folio:${index}:entry`,trigger:folio,start:'top 88%',once:true},defaults:{ease:'power3.out'}});
    // The panel unfolds from its top edge, then ordinal, heading and paragraphs rise in order.
    reveal.fromTo(folio,{clipPath:'inset(0% 0% 100% 0% round 12px)'},{clipPath:'inset(0% 0% 0% 0% round 12px)',duration:1.1,ease:'expo.out',clearProps:'clipPath'},0)
     .from(ordinal,{yPercent:60,opacity:0,duration:.9,ease:'expo.out',clearProps:'transform,opacity'},.12).from(heading,{y:34,opacity:0,duration:.95,ease:'expo.out',clearProps:'transform,opacity'},.18).from(folio.querySelectorAll('p'),{y:26,opacity:0,duration:.9,stagger:.09,ease:'expo.out',clearProps:'transform,opacity'},.28);
    gsap.fromTo(folio.querySelector('.dossier-folio-rule'),{scaleX:0},{scaleX:1,transformOrigin:rtl?'100% 50%':'0 50%',ease:'none',scrollTrigger:{id:`about:folio:${index}:rule`,trigger:folio,start:'top 88%',end:'bottom 65%',scrub:.35}});
    ScrollTrigger.create({id:`about:folio:${index}:active`,trigger:folio,start:'top 55%',end:'bottom 55%',onEnter:()=>activate(index),onEnterBack:()=>activate(index)});
   });activate(0);
   const settle=()=>{pending.forEach(({tween,open},details)=>{tween.kill();details.open=open;const panel=details.querySelector<HTMLElement>('.dossier-tool-panel')!;panel.style.removeProperty('height');panel.style.removeProperty('opacity');panel.style.removeProperty('overflow');panel.inert=!open;});pending.clear();};
   const disposers:Array<()=>void>=[];
   el.querySelectorAll<HTMLDetailsElement>('.dossier-tool').forEach((details:HTMLDetailsElement)=>{
    const summary=details.querySelector<HTMLElement>('summary')!,panel=details.querySelector<HTMLElement>('.dossier-tool-panel')!;
    const toggle=(event:MouseEvent)=>{
     event.preventDefault();const previous=pending.get(details),open=!(previous?.open??details.open);previous?.tween.kill();
     const height=details.open?panel.getBoundingClientRect().height:0;details.open=true;panel.inert=!open;
     owned.add(()=>{gsap.set(panel,{height,overflow:'hidden'});const tween=gsap.to(panel,{height:open?panel.scrollHeight:0,opacity:open?1:.35,duration:.34,ease:'power3.inOut',overwrite:true,id:'about:tool:toggle',onComplete:()=>{details.open=open;gsap.set(panel,{clearProps:'height,opacity,overflow'});pending.delete(details);refresh();}});pending.set(details,{tween,open});});
    };summary.addEventListener('click',toggle);disposers.push(()=>summary.removeEventListener('click',toggle));
   });
   const resize=()=>{settle();};window.addEventListener('resize',resize,{passive:true});
   return()=>{settle();disposers.forEach(dispose=>dispose());window.removeEventListener('resize',resize);owned.revert();links.forEach(link=>link.removeAttribute('aria-current'));};
  },el);
  const clickIndex=(event:Event)=>{const link=(event.target as Element).closest<HTMLAnchorElement>('[data-dossier-link]');if(!link)return;const heading=el.querySelector<HTMLElement>(link.hash);heading?.focus({preventScroll:true});};
  el.querySelector('.dossier-index')?.addEventListener('click',clickIndex);
  const toggle=()=>refresh();el.addEventListener('toggle',toggle,true);void document.fonts.ready.then(()=>{if(alive)refresh();});
  return()=>{alive=false;cancelAnimationFrame(refreshFrame);media.revert();el.querySelector('.dossier-index')?.removeEventListener('click',clickIndex);el.removeEventListener('toggle',toggle,true);};
 },{scope:root,dependencies:[locale],revertOnUpdate:true});
}
