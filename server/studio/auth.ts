import {createHmac,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {StudioError} from './errors.ts';

/*
 * Single-owner Studio authentication (hardened 18 Oct 2026).
 * - Only a scrypt hash of the admin password is configured (ADMIN_PASSWORD_HASH); there is no default.
 * - Optional (required in production) TOTP second factor (ADMIN_TOTP_SECRET, RFC 6238, SHA-1, 30 s, 6 digits).
 * - The cookie is an HMAC-sealed reference to a server-side session row, so logout really revokes it.
 * Throttling, session rows and TOTP replay state live in the database (see database.ts).
 */
export const COOKIE='portfolio_studio',SESSION_MS=8*60*60*1000;
const SCRYPT_DEFAULT={N:2**15,r:8,p:1};
const KEY_LENGTH=32;
const equal=(a:string|Buffer,b:string|Buffer)=>{const x=Buffer.isBuffer(a)?a:Buffer.from(a),y=Buffer.isBuffer(b)?b:Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);};

export function seal(value:Record<string,unknown>,secret:string){const payload=Buffer.from(JSON.stringify(value)).toString('base64url');return payload+'.'+createHmac('sha256',secret).update(payload).digest('base64url');}
export function unseal(token:string,secret:string):Record<string,unknown>|null{
 try{if(token.length>8192)return null;const [payload,signature,...rest]=token.split('.');if(rest.length||!payload||!signature||!equal(signature,createHmac('sha256',secret).update(payload).digest('base64url')))return null;const value=JSON.parse(Buffer.from(payload,'base64url').toString());return value&&typeof value==='object'&&!Array.isArray(value)?value:null;}catch{return null;}
}

/* ── Password hash: scrypt$N$r$p$salt$hash (base64url) ─────────────────────────────── */
export type PasswordHash={N:number;r:number;p:number;salt:Buffer;hash:Buffer};
const memoryFor=(N:number,r:number)=>256*N*r+1024*1024;
export function hashPassword(password:string,salt=randomBytes(16),cost=SCRYPT_DEFAULT){
 const {N,r,p}=cost,hash=scryptSync(password.normalize('NFKC'),salt,KEY_LENGTH,{N,r,p,maxmem:memoryFor(N,r)});
 return ['scrypt',N,r,p,salt.toString('base64url'),hash.toString('base64url')].join('$');
}
export function parsePasswordHash(value:string|undefined):PasswordHash|null{
 if(!value||value.length>300)return null;const parts=value.trim().split('$');if(parts.length!==6||parts[0]!=='scrypt')return null;
 const [N,r,p]=parts.slice(1,4).map(Number);
 if(!Number.isInteger(N)||N<2**14||N>2**20||(N&(N-1))!==0||!Number.isInteger(r)||r<8||r>32||!Number.isInteger(p)||p<1||p>4)return null;
 const salt=Buffer.from(parts[4],'base64url'),hash=Buffer.from(parts[5],'base64url');
 return salt.length>=16&&hash.length===KEY_LENGTH?{N,r,p,salt,hash}:null;
}
export function verifyPassword(input:unknown,stored:PasswordHash){
 if(typeof input!=='string'||!input||input.length>256)return false;
 const derived=scryptSync(input.normalize('NFKC'),stored.salt,KEY_LENGTH,{N:stored.N,r:stored.r,p:stored.p,maxmem:memoryFor(stored.N,stored.r)});
 return equal(derived,stored.hash);
}
/** Strength rules enforced when the owner creates the hash. Returns the problems (empty = acceptable). */
const COMMON=['password','admin','administrator','qwerty','letmein','welcome','portfolio','hashem','kayyali','studio','123456','8080','iloveyou','monkey','dragon'];
export function passwordProblems(password:string){
 const problems:string[]=[];const value=password.normalize('NFKC'),lower=value.toLowerCase();
 if(value.length<14)problems.push('Use at least 14 characters.');
 if(value.length>256)problems.push('Use at most 256 characters.');
 if(new Set(value).size<6)problems.push('Use more varied characters.');
 const classes=[/[a-z]/,/[A-Z]/,/[0-9]/,/[^A-Za-z0-9]/].filter(pattern=>pattern.test(value)).length;
 if(value.length<20&&classes<3)problems.push('Under 20 characters, mix at least three of: lowercase, uppercase, digits, symbols.');
 if(COMMON.some(word=>lower.includes(word))&&value.length<24)problems.push('Avoid common words or the site owner\'s name unless the passphrase is 24+ characters.');
 if(/(.)\1{3,}/.test(value)||/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer)/i.test(value))problems.push('Avoid repeated or sequential runs.');
 return problems;
}
/** Session secrets must be long and not trivially repetitive. */
export const strongSecret=(value:string|undefined)=>!!value&&value.length>=32&&value.length<=512&&new Set(value).size>=12;

/* ── TOTP (RFC 6238) ──────────────────────────────────────────────────────────────── */
const BASE32='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32Decode(value:string){
 const clean=value.replace(/[\s=-]/g,'').toUpperCase();if(!clean||/[^A-Z2-7]/.test(clean))return null;
 let bits=0,buffer=0;const out:number[]=[];
 for(const char of clean){buffer=(buffer<<5)|BASE32.indexOf(char);bits+=5;if(bits>=8){out.push((buffer>>>(bits-8))&255);bits-=8;}}
 return Buffer.from(out);
}
export function base32Encode(bytes:Buffer){let bits=0,buffer=0,out='';for(const byte of bytes){buffer=(buffer<<8)|byte;bits+=8;while(bits>=5){out+=BASE32[(buffer>>>(bits-5))&31];bits-=5;}}if(bits>0)out+=BASE32[(buffer<<(5-bits))&31];return out;}
export const totpKey=(secret:string|undefined)=>{const key=secret?base32Decode(secret):null;return key&&key.length>=16?key:null;};
export function totpCode(key:Buffer,step:number){
 const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(step));
 const mac=createHmac('sha1',key).update(counter).digest(),offset=mac[mac.length-1]&15;
 return String((mac.readUInt32BE(offset)&0x7fffffff)%1_000_000).padStart(6,'0');
}
/** The accepted time step (±1 step drift), or null. Replay is prevented by the caller storing the step. */
export function verifyTotp(code:unknown,key:Buffer,now:number){
 if(typeof code!=='string'||!/^\d{6}$/.test(code.trim()))return null;
 const current=Math.floor(now/30_000);let accepted:number|null=null;
 for(const step of [current-1,current,current+1])if(equal(totpCode(key,step),code.trim()))accepted=step;
 return accepted;
}

/* ── Session cookie: sealed {sid, expires, tag}; the row decides whether it is still valid ── */
export type SessionClaim={sid:string;expires:number};
export const credentialTag=(passwordHash:string,secret:string)=>createHmac('sha256',secret).update('studio-credential:'+passwordHash).digest('base64url');
export function readSessionClaim(request:Request,secret:string,tag:string,now:number):SessionClaim|null{
 const cookie=request.headers.get('cookie')?.split(';').map(part=>part.trim()).find(part=>part.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 const data=cookie?unseal(cookie,secret):null;
 if(!data||data.purpose!=='admin'||typeof data.sid!=='string'||!/^[0-9a-f-]{36}$/i.test(data.sid)||typeof data.expires!=='number'||data.expires<=now||data.expires>now+SESSION_MS+60_000||!equal(String(data.tag),tag))return null;
 return {sid:data.sid,expires:data.expires};
}
export function sessionCookie(request:Request,secret:string,claim:(SessionClaim&{tag:string})|null,now:number){
 const value=claim?seal({purpose:'admin',sid:claim.sid,expires:claim.expires,tag:claim.tag},secret):'';
 const maxAge=claim?Math.max(0,Math.floor((claim.expires-now)/1000)):0;
 return COOKIE+'='+value+'; Path=/api/studio; HttpOnly; SameSite=Strict; Max-Age='+(claim?Math.min(maxAge,SESSION_MS/1000):0)+(new URL(request.url).protocol==='https:'?'; Secure':'');
}

/** Client identity for throttling: a keyed hash of the platform-provided IP (raw IPs are never stored). */
export function clientKey(request:Request,secret:string){
 const ip=request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')?.trim()||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
 return 'ip:'+createHmac('sha256',secret).update('studio-throttle:'+ip).digest('hex').slice(0,40);
}
export function requireSameOrigin(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new StudioError(403,'INVALID_ORIGIN','This action must be made from the portfolio website.');
}
