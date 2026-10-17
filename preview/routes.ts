import { isLocale } from '../i18n/config.ts';
import type { Locale, ProjectId } from '../content/types';
import { projectAssets } from '../data/projectAssets.ts';

export const CORE_PAGES = ['home','about','projects','experience','skills','contact'] as const;
export const PAGES = [...CORE_PAGES,'gallery','journal','admin'] as const;
export type PreviewPage = (typeof PAGES)[number] | 'not-found';
export interface PreviewRoute { locale: Locale; page:PreviewPage; project?: ProjectId; experience?:'creative' }
export type Navigate = (route: PreviewRoute, hash?: string, push?: boolean) => void;
export const parsePreviewRoute = (url:string):PreviewRoute => {
  const {pathname,searchParams,hash}=new URL(url);
  const parts=pathname.replace(/^\/preview\/?/,'').split('/').filter(Boolean);
  const experience=parts[0]==='creative'?(parts.shift(),{experience:'creative' as const}):{};
  const queryLocale=searchParams.get('lang');
  const localized=isLocale(parts[0]);
  const locale=localized ? parts.shift() as Locale:isLocale(queryLocale)?queryLocale:'en';
  const segment=parts.shift();
  const legacy:Record<string,PreviewPage>={'#about':'about','#resume':'experience','#capabilities':'skills','#contact':'contact','#projects':'projects'};
  const page=(!segment||segment==='index.html')?(!localized?legacy[hash]??'home':'home'):PAGES.includes(segment as (typeof PAGES)[number])?segment as PreviewPage:'not-found';
  const slug=parts.shift()??searchParams.get('project');
  const project=projectAssets.find(asset=>asset.id===slug)?.id;
  if(parts.length||page==='not-found'||(slug&&(!project||(segment&&page!=='projects')))) return {locale,page:'not-found',...experience};
  return project?{locale,page:'projects',project,...experience}:{locale,page,...experience};
};
export const readRoute = (): PreviewRoute => parsePreviewRoute(window.location.href);
export const previewUrl = (route: PreviewRoute, hash = '') => {
  const path=route.project ? `projects/${route.project}/`:route.page==='home'?'':`${route.page}/`;
  return `/preview/${route.experience==='creative'?'creative/':''}${route.locale}/${path}${hash}`;
};
