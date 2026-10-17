import type {Dictionary} from '../content/types.ts';
import {LOCALES,LOCALE_META} from '../i18n/config.ts';
import {pageCopy} from './page-copy.ts';
import {previewUrl,type PreviewRoute} from './routes.ts';
import {studioCopy} from './studio-copy.ts';
/** Social card (Sterling edition). A new filename makes X/LinkedIn/Facebook fetch it fresh. */
export const OG_IMAGE='/og-image-sterling.png';

export function pageMetadata(route:PreviewRoute,t:Dictionary) {
 const title=route.project?t.projects[route.project].title:route.page==='home'?t.identity.name:route.page==='not-found'?pageCopy[route.locale].notFound:['gallery','journal','admin'].includes(route.page)?studioCopy[route.locale][route.page]:pageCopy[route.locale].nav[route.page];
 // Search titles stay short: name plus the first two roles, or page then name.
 const roles=t.identity.role.split('|').slice(0,2).map(part=>part.trim()).join(' · ');
 const description=route.project?t.projects[route.project].overview:route.page==='about'?t.about.subtitle:route.page==='projects'?t.projectsSection.subtitle:route.page==='experience'?t.resume.journeySupport:route.page==='skills'?t.about.toolkitIntro:route.page==='contact'?t.contact.subtitle:route.page==='gallery'?studioCopy[route.locale].galleryDescription:route.page==='journal'?studioCopy[route.locale].journalDescription:route.page==='admin'?studioCopy[route.locale].adminDescription:t.hero.supporting;
 // The Creative Lab review, the Studio admin and missing pages stay out of search results.
 const robots=route.experience==='creative'||route.page==='admin'||route.page==='not-found'?'noindex,nofollow':'index,follow';
 return {title:route.page==='home'?`${t.identity.name} — ${roles}`:`${title} | ${t.identity.name}`,description,robots};
}
export function updatePreviewHead(route:PreviewRoute,t:Dictionary) {
 const data=pageMetadata(route,t);document.title=data.title;
 const meta=(name:string,value:string,property=false)=>{const key=property?'property':'name';let element=document.head.querySelector<HTMLMetaElement>(`meta[${key}="${name}"]`);if(!element){element=document.createElement('meta');element.setAttribute(key,name);document.head.append(element);}element.content=value;};
 meta('description',data.description);meta('robots',data.robots);
 meta('og:title',data.title,true);meta('og:description',data.description,true);meta('og:type','website',true);meta('og:locale',LOCALE_META[route.locale].ogLocale,true);meta('og:url',new URL(previewUrl(route),location.origin).href,true);meta('og:image',new URL(OG_IMAGE,location.origin).href,true);meta('og:site_name',t.identity.name,true);meta('twitter:card','summary_large_image');meta('twitter:title',data.title);meta('twitter:description',data.description);meta('twitter:image',new URL(OG_IMAGE,location.origin).href);
 document.head.querySelectorAll('link[data-preview-alternate]').forEach(link=>link.remove());
 for(const locale of LOCALES){const link=document.createElement('link');link.rel='alternate';link.hreflang=locale;link.href=new URL(previewUrl({...route,locale}),location.origin).href;link.dataset.previewAlternate='';document.head.append(link);}
 let canonical=document.head.querySelector<HTMLLinkElement>('link[rel=canonical]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=new URL(previewUrl(route),location.origin).href;
}
