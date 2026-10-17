import React, {useEffect,useRef} from 'react';
import {registerFluid,type FlowLook} from './fluid-renderer';

export default function MotionField({className='',look='fluid'}:{className?:string;look?:FlowLook}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>canvas.current ? registerFluid(canvas.current,look):undefined,[look]);
  return <div className={`motion-field ${className}`} aria-hidden="true" data-look={look} data-motion="offscreen"><canvas className="motion-field__paint" ref={canvas}/></div>;
}
