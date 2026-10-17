import React,{useEffect,useRef,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {useI18n} from '../i18n/useI18n';
import {projectAssets,filterOrder,type ProjectAsset} from '../data/projectAssets';
import type {FilterKey} from '../content/types';
import {ProductImage} from './PortfolioSections';
import {NavLink} from './PageShell';
import {pageCopy} from './page-copy';import {galleryCopy} from './gallery-copy';import {caseCopy} from './case-copy';import {storyCopy} from './story-copy';
import {galleryMemory} from './gallery-memory';import {useGalleryMotion} from './gallery-motion';
import {cancelProjectTransit} from './project-transit';
import type {Navigate,PreviewRoute} from './routes';
import {mediaFrameStyle,productMediaSource} from './media-frame';
import {useGalleryFilterMotion} from './gallery-filter-motion';
const projectOrder=['eventies','bike-tower','basket-beats','terminal-nfc','glitzz-lab','vr-cycling','bike-land-trainer','umniah-youthconnect','financial-operations','outreach-automation','traffic-flow-analytics'];
const ordered=projectOrder.map(id=>projectAssets.find(asset=>asset.id===id)!);
const Exhibit:React.FC<{asset:ProjectAsset;route:PreviewRoute;navigate:Navigate;index:number;filtered:boolean}>=({asset,route,navigate,index,filtered})=>{
 const {t,locale}=useI18n(),copy=t.projects[asset.id];
 const evidence=asset.id==='terminal-nfc'?storyCopy[locale].redacted:['umniah-youthconnect','financial-operations','outreach-automation'].includes(asset.id)?caseCopy[locale].illustration:asset.id==='vr-cycling'?caseCopy[locale].supplied:undefined;
 return <article className={'gallery-exhibit gallery-project--'+asset.id} data-project={filtered?undefined:asset.id} data-flip-id={asset.id} data-filtered={filtered} aria-hidden={filtered}>
  <NavLink className="gallery-project-link" tabIndex={filtered?-1:undefined} aria-label={copy.title+' — '+galleryCopy[locale].view} data-gallery-project={filtered?undefined:asset.id} route={{...route,page:'projects',project:asset.id}} navigate={navigate}>
   <div className="gallery-project-meta"><span className="index" dir="ltr">{String(projectOrder.indexOf(asset.id)+1).padStart(2,'0')}</span><span>{t.projectsSection.filters[asset.categoryKey]}</span><ArrowUpRight className="gallery-link-arrow" size={19} aria-hidden="true"/></div>
   <figure className="gallery-artwork"><div className="gallery-media-mask" style={mediaFrameStyle(productMediaSource(asset))}><div className="gallery-media-depth"><ProductImage asset={asset} full eager={index<3} sizes="(max-width:600px) 92vw, (max-width:1000px) 46vw, 31vw"/></div></div>{evidence&&<figcaption>{evidence}</figcaption>}</figure>
   <div className="gallery-project-copy"><div className="gallery-project-heading"><h2>{copy.title}</h2></div><p>{copy.short}</p><ul className="gallery-technologies">{copy.technology.slice(0,3).map(technology=><li key={technology}><bdi>{technology}</bdi></li>)}</ul><span className="gallery-project-status">{copy.status}</span></div>
  </NavLink>
 </article>;
};
export default function ProjectGallery({route,navigate}:{route:PreviewRoute;navigate:Navigate}){
 const {t,locale}=useI18n(),labels=galleryCopy[locale],root=useRef<HTMLElement>(null);
 const [filter,setFilter]=useState<FilterKey>(()=>{const saved=history.state?.previewGallery;if(saved?.locale===locale)galleryMemory.restore(locale,saved);return galleryMemory.read(locale).filter;});
 useEffect(()=>{const saved=history.state?.previewGallery;if(saved?.locale===locale){galleryMemory.restore(locale,saved);setFilter(galleryMemory.read(locale).filter);}},[route,locale]);
 const visible=ordered.filter(a=>filter==='all'||a.categoryKey===filter);
 useGalleryMotion(root,locale,locale==='ar');
 const prepareFilter=useGalleryFilterMotion(root,filter,locale);
 const choose=(key:FilterKey)=>{if(key===filter)return;cancelProjectTransit();prepareFilter();galleryMemory.setFilter(locale,key);history.replaceState({...history.state,previewGallery:{locale,...galleryMemory.read(locale)}},'');setFilter(key);};
 return <section ref={root} className="project-exhibition atelier-project-index" data-gallery-filter-state={filter} id="projects" aria-labelledby="projects-title">
  <header className="gallery-intro container app-collection-hero"><div className="app-collection-copy"><p className="eyebrow"><span className="brand-dash" aria-hidden="true"/>{pageCopy[locale].nav.projects}<span className="gallery-total" dir="ltr">11</span></p><h1 id="projects-title" tabIndex={-1}>{pageCopy[locale].collection}</h1><div className="gallery-intro-copy"><p>{t.projectsSection.subtitle}</p><a href="#gallery-directory" className="button-primary">{labels.skip}<span aria-hidden="true">↓</span></a></div></div><div className="app-collection-visual" aria-label={t.projectsSection.title}>{ordered.slice(0,3).map((asset,index)=><NavLink key={asset.id} className={`app-cover app-cover--${index}`} data-gallery-index={asset.id} data-project={galleryMemory.read(locale).focus==='index'?asset.id:undefined} route={{...route,page:'projects',project:asset.id}} navigate={navigate} aria-label={t.projects[asset.id].title}><figure className="gallery-artwork"><div className="project-media-primary" style={mediaFrameStyle(productMediaSource(asset))}><ProductImage asset={asset} full eager sizes="(max-width:800px) 65vw, 500px"/></div><figcaption><bdi>0{index+1}</bdi><span>{t.projects[asset.id].title}</span><ArrowUpRight size={16} aria-hidden="true"/></figcaption></figure></NavLink>)}</div></header>
  <div className="gallery-wayfinding container"><div className="gallery-filters" role="group" aria-label={labels.browse}>{filterOrder.map(key=><button key={key} data-gallery-filter={key} aria-pressed={filter===key} onClick={()=>choose(key)}>{t.projectsSection.filters[key]}<span className="filter-count" dir="ltr">{key==='all'?11:projectAssets.filter(a=>a.categoryKey===key).length}</span></button>)}</div><span className="gallery-result-count" role="status" aria-live="polite"><bdi>{String(visible.length).padStart(2,'0')} / 11</bdi></span></div>
  <section className="gallery-collection container" id="gallery-directory" aria-label={pageCopy[locale].allProjects}><div className="gallery-exhibits">{ordered.map((asset,index)=><Exhibit key={asset.id} asset={asset} route={route} navigate={navigate} index={index} filtered={filter!=='all'&&asset.categoryKey!==filter}/>)}</div></section>
 </section>;
}

