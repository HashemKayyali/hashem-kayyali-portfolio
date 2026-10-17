import {createHash,createHmac,scryptSync,timingSafeEqual} from 'node:crypto';
import type {StudioEnv} from './config.ts';
import {requireConfig} from './config.ts';
import {StudioError} from './errors.ts';
const COOKIE='portfolio_studio',HOURS=8*60*60*1000;
const equal=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);};
export function seal(value:Record<string,unknown>,secret:string){const payload=Buffer.from(JSON.stringify(value)).toString('base64url');return payload+'.'+createHmac('sha256',secret).update(payload).digest('base64url');}
export function unseal(token:string,secret:string):Record<string,unknown>|null{
 try{if(token.length>8192)return null;const [payload,signature,...rest]=token.split('.');if(rest.length||!payload||!signature||!equal(signature,createHmac('sha256',secret).update(payload).digest('base64url')))return null;const value=JSON.parse(Buffer.from(payload,'base64url').toString());return value&&typeof value==='object'&&!Array.isArray(value)?value:null;}catch{return null;}
}
const passwordTag=(env:StudioEnv)=>createHash('sha256').update(env.ADMIN_PASSWORD??'8080').digest('hex');
export function validSession(request:Request,env:StudioEnv,now:number){
 const secret=env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)return false;
 const cookie=request.headers.get('cookie')?.split(';').map(part=>part.trim()).find(part=>part.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 const data=cookie?unseal(cookie,secret):null;
 return !!data&&data.purpose==='admin'&&typeof data.expires==='number'&&data.expires>now&&data.expires<=now+HOURS+60_000&&equal(String(data.passwordTag),passwordTag(env));
}
export function requireAdmin(request:Request,env:StudioEnv,now:number){if(!validSession(request,env,now))throw new StudioError(401,'UNAUTHORIZED','Sign in to manage the studio.');}
export function passwordMatches(input:unknown,env:StudioEnv){
 requireConfig(env,'admin');if(typeof input!=='string'||input.length>256)return false;
 const salt=env.ADMIN_SESSION_SECRET!;
 return timingSafeEqual(scryptSync(input,salt,32),scryptSync(env.ADMIN_PASSWORD??'8080',salt,32));
}
export function sessionCookie(request:Request,env:StudioEnv,now:number,clear=false){
 const value=clear?'':seal({purpose:'admin',expires:now+HOURS,passwordTag:passwordTag(env)},env.ADMIN_SESSION_SECRET!);
 return COOKIE+'='+value+'; Path=/api/studio; HttpOnly; SameSite=Strict; Max-Age='+(clear?0:HOURS/1000)+(new URL(request.url).protocol==='https:'?'; Secure':'');
}
export function requireSameOrigin(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new StudioError(403,'INVALID_ORIGIN','This action must be made from the portfolio website.');
}
