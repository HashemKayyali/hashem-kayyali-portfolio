import type {Dictionary,Locale} from '../content/types.ts';
import {LOCALES,LOCALE_META} from '../i18n/config.ts';
import {pageCopy} from './page-copy.ts';
import {previewUrl,type PreviewRoute} from './routes.ts';
import {studioCopy} from './studio-copy.ts';
/** Social card (Sterling edition). A new filename makes X/LinkedIn/Facebook fetch it fresh. */
export const OG_IMAGE='/og-image-sterling.png';

type SeoPage='about'|'projects'|'experience'|'skills'|'contact';
/** Search titles and snippets for the five main pages: the page name first, then the person (facts from content/locales). */
export const SEO_PAGES:Record<Locale,Record<SeoPage,[title:string,description:string]>>={
 en:{
  about:['About Hashem Kayyali — R&D Product Engineer','Hashem Kayyali is an R&D product engineer and software engineer in Amman, Jordan, working across software, embedded systems, IoT and hardware integration.'],
  projects:['Projects — Software, Embedded & IoT | Hashem Kayyali','Eleven case studies by Hashem Kayyali, including Eventies, Glitzz Lab, Bike Tower and VR Cycling, across web, mobile, embedded systems and IoT.'],
  experience:['Experience & Professional Journey | Hashem Kayyali','The professional journey of Hashem Kayyali: Technical Lead at Eventies, R&D product engineering, technical operations at The Terminal VR, and Umniah.'],
  skills:['Skills & Engineering Toolkit | Hashem Kayyali','The skills and tools Hashem Kayyali uses across software, embedded systems, IoT and hardware–software integration, with the projects that put them to work.'],
  contact:['Contact Hashem Kayyali — Email, LinkedIn, WhatsApp','Contact Hashem Kayyali in Amman, Jordan, by email, LinkedIn or WhatsApp about product engineering, software, embedded systems and project work.'],
 },
 ar:{
  about:['نبذة عن هاشم كيالي — مهندس منتجات بحث وتطوير','هاشم كيالي مهندس منتجات بحث وتطوير ومهندس برمجيات في عمّان، الأردن، يعمل في البرمجيات والأنظمة المضمنة وإنترنت الأشياء وتكامل العتاد والبرمجيات.'],
  projects:['المشاريع — البرمجيات والأنظمة المضمنة | هاشم كيالي','إحدى عشرة دراسة حالة لهاشم كيالي، منها Eventies وGlitzz Lab وBike Tower وVR Cycling، في الويب والهاتف والأنظمة المضمنة وإنترنت الأشياء.'],
  experience:['الخبرة والمسيرة المهنية | هاشم كيالي','المسيرة المهنية لهاشم كيالي: قائد تقني في Eventies، وهندسة منتجات البحث والتطوير، والعمليات التقنية في The Terminal VR، وUmniah.'],
  skills:['المهارات وأدوات الهندسة | هاشم كيالي','مهارات هاشم كيالي وأدواته في البرمجيات والأنظمة المضمنة وإنترنت الأشياء وتكامل العتاد والبرمجيات، مع المشاريع التي طُبّقت فيها.'],
  contact:['تواصل مع هاشم كيالي — البريد ولينكدإن وواتساب','تواصل مع هاشم كيالي في عمّان، الأردن، عبر البريد الإلكتروني أو لينكدإن أو واتساب بشأن هندسة المنتجات والبرمجيات والأنظمة المضمنة والمشاريع.'],
 },
 de:{
  about:['Über Hashem Kayyali — Produktentwicklungsingenieur (F&E)','Hashem Kayyali ist Produktentwicklungsingenieur (F&E) und Softwareingenieur in Amman, Jordanien – für Software, eingebettete Systeme, IoT und Hardware.'],
  projects:['Projekte — Software, Embedded & IoT | Hashem Kayyali','Elf Fallstudien von Hashem Kayyali, darunter Eventies, Glitzz Lab, Bike Tower und VR Cycling, aus Web, Mobile, eingebetteten Systemen und IoT.'],
  experience:['Erfahrung & beruflicher Werdegang | Hashem Kayyali','Der Werdegang von Hashem Kayyali: Technischer Leiter bei Eventies, F&E-Produktentwicklung, technischer Betrieb bei The Terminal VR und Umniah.'],
  skills:['Kompetenzen & Engineering-Toolkit | Hashem Kayyali','Kompetenzen und Werkzeuge von Hashem Kayyali für Software, eingebettete Systeme, IoT und Hardware-Software-Integration – mit den passenden Projekten.'],
  contact:['Kontakt zu Hashem Kayyali — E-Mail, LinkedIn, WhatsApp','Kontakt zu Hashem Kayyali in Amman, Jordanien, per E-Mail, LinkedIn oder WhatsApp – zu Produktentwicklung, Software, eingebetteten Systemen und Projekten.'],
 },
 fr:{
  about:['À propos de Hashem Kayyali — Ingénieur produit R&D','Hashem Kayyali est ingénieur produit R&D et ingénieur logiciel à Amman, en Jordanie : logiciel, systèmes embarqués, IoT et intégration matériel–logiciel.'],
  projects:['Projets — logiciel, embarqué et IoT | Hashem Kayyali','Onze études de cas de Hashem Kayyali, dont Eventies, Glitzz Lab, Bike Tower et VR Cycling, entre web, mobile, systèmes embarqués et IoT.'],
  experience:['Parcours et expérience | Hashem Kayyali','Le parcours de Hashem Kayyali : responsable technique chez Eventies, ingénierie produit R&D, opérations techniques chez The Terminal VR, et Umniah.'],
  skills:['Compétences et outils d’ingénierie | Hashem Kayyali','Les compétences et outils de Hashem Kayyali en logiciel, systèmes embarqués, IoT et intégration matériel–logiciel, avec les projets où ils ont servi.'],
  contact:['Contacter Hashem Kayyali — e-mail, LinkedIn, WhatsApp','Contacter Hashem Kayyali à Amman, en Jordanie, par e-mail, LinkedIn ou WhatsApp : ingénierie produit, logiciel, systèmes embarqués et projets.'],
 },
 es:{
  about:['Acerca de Hashem Kayyali — Ingeniero de Producto I+D','Hashem Kayyali es ingeniero de producto I+D e ingeniero de software en Amán, Jordania: software, sistemas embebidos, IoT e integración hardware–software.'],
  projects:['Proyectos — software, embebidos e IoT | Hashem Kayyali','Once casos de estudio de Hashem Kayyali, entre ellos Eventies, Glitzz Lab, Bike Tower y VR Cycling, en web, móvil, sistemas embebidos e IoT.'],
  experience:['Experiencia y trayectoria | Hashem Kayyali','La trayectoria de Hashem Kayyali: responsable técnico en Eventies, ingeniería de producto I+D, operaciones técnicas en The Terminal VR, y Umniah.'],
  skills:['Habilidades y herramientas | Hashem Kayyali','Habilidades y herramientas de Hashem Kayyali en software, sistemas embebidos, IoT e integración hardware–software, con los proyectos donde se aplicaron.'],
  contact:['Contacto con Hashem Kayyali — email, LinkedIn, WhatsApp','Contacta con Hashem Kayyali en Amán, Jordania, por email, LinkedIn o WhatsApp sobre ingeniería de producto, software, sistemas embebidos y proyectos.'],
 },
};

/** Search snippets show about 155 characters: keep whole sentences when possible, else cut at a word. */
export function clampDescription(text:string,max=160){
 const value=text.replace(/\s+/g,' ').trim();if(value.length<=max)return value;
 const sentences=value.match(/[^.!?؟。]+[.!?؟。]+/g)??[];let out='';
 for(const sentence of sentences){if((out+sentence).trim().length>max)break;out+=sentence;}
 if(out.trim().length>=70)return out.trim();
 const cut=value.slice(0,max-1);return cut.slice(0,cut.lastIndexOf(' ')>60?cut.lastIndexOf(' '):cut.length).replace(/[,;:\s]+$/,'')+'…';
}
export function pageMetadata(route:PreviewRoute,t:Dictionary) {
 const title=route.project?t.projects[route.project].title:route.page==='home'?t.identity.name:route.page==='not-found'?pageCopy[route.locale].notFound:['gallery','journal','admin'].includes(route.page)?studioCopy[route.locale][route.page]:pageCopy[route.locale].nav[route.page];
 // Search titles stay short: name plus the first two roles, or page then name.
 const roles=t.identity.role.split('|').slice(0,2).map(part=>part.trim()).join(' · ');
 const description=route.project?t.projects[route.project].short:route.page==='about'?t.about.subtitle:route.page==='projects'?t.projectsSection.subtitle:route.page==='experience'?t.resume.journeySupport:route.page==='skills'?t.about.toolkitIntro:route.page==='contact'?t.contact.subtitle:route.page==='gallery'?`${studioCopy[route.locale].galleryIntro} ${studioCopy[route.locale].galleryDescription}`:route.page==='journal'?`${studioCopy[route.locale].journalIntro} ${studioCopy[route.locale].journalDescription}`:route.page==='admin'?studioCopy[route.locale].adminDescription:t.hero.supporting;
 // The Creative Lab review, the Studio admin and missing pages stay out of search results.
 const robots=route.experience==='creative'||route.page==='admin'||route.page==='not-found'?'noindex,nofollow':'index,follow';
 const seo=!route.project&&route.page in SEO_PAGES[route.locale]?SEO_PAGES[route.locale][route.page as SeoPage]:undefined;
 if(seo)return {title:seo[0],description:clampDescription(seo[1]),robots};
 return {title:route.page==='home'?`${t.identity.name} — ${roles}`:`${title} | ${t.identity.name}`,description:clampDescription(description),robots};
}
export function updatePreviewHead(route:PreviewRoute,t:Dictionary) {
 const data=pageMetadata(route,t);document.title=data.title;
 const meta=(name:string,value:string,property=false)=>{const key=property?'property':'name';let element=document.head.querySelector<HTMLMetaElement>(`meta[${key}="${name}"]`);if(!element){element=document.createElement('meta');element.setAttribute(key,name);document.head.append(element);}element.content=value;};
 meta('description',data.description);meta('robots',data.robots);
 meta('og:title',data.title,true);meta('og:description',data.description,true);meta('og:type','website',true);meta('og:locale',LOCALE_META[route.locale].ogLocale,true);meta('og:url',new URL(previewUrl(route),location.origin).href,true);meta('og:image',new URL(OG_IMAGE,location.origin).href,true);meta('og:site_name',t.identity.name,true);meta('twitter:card','summary_large_image');meta('twitter:title',data.title);meta('twitter:description',data.description);meta('twitter:image',new URL(OG_IMAGE,location.origin).href);
 document.head.querySelectorAll('link[data-preview-alternate]').forEach(link=>link.remove());
 // Same set as the prerendered shell, including x-default (English).
 for(const locale of [...LOCALES,'x-default' as const]){const link=document.createElement('link');link.rel='alternate';link.hreflang=locale;link.href=new URL(previewUrl({...route,locale:locale==='x-default'?'en':locale}),location.origin).href;link.dataset.previewAlternate='';document.head.append(link);}
 let canonical=document.head.querySelector<HTMLLinkElement>('link[rel=canonical]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=new URL(previewUrl(route),location.origin).href;
}
