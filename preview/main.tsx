import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nContext } from '../i18n/LanguageProvider';
import { loadDictionary, createLocaleRequest } from '../i18n/dictionary-loader';
import { directionOf } from '../i18n/config';
import type { Dictionary, Locale } from '../content/types';
import { readRoute, previewUrl, type PreviewRoute } from './routes';
import LightPortfolio from './LightPortfolio';
import './light.css';
import './refinement.css';
import './pages.css';
import './premium-motion.css';
import './brand.css';
import './profile-pages.css';
import './home-art-direction.css';
import './typography.css';
import './project-gallery.css';
import './home-rescue.css';
import './shared-refinement.css';
import './responsive-geometry.css';
import './atelier.css';
import './atelier-compact.css';
import './atelier-quality.css';
import './atelier-stack.css';
import './atelier-exhibition.css';
import './atelier-app-shell.css';
import './atelier-continuity.css';
import './atelier-folios.css';
import './contact-desk.css';
import './about-dossier.css';
import './hero-toolbelt.css';
import './themes.css';
import './home-story.css';
import './surface-refinement.css';
import './skills-workbench.css';
import './responsive-polish.css';
import './studio-navigation.css';
import './compact-layout.css';
import './ui-polish.css';
import {StudioProvider} from './StudioProvider';
import {initializeTheme,cancelThemeTransition} from './themes';
import {updatePreviewHead} from './page-metadata';
import {useRouteExit} from './route-motion';
import {prefetchCaseStudy} from './case-loader';
import {prefetchCreative} from './creative-loader';
import {galleryMemory} from './gallery-memory';
import {prepareProjectTransit} from './project-transit';
import {captureReadingPosition,restoreReadingPosition} from './reading-position';
import {startSmoothScroll,haltSmoothScroll} from './smooth-scroll';
import {startUiMotion} from './ui-motion';

initializeTheme();

function Preview({ initialRoute, dictionary }: { initialRoute: PreviewRoute; dictionary: Dictionary }) {
  const [route, setRoute] = useState(initialRoute);
  const [t, setDictionary] = useState(dictionary);
  const root=useRef<HTMLDivElement>(null);
  const current=useRef(initialRoute);
  const transitioning=useRef(false);
  const intent=useRef(0);
  const readingPosition=useRef<ReturnType<typeof captureReadingPosition>>(undefined);
  const pendingScroll=useRef<{version:number;hash:string;restore?:number[];top?:boolean;languageOnly?:boolean}|null>({version:0,hash:location.hash});
  const exit=useRouteExit(root);
  const request = useMemo(() => createLocaleRequest(), []);
  const navigate = useCallback((next: PreviewRoute, hash = '', push = true) => {
    cancelThemeTransition();haltSmoothScroll();
    const version=++intent.current;
    const previous=current.current;
    const galleryFocus=prepareProjectTransit(previous,next);
    if(previous.page==='projects'&&!previous.project&&next.project){
     galleryMemory.leave(previous.locale,next.project,[scrollX,scrollY],galleryFocus);
     history.replaceState({...history.state,previewGallery:{locale:previous.locale,...galleryMemory.read(previous.locale)}},'');
    }
    const pageChanged=previous.project!==next.project||previous.page!==next.page||previous.experience!==next.experience;
    const languageOnly=!pageChanged&&previous.locale!==next.locale;
    readingPosition.current=languageOnly?captureReadingPosition(root.current):undefined;
    if(languageOnly&&previous.page==='projects'&&!previous.project)galleryMemory.setFilter(next.locale,galleryMemory.read(previous.locale).filter);
    const changed=pageChanged||previous.locale!==next.locale;
    if(push&&!changed&&!hash){transitioning.current=false;exit(()=>scrollTo({top:0,behavior:'instant'}),false);return;}
    const restore=!push?history.state?.previewScroll:languageOnly?[scrollX,scrollY]:previous.project&&next.page==='projects'&&!next.project&&previous.locale===next.locale?galleryMemory.read(next.locale).scroll:undefined;
    if(push)history.replaceState({...history.state,previewScroll:[scrollX,scrollY]},'');
    transitioning.current=changed;
    const fontReady=previous.locale===next.locale?Promise.resolve():Promise.all(next.locale==='ar'?[document.fonts.load('16px Almarai','هاشم'),document.fonts.load('700 16px Almarai','هاشم')]:[document.fonts.load('16px "Libre Caslon Condensed"')]);
    const pageReady=Promise.all([next.project?prefetchCaseStudy():Promise.resolve(),next.experience==='creative'?prefetchCreative():Promise.resolve(),fontReady]).then(()=>true,()=>false);
    void request(next.locale, dictionary => {
     void pageReady.then(ready=>{
      if(version!==intent.current)return;
      if(!ready){transitioning.current=false;return;}
      const commit=()=>{
       if(version!==intent.current)return;
       pendingScroll.current={version,hash,restore,top:pageChanged,languageOnly};
       const stage=root.current?.querySelector<HTMLElement>('.route-stage');if(stage)stage.dataset.routeReady='pending';
       setDictionary(dictionary);setRoute(next);current.current=next;
       if(push)history.pushState({previewScroll:restore??(changed?[0,0]:[scrollX,scrollY]),...(next.page==='projects'&&!next.project?{previewGallery:{locale:next.locale,...galleryMemory.read(next.locale)}}:{})},'',previewUrl(next,hash));
      };
      // Fade only translated surfaces. The smoke canvas remains mounted.
      const portraitContinuation=!previous.project&&!next.project&&previous.locale===next.locale&&previous.page!==next.page&&['home','about'].includes(previous.page)&&['home','about'].includes(next.page);
      const shell=root.current?.querySelector<HTMLElement>('.atelier-app-shell');if(shell)shell.dataset.portraitContinuation=String(portraitContinuation);
      if(shell)shell.dataset.languageTransition=String(languageOnly);
      exit(commit,languageOnly?'language':changed);
     });
    });
  }, [request,exit]);
  useEffect(()=>{const stopScroll=startSmoothScroll(),stopMotion=startUiMotion();return()=>{stopScroll();stopMotion();};},[]);
  useEffect(()=>{
   const previous=history.scrollRestoration;history.scrollRestoration='manual';
   let timer:ReturnType<typeof setTimeout>;
   const save=()=>{clearTimeout(timer);timer=setTimeout(()=>{
    const actual=readRoute(),active=current.current;
    if(!transitioning.current&&actual.locale===active.locale&&actual.page===active.page&&actual.project===active.project&&actual.experience===active.experience)
     history.replaceState({...history.state,previewScroll:[scrollX,scrollY]},'');
   },120);};
   addEventListener('scroll',save,{passive:true});
   return()=>{clearTimeout(timer);removeEventListener('scroll',save);history.scrollRestoration=previous;};
  },[]);
  useEffect(() => {
    const pop = () => navigate(readRoute(), location.hash, false);
    addEventListener('popstate', pop);
    return () => removeEventListener('popstate', pop);
  }, [navigate]);
  useLayoutEffect(() => {
    const languageChanged=document.documentElement.lang!==route.locale;
    document.documentElement.lang = route.locale;
    document.documentElement.dir = directionOf(route.locale);
    updatePreviewHead(route,t);
    if(languageChanged)root.current?.getBoundingClientRect();
  }, [route, t]);
  useLayoutEffect(() => {
    // A cold route can still show the lazy case fallback here. Restore only
    // once its real content and fonts exist, rather than clamping to fallback height.
    let alive=true;
    const apply=()=>{
      if(!alive||!pendingScroll.current||current.current!==route||pendingScroll.current.version!==intent.current)return;
      if(document.fonts.status!=='loaded')return;
      if(route.project&&!root.current?.querySelector('.signature-case'))return;
      if(route.page==='projects'&&!route.project&&pendingScroll.current.restore){
       const saved=history.state?.previewGallery;
       if(saved?.locale===route.locale){
        galleryMemory.restore(route.locale,saved);
        if(root.current?.querySelector('.project-exhibition')?.getAttribute('data-gallery-filter-state')!==galleryMemory.read(route.locale).filter)return;
       }
      }
      const pending=pendingScroll.current;pendingScroll.current=null;observer.disconnect();haltSmoothScroll();
      // Restore the settled route before its first paint. A deferred rAF can
      // briefly expose the new content at the old page's deep scroll position.
      {
        if(!alive||current.current!==route||pending.version!==intent.current)return;
        if(pending.hash){let id=pending.hash.slice(1);try{id=decodeURIComponent(id);}catch{}document.getElementById(id)?.scrollIntoView({behavior:'instant'});}
        else if(pending.languageOnly&&restoreReadingPosition(root.current,readingPosition.current)){}
        else if(pending.restore)scrollTo({left:pending.restore[0],top:pending.restore[1],behavior:'instant'});
        else if(pending.top)scrollTo({top:0,behavior:'instant'});
        if(route.page==='projects'&&!route.project&&pending.restore&&!pending.languageOnly){
         const {origin,focus}=galleryMemory.read(route.locale);
         if(origin)root.current?.querySelector<HTMLElement>(`[${focus==='index'?'data-gallery-index':'data-gallery-project'}="${origin}"]`)?.focus({preventScroll:true});
        }
        if(pending.languageOnly)root.current?.querySelector<HTMLButtonElement>('.language-trigger')?.focus({preventScroll:true});
        const readyStage=root.current?.querySelector<HTMLElement>('.route-stage');if(readyStage)readyStage.dataset.routeReady='ready';
        transitioning.current=false;
      }
    };
    const observer=new MutationObserver(apply);
    if(root.current)observer.observe(root.current,{childList:true,subtree:true});
    if(document.fonts.status==='loaded')apply();
    else void document.fonts.ready.then(()=>{if(alive)apply();});
    return()=>{alive=false;observer.disconnect();};
  }, [route]);
  const value = useMemo(() => ({ locale: route.locale, dir: directionOf(route.locale), t, setLocale: (locale: Locale) => navigate({ ...route, locale }) }), [route, t, navigate]);
  return <I18nContext.Provider value={value}><StudioProvider><div ref={root}><LightPortfolio route={route} navigate={navigate} /></div></StudioProvider></I18nContext.Provider>;
}
const initialRoute = readRoute();
// Fetch the tiny case chunk alongside its dictionary on a cold detail link.
// The first committed layout is the real opening, avoiding a title-only flash.
Promise.all([loadDictionary(initialRoute.locale),initialRoute.project?prefetchCaseStudy():Promise.resolve(),initialRoute.experience==='creative'?prefetchCreative():Promise.resolve()])
  .then(([dictionary]) => createRoot(document.getElementById('root')!).render(<Preview initialRoute={initialRoute} dictionary={dictionary} />))
  .catch(() => { document.getElementById('root')!.textContent = 'Preview unavailable. Please reload.'; });
