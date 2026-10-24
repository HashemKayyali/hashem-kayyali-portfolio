import {type RefObject} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useGSAP} from '@gsap/react';
import {allowsMotion} from './route-motion';
import {projectVisualInFlight} from './project-transit';
import {liteMotion} from './lite-motion';

gsap.registerPlugin(ScrollTrigger,useGSAP);
/** Read-only inspection of actual GSAP objects in this isolated review build. */
Object.defineProperty(window,'__portfolioMotion',{configurable:true,value:()=>({
 version:gsap.version,reactHook:'useGSAP',
 timelines:gsap.globalTimeline.getChildren(true,true,true).filter(animation=>animation.vars.id).map(animation=>({id:animation.vars.id,progress:animation.progress(),active:animation.isActive()})),
 triggers:ScrollTrigger.getAll().map(trigger=>({id:trigger.vars.id,progress:trigger.progress,start:trigger.start,end:trigger.end,connected:trigger.trigger?.isConnected})),
})});

/** All effects revert on route/language changes. Scrolling remains native. */
export function usePortfolioMotion(root:RefObject<HTMLDivElement|null>,key:string,_rtl:boolean) {
 useGSAP(()=>{
  const element=root.current;if(!element)return;
  // Locale exit leaves these persistent nodes at zero opacity. Seed a visible
  // baseline before the reversible entrance captures styles; otherwise its
  // next route cleanup restores that exit snapshot and hides the navigation.
  element.querySelectorAll<HTMLElement>('.header-layout,.shared-hero-portrait,.compact-footer').forEach(node=>node.style.removeProperty('opacity'));
  const media=gsap.matchMedia();
  media.add({motion:'(prefers-reduced-motion: no-preference)',reduced:'(prefers-reduced-motion: reduce)'},()=>{
   if(!allowsMotion()){
    const stage=element.querySelector<HTMLElement>('.route-stage');
    if(stage){gsap.set([stage,...element.querySelectorAll('.header-layout,.shared-hero-portrait,.compact-footer')],{clearProps:'opacity,transform'});stage.dataset.transition='idle';}
    element.dataset.languageTransition='false';return;
   }
   let entryFrame=0;
   const stage=element.querySelector<HTMLElement>('.route-stage');
   const heroElement=element.querySelector<HTMLElement>('.hero,.vision-opening,.atelier-about-opening,.app-collection-hero,.case-opening');
   if(stage){
    stage.dataset.transition='enter';
    if(element.dataset.languageTransition==='true'){
     const targets=[stage,...element.querySelectorAll('.header-layout,.shared-hero-portrait,.compact-footer')];
     const enter=gsap.fromTo(targets,{opacity:0},{opacity:1,paused:true,duration:.28,ease:'power2.out',id:'route:language',clearProps:'opacity,transform',onComplete:()=>{stage.dataset.transition='idle';element.dataset.languageTransition='false';}});
     entryFrame=requestAnimationFrame(()=>{entryFrame=requestAnimationFrame(()=>enter.play(0));});
    }else if(element.dataset.portraitContinuation==='true'){
     gsap.set(stage,{clearProps:'opacity,transform'});
     gsap.fromTo(stage.querySelectorAll('.pulse-identity>*,.pulse-actions,.atelier-about-copy>*'),{y:30,opacity:0},{y:0,opacity:1,duration:.9,stagger:.07,ease:'expo.out',id:'route:portrait-copy',clearProps:'opacity,transform',onComplete:()=>{stage.dataset.transition='idle';}});
    }else{const stationary=heroElement||projectVisualInFlight();gsap.fromTo(stage,{opacity:0,y:stationary?0:12},{opacity:1,y:0,duration:.45,ease:'power2.out',id:'route:enter',clearProps:'opacity,transform',onComplete:()=>{stage.dataset.transition='idle';}});
     // Opening choreography for page heroes (case openings and shared-image arrivals own theirs).
     // Experience has no entrance animations (owner decision, 24 Oct 2026).
     if(!projectVisualInFlight()&&!stage.querySelector('.signature-case,.experience-journey')){
      const copy=stage.querySelectorAll(':is(.compact-hero-copy,.app-collection-copy,.journey-opening .compact-hero-copy)>*,.app-collection-copy .gallery-intro-copy>*');
      const visual=stage.querySelectorAll('.compact-hero-visual,.app-collection-visual');
      if(copy.length)gsap.fromTo(copy,{y:34,opacity:0},{y:0,opacity:1,duration:.95,stagger:.07,delay:.05,ease:'expo.out',id:'route:hero-copy',clearProps:'opacity,transform'});
      if(visual.length)gsap.fromTo(visual,{y:24,scale:.97,opacity:0},{y:0,scale:1,opacity:1,duration:1.1,delay:.12,ease:'expo.out',id:'route:hero-visual',clearProps:'opacity,transform'});
     }}
   }
   const intro=element.querySelector('.projects .section-heading');
   if(intro)gsap.from(intro,{y:18,opacity:0,duration:.8,ease:'power3.out',delay:.08});
   const cover=element.querySelector('.case-cover');if(cover)gsap.from(cover,{y:20,duration:.8,ease:'power2.out'});
   for(const story of element.querySelectorAll<HTMLElement>('.engineering-story')) {
    const line=story.querySelector('.story-progress');
    if(line)gsap.fromTo(line,{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:story,start:'top 65%',end:'bottom 75%',scrub:true,onUpdate:trigger=>{story.dataset.progress=trigger.progress.toFixed(3);}}});
    for(const step of story.querySelectorAll<HTMLElement>('.story-step')) {
     gsap.from(step.querySelector('.story-step-copy'),{y:18,duration:.7,scrollTrigger:{trigger:step,start:'top 85%',toggleActions:'play none none reverse'}});
     gsap.fromTo(step.querySelector('.story-node'),{scale:.8},{scale:1,ease:'none',scrollTrigger:{trigger:step,start:'top 85%',end:'top 40%',scrub:true}});
     const image=step.querySelector('img');if(image)gsap.fromTo(image,{y:12},{y:-12,ease:'none',scrollTrigger:{trigger:step,start:'top bottom',end:'bottom top',scrub:true}});
    }
   }
   let alive=true;let refreshFrame=0;
   const refresh=()=>{cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(()=>{if(alive)ScrollTrigger.refresh();});};
   const pause=(event:Event)=>{
    const paused=Boolean((event as CustomEvent).detail);
    for(const trigger of ScrollTrigger.getAll())if(trigger.trigger&&element.contains(trigger.trigger))paused?trigger.disable(false):trigger.enable(false);
    for(const animation of gsap.globalTimeline.getChildren())if(!animation.scrollTrigger)paused?animation.pause():animation.resume();
   };
   window.addEventListener('portfolio-motion-pause',pause);
   // Dedicated gallery/case hooks own readiness and media refreshes. A second
   // global pass repeats all trigger measurements during their entrance.
   const ownedRefresh=Boolean(element.querySelector('.project-exhibition,.signature-case,.home-page,.lab-home,.vision-home'));
   const images=ownedRefresh?[]:[...element.querySelectorAll('img')];
   if(!ownedRefresh)void document.fonts.ready.then(refresh);
   images.forEach(image=>image.addEventListener('load',refresh,{once:true}));
   return()=>{alive=false;cancelAnimationFrame(entryFrame);cancelAnimationFrame(refreshFrame);window.removeEventListener('portfolio-motion-pause',pause);images.forEach(image=>image.removeEventListener('load',refresh));};
  },element);
  return()=>media.revert();
 },{scope:root,dependencies:[key],revertOnUpdate:true});
}

/** Project-owned triggers also clean up when a collection filter unmounts them. */
export function useFeaturedMotion(root:RefObject<HTMLElement|null>,key:string,rtl:boolean,homeScene=false) {
 useGSAP(()=>{
  const project=root.current;if(!project)return;
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
   if(!allowsMotion())return;
   const mobile=matchMedia('(max-width:700px)').matches;
   const direction=rtl?-1:1,prefix=homeScene?'home:project:':'project:';
   const mask=project.querySelector('.project-media-reveal');
   const copy=project.querySelector('.spotlight-copy');
   const secondary=project.querySelector('.project-secondary');
   let alive=true;
   let animationContext:gsap.Context|undefined;
   const initialize=()=>{
   if(!alive||animationContext)return;
   project.dataset.motion='running';
   observer.disconnect();
   animationContext=gsap.context(()=>{
   if(liteMotion()){
    // Phones: the media and copy arrive as one opacity/translate tween when the story nears the viewport.
    // No clip-path masks (each repainted a full-width image per frame) and no depth/exit scrubs.
    const parts=[mask,copy?.querySelector('h3'),copy?.querySelector('.project-meta'),copy?.querySelector('p'),copy?.querySelector('.project-technical'),copy?.querySelector('.project-bottom'),secondary].filter(Boolean);
    gsap.fromTo(parts,{y:14,opacity:.25},{y:0,opacity:1,duration:.55,stagger:.04,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{id:prefix+key+':reveal',trigger:project,start:'top 88%',once:true}});
    return;
   }
   const timeline=gsap.timeline({id:prefix+key+':entrance',scrollTrigger:{id:prefix+key+':reveal',trigger:project,start:'top 88%',toggleActions:'play none none reverse'},defaults:{ease:'power3.out'}});
   const terminal=key.startsWith('terminal-nfc');
   timeline.fromTo(mask,{clipPath:terminal?(rtl?'inset(0% 0% 0% 82%)':'inset(0% 82% 0% 0%)'):'inset(0% 0% 82% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:homeScene?1.05:1.1,ease:'power3.inOut'},0)
    .from(copy?.querySelector('h3')??null,{x:direction*(homeScene?24:16),y:12,clipPath:homeScene?(rtl?'inset(0 0 0 12%)':'inset(0 12% 0 0)'):'none',duration:.9,clearProps:'clipPath,transform'},.06)
    .from(copy?.querySelector('.project-technical')??null,{y:10,duration:.75},.2);
   if(homeScene){timeline.from(copy?.querySelector('.project-meta')??null,{y:8,duration:.55},.03).from(copy?.querySelector('p')??null,{y:12,duration:.8},.14).from(copy?.querySelector('.project-bottom')??null,{y:8,duration:.65},.34);}
   if(secondary)timeline.from(secondary,{y:22,x:direction*(terminal?-16:16),clipPath:'inset(0% 0% 90% 0%)',duration:1.0,ease:'power3.inOut'},.28);
   const depth=gsap.timeline({scrollTrigger:{id:prefix+key+':depth',trigger:project,start:'top bottom',end:'bottom top',scrub:.65,onUpdate:trigger=>{project.dataset.scrollProgress=trigger.progress.toFixed(3);}}});
   depth.fromTo(project.querySelector('.project-image-depth'),{y:mobile?6:18,scale:1.035},{y:mobile?-6:-18,scale:1,ease:'none'},0);
   if(secondary)depth.fromTo(secondary.querySelector('.project-secondary-media'),{y:mobile?-3:-7},{y:mobile?3:7,ease:'none'},0);
   gsap.to(copy,{y:-14,ease:'none',scrollTrigger:{id:prefix+key+':exit',trigger:project,start:'bottom 20%',end:'bottom top',scrub:.5}});
   },project);
   };
   // Offscreen stories need no synchronous ScrollTrigger layout work during Hero load.
   const focus=()=>{initialize();ScrollTrigger.getById(prefix+key+':reveal')?.animation?.progress(1);};
   if(homeScene)project.addEventListener('focusin',focus);
   project.dataset.motion='armed';
   const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))initialize();},{rootMargin:'180px 0px'});
   observer.observe(project);
   const refresh=()=>{if(animationContext)ScrollTrigger.refresh();};
   project.querySelectorAll('img').forEach(img=>img.addEventListener('load',refresh,{once:true}));
   return()=>{alive=false;observer.disconnect();project.removeEventListener('focusin',focus);animationContext?.revert();delete project.dataset.motion;project.querySelectorAll('img').forEach(img=>img.removeEventListener('load',refresh));};
  },project);
  return()=>media.revert();
 },{scope:root,dependencies:[key,homeScene],revertOnUpdate:true});
}
