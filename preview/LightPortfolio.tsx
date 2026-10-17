import React,{useLayoutEffect,useRef,lazy,Suspense} from 'react';
import {useI18n} from '../i18n/useI18n';
import {projectAssets} from '../data/projectAssets';
import {Header,Footer,ReviewExperience} from './PageShell';
import {Skills,ContactPage,NotFound} from './Pages';
import EngineeringHome from './EngineeringHome';
import ProjectGallery from './ProjectGallery';
import {About,Journey} from './ProfileSections';
import {usePortfolioMotion} from './motion';
import {useViewportArrivals} from './viewport-arrivals';
import {skipToContent} from './ui-copy';
import type {Navigate,PreviewRoute} from './routes';
import {prefetchCaseStudy,loadedCaseStudy} from './case-loader';
import AppAtmosphere from './AppAtmosphere';
import SharedHeroPortrait from './SharedHeroPortrait';
import {useOptionalStudioContent} from './StudioProvider';
const LazyCaseStudy=lazy(prefetchCaseStudy);
const StudioGallery=lazy(()=>import('./StudioPages').then(module=>({default:module.StudioGallery})));
const StudioJournal=lazy(()=>import('./StudioPages').then(module=>({default:module.StudioJournal})));
const StudioAdmin=lazy(()=>import('./StudioAdmin').then(module=>({default:module.StudioAdmin})));

export default function LightPortfolio({route,navigate}:{route:PreviewRoute;navigate:Navigate}) {
 useOptionalStudioContent();
 const {locale,t}=useI18n();const root=useRef<HTMLDivElement>(null);const initial=useRef(true);
 usePortfolioMotion(root,`${route.experience??'approved'}:${locale}:${route.page}:${route.project??''}`,locale==='ar');
 useViewportArrivals(root,`${route.experience??'approved'}:${locale}:${route.page}:${route.project??''}`);
 useLayoutEffect(()=>{if(initial.current){initial.current=false;return;}const heading=root.current?.querySelector<HTMLElement>('main h1');heading?.focus({preventScroll:true});},[route.page,route.project]);
 const CaseStudy=loadedCaseStudy()??LazyCaseStudy;
 const HomeView=EngineeringHome;
 const GalleryView=ProjectGallery;
 const asset=projectAssets.find(asset=>asset.id===route.project);
 const content=asset?<Suspense fallback={<main id="main" className="container case-loading"><h1 tabIndex={-1}>{t.projects[asset.id].title}</h1></main>}><CaseStudy asset={asset} route={route} navigate={navigate}/></Suspense>:route.page==='home'?<HomeView route={route} navigate={navigate}/>:route.page==='projects'?<main className="page-content projects-page" id="main" tabIndex={-1}><GalleryView route={route} navigate={navigate}/></main>:route.page==='about'?<main className="page-content about-page" id="main" tabIndex={-1}><About/></main>:route.page==='experience'?<main className="page-content experience-page" id="main" tabIndex={-1}><Journey/></main>:route.page==='skills'?<Skills route={route} navigate={navigate}/>:route.page==='contact'?<ContactPage/>:route.page==='gallery'?<StudioGallery route={route} navigate={navigate}/>:route.page==='journal'?<StudioJournal route={route} navigate={navigate}/>:route.page==='admin'?<StudioAdmin route={route} navigate={navigate}/>:<NotFound route={route} navigate={navigate}/>;
 return <ReviewExperience.Provider value={route.experience}><div ref={root} data-route-project={route.project??undefined} className={`light-portfolio luxury-portfolio atelier-compact atelier-app-shell route--${route.page}${route.experience==='creative'?' creative-lab':''}${route.page==='home'?' homepage-redesign':''}`}><a className="skip-link" href="#main">{skipToContent[locale]} ↓</a><Header route={route} navigate={navigate}/><AppAtmosphere route={route}/><SharedHeroPortrait route={route}/><Suspense fallback={<main id="main" className="container case-loading">{t.identity.name}</main>}><div className="route-stage" key={`${route.experience??'approved'}:${route.page}:${route.project??''}`} data-transition="idle" data-route-ready="pending">{content}</div></Suspense><Footer route={route} navigate={navigate}/></div></ReviewExperience.Provider>;
}
