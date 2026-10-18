import React,{createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import type {PublicStudio} from '../studio/contracts';
import {studioRequest} from './studio-client';
import {setStudioMediaSnapshot} from './studio-media-registry';

const empty:PublicStudio={configured:false,posts:[],gallery:[],projectMedia:[]};
export type StudioContentState={content:PublicStudio;data:PublicStudio;status:'loading'|'ready'|'setup'|'error';error:string|null;reload:(fresh?:boolean)=>Promise<void>};
const Context=createContext<StudioContentState|null>(null);
export function StudioProvider({children}:{children:React.ReactNode}){
 const [content,setContent]=useState(empty),[status,setStatus]=useState<StudioContentState['status']>('loading'),[error,setError]=useState<string|null>(null),request=useRef<AbortController|null>(null);
 const reload=useCallback(async(fresh=false)=>{request.current?.abort();const controller=new AbortController();request.current=controller;setStatus('loading');setError(null);try{// fresh bypasses the edge cache (honoured only for a signed-in admin).
 const result=await studioRequest<PublicStudio>('public',{signal:controller.signal,...(fresh?{query:{fresh:String(Date.now())}}:{})});if(controller.signal.aborted)return;setStudioMediaSnapshot(result);setContent(result);setStatus(result.configured?'ready':'setup');}catch(cause){if(controller.signal.aborted)return;setError(cause instanceof Error?cause.message:'Studio unavailable');setStatus('error');}},[]);
 useEffect(()=>{void reload();return()=>request.current?.abort();},[reload]);
 return <Context.Provider value={{content,data:content,status,error,reload}}>{children}</Context.Provider>;
}
export function useStudioContent():StudioContentState{const context=useContext(Context);if(!context)throw new Error('StudioProvider is required.');return context;}
export function useOptionalStudioContent():StudioContentState|null{return useContext(Context);}
