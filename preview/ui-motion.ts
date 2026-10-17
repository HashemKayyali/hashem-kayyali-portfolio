import {gsap} from 'gsap';

/*
 * Small delegated interactions shared by every route; no per-component wiring.
 * - Primary actions lean a few pixels toward a mouse pointer (CSS `translate`, so
 *   GSAP transform choreography on the same buttons is untouched).
 * - A chosen filter pill scrolls itself into the middle of a swipeable row.
 */
const MAGNETIC='.pulse-primary,.pulse-resume,.pulse-case-link,.button-primary,.story-contact-action,.story-project-link';
const PULL=.2,REACH=6;

export function startUiMotion(){
 const mouse=matchMedia('(hover: hover) and (pointer: fine)'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let active:HTMLElement|null=null;
 const release=()=>{if(active)gsap.to(active,{'--magnet-x':'0px','--magnet-y':'0px',duration:.6,ease:'expo.out',overwrite:true});active=null;};
 const move=(event:PointerEvent)=>{
  if(event.pointerType!=='mouse'||!mouse.matches||motion.matches){release();return;}
  const target=(event.target as Element|null)?.closest?.<HTMLElement>(MAGNETIC)??null;
  if(target!==active){release();active=target;}
  if(!active)return;
  const box=active.getBoundingClientRect(),clamp=gsap.utils.clamp(-REACH,REACH);
  gsap.to(active,{'--magnet-x':`${clamp((event.clientX-box.left-box.width/2)*PULL)}px`,'--magnet-y':`${clamp((event.clientY-box.top-box.height/2)*PULL)}px`,duration:.45,ease:'power3.out',overwrite:true});
 };
 const center=(event:MouseEvent)=>{
  const button=(event.target as Element|null)?.closest?.<HTMLElement>('.gallery-filters button');
  const row=button?.parentElement;
  if(!button||!row||row.scrollWidth<=row.clientWidth+1)return;
  const a=button.getBoundingClientRect(),r=row.getBoundingClientRect();
  row.scrollBy({left:a.left+a.width/2-(r.left+r.width/2),behavior:motion.matches?'auto':'smooth'});
 };
 document.addEventListener('pointermove',move,{passive:true});
 document.documentElement.addEventListener('pointerleave',release);
 document.addEventListener('click',center);
 return()=>{release();document.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',release);document.removeEventListener('click',center);};
}
