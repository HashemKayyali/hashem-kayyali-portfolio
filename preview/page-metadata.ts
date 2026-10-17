import type {Dictionary} from '../content/types.ts';
import {LOCALES,LOCALE_META} from '../i18n/config.ts';
import {pageCopy} from './page-copy.ts';
import {previewUrl,type PreviewRoute} from './routes.ts';
import {studioCopy} from './studio-copy.ts';

export function pageMetadata(route:PreviewRoute,t:Dictionary) {
 const title=route.project?t.projects[route.project].title:route.page==='home'?t.identity.name:route.page==='not-found'?pageCopy[route.locale].notFound:['gallery','journal','admin'].includes(route.page)?studioCopy[route.locale][route.page]:pageCopy[route.locale].nav[route.page];
 const description=route.project?t.projects[route.project].overview:route.page==='about'?t.about.subtitle:route.page==='projects'?t.projectsSection.subtitle:route.page==='experience'?t.resume.journeySupport:route.page==='skills'?t.about.toolkitIntro:route.page==='contact'?t.contact.subtitle:route.page==='gallery'?studioCopy[route.locale].galleryDescription:route.page==='journal'?studioCopy[route.locale].journalDescription:route.page==='admin'?studioCopy[route.locale].adminDescription:t.seo.description;
 return {title:route.page==='home'?`${t.seo.title} — Light Burgundy Motion`:`${title} | ${t.identity.name} — Light Burgundy Motion`,description};
}
export function updatePreviewHead(route:PreviewRoute,t:Dictionary) {
 const data=pageMetadata(route,t);document.title=data.title;
 const meta=(name:string,value:string,property=false)=>{const key=property?'property':'name';let element=document.head.querySelector<HTMLMetaElement>(`meta[${key}="${name}"]`);if(!element){element=document.createElement('meta');element.setAttribute(key,name);document.head.append(element);}element.content=value;};
 meta('description',data.description);meta('robots','noindex,nofollow');meta('theme-color','#FCFAF9');
 meta('og:title',data.title,true);meta('og:description',data.description,true);meta('og:type','website',true);meta('og:locale',LOCALE_META[route.locale].ogLocale,true);meta('og:url',new URL(previewUrl(route),location.origin).href,true);
 document.head.querySelectorAll('link[data-preview-alternate]').forEach(link=>link.remove());
 for(const locale of LOCALES){const link=document.createElement('link');link.rel='alternate';link.hreflang=locale;link.href=new URL(previewUrl({...route,locale}),location.origin).href;link.dataset.previewAlternate='';document.head.append(link);}
 let canonical=document.head.querySelector<HTMLLinkElement>('link[rel=canonical]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=new URL(previewUrl(route),location.origin).href;
}
