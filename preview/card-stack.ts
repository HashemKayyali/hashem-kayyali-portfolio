import {gsap} from 'gsap';
import {onLayoutResize} from './layout-resize';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

/*
 * Signature stacking deck (Home selected work + Projects collection, all viewports).
 * CSS owns the stacking itself (position:sticky with a per-card offset); one scrubbed
 * ScrollTrigger per covered card adds depth (scale + dim). Scrubbing reverses naturally,
 * so scrolling up unstacks. The deck falls back to normal flow when a card cannot fit
 * below the header, and the caller skips it for reduced motion.
 */
export type CardStackOptions={id:string;surface?:string;offset?:number;mobileOffset?:number;depth?:number};
export function createCardStack(deck:HTMLElement,options:CardStackOptions){
 let context:gsap.Context|undefined,frame=0,alive=true,built='';
 const rebuild=()=>{
  frame=0;if(!alive)return;
  const items=[...deck.children].filter((node):node is HTMLElement=>node instanceof HTMLElement&&node.matches('[data-stack-item]:not([data-filtered=true])')&&node.offsetParent!==null);
  const header=document.querySelector('.site-header')?.getBoundingClientRect().height??68;
  // The viewport height that does not move with a phone's address bar (innerHeight does). Rebuilding
  // reverts every layer and refreshes ScrollTrigger; doing that each time the bar slid froze phones
  // mid-scroll (300-500 ms) and could flip the deck between stacked and flat. Rebuild only on change.
  const viewport=document.documentElement.clientHeight,signature=[innerWidth,viewport,Math.round(header),...items.map(item=>item.offsetHeight)].join();
  if(signature===built)return;
  context?.revert();context=undefined;
  const mobile=innerWidth<801,offset=mobile?(options.mobileOffset??8):(options.offset??14);
  const top=Math.round(header+(mobile?10:18));
  items.forEach((item,index)=>item.style.setProperty('--stack-i',String(index)));
  deck.style.setProperty('--stack-top',top+'px');deck.style.setProperty('--stack-offset',offset+'px');
  // Measure in deck geometry (cards compact in stack mode), then keep it only if every card
  // (plus the offsets of those beneath it) fits below the header.
  deck.dataset.stack='active';
  const tallest=Math.max(0,...items.map(item=>item.offsetHeight));
  const fits=items.length>1&&tallest+top+Math.min(items.length,4)*offset+24<viewport;
  deck.dataset.stack=fits?'active':'static';
  if(!fits){built=signature;ScrollTrigger.refresh();return;}
  deck.style.setProperty('--stack-tail',Math.max(48,tallest-items.at(-1)!.offsetHeight+48)+'px');
  context=gsap.context(()=>{
   items.slice(0,-1).forEach((item,index)=>{
    const next=items[index+1],surface=options.surface?item.querySelector<HTMLElement>(options.surface)??item:item;
    // Covered cards recede and dim. The shade is a child animated by opacity (compositor only);
    // an inherited custom property here restyled every descendant on each scroll frame.
    const shade=surface.querySelector<HTMLElement>(':scope>.stack-shade')??surface.appendChild(Object.assign(document.createElement('span'),{className:'stack-shade',ariaHidden:'true'}));
    gsap.timeline({scrollTrigger:{id:`${options.id}:layer:${index}`,trigger:next,start:'top bottom-=8%',end:()=>`top ${top+(index+1)*offset}px`,scrub:.5,invalidateOnRefresh:true}})
     .fromTo(surface,{scale:1},{scale:1-(options.depth??.045),ease:'none',transformOrigin:'50% 0%'},0)
     .fromTo(shade,{opacity:0},{opacity:.32,ease:'none'},0);
   });
  },deck);
  built=signature;ScrollTrigger.refresh();
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(rebuild);};
 const resize=new ResizeObserver(schedule);resize.observe(deck);
 // A phone's address bar fires resize with only innerHeight changed: nothing to rebuild, nothing to measure.
 const unresize=onLayoutResize(schedule);
 void document.fonts.ready.then(schedule);
 rebuild();
 return {refresh:schedule,dispose:()=>{alive=false;cancelAnimationFrame(frame);resize.disconnect();unresize();context?.revert();deck.querySelectorAll('.stack-shade').forEach(shade=>shade.remove());delete deck.dataset.stack;['--stack-top','--stack-offset','--stack-tail'].forEach(name=>deck.style.removeProperty(name));}};
}
