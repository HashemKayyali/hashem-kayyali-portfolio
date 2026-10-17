import {registerSilk} from './HomeSilk';

// Existing scene labels retain their layout; every field uses the authentic
// shared V1 shader rather than a separate approximate smoke/ribbon renderer.
export type FlowLook='fluid'|'ribbon'|'smoke';
export function registerFluid(canvas:HTMLCanvasElement,_look:FlowLook='fluid'){
 return registerSilk(canvas);
}
