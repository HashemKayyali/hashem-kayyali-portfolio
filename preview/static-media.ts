import type React from 'react';
import {STATIC_MEDIA} from './cloudinary-static';
import {staticAttributes} from './cloudinary-delivery';

/** Build-time switch (not a secret). Off: every image keeps its local path exactly as before. */
const enabled=import.meta.env.VITE_MEDIA_CDN==='cloudinary';

/**
 * Cloudinary src/srcSet for an image whose local markup uses these candidate paths, or undefined
 * (flag off, or any candidate not verified on Cloudinary) so the caller renders its local markup.
 */
export function cdnImage(candidates:string[],src:string){
 if(!enabled)return undefined;
 const entries=candidates.map(path=>STATIC_MEDIA[path]),source=STATIC_MEDIA[src];
 if(!source||entries.some(entry=>!entry))return undefined;
 return staticAttributes(entries.map(entry=>entry!),source);
}

/** One-shot fallback: a failed Cloudinary image switches to the local file and never retries. */
export const localFallback=(src:string,srcSet?:string)=>(event:React.SyntheticEvent<HTMLImageElement>)=>{
 const image=event.currentTarget;if(image.dataset.cdnFallback)return;image.dataset.cdnFallback='local';
 if(import.meta.env.DEV)console.warn('[media] Cloudinary image failed, showing the local file:',src);
 image.srcset=srcSet??'';image.src=src;
};
