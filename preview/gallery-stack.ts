import {useLayoutEffect,useRef,type RefObject} from 'react';
import {createCardStack} from './card-stack';
import {allowsMotion} from './route-motion';

/** Projects collection uses the same stacking deck as Home; it re-measures after filtering settles. */
export function useGalleryStack(root:RefObject<HTMLElement|null>,filter:string,locale:string){
 const stack=useRef<ReturnType<typeof createCardStack>|null>(null);
 useLayoutEffect(()=>{
  const grid=root.current?.querySelector<HTMLElement>('.gallery-exhibits');if(!grid)return;
  const motion=matchMedia('(prefers-reduced-motion:reduce)');
  const sync=()=>{stack.current?.dispose();stack.current=!motion.matches&&allowsMotion()?createCardStack(grid,{id:'gallery',offset:14,mobileOffset:8,depth:.04}):null;
  // Reduced motion keeps the folio layout, without sticky stacking or depth.
  if(!stack.current)grid.dataset.stack='static';};
  sync();motion.addEventListener('change',sync);
  return()=>{motion.removeEventListener('change',sync);stack.current?.dispose();stack.current=null;};
 },[root,locale]);
 // Filter Flip runs ~0.4s; re-measure once the visible set has settled.
 useLayoutEffect(()=>{const timer=setTimeout(()=>stack.current?.refresh(),450);return()=>clearTimeout(timer);},[filter]);
}
