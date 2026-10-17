import React,{useEffect,useRef,useState} from 'react';
import {useI18n} from '../i18n/useI18n';
import {projectAssets,filterOrder,type ProjectAsset} from '../data/projectAssets';
import {PROFILE_IMAGE,RESUME_PDF} from '../data/profile';
import type {FilterKey} from '../content/types';
import {NavLink} from './PageShell';
import {ProductImage,featuredIds} from './PortfolioSections';
import HomeSilk from './HomeSilk';
import {pageCopy} from './page-copy';
import {galleryCopy} from './gallery-copy';
import {caseCopy} from './case-copy';
import {storyCopy} from './story-copy';
import {useHomeMotion} from './home-motion';
import {useFeaturedMotion} from './motion';
import {useGalleryMotion} from './gallery-motion';
import {galleryMemory} from './gallery-memory';
import {cancelProjectTransit} from './project-transit';
import type {Navigate,PreviewRoute} from './routes';
import './creative-lab.css';

type Props={route:PreviewRoute;navigate:Navigate};
const Arrow=()=> <span className="arrow" aria-hidden="true">↗</span>;
const selected=featuredIds.map(id=>projectAssets.find(asset=>asset.id===id)!);
const exhibitionOrder=['bike-tower','basket-beats','vr-cycling','bike-land-trainer','eventies','glitzz-lab','terminal-nfc','umniah-youthconnect','financial-operations','outreach-automation','traffic-flow-analytics'];
const labCopy={
 en:{physical:'Connected products',software:'Software & systems',edition:'Engineering exhibition',selected:'Selected projects'},
 ar:{physical:'منتجات متصلة',software:'برمجيات وأنظمة',edition:'معرض هندسة المنتجات',selected:'مشاريع مختارة'},
 de:{physical:'Vernetzte Produkte',software:'Software & Systeme',edition:'Ausstellung der Produktentwicklung',selected:'Ausgewählte Projekte'},
 fr:{physical:'Produits connectés',software:'Logiciels et systèmes',edition:'Exposition d’ingénierie produit',selected:'Projets sélectionnés'},
 es:{physical:'Productos conectados',software:'Software y sistemas',edition:'Exposición de ingeniería de producto',selected:'Proyectos seleccionados'}
};
function Evidence({asset}:{asset:ProjectAsset}){
 const {locale}=useI18n();const label=asset.id==='terminal-nfc'?storyCopy[locale].redacted:['umniah-youthconnect','financial-operations','outreach-automation'].includes(asset.id)?caseCopy[locale].illustration:asset.id==='vr-cycling'?caseCopy[locale].supplied:undefined;
 return label?<figcaption>{label}</figcaption>:null;
}
const CreativeFeature:React.FC<{asset:ProjectAsset;index:number}&Props>=({asset,route,navigate,index})=>{
 const {t,locale}=useI18n(),copy=t.projects[asset.id],root=useRef<HTMLElement>(null);
 useFeaturedMotion(root,`${asset.id}:${locale}`,locale==='ar',true);
 return <article ref={root} className={`lab-feature lab-feature--${asset.id}`} data-project={asset.id}>
  <NavLink className="project-destination lab-feature-link" route={{...route,page:'projects',project:asset.id}} navigate={navigate}>
   <div className="lab-feature-visual project-visual"><figure className="lab-media gallery-artwork"><div className="lab-window-label" aria-hidden="true"><span dir="ltr">HK / {String(index+1).padStart(2,'0')}</span><span>{t.projectsSection.filters[asset.categoryKey]}</span></div><div className="project-media-reveal"><div className="project-image-depth"><ProductImage asset={asset} full sizes="(max-width:800px) 94vw, 65vw"/></div></div><Evidence asset={asset}/></figure></div>
   <div className="spotlight-copy lab-feature-copy"><div className="project-meta"><span className="index" dir="ltr">0{index+1} / 03</span><span>{t.projectsSection.filters[asset.categoryKey]}</span></div><h3>{copy.title}</h3><p>{copy.short}</p><ul className="project-technical">{copy.technology.slice(0,4).map(technology=><li key={technology}><bdi>{technology}</bdi></li>)}</ul><div className="project-bottom"><span>{copy.status}</span><span className="project-action">{t.actions.viewProject}<Arrow/></span></div></div>
  </NavLink>
 </article>;
}

export function CreativeHome({route,navigate}:Props){
 const {t,locale}=useI18n(),copy=pageCopy[locale],labels=labCopy[locale],root=useRef<HTMLElement>(null);
 useHomeMotion(root,locale,locale==='ar');
 const [role,software,...scope]=t.identity.role.split(' | ');
 return <main ref={root} id="main" className="lab-home" tabIndex={-1}>
  <section className="hero lab-hero" aria-labelledby="hero-title" id="home"><div className="container hero-layout lab-hero-grid">
   <div className="hero-copy"><p className="eyebrow"><span className="brand-dash" aria-hidden="true"/>{t.contact.eyebrow}</p><h1 id="hero-title" tabIndex={-1}>{t.identity.name.split(' ').map((part,index)=><React.Fragment key={part}>{index>0&&' '}<span className="hero-name-mask"><span className={`hero-name-part hero-name-part--${index}`}>{part}</span></span></React.Fragment>)}</h1><p className="hero-role"><span className="hero-role-mask"><span className="hero-role-primary">{role}</span></span><span className="hero-role-mask"><span className="hero-role-secondary">{software}</span></span></p><p className="hero-scope">{scope.join(' · ')}</p><p className="hero-statement">{t.hero.headline}</p><div className="actions"><NavLink className="button-primary" route={{...route,page:'projects',project:undefined}} navigate={navigate}>{t.hero.actions.viewProjects}<Arrow/></NavLink><a className="button-text" href={RESUME_PDF} target="_blank" rel="noopener noreferrer">{t.hero.actions.downloadResume}<span aria-hidden="true">↓</span></a></div><p className="hero-location"><span className="location-dot" aria-hidden="true"/>{t.identity.location}</p></div>
   <figure className="portrait"><HomeSilk className="hero-field"/><span className="portrait-edition" dir="ltr" aria-hidden="true">HK / R&amp;D</span><div className="portrait-reveal"><div className="portrait-frame"><img src={PROFILE_IMAGE} width="720" height="1280" fetchPriority="high" loading="eager" decoding="async" alt={t.ui.alt.profile}/><span className="portrait-rule" aria-hidden="true"/></div></div><figcaption><span>{t.identity.name}</span><span>{t.about.engineeringFocus[2]}</span></figcaption></figure>
   <aside className="lab-evidence-rail" aria-label={labels.selected}><p className="index">{labels.selected}<span dir="ltr"> / 03</span></p>{selected.map(asset=><NavLink key={asset.id} className="lab-proof" route={{...route,page:'projects',project:asset.id}} navigate={navigate}><div className="lab-proof-image"><ProductImage asset={asset} sizes="(min-width:1900px) 160px, 100px"/></div><div><span className="lab-proof-title">{t.projects[asset.id].title}<Arrow/></span><span className="lab-proof-category">{t.projectsSection.filters[asset.categoryKey]}</span></div></NavLink>)}</aside>
  </div></section>
  <section className="container lab-statement home-about" aria-labelledby="lab-focus-title"><span className="home-section-rule" aria-hidden="true"/><div><span className="index">01 / {t.about.engineeringFocusTitle}</span><h2 id="lab-focus-title">{t.about.title}</h2><NavLink className="button-text" route={{...route,page:'about',project:undefined}} navigate={navigate}>{copy.readMore}<Arrow/></NavLink></div><div><p>{t.hero.supporting}</p><ul className="focus-strip">{t.about.engineeringFocus.map(focus=><li key={focus}>{focus}</li>)}</ul></div></section>
  <section className="container home-projects lab-selected" id="projects" aria-labelledby="home-projects-title"><header className="page-section-title"><span className="home-section-rule" aria-hidden="true"/><div><span className="index">02 / {labels.edition}</span><h2 id="home-projects-title">{t.projectsSection.title}</h2></div><NavLink className="button-text" route={{...route,page:'projects',project:undefined}} navigate={navigate}>{copy.allProjects}<bdi>11</bdi><Arrow/></NavLink></header><div className="lab-features">{selected.map((asset,index)=><CreativeFeature key={asset.id} asset={asset} route={route} navigate={navigate} index={index}/>)}</div></section>
  <section className="container home-bottom lab-practice" aria-label={copy.highlights}><div className="career-summary"><span className="index">03 / {copy.nav.experience}</span><h2>{copy.highlights}</h2><ol>{t.resume.experience.slice(0,3).map(entry=>{const current=entry.roles?.[0];return <li key={entry.id}><p className="career-company">{entry.company}</p><h3>{current?.title??entry.role}</h3><p className="career-period">{current?.period??entry.period} · {current?.employment??entry.employment}</p></li>;})}</ol><NavLink className="button-text" route={{...route,page:'experience',project:undefined}} navigate={navigate}>{t.resume.journeyTitle}<Arrow/></NavLink></div><div className="home-toolkit"><span className="index">04 / {copy.nav.skills}</span><h2>{copy.selectedSkills}</h2><p>{t.about.toolkitIntro}</p><ul className="lab-capabilities">{t.about.skillCategories.slice(0,4).map((category,index)=><li key={category}><span dir="ltr">0{index+1}</span><div><h3>{category}</h3><p>{t.about.skills[index].slice(0,3).join(' · ')}</p></div></li>)}</ul><NavLink className="button-text" route={{...route,page:'skills',project:undefined}} navigate={navigate}>{t.about.toolkitTitle}<Arrow/></NavLink></div></section>
  <section className="home-invitation lab-invitation"><HomeSilk className="contact-field"/><div className="container"><span className="index">05 / {t.contact.title}</span><h2>{t.contact.heading}</h2><p>{t.contact.supporting}</p><NavLink className="button-primary" route={{...route,page:'contact',project:undefined}} navigate={navigate}>{copy.nav.contact}<Arrow/></NavLink></div></section>
 </main>;
}

const CreativeExhibit:React.FC<{asset:ProjectAsset;eager:boolean}&Props>=({asset,route,navigate,eager})=>{
 const {t,locale}=useI18n(),copy=t.projects[asset.id];
 const protectedDiagram=['umniah-youthconnect','financial-operations','outreach-automation'].includes(asset.id);
 return <article className={`gallery-exhibit lab-exhibit lab-exhibit--${asset.id}${protectedDiagram?' lab-exhibit--diagram':''}`} data-project={asset.id}>
  <NavLink className="gallery-project-link lab-exhibit-link" data-gallery-project={asset.id} route={{...route,page:'projects',project:asset.id}} navigate={navigate} aria-label={`${copy.title} — ${galleryCopy[locale].view}`}>
   <figure className="gallery-artwork lab-media"><div className="lab-window-label" aria-hidden="true"><span dir="ltr">HK / {String(projectAssets.indexOf(asset)+1).padStart(2,'0')}</span><span>{t.projectsSection.filters[asset.categoryKey]}</span></div><div className="gallery-media-mask"><div className="gallery-media-depth"><ProductImage asset={asset} full eager={eager} sizes={protectedDiagram?'(max-width:800px) 90vw, 360px':'(max-width:800px) 94vw, 70vw'}/></div></div><Evidence asset={asset}/></figure>
   <div className="gallery-project-copy"><div className="gallery-project-meta"><span className="index" dir="ltr">{String(projectAssets.indexOf(asset)+1).padStart(2,'0')} / 11</span><span>{t.projectsSection.filters[asset.categoryKey]}</span></div><div className="gallery-project-heading"><h2>{copy.title}</h2><Arrow/></div><p>{copy.short}</p><ul className="gallery-technologies">{copy.technology.slice(0,4).map(technology=><li key={technology}><bdi>{technology}</bdi></li>)}</ul><div className="lab-exhibit-bottom"><span>{copy.status}</span><span>{galleryCopy[locale].view}<Arrow/></span></div></div>
  </NavLink>
 </article>;
}
export function CreativeGallery({route,navigate}:Props){
 const {t,locale}=useI18n(),labels=galleryCopy[locale],copy=labCopy[locale],root=useRef<HTMLElement>(null);
 const [filter,setFilter]=useState<FilterKey>(()=>{const saved=history.state?.previewGallery;if(saved?.locale===locale)galleryMemory.restore(locale,saved);return galleryMemory.read(locale).filter;});
 useEffect(()=>{const saved=history.state?.previewGallery;if(saved?.locale===locale){galleryMemory.restore(locale,saved);setFilter(galleryMemory.read(locale).filter);}},[route,locale]);
 const visible=exhibitionOrder.flatMap(id=>projectAssets.filter(asset=>asset.id===id&&(filter==='all'||asset.categoryKey===filter)));
 const physical=visible.filter(asset=>asset.categoryKey==='rdIot'),software=visible.filter(asset=>asset.categoryKey!=='rdIot');
 useGalleryMotion(root,`creative:${locale}:${filter}`,locale==='ar');
 const choose=(key:FilterKey)=>{cancelProjectTransit();galleryMemory.setFilter(locale,key);history.replaceState({...history.state,previewGallery:{locale,...galleryMemory.read(locale)}},'');setFilter(key);};
 return <section ref={root} className="project-exhibition lab-exhibition" id="projects" data-gallery-filter-state={filter} aria-labelledby="projects-title">
  <header className="gallery-intro container"><div><p className="eyebrow"><span className="brand-dash" aria-hidden="true"/>{copy.edition}<span className="gallery-total" dir="ltr">11</span></p><h1 id="projects-title" tabIndex={-1}>{pageCopy[locale].collection}</h1></div><div className="gallery-intro-copy"><p>{t.projectsSection.subtitle}</p><a className="button-text" href="#gallery-index">{labels.skip}<span aria-hidden="true">↓</span></a></div></header>
  <div className="gallery-wayfinding container"><div className="gallery-filters" role="group" aria-label={labels.browse}>{filterOrder.map(key=><button key={key} aria-pressed={filter===key} data-gallery-filter={key} onClick={()=>choose(key)}>{t.projectsSection.filters[key]}<span className="filter-count" dir="ltr">{key==='all'?11:projectAssets.filter(asset=>asset.categoryKey===key).length}</span></button>)}</div><span className="gallery-result-count" role="status" aria-live="polite"><bdi>{String(visible.length).padStart(2,'0')} / 11</bdi></span></div>
  {[{assets:physical,title:copy.physical,id:'physical'},{assets:software,title:copy.software,id:'software'}].filter(group=>group.assets.length).map((group,groupIndex)=><section key={group.id} className={`container lab-discipline lab-discipline--${group.id}`} aria-labelledby={`lab-${group.id}`}><header><span className="index" dir="ltr">0{groupIndex+1}</span><h2 id={`lab-${group.id}`}>{group.title}</h2><span className="index" dir="ltr">{String(group.assets.length).padStart(2,'0')}</span></header><div className="lab-exhibits">{group.assets.map((asset,index)=><CreativeExhibit key={asset.id} asset={asset} eager={groupIndex===0&&index===0} route={route} navigate={navigate}/>)}</div></section>)}
  <section className="container lab-index" aria-labelledby="gallery-index"><h2 className="gallery-directory-heading" id="gallery-index" tabIndex={-1}>{labels.index}</h2><nav className="gallery-directory" aria-labelledby="gallery-index">{visible.map(asset=><NavLink key={asset.id} route={{...route,page:'projects',project:asset.id}} navigate={navigate} data-gallery-index={asset.id}><span className="index" dir="ltr">{String(projectAssets.indexOf(asset)+1).padStart(2,'0')}</span><span>{t.projects[asset.id].title}</span><span className="gallery-directory-category">{t.projectsSection.filters[asset.categoryKey]}</span><Arrow/></NavLink>)}</nav></section>
 </section>;
}
