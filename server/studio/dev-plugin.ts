import {Readable} from 'node:stream';
import type {Plugin,PreviewServer,ViteDevServer} from 'vite';
import {createStudioHandler} from './handler.ts';
import type {StudioEnv} from './config.ts';
/** Same Web Standard handler locally and on Vercel. No provider secret is bundled. */
export function studioApiPlugin(env:StudioEnv):Plugin{
 const handler=createStudioHandler({env});
 const install=(server:ViteDevServer|PreviewServer)=>{server.middlewares.use(async(request,response,next)=>{
  if(new URL(request.url??'/', 'http://localhost').pathname!=='/api/studio'){next();return;}
  try{
   const headers=new Headers();for(const [key,value]of Object.entries(request.headers)){if(Array.isArray(value))value.forEach(item=>headers.append(key,item));else if(value!==undefined)headers.set(key,value);}
   const method=request.method??'GET',hasBody=!['GET','HEAD'].includes(method);
   const init={method,headers,...(hasBody?{body:Readable.toWeb(request) as unknown as BodyInit,duplex:'half'}:{})};
   const result=await handler(new Request('http://'+(request.headers.host??'127.0.0.1:5176')+(request.url??'/api/studio'),init));
   response.statusCode=result.status;result.headers.forEach((value,key)=>response.setHeader(key,value));response.end(Buffer.from(await result.arrayBuffer()));
  }catch{response.statusCode=500;response.setHeader('Content-Type','application/json');response.end(JSON.stringify({error:{code:'STUDIO_UNAVAILABLE',message:'The studio could not complete this request.'}}));}
 });};
 return {name:'portfolio-cloud-studio-api',configureServer:install,configurePreviewServer:install};
}
