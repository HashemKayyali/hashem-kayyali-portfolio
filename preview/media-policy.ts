/** Raw confidential screenshots stay in the local source archive; V2 serves
 * only approved public media / privacy derivatives. Apply to dev and build. */
export function withheldMedia(pathname:string) {
 // Vite decodes paths and exposes /public and /@fs aliases in development.
 // Apply the same policy before any of those forms reaches its static handler.
 let decoded=pathname;
 try{for(let i=0;i<4;i++){const next=decodeURIComponent(decoded);if(next===decoded)break;decoded=next;}}
 catch{return true;}
 const segments:string[]=[];
 for(const segment of decoded.replaceAll('\\','/').split('/')){if(segment==='..')segments.pop();else if(segment&&segment!=='.')segments.push(segment);}
 const canonical='/'+segments.join('/').toLowerCase();
 if(canonical.includes('/output/checkpoints/')||canonical.includes('/archive/')||canonical.endsWith('/archive'))return true;
 const index=canonical.lastIndexOf('/projects/');
 const resource=index>=0?canonical.slice(index):canonical;
 return /^\/projects\/(umniah-youthconnect|the-terminal-nfc)\//.test(resource)
  || /^\/projects\/glitzz-lab\/(?:thumbs\/)?screenshot-0[67](?:[-.]|$)/.test(resource)
  || /^\/projects\/bike-tower\/(?:thumbs\/)?screenshot-0[1-4](?:[-.]|$)/.test(resource);
}
