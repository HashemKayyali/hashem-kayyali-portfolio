import {useGSAP} from '@gsap/react';
import {gsap} from 'gsap';
import {useCallback,useRef,type RefObject} from 'react';
import {runProjectTransit} from './project-transit';
import {createRouteExit} from './route-exit';
export {createRouteExit} from './route-exit';

gsap.registerPlugin(useGSAP);
export function allowsMotion() {
 const device=navigator as Navigator & {connection?:{saveData?:boolean};deviceMemory?:number};
 return !matchMedia('(prefers-reduced-motion: reduce)').matches&&!device.connection?.saveData&&(device.deviceMemory??8)>2&&navigator.hardwareConcurrency>2;
}
/** Persistent header remains usable; latest route intent wins. */
export function useRouteExit(root:RefObject<HTMLDivElement|null>) {
 const active=useRef<{context:gsap.Context;dispose:()=>void}|null>(null);
 useGSAP(()=>()=>{active.current?.dispose();active.current=null;}, {scope:root});
 // Each event creates a disposable context, outside the persistent hook's context.
 return useCallback((commit:()=>void,animate:boolean|'language'=true)=>{
  active.current?.dispose();active.current=null;
  const stage=root.current?.querySelector<HTMLElement>('.route-stage');
  if(!stage||!animate||!allowsMotion()) {
   if(stage){stage.inert=false;stage.dataset.transition='idle';gsap.set([stage,...root.current!.querySelectorAll('.header-layout,.shared-hero-portrait,.compact-footer')],{clearProps:'opacity,transform'});}
   active.current=null;commit();return;
  }
  stage.dataset.transition='exit';stage.inert=true;
  const language=animate==='language';
  const shared=language?null:runProjectTransit(stage,commit,()=>{if(active.current===shared)active.current=null;});
  if(shared){active.current=shared;return;}
  const targets=language?[stage,...root.current!.querySelectorAll('.header-layout,.shared-hero-portrait,.compact-footer')]:stage;
  active.current=createRouteExit(targets,()=>{stage.inert=false;active.current=null;commit();},{language});
 },[root]);
}
