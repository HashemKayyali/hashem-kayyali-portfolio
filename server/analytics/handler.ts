import {SITE_HOSTS,SUPABASE_PUBLISHABLE_KEY,SUPABASE_URL} from '../../analytics/config.ts';

const UUID=/^[a-f0-9-]{36}$/,PATH=/^\/[A-Za-z0-9/_.~%-]{0,199}$/,DATE=/^\d{4}-\d{2}-\d{2}$/;
const BOT=/bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget|python-requests/i;
const SEARCH=/(^|\.)(google|bing|duckduckgo|yahoo|ecosia|baidu|yandex|brave|startpage)\./,SOCIAL=/(^|\.)(linkedin|facebook|instagram|twitter|x|t|reddit|youtube|whatsapp|telegram)\.(com|co|me|org)$/;

export const deviceOf=(ua:string)=>/ipad|tablet|(android(?!.*mobile))/i.test(ua)?'tablet':/mobi|iphone|android/i.test(ua)?'mobile':'desktop';
export const sourceOf=(ref:string)=>{
  const h=ref.toLowerCase().replace(/^www\./,'');
  if(!h||SITE_HOSTS.includes(h)||SITE_HOSTS.includes('www.'+h))return 'Direct';
  if(SEARCH.test(h+'.'))return 'Search ('+h.split('.').slice(-2,-1)[0]+')';
  if(h==='github.com')return 'GitHub';
  if(SOCIAL.test(h))return 'Social ('+h.split('.').slice(-2,-1)[0]+')';
  return h.slice(0,60);
};
export const projectOf=(path:string)=>path.match(/\/projects\/([a-z0-9-]{1,60})(?:\/|$)/)?.[1]??'';

const hits=new Map<string,{n:number;t:number}>();
// ponytail: per-instance memory limiter; the database enforces the real per-visitor and global caps.
const limited=(key:string)=>{const now=Date.now(),h=hits.get(key);if(!h||now-h.t>60_000){if(hits.size>5000)hits.clear();hits.set(key,{n:1,t:now});return false;}return ++h.n>60;};

const cfg=()=>({url:process.env.ANALYTICS_SUPABASE_URL||SUPABASE_URL,key:process.env.ANALYTICS_SUPABASE_KEY||SUPABASE_PUBLISHABLE_KEY});
const rpc=async(name:string,args:unknown)=>{const {url,key}=cfg();
  return fetch(`${url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(6000)});};
const json=(status:number,body:unknown,cache='no-store')=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':cache,'x-robots-tag':'noindex, nofollow'}});
const originHost=(r:Request)=>{try{return new URL(r.headers.get('origin')||r.headers.get('referer')||'').hostname;}catch{return '';}};

export async function handle(request:Request):Promise<Response>{
  const url=new URL(request.url);
  if(request.method==='POST'){
    // Not an eligible production visit (preview deploy, localhost, other origin, bot): accept and drop silently.
    const ua=request.headers.get('user-agent')||'';
    if(!SITE_HOSTS.includes(originHost(request))||BOT.test(ua))return new Response(null,{status:204});
    const ip=request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'?';
    if(limited(ip))return json(429,{error:'rate_limited'});
    const text=await request.text();if(text.length>1024)return json(413,{error:'too_large'});
    let b:any;try{b=JSON.parse(text);}catch{return json(400,{error:'bad_json'});}
    const {id,v,s,p,r='',l}=b??{};
    if(![id,v,s].every(x=>typeof x==='string'&&UUID.test(x))||typeof p!=='string'||!PATH.test(p)||p.startsWith('/insights')||typeof r!=='string'||r.length>100||typeof l!=='string')return json(400,{error:'invalid'});
    const country=(request.headers.get('x-vercel-ip-country')||'').toUpperCase();
    // Dedicated write credential (server env only). Without it, fail closed: never write.
    const token=process.env.ANALYTICS_INGEST_TOKEN;if(!token)return new Response(null,{status:503});
    try{
      const res=await rpc('track_event',{p_token:token,p_id:id,p_visitor:v,p_session:s,p_path:p,p_project:projectOf(p),p_source:sourceOf(r),p_country:/^[A-Z]{2}$/.test(country)?country:'',p_device:deviceOf(ua),p_lang:(l.slice(0,2).toLowerCase().match(/^[a-z]{2}$/)?.[0])||'en'});
      return new Response(null,{status:res.ok?204:503});
    }catch{return new Response(null,{status:503});}
  }
  if(request.method==='GET'){
    const from=url.searchParams.get('from')||'',to=url.searchParams.get('to')||'';
    if(!DATE.test(from)||!DATE.test(to))return json(400,{error:'invalid_range'});
    try{
      const res=await rpc('insights_summary',{p_from:from,p_to:to});
      if(!res.ok)return json(res.status===400?400:503,{error:res.status===400?'invalid_range':'unavailable'});
      return json(200,await res.json(),'public, s-maxage=20, stale-while-revalidate=60');
    }catch{return json(503,{error:'unavailable'});}
  }
  return json(405,{error:'method'});
}
