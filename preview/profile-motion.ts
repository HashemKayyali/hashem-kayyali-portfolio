import {type RefObject} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useGSAP} from '@gsap/react';
import {allowsMotion} from './route-motion';

gsap.registerPlugin(ScrollTrigger,useGSAP);

/** Every animation belongs to its page and reverts on locale/route unmount. */
export function useProfileMotion(root:RefObject<HTMLElement|null>,key:string) {
 useGSAP(()=>{
  const element=root.current;if(!element)return;
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
   if(!allowsMotion())return;
   const progress=element.querySelector('[data-profile-progress]');
   const track=element.querySelector('[data-profile-track]');
   if(progress&&track)gsap.fromTo(progress,{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{id:`profile:${key}:progress`,trigger:track,start:'top 65%',end:'bottom 65%',scrub:true}});
   for(const section of element.querySelectorAll<HTMLElement>('[data-profile-reveal]')){
    const targets=section.querySelectorAll('[data-profile-role]');
    const timeline=gsap.timeline({id:`profile:${key}:${section.id}:reveal`,scrollTrigger:{id:`profile:${key}:${section.id}`,trigger:section,start:'top 88%',toggleActions:'play none none none'},defaults:{duration:.65,ease:'power3.out'}});
    // Text is never faded out: keyboard users can read it before the scroll reveal.
    if(targets.length)timeline.from(targets,{y:18,stagger:.13,clearProps:'transform'});
    else timeline.from(section,{y:16,clearProps:'transform'});
   }
   let alive=true;let frame=0;
   const refresh=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(alive)ScrollTrigger.refresh();});};
   const toggles=element.querySelectorAll('details');
   toggles.forEach(details=>details.addEventListener('toggle',refresh));
   void document.fonts.ready.then(refresh);
   return()=>{alive=false;cancelAnimationFrame(frame);toggles.forEach(details=>details.removeEventListener('toggle',refresh));};
  },element);
  return()=>media.revert();
 },{scope:root,dependencies:[key],revertOnUpdate:true});
}
