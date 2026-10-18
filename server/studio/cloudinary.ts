import {createHash,randomUUID,timingSafeEqual} from 'node:crypto';
import type {StudioEnv} from './config.ts';
import {requireConfig} from './config.ts';
import {seal,unseal} from './auth.ts';
import {bad,StudioError} from './errors.ts';
import {record,text} from './validation.ts';
import type {ProviderFetch} from './database.ts';
import type {StudioKind,StudioUploadIntent} from '../../studio/contracts.ts';
const limits={image:20*1024*1024,video:200*1024*1024};
const formats={image:['jpg','jpeg','png','webp'],video:['mp4','webm']};
const signature=(parameters:Record<string,string>,secret:string)=>createHash('sha1').update(Object.keys(parameters).sort().map(key=>key+'='+parameters[key]).join('&')+secret).digest('hex');
export function createUploadIntent(env:StudioEnv,input:unknown,now:number):StudioUploadIntent {
 requireConfig(env,'media');requireConfig(env,'admin');const body=record(input);
 if(body.kind!=='image'&&body.kind!=='video')bad('Choose an image or video.');const kind=body.kind as StudioKind;
 if(!Number.isInteger(body.size)||Number(body.size)<=0||Number(body.size)>limits[kind])bad('The selected file exceeds the upload size limit.');
 const cloud=env.CLOUDINARY_CLOUD_NAME!;if(!/^[a-zA-Z0-9_-]{1,80}$/.test(cloud))throw new StudioError(503,'SETUP_REQUIRED','The Cloudinary cloud name is invalid.');
 const params={allowed_formats:formats[kind].join(','),overwrite:'false',public_id:'portfolio/studio/'+randomUUID(),timestamp:String(Math.floor(now/1000))};
 return {url:'https://api.cloudinary.com/v1_1/'+cloud+'/'+kind+'/upload',fields:{...params,api_key:env.CLOUDINARY_API_KEY!,signature:signature(params,env.CLOUDINARY_API_SECRET!)},receiptToken:seal({purpose:'upload',publicId:params.public_id,kind,expires:now+30*60*1000},env.ADMIN_SESSION_SECRET!),kind,maxBytes:limits[kind]};
}
export async function verifyCloudinaryUpload(env:StudioEnv,input:unknown,now:number,fetcher:ProviderFetch=fetch){
 requireConfig(env,'media');requireConfig(env,'admin');const body=record(input),upload=record(body.upload);
 const token=text(body.receiptToken,8192,'upload receipt',true),intent=unseal(token,env.ADMIN_SESSION_SECRET!);
 if(!intent||intent.purpose!=='upload'||typeof intent.expires!=='number'||intent.expires<now||intent.expires>now+30*60*1000+60_000||intent.publicId!==upload.public_id||intent.kind!==upload.resource_type)bad('The upload receipt is invalid or expired.');
 const publicId=text(upload.public_id,200,'media identifier',true),kind=intent.kind as StudioKind;
 if(!/^portfolio\/studio\/[a-f0-9-]{36}$/.test(publicId)||!Number.isSafeInteger(upload.version)||Number(upload.version)<1)bad('The upload response is invalid.');
 const expected=signature({public_id:publicId,version:String(upload.version)},env.CLOUDINARY_API_SECRET!),actual=String(upload.signature??'');
 if(actual.length!==expected.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))bad('The upload response signature is invalid.');
 const encoded=publicId.split('/').map(encodeURIComponent).join('/');
 let response:Response;
 try{response=await fetcher('https://api.cloudinary.com/v1_1/'+env.CLOUDINARY_CLOUD_NAME+'/resources/'+kind+'/upload/'+encoded,{headers:{Authorization:'Basic '+Buffer.from(env.CLOUDINARY_API_KEY+':'+env.CLOUDINARY_API_SECRET).toString('base64')},signal:AbortSignal.timeout(12_000)});}
 catch{throw new StudioError(502,'MEDIA_UNAVAILABLE','Cloudinary could not verify the uploaded file. Please retry.');}
 if(!response.ok)throw new StudioError(502,'MEDIA_UNAVAILABLE','Cloudinary could not verify the uploaded file. Please retry.');
 const info=await response.json().catch(()=>null);
 if(!info||typeof info!=='object')throw new StudioError(502,'MEDIA_UNAVAILABLE','Cloudinary returned an unreadable response. Please retry.');
 // The signature proved this upload is ours; if it breaks the limits (Cloudinary cannot enforce a byte limit
 // on signed uploads), delete it so a rejected file never stays publicly reachable.
 const reject=async(message:string):Promise<never>=>{await destroyCloudinaryAsset(env,publicId,kind,now,fetcher).catch(()=>{});bad(message);throw new Error('unreachable');};
 if(info.public_id!==publicId||info.resource_type!==kind||info.type!=='upload'||info.version!==upload.version)bad('Cloudinary media does not match the permitted upload.');
 if(!formats[kind].includes(info.format)||!Number.isInteger(info.bytes)||info.bytes<=0||info.bytes>limits[kind])await reject('The uploaded file type or size is not permitted.');
 if(!Number.isInteger(info.width)||!Number.isInteger(info.height)||info.width<1||info.height<1||info.width>32768||info.height>32768)await reject('Invalid image or video dimensions.');
 const delivery='https://res.cloudinary.com/'+env.CLOUDINARY_CLOUD_NAME;
 return {public_id:publicId,kind,url:delivery+'/'+kind+'/upload/v'+info.version+'/'+encoded+'.'+info.format,poster_url:kind==='video'?delivery+'/video/upload/so_0,w_1000/v'+info.version+'/'+encoded+'.jpg':null,width:info.width,height:info.height,bytes:info.bytes,format:info.format,alt:text(body.alt??'',2000,'alternative text')};
}

/** Signed Upload API destroy (with CDN invalidation). Used only for uploads this server signed and then rejected. */
export async function destroyCloudinaryAsset(env:StudioEnv,publicId:string,kind:StudioKind,now:number,fetcher:ProviderFetch=fetch){
 if(!/^portfolio\/studio\/[a-f0-9-]{36}$/.test(publicId))throw new StudioError(400,'INVALID_INPUT','Invalid media identifier.');
 const params={invalidate:'true',public_id:publicId,timestamp:String(Math.floor(now/1000))};
 const body=new URLSearchParams({...params,api_key:env.CLOUDINARY_API_KEY!,signature:signature(params,env.CLOUDINARY_API_SECRET!)});
 const response=await fetcher('https://api.cloudinary.com/v1_1/'+env.CLOUDINARY_CLOUD_NAME+'/'+kind+'/destroy',{method:'POST',body,signal:AbortSignal.timeout(12_000)});
 if(!response.ok)throw new StudioError(502,'MEDIA_UNAVAILABLE','Cloudinary could not remove the rejected file.');
}
