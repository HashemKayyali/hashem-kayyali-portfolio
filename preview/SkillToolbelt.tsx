import React,{useRef} from 'react';
import {gsap} from 'gsap';import {useGSAP} from '@gsap/react';
import {useI18n} from '../i18n/useI18n';import {engineeringHomeCopy} from './engineering-home-copy';import {allowsMotion} from './route-motion';
import type {ProjectId} from '../content/types';

type Artwork={asset:string};
const artwork:Artwork[]=[
 {asset:'nextjs'},{asset:'react'},{asset:'typescript'},{asset:'javascript'},{asset:'tailwindcss'},{asset:'toolbelt-devices'},
 {asset:'react'},{asset:'flutter'},{asset:'dart'},{asset:'androidstudio'},{asset:'toolbelt-cross-platform'},
 {asset:'csharp'},{asset:'toolbelt-desktop'},{asset:'dotnetcore'},{asset:'toolbelt-api'},{asset:'supabase'},{asset:'postgresql'},{asset:'toolbelt-database'},{asset:'toolbelt-socket'},
 {asset:'espressif'},{asset:'cplusplus'},{asset:'toolbelt-bluetooth'},{asset:'toolbelt-nfc'},{asset:'toolbelt-wifi'},{asset:'toolbelt-realtime'},{asset:'toolbelt-pcb'},{asset:'toolbelt-hardware'},
 {asset:'python'},{asset:'opencv'},{asset:'toolbelt-vision'},{asset:'toolbelt-email'},{asset:'toolbelt-spreadsheet'},
];
// Additional tools are sourced from approved project technology fields.
const evidence:Array<Artwork&{project:ProjectId;index:number}>=[
 {project:'glitzz-lab',index:3,asset:'whatsapp'},{project:'terminal-nfc',index:5,asset:'toolbelt-client-server'},
 {project:'bike-tower',index:5,asset:'toolbelt-datagrams'},{project:'bike-tower',index:7,asset:'toolbelt-led'},
 {project:'basket-beats',index:3,asset:'toolbelt-sensors'},{project:'vr-cycling',index:3,asset:'toolbelt-integration'},
 {project:'financial-operations',index:5,asset:'toolbelt-chart'},{project:'outreach-automation',index:5,asset:'toolbelt-email'},
 {project:'traffic-flow-analytics',index:1,asset:'qt'},{project:'traffic-flow-analytics',index:3,asset:'toolbelt-detection'},{project:'traffic-flow-analytics',index:4,asset:'toolbelt-tracking'},
];
const controls={
 en:{games:'Interactive games'},ar:{games:'ألعاب تفاعلية'},de:{games:'Interaktive Spiele'},fr:{games:'Jeux interactifs'},es:{games:'Juegos interactivos'},
};

export default function SkillToolbelt(){
 const {t,locale}=useI18n(),copy=controls[locale],root=useRef<HTMLElement>(null),phase=useRef([0,0]);
 const reasons=useRef({offscreen:true,hidden:false});
 const items=t.about.skills.flat().map((name,index)=>({name,...artwork[index]})).concat(evidence.map(({project,index,...art})=>({name:t.projects[project].technology[index],...art})),[{name:engineeringHomeCopy[locale].hardware,asset:'toolbelt-hardware'},{name:copy.games,asset:'toolbelt-games'}]);
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
  {rows.map((row,index)=><div className={`toolbelt-window toolbelt-window--${index}`} key={index} role="group" tabIndex={0} aria-label={t.about.engineeringFocusTitle}><div className="toolbelt-track" dir="ltr">{[false,true].map(duplicate=><ul className="toolbelt-group" key={String(duplicate)} aria-hidden={duplicate||undefined}>{row.map((item,i)=><li className="toolbelt-item" key={i} data-toolbelt-skill={duplicate?undefined:(index?split:0)+i}><span className="toolbelt-mark" aria-hidden="true"><img src={`/v2-icons/${item.asset}.svg`} width="30" height="30" alt="" decoding="async"/></span><bdi lang={/[\u0600-\u06ff]/.test(item.name)?'ar':undefined}>{item.name}</bdi></li>)}</ul>)}</div></div>)}
 </section>;
}
