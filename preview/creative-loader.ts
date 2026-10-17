let request:Promise<typeof import('./CreativeLab')>|undefined;
let loaded:typeof import('./CreativeLab')|undefined;
export const prefetchCreative=()=>request??=(import('./CreativeLab').then(module=>(loaded=module,module)).catch(error=>{request=undefined;throw error;}));
export const loadedCreative=()=>loaded;
