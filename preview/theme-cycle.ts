import {applyTheme,readThemeChoice,THEMES} from './themes';

/*
 * Owner request (18 Oct 2026): starting on Sterling, the site moves to the next edition every
 * 30 seconds. A visitor's own menu choice stops the cycle; reduced motion never cycles; it
 * pauses in background tabs and waits while the visitor scrolls or types, a menu or dialog is open,
 * or a page or project image is in transit. Choosing any edition in the menu (WCAG 2.2.2 stop
 * mechanism) ends the cycle for that visitor.
 */
const INTERVAL=30_000,RETRY=1_200,SCROLL_QUIET=900;
export function startThemeCycle(){
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const chosen=()=>{try{return readThemeChoice(localStorage)!==null;}catch{return false;}};
 let timer:ReturnType<typeof setTimeout>|undefined,lastScroll=0,stopped=false;
 // Low-end devices keep their edition: each change costs one full-page restyle (same rule as the smoke).
 const device=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean}};
 const constrained=Boolean(device.connection?.saveData)||(device.deviceMemory??8)<=2||(device.hardwareConcurrency??8)<=2;
 const schedule=(delay=INTERVAL)=>{clearTimeout(timer);if(stopped||constrained||document.hidden||reduced.matches)return;timer=setTimeout(advance,delay);};
 const busy=()=>{
  const root=document.documentElement;
  return performance.now()-lastScroll<SCROLL_QUIET||Boolean(root.dataset.projectTransit)||root.hasAttribute('data-menu-open')
   ||Boolean(document.querySelector('.route-stage[inert],.theme-options,.language-options,dialog[open]'))
   // Never repaint the page under someone typing (contact form, Studio editor).
   ||Boolean(document.activeElement?.matches?.('input,textarea,select,[contenteditable="true"]'));
 };
 function advance(){
  if(chosen())return stop();
  if(busy())return schedule(RETRY);
  const index=THEMES.findIndex(theme=>theme.id===document.documentElement.dataset.theme);
  applyTheme(THEMES[(index+1)%THEMES.length].id,false,true);
  schedule();
 }
 const scrolled=()=>{lastScroll=performance.now();};
 const visibility=()=>{if(document.hidden)clearTimeout(timer);else schedule();};
 const motion=()=>reduced.matches?clearTimeout(timer):schedule();
 const picked=(event:Event)=>{if((event as CustomEvent<{chosen?:boolean}>).detail?.chosen)stop();};
 function stop(){stopped=true;clearTimeout(timer);removeEventListener('scroll',scrolled);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',motion);removeEventListener('portfolio-theme-change',picked);}
 if(chosen())return stop;
 addEventListener('scroll',scrolled,{passive:true});document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',motion);addEventListener('portfolio-theme-change',picked);
 schedule();
 return stop;
}
