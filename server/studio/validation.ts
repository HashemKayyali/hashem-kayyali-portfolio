import {projectAssets} from '../../data/projectAssets.ts';
import {visibleCaseMedia} from '../../preview/case-presentation.ts';
import {bad} from './errors.ts';
import type {StudioResource} from '../../studio/contracts.ts';
export const projectIds=new Set(projectAssets.map(asset=>asset.id as string));
export const uuid=(value:unknown)=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
export function record(value:unknown):Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value))bad('A JSON object is required.');return value as Record<string,unknown>;}
export function text(value:unknown,max:number,name:string,required=false){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))bad('Invalid '+name+'.');return value as string;}
export function resource(value:string|null):StudioResource{if(!['media','posts','gallery'].includes(value??''))bad('Unknown studio resource.');return value as StudioResource;}
export function projectId(value:unknown){if(typeof value!=='string'||!projectIds.has(value))bad('Choose an existing coded project.');return value as string;}
export const fields={
 media:['alt'],
 posts:['media_id','caption','authored_at','source_url','published','sort_order'],
 gallery:['media_id','title','caption','alt','project_id','authored_at','published','sort_order'],
} as const;
export function allowedFields(kind:StudioResource,input:Record<string,unknown>){if(Object.keys(input).some(key=>!(fields[kind] as readonly string[]).includes(key)))bad('This field cannot be edited here.');}
export function validateItem(kind:StudioResource,input:Record<string,unknown>){
 allowedFields(kind,input);
 if(kind==='media')return {alt:text(input.alt,2000,'alternative text')};
 if(!uuid(input.media_id))bad('Choose valid uploaded media.');
 const authored=text(input.authored_at,80,'date',true),date=new Date(authored);if(!Number.isFinite(date.valueOf()))bad('Invalid publication date.');
 if(typeof input.published!=='boolean')bad('Choose draft or published.');
 if(!Number.isInteger(input.sort_order)||Number(input.sort_order)<0||Number(input.sort_order)>1_000_000)bad('Invalid display order.');
 const result:Record<string,unknown>={media_id:input.media_id,caption:text(input.caption,10_000,'caption',kind==='posts'),authored_at:date.toISOString(),published:input.published,sort_order:input.sort_order};
 if(kind==='posts'){
  let source=null;
  if(input.source_url!==null&&input.source_url!==undefined&&input.source_url!==''){
   const raw=text(input.source_url,2048,'original post URL',true);let url:URL;try{url=new URL(raw);}catch{bad('Use a valid LinkedIn or Instagram URL.');}
   const hostname=url!.hostname.toLowerCase();if(url!.protocol!=='https:'||url!.username||url!.password||!['linkedin.com','instagram.com'].some(host=>hostname===host||hostname.endsWith('.'+host)))bad('Use an HTTPS LinkedIn or Instagram URL.');
   source=url!.href;
  }
  result.source_url=source;
 }else{
  result.title=text(input.title??'',300,'title');result.alt=text(input.alt??'',2000,'alternative text');
  result.project_id=input.project_id===null||input.project_id===undefined||input.project_id===''?null:projectId(input.project_id);
 }
 return result;
}
/** The project's bundled case media an admin may order, hide or choose as cover (never withheld originals). */
export function canonicalProjectMedia(project:string){const asset=projectAssets.find(item=>item.id===project);return asset?visibleCaseMedia(asset):[];}
/** The full ordered gallery: every bundled original exactly once, uploads at most once, one visible cover. */
export function validateLayout(project:string,input:unknown){
 const body=record(input);if(Object.keys(body).some(key=>key!=='items')||!Array.isArray(body.items)||!body.items.length||body.items.length>100)bad('Invalid project media settings.');
 const canonical=new Set(canonicalProjectMedia(project)),seen=new Set<string>();let covers=0,visible=0;
 const items=(body.items as unknown[]).map(raw=>{
  const item=record(raw),original=item.source!==undefined;
  if(Object.keys(item).some(key=>!['source','media_id','caption','alt','is_cover','hidden'].includes(key))||original===(item.media_id!==undefined)||typeof item.is_cover!=='boolean'||typeof item.hidden!=='boolean')bad('Invalid project image.');
  if(original&&(typeof item.source!=='string'||!canonical.has(item.source)))bad('This original image does not belong to the project.');
  if(!original&&!uuid(item.media_id))bad('Choose valid uploaded media.');
  const key=original?'b:'+item.source:'m:'+String(item.media_id).toLowerCase();if(seen.has(key))bad('Each image can appear once.');seen.add(key);
  if(item.is_cover&&item.hidden)bad('A hidden image cannot be the cover.');if(item.is_cover)covers++;if(!item.hidden)visible++;
  return {...(original?{source:item.source as string}:{media_id:item.media_id as string}),caption:text(item.caption??'',2000,'caption'),alt:text(item.alt??'',2000,'alternative text'),is_cover:item.is_cover as boolean,hidden:item.hidden as boolean};
 });
 if(covers>1)bad('Choose one project cover.');if(!visible)bad('Keep at least one visible image.');
 if([...canonical].some(source=>!seen.has('b:'+source)))bad('The project originals changed. Reload before saving.');
 return items;
}
