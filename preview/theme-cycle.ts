import {applyTheme,THEMES} from './themes';

/*
 * Owner request (18 Oct 2026): starting on Sterling, the site moves to the next edition every
 * 30 seconds (10 seconds since 21 Oct 2026). Since 24 Oct 2026 the cycle is mandatory on phones and
 * desktops alike: Save-Data / battery-saver, low-memory and reduced-motion devices keep the 10 second
 * rhythm (applyTheme writes the palette instantly, without the view-transition blend, for those), and
 * a theme picked in the menu (or one saved by an earlier visit) no longer stops it: the pick shows at
 * once and the cycle continues from it 10 seconds later. Only background tabs pause (nobody sees the
 * change; returning restarts a full interval). It never waits for scrolling, typing, menus, dialogs or
 * transitions. Since 24 Oct 2026 the automatic change writes the palette directly, never through a
 * view transition: the 1.4 s page snapshot froze the smoke, blocked clicks and showed a frozen page
 * when scrolling began, which read as a reload. The smoke still eases into its new colours itself.
 */
const INTERVAL=10_000;
export function startThemeCycle(){
 let timer:ReturnType<typeof setTimeout>|undefined,stopped=false;
 const schedule=(delay=INTERVAL)=>{clearTimeout(timer);if(stopped||document.hidden)return;timer=setTimeout(advance,delay);};
 function advance(){
  const index=THEMES.findIndex(theme=>theme.id===document.documentElement.dataset.theme);
  applyTheme(THEMES[(index+1)%THEMES.length].id,false,false);
  schedule();
 }
 const visibility=()=>{if(document.hidden)clearTimeout(timer);else schedule();};
 // A menu pick restarts the interval so the chosen edition stays a full 10 seconds.
 const picked=(event:Event)=>{if((event as CustomEvent<{chosen?:boolean}>).detail?.chosen)schedule();};
 function stop(){stopped=true;clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);removeEventListener('portfolio-theme-change',picked);}
 document.addEventListener('visibilitychange',visibility);addEventListener('portfolio-theme-change',picked);
 schedule();
 return stop;
}
