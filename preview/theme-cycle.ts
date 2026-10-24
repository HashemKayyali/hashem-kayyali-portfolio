import {applyTheme,readThemeChoice,THEMES} from './themes';

/*
 * Owner request (18 Oct 2026): starting on Sterling, the site moves to the next edition every
 * 30 seconds (10 seconds since 21 Oct 2026). Since 24 Oct 2026 it cycles in every situation: phones,
 * Save-Data / battery-saver, low-memory and reduced-motion devices all keep the 10 second rhythm
 * (applyTheme already writes the palette instantly, without the view-transition blend, for those).
 * Only background tabs pause (nobody sees the change; returning restarts a full interval). It never
 * waits for scrolling, typing, menus, dialogs or transitions; while the page is scrolling the change is
 * written without the blend, so only the palette changes and scrolling stays smooth. A visitor's own
 * menu choice (WCAG 2.2.2 stop mechanism) ends the cycle for that visitor.
 */
const INTERVAL=10_000,SCROLL_QUIET=900;
export function startThemeCycle(){
 const chosen=()=>{try{return readThemeChoice(localStorage)!==null;}catch{return false;}};
 let timer:ReturnType<typeof setTimeout>|undefined,lastScroll=0,stopped=false;
 const schedule=(delay=INTERVAL)=>{clearTimeout(timer);if(stopped||document.hidden)return;timer=setTimeout(advance,delay);};
 function advance(){
  if(chosen())return stop();
  const index=THEMES.findIndex(theme=>theme.id===document.documentElement.dataset.theme);
  // Mid-scroll a view transition would snapshot the page; write the palette directly instead.
  applyTheme(THEMES[(index+1)%THEMES.length].id,false,performance.now()-lastScroll>=SCROLL_QUIET);
  schedule();
 }
 const scrolled=()=>{lastScroll=performance.now();};
 const visibility=()=>{if(document.hidden)clearTimeout(timer);else schedule();};
 const picked=(event:Event)=>{if((event as CustomEvent<{chosen?:boolean}>).detail?.chosen)stop();};
 function stop(){stopped=true;clearTimeout(timer);removeEventListener('scroll',scrolled);document.removeEventListener('visibilitychange',visibility);removeEventListener('portfolio-theme-change',picked);}
 if(chosen())return stop;
 addEventListener('scroll',scrolled,{passive:true});document.addEventListener('visibilitychange',visibility);addEventListener('portfolio-theme-change',picked);
 schedule();
 return stop;
}
