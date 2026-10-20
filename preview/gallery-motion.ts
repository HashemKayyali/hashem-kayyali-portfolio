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
   // Every card is put in its pre-entrance state before the first paint, then revealed once on
   // approach. (Revealing from an already painted card made each card blink, then replay.)
   const prepared=new Map<HTMLElement,{link:Element|null;mask:Element|null;img:Element|null;stacked:boolean}>();
   const exhibits=[...el.querySelectorAll<HTMLElement>('.gallery-exhibit')];
   if(!shared){const visible=exhibits.filter(card=>card.offsetParent!==null);contexts.push(gsap.context(()=>{visible.forEach((card,index)=>{
    const link=card.querySelector('.gallery-project-link'),mask=card.querySelector('.gallery-media-mask'),img=card.querySelector('.gallery-media-depth');
    // Direction follows the card's place in its row; full-width cards (stack deck, phones) alternate sides.
    const box=card.getBoundingClientRect(),row=card.parentElement!.getBoundingClientRect(),centre=(box.left+box.width/2-row.left)/row.width;
    const side=box.width>row.width*.9?(index%2===0?'left':'right'):centre<.4?'left':centre>.6?'right':'centre';
    const travel=Math.min(90,innerWidth*.12);
    // Stacked (sticky) cards arrive over the card beneath them: a fading card let the covered one show
    // through, and the clip-path wipe repainted the 3x image every frame (75-95 ms frames on iPhone).
    // There they rise opaque and the image settles by transform only; the grid keeps the full reveal.
    const stacked=card.parentElement?.dataset.stack==='active';
    if(stacked)gsap.set(link,{y:56});
    else{gsap.set(link,side==='left'?{x:-travel,opacity:0}:side==='right'?{x:travel,opacity:0}:{y:70,scale:.96,opacity:0});if(mask)gsap.set(mask,{clipPath:'inset(100% 0% 0% 0% round 12px)'});}
    if(img)gsap.set(img,{scale:1.14});
    prepared.set(card,{link,mask,img,stacked});
   });},el));}
   const initialize=(card:HTMLElement)=>{
    if(!alive||initialized.has(card))return;initialized.add(card);observer.unobserve(card);
    const parts=prepared.get(card);if(!parts)return;
    const peers=[...(card.parentElement?.children??[])].filter(c=>(c as HTMLElement).offsetParent!==null&&Math.abs(c.getBoundingClientRect().top-card.getBoundingClientRect().top)<4);
    const delay=Math.max(0,peers.indexOf(card))*.09,instant=card.parentElement?.dataset.filtering==='true';
    contexts.push(gsap.context(()=>{
     gsap.to(parts.link,{x:0,y:0,scale:1,opacity:1,duration:instant?0:1.15,delay,ease:'expo.out',clearProps:'transform,opacity'});
     if(parts.mask&&!parts.stacked)gsap.to(parts.mask,{clipPath:'inset(0% 0% 0% 0% round 12px)',duration:instant?0:1.15,delay:delay+.12,ease:'expo.out',clearProps:'clipPath'});
     if(parts.img)gsap.to(parts.img,{scale:1,duration:instant?0:1.4,delay:delay+.12,ease:'expo.out',clearProps:'transform'});
    },card));
   };
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)initialize(entry.target as HTMLElement);}),{rootMargin:'0px 0px -8% 0px'});
   el.querySelectorAll<HTMLElement>('.gallery-exhibit').forEach(card=>{
    observer.observe(card);const arrow=card.querySelector('.gallery-link-arrow');if(!arrow)return;
    const enter=()=>{gsap.to(arrow,{x:rtl?-3:3,y:-3,duration:.25,overwrite:true});},leave=()=>{gsap.to(arrow,{x:0,y:0,duration:.3,overwrite:true});};
    card.addEventListener('pointerenter',enter);card.addEventListener('pointerleave',leave);card.addEventListener('focusin',enter);card.addEventListener('focusout',leave);
    disposers.push(()=>{card.removeEventListener('pointerenter',enter);card.removeEventListener('pointerleave',leave);card.removeEventListener('focusin',enter);card.removeEventListener('focusout',leave);gsap.killTweensOf(arrow);gsap.set(arrow,{clearProps:'transform'});});
   });
   const focus=(event:FocusEvent)=>{const card=(event.target as HTMLElement).closest<HTMLElement>('.gallery-exhibit');if(card){initialize(card);const parts=prepared.get(card);if(parts){gsap.killTweensOf([parts.link,parts.mask,parts.img]);gsap.set([parts.link,parts.mask,parts.img],{clearProps:'transform,opacity,clipPath'});}}};
   el.addEventListener('focusin',focus);
   return()=>{alive=false;cancelAnimationFrame(frame);observer.disconnect();el.removeEventListener('focusin',focus);disposers.forEach(dispose=>dispose());contexts.forEach(context=>context.revert());};
  },el);return()=>mm.revert();
 },{scope:root,dependencies:[key,rtl],revertOnUpdate:true});
}
