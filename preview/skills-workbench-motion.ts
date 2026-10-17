import {useLayoutEffect,useRef,type RefObject} from 'react';
import {gsap} from 'gsap';
import {Flip} from 'gsap/Flip';
import {allowsMotion} from './route-motion';

gsap.registerPlugin(Flip);
/** Bounded category reflow and local evidence reveal. No icon relay or scroll owner. */
export function useSkillsWorkbenchMotion(root:RefObject<HTMLElement|null>,locale:string,category:number,tool:number|null,preview:string|undefined){
 const enabled=useRef(false),pending=useRef<ReturnType<typeof Flip.getState>|null>(null);
 const contexts=useRef(new Map<string,gsap.Context>());
 const dispose=(key:string)=>{contexts.current.get(key)?.revert();contexts.current.delete(key);};
 const settle=()=>{for(const key of [...contexts.current.keys()])dispose(key);pending.current=null;};
 const own=(key:string,create:()=>void)=>{dispose(key);contexts.current.set(key,gsap.context(create,root));};
 const groups=()=>[...(root.current?.querySelectorAll<HTMLElement>('.wb-tool-group:not([hidden])')??[])];
 useLayoutEffect(()=>{
  const element=root.current;if(!element)return;
  const media=matchMedia('(prefers-reduced-motion:no-preference)');
  const configure=()=>{settle();enabled.current=media.matches&&allowsMotion();element.dataset.wbMotion=enabled.current?'interactive':'static';};
  const visibility=()=>{if(document.hidden)settle();};
  media.addEventListener('change',configure);addEventListener('resize',settle,{passive:true});addEventListener('popstate',settle);element.addEventListener('focusin',settle);document.addEventListener('visibilitychange',visibility);configure();
  return()=>{enabled.current=false;settle();media.removeEventListener('change',configure);removeEventListener('resize',settle);removeEventListener('popstate',settle);element.removeEventListener('focusin',settle);document.removeEventListener('visibilitychange',visibility);delete element.dataset.wbMotion;};
 },[locale]);
 useLayoutEffect(()=>{
  const state=pending.current;pending.current=null;if(!enabled.current||!state)return;
  own('layout',()=>{Flip.from(state,{targets:groups(),duration:.42,ease:'power3.inOut',scale:false,onEnter:elements=>gsap.fromTo(elements,{y:8,opacity:.65},{y:0,opacity:1,duration:.3,ease:'power2.out',clearProps:'transform,opacity'})});});
 },[category,locale]);
 useLayoutEffect(()=>{
  dispose('evidence');if(!enabled.current||!root.current)return;
  const target=[...root.current.querySelectorAll<HTMLElement>('.wb-inline-evidence,.wb-project-panel')].find(node=>node.getBoundingClientRect().width>0);
  if(!target||target.contains(document.activeElement))return;
  own('evidence',()=>{gsap.fromTo(target,{y:7,opacity:.65},{y:0,opacity:1,duration:.32,ease:'power3.out',clearProps:'transform,opacity'});});
 },[tool,preview,locale]);
 return {
  captureLayout(){
   if(!enabled.current)return;const state=Flip.getState(groups());settle();pending.current=state;
  },
  captureEvidence(){settle();},
 };
}
