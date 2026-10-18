// In-memory stand-in for the admin-security tables and RPCs of migration 202610180001
// (sessions, distributed throttle, TOTP replay). Its rules mirror the SQL, which is exercised
// against real PostgreSQL by supabase/tests/migration-contract.mjs.
import {randomUUID} from 'node:crypto';

export function fakeAuthStore(clock=()=>Date.now()){
 const sessions=new Map(),attempts=new Map();let lastStep=null;
 const now=()=>clock();
 const json=(body,status=200)=>new Response(body===null?null:JSON.stringify(body),{status:body===null?204:status,headers:{'content-type':'application/json'}});
 const handle=async(url,init={})=>{
  const u=new URL(url),path=u.pathname.replace('/rest/v1/',''),method=init.method??'GET',body=init.body?JSON.parse(init.body):undefined;
  if(path==='rpc/studio_auth_gate'){let wait=0;for(const key of body.p_keys){const a=attempts.get(key);if(a?.locked&&a.locked>now())wait=Math.max(wait,Math.ceil((a.locked-now())/1000));}return json(wait);}
  if(path==='rpc/studio_auth_record_failure'){let locked=0;for(const key of body.p_keys){if(key!=='global'&&!/^ip:[a-f0-9]{40}$/.test(key))return json({code:'23514'},400);const a=attempts.get(key)??{failures:0,start:now(),locked:null};if(a.start<now()-15*60_000){a.failures=0;a.start=now();}a.failures++;if(a.failures>=(key==='global'?30:5)){a.locked=now()+15*60_000;locked=900;}attempts.set(key,a);}return json(locked);}
  if(path==='rpc/studio_auth_reset'){if(body.p_key!=='global')attempts.delete(body.p_key);return json(null);}
  if(path==='rpc/studio_auth_consume_totp'){const step=body.p_step;if(!(step>=1)||(lastStep!==null&&lastStep>=step))return json(false);lastStep=step;return json(true);}
  if(path==='rpc/studio_auth_prune')return json(null);
  if(path==='studio_admin_sessions'){
   if(method==='POST'){const row={id:randomUUID(),expires_at:body.expires_at,revoked_at:null};sessions.set(row.id,row);return json([row],201);}
   if(method==='GET'){const id=u.searchParams.get('id')?.slice(3),after=Date.parse(u.searchParams.get('expires_at')?.slice(3)??'');const row=sessions.get(id);return json(row&&!row.revoked_at&&Date.parse(row.expires_at)>after?[{id}]:[]);}
   if(method==='PATCH'){const id=u.searchParams.get('id')?.slice(3);const hit=[...sessions.values()].filter(row=>!row.revoked_at&&(!id||row.id===id));hit.forEach(row=>{row.revoked_at=body.revoked_at;});return json(hit);}
  }
  return null;
 };
 return {handle,sessions,attempts};
}
const AUTH=/\/rest\/v1\/(studio_admin_sessions|rpc\/studio_auth_)/;
/** Routes admin-security calls to the store; everything else to the test's own provider mock. */
export function withAuth(store,content=async()=>{throw new Error('Unexpected provider call');}){
 return async(url,init={})=>AUTH.test(String(url))?store.handle(String(url),init):content(url,init);
}
