import type {StudioEnv} from './config.ts';
import {requireConfig,studioStatus} from './config.ts';
import {requireAdmin,requireSameOrigin,validSession,passwordMatches,sessionCookie} from './auth.ts';
import {StudioError,bad} from './errors.ts';
import {createStudioDatabase,type ProviderFetch} from './database.ts';
import {createUploadIntent,verifyCloudinaryUpload} from './cloudinary.ts';
import {record,resource,uuid,allowedFields,fields,validateItem,projectId,validateProject} from './validation.ts';

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
 // Basic local-process retry protection. It is deliberately not advertised as a distributed rate limiter.
 const attempts=new Map<string,{count:number;until:number}>();
 return async(request:Request):Promise<Response>=>{
  try{
   const url=new URL(request.url),action=url.searchParams.get('action')??'public',method=request.method;
   if(!['GET','POST','PATCH','PUT','DELETE'].includes(method))throw new StudioError(405,'METHOD_NOT_ALLOWED','This method is not supported.');
   if(method!=='GET')requireSameOrigin(request);
   if(action==='status'&&method==='GET')return json(studioStatus(env));
   if(action==='session'){
    if(method==='GET')return json({authenticated:validSession(request,env,now()),configured:studioStatus(env).admin});
    if(method==='DELETE')return json({authenticated:false},200,{'Set-Cookie':sessionCookie(request,env,now(),true)});
    if(method!=='POST')throw new StudioError(405,'METHOD_NOT_ALLOWED','This method is not supported.');
    const body=await readBody(request);requireConfig(env,'admin');
    const client=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'local';
    const previous=attempts.get(client);if(previous&&previous.until>now()&&previous.count>=8)throw new StudioError(429,'TRY_LATER','Too many sign-in attempts. Try again in a minute.');
    if(!passwordMatches(body.password,env)){const current=previous&&previous.until>now()?previous:{count:0,until:now()+60_000};current.count++;attempts.set(client,current);if(attempts.size>1000)for(const [key,value]of attempts)if(value.until<now())attempts.delete(key);throw new StudioError(401,'INVALID_PASSWORD','The password is incorrect.');}
    attempts.delete(client);return json({authenticated:true},200,{'Set-Cookie':sessionCookie(request,env,now())});
   }
   if(action==='public'&&method==='GET')return json(studioStatus(env).database?await db.publicContent():{configured:false,posts:[],gallery:[],projectMedia:[]});
   requireAdmin(request,env,now());
   if(action==='upload-sign'&&method==='POST')return json(createUploadIntent(env,await readBody(request),now()));
   if(action==='upload-register'&&method==='POST'){
    requireConfig(env,'database');const media=await verifyCloudinaryUpload(env,await readBody(request),now(),fetcher);return json({item:await db.registerMedia(media)},201);
   }
   if(action==='project-media'){
    const project=projectId(url.searchParams.get('project_id'));
    if(method==='GET')return json({override:await db.project(project)});
    if(method==='PUT')return json({override:await db.saveProject(project,validateProject(await readBody(request)))});
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
   if(error instanceof StudioError)return json({error:{code:error.code,message:error.message}},error.status);
   return json({error:{code:'STUDIO_UNAVAILABLE',message:'The studio could not complete this request. Please retry.'}},500);
  }
 };
}
