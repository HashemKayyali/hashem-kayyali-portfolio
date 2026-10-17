import React,{useLayoutEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {PROFILE_IMAGE} from '../data/profile';
import {allowsMotion} from './route-motion';
import {useI18n} from '../i18n/useI18n';
import type {PreviewRoute} from './routes';
/** One stationary image survives Home/About component changes. */
export default function SharedHeroPortrait({route}:{route:PreviewRoute}){
 const {t}=useI18n(),root=useRef<HTMLElement>(null);
 const visible=!route.project&&(route.page==='home'||route.page==='about');
 useLayoutEffect(()=>{
  const el=root.current;if(!el||!visible)return;const shell=el.parentElement!;let frame=0,alive=true,glide=Boolean(el.style.top);
  const measure=()=>{if(!alive)return;const slot=shell.querySelector<HTMLElement>('.app-portrait-slot');if(!slot)return;const rect=slot.getBoundingClientRect(),host=shell.getBoundingClientRect();let top=0,anchor:HTMLElement|null=slot;while(anchor&&anchor!==shell){top+=anchor.offsetTop;anchor=anchor.offsetParent as HTMLElement|null;}const before=glide&&el.offsetParent?el.getBoundingClientRect():null;el.style.left=(rect.left-host.left)+'px';el.style.top=(anchor===shell?top:rect.top-host.top)+'px';el.style.width=rect.width+'px';
   // FLIP between Home and About openings: the same portrait glides to its new slot.
   if(before&&glide&&allowsMotion()){const after=el.getBoundingClientRect();const dx=before.left-after.left,dy=before.top-after.top,ds=before.width/after.width;if(Math.abs(dx)+Math.abs(dy)>2||Math.abs(ds-1)>.01)gsap.fromTo(el,{x:dx,y:dy,scale:ds,transformOrigin:'0 0'},{x:0,y:0,scale:1,duration:.75,ease:'expo.out',overwrite:true,clearProps:'transform'});}
   glide=false;};
  const schedule=()=>{if(!alive)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  const observer=new ResizeObserver(schedule);observer.observe(shell);const slot=shell.querySelector('.app-portrait-slot');if(slot)observer.observe(slot);measure();addEventListener('resize',schedule,{passive:true});void document.fonts.ready.then(schedule);
  return()=>{alive=false;cancelAnimationFrame(frame);observer.disconnect();removeEventListener('resize',schedule);};
 },[visible,route.page,route.locale]);
 return <figure ref={root} className="shared-hero-portrait" data-visible={visible} aria-hidden={!visible}>
  <div className="shared-portrait-frame"><img src={PROFILE_IMAGE} width={720} height={1280} alt={t.ui.alt.profile} fetchPriority="high" loading="eager" decoding="async"/></div>
  <figcaption><span>{t.identity.name}</span><span>{t.identity.location}</span></figcaption>
 </figure>;
}
