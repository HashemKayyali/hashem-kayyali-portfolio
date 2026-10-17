import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createStudioHandler} from '../server/studio/handler.ts';
import {createStudioDatabase} from '../server/studio/database.ts';

const env={ADMIN_PASSWORD:'8080',ADMIN_SESSION_SECRET:'unit-test-session-secret-at-least-32-characters',SUPABASE_URL:'https://test-project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_unit_test',CLOUDINARY_CLOUD_NAME:'test-cloud',CLOUDINARY_API_KEY:'test-key',CLOUDINARY_API_SECRET:'test-provider-secret'};
const id='12345678-1234-4234-8234-123456789012';
const request=(action,method='GET',body,extra={})=>new Request('http://localhost/api/studio?action='+action,{method,headers:{origin:'http://localhost',...(body?{'content-type':'application/json'}:{}),...extra},...(body?{body:JSON.stringify(body)}:{})});
async function login(handler){const r=await handler(request('session','POST',{password:'8080'}));assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];}

test('Missing cloud accounts return an explicit empty public state and never claim successful writes',async()=>{
 const handler=createStudioHandler({env:{},fetcher:()=>{throw Error('Unexpected provider call');}});
 const status=await (await handler(request('status'))).json();assert.equal(status.database,false);assert.equal(status.media,false);assert.equal(status.admin,false);
 assert.deepEqual(await (await handler(request('public'))).json(),{configured:false,posts:[],gallery:[],projectMedia:[]});
 assert.equal((await handler(request('session','POST',{password:'8080'}))).status,503);
});
test('Single-admin login rejects a wrong password; cookie is HttpOnly and logout clears it',async()=>{
 const handler=createStudioHandler({env});
 assert.equal((await handler(request('session','POST',{password:'bad'}))).status,401);
 const r=await handler(request('session','POST',{password:'8080'}));assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/SameSite=Strict/);
 const cookie=r.headers.get('set-cookie').split(';')[0];assert.equal((await (await handler(request('session','GET',undefined,{cookie}))).json()).authenticated,true);
 const logout=await handler(request('session','DELETE',undefined,{cookie}));assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);
});
test('Tampered and expired sessions cannot authorize content writes',async()=>{
 let time=1_800_000_000_000;const handler=createStudioHandler({env,now:()=>time});const cookie=await login(handler);
 const bad=cookie.slice(0,-3)+'bad';assert.equal((await handler(request('items&resource=posts','POST',{}, {cookie:bad}))).status,401);
 time+=9*60*60*1000;assert.equal((await handler(request('items&resource=posts','POST',{}, {cookie}))).status,401);
});
test('Cross-origin mutations and oversized JSON requests are rejected before a provider call',async()=>{
 const handler=createStudioHandler({env});const cookie=await login(handler);
 assert.equal((await handler(request('items&resource=posts','POST',{}, {cookie,origin:'https://other.example'}))).status,403);
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
test('Unknown resources and arbitrary write fields cannot reach the database',async()=>{
 let calls=0;const handler=createStudioHandler({env,fetcher:async()=>{calls++;return Response.json([]);}});const cookie=await login(handler);
 assert.equal((await handler(request('items&resource=secrets','GET',undefined,{cookie}))).status,400);
 assert.equal((await handler(request('items&resource=posts','POST',{role:'admin'},{cookie}))).status,400);
 assert.equal(calls,0);
});
test('Upload signing uses unique scoped IDs and never exposes the Cloudinary secret',async()=>{
 const handler=createStudioHandler({env});const cookie=await login(handler);
 const a=await (await handler(request('upload-sign','POST',{kind:'image',size:2048},{cookie}))).json();
 const b=await (await handler(request('upload-sign','POST',{kind:'image',size:2048},{cookie}))).json();
 assert.notEqual(a.fields.public_id,b.fields.public_id);assert.match(a.fields.public_id,/^portfolio\/studio\//);
 assert.equal(a.fields.overwrite,'false');assert.ok(a.fields.allowed_formats.includes('webp'));
 const expected=createHash('sha1').update(Object.keys(a.fields).filter(k=>!['signature','api_key'].includes(k)).sort().map(k=>k+'='+a.fields[k]).join('&')+env.CLOUDINARY_API_SECRET).digest('hex');
 assert.equal(a.fields.signature,expected);assert.ok(!JSON.stringify(a).includes(env.CLOUDINARY_API_SECRET));
 assert.equal((await handler(request('upload-sign','POST',{kind:'image',size:21*1024*1024},{cookie}))).status,400);
});
test('A forged upload receipt cannot be registered or trigger a provider fetch',async()=>{
 let calls=0;const handler=createStudioHandler({env,fetcher:async()=>{calls++;return Response.json({});}});const cookie=await login(handler);
 const intent=await (await handler(request('upload-sign','POST',{kind:'image',size:2048},{cookie}))).json();
 const result=await handler(request('upload-register','POST',{receiptToken:intent.receiptToken,upload:{public_id:intent.fields.public_id,resource_type:'image',version:123,signature:'forged'},alt:'Desk'},{cookie}));
 assert.equal(result.status,400);assert.equal(calls,0);
});
test('Verified upload uses authoritative provider metadata and a constructed Cloudinary URL',async()=>{
 let calls=0,publicId;const handler=createStudioHandler({env,fetcher:async(url,init)=>{calls++;if(String(url).includes('api.cloudinary.com'))return Response.json({public_id:publicId,resource_type:'image',type:'upload',version:123,width:800,height:600,bytes:2048,format:'webp',secure_url:'https://evil.example/payload'});const body=JSON.parse(init.body);assert.equal(body.url,'https://res.cloudinary.com/test-cloud/image/upload/v123/'+publicId+'.webp');return Response.json([{id,...body}]);}});
 const cookie=await login(handler);const intent=await (await handler(request('upload-sign','POST',{kind:'image',size:2048},{cookie}))).json();publicId=intent.fields.public_id;
 const signature=createHash('sha1').update('public_id='+publicId+'&version=123'+env.CLOUDINARY_API_SECRET).digest('hex');
 const r=await handler(request('upload-register','POST',{receiptToken:intent.receiptToken,upload:{public_id:publicId,resource_type:'image',version:123,signature},alt:'Development desk'},{cookie}));
 assert.equal(r.status,201);assert.equal((await r.json()).item.alt,'Development desk');assert.equal(calls,2);
});
test('Publishing requires accessible media and arbitrary original URLs are rejected',async()=>{
 const handler=createStudioHandler({env,fetcher:async()=>Response.json([{id,kind:'image',alt:''}])});const cookie=await login(handler);
 const body={media_id:id,caption:'Work note',authored_at:'2026-10-16T00:00:00Z',source_url:null,published:true,sort_order:0};
 assert.equal((await handler(request('items&resource=posts','POST',body,{cookie}))).status,400);
 assert.equal((await handler(request('items&resource=posts','POST',{...body,published:false,source_url:'javascript:alert(1)'},{cookie}))).status,400);
});
test('Project media saves are one atomic RPC and unknown coded projects are rejected',async()=>{
 const seen=[];const handler=createStudioHandler({env,fetcher:async(url,init)=>{seen.push({url:String(url),body:init.body});return Response.json(null);}});const cookie=await login(handler);
 const r=await handler(request('project-media&project_id=eventies','PUT',{enabled:true,items:[]},{cookie}));assert.equal(r.status,200);
 assert.equal(seen.length,1);assert.ok(seen[0].url.endsWith('/rpc/studio_replace_project_media'));assert.equal(JSON.parse(seen[0].body).p_project_id,'eventies');
 assert.equal((await handler(request('project-media&project_id=made-up','PUT',{enabled:true,items:[]},{cookie}))).status,400);
});
test('Provider failures are surfaced without reflecting secret upstream diagnostics',async()=>{
 const handler=createStudioHandler({env,fetcher:async()=>new Response(JSON.stringify({message:env.SUPABASE_SECRET_KEY}),{status:500})});
 const r=await handler(request('public'));assert.equal(r.status,502);assert.ok(!(await r.text()).includes(env.SUPABASE_SECRET_KEY));
});
test('A receipt registration replay preserves existing alternative text and media metadata',async()=>{
 const existing={id,public_id:'portfolio/studio/'+id,alt:'Published accessible description'};
 const db=createStudioDatabase(env,async(url,init)=>{if(init.method==='POST'){assert.match(new Headers(init.headers).get('prefer'),/resolution=ignore-duplicates/);return Response.json([]);}return Response.json([existing]);});
 assert.deepEqual(await db.registerMedia({...existing,alt:''}),existing);
});
test('Editing image metadata cannot erase alternative text after publication',async()=>{
 let writes=0;const handler=createStudioHandler({env,fetcher:async(url,init)=>{if(init.method!=='GET')writes++;return Response.json([{id,kind:'image',alt:'Accessible description'}]);}});const cookie=await login(handler);
 const result=await handler(request('items&resource=media&id='+id,'PATCH',{alt:''},{cookie}));assert.equal(result.status,400);assert.equal(writes,0);
});
test('Adjacent order movement uses a transactional RPC independent of collection size',async()=>{
 let posted;const handler=createStudioHandler({env,fetcher:async(url,init)=>{assert.ok(String(url).endsWith('/rpc/studio_move_item'));posted=JSON.parse(init.body);return Response.json(null);}});const cookie=await login(handler);
 assert.equal((await handler(request('reorder','POST',{resource:'posts',id,direction:'down'},{cookie}))).status,200);
 assert.deepEqual(posted,{p_resource:'posts',p_id:id,p_direction:'down'});
});
