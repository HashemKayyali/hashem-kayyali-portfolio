import type {PublicStudio,ProjectMediaOverride,StudioMedia} from '../studio/contracts';
const overrides=new Map<string,ProjectMediaOverride>(),sizes=new Map<string,{width:number;height:number}>();
const safeImage=(media:StudioMedia|undefined)=>media?.kind==='image'&&/^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_-]+\/image\/upload\//.test(media.url);
/** Replaced only when a new public cloud snapshot commits; no local persistence. */
export function setStudioMediaSnapshot(snapshot:PublicStudio){
 overrides.clear();sizes.clear();
 for(const entry of snapshot.projectMedia??[]){if(!entry.enabled)continue;const items=[...entry.items].filter(item=>safeImage(item.media)).sort((a,b)=>a.sort_order-b.sort_order);overrides.set(entry.project_id,{...entry,items});for(const item of items){const media=item.media!;if(media.width>0&&media.height>0)sizes.set(media.url,{width:media.width,height:media.height});}}
}
export const getStudioProjectMedia=(id:string)=>overrides.get(id);
export const getStudioProjectCover=(id:string)=>{const value=overrides.get(id);return value?(value.items.find(item=>item.is_cover)??value.items[0])?.media:undefined;};
export function studioProjectAlt(id:string,source:string,fallback:string){const item=overrides.get(id)?.items.find(item=>item.media?.url===source);return item?.alt||item?.media?.alt||fallback;}
export const dynamicMediaSize=(source:string)=>sizes.get(source);
export function studioCaseSources(id:string,canonical:string[]){const value=overrides.get(id);if(!value)return canonical;const cover=value.items.find(item=>item.is_cover);return [...(cover?[cover]:[]),...value.items.filter(item=>item!==cover)].map(item=>item.media!.url);}
