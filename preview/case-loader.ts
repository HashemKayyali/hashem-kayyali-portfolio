import type SignatureCaseStudy from './SignatureCaseStudy';
type CaseModule={default:typeof SignatureCaseStudy};
let loaded:CaseModule|undefined;
let pending:Promise<CaseModule>|undefined;
/** Reuse the loaded component synchronously: a resolved import still suspends
 * on React.lazy's first read and briefly exposes the loading footer. */
export function prefetchCaseStudy():Promise<CaseModule> {
 return pending??=(import('./SignatureCaseStudy').then(module=>{loaded=module;return module;}).catch(error=>{pending=undefined;throw error;}));
}
export function loadedCaseStudy(){return loaded?.default;}
