import type {StudioItems,StudioMedia,StudioResource,StudioUploadIntent,StudioUploadReceipt} from '../studio/contracts';

export class StudioRequestError extends Error {
 constructor(message:string,public code:string,public status:number){super(message);this.name='StudioRequestError';}
}
type RequestOptions={method?:'GET'|'POST'|'PATCH'|'PUT'|'DELETE';query?:Record<string,string>;body?:unknown;signal?:AbortSignal};
export function studioSourceUrl(value:string){
 if(!value)return true;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&['linkedin.com','instagram.com'].some(host=>url.hostname===host||url.hostname.endsWith(`.${host}`));}catch{return false;}
}
export async function studioRequest<T>(action:string,options:RequestOptions={}):Promise<T>{
 const query=new URLSearchParams({action,...options.query});
 const response=await fetch(`/api/studio?${query}`,{method:options.method??'GET',credentials:'same-origin',headers:options.body===undefined?{Accept:'application/json'}:{Accept:'application/json','Content-Type':'application/json'},body:options.body===undefined?undefined:JSON.stringify(options.body),signal:options.signal,cache:'no-store'});
 const payload=await response.json().catch(()=>null);
 if(!response.ok)throw new StudioRequestError(payload?.error?.message??`Studio request failed (${response.status}).`,payload?.error?.code??'REQUEST_FAILED',response.status);
 if(!payload)throw new StudioRequestError('The Studio returned an unreadable response.','INVALID_RESPONSE',response.status);
 return payload as T;
}

export async function listStudioItems<K extends StudioResource>(resource:K,signal?:AbortSignal):Promise<StudioItems[K][]>{
 const items:StudioItems[K][]=[];
 for(let offset=0;;offset+=100){
  const result=await studioRequest<{items:StudioItems[K][]}>('items',{query:{resource,offset:String(offset)},signal});
  items.push(...result.items);
  if(result.items.length<100)return items;
 }
}

export async function uploadStudioFile(file:File,alt:string,onProgress:(percent:number)=>void,signal?:AbortSignal):Promise<StudioMedia>{
 const kinds:Record<string,'image'|'video'>={'image/jpeg':'image','image/png':'image','image/webp':'image','video/mp4':'video','video/webm':'video'};
 const kind=kinds[file.type];
 if(!kind)throw new Error('Use JPEG, PNG, WebP, MP4 or WebM.');
 if(!file.size)throw new Error('The file is empty.');
 const intent=await studioRequest<StudioUploadIntent>('upload-sign',{method:'POST',body:{kind,size:file.size},signal});
 if(file.size>intent.maxBytes)throw new Error(`File exceeds the ${Math.floor(intent.maxBytes/1024/1024)} MB limit.`);
 const upload=await new Promise<StudioUploadReceipt>((resolve,reject)=>{
  const request=new XMLHttpRequest(),form=new FormData();
  for(const [key,value]of Object.entries(intent.fields))form.append(key,value);
  form.append('file',file);
  const abort=()=>request.abort();signal?.addEventListener('abort',abort,{once:true});
  const cleanup=()=>signal?.removeEventListener('abort',abort);
  request.open('POST',intent.url);
  request.upload.onprogress=event=>{if(event.lengthComputable)onProgress(Math.round(event.loaded/event.total*100));};
  request.onload=()=>{cleanup();try{const result=JSON.parse(request.responseText);if(request.status<200||request.status>=300)throw new Error(result?.error?.message??'Upload failed.');resolve({public_id:result.public_id,version:result.version,signature:result.signature,resource_type:result.resource_type});}catch(error){reject(error);}};
  request.onerror=()=>{cleanup();reject(new Error('Upload connection failed. Retry the upload.'));};
  request.onabort=()=>{cleanup();reject(new DOMException('Upload cancelled','AbortError'));};
  if(signal?.aborted){cleanup();reject(new DOMException('Upload cancelled','AbortError'));return;}
  request.send(form);
 });
 const registered=await studioRequest<{item:StudioMedia}>('upload-register',{method:'POST',body:{receiptToken:intent.receiptToken,upload,alt},signal});
 return registered.item;
}
