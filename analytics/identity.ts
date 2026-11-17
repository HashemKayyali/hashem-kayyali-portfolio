import {EXCLUDE_KEY} from './config';
const VID='hk_vid',SES='hk_ses',IDLE=30*60_000;
const read=(k:string)=>{try{return localStorage.getItem(k);}catch{return null;}};
const write=(k:string,v:string)=>{try{localStorage.setItem(k,v);}catch{}};
const uuid=()=>crypto.randomUUID();
/** Excluding is a per-browser flag in localStorage, so every tab of this browser shares it. */
export const isExcluded=()=>read(EXCLUDE_KEY)==='1';
export const setExcluded=(on:boolean)=>{try{on?localStorage.setItem(EXCLUDE_KEY,'1'):localStorage.removeItem(EXCLUDE_KEY);}catch{}};
export const visitorId=()=>{let v=read(VID);if(!v||!/^[a-f0-9-]{36}$/.test(v)){v=uuid();write(VID,v);}return v;};
/** A session ends after 30 minutes without an event; the timestamp is shared by all tabs. */
export const sessionId=(now=Date.now())=>{
  let s:{id:string;t:number}|null=null;try{s=JSON.parse(read(SES)||'null');}catch{}
  if(!s||typeof s.id!=='string'||!/^[a-f0-9-]{36}$/.test(s.id)||now-s.t>IDLE)s={id:uuid(),t:now};
  s.t=now;write(SES,JSON.stringify(s));return s.id;
};
