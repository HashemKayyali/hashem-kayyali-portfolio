import type {StudioEnv} from './config.ts';
import {requireConfig,studioStatus} from './config.ts';
import {requireSameOrigin,sessionCookie,readSessionClaim,credentialTag,parsePasswordHash,verifyPassword,totpKey,verifyTotp,clientKey,SESSION_MS,type SessionClaim} from './auth.ts';
import {StudioError,bad} from './errors.ts';
import {createStudioDatabase,type ProviderFetch} from './database.ts';
import {createUploadIntent,verifyCloudinaryUpload} from './cloudinary.ts';
import {record,resource,uuid,allowedFields,fields,validateItem,projectId,validateLayout} from './validation.ts';

const json=(body:unknown,status=200,headers:Record<string,string>={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function readBody(request:Request){
 const max=64*1024;if(Number(request.headers.get('content-length')??0)>max)throw new StudioError(413,'BODY_TOO_LARGE','This endpoint accepts metadata only. Upload files directly to Cloudinary.');
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new StudioError(415,'JSON_REQUIRED','Send a JSON metadata object.');
 const reader=request.body?.getReader();let size=0;const chunks:Uint8Array[]=[];
 if(reader)while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>max){await reader.cancel();throw new StudioError(413,'BODY_TOO_LARGE','The metadata request is too large.');}chunks.push(part.value);}
 try{return record(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch(error){if(error instanceof StudioError)throw error;bad('Invalid JSON request.');}
}
export function createStudioHandler(options:{env?:StudioEnv;fetcher?:ProviderFetch;now?:()=>number}={}){
 const env=options.env??process.env,fetcher=options.fetcher??fetch,now=options.now??Date.now;
 const db=createStudioDatabase(env,fetcher);
 const iso=()=>new Date(now()).toISOString();
 const tag=()=>credentialTag(env.ADMIN_PASSWORD_HASH!,env.ADMIN_SESSION_SECRET!);
 /** A valid sealed cookie whose server-side session row is still active (not revoked, not expired). */
 async function activeSession(request:Request):Promise<SessionClaim|null>{
  if(!studioStatus(env).admin)return null;
  const claim=readSessionClaim(request,env.ADMIN_SESSION_SECRET!,tag(),now());
  return claim&&await db.sessionActive(claim.sid,iso())?claim:null;
 }
 async function requireAdmin(request:Request){const claim=await activeSession(request);if(!claim)throw new StudioError(401,'UNAUTHORIZED','Sign in to manage the studio.');return claim;}
 const clear=(request:Request)=>sessionCookie(request,env.ADMIN_SESSION_SECRET??'',null,now());
 return async(request:Request):Promise<Response>=>{
  try{
   const url=new URL(request.url),action=url.searchParams.get('action')??'public',method=request.method;
   if(!['GET','POST','PATCH','PUT','DELETE'].includes(method))throw new StudioError(405,'METHOD_NOT_ALLOWED','This method is not supported.');
   if(method!=='GET')requireSameOrigin(request);
   if(action==='status'&&method==='GET')return json(studioStatus(env));
   if(action==='session'){
    if(method==='GET'){const configured=studioStatus(env).admin;return json({authenticated:configured&&!!await activeSession(request),configured});}
    if(method==='DELETE'){
     // Logout revokes the server-side session; scope=all signs out every device (requires a valid session).
     if(!studioStatus(env).admin)return json({authenticated:false},200,{'Set-Cookie':clear(request)});
     const claim=await activeSession(request);
     if(url.searchParams.get('scope')==='all'){if(!claim)throw new StudioError(401,'UNAUTHORIZED','Sign in to manage the studio.');await db.revokeAllSessions(iso());}
     else if(claim)await db.revokeSession(claim.sid,iso());
     return json({authenticated:false},200,{'Set-Cookie':clear(request)});
    }
    if(method!=='POST')throw new StudioError(405,'METHOD_NOT_ALLOWED','This method is not supported.');
    const body=await readBody(request);requireConfig(env,'admin');
    // Distributed throttle (database): per hashed client IP and a global ceiling against IP rotation.
    const client=clientKey(request,env.ADMIN_SESSION_SECRET!),keys=[client,'global'];
    const wait=await db.authGate(keys);
    if(wait>0)throw new StudioError(429,'TRY_LATER',`Too many sign-in attempts. Try again in ${Math.ceil(wait/60)} minute(s).`,{'Retry-After':String(wait)});
    const passwordOk=verifyPassword(body.password,parsePasswordHash(env.ADMIN_PASSWORD_HASH)!);
    const key=totpKey(env.ADMIN_TOTP_SECRET),step=key?verifyTotp(body.code,key,now()):null;
    // The replay store is consulted only when both factors are already correct, so timing reveals nothing extra.
    const ok=passwordOk&&(!key||step!==null)&&(!key||await db.consumeTotpStep(step!));
    if(!ok){
     const locked=await db.authFailure(keys);
     if(locked>0)throw new StudioError(429,'TRY_LATER',`Too many sign-in attempts. Try again in ${Math.ceil(locked/60)} minute(s).`,{'Retry-After':String(locked)});
     throw new StudioError(401,'INVALID_CREDENTIALS',key?'The password or authentication code is incorrect.':'The password is incorrect.');
    }
    await db.authReset(client);
    const issued=now(),expires=issued+SESSION_MS,sid=await db.createSession(new Date(expires).toISOString());
    void db.pruneAuth().catch(()=>{});
    return json({authenticated:true,configured:true},200,{'Set-Cookie':sessionCookie(request,env.ADMIN_SESSION_SECRET!,{sid,expires,tag:tag()},issued)});
   }
   if(action==='public'&&method==='GET'){
    if(!studioStatus(env).database)return json({configured:false,posts:[],gallery:[],projectMedia:[]});
    // Published content is cached at the edge for a minute so page views do not each query the database.
    // A signed-in admin can ask for a fresh copy right after saving.
    const fresh=url.searchParams.has('fresh')&&!!await activeSession(request);
    return json(await db.publicContent(),200,fresh?{}:{'Cache-Control':'public, max-age=0, s-maxage=60, stale-while-revalidate=300'});
   }
   await requireAdmin(request);
   if(action==='upload-sign'&&method==='POST')return json(createUploadIntent(env,await readBody(request),now()));
   if(action==='upload-register'&&method==='POST'){
    requireConfig(env,'database');const media=await verifyCloudinaryUpload(env,await readBody(request),now(),fetcher);return json({item:await db.registerMedia(media)},201);
   }
   if(action==='project-media'){
    const project=projectId(url.searchParams.get('project_id'));
    if(method==='GET')return json({override:await db.project(project)});
    if(method==='PUT')return json({override:await db.saveLayout(project,validateLayout(project,await readBody(request)))});
   }
   if(action==='reorder'&&method==='POST'){
    const body=await readBody(request);
    if(body.id!==undefined){if(!['posts','gallery'].includes(String(body.resource))||!uuid(body.id)||!['up','down'].includes(String(body.direction)))bad('Choose a valid display move.');await db.move(body.resource as 'posts'|'gallery',String(body.id),body.direction as 'up'|'down');return json({saved:true});}
    if(!['posts','gallery'].includes(String(body.resource))||!Array.isArray(body.ids)||!body.ids.length||body.ids.length>200||body.ids.some(id=>!uuid(id))||new Set(body.ids).size!==body.ids.length)bad('Choose a valid display order.');
    await db.reorder(body.resource as 'posts'|'gallery',body.ids as string[]);return json({saved:true});
   }
   if(action==='items'){
    const kind=resource(url.searchParams.get('resource')),id=url.searchParams.get('id');
    if(id&&!uuid(id))bad('Invalid record identifier.');
    if(method==='GET'){const offset=Number(url.searchParams.get('offset')??0);if(!Number.isSafeInteger(offset)||offset<0)bad('Invalid page.');return id?json({item:await db.find(kind,id)}):json({items:await db.list(kind,offset)});}
    if(method==='DELETE'){if(!id)bad('Choose a record to delete.');if(!await db.remove(kind,id!))throw new StudioError(404,'NOT_FOUND','The record no longer exists.');return json({deleted:true});}
    if(method==='POST'||method==='PATCH'){
     if(kind==='media'&&method==='POST')bad('Upload and verify media before adding it to the library.');
     if(method==='PATCH'&&!id)bad('Choose a record to edit.');const body=await readBody(request);allowedFields(kind,body);
     let input=body;if(method==='PATCH'){const previous=await db.find(kind,id!);if(!previous)throw new StudioError(404,'NOT_FOUND','The record no longer exists.');if(kind==='media'&&previous.kind==='image'&&(typeof body.alt!=='string'||!body.alt.trim()))bad('Keep descriptive alternative text for this image.');input={...Object.fromEntries(fields[kind].map(key=>[key,previous[key]])),...body};}
     const item=validateItem(kind,input);
     if(kind!=='media'&&item.published){const media=await db.find('media',String(item.media_id));if(!media)bad('Choose existing uploaded media.');const alt=kind==='gallery'?String(item.alt||media.alt||''):String(media.alt||'');if(media.kind==='image'&&!alt.trim())bad('Add alternative text before publishing the image.');}
     const saved=await db.save(kind,item,method==='PATCH'?id!:undefined);if(!saved)throw new StudioError(409,'CONFLICT','The record changed. Reload before saving.');return json({item:saved},method==='POST'?201:200);
    }
   }
   throw new StudioError(404,'NOT_FOUND','This Studio action was not found.');
  }catch(error){
   if(error instanceof StudioError)return json({error:{code:error.code,message:error.message}},error.status,error.headers);
   // Unexpected failures are logged server-side without request bodies or secrets.
   console.error('[studio] unexpected failure',error instanceof Error?error.name+': '+error.message.slice(0,200):'unknown');
   return json({error:{code:'STUDIO_UNAVAILABLE',message:'The studio could not complete this request. Please retry.'}},500);
  }
 };
}
