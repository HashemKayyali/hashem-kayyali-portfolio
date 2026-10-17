export function readBrandPalette() {
 const style=getComputedStyle(document.documentElement);
 const read=(name:string)=>style.getPropertyValue(name).trim();
 return {paper:read('--paper'),primary:read('--burgundy'),secondary:read('--burgundy-secondary'),highlight:read('--motion-highlight'),surface:read('--surface'),wine:read('--wine')||read('--burgundy')};
}
export function colorVector(hex:string):[number,number,number] {
 if(hex.startsWith('rgb'))return hex.match(/[\d.]+/g)!.slice(0,3).map(v=>Number(v)/255) as [number,number,number];
 const value=hex.replace('#','');return [0,2,4].map(offset=>parseInt(value.slice(offset,offset+2),16)/255) as [number,number,number];
}
