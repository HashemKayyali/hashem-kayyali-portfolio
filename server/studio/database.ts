import type {StudioEnv} from './config.ts';
import {requireConfig} from './config.ts';
import {StudioError} from './errors.ts';
import type {StudioResource} from '../../studio/contracts.ts';
export type ProviderFetch=typeof fetch;
const tables={media:'studio_media',posts:'studio_posts',gallery:'studio_gallery'} as const;
export const mediaSelect='id,public_id,kind,url,poster_url,width,height,bytes,format,alt,created_at';
const joinedMedia='media:studio_media('+mediaSelect+')';
const selects={media:mediaSelect,posts:'id,media_id,caption,authored_at,source_url,published,sort_order,created_at,updated_at,'+joinedMedia,gallery:'id,media_id,title,caption,alt,project_id,authored_at,published,sort_order,created_at,updated_at,'+joinedMedia};
export function createStudioDatabase(env:StudioEnv,fetcher:ProviderFetch=fetch){
 async function call(path:string,method='GET',body?:unknown,query:Record<string,string>={}):Promise<any>{
  requireConfig(env,'database');let base:URL;try{base=new URL(env.SUPABASE_URL!);}catch{throw new StudioError(503,'SETUP_REQUIRED','The database URL is invalid.');}
  if(base.protocol!=='https:'||base.username||base.password)throw new StudioError(503,'SETUP_REQUIRED','Use the HTTPS Supabase project URL.');
  const url=new URL('/rest/v1/'+path,base);for(const [key,value]of Object.entries(query))url.searchParams.set(key,value);
  const key=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY!;
  const headers:Record<string,string>={apikey:key,'content-type':'application/json',Prefer:'return=representation'};
  // New secret keys are API keys, not JWT bearer tokens.
  if(!env.SUPABASE_SECRET_KEY)headers.Authorization='Bearer '+key;
  if(query.on_conflict)headers.Prefer+=',resolution=ignore-duplicates';
  let response:Response;
  try{response=await fetcher(url,{method,headers,signal:AbortSignal.timeout(12_000),...(body!==undefined?{body:JSON.stringify(body)}:{})});}
  catch{throw new StudioError(502,'DATABASE_UNAVAILABLE','The content database is unavailable. Please retry.');}
  if(!response.ok){const diagnostic=await response.json().catch(()=>({}));
   if(diagnostic.code==='23503')throw new StudioError(409,'MEDIA_IN_USE','This media is still used by a project, post or gallery entry.');
   if(diagnostic.code==='23505')throw new StudioError(409,'CONFLICT','This record already exists. Reload the latest content.');
   if(['42P01','42883','PGRST202','PGRST205'].includes(diagnostic.code))throw new StudioError(503,'SCHEMA_REQUIRED','Apply the Studio SQL migration in Supabase first.');
   if(diagnostic.code==='22023')throw new StudioError(400,'INVALID_INPUT','The media selection or order is invalid.');
   throw new StudioError(502,'DATABASE_UNAVAILABLE','The content database could not complete this request.');
  }
  return response.status===204?null:response.json();
 }
 return {
  async publicContent(){
   const [posts,gallery,projectMedia]=await Promise.all([
    call(tables.posts,'GET',undefined,{select:selects.posts,published:'eq.true',order:'sort_order.asc,authored_at.desc,id.asc',limit:'200'}),
    call(tables.gallery,'GET',undefined,{select:selects.gallery,published:'eq.true',order:'sort_order.asc,authored_at.desc,id.asc',limit:'200'}),
    call('studio_project_overrides','GET',undefined,{select:'project_id,enabled,updated_at,items:studio_project_media(media_id,caption,alt,is_cover,sort_order,'+joinedMedia+')',enabled:'eq.true','items.order':'sort_order.asc',limit:'100'}),
   ]);return {configured:true,posts,gallery,projectMedia};
  },
  async list(kind:StudioResource,offset=0){return call(tables[kind],'GET',undefined,{select:selects[kind],order:kind==='media'?'created_at.desc,id.asc':'sort_order.asc,authored_at.desc,id.asc',limit:'100',offset:String(offset)});},
  async find(kind:StudioResource,id:string){const rows=await call(tables[kind],'GET',undefined,{select:selects[kind],id:'eq.'+id,limit:'1'});return rows[0]??null;},
  async save(kind:StudioResource,body:unknown,id?:string){const rows=await call(tables[kind],id?'PATCH':'POST',body,id?{id:'eq.'+id}:{});return rows[0]??null;},
  async registerMedia(body:any){const rows=await call(tables.media,'POST',body,{on_conflict:'public_id'});if(rows[0])return rows[0];const existing=await call(tables.media,'GET',undefined,{select:mediaSelect,public_id:'eq.'+body.public_id,limit:'1'});if(!existing[0])throw new StudioError(409,'CONFLICT','Reload the media library before retrying.');return existing[0];},
  async remove(kind:StudioResource,id:string){const rows=await call(tables[kind],'DELETE',undefined,{id:'eq.'+id});return rows?.[0]??null;},
  async reorder(kind:'posts'|'gallery',ids:string[]){await call('rpc/studio_reorder_items','POST',{p_resource:kind,p_ids:ids});},
  async move(kind:'posts'|'gallery',id:string,direction:'up'|'down'){await call('rpc/studio_move_item','POST',{p_resource:kind,p_id:id,p_direction:direction});},
  async project(project_id:string){const rows=await call('studio_project_overrides','GET',undefined,{select:'project_id,enabled,updated_at,items:studio_project_media(media_id,caption,alt,is_cover,sort_order,'+joinedMedia+')',project_id:'eq.'+project_id,'items.order':'sort_order.asc',limit:'1'});return rows[0]??{project_id,enabled:false,items:[]};},
  async saveProject(project_id:string,body:{enabled:boolean;items:unknown[]}){await call('rpc/studio_replace_project_media','POST',{p_project_id:project_id,p_enabled:body.enabled,p_items:body.items});return {project_id,...body};},
  // ── Admin security state (migration 202610180001). Shared by every serverless instance. ──
  /** Seconds until any of these throttle keys unlocks (0 = allowed). */
  async authGate(keys:string[]){return Number(await call('rpc/studio_auth_gate','POST',{p_keys:keys}))||0;},
  /** Records one failed sign-in for each key; returns the lock length in seconds (0 = not locked). */
  async authFailure(keys:string[]){return Number(await call('rpc/studio_auth_record_failure','POST',{p_keys:keys}))||0;},
  async authReset(key:string){await call('rpc/studio_auth_reset','POST',{p_key:key});},
  /** True once per TOTP time step: a second use of the same code is refused. */
  async consumeTotpStep(step:number){return (await call('rpc/studio_auth_consume_totp','POST',{p_step:step}))===true;},
  async createSession(expiresAt:string){const rows=await call('studio_admin_sessions','POST',{expires_at:expiresAt});const id=rows?.[0]?.id;if(typeof id!=='string')throw new StudioError(502,'DATABASE_UNAVAILABLE','The session could not be created.');return id;},
  async sessionActive(id:string,nowIso:string){const rows=await call('studio_admin_sessions','GET',undefined,{select:'id',id:'eq.'+id,revoked_at:'is.null',expires_at:'gt.'+nowIso,limit:'1'});return Array.isArray(rows)&&rows.length===1;},
  async revokeSession(id:string,nowIso:string){await call('studio_admin_sessions','PATCH',{revoked_at:nowIso},{id:'eq.'+id,revoked_at:'is.null'});},
  async revokeAllSessions(nowIso:string){await call('studio_admin_sessions','PATCH',{revoked_at:nowIso},{revoked_at:'is.null'});},
  async pruneAuth(){await call('rpc/studio_auth_prune','POST',{});},
 };
}
