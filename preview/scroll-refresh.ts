import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/*
 * ScrollTrigger.refresh() measures by scrolling the page to the top and back (window.scrollTo(0,0),
 * then the old position). On a phone that programmatic scroll cancels the finger's fling, so the
 * page stopped dead (owner report, 25 Oct 2026: first visit, scrolling down to the three Home
 * projects while the deck was being armed and its images were loading). Every refresh, and the
 * card-stack rebuild that ends in one, now waits until scrolling and touches have been quiet (on a
 * still page that is a 250 ms delay; triggers created meanwhile already measure themselves).
 */
const QUIET=250;
let lastScroll=-Infinity,lastY=0,touching=false,listening=false,timer:ReturnType<typeof setTimeout>|undefined;
const queue=new Set<()=>void>();

// A fling keeps moving on the compositor while the main thread is busy, so scroll events can arrive
// late: the position itself must also be unchanged since the last check.
const idle=()=>{
 const y=scrollY;if(y!==lastY){lastY=y;lastScroll=performance.now();return false;}
 return !touching&&performance.now()-lastScroll>=QUIET;
};
// Checked inside a frame after the main thread has yielded: during a long task the position read
// is stale while the compositor keeps flinging, so a synchronous "still" verdict could be wrong.
function drain(){
 timer=undefined;
 requestAnimationFrame(()=>{
  if(!idle()){timer=setTimeout(drain,QUIET);return;}
  const jobs=[...queue];queue.clear();jobs.forEach(job=>job());
 });
}
function listen(){
 if(listening)return;listening=true;
 lastY=scrollY;
 addEventListener('scroll',()=>{lastScroll=performance.now();lastY=scrollY;},{passive:true,capture:true});
 addEventListener('touchstart',()=>{touching=true;},{passive:true,capture:true});
 const release=()=>{touching=false;lastScroll=performance.now();};
 addEventListener('touchend',release,{passive:true,capture:true});addEventListener('touchcancel',release,{passive:true,capture:true});
}

/** Runs `job` once scrolling and touches have been quiet for QUIET ms. Repeated jobs coalesce. */
export function whenScrollIdle(job:()=>void){
 listen();
 queue.add(job);if(!timer)timer=setTimeout(drain,QUIET);
}

const refresh=()=>ScrollTrigger.refresh();
/** ScrollTrigger.refresh() that never interrupts a scroll in progress (see above). */
export function refreshScrollTriggers(){whenScrollIdle(refresh);}

/** The automatic refresh on window load (often mid-scroll on a first visit) goes through the same gate. */
export function configureScrollRefresh(){
 listen();
 ScrollTrigger.config({autoRefreshEvents:'visibilitychange,DOMContentLoaded,resize',ignoreMobileResize:true});
 if(document.readyState==='complete')return;
 addEventListener('load',refreshScrollTriggers,{once:true});
}
