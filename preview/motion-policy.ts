export type MotionState = 'active' | 'reduced' | 'low-power' | 'hidden' | 'offscreen';
export function motionState({reduced,lowPower,hidden,visible}: {reduced:boolean;lowPower:boolean;hidden:boolean;visible:boolean}): MotionState {
  return reduced ? 'reduced' : lowPower ? 'low-power' : hidden ? 'hidden' : visible ? 'active' : 'offscreen';
}
export const frameDue = (time:number,last:number,fps:number) => time-last >= 1/fps;
export const validRiveHeader = (buffer:ArrayBuffer) => buffer.byteLength > 4 && new Uint8Array(buffer,0,4).every((byte,index)=>byte === [82,73,86,69][index]);
