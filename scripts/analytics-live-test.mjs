// Live checks against the real analytics Supabase project using ONLY the public key (what any visitor has).
// Test rows use visitor ids starting "ffffffff-"; remove them afterwards:
//   delete from public.analytics_events where visitor_id like 'ffffffff-%';
import assert from 'node:assert/strict';
import {RealtimeClient} from '@supabase/realtime-js';
import {SUPABASE_URL as U,SUPABASE_PUBLISHABLE_KEY as K,PRESENCE_CHANNEL} from '../analytics/config.ts';
const H={apikey:K,authorization:`Bearer ${K}`,'content-type':'application/json'};
const rpc=(n,b)=>fetch(`${U}/rest/v1/rpc/${n}`,{method:'POST',headers:H,body:JSON.stringify(b)});
const uid=()=>crypto.randomUUID(),vid=()=>'ffffffff-'+uid().slice(9);
const ev=(o={})=>({p_token:'wrong-token',p_id:uid(),p_visitor:vid(),p_session:uid(),p_path:'/en/',p_project:'',p_source:'Direct',p_country:'JO',p_device:'desktop',p_lang:'en',...o});
const results=[];const t=async(name,fn)=>{try{await fn();results.push(['PASS',name]);}catch(e){results.push(['FAIL',name+' :: '+e.message]);}};

await t('anon cannot read raw table',async()=>{const r=await fetch(`${U}/rest/v1/analytics_events?select=*`,{headers:H});assert.ok([401,403,404].includes(r.status)||(r.ok&&(await r.json()).length===0),'status '+r.status);});
await t('anon cannot insert raw rows',async()=>{const r=await fetch(`${U}/rest/v1/analytics_events`,{method:'POST',headers:{...H,prefer:'return=minimal'},body:JSON.stringify({id:uid(),day:'2026-01-01',visitor_id:vid(),session_id:uid(),path:'/',source:'x',device:'desktop',lang:'en'})});assert.ok(r.status>=400,'status '+r.status);});
await t('anon cannot update or delete raw rows',async()=>{for(const m of ['PATCH','DELETE']){const r=await fetch(`${U}/rest/v1/analytics_events?id=neq.00000000-0000-0000-0000-000000000000`,{method:m,headers:H,body:m==='PATCH'?'{"path":"/x"}':undefined});assert.ok(r.status>=400,m+' '+r.status);}});
await t('direct anon track_event is forbidden (token-gated; only /api/analytics holds the token)',async()=>{for(const body of [ev(),{...ev(),p_token:''}]){const r=await rpc('track_event',body);assert.ok(!r.ok,'status '+r.status);}const old=await rpc('track_event',{p_id:uid(),p_visitor:vid(),p_session:uid(),p_path:'/',p_project:'',p_source:'x',p_country:'',p_device:'desktop',p_lang:'en'});assert.ok(!old.ok,'legacy signature must not be callable');});
await t('constraints reject bad input',async()=>{for(const bad of [{p_path:'/x y'},{p_device:'tv'},{p_lang:'EN1'},{p_visitor:'nope'},{p_project:'A B'}])assert.ok(!(await rpc('track_event',ev(bad))).ok,JSON.stringify(bad));});
await t('summary returns only aggregates with expected shape',async()=>{const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Amman'}).format(new Date());const r=await rpc('insights_summary',{p_from:today,p_to:today});assert.ok(r.ok);const s=await r.json();
  for(const k of ['today','week','month','range','series','pages','projects','sources','countries','devices','langs','usage'])assert.ok(k in s,k);assert.ok(s.today.views>=s.today.sessions&&s.today.sessions>=s.today.visitors&&s.today.visitors>=0);
  assert.ok(!JSON.stringify(s).includes('visitor_id'));});
await t('summary rejects reversed and oversized ranges',async()=>{assert.ok(!(await rpc('insights_summary',{p_from:'2026-02-02',p_to:'2026-02-01'})).ok);assert.ok(!(await rpc('insights_summary',{p_from:'2024-01-01',p_to:'2026-01-01'})).ok);});
await t('no other function is exposed to anon',async()=>{const r=await fetch(`${U}/rest/v1/rpc/pg_database_size`,{method:'POST',headers:H,body:'{}'});assert.ok(!r.ok||false);});

// ---- Realtime Presence ----
const rt=()=>new RealtimeClient(U.replace('https','wss')+'/realtime/v1',{params:{apikey:K}});
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
const join=(client,key,onSync)=>new Promise((res,rej)=>{const ch=client.channel(PRESENCE_CHANNEL,{config:{presence:{key}}});if(onSync)ch.on('presence',{event:'sync'},()=>onSync(ch));ch.subscribe(s=>{if(s==='SUBSCRIBED')res(ch);if(s==='CHANNEL_ERROR'||s==='TIMED_OUT')rej(new Error(s));});});
const counts=(ch)=>{const st=ch.presenceState();return {visitors:Object.keys(st).length,conns:Object.values(st).reduce((a,m)=>a+m.length,0)};};
const waitFor=async(fn,ms=15000)=>{const end=Date.now()+ms;let last;while(Date.now()<end){last=fn();if(last.ok)return last;await wait(250);}throw new Error('timeout '+JSON.stringify(last));};
const clients=[];
try{
  const obs=rt();clients.push(obs);const obsCh=await join(obs,'',()=>{});  // observer: never tracks
  const base=counts(obsCh).visitors;
  const A=rt(),A2=rt(),B=rt();clients.push(A,A2,B);
  const keyA='ffffffff-'+uid().slice(9),keyB='ffffffff-'+uid().slice(9);
  const a1=await join(A,keyA),a2=await join(A2,keyA),b=await join(B,keyB);
  await a1.track({p:'/en/'});await a2.track({p:'/en/about/'});await b.track({p:'/en/projects/'});
  await t('presence: 2 visitors / 3 tabs; same browser in 2 tabs counts once',async()=>{await waitFor(()=>{const c=counts(obsCh);return {ok:c.visitors===base+2&&c.conns>=3,c,base};});});
  await t('presence: observer is not counted',async()=>{assert.ok(!('' in obsCh.presenceState())||obsCh.presenceState()[''].length===0);});
  await t('presence: closing one of two tabs keeps the visitor',async()=>{await A2.disconnect();await wait(4000);assert.equal(counts(obsCh).visitors,base+2);});
  await t('presence: closing the last tab removes the visitor',async()=>{await B.disconnect();await waitFor(()=>({ok:counts(obsCh).visitors===base+1,c:counts(obsCh)}),70000);});
  await t('presence: reconnect re-announces',async()=>{A.disconnect();await wait(2000);const A3=rt();clients.push(A3);const c=await join(A3,keyA);await c.track({p:'/en/'});await waitFor(()=>({ok:counts(obsCh).visitors>=base+1,c:counts(obsCh)}));});
}catch(e){results.push(['FAIL','presence setup :: '+e.message]);}
finally{for(const c of clients)try{await c.disconnect();}catch{}}
for(const [s,n] of results)console.log(s,n);
process.exit(results.some(r=>r[0]==='FAIL')?1:0);
