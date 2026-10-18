/*
 * Studio media is stored as the Cloudinary original (up to 20 MB). Delivery inserts automatic
 * format/quality and a width limit after `/upload/`, so visitors receive a responsive derivative.
 * Non-Cloudinary URLs pass through unchanged.
 */
const CLOUDINARY=/^(https:\/\/res\.cloudinary\.com\/[A-Za-z0-9_-]+\/(image|video)\/upload\/)(.+)$/;
const WIDTHS=[480,800,1200,1600,2000];

export const isCloudinaryUrl=(url:string)=>CLOUDINARY.test(url);

/** Image: f_auto,q_auto,c_limit,w_N. Video: q_auto (the browser picks from the original container). */
export function cloudinaryUrl(url:string,width?:number){
 const match=url.match(CLOUDINARY);if(!match)return url;
 const [,base,kind,rest]=match;
 const transform=kind==='video'?'q_auto':['f_auto','q_auto',...(width?['c_limit','w_'+Math.round(width)]:[])].join(',');
 return base+transform+'/'+rest;
}

/** Responsive candidates no wider than the original. Undefined for non-Cloudinary images. */
export function cloudinarySrcSet(url:string,originalWidth:number){
 if(!CLOUDINARY.test(url)||url.includes('/video/upload/'))return undefined;
 const widths=WIDTHS.filter(width=>width<originalWidth);
 return [...widths,Math.min(originalWidth,2400)].map(width=>`${cloudinaryUrl(url,width)} ${width}w`).join(', ');
}
