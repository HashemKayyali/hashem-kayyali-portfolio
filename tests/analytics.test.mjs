import test from 'node:test';
import assert from 'node:assert/strict';
import {handle,sourceOf,deviceOf,projectOf} from '../server/analytics/handler.ts';
import {PRESETS,shift} from '../insights/dates.ts';

const id=()=>crypto.randomUUID();
const body=(o={})=>JSON.stringify({id:id(),v:id(),s:id(),p:'/en/projects/eventies/',r:'',l:'en-US',...o});
const post=(b,h={})=>handle(new Request('https://hashemkayyali.com/api/analytics',{method:'POST',body:b,headers:{origin:'https://hashemkayyali.com','user-agent':'Mozilla/5.0 (iPhone) Mobile',...h}}));
const withFetch=async(impl,fn)=>{const orig=globalThis.fetch;globalThis.fetch=impl;try{return await fn();}finally{globalThis.fetch=orig;}};

test('source, device, project classification',()=>{
  assert.equal(sourceOf(''),'Direct');assert.equal(sourceOf('www.hashemkayyali.com'),'Direct');
  assert.equal(sourceOf('www.google.com'),'Search (google)');assert.equal(sourceOf('github.com'),'GitHub');
  assert.equal(sourceOf('www.linkedin.com'),'Social (linkedin)');assert.equal(sourceOf('t.co'),'Social (t)');assert.equal(sourceOf('example.org'),'example.org');
  assert.equal(deviceOf('Mozilla/5.0 (iPhone; CPU) Mobile'),'mobile');assert.equal(deviceOf('Mozilla/5.0 (iPad)'),'tablet');assert.equal(deviceOf('Mozilla/5.0 (Windows NT 10.0)'),'desktop');
  assert.equal(projectOf('/en/projects/terminal-nfc/'),'terminal-nfc');assert.equal(projectOf('/en/about/'),'');
});
test('collect: valid event reaches the RPC with server-derived fields and no IP',async()=>{
  let seen;
  const res=await withFetch(async(u,o)=>{seen={u:String(u),b:JSON.parse(o.body),h:o.headers};return new Response('true');},()=>post(body(),{'x-vercel-ip-country':'jo','x-forwarded-for':'203.0.113.9'}));
  assert.equal(res.status,204);assert.match(seen.u,/\/rpc\/track_event$/);
  assert.equal(seen.b.p_country,'JO');assert.equal(seen.b.p_device,'mobile');assert.equal(seen.b.p_project,'eventies');assert.equal(seen.b.p_lang,'en');
  assert.ok(!JSON.stringify(seen.b).includes('203.0.113.9'));
});
test('collect: wrong origin, preview host, bots are dropped without touching the database',async()=>{
  const trap=async()=>{throw new Error('db touched');};
  await withFetch(trap,async()=>{
    for(const h of [{origin:'https://hk-git-preview.vercel.app'},{origin:'http://localhost:5176'},{origin:''},{'user-agent':'Googlebot/2.1'},{'user-agent':'HeadlessChrome'}])
      assert.equal((await post(body(),h)).status,204);
  });
});
test('collect: invalid payloads are rejected',async()=>{
  await withFetch(async()=>{throw new Error('db touched');},async()=>{
    for(const b of ['not json',body({id:'x'}),body({p:'/bad path'}),body({p:'https://evil'}),body({p:'/insights'}),body({l:5}),body({r:'x'.repeat(200)})])assert.equal((await post(b)).status,400);
    assert.equal((await post('x'.repeat(2000))).status,413);
  });
});
test('collect: database failure surfaces as 503, never throws',async()=>{
  assert.equal((await withFetch(async()=>{throw new Error('down');},()=>post(body()))).status,503);
});
test('summary: validates dates, caches, hides failures',async()=>{
  const get=q=>handle(new Request('https://hashemkayyali.com/api/analytics'+q));
  assert.equal((await get('?from=x&to=y')).status,400);
  const ok=await withFetch(async()=>new Response('{"a":1}'),()=>get('?from=2026-11-01&to=2026-11-02'));
  assert.equal(ok.status,200);assert.match(ok.headers.get('cache-control'),/s-maxage=20/);assert.equal(ok.headers.get('x-robots-tag'),'noindex, nofollow');
  assert.equal((await withFetch(async()=>{throw new Error('down');},()=>get('?from=2026-11-01&to=2026-11-02'))).status,503);
  assert.equal((await handle(new Request('https://hashemkayyali.com/api/analytics',{method:'DELETE'}))).status,405);
});
test('date presets use Monday weeks and Amman boundaries',()=>{
  assert.deepEqual(PRESETS.week('2026-11-18'),['2026-11-16','2026-11-18']); // Wednesday
  assert.deepEqual(PRESETS.week('2026-11-16'),['2026-11-16','2026-11-16']);
  assert.deepEqual(PRESETS.month('2026-03-31'),['2026-03-01','2026-03-31']);
  assert.deepEqual(PRESETS['7d']('2026-03-03'),['2026-02-25','2026-03-03']);
  assert.equal(shift('2026-12-31',1),'2027-01-01');
});
