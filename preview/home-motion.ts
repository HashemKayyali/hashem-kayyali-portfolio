import type {RefObject} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SplitText} from 'gsap/SplitText';
import {useGSAP} from '@gsap/react';
import {allowsMotion} from './route-motion';

gsap.registerPlugin(ScrollTrigger,SplitText,useGSAP);
/** Home has one entrance score and viewport-owned chapters, not per-element effects. */
export function useHomeMotion(root:RefObject<HTMLElement|null>,locale:string,rtl:boolean) {
 useGSAP(()=>{
  const page=root.current;if(!page)return;
  const media=gsap.matchMedia();
  // Async work belongs to this media context. Using the outer hook's safe
  // wrapper inside a media-owned timeline callback creates a context cycle.
  media.add('(prefers-reduced-motion:no-preference)',(_mediaContext,contextSafe)=>{
   if(!allowsMotion())return;
   const mobile=matchMedia('(max-width:700px)').matches,hero=page.querySelector<HTMLElement>('.hero'),lab=page.classList.contains('lab-home');
   if(!hero)return;
   let alive=true;const contexts:gsap.Context[]=[],splits:SplitText[]=[];
   // Split only once, before the score. Late font completion must never rewrite
   // the name DOM or measure lines while the portrait is moving.
   if(!lab&&!rtl&&document.fonts.check('600 48px "Instrument Sans"')){
    for(const part of hero.querySelectorAll<HTMLElement>('.hero-name-part'))splits.push(SplitText.create(part,{type:'chars',aria:'auto',charsClass:'hero-name-glyph'}));
    hero.dataset.fontSplit='ready';
   }
   const portrait=gsap.timeline({id:'home:portrait:reveal',paused:true,onComplete:()=>{hero.dataset.portraitFinished='complete';hero.dispatchEvent(new Event('home-portrait-complete',{bubbles:true}));}});
   portrait.fromTo('.portrait-reveal',{clipPath:rtl?'inset(0% 0% 0% 91%)':'inset(0% 91% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.1,ease:'power3.inOut',clearProps:'clipPath'},0)
    .from('.portrait-frame img',{scale:1.065,xPercent:rtl?-2:2,duration:1.35,ease:'power2.out',clearProps:'transform'},0);
   let decoded=false,revealRequested=false,paintFrame=0;
   const image=hero.querySelector<HTMLImageElement>('.portrait-frame img');
   const reveal=contextSafe(()=>{if(!alive)return;decoded=true;hero.dataset.portraitReady='decoded';if(revealRequested)portrait.play();});
   // decode() completes CPU preparation; let the prepared compositing layer
   // reach its first paint before starting the local reveal clock.
   const prepared=()=>{if(!alive)return;paintFrame=requestAnimationFrame(()=>{paintFrame=requestAnimationFrame(()=>reveal());});};
   void image?.decode().then(prepared).catch(prepared);
   // Starts two frames after the first paint (see below): beginning inside the first-paint raster made
   // the opening frames of the entrance stutter on cold loads.
   const entrance=gsap.timeline({id:'home:hero:entrance',paused:true,defaults:{ease:'power3.out'},onStart:()=>{hero.dataset.entrance='playing';},onComplete:()=>{hero.dataset.entrance='complete';hero.dispatchEvent(new Event('home-entrance-complete'));}});
   entrance.from('.hero .brand-dash',{scaleX:0,transformOrigin:rtl?'right':'left',duration:.7},0)
    .fromTo('.hero-name-part',{y:20,x:rtl?-12:12,clipPath:rtl?'inset(0% 0% 0% 72%)':'inset(0% 72% 0% 0%)'},{y:0,x:0,clipPath:'inset(0% 0% 0% 0%)',duration:.95,stagger:.12,ease:'power3.inOut',clearProps:'clipPath,transform'},.03)
    .call(()=>{revealRequested=true;if(decoded)portrait.play();},[],.10)
    .from('.hero-role-primary,.hero-role-secondary',{y:14,duration:.85,stagger:.10,clearProps:'transform'},.18)
    .from('.hero-scope,.hero-statement',{y:10,duration:.8,stagger:.08,clearProps:'transform'},.28)
    .from('.hero .actions>*',{y:12,duration:.75,stagger:.08,clearProps:'transform'},.40)
    .from('.hero-location,.portrait-edition,.portrait figcaption',{y:7,duration:.7,clearProps:'transform'},.46)
    .from('.portrait-rule',{scaleX:0,duration:.75,clearProps:'transform'},.67);
   // Lab has an extra evidence rail. Keep its large translucent field stationary
   // during the foreground reveal; the exact worker begins after the portrait.
   // CPU4 trace showed document-wide paints when both masks moved together.
   if(!lab)entrance.fromTo('.hero-field',{clipPath:'inset(0% 0% 20% 0%)',xPercent:rtl?-2:2,scale:1.025},{clipPath:'inset(0% 0% 0% 0%)',xPercent:0,scale:1,duration:1.5,ease:'power2.out',clearProps:'clipPath,transform'},0);
   gsap.to('.hero .portrait',{y:mobile?-8:-24,ease:'none',scrollTrigger:{id:'home:hero:depth',trigger:hero,start:'top top',end:'bottom top',scrub:.65}});
   if(splits.length)entrance.from(splits.flatMap(split=>split.chars),{yPercent:8,duration:.8,stagger:.009,clearProps:'transform'},.03);
   const playEntrance=contextSafe(()=>{if(alive)entrance.play();});
   let entranceFrame=requestAnimationFrame(()=>{entranceFrame=requestAnimationFrame(()=>playEntrance());});
   const initialize=(section:HTMLElement)=>{
    if(!alive||section.dataset.homeChapter==='ready')return;
    section.dataset.homeChapter='ready';observer.unobserve(section);
    contexts.push(gsap.context(()=>{
     const label=section.classList.contains('home-about')?'about':section.classList.contains('home-bottom')?'career':section.classList.contains('home-invitation')?'invitation':'projects';
     const line=section.querySelector('.home-section-rule');
     if(line)gsap.fromTo(line,{scaleX:0,transformOrigin:rtl?'right':'left'},{scaleX:1,ease:'none',scrollTrigger:{id:`home:${label}:rule`,trigger:section,start:'top 85%',end:'top 28%',scrub:.6}});
     const chapter=gsap.timeline({id:`home:${label}:chapter`,scrollTrigger:{id:`home:${label}:entry`,trigger:section,start:'top 87%',toggleActions:'play none none reverse'},defaults:{duration:.75,ease:'power3.out'}});
     const heads=section.querySelectorAll('h2');chapter.from(heads,{y:18,clearProps:'transform'},0);
     if(label==='about'){
      chapter.from(section.querySelector('div:last-child>p'),{y:12,clearProps:'transform'},.10)
       .from(section.querySelector('.focus-strip'),{y:8,clearProps:'transform'},.22);
     }else if(label==='career'){
      chapter.from(section.querySelectorAll('.career-summary li'),{y:14,stagger:.12,clearProps:'transform'},.10)
       .from(section.querySelector('.home-toolkit>p'),{y:10,clearProps:'transform'},.12)
       .from(section.querySelector('.skill-tags'),{y:8,clearProps:'transform'},.24);
     }else if(label==='invitation'){
      chapter.from(section.querySelector('p'),{y:10,clearProps:'transform'},.12)
       .from(section.querySelector('.button-primary'),{y:10,clearProps:'transform'},.24);
     }
     const field=section.querySelector('.motion-field');
     if(field)gsap.fromTo(field,{y:mobile?10:22},{y:mobile?-10:-22,ease:'none',scrollTrigger:{id:`home:${label}:flow`,trigger:section,start:'top bottom',end:'bottom top',scrub:.8}});
    },section));
   };
   // Far-away chapters do no GSAP layout work during the first Hero paint.
   const pending=new Set<HTMLElement>();
   const flush=contextSafe(()=>{for(const section of pending)initialize(section);pending.clear();});
   const scrollEarly=()=>{if(scrollY>20)flush();};
   const readyEvent=lab?'home-portrait-complete':'home-entrance-complete';
   hero.addEventListener(readyEvent,flush);window.addEventListener('scroll',scrollEarly,{passive:true});
   const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const section=entry.target as HTMLElement;if((lab?hero.dataset.portraitFinished==='complete':hero.dataset.entrance==='complete')||scrollY>20)initialize(section);else pending.add(section);}},{rootMargin:'120px 0px'});
   page.querySelectorAll<HTMLElement>('.home-about,.home-projects>.page-section-title,.home-bottom,.home-invitation').forEach(section=>observer.observe(section));
   return()=>{alive=false;cancelAnimationFrame(paintFrame);cancelAnimationFrame(entranceFrame);observer.disconnect();hero.removeEventListener(readyEvent,flush);window.removeEventListener('scroll',scrollEarly);portrait.kill();splits.forEach(split=>split.revert());contexts.forEach(context=>context.revert());page.querySelectorAll('[data-home-chapter]').forEach(section=>section.removeAttribute('data-home-chapter'));delete hero.dataset.entrance;delete hero.dataset.fontSplit;delete hero.dataset.portraitReady;delete hero.dataset.portraitFinished;};
  },page);
  return()=>media.revert();
 },{scope:root,dependencies:[locale,rtl],revertOnUpdate:true});
}
