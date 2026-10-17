import {useRef,type RefObject} from 'react';
import {gsap} from 'gsap';import {useGSAP} from '@gsap/react';
import {allowsMotion} from './route-motion';
import {projectVisualInFlight} from './project-transit';
gsap.registerPlugin(useGSAP);
/** A compact contact sheet; every reveal and interaction has route ownership. */
export function useGalleryMotion(root:RefObject<HTMLElement|null>,key:string,rtl:boolean){
 const didEnter=useRef(false);
 useGSAP(()=>{
  const el=root.current;if(!el)return;const mm=gsap.matchMedia();
  mm.add('(prefers-reduced-motion:no-preference)',()=>{
   if(!allowsMotion())return;
   const shared=projectVisualInFlight(),contexts:gsap.Context[]=[],disposers:Array<()=>void>=[];let alive=true,frame=0;
   const firstEntry=!didEnter.current;
   if(firstEntry){didEnter.current=true;if(!shared)gsap.from('.gallery-wayfinding',{y:24,opacity:0,duration:.9,delay:.3,ease:'expo.out',clearProps:'transform,opacity'});}
   const initialized=new Set<HTMLElement>();
   const heroCovers=el.querySelectorAll<HTMLElement>('.app-cover');
   if(firstEntry&&!shared)gsap.from(heroCovers,{y:60,rotation:(i:number)=>[-2.5,2,-1][i%3],opacity:0,duration:1.1,stagger:.09,delay:.15,ease:'expo.out',clearProps:'transform,opacity'});
   heroCovers.forEach(cover=>{
    const enter=()=>{if(!projectVisualInFlight())gsap.to(cover,{y:-5,duration:.25,overwrite:true});},leave=()=>{gsap.to(cover,{y:0,duration:.3,overwrite:true});};
    cover.addEventListener('pointerenter',enter);cover.addEventListener('pointerleave',leave);cover.addEventListener('focus',enter);cover.addEventListener('blur',leave);
    disposers.push(()=>{cover.removeEventListener('pointerenter',enter);cover.removeEventListener('pointerleave',leave);cover.removeEventListener('focus',enter);cover.removeEventListener('blur',leave);gsap.killTweensOf(cover);gsap.set(cover,{clearProps:'transform'});});
   });
   const initialize=(card:HTMLElement)=>{
    if(!alive||initialized.has(card))return;initialized.add(card);observer.unobserve(card);
    if(shared||card.parentElement?.dataset.filtering==='true')return;
    contexts.push(gsap.context(()=>{
     // Card rises; its photograph is unmasked from below and settles from a slight zoom.
     const link=card.querySelector('.gallery-project-link'),mask=card.querySelector('.gallery-media-mask'),img=card.querySelector('.gallery-media-depth');
     // Direction follows the card's place in its row: edges slide in from their own side,
     // a centred card rises with a little depth. Cards entering together keep a short stagger.
     const box=card.getBoundingClientRect(),row=card.parentElement!.getBoundingClientRect(),centre=(box.left+box.width/2-row.left)/row.width;
     const side=box.width>row.width*.9?'centre':centre<.4?'left':centre>.6?'right':'centre';
     const peers=[...(card.parentElement?.children??[])].filter(c=>Math.abs(c.getBoundingClientRect().top-box.top)<4);
     const delay=Math.max(0,peers.indexOf(card))*.09;
     const from=side==='left'?{x:-90,opacity:0}:side==='right'?{x:90,opacity:0}:{y:70,scale:.96,opacity:0};
     gsap.fromTo(link,from,{x:0,y:0,scale:1,opacity:1,duration:1.15,delay,ease:'expo.out',clearProps:'transform,opacity'});
     if(mask)gsap.fromTo(mask,{clipPath:'inset(100% 0% 0% 0% round 8px)'},{clipPath:'inset(0% 0% 0% 0% round 8px)',duration:1.15,delay:delay+.12,ease:'expo.out',clearProps:'clipPath'});
     if(img)gsap.fromTo(img,{scale:1.14},{scale:1,duration:1.4,delay:delay+.12,ease:'expo.out',clearProps:'transform'});
    },card));
   };
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)initialize(entry.target as HTMLElement);}),{rootMargin:'0px 0px -8% 0px'});
   el.querySelectorAll<HTMLElement>('.gallery-exhibit').forEach(card=>{
    observer.observe(card);const arrow=card.querySelector('.gallery-link-arrow');if(!arrow)return;
    const enter=()=>{gsap.to(arrow,{x:rtl?-3:3,y:-3,duration:.25,overwrite:true});},leave=()=>{gsap.to(arrow,{x:0,y:0,duration:.3,overwrite:true});};
    card.addEventListener('pointerenter',enter);card.addEventListener('pointerleave',leave);card.addEventListener('focusin',enter);card.addEventListener('focusout',leave);
    disposers.push(()=>{card.removeEventListener('pointerenter',enter);card.removeEventListener('pointerleave',leave);card.removeEventListener('focusin',enter);card.removeEventListener('focusout',leave);gsap.killTweensOf(arrow);gsap.set(arrow,{clearProps:'transform'});});
   });
   const focus=(event:FocusEvent)=>{const card=(event.target as HTMLElement).closest<HTMLElement>('.gallery-exhibit');if(card){initialize(card);gsap.killTweensOf(card);gsap.set(card,{clearProps:'transform,opacity'});}};
   el.addEventListener('focusin',focus);
   return()=>{alive=false;cancelAnimationFrame(frame);observer.disconnect();el.removeEventListener('focusin',focus);disposers.forEach(dispose=>dispose());contexts.forEach(context=>context.revert());};
  },el);return()=>mm.revert();
 },{scope:root,dependencies:[key,rtl],revertOnUpdate:true});
}
