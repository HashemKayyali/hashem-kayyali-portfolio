import {SITE_HOSTS} from './config';
import {isExcluded,sessionId,visitorId} from './identity';
import {startPresence} from './presence';

let started=false;
const eligible=()=>SITE_HOSTS.includes(location.hostname)&&!navigator.webdriver;
const refHost=()=>{try{return document.referrer?new URL(document.referrer).hostname:'';}catch{return '';}};

/** Page views + live presence. Started once per page load (a module flag survives React Strict Mode remounts). */
export function startTracker(){
  if(started||!eligible())return;started=true;
  let first=true,lastPath="",presence:((p:string)=>void)|undefined;
  const view=()=>{
    const path=location.pathname;
    if(path.startsWith('/insights')||isExcluded())return;
    if(path===lastPath)return;lastPath=path;
    const body=JSON.stringify({id:crypto.randomUUID(),v:visitorId(),s:sessionId(),p:path,r:first?refHost():'',l:navigator.language||'en'});first=false;
    // sendBeacon survives page unload; fetch keepalive is the fallback.
    if(!(navigator.sendBeacon&&navigator.sendBeacon('/api/analytics',new Blob([body],{type:'application/json'}))))void fetch('/api/analytics',{method:'POST',body,keepalive:true,headers:{'content-type':'application/json'}}).catch(()=>{});
    presence?.(path);
  };
  for(const m of ['pushState','replaceState'] as const){const orig=history[m];history[m]=function(this:History,...a:Parameters<History['pushState']>){const r=orig.apply(this,a);queueMicrotask(view);return r;};}
  addEventListener('popstate',view);
  presence=startPresence();
  view();
}
