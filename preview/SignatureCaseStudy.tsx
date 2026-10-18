import React,{useEffect,useRef,useState} from 'react';
import {useI18n,format} from '../i18n/useI18n';
import {isSuppliedCover,type ProjectAsset} from '../data/projectAssets';
import {NavLink} from './PageShell';
import type {Navigate,PreviewRoute} from './routes';
import StoryMedia,{safeSource} from './StoryMedia';
import {caseCopy} from './case-copy';
import {storyCopy} from './story-copy';
import {casePresentation,visibleCaseMedia,caseNeighbors} from './case-presentation';
import CaseArchitecture from './CaseArchitecture';
import {mediaFrameStyle} from './media-frame';
import {useCaseMotion} from './case-motion';
import CaseMediaGallery from './CaseMediaGallery';
import {getStudioProjectMedia,getStudioProjectCover,studioProjectAlt,studioCaseSources} from './studio-media-registry';

import './case-studies.css';
import './case-identities.css';
import './case-body.css';
import './case-carousel.css';

type Props={asset:ProjectAsset;route:PreviewRoute;navigate:Navigate};
const Arrow=()=> <span aria-hidden="true" className="arrow">↗</span>;
export default function SignatureCaseStudy({asset,route,navigate}:Props) {
 const {t,locale}=useI18n(),copy=t.projects[asset.id],labels=caseCopy[locale],presentation=casePresentation[asset.id];
 const root=useRef<HTMLElement>(null),viewer=useRef<HTMLDialogElement>(null),opener=useRef<HTMLButtonElement|null>(null);
 const [expanded,setExpanded]=useState<{source:string;caption:string}|null>(null);
 const sources=studioCaseSources(asset.id,visibleCaseMedia(asset)),customMedia=getStudioProjectMedia(asset.id),{previous,next}=caseNeighbors(asset.id);
 useCaseMotion(root,`${asset.id}:${locale}`,locale==='ar');
 useEffect(()=>{viewer.current?.close();setExpanded(null);},[asset.id,locale]);
 const evidence=customMedia?labels.supplied:copy.mediaCaption??(presentation.evidence==='redacted'?storyCopy[locale].redacted:presentation.evidence==='illustration'?labels.illustration:presentation.evidence==='supplied'?labels.supplied:asset.categoryKey==='webPlatform'?labels.publicInterface:storyCopy[locale].real);
 const caption=(source:string)=>customMedia?.items.find(item=>item.media?.url===source)?.caption||(source.includes('/bike-tower/screenshot-')?storyCopy[locale].redacted:isSuppliedCover(source)?labels.supplied:evidence);
 const alternativeText=(source:string)=>studioProjectAlt(asset.id,source,`${copy.title}. ${caption(source)}`);
 const media=(source:string,eager=false,sizes='(max-width:700px) 92vw, 1160px')=><StoryMedia source={source} alt={alternativeText(source)} eager={eager} sizes={sizes}/>;
 const reveal=(source:string,caption:string,event:React.MouseEvent<HTMLButtonElement>)=>{opener.current=event.currentTarget;setExpanded({source:safeSource(source),caption});viewer.current?.showModal();};
 const opening=<section className={`case-opening opening--${presentation.opening}`} aria-labelledby="case-title">
  <div className="container case-wayfinding"><NavLink className="back-link" route={{...route,page:'projects',project:undefined}} navigate={navigate}><span aria-hidden="true">←</span>{t.projectsSection.title}</NavLink><span className="case-edition">{labels.exhibition}</span></div>
  <div className="container case-opening-layout"><header className="case-opening-copy">
   <div className="project-meta"><span>{t.projectsSection.filters[asset.categoryKey]}</span><span className="case-status">{copy.status}</span></div>
   <h1 id="case-title" tabIndex={-1}><span className="case-title-mask"><span className="case-title-text">{copy.title}</span></span></h1>
   <p className="case-deck">{copy.short}</p>
   <div className="case-opening-actions">{asset.liveUrl&&<a href={asset.liveUrl} target="_blank" rel="noopener noreferrer" className="button-primary">{t.projectModal.labels.visitLive}<Arrow/></a>}<a className="button-primary" href="#case-purpose">{labels.details}<span aria-hidden="true">↓</span></a>{copy.role&&<span className="case-role">{copy.role}</span>}</div>
  </header>
  <figure className="case-opening-visual case-reveal">
   {sources.length?<div className="case-image-depth" style={mediaFrameStyle(sources[0])}>{media(sources[0],true)}</div>:<CaseArchitecture asset={asset} compact/>}
   <figcaption>{sources.length?caption(sources[0]):labels.protected}</figcaption>
  </figure>

  </div>
  <div className="container case-opening-footer"><span className="case-keyline" aria-hidden="true"/><span>{t.projectModal.labels.technology}</span><p dir="ltr">{copy.technology.slice(0,4).join(' / ')}</p></div>
 </section>;
 // Chapter numbers follow the order the reader actually meets them in.
 const engineeringFirst=presentation.order==='engineering-first',withBuild=sources.length>0?1:0;
 const engineering=<section className="case-chapter case-engineering container" id="case-engineering" aria-labelledby="case-engineering-title">
  <header className="case-chapter-heading"><span className="index">{engineeringFirst?'02':'03'} / {storyCopy[locale].story}</span><h2 id="case-engineering-title">{copy.narrativeLabels?.engineering??t.projectModal.labels.engineering}</h2></header>
  <CaseArchitecture asset={asset}/>
 </section>;
 const build=<section className={`case-chapter case-build build--${presentation.build} container`} id="case-build" aria-labelledby="case-build-title">
  <header className="case-chapter-heading"><span className="index">04 / {labels.gallery}</span><h2 id="case-build-title">{labels.build}</h2></header>
  <CaseMediaGallery key={asset.id} sources={sources} title={copy.title} caption={caption} alternativeText={alternativeText} onOpen={reveal}/>
 </section>;
 return <main ref={root} className={`signature-case case-study--${asset.id} case-identity--${presentation.identity}`} id="main" tabIndex={-1}>
  {opening}
  <div className="case-body" data-arrivals-owned="case">
  <nav className="case-chapter-nav container" aria-label={t.projectModal.labels.overview}><span className="case-read-progress" aria-hidden="true"/>{(engineeringFirst?['purpose','engineering','contribution'] as const:['purpose','contribution','engineering'] as const).map(key=><a href={`#case-${key}`} key={key}>{t.projectModal.labels[key]}</a>)}{sources.length>0&&<a href="#case-build">{labels.build}</a>}</nav>
  <section className="case-chapter case-product-story container" id="case-purpose" aria-labelledby="case-purpose-title">
   <header className="case-chapter-heading"><span className="index">01 / {labels.productStory}</span><h2 id="case-purpose-title">{copy.narrativeLabels?.purpose??t.projectModal.labels.purpose}</h2></header>
   <div className="case-story-reading"><p className="case-lead">{copy.overview}</p><p className="case-purpose">{copy.purpose}</p></div>
  </section>
  {presentation.order==='engineering-first'&&engineering}
  <section className="case-chapter case-ownership container" id="case-contribution" aria-labelledby="case-contribution-title">
   <header className="case-chapter-heading"><span className="index">{engineeringFirst?'03':'02'} / {t.projectModal.labels.contribution}</span><h2 id="case-contribution-title">{copy.narrativeLabels?.contribution??t.projectModal.labels.contribution}</h2></header>
   <div className="case-ownership-reading"><p>{copy.contribution}</p><ul className="case-technology-list">{copy.technology.map(technology=><li key={technology}><bdi>{technology}</bdi></li>)}</ul></div>
  </section>
  {presentation.order==='product-first'&&engineering}
  {sources.length>0&&build}
  <section className="case-chapter case-decisions container" id="case-considerations" aria-labelledby="case-decisions-title">
   <header className="case-chapter-heading"><span className="index">0{4+withBuild} / {t.projectModal.labels.considerations}</span><h2 id="case-decisions-title">{t.projectModal.labels.considerations}</h2></header>
   <ol className="decision-list">{copy.considerations.map((point,i)=><li key={point}><span className="index" dir="ltr">0{i+1}</span><p>{point}</p></li>)}</ol>
  </section>
  <section className="case-chapter case-result" aria-labelledby="case-capabilities-title"><div className="container"><header className="case-chapter-heading"><span className="index">0{5+withBuild} / {copy.status}</span><h2 id="case-capabilities-title">{t.projectModal.labels.capabilities}</h2></header><ol className="capability-list">{copy.capabilities.map((point,i)=><li key={point}><span dir="ltr">0{i+1}</span><h3>{point}</h3></li>)}</ol><div className="case-links">{!asset.liveUrl&&<span>{t.projectModal.labels.privateSourceCode}</span>}<NavLink className="button-text case-back-to-projects" route={{...route,page:'projects',project:undefined}} navigate={navigate}>{t.projectsSection.title}<Arrow/></NavLink></div></div></section>
  <section className="case-closing case-chapter container" id="case-selected" aria-labelledby="case-closing-title"><span className="index">{labels.closing}</span><h2 id="case-closing-title">{t.projectsSection.title}</h2><div className="case-neighbors">{[[previous,labels.previous],[next,labels.next]].map(([neighbor,label],i)=>{const item=neighbor as ProjectAsset;const visuals=visibleCaseMedia(item),relatedSource=getStudioProjectCover(item.id)?.url??visuals[0]??'/v2-media/umniah-architecture.svg';return <NavLink key={item.id} route={{...route,page:'projects',project:item.id}} navigate={navigate} className={`case-neighbor neighbor--${i}`}><span className="index">{label as string}</span><div className="neighbor-visual case-reveal" style={mediaFrameStyle(relatedSource)}><StoryMedia source={relatedSource} alt={studioProjectAlt(item.id,relatedSource,t.projects[item.id].title+(visuals.length?'':'. '+labels.illustration))} sizes="(max-width:700px) 90vw, 280px"/></div><h3><span className="neighbor-name">{t.projects[item.id].title}</span><Arrow/></h3><p>{t.projects[item.id].status}</p></NavLink>;})}</div></section>
  <dialog ref={viewer} className="image-viewer case-image-viewer" aria-label={format(t.projectModal.a11y.imageViewer,{title:copy.title})} onClose={()=>{if(opener.current?.isConnected)opener.current.focus({preventScroll:true});}}><form method="dialog"><button aria-label={t.projectModal.labels.closeImageViewer}>×</button></form>{expanded&&<figure><img src={expanded.source} alt={alternativeText(expanded.source)}/><figcaption>{expanded.caption}</figcaption></figure>}</dialog>
  </div>
 </main>;
}
