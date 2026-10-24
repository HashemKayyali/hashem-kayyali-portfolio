import React,{useRef} from 'react';
import {gsap} from 'gsap';import {useGSAP} from '@gsap/react';
import {useI18n} from '../i18n/useI18n';import {engineeringHomeCopy} from './engineering-home-copy';import {allowsMotion} from './route-motion';
import type {ProjectId} from '../content/types';

// Additional tools are sourced from approved project technology fields.
const evidence:Array<{project:ProjectId;index:number}>=[
 {project:'glitzz-lab',index:3},{project:'terminal-nfc',index:5},
 {project:'bike-tower',index:5},{project:'bike-tower',index:7},
 {project:'basket-beats',index:3},{project:'vr-cycling',index:3},
 {project:'financial-operations',index:5},{project:'outreach-automation',index:5},
 {project:'traffic-flow-analytics',index:1},{project:'traffic-flow-analytics',index:3},{project:'traffic-flow-analytics',index:4},
];
const controls={
 en:{games:'Interactive games'},ar:{games:'ألعاب تفاعلية'},de:{games:'Interaktive Spiele'},fr:{games:'Jeux interactifs'},es:{games:'Juegos interactivos'},
};

export default function SkillToolbelt(){
 const {t,locale}=useI18n(),copy=controls[locale],root=useRef<HTMLElement>(null),phase=useRef([0,0]);
 const reasons=useRef({offscreen:true,hidden:false});
 const items=t.about.skills.flat().map(name=>({name})).concat(evidence.map(({project,index})=>({name:t.projects[project].technology[index]})),[{name:engineeringHomeCopy[locale].hardware},{name:copy.games}]);
 const split=Math.ceil(items.length/2),rows=[items.slice(0,split),items.slice(split)];
 useGSAP(()=>{
  const el=root.current;if(!el)return;const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion:no-preference)',()=>{
   if(!allowsMotion())return;
   let alive=true,frame=0;const context=gsap.context(()=>{},el),tweens:gsap.core.Tween[]=[];
   el.dataset.mode='loop';
   const update=()=>{if(!alive)return;const stopped=Object.values(reasons.current).some(Boolean);el.dataset.playing=String(!stopped);tweens.forEach(tween=>stopped?tween.pause():tween.resume());};
   const measure=()=>{
    if(!alive)return;
    context.add(()=>{el.querySelectorAll<HTMLElement>('.toolbelt-track').forEach((track:HTMLElement,index:number)=>{
     const old=tweens[index];if(old)phase.current[index]=old.progress();old?.kill();
     const width=track.querySelector<HTMLElement>('.toolbelt-group')!.getBoundingClientRect().width;
     const reverse=(locale==='ar')!==(index===1);
     tweens[index]=gsap.fromTo(track,{x:reverse?-width:0},{x:reverse?0:-width,duration:width/(index?38:42),repeat:-1,ease:'none',paused:true,id:`home:toolbelt:${index}`}).progress(phase.current[index]);
    });});update();
   };
   const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
   const resize=new ResizeObserver(schedule);el.querySelectorAll('.toolbelt-group:first-child').forEach(group=>resize.observe(group));
   const visibility=()=>{reasons.current.hidden=document.hidden;update();};document.addEventListener('visibilitychange',visibility);visibility();
   const observer=new IntersectionObserver(entries=>{reasons.current.offscreen=!entries[0].isIntersecting;update();});
   reasons.current.offscreen=true;observer.observe(el);measure();void document.fonts.ready.then(()=>{if(alive)schedule();});
   return()=>{alive=false;cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',visibility);tweens.forEach((tween,index)=>{phase.current[index]=tween.progress();tween.kill();});context.revert();el.dataset.mode='static';el.dataset.playing='false';};
  },el);return()=>media.revert();
 },{scope:root,dependencies:[locale],revertOnUpdate:true});
 return <section ref={root} className="skill-toolbelt" aria-labelledby="toolbelt-title" data-mode="static">
  <header className="vision-canvas toolbelt-header"><h2 id="toolbelt-title">{t.about.toolkitTitle}</h2></header>
  {rows.map((row,index)=><div className={`toolbelt-window toolbelt-window--${index}`} key={index} role="group" tabIndex={0} aria-label={t.about.engineeringFocusTitle}><div className="toolbelt-track" dir="ltr">{[false,true].map(duplicate=><ul className="toolbelt-group" key={String(duplicate)} aria-hidden={duplicate||undefined}>{row.map((item,i)=><li className="toolbelt-item" key={i} data-toolbelt-skill={duplicate?undefined:(index?split:0)+i}><bdi lang={/[\u0600-\u06ff]/.test(item.name)?'ar':undefined}>{item.name}</bdi></li>)}</ul>)}</div></div>)}
 </section>;
}
