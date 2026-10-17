import {projectAssets,filterOrder} from '../data/projectAssets.ts';
import type {FilterKey,Locale,ProjectId} from '../content/types';
export type GalleryView={filter:FilterKey;origin?:ProjectId;scroll?:[number,number];focus?:'index'};
export function createGalleryMemory(){
 const views=new Map<Locale,GalleryView>();
 const read=(locale:Locale):GalleryView=>({...views.get(locale)??{filter:'all'}});
 const validFilter=(value:unknown):value is FilterKey=>filterOrder.includes(value as FilterKey);
 return {read,
  setFilter(locale:Locale,filter:unknown){if(validFilter(filter))views.set(locale,{...read(locale),filter,scroll:undefined});},
  leave(locale:Locale,origin:ProjectId,scroll:[number,number],focus?:'index'){const {focus:previousFocus,...view}=read(locale);views.set(locale,{...view,origin,scroll,...(focus?{focus}:{})});},
  restore(locale:Locale,value:unknown){
   if(!value||typeof value!=='object')return;const candidate=value as GalleryView;
   if(!validFilter(candidate.filter)||candidate.origin&&!projectAssets.some(a=>a.id===candidate.origin)||candidate.focus&&candidate.focus!=='index'||candidate.scroll&&(!Array.isArray(candidate.scroll)||candidate.scroll.length!==2||candidate.scroll.some(n=>!Number.isFinite(n)||n<0)))return;
   views.set(locale,{filter:candidate.filter,origin:candidate.origin,scroll:candidate.scroll,...(candidate.focus?{focus:candidate.focus}:{})});
  }
 };
}
export const galleryMemory=createGalleryMemory();
