import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createStudioHandler} from '../server/studio/handler.ts';
import {createStudioDatabase} from '../server/studio/database.ts';
import {studioStatus} from '../server/studio/config.ts';
import {hashPassword,parsePasswordHash,passwordProblems,totpCode,base32Encode,verifyTotp,totpKey} from '../server/studio/auth.ts';
import {fakeAuthStore,withAuth} from './support/fake-auth-store.mjs';

const PASSWORD='Atelier-ledger 47 quietly';
const HASH=hashPassword(PASSWORD,Buffer.alloc(16,7),{N:2**14,r:8,p:1});
const TOTP=base32Encode(Buffer.from('0123456789abcdef0123'));
const env={ADMIN_PASSWORD_HASH:HASH,ADMIN_SESSION_SECRET:'unit-test-session-secret-0123456789-abcdefghijk',SUPABASE_URL:'https://test-project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_unit_test',CLOUDINARY_CLOUD_NAME:'test-cloud',CLOUDINARY_API_KEY:'test-key',CLOUDINARY_API_SECRET:'test-provider-secret'};
const id='12345678-1234-4234-8234-123456789012';
const request=(action,method='GET',body,extra={})=>new Request('http://localhost/api/studio?action='+action,{method,headers:{origin:'http://localhost',...(body?{'content-type':'application/json'}:{}),...extra},...(body?{body:JSON.stringify(body)}:{})});
/** A handler whose auth state lives in an in-memory store; `content` mocks every other provider call. */
function studio({content,environment=env,now}={}){const store=fakeAuthStore(now);return {store,handler:createStudioHandler({env:environment,fetcher:withAuth(store,content),...(now?{now}:{})})};}
async function login(handler,extra={},body={password:PASSWORD}){const r=await handler(request('session','POST',body,extra));assert.equal(r.status,200,await r.clone().text());return r.headers.get('set-cookie').split(';')[0];}
const authenticated=async(handler,cookie)=>(await (await handler(request('session','GET',undefined,{cookie}))).json()).authenticated;

/* ── Configuration fails closed ─────────────────────────────────────────────────────── */
test('Admin stays disabled without explicit, valid credentials; there is no default password',()=>{
 assert.equal(studioStatus({}).admin,false);
 const {ADMIN_PASSWORD_HASH,...noHash}=env;assert.equal(studioStatus(noHash).admin,false);assert.ok(studioStatus(noHash).missing.includes('ADMIN_PASSWORD_HASH'));
 assert.equal(studioStatus({...noHash,ADMIN_PASSWORD:'8080'}).admin,false,'a plaintext password must never enable admin');
 assert.equal(studioStatus({...env,ADMIN_PASSWORD:'8080'}).admin,false,'a leftover plaintext password disables admin');
 assert.equal(studioStatus({...env,ADMIN_PASSWORD_HASH:'scrypt$1024$8$1$c2FsdA$aGFzaA'}).admin,false,'weak scrypt parameters are refused');
 assert.equal(studioStatus({...env,ADMIN_PASSWORD_HASH:'8080'}).admin,false);
 assert.equal(studioStatus({...env,ADMIN_SESSION_SECRET:'short'}).admin,false);
 assert.equal(studioStatus({...env,ADMIN_SESSION_SECRET:'a'.repeat(40)}).admin,false,'repetitive secrets are refused');
 const {SUPABASE_URL,...noDatabase}=env;assert.equal(studioStatus(noDatabase).admin,false,'sessions and throttling need the database');
 assert.equal(studioStatus(env).admin,true);assert.equal(studioStatus(env).mfa,false);
});
test('Production requires the TOTP second factor; a malformed TOTP secret disables admin',()=>{
 assert.equal(studioStatus({...env,VERCEL_ENV:'production'}).admin,false);
 assert.ok(studioStatus({...env,VERCEL_ENV:'production'}).missing.includes('ADMIN_TOTP_SECRET'));
 assert.equal(studioStatus({...env,VERCEL_ENV:'production',ADMIN_TOTP_SECRET:TOTP}).admin,true);
 assert.equal(studioStatus({...env,VERCEL_ENV:'production',ADMIN_TOTP_SECRET:TOTP}).mfa,true);
 assert.equal(studioStatus({...env,ADMIN_TOTP_SECRET:'not base32!'}).admin,false);
 assert.equal(studioStatus({...env,ADMIN_TOTP_SECRET:'JBSWY3DPEHPK3PXP'}).admin,false,'80-bit secrets are too short');
});
test('Status reports setting names only, never values',async()=>{
 const {handler}=studio();const text=await (await handler(request('status'))).text();
 for(const value of [HASH,env.ADMIN_SESSION_SECRET,env.SUPABASE_SECRET_KEY,env.CLOUDINARY_API_SECRET])assert.ok(!text.includes(value));
});
test('Password strength rules refuse weak or default passwords and accept strong passphrases',()=>{
 for(const weak of ['8080','password','Password12345','aaaaaaaaaaaaaaaaaaaa','hashemkayyali2026!','abcd1234ABCD!!','short Pass1!'])assert.ok(passwordProblems(weak).length>0,weak);
 for(const strong of [PASSWORD,'correct-horse-battery-staple-orbit','T7#vq!Lm29xZ@rp'])assert.deepEqual(passwordProblems(strong),[],strong);
});
test('Password hashes round-trip and malformed hashes are rejected',()=>{
 const parsed=parsePasswordHash(HASH);assert.ok(parsed);assert.equal(parsed.N,2**14);
 for(const bad of ['','scrypt$16384$8$1$$','bcrypt$x','scrypt$16385$8$1$c2FsdHNhbHRzYWx0c2FsdA$'+Buffer.alloc(32).toString('base64url'),'scrypt$16384$8$1$c2FsdA$'+Buffer.alloc(32).toString('base64url')])assert.equal(parsePasswordHash(bad),null,bad);
});

/* ── Sign-in, sessions and logout ───────────────────────────────────────────────────── */
test('Missing cloud accounts return an explicit empty public state and never claim successful writes',async()=>{
 const handler=createStudioHandler({env:{},fetcher:()=>{throw Error('Unexpected provider call');}});
 const status=await (await handler(request('status'))).json();assert.equal(status.database,false);assert.equal(status.media,false);assert.equal(status.admin,false);
 assert.deepEqual(await (await handler(request('public'))).json(),{configured:false,posts:[],gallery:[],projectMedia:[]});
 assert.equal((await handler(request('session','POST',{password:'8080'}))).status,503);
 assert.equal((await handler(request('session','POST',{password:PASSWORD}))).status,503);
});
test('Login rejects a wrong password; the cookie is HttpOnly, SameSite=Strict and path-scoped',async()=>{
 const {handler}=studio();
 assert.equal((await handler(request('session','POST',{password:'wrong password'}))).status,401);
 assert.equal((await handler(request('session','POST',{password:'8080'}))).status,401,'the old default no longer works');
 assert.equal((await handler(request('session','POST',{}))).status,401);
 const r=await handler(request('session','POST',{password:PASSWORD}));assert.equal(r.status,200);const header=r.headers.get('set-cookie');
 assert.match(header,/HttpOnly/);assert.match(header,/SameSite=Strict/);assert.match(header,/Path=\/api\/studio/);assert.match(header,/Max-Age=28800/);
 assert.equal(await authenticated(handler,header.split(';')[0]),true);
});
test('Secure is set on HTTPS cookies',async()=>{
 const {handler}=studio();const r=await handler(new Request('https://hashemkayyali.com/api/studio?action=session',{method:'POST',headers:{origin:'https://hashemkayyali.com','content-type':'application/json'},body:JSON.stringify({password:PASSWORD})}));
 assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/; Secure/);
});
test('Logout revokes the server-side session, so a copied cookie stops working',async()=>{
 const {handler}=studio({content:async()=>Response.json([])});const cookie=await login(handler);
 const logout=await handler(request('session','DELETE',undefined,{cookie}));assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);
 assert.equal(await authenticated(handler,cookie),false);
 assert.equal((await handler(request('items&resource=posts','GET',undefined,{cookie}))).status,401);
});
test('Sign out everywhere revokes every session; it requires a valid session',async()=>{
 const {handler}=studio();const a=await login(handler),b=await login(handler);
 assert.equal((await handler(request('session&scope=all','DELETE'))).status,401);
 assert.equal((await handler(request('session&scope=all','DELETE',undefined,{cookie:a}))).status,200);
 assert.equal(await authenticated(handler,a),false);assert.equal(await authenticated(handler,b),false);
});
test('Tampered, foreign-secret and expired sessions cannot authorize content writes',async()=>{
 let time=1_800_000_000_000;const {handler}=studio({now:()=>time});const cookie=await login(handler);
 assert.equal((await handler(request('items&resource=posts','POST',{}, {cookie:cookie.slice(0,-3)+'bad'}))).status,401);
 const other=createStudioHandler({env:{...env,ADMIN_SESSION_SECRET:'another-session-secret-0123456789-qrstuvwxyz'},fetcher:withAuth(fakeAuthStore(()=>time)),now:()=>time});
 assert.equal(await authenticated(other,cookie),false);
 time+=8*60*60*1000+60_000;assert.equal((await handler(request('items&resource=posts','POST',{}, {cookie}))).status,401);
});
test('Changing the password hash invalidates existing sessions',async()=>{
 const store=fakeAuthStore();const before=createStudioHandler({env,fetcher:withAuth(store)});const cookie=await login(before);
 const after=createStudioHandler({env:{...env,ADMIN_PASSWORD_HASH:hashPassword('A completely new passphrase 9',Buffer.alloc(16,9),{N:2**14,r:8,p:1})},fetcher:withAuth(store)});
 assert.equal(await authenticated(after,cookie),false);
});
test('A session for a revoked or unknown row is refused even with a valid signature',async()=>{
 const {handler,store}=studio();const cookie=await login(handler);store.sessions.clear();
 assert.equal(await authenticated(handler,cookie),false);
});

/* ── Throttling ─────────────────────────────────────────────────────────────────────── */
test('Five failures lock the client for 15 minutes, even for the correct password',async()=>{
 let time=1_800_000_000_000;const {handler}=studio({now:()=>time});const ip={'x-vercel-forwarded-for':'203.0.113.9'};
 for(let i=0;i<4;i++)assert.equal((await handler(request('session','POST',{password:'nope'},ip))).status,401);
 const fifth=await handler(request('session','POST',{password:'nope'},ip));assert.equal(fifth.status,429);assert.equal(fifth.headers.get('retry-after'),'900');
 const locked=await handler(request('session','POST',{password:PASSWORD},ip));assert.equal(locked.status,429,'no bypass with the right password while locked');
 assert.equal((await handler(request('session','POST',{password:PASSWORD},{'x-vercel-forwarded-for':'198.51.100.4'}))).status,200,'other clients are unaffected');
 time+=15*60*1000+1000;assert.equal((await handler(request('session','POST',{password:PASSWORD},ip))).status,200,'the lock expires');
});
test('A global ceiling stops IP rotation, and raw IPs are never stored',async()=>{
 const {handler,store}=studio();
 for(let i=0;i<30;i++)await handler(request('session','POST',{password:'nope'},{'x-vercel-forwarded-for':'192.0.2.'+i}));
 assert.equal((await handler(request('session','POST',{password:PASSWORD},{'x-vercel-forwarded-for':'192.0.2.250'}))).status,429);
 for(const key of store.attempts.keys())assert.ok(key==='global'||/^ip:[a-f0-9]{40}$/.test(key),key);
});
test('A successful sign-in clears only that client\'s counter',async()=>{
 const {handler,store}=studio();const ip={'x-vercel-forwarded-for':'203.0.113.20'};
 await handler(request('session','POST',{password:'nope'},ip));await login(handler,ip);
 assert.equal([...store.attempts.keys()].filter(key=>key!=='global').length,0);assert.ok(store.attempts.has('global'));
});
test('Sign-in fails closed when the security store is unavailable',async()=>{
 const handler=createStudioHandler({env,fetcher:async()=>new Response('{}',{status:500})});
 const r=await handler(request('session','POST',{password:PASSWORD}));assert.equal(r.status,502);assert.equal(r.headers.get('set-cookie'),null);
});

/* ── TOTP second factor ─────────────────────────────────────────────────────────────── */
test('TOTP: password alone, wrong codes and replayed codes are refused; drift of one step is accepted',async()=>{
 let time=1_800_000_015_000;const environment={...env,ADMIN_TOTP_SECRET:TOTP};const {handler}=studio({environment,now:()=>time});const key=totpKey(TOTP),step=()=>Math.floor(time/30_000);
 assert.equal((await handler(request('session','POST',{password:PASSWORD}))).status,401);
 assert.equal((await handler(request('session','POST',{password:PASSWORD,code:'000000'===totpCode(key,step())?'111111':'000000'}))).status,401);
 assert.equal((await handler(request('session','POST',{password:'wrong',code:totpCode(key,step())}))).status,401);
 const code=totpCode(key,step());
 assert.equal((await handler(request('session','POST',{password:PASSWORD,code}))).status,200);
 assert.equal((await handler(request('session','POST',{password:PASSWORD,code}))).status,401,'replay of the same code is refused');
 time+=30_000;assert.equal((await handler(request('session','POST',{password:PASSWORD,code:totpCode(key,step()-1)}))).status,401,'an already-used step is refused');
 time+=60_000;assert.equal((await handler(request('session','POST',{password:PASSWORD,code:totpCode(key,step()-1)}))).status,200,'previous-step drift accepted');
 assert.equal((await handler(request('session','POST',{password:PASSWORD,code:totpCode(key,step()-3)}))).status,401,'old codes rejected');
});
test('TOTP verification matches RFC 6238 reference vectors',()=>{
 const key=Buffer.from('12345678901234567890');
 for(const [seconds,code] of [[59,'287082'],[1111111109,'081804'],[1234567890,'005924'],[2000000000,'279037']])assert.equal(totpCode(key,Math.floor(seconds/30)),code);
 assert.equal(verifyTotp('287082',key,59_000),1);assert.equal(verifyTotp('28708',key,59_000),null);assert.equal(verifyTotp(287082,key,59_000),null);
});

/* ── Origin, request size and data boundaries (existing coverage, adapted) ───────────── */
test('Cross-origin and origin-less mutations, including sign-in, are rejected before a provider call',async()=>{
 const {handler}=studio();const cookie=await login(handler);
 assert.equal((await handler(request('items&resource=posts','POST',{}, {cookie,origin:'https://other.example'}))).status,403);
 assert.equal((await handler(request('session','POST',{password:PASSWORD},{origin:'https://other.example'}))).status,403);
 assert.equal((await handler(new Request('http://localhost/api/studio?action=session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:PASSWORD})}))).status,403);
 assert.equal((await handler(request('session','POST',{password:'x'.repeat(70_000)}))).status,413);
});
test('Public provider reads explicitly filter drafts and keep secrets out of responses',async()=>{
 const seen=[];const handler=createStudioHandler({env,fetcher:async(url,init)=>{const u=new URL(url);seen.push(u);assert.equal(new Headers(init.headers).get('apikey'),env.SUPABASE_SECRET_KEY);assert.equal(new Headers(init.headers).has('authorization'),false);return Response.json([]);}});
 const r=await handler(request('public'));assert.equal(r.status,200);const data=await r.json();assert.equal(data.configured,true);
 assert.ok(seen.find(u=>u.pathname.endsWith('studio_posts')&&u.searchParams.get('published')==='eq.true'));
 assert.ok(seen.find(u=>u.pathname.endsWith('studio_gallery')&&u.searchParams.get('published')==='eq.true'));
 assert.ok(seen.find(u=>u.pathname.endsWith('studio_project_overrides')&&u.searchParams.get('enabled')==='eq.true'));
 assert.ok(!JSON.stringify(data).includes(env.SUPABASE_SECRET_KEY));
});
test('Every admin action requires a session',async()=>{
 let calls=0;const {handler}=studio({content:async()=>{calls++;return Response.json([]);}});
 for(const [action,method] of [['items&resource=posts','GET'],['items&resource=posts','POST'],['items&resource=media&id='+id,'DELETE'],['upload-sign','POST'],['upload-register','POST'],['reorder','POST'],['project-media&project_id=eventies','GET'],['project-media&project_id=eventies','PUT']])
  assert.equal((await handler(request(action,method,method==='GET'||method==='DELETE'?undefined:{}))).status,401,action+' '+method);
 assert.equal(calls,0);
});
test('Unknown resources and arbitrary write fields cannot reach the database',async()=>{
 let calls=0;const {handler}=studio({content:async()=>{calls++;return Response.json([]);}});const cookie=await login(handler);
 assert.equal((await handler(request('items&resource=secrets','GET',undefined,{cookie}))).status,400);
 assert.equal((await handler(request('items&resource=posts','POST',{role:'admin'},{cookie}))).status,400);
 assert.equal((await handler(request('items&resource=posts&id=1 or 1=1','GET',undefined,{cookie}))).status,400);
 assert.equal(calls,0);
});
test('Upload signing uses unique scoped IDs and never exposes the Cloudinary secret',async()=>{
 const {handler}=studio();const cookie=await login(handler);
 const a=await (await handler(request('upload-sign','POST',{kind:'image',size:2048},{cookie}))).json();
 const b=await (await handler(request('upload-sign','POST',{kind:'image',size:2048},{cookie}))).json();
 assert.notEqual(a.fields.public_id,b.fields.public_id);assert.match(a.fields.public_id,/^portfolio\/studio\//);
 assert.equal(a.fields.overwrite,'false');assert.ok(a.fields.allowed_formats.includes('webp'));assert.ok(!a.fields.allowed_formats.includes('svg'));
 const expected=createHash('sha1').update(Object.keys(a.fields).filter(k=>!['signature','api_key'].includes(k)).sort().map(k=>k+'='+a.fields[k]).join('&')+env.CLOUDINARY_API_SECRET).digest('hex');
 assert.equal(a.fields.signature,expected);assert.ok(!JSON.stringify(a).includes(env.CLOUDINARY_API_SECRET));
 assert.equal((await handler(request('upload-sign','POST',{kind:'image',size:21*1024*1024},{cookie}))).status,400);
 assert.equal((await handler(request('upload-sign','POST',{kind:'raw',size:10},{cookie}))).status,400);
});
test('A forged upload receipt cannot be registered or trigger a provider fetch',async()=>{
 let calls=0;const {handler}=studio({content:async()=>{calls++;return Response.json({});}});const cookie=await login(handler);
 const intent=await (await handler(request('upload-sign','POST',{kind:'image',size:2048},{cookie}))).json();
 const result=await handler(request('upload-register','POST',{receiptToken:intent.receiptToken,upload:{public_id:intent.fields.public_id,resource_type:'image',version:123,signature:'forged'},alt:'Desk'},{cookie}));
 assert.equal(result.status,400);assert.equal(calls,0);
});
const signedReceipt=(publicId,version=123)=>createHash('sha1').update('public_id='+publicId+'&version='+version+env.CLOUDINARY_API_SECRET).digest('hex');
test('Verified upload uses authoritative provider metadata and a constructed Cloudinary URL',async()=>{
 let calls=0,publicId;const {handler}=studio({content:async(url,init)=>{calls++;if(String(url).includes('api.cloudinary.com'))return Response.json({public_id:publicId,resource_type:'image',type:'upload',version:123,width:800,height:600,bytes:2048,format:'webp',secure_url:'https://evil.example/payload'});const body=JSON.parse(init.body);assert.equal(body.url,'https://res.cloudinary.com/test-cloud/image/upload/v123/'+publicId+'.webp');return Response.json([{id,...body}]);}});
 const cookie=await login(handler);const intent=await (await handler(request('upload-sign','POST',{kind:'image',size:2048},{cookie}))).json();publicId=intent.fields.public_id;
 const r=await handler(request('upload-register','POST',{receiptToken:intent.receiptToken,upload:{public_id:publicId,resource_type:'image',version:123,signature:signedReceipt(publicId)},alt:'Development desk'},{cookie}));
 assert.equal(r.status,201);assert.equal((await r.json()).item.alt,'Development desk');assert.equal(calls,2);
});
test('A signed upload that breaks the size or type limits is deleted from Cloudinary and not registered',async()=>{
 for(const info of [{bytes:30*1024*1024,format:'png'},{bytes:2048,format:'svg'},{bytes:2048,format:'png',width:40000}]){
  const seen=[];let publicId;
  const {handler}=studio({content:async(url,init)=>{seen.push({url:String(url),init});if(String(url).includes('/resources/'))return Response.json({public_id:publicId,resource_type:'image',type:'upload',version:123,width:800,height:600,...info});return Response.json({result:'ok'});}});
  const cookie=await login(handler);const intent=await (await handler(request('upload-sign','POST',{kind:'image',size:2048},{cookie}))).json();publicId=intent.fields.public_id;
  const r=await handler(request('upload-register','POST',{receiptToken:intent.receiptToken,upload:{public_id:publicId,resource_type:'image',version:123,signature:signedReceipt(publicId)}},{cookie}));
  assert.equal(r.status,400,JSON.stringify(info));
  const destroy=seen.find(call=>call.url.endsWith('/image/destroy'));assert.ok(destroy,'rejected asset is destroyed');
  const form=new URLSearchParams(destroy.init.body);assert.equal(form.get('public_id'),publicId);assert.equal(form.get('invalidate'),'true');
  const expected=createHash('sha1').update(`invalidate=true&public_id=${publicId}&timestamp=${form.get('timestamp')}`+env.CLOUDINARY_API_SECRET).digest('hex');assert.equal(form.get('signature'),expected);
  assert.ok(!seen.some(call=>call.url.includes('/rest/v1/studio_media')),'nothing is registered');
 }
});
test('Publishing requires accessible media and arbitrary original URLs are rejected',async()=>{
 const {handler}=studio({content:async()=>Response.json([{id,kind:'image',alt:''}])});const cookie=await login(handler);
 const body={media_id:id,caption:'Work note',authored_at:'2026-10-16T00:00:00Z',source_url:null,published:true,sort_order:0};
 assert.equal((await handler(request('items&resource=posts','POST',body,{cookie}))).status,400);
 for(const source_url of ['javascript:alert(1)','http://linkedin.com/post','https://linkedin.com.evil.example/x','https://user:pass@www.linkedin.com/x','data:text/html,hi'])
  assert.equal((await handler(request('items&resource=posts','POST',{...body,published:false,source_url},{cookie}))).status,400,source_url);
});
test('Project media saves are one atomic RPC and unknown coded projects are rejected',async()=>{
 const seen=[];const {handler}=studio({content:async(url,init)=>{seen.push({url:String(url),body:init.body});return Response.json(null);}});const cookie=await login(handler);
 const r=await handler(request('project-media&project_id=eventies','PUT',{enabled:true,items:[]},{cookie}));assert.equal(r.status,200);
 assert.equal(seen.length,1);assert.ok(seen[0].url.endsWith('/rpc/studio_replace_project_media'));assert.equal(JSON.parse(seen[0].body).p_project_id,'eventies');
 assert.equal((await handler(request('project-media&project_id=made-up','PUT',{enabled:true,items:[]},{cookie}))).status,400);
});
test('Provider failures are surfaced without reflecting secret upstream diagnostics',async()=>{
 const handler=createStudioHandler({env,fetcher:async()=>new Response(JSON.stringify({message:env.SUPABASE_SECRET_KEY}),{status:500})});
 const r=await handler(request('public'));assert.equal(r.status,502);assert.ok(!(await r.text()).includes(env.SUPABASE_SECRET_KEY));
});
test('Unexpected failures return a generic 500 and log no secrets',async t=>{
 const logged=[];t.mock.method(console,'error',(...args)=>logged.push(args.join(' ')));
 // A 204 where a row array is expected makes the database layer throw a non-Studio error.
 const {handler}=studio({content:async()=>new Response(null,{status:204})});const cookie=await login(handler);
 const r=await handler(request('items&resource=posts&id='+id,'GET',undefined,{cookie}));
 assert.equal(r.status,500);assert.deepEqual(await r.json(),{error:{code:'STUDIO_UNAVAILABLE',message:'The studio could not complete this request. Please retry.'}});
 assert.equal(logged.length,1);for(const secret of [env.SUPABASE_SECRET_KEY,env.ADMIN_SESSION_SECRET,HASH,PASSWORD])assert.ok(!logged[0].includes(secret));
});
test('A receipt registration replay preserves existing alternative text and media metadata',async()=>{
 const existing={id,public_id:'portfolio/studio/'+id,alt:'Published accessible description'};
 const db=createStudioDatabase(env,async(url,init)=>{if(init.method==='POST'){assert.match(new Headers(init.headers).get('prefer'),/resolution=ignore-duplicates/);return Response.json([]);}return Response.json([existing]);});
 assert.deepEqual(await db.registerMedia({...existing,alt:''}),existing);
});
test('Editing image metadata cannot erase alternative text after publication',async()=>{
 let writes=0;const {handler}=studio({content:async(url,init)=>{if(init.method!=='GET')writes++;return Response.json([{id,kind:'image',alt:'Accessible description'}]);}});const cookie=await login(handler);
 const result=await handler(request('items&resource=media&id='+id,'PATCH',{alt:''},{cookie}));assert.equal(result.status,400);assert.equal(writes,0);
});
test('Adjacent order movement uses a transactional RPC independent of collection size',async()=>{
 let posted;const {handler}=studio({content:async(url,init)=>{assert.ok(String(url).endsWith('/rpc/studio_move_item'));posted=JSON.parse(init.body);return Response.json(null);}});const cookie=await login(handler);
 assert.equal((await handler(request('reorder','POST',{resource:'posts',id,direction:'down'},{cookie}))).status,200);
 assert.deepEqual(posted,{p_resource:'posts',p_id:id,p_direction:'down'});
 assert.equal((await handler(request('reorder','POST',{resource:'studio_media',id,direction:'down'},{cookie}))).status,400);
});
test('Public content is edge-cached; only a signed-in admin can force a fresh copy',async()=>{
 const {handler}=studio({content:async()=>Response.json([])});
 const cached=await handler(request('public'));assert.match(cached.headers.get('cache-control'),/s-maxage=60/);
 const anonymousFresh=await handler(request('public&fresh=1'));assert.match(anonymousFresh.headers.get('cache-control'),/s-maxage=60/,'fresh is ignored without a session');
 const cookie=await login(handler);const fresh=await handler(request('public&fresh=1','GET',undefined,{cookie}));assert.equal(fresh.headers.get('cache-control'),'no-store');
 const {handler:unconfigured}=studio({environment:{}});assert.equal((await unconfigured(request('public'))).headers.get('cache-control'),'no-store');
});
