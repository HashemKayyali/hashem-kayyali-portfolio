import React from 'react';
import original from './media-dimensions';
import generated from './v2-media-dimensions';
import {dynamicMediaSize} from './studio-media-registry';
import {cloudinarySrcSet,cloudinaryUrl,isCloudinaryUrl} from './cloudinary-delivery';
import {cdnImage,localFallback} from './static-media';

const dimensions:Record<string,{width:number;height:number}>={...original,...generated};
const stems:Record<string,string>={
 '/projects/the-terminal-nfc/cover.webp':'terminal-cover',
 '/projects/the-terminal-nfc/screenshot-01.webp':'terminal-invoices',
 ...Object.fromEntries([1,2,3,4].map(index=>[`/projects/bike-tower/screenshot-${String(index).padStart(2,'0')}.webp`,`bike-interface-${index}`]))
};
export function mediaVariants(source:string) {
 // Supplied covers: -320/-640/-960 widths sit next to the full image in /covers/.
 if(source.startsWith('/covers/')){const base=source.replace(/\.webp$/,'');return [`${base}-320.webp`,`${base}-640.webp`,`${base}-960.webp`,source].filter(path=>dimensions[path]);}
 const stem=stems[source]??(source.startsWith('concept:')?source.slice(8):undefined);
 return stem ? Object.keys(generated).filter(path=>path.startsWith(`/v2-media/${stem}-`)).sort((a,b)=>dimensions[a].width-dimensions[b].width):[source];
}
export const safeSource=(source:string)=>mediaVariants(source).at(-1)!;
/** The case-opening cover's sizes; the project-flight preload uses the same value so it warms the candidate the case picks. */
export const caseOpeningSizes='(max-width:700px) 92vw, 1160px';
/** src/srcset StoryMedia renders for a local or uploaded (Cloudinary) source. */
export function storySources(source:string) {
 const variants=mediaVariants(source),src=variants.at(-1)!,size=dimensions[src]??dynamicMediaSize(src);
 if(isCloudinaryUrl(src))return {src:cloudinaryUrl(src,1600),srcSet:size?cloudinarySrcSet(src,size.width):undefined};
 return {src,srcSet:variants.length>1 ? variants.map(path=>`${path} ${dimensions[path].width}w`).join(', '):undefined};
}
export const mediaSize=(source:string)=>dimensions[safeSource(source)]??dynamicMediaSize(source);
/** `cdn`: the caller opts in (case-gallery screenshots only); everything else, and every cover, stays local. */
export default function StoryMedia({source,alt,eager=false,priority=false,sizes='(max-width:700px) 90vw, 760px',cdn:useCdn=false}:{source:string;alt:string;eager?:boolean;priority?:boolean;sizes?:string;cdn?:boolean}) {
 const variants=mediaVariants(source),src=variants.at(-1)!,local=storySources(source);
 const cdn=useCdn&&!isCloudinaryUrl(src)?cdnImage(variants,src):undefined;
 const size=dimensions[src]??dynamicMediaSize(src);
 const shared={sizes,width:size?.width,height:size?.height,alt,loading:eager?'eager':'lazy',decoding:'async',fetchPriority:priority?'high':undefined} as const;
 if(cdn)return <img src={cdn.src} srcSet={cdn.srcSet} onError={localFallback(local.src,local.srcSet)} {...shared}/>;
 return <img src={local.src} srcSet={local.srcSet} {...shared}/>;
}
