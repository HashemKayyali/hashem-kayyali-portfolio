import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

/*
 * Desktop wheel smoothing with Lenis (owner-approved exception, 17 October 2026).
 * Lenis moves the real document scroll, so sticky stacks, IntersectionObserver
 * arrivals and ScrollTrigger keep working. Touch, keyboard and reduced motion stay
 * native: Lenis is never created for them.
 */
let lenis:Lenis|null=null;
const tick=(time:number)=>lenis?.raf(time*1000);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startSmoothScroll(){
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),mouse=matchMedia('(hover: hover) and (pointer: fine)');
 const start=()=>{
  if(lenis||motion.matches||!mouse.matches)return;
  lenis=new Lenis({
   duration:1.4,                         // cinematic settle, chosen by the owner
   easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),
   smoothWheel:true,syncTouch:false,
   allowNestedScroll:true,               // menus, dialogs, filmstrips and admin panels scroll natively
   stopInertiaOnNavigate:true,
  });
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(tick);
 };
 const stop=()=>{if(!lenis)return;gsap.ticker.remove(tick);lenis.destroy();lenis=null;};
 const sync=()=>motion.matches||!mouse.matches?stop():start();
 sync();motion.addEventListener('change',sync);mouse.addEventListener('change',sync);
 document.addEventListener('click',followAnchor);
 return()=>{motion.removeEventListener('change',sync);mouse.removeEventListener('change',sync);document.removeEventListener('click',followAnchor);stop();};
}

/** Route changes and restorations jump instantly; any wheel inertia must not carry over. */
export function haltSmoothScroll(){if(lenis&&!lenis.isStopped){lenis.stop();lenis.start();}}

/** Glides to an in-page target below the sticky header, then moves focus there like a native fragment jump. */
export function scrollToElement(target:HTMLElement){
 const margin=parseFloat(getComputedStyle(target).scrollMarginTop)||0;
 const header=document.querySelector('.site-header')?.getBoundingClientRect().height??0;
 const top=Math.max(0,target.getBoundingClientRect().top+scrollY-(margin||header+16));
 if(lenis)lenis.scrollTo(top,{immediate:reduced()});
 else scrollTo({top,behavior:reduced()?'instant':'smooth'});
 if(!target.matches('a[href],button,input,select,textarea,summary,[tabindex]'))target.setAttribute('tabindex','-1');
 target.focus({preventScroll:true});
}

function followAnchor(event:MouseEvent){
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const link=(event.target as Element|null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
 if(!link||link.target||link.classList.contains('skip-link'))return;
 let id=link.hash.slice(1);try{id=decodeURIComponent(id);}catch{}
 const target=id?document.getElementById(id):null;if(!target)return;
 event.preventDefault();
 if(location.hash!==link.hash)history.pushState(history.state,'',link.hash);
 scrollToElement(target);
}
