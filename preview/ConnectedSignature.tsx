import React,{useEffect,useRef,useState} from 'react';
import type {Rive} from '@rive-app/canvas';
import {useI18n} from '../i18n/useI18n';
import {storyCopy} from './story-copy';
import asset from './rive-asset.json';
import {validRiveHeader} from './motion-policy';

export default function ConnectedSignature() {
 const {locale}=useI18n();const copy=storyCopy[locale];
 const [active,setActive]=useState(false),[hover,setHover]=useState(false),[ready,setReady]=useState(false);
 const canvas=useRef<HTMLCanvasElement>(null),instance=useRef<Rive|null>(null);
 useEffect(()=>{
  if(!asset.src||!canvas.current) return;
  const controller=new AbortController();let destroyed=false;
  const motion=matchMedia('(prefers-reduced-motion:reduce)');let visible=false;
  const update=()=>{const rive=instance.current;if(!rive) return;if(motion.matches||document.hidden||!visible)rive.stopRendering();else rive.startRendering();};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();});observer.observe(canvas.current);
  document.addEventListener('visibilitychange',update);motion.addEventListener('change',update);
  void (async()=>{
   try {
    const response=await fetch(asset.src!,{signal:controller.signal});if(!response.ok) throw new Error('Unavailable Rive asset');
    const buffer=await response.arrayBuffer();if(!validRiveHeader(buffer)) throw new Error('Invalid Rive asset');
    const [{Rive,Layout,Fit,RuntimeLoader},{default:wasm}]=await Promise.all([import('@rive-app/canvas'),import('@rive-app/canvas/rive.wasm?url')]);
    if(destroyed) return;
    RuntimeLoader.setWasmUrl(wasm);
    const rive=new Rive({buffer,canvas:canvas.current!,artboard:asset.artboard,stateMachines:asset.stateMachine,autoplay:!motion.matches,layout:new Layout({fit:Fit.Contain}),enableRiveAssetCDN:false,
     onLoad:()=>{if(destroyed) return;const inputs=rive.stateMachineInputs(asset.stateMachine);if(!Object.values(asset.inputs).every(name=>inputs.some(input=>input.name===name))) {rive.cleanup();instance.current=null;return;}rive.resizeDrawingSurfaceToCanvas();setReady(true);update();},
     onLoadError:()=>{setReady(false);rive.cleanup();instance.current=null;}});
    instance.current=rive;
   } catch {if(!destroyed)setReady(false);}
  })();
  const resize=new ResizeObserver(()=>instance.current?.resizeDrawingSurfaceToCanvas());resize.observe(canvas.current);
  return ()=>{destroyed=true;controller.abort();observer.disconnect();resize.disconnect();motion.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);instance.current?.cleanup();instance.current=null;};
 },[]);
 useEffect(()=>{for(const input of instance.current?.stateMachineInputs(asset.stateMachine)??[]) {if(input.name===asset.inputs.hover) input.value=hover;if(input.name===asset.inputs.active) input.value=active;if(input.name===asset.inputs.progress) input.value=active?100:0;}},[active,hover,ready]);
 return <button className="connected-signature" aria-label={copy.activate} aria-pressed={active} data-renderer={ready?'rive':'static-fallback'} data-state={active?'active':hover?'hover':'idle'} onClick={()=>setActive(value=>!value)} onPointerEnter={()=>setHover(true)} onPointerLeave={()=>setHover(false)} onFocus={()=>setHover(true)} onBlur={()=>setHover(false)}>
  <canvas ref={canvas} hidden={!ready} aria-hidden="true" width="360" height="70"/>
  <span className="signature-fallback" hidden={ready} aria-hidden="true"><svg viewBox="0 0 300 32" focusable="false"><path d="M16 16H284" fill="none" stroke="currentColor" strokeWidth="1"/><rect x="5" y="5" width="22" height="22" rx="4"/><path d="m150 4 12 12-12 12-12-12Z"/><circle cx="284" cy="16" r="11"/></svg><span>{copy.nodes.map(node=><span key={node}>{node}</span>)}</span></span>
 </button>;
}
