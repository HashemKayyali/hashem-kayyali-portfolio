import type {PublicStudio,StudioMedia} from '../studio/contracts';
import {projectLayout,publishedLayout,entrySource,type LayoutEntry} from '../studio/project-layout.ts';
import {projectAssets} from '../data/projectAssets.ts';
import {visibleCaseMedia} from './case-presentation.ts';
const published=new Map<string,LayoutEntry[]>(),sizes=new Map<string,{width:number;height:number}>();
const safeImage=(media:StudioMedia|undefined)=>media?.kind==='image'&&/^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\//.test(media.url);
const canonicalOf=(id:string)=>{const asset=projectAssets.find(item=>item.id===id);return asset?visibleCaseMedia(asset):undefined;};
/** Replaced only when a new public cloud snapshot commits; no local persistence. */
export function setStudioMediaSnapshot(snapshot:PublicStudio){
 published.clear();sizes.clear();
 for(const entry of snapshot.projectMedia??[]){
  const canonical=canonicalOf(entry.project_id);if(!entry.enabled||!canonical)continue;
  const items=entry.items.filter(item=>safeImage(item.media)),layout=publishedLayout(projectLayout({...entry,items},canonical),canonical);
  // An override whose every image was dropped falls back to the approved originals.
  if(!layout.length)continue;
  published.set(entry.project_id,layout);
  for(const item of items){const media=item.media!;if(media.width>0&&media.height>0)sizes.set(media.url,{width:media.width,height:media.height});}
 }
}
const find=(id:string,source:string)=>published.get(id)?.find(entry=>entrySource(entry)===source);
/** The Studio upload used as cover (cards render it from Cloudinary); undefined for an original cover. */
export const getStudioProjectCover=(id:string)=>published.get(id)?.[0]?.media;
/** The managed cover's source (original path or upload URL), shared by cards, the flight and the case opening. */
export const studioCoverSource=(id:string)=>{const cover=published.get(id)?.[0];return cover?entrySource(cover):undefined;};
export function studioProjectAlt(id:string,source:string,fallback:string){const item=find(id,source);return item?.alt||item?.media?.alt||fallback;}
export const studioProjectCaption=(id:string,source:string)=>find(id,source)?.caption||undefined;
export const dynamicMediaSize=(source:string)=>sizes.get(source);
/** Case gallery order: the cover first, then the saved order. Falls back to the canonical originals. */
export function studioCaseSources(id:string,canonical:string[]){const layout=published.get(id);return layout?layout.map(entry=>entrySource(entry)!):canonical;}
