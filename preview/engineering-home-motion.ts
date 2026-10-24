import type {RefObject} from 'react';
import {useGSAP} from '@gsap/react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {createCardStack} from './card-stack';
import {allowsMotion} from './route-motion';
import {liteMotion} from './lite-motion';
import {refreshScrollTriggers} from './scroll-refresh';

gsap.registerPlugin(useGSAP,ScrollTrigger);

/** Product Signal: a single route-owned context for choreography, depth and interaction. */
export function useEngineeringHomeMotion(root:RefObject<HTMLElement|null>,locale:string){
 useGSAP(()=>{
  const element=root.current;if(!element)return;
  const hero=element.querySelector<HTMLElement>('[data-home-intro]');
  if(hero)hero.dataset.intro='complete';
  const media=gsap.matchMedia();
  let introRan=false;
  media.add({motion:'(prefers-reduced-motion:no-preference)',desktop:'(min-width:1100px)'},match=>{
   if(!match.conditions?.motion)return;
   if(!allowsMotion()){element.dataset.motionPolicy='static';return()=>{delete element.dataset.motionPolicy;};}
   let alive=true,frame=0,readinessTimer=0;
   const owned=gsap.context(()=>{},element),disposers:Array<()=>void>=[];
   const rtl=locale==='ar',direction=rtl?-1:1;
   if(hero)hero.dataset.intro='waiting';
   const scenes=[...element.querySelectorAll<HTMLElement>('[data-home-scene]')];
   const markers=[...element.querySelectorAll<HTMLElement>('[data-scene-marker]')];
   const arm=()=>{
    if(!alive||!allowsMotion())return;
    owned.add(()=>{
     const desktop=Boolean(match.conditions?.desktop);
     gsap.fromTo('.pulse-work-progress',{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{id:'signal:work-progress',trigger:element.querySelector('.pulse-scenes'),start:'top 75%',end:'bottom 70%',scrub:.3}});
     const lite=liteMotion();
     const setups=new Map<Element,()=>void>(),initialized=new Set<Element>();
     const ensure=(target:Element)=>{if(!alive||!allowsMotion()||initialized.has(target))return;initialized.add(target);owned.add(()=>setups.get(target)?.());};
     scenes.forEach((scene,index)=>setups.set(markers[index],()=>{
      const marker=markers[index];
      const entrance=gsap.timeline({id:'signal:scene:'+index,scrollTrigger:{id:'signal:scene-entry:'+index,trigger:marker,start:'top 88%',toggleActions:lite?'play none none none':'play none none reverse'},defaults:{ease:'power3.out'}});
      if(lite){
       // Phones: one tween for the whole scene, no mask line, tilt or image parallax.
       entrance.fromTo([...scene.querySelectorAll('.pulse-scene-copy h3,.pulse-scene-copy>p,.pulse-scene-copy ul,.pulse-case-link,.project-media-primary')],{y:14,opacity:.2},{y:0,opacity:1,duration:.55,stagger:.05,clearProps:'transform,opacity'},0);
       return;
      }
      entrance.fromTo(scene.querySelector('.pulse-scene-copy h3 .pulse-line-mask>span'),{yPercent:105},{yPercent:0,duration:.9},0)
       .fromTo(scene.querySelectorAll('.pulse-scene-copy>p,.pulse-scene-copy ul,.pulse-case-link'),{y:17,opacity:.15},{y:0,opacity:1,duration:.65,stagger:.08},.15);
      entrance.fromTo(scene.querySelectorAll('.project-media-primary'),{y:14,opacity:.25},{y:0,opacity:1,duration:.7,stagger:.09,clearProps:'transform,opacity'},.12);
      const detail=scene.querySelector('.pulse-scene-detail');
      if(detail)entrance.fromTo(detail,{y:30,rotation:index===0?14:-14,opacity:0},{y:0,rotation:index===0?6:-5,opacity:1,duration:1.05},.2);
      gsap.fromTo(scene.querySelector('.project-media-set'),{y:6},{y:0,ease:'none',scrollTrigger:{id:'signal:image-depth:'+index,trigger:marker,start:'top bottom',end:()=>'+='+scene.offsetHeight,scrub:.65}});
     }));
     const deck=element.querySelector<HTMLElement>('.pulse-scenes')!;
     // Shared signature deck (also used by Projects): sticky layering with scrubbed depth, all viewports.
     const stack=createCardStack(deck,{id:'signal',surface:'.pulse-scene-surface',offset:14,mobileOffset:8,depth:.035});
     disposers.push(()=>stack.dispose());
     const sceneTargets=new Map<Element,Element>(scenes.map((scene,index)=>[scene,markers[index]]));
     const lazyObserver=new IntersectionObserver(entries=>{if(alive&&allowsMotion())for(const entry of entries)if(entry.isIntersecting){lazyObserver.unobserve(entry.target);ensure(sceneTargets.get(entry.target)??entry.target);}},{rootMargin:'220px 0px'});
     for(const target of setups.keys())lazyObserver.observe(target);
     for(const scene of scenes)lazyObserver.observe(scene);
     disposers.push(()=>lazyObserver.disconnect());
     // At most two magnetic controls; the clickable hit boxes remain stationary.
     for(const control of element.querySelectorAll<HTMLElement>('.pulse-primary')){
      const target=control.querySelector<HTMLElement>('.pulse-action-text')??control.querySelector<SVGElement>('svg');if(!target)continue;
      const xTo=gsap.quickTo(target,'x',{duration:.35,ease:'power3.out'}),yTo=gsap.quickTo(target,'y',{duration:.35,ease:'power3.out'});
      let bounds:DOMRect|undefined;
      const enter=(event:PointerEvent)=>{if(event.pointerType==='mouse')bounds=control.getBoundingClientRect();};
      const move=(event:PointerEvent)=>{if(!bounds||event.pointerType!=='mouse')return;xTo(gsap.utils.clamp(-5,5,(event.clientX-bounds.left-bounds.width/2)*.12));yTo(gsap.utils.clamp(-4,4,(event.clientY-bounds.top-bounds.height/2)*.12));};
      const leave=()=>{bounds=undefined;xTo(0);yTo(0);};
      control.addEventListener('pointerenter',enter);control.addEventListener('pointermove',move);control.addEventListener('pointerleave',leave);control.addEventListener('blur',leave);
      disposers.push(()=>{control.removeEventListener('pointerenter',enter);control.removeEventListener('pointermove',move);control.removeEventListener('pointerleave',leave);control.removeEventListener('blur',leave);});
     }
     const focus=(event:FocusEvent)=>{
      const scene=(event.target as HTMLElement).closest<HTMLElement>('[data-home-scene]');
      if(scene){
       const index=scenes.indexOf(scene);ensure(markers[index]);ScrollTrigger.getById('signal:scene-entry:'+index)?.animation?.progress(1);
       const target=event.target as HTMLElement,rect=target.getBoundingClientRect();
       const obscured=scenes.slice(index+1).some(next=>{const box=next.getBoundingClientRect();return box.top<rect.bottom&&box.bottom>rect.top;});
       if(deck.dataset.stack==='active'&&target.matches(':focus-visible')&&obscured){
        const marker=markers[index];if(marker)scrollTo({top:marker.getBoundingClientRect().top+scrollY-(parseFloat(deck.style.getPropertyValue('--stack-top'))||86)-index*14,behavior:'instant'});
       }
      }
     };
     element.addEventListener('focusin',focus);disposers.push(()=>element.removeEventListener('focusin',focus));
     refreshScrollTriggers();
    });
   };
   const start=()=>{
    if(!alive||!allowsMotion())return;
    owned.add(()=>{
     if(hero)hero.dataset.intro='preparing';
     const timeline=gsap.timeline({paused:true,id:'signal:hero-choreography',defaults:{ease:'power3.out'},onComplete:()=>{if(!alive)return;introRan=true;if(hero)hero.dataset.intro='complete';arm();}});
     timeline.fromTo('.pulse-name-word',{yPercent:140},{yPercent:0,duration:1.05,stagger:.1,clearProps:'transform'},0)
      .fromTo('.pulse-identity>.pulse-kicker,.pulse-identity>.pulse-roles',{y:12,opacity:.3},{y:0,opacity:1,duration:.7,stagger:.08,clearProps:'transform,opacity'},.05)
      .fromTo('.pulse-statement,.pulse-actions',{y:12},{y:0,duration:.85,stagger:.06,clearProps:'transform'},.18);
     frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{if(alive){if(hero)hero.dataset.intro='running';timeline.play(0);}});});
    });
   };
   const shell=element.closest<HTMLElement>('.atelier-app-shell');
   const continuedPortrait=shell?.dataset.portraitContinuation==='true'||shell?.dataset.languageTransition==='true';
   if(continuedPortrait){introRan=true;if(hero)hero.dataset.intro='complete';readinessTimer=window.setTimeout(arm,450);}
   else if(introRan){if(hero)hero.dataset.intro='complete';arm();}
   else void document.fonts.ready.then(()=>{
    if(!alive)return;
    const images=[...element.querySelectorAll<HTMLImageElement>('.pulse-fragment img')];
    // The portrait is already visible. Warm only the animated preview textures;
    // slow/failed media must never block the entrance indefinitely.
    const decoded=Promise.all(images.map(image=>image.decode().catch(()=>{})));
    return Promise.race([decoded,new Promise(resolve=>{readinessTimer=window.setTimeout(resolve,400);})]).then(()=>{
     clearTimeout(readinessTimer);if(alive)frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(start);});
    });
   });
   return()=>{alive=false;cancelAnimationFrame(frame);clearTimeout(readinessTimer);disposers.forEach(dispose=>dispose());owned.revert();if(hero)hero.dataset.intro='complete';delete element.dataset.motionPolicy;};
  },element);
  return()=>media.revert();
 },{scope:root,dependencies:[locale],revertOnUpdate:true});
}
