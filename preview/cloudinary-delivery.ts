/*
 * Studio media is stored as the Cloudinary original (up to 20 MB). Delivery inserts automatic
 * format/quality and a width limit after `/upload/`, so visitors receive a responsive derivative.
 * Non-Cloudinary URLs pass through unchanged.
 */
const CLOUDINARY=/^(https:\/\/res\.cloudinary\.com\/[A-Za-z0-9_-]+\/(image|video)\/upload\/)(.+)$/;
// Includes the local 320/640/960 steps so Cloudinary never has to jump past a size the local files offered.
const WIDTHS=[320,480,640,800,960,1200,1600,2000];

export const isCloudinaryUrl=(url:string)=>CLOUDINARY.test(url);
/** `auto` is q_auto (default for everything); `eco` only for static assets that passed the eco gate. */
export type CloudinaryQuality='auto'|'eco';
/** `auto` negotiates per browser (Studio media). Static assets pin WebP: f_auto chose JPEG at small widths and
 * JPEG XL on current Chrome, which was larger and decoded several times slower in the A/B measurements. */
export type CloudinaryFormat='auto'|'webp';

/** Image: f_auto,q_auto,c_limit,w_N. Video: q_auto (the browser picks from the original container). */
export function cloudinaryUrl(url:string,width?:number,quality:CloudinaryQuality='auto',format:CloudinaryFormat='auto'){
 const match=url.match(CLOUDINARY);if(!match)return url;
 const [,base,kind,rest]=match,q=quality==='eco'?'q_auto:eco':'q_auto';
 const transform=kind==='video'?q:['f_'+format,q,...(width?['c_limit','w_'+Math.round(width)]:[])].join(',');
 return base+transform+'/'+rest;
}

/** Responsive candidates no wider than the original. Undefined for non-Cloudinary images. */
export function cloudinarySrcSet(url:string,originalWidth:number,quality:CloudinaryQuality='auto',format:CloudinaryFormat='auto'){
 if(!CLOUDINARY.test(url)||url.includes('/video/upload/'))return undefined;
 const widths=WIDTHS.filter(width=>width<originalWidth);
 return [...widths,Math.min(originalWidth,2400)].map(width=>`${cloudinaryUrl(url,width,quality,format)} ${width}w`).join(', ');
}

/** Hybrid routing: only case-gallery screenshots use Cloudinary. Covers (opening and slide 1), cards, the flight,
 * process art, branding and every LCP image stay local until Cloudinary is measured at least as fast for them. */
export const cdnRoutable=(path:string)=>/^\/projects\/[a-z0-9-]+\/screenshot-\d{2}\.webp$/.test(path);

export interface StaticCandidate {url:string;width:number;quality:CloudinaryQuality;variantWidth:number}
/**
 * The same image a local <img> would show, delivered from Cloudinary. One source image gets the full
 * width ladder; mixed sources (a card crop next to the full cover) keep each local candidate's
 * composition and width, so the picture never changes with screen density.
 */
export function staticAttributes(candidates:StaticCandidate[],src:StaticCandidate){
 if(new Set(candidates.map(c=>c.url)).size===1)return {src:cloudinaryUrl(src.url,src.variantWidth,src.quality,'webp'),srcSet:cloudinarySrcSet(src.url,src.width,src.quality,'webp')};
 return {src:cloudinaryUrl(src.url,src.variantWidth,src.quality,'webp'),srcSet:candidates.map(c=>`${cloudinaryUrl(c.url,c.variantWidth,c.quality,'webp')} ${c.variantWidth}w`).join(', ')};
}
