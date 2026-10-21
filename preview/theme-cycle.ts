import {applyTheme,readThemeChoice,THEMES} from './themes';

/*
 * Owner request (18 Oct 2026): starting on Sterling, the site moves to the next edition every
 * 30 seconds (10 seconds since 21 Oct 2026). A visitor's own menu choice stops the cycle; reduced motion never cycles
 * and it pauses in background tabs. Since 21 Oct 2026 it never waits for scrolling, typing, menus,
 * dialogs or transitions; while the page is scrolling the change is written without the view-transition blend, so
 * only the palette changes and scrolling stays smooth. Choosing any edition in the menu (WCAG 2.2.2 stop
 * mechanism) ends the cycle for that visitor.
 */
const INTERVAL=10_000,SCROLL_QUIET=900;
export function startThemeCycle(){
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const chosen=()=>{try{return readThemeChoice(localStorage)!==null;}catch{return false;}};
 let timer:ReturnType<typeof setTimeout>|undefined,lastScroll=0,stopped=false;
 // Low-end devices keep their edition: each change costs one full-page restyle (same rule as the smoke).
 const device=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean}};
 const constrained=Boolean(device.connection?.saveData)||(device.deviceMemory??8)<=2||(device.hardwareConcurrency??8)<=2;
 const schedule=(delay=INTERVAL)=>{clearTimeout(timer);if(stopped||constrained||document.hidden||reduced.matches)return;timer=setTimeout(advance,delay);};
 function advance(){
  if(chosen())return stop();
  const index=THEMES.findIndex(theme=>theme.id===document.documentElement.dataset.theme);
  // Mid-scroll a view transition would snapshot the page; write the palette directly instead.
  applyTheme(THEMES[(index+1)%THEMES.length].id,false,performance.now()-lastScroll>=SCROLL_QUIET);
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
