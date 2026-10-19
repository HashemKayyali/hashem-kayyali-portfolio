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
export const mediaSize=(source:string)=>dimensions[safeSource(source)]??dynamicMediaSize(source);
/** The case opening image's slot; the project-flight preload uses it to pick the same candidate. */
export const CASE_OPENING_SIZES='(max-width:700px) 92vw, 1160px';
/** src/srcSet for a built-in image: verified Cloudinary delivery when enabled, otherwise the local files. */
export function storySources(source:string){
 const variants=mediaVariants(source),src=variants.at(-1)!;
 const local={src,srcSet:variants.length>1 ? variants.map(path=>`${path} ${dimensions[path].width}w`).join(', '):undefined};
 return {local,cdn:cdnImage(variants,src)};
}
export default function StoryMedia({source,alt,eager=false,sizes='(max-width:700px) 90vw, 760px'}:{source:string;alt:string;eager?:boolean;sizes?:string}) {
 const {local,cdn}=storySources(source),src=local.src;
 const size=dimensions[src]??dynamicMediaSize(src);
 if(isCloudinaryUrl(src))return <img src={cloudinaryUrl(src,1600)} srcSet={size?cloudinarySrcSet(src,size.width):undefined} sizes={sizes} width={size?.width} height={size?.height} alt={alt} loading={eager?'eager':'lazy'} decoding="async"/>;
 if(cdn)return <img src={cdn.src} srcSet={cdn.srcSet} onError={localFallback(local.src,local.srcSet)} sizes={sizes} width={size?.width} height={size?.height} alt={alt} loading={eager?'eager':'lazy'} decoding="async"/>;
 return <img src={src} srcSet={local.srcSet} sizes={sizes} width={size?.width} height={size?.height} alt={alt} loading={eager?'eager':'lazy'} decoding="async"/>;
}
