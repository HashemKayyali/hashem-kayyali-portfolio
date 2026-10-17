import {useLayoutEffect,useRef,type RefObject} from 'react';
import {createCardStack} from './card-stack';
import {allowsMotion} from './route-motion';

// Owner choice (18 Oct 2026): landscape tablets and laptops keep the split card grid;
// portrait tablets and phones stack the cards.
const GRID='(min-width:1024px) and (orientation:landscape)';

/** Projects collection stacks like Home on portrait/narrow screens; it re-measures after filtering settles. */
export function useGalleryStack(root:RefObject<HTMLElement|null>,filter:string,locale:string){
 const stack=useRef<ReturnType<typeof createCardStack>|null>(null);
 useLayoutEffect(()=>{
  const grid=root.current?.querySelector<HTMLElement>('.gallery-exhibits');if(!grid)return;
  const motion=matchMedia('(prefers-reduced-motion:reduce)'),wide=matchMedia(GRID);
  const sync=()=>{
   stack.current?.dispose();stack.current=null;delete grid.dataset.stack;
   if(wide.matches)return;
   stack.current=!motion.matches&&allowsMotion()?createCardStack(grid,{id:'gallery',offset:14,mobileOffset:8,depth:.04}):null;
   // Reduced motion keeps the folio layout, without sticky stacking or depth.
   if(!stack.current)grid.dataset.stack='static';
  };
  sync();motion.addEventListener('change',sync);wide.addEventListener('change',sync);
  return()=>{motion.removeEventListener('change',sync);wide.removeEventListener('change',sync);stack.current?.dispose();stack.current=null;delete grid.dataset.stack;};
 },[root,locale]);
 // Filter Flip runs ~0.4s; re-measure once the visible set has settled.
 useLayoutEffect(()=>{const timer=setTimeout(()=>stack.current?.refresh(),450);return()=>clearTimeout(timer);},[filter]);
}
