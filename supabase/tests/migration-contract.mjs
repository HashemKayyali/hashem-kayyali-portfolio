// Applies both Studio migrations to a local PostgreSQL 17 (PGlite, WebAssembly) with Supabase-like roles,
// then checks permissions, RLS, constraints and every RPC, including failure cases and the rollbacks.
// Usage (no account or network database involved):
//   npm install --no-save @electric-sql/pglite@0.3 && node supabase/tests/migration-contract.mjs
import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),'utf8');
const db=new PGlite();let pass=0,fail=0;
const ok=(name,cond,detail='')=>{cond?pass++:fail++;console.log((cond?'PASS ':'FAIL ')+name+(detail?' — '+detail:''));};
const err=async(sql,params)=>{try{params?await db.query(sql,params):await db.exec(sql);return null;}catch(e){return e.message;}};
const one=async(sql,params)=>(await db.query(sql,params)).rows[0];

// Supabase grants broad default privileges in `public`; the migrations must revoke them explicitly.
await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
 grant usage on schema public to anon,authenticated,service_role;
 alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
 alter default privileges in schema public grant all on functions to anon,authenticated,service_role;`);
const migrations=['202610160001_studio.sql','202610180001_studio_admin_security.sql'];
for(const f of migrations){const e=await err(read('migrations/'+f));ok('apply '+f,!e,e??'');}
for(const f of migrations){const e=await err(read('migrations/'+f));ok('re-apply (idempotent) '+f,!e,e??'');}

for(const role of ['anon','authenticated']){
 await db.exec(`set role ${role}`);
 for(const t of ['studio_media','studio_posts','studio_gallery','studio_project_overrides','studio_project_media','studio_auth_attempts','studio_admin_sessions','studio_admin_state'])
  ok(`${role} cannot read ${t}`,/permission denied/.test(await err(`select * from public.${t}`)??''));
 for(const fn of [`select public.studio_auth_gate(array['global'])`,`select public.studio_reorder_items('posts',array[gen_random_uuid()])`,`select public.studio_auth_consume_totp(5)`,`select public.studio_replace_project_media('bike-tower',false,'[]'::jsonb)`])
  ok(`${role} cannot execute ${fn.split('(')[0].replace('select public.','')}`,/permission denied/.test(await err(fn)??''));
 await db.exec('reset role');
}

await db.exec('set role service_role');
const media=async n=>(await one(`insert into public.studio_media(public_id,kind,url,width,height,bytes,format,alt) values($1,'image','https://res.cloudinary.com/demo/image/upload/v1/x.jpg',800,600,1000,'jpg','alt') returning id`,[`portfolio/studio/${String(n).padStart(8,'0')}-1111-4111-8111-111111111111`])).id;
const m1=await media(1),m2=await media(2);
ok('rejects non-Cloudinary media URL',!!await err(`insert into public.studio_media(public_id,kind,url,width,height,bytes,format) values('portfolio/studio/99999999-1111-4111-8111-111111111111','image','https://evil.example/x.jpg',1,1,1,'jpg')`));
ok('rejects a public_id outside portfolio/studio',!!await err(`insert into public.studio_media(public_id,kind,url,width,height,bytes,format) values('other/x','image','https://res.cloudinary.com/demo/image/upload/x.jpg',1,1,1,'jpg')`));
ok('rejects oversized media record',!!await err(`insert into public.studio_media(public_id,kind,url,width,height,bytes,format) values('portfolio/studio/88888888-1111-4111-8111-111111111111','video','https://res.cloudinary.com/demo/video/upload/x.mp4',1,1,300000000,'mp4')`));
ok('rejects non-LinkedIn/Instagram source URL',!!await err(`insert into public.studio_posts(media_id,caption,source_url) values($1,'c','https://evil.example/p')`,[m1]));
ok('rejects javascript: source URL',!!await err(`insert into public.studio_posts(media_id,caption,source_url) values($1,'c','javascript:alert(1)')`,[m1]));
ok('posts are drafts by default',(await one(`insert into public.studio_posts(media_id,caption) values($1,'draft') returning published`,[m1])).published===false);
await db.exec(`delete from public.studio_posts`);
const post=async(caption,order,m)=>(await one(`insert into public.studio_posts(media_id,caption,sort_order) values($1,$2,$3) returning id`,[m,caption,order])).id;
const p1=await post('one',0,m1),p2=await post('two',1,m1),p3=await post('three',2,m2);
ok('media in use cannot be deleted (FK restrict)',/foreign key/.test(await err(`delete from public.studio_media where id=$1`,[m1])??''));
const captions=async()=>(await db.query(`select caption from public.studio_posts order by sort_order`)).rows.map(r=>r.caption).join(',');
await db.query(`select public.studio_move_item('posts',$1,'up')`,[p3]);
ok('move up swaps neighbours',await captions()==='one,three,two',await captions());
await db.query(`select public.studio_move_item('posts',$1,'up')`,[p1]);
ok('move at the edge is a no-op',await captions()==='one,three,two');
await db.query(`select public.studio_reorder_items('posts',$1::uuid[])`,[[p2,p1,p3]]);
ok('reorder applies the full order',await captions()==='two,one,three');
ok('reorder rejects duplicates',!!await err(`select public.studio_reorder_items('posts',$1::uuid[])`,[[p1,p1]]));
ok('reorder rejects unknown ids',!!await err(`select public.studio_reorder_items('posts',$1::uuid[])`,[['00000000-0000-4000-8000-000000000000']]));
ok('reorder rejects other resources',!!await err(`select public.studio_reorder_items('studio_media',$1::uuid[])`,[[p1]]));
ok('move rejects an invalid direction',!!await err(`select public.studio_move_item('posts',$1,'sideways')`,[p1]));
ok('project media: unknown project rejected',!!await err(`select public.studio_replace_project_media('evil',true,'[]'::jsonb)`));
ok('project media: two covers rejected',!!await err(`select public.studio_replace_project_media('bike-tower',true,$1::jsonb)`,[JSON.stringify([{media_id:m1,is_cover:true,alt:'a'},{media_id:m2,is_cover:true,alt:'b'}])]));
ok('project media: duplicate image rejected',!!await err(`select public.studio_replace_project_media('bike-tower',true,$1::jsonb)`,[JSON.stringify([{media_id:m1,is_cover:true,alt:'a'},{media_id:m1,is_cover:false,alt:'a'}])]));
const replaced=await err(`select public.studio_replace_project_media('bike-tower',true,$1::jsonb)`,[JSON.stringify([{media_id:m1,is_cover:true,alt:'a',caption:'c'},{media_id:m2,is_cover:false,alt:'b'}])]);
ok('project media: valid replacement',!replaced,replaced??'');
await db.exec(`update public.studio_media set alt=''`);
ok('project media: enabled selection requires alternative text',!!await err(`select public.studio_replace_project_media('bike-tower',true,$1::jsonb)`,[JSON.stringify([{media_id:m1,is_cover:true,alt:''}])]));
ok('project media: failed replacement kept the previous selection',(await one(`select count(*)::int n from public.studio_project_media where project_id='bike-tower'`)).n===2);

const client='ip:'+'a'.repeat(40),other='ip:'+'b'.repeat(40);
const gate=async keys=>(await one(`select public.studio_auth_gate($1::text[]) g`,[keys])).g;
const failure=async keys=>(await one(`select public.studio_auth_record_failure($1::text[]) l`,[keys])).l;
ok('gate open initially',await gate([client,'global'])===0);
let locked=0;for(let i=0;i<4;i++)locked=await failure([client,'global']);
ok('four failures do not lock',locked===0&&await gate([client,'global'])===0);
locked=await failure([client,'global']);
ok('fifth failure locks the client for 15 minutes',locked===900);
const remaining=await gate([client,'global']);ok('gate reports the remaining lock',remaining>890&&remaining<=900,String(remaining));
ok('another client is not affected by one client lock',await gate([other,'global'])===0);
for(let i=0;i<25;i++)await failure(['ip:'+String(i).padStart(40,'c'),'global']);
ok('30 failures across clients lock everyone (IP rotation defence)',await gate([other,'global'])>0);
ok('throttle refuses raw IP keys',!!await err(`select public.studio_auth_record_failure($1::text[])`,[['192.168.0.1']]));
ok('throttle refuses too many keys',!!await err(`select public.studio_auth_record_failure($1::text[])`,[[client,other,client,other,'global']]));
await db.query(`select public.studio_auth_reset($1)`,[client]);await db.query(`select public.studio_auth_reset('global')`);
ok('reset clears the client but never the global counter',(await one(`select count(*)::int n from public.studio_auth_attempts where key in ($1,'global')`,[client])).n===1);
await db.exec(`update public.studio_auth_attempts set window_started_at=now()-interval '20 minutes', locked_until=null`);
const restarted=await failure([other,'global']);
ok('a failure after the window restarts the count',restarted===0&&(await one(`select failures from public.studio_auth_attempts where key='global'`)).failures===1);

const totp=async step=>(await one(`select public.studio_auth_consume_totp($1) a`,[step])).a;
ok('first TOTP step accepted',await totp(1000)===true);
ok('same TOTP step replay refused',await totp(1000)===false);
ok('older TOTP step refused',await totp(999)===false);
ok('newer TOTP step accepted',await totp(1001)===true);
ok('invalid TOTP step refused',await totp(0)===false);

ok('session longer than 9 hours rejected',!!await err(`insert into public.studio_admin_sessions(expires_at) values(now()+interval '10 hours')`));
const session=(await one(`insert into public.studio_admin_sessions(expires_at) values(now()+interval '8 hours') returning id`)).id;
const active=async id=>(await one(`select count(*)::int n from public.studio_admin_sessions where id=$1 and revoked_at is null and expires_at>now()`,[id])).n===1;
ok('new session active',await active(session));
await db.query(`update public.studio_admin_sessions set revoked_at=now() where id=$1 and revoked_at is null`,[session]);
ok('revoked session inactive',!await active(session));
const pruned=await err(`select public.studio_auth_prune()`);ok('prune runs',!pruned,pruned??'');

const fns=(await db.query(`select p.proname,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'studio_%'`)).rows;
ok('every Studio function is SECURITY INVOKER',fns.length===9&&fns.every(f=>!f.prosecdef),fns.length+' functions');
ok('every Studio function pins an empty search_path',fns.every(f=>(f.proconfig??[]).some(c=>/^search_path=(""|'')$/.test(c))));
ok('RLS enabled on every Studio table',(await one(`select count(*)::int n,bool_and(relrowsecurity) r from pg_class where relname like 'studio_%' and relkind='r'`)).r===true);
await db.exec('reset role');

for(const f of ['202610180001_studio_admin_security.down.sql','202610160001_studio.down.sql']){const e=await err(read('rollback/'+f));ok('rollback '+f,!e,e??'');}
ok('rollback leaves no Studio tables or functions',(await one(`select (select count(*) from pg_class where relname like 'studio_%' and relkind='r')+(select count(*) from pg_proc where proname like 'studio_%') n`)).n==0);
console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);
