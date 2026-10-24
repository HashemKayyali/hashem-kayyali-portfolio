import {applyTheme,THEMES} from './themes';

/*
 * Owner request (18 Oct 2026): starting on Sterling, the site moves to the next edition every
 * 30 seconds (10 seconds since 21 Oct 2026). Since 24 Oct 2026 the cycle is mandatory on phones and
 * desktops alike: Save-Data / battery-saver, low-memory and reduced-motion devices keep the 10 second
 * rhythm (applyTheme writes the palette instantly, without the view-transition blend, for those), and
 * a theme picked in the menu (or one saved by an earlier visit) no longer stops it: the pick shows at
 * once and the cycle continues from it 10 seconds later. Only background tabs pause (nobody sees the
 * change; returning restarts a full interval). It never waits for scrolling, typing, menus, dialogs or
 * transitions; while the page is scrolling the change is written without the blend.
 */
const INTERVAL=10_000,SCROLL_QUIET=900;
export function startThemeCycle(){
 let timer:ReturnType<typeof setTimeout>|undefined,lastScroll=0,stopped=false;
 const schedule=(delay=INTERVAL)=>{clearTimeout(timer);if(stopped||document.hidden)return;timer=setTimeout(advance,delay);};
 function advance(){
  const index=THEMES.findIndex(theme=>theme.id===document.documentElement.dataset.theme);
  // Mid-scroll a view transition would snapshot the page; write the palette directly instead.
  applyTheme(THEMES[(index+1)%THEMES.length].id,false,performance.now()-lastScroll>=SCROLL_QUIET);
  schedule();
 }
 const scrolled=()=>{lastScroll=performance.now();};
 const visibility=()=>{if(document.hidden)clearTimeout(timer);else schedule();};
 // A menu pick restarts the interval so the chosen edition stays a full 10 seconds.
 const picked=(event:Event)=>{if((event as CustomEvent<{chosen?:boolean}>).detail?.chosen)schedule();};
 function stop(){stopped=true;clearTimeout(timer);removeEventListener('scroll',scrolled);document.removeEventListener('visibilitychange',visibility);removeEventListener('portfolio-theme-change',picked);}
 addEventListener('scroll',scrolled,{passive:true});document.addEventListener('visibilitychange',visibility);addEventListener('portfolio-theme-change',picked);
 schedule();
 return stop;
}
