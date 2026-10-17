import {projectAssets} from '../../data/projectAssets.ts';
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
export function validateProject(input:unknown){
 const body=record(input);if(Object.keys(body).some(key=>!['enabled','items'].includes(key))||typeof body.enabled!=='boolean'||!Array.isArray(body.items)||body.items.length>100)bad('Invalid project media settings.');
 const seen=new Set<string>();let covers=0;
 const items=(body.items as unknown[]).map((raw,index)=>{const item=record(raw);if(Object.keys(item).some(key=>!['media_id','caption','alt','is_cover','sort_order'].includes(key))||!uuid(item.media_id)||seen.has(String(item.media_id))||typeof item.is_cover!=='boolean')bad('Invalid or duplicate project image.');seen.add(String(item.media_id));if(item.is_cover)covers++;return {media_id:item.media_id,caption:text(item.caption??'',2000,'caption'),alt:text(item.alt??'',2000,'alternative text'),is_cover:item.is_cover,sort_order:index};});
 if(covers>1)bad('Choose one project cover.');return {enabled:body.enabled as boolean,items};
}
