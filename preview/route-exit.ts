import {gsap} from 'gsap';

/** Pure exit ownership also remains testable without mounting browser routes. */
export function createRouteExit(target:gsap.TweenTarget,commit:()=>void,options:{language?:boolean}={}) {
 let timeline:gsap.core.Timeline;
 const context=gsap.context(()=>{
  timeline=gsap.timeline({id:'route:exit',onComplete:()=>{context.clear();commit();}})
   .to(target,{opacity:0,...(options.language?{}:{y:-8}),duration:options.language ? .18 : .2,ease:'power2.inOut',overwrite:true});
 });
 return {context,timeline:timeline!,dispose:()=>{timeline.kill();context.revert();context.clear();}};
}
