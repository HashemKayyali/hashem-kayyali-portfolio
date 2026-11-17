import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './insights.css';
import {isExcluded,setExcluded} from '../analytics/identity';
import {PRESETS,ammanDay,shift} from './dates';

type KN={k:string;n:number};
type Summary={generated_at:string;today:{visitors:number;sessions:number;views:number};week:{visitors:number};month:{visitors:number};range:{visitors:number;sessions:number;views:number};
  series:{k:string;visitors:number;sessions:number;views:number}[];pages:KN[];projects:KN[];sources:KN[];countries:KN[];devices:KN[];langs:KN[];usage:{rows:number;db_bytes:number}};

const LABEL:Record<string,string>={today:'Today',yesterday:'Yesterday',week:'This Week','7d':'Last 7 Days',month:'This Month','30d':'Last 30 Days','90d':'Last 90 Days',custom:'Custom Range'};
const num=(n:number)=>n.toLocaleString('en-US');
const region=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['en'],{type:'region'}):null;
const lang=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['en'],{type:'language'}):null;
const safe=(f:()=>string|undefined,k:string)=>{try{return f()||k;}catch{return k;}};

function Card({title,children,cls=''}:{title:string;children:React.ReactNode;cls?:string}){return <section className={'card '+cls}><h2>{title}</h2>{children}</section>;}
function Bars({rows,label=(k:string)=>k,unit}:{rows:KN[];label?:(k:string)=>string;unit:string}){
  if(!rows.length)return <p className="empty">No data in this range.</p>;
  const max=Math.max(...rows.map(r=>r.n));
  return <ul className="bars">{rows.map(r=><li key={r.k}><span title={label(r.k)}>{label(r.k)}</span><span>{num(r.n)} <small className="sub">{unit}</small></span><span className="bar"><b style={{width:`${(r.n/max)*100}%`}}/></span></li>)}</ul>;
}
function Chart({series,single}:{series:Summary['series'];single:boolean}){
  if(!series.length)return <p className="empty">No data in this range.</p>;
  const W=640,H=220,P=28,max=Math.max(1,...series.flatMap(s=>[s.visitors,s.sessions,s.views]));
  const x=(i:number)=>P+(series.length===1?(W-2*P)/2:(i*(W-2*P))/(series.length-1)),y=(v:number)=>H-P-(v/max)*(H-2*P);
  const colors={views:'var(--p)',sessions:'var(--s)',visitors:'var(--v)'};
  const step=Math.max(1,Math.ceil(series.length/7));
  return <><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Traffic over time: visitors, sessions and page views">
    {[0,.5,1].map(f=><g key={f}><line x1={P} x2={W-P} y1={y(max*f)} y2={y(max*f)} stroke="var(--line)"/><text x={P-6} y={y(max*f)+4} fontSize="10" fill="var(--muted)" textAnchor="end">{Math.round(max*f)}</text></g>)}
    {(['views','sessions','visitors'] as const).map(k=>series.length===1?<circle key={k} cx={x(0)} cy={y(series[0][k])} r="4" fill={colors[k]}/>:<polyline key={k} points={series.map((s,i)=>`${x(i)},${y(s[k])}`).join(' ')} fill="none" stroke={colors[k]} strokeWidth="2"/>)}
    {series.map((s,i)=>i%step===0&&<text key={s.k} x={x(i)} y={H-8} fontSize="10" fill="var(--muted)" textAnchor="middle">{single?s.k+':00':s.k.slice(5)}</text>)}
  </svg><div className="legend"><span><i style={{background:'var(--v)'}}/>Visitors</span><span><i style={{background:'var(--s)'}}/>Sessions</span><span><i style={{background:'var(--p)'}}/>Page views</span></div></>;
}

// Live presence: observer only. It never calls track(), so the dashboard is never counted.
type Live={status:'connecting'|'live'|'offline';visitors:number;connections:number;pages:KN[]};
function useLive():Live{
  const [live,set]=useState<Live>({status:'connecting',visitors:0,connections:0,pages:[]});
  useEffect(()=>{
    let alive=true,stop=()=>{};
    void import('../analytics/presence').then(({realtime,presenceChannel})=>{
      if(!alive)return;
      const client=realtime(),ch=presenceChannel(client);
      const sync=()=>{
        const state=ch.presenceState<{p?:string}>(),keys=Object.keys(state);let conns=0;const pages=new Map<string,number>();
        for(const k of keys){const metas=state[k];conns+=metas.length;const p=metas[metas.length-1]?.p||'/';pages.set(p,(pages.get(p)||0)+1);}
        set({status:'live',visitors:keys.length,connections:conns,pages:[...pages].map(([k,n])=>({k,n})).sort((a,b)=>b.n-a.n)});
      };
      ch.on('presence',{event:'sync'},sync);
      ch.subscribe(s=>{if(s==='SUBSCRIBED')sync();else if(s==='CLOSED'||s==='CHANNEL_ERROR'||s==='TIMED_OUT')set(l=>({...l,status:'offline'}));});
      const online=()=>client.connect();addEventListener('online',online);
      stop=()=>{removeEventListener('online',online);void client.disconnect();};
    }).catch(()=>set(l=>({...l,status:'offline'})));
    return()=>{alive=false;stop();};
  },[]);
  return live;
}

function App(){
  const today=ammanDay();
  const [preset,setPreset]=useState('7d');
  const [custom,setCustom]=useState<[string,string]>([shift(today,-6),today]);
  const [data,setData]=useState<Summary|null>(null);
  const [error,setError]=useState('');
  const [excluded,setEx]=useState(isExcluded());
  const live=useLive();
  const [from,to]=preset==='custom'?custom:PRESETS[preset](today);
  const valid=/^\d{4}-\d{2}-\d{2}$/.test(from)&&/^\d{4}-\d{2}-\d{2}$/.test(to)&&from<=to&&(new Date(to).getTime()-new Date(from).getTime())/864e5<=366;
  const load=useCallback(async(signal?:AbortSignal)=>{
    if(!valid){setError('Choose a valid range of at most 366 days.');return;}
    try{const r=await fetch(`/api/analytics?from=${from}&to=${to}`,{signal});if(!r.ok)throw new Error(String(r.status));setData(await r.json());setError('');}
    catch(e){if((e as Error).name!=='AbortError')setError('Analytics are temporarily unavailable. The portfolio itself is unaffected.');}
  },[from,to,valid]);
  useEffect(()=>{const c=new AbortController();void load(c.signal);const id=setInterval(()=>{if(!document.hidden)void load();},60_000);return()=>{c.abort();clearInterval(id);};},[load]);
  useEffect(()=>{const s=()=>setEx(isExcluded());addEventListener('storage',s);return()=>removeEventListener('storage',s);},[]);
  const single=from===to;
  const dbMB=data?data.usage.db_bytes/1048576:0;
  const countryName=useMemo(()=>(k:string)=>safe(()=>region?.of(k),k),[]);
  const langName=useMemo(()=>(k:string)=>safe(()=>lang?.of(k),k),[]);
  return <main>
    <header><div><h1>Insights</h1><p className="sub">hashemkayyali.com · all dates in Asia/Amman · no login: anyone with this URL can see these aggregates</p></div>
      <button className="toggle" aria-pressed={excluded} onClick={()=>{setExcluded(!excluded);setEx(!excluded);}}>{excluded?'✓ My visits are excluded (this browser)':'Exclude my visits (this browser)'}</button></header>
    <div className="filters" role="group" aria-label="Date range">{Object.keys(LABEL).map(k=><button key={k} aria-pressed={preset===k} onClick={()=>setPreset(k)}>{LABEL[k]}</button>)}</div>
    {preset==='custom'&&<div className="custom"><label>From <input type="date" value={custom[0]} max={custom[1]} onChange={e=>setCustom([e.target.value,custom[1]])}/></label><label>To <input type="date" value={custom[1]} max={today} onChange={e=>setCustom([custom[0],e.target.value])}/></label></div>}
    {error&&<p className="card err" role="alert">{error}</p>}
    <div className="grid">
      <Card title="Online Visitors Now" cls="live"><div className="big">{live.status==='connecting'?'…':num(live.visitors)}</div><p className="note">{live.status==='live'?`${num(live.connections)} open tab${live.connections===1?'':'s'} · realtime`:live.status==='offline'?'Realtime offline: last known value':'Connecting…'}</p></Card>
      <Card title="Visitors Today"><div className="big">{data?num(data.today.visitors):'–'}</div></Card>
      <Card title="Sessions Today"><div className="big">{data?num(data.today.sessions):'–'}</div></Card>
      <Card title="Page Views Today"><div className="big">{data?num(data.today.views):'–'}</div></Card>
      <Card title="Visitors This Week"><div className="big">{data?num(data.week.visitors):'–'}</div><p className="note">Since Monday</p></Card>
      <Card title="Visitors This Month"><div className="big">{data?num(data.month.visitors):'–'}</div></Card>
    </div>
    <div className="cols">
      <Card title={`Traffic over time · ${LABEL[preset]} (${from}${single?'':' → '+to})`} cls="wide">{data&&<Chart series={data.series} single={single}/>}
        {data&&<p className="note">In range: {num(data.range.visitors)} visitors · {num(data.range.sessions)} sessions · {num(data.range.views)} page views</p>}</Card>
      <Card title="Online by current page">{live.status==='connecting'?<p className="empty">Connecting…</p>:<Bars rows={live.pages} unit="visitors"/>}</Card>
      <Card title="Top Pages">{data&&<Bars rows={data.pages} unit="views"/>}</Card>
      <Card title="Top Projects">{data&&<Bars rows={data.projects} unit="views"/>}</Card>
      <Card title="Traffic Sources">{data&&<Bars rows={data.sources} unit="sessions"/>}</Card>
      <Card title="Countries">{data&&(data.countries.length?<Bars rows={data.countries} label={countryName} unit="visitors"/>:<p className="empty">Country is only known when the host provides it.</p>)}</Card>
      <Card title="Devices">{data&&<Bars rows={data.devices} unit="visitors"/>}</Card>
      <Card title="Visitor Language">{data&&<Bars rows={data.langs} label={langName} unit="visitors"/>}</Card>
    </div>
    <div className="cols">
      <Card title="Definitions"><dl><dt>Visitor</dt><dd>One browser (anonymous random id in localStorage). Not a person: a second browser or cleared storage counts again.</dd><dt>Session</dt><dd>A burst of activity in one browser; a new one starts after 30 minutes of inactivity.</dd><dt>Page view</dt><dd>One page shown, including client-side navigation.</dd></dl></Card>
      <Card title="Accuracy and privacy"><p className="note" style={{marginTop:0}}>The live count uses Supabase Realtime Presence: tabs of one browser count as one visitor. A closed tab disappears once the server notices the dropped connection (typically seconds, up to about a minute). No IP address, user agent or referrer URL is stored. Bots and excluded browsers are not counted.</p></Card>
      <Card title="Free-plan usage">{data?<dl><dt>Stored rows</dt><dd>{num(data.usage.rows)}</dd><dt>Database</dt><dd>{dbMB.toFixed(1)} MB of 500 MB ({((dbMB/500)*100).toFixed(1)}%)</dd><dt>Realtime</dt><dd>Free limits: 200 concurrent connections, 2M messages/month</dd><dt>Retention</dt><dd>Rows older than 400 days are pruned automatically</dd></dl>:<p className="empty">Loading…</p>}</Card>
    </div>
    <p className="sub">{data?`Updated ${new Date(data.generated_at).toLocaleTimeString('en-GB',{timeZone:'Asia/Amman'})} Amman time · cached up to ~20 s`:''}</p>
  </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
