import type {ProjectMediaOverride,StudioMedia} from './contracts.ts';
/** One image of a project's managed gallery: a bundled original (`source`) or a Studio upload (`media_id`). */
export interface LayoutEntry {source?:string;media_id?:string;caption:string;alt:string;is_cover:boolean;hidden:boolean;media?:StudioMedia}
export const entryKey=(entry:LayoutEntry)=>entry.source?'b:'+entry.source:'m:'+entry.media_id;
const original=(source:string,hidden=false):LayoutEntry=>({source,caption:'',alt:'',is_cover:false,hidden});

/**
 * Saved rows → the complete ordered layout, hidden entries included. `canonical` is the project's
 * bundled case media (cover first). A row without `builtins` is a legacy override that replaced the
 * originals when enabled; it is read so it looks exactly as it was published.
 */
export function projectLayout(override:ProjectMediaOverride|null|undefined,canonical:string[]):LayoutEntry[]{
 if(!override)return canonical.map(source=>original(source));
 const uploads=[...override.items].sort((a,b)=>a.sort_order-b.sort_order).map(item=>({rank:item.sort_order,entry:{media_id:item.media_id,caption:item.caption??'',alt:item.alt??'',is_cover:item.is_cover,hidden:!!item.hidden,media:item.media} as LayoutEntry}));
 if(!override.builtins?.length){
  if(override.enabled)return [...uploads.map(value=>value.entry),...canonical.map(source=>original(source,true))];
  return [...canonical.map(source=>original(source)),...uploads.map(value=>({...value.entry,is_cover:false,hidden:true}))];
 }
 const known=new Set(canonical),saved=override.builtins.filter(item=>known.has(item.source));
 const rows=[...saved.map(item=>({rank:item.sort_order,entry:{source:item.source,caption:item.caption??'',alt:item.alt??'',is_cover:item.is_cover,hidden:item.hidden} as LayoutEntry})),...uploads].sort((a,b)=>a.rank-b.rank).map(value=>value.entry);
 // Originals added to the code after the last save appear at the end, visible.
 return [...rows,...canonical.filter(source=>!saved.some(item=>item.source===source)).map(source=>original(source))];
}

/** The selected cover, else the original cover, else the first visible image. */
export function effectiveCover(entries:LayoutEntry[],canonical:string[]){const visible=entries.filter(entry=>!entry.hidden);return visible.find(entry=>entry.is_cover)??visible.find(entry=>entry.source===canonical[0])??visible[0];}

/** Normal form: one cover (never hidden) first, then visible images in their order, then hidden ones. */
export function arrangeLayout(entries:LayoutEntry[],canonical:string[]):LayoutEntry[]{
 let chosen=false;
 const clean=entries.map(entry=>{const cover=entry.is_cover&&!entry.hidden&&!chosen;if(cover)chosen=true;return entry.is_cover===cover?entry:{...entry,is_cover:cover};});
 const cover=effectiveCover(clean,canonical);
 return [...(cover?[cover]:[]),...clean.filter(entry=>entry!==cover&&!entry.hidden),...clean.filter(entry=>entry.hidden)];
}
/** What the public case gallery shows, in order; the first entry is the cover everywhere. */
export const publishedLayout=(entries:LayoutEntry[],canonical:string[])=>arrangeLayout(entries,canonical).filter(entry=>!entry.hidden);
export const entrySource=(entry:LayoutEntry)=>entry.source??entry.media?.url;
