import React,{useRef} from 'react';
import {ArrowUpRight,ArrowDown} from 'lucide-react';
import {useI18n} from '../i18n/useI18n';
import {projectAssets,type ProjectAsset} from '../data/projectAssets';
import {RESUME_PDF} from '../data/profile';
import {NavLink} from './PageShell';
import ProjectMediaSet from './ProjectMediaSet';
import {pageCopy} from './page-copy';
import {storyCopy} from './story-copy';
import {engineeringHomeCopy} from './engineering-home-copy';
import {useEngineeringHomeMotion} from './engineering-home-motion';
import type {Navigate,PreviewRoute} from './routes';
import './engineering-home.css';
import SkillToolbelt from './SkillToolbelt';
import HomeStory from './HomeStory';

type Props={route:PreviewRoute;navigate:Navigate};
const projects=['eventies','bike-tower','basket-beats'].map(id=>projectAssets.find(asset=>asset.id===id)!);
const Up=()=> <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true"/>;

const Scene:React.FC<{asset:ProjectAsset;index:number}&Props>=({asset,index,route,navigate})=>{
 const {t,locale}=useI18n(),copy=t.projects[asset.id],labels=engineeringHomeCopy[locale];
 return <><span className="pulse-scene-marker" id={`home-work-${asset.id}`} data-scene-marker={asset.id} aria-hidden="true"/><article className={`pulse-scene pulse-scene--${index}`} data-home-scene={asset.id} data-stack-item style={{'--stack-order':index} as React.CSSProperties} aria-labelledby={`scene-title-${asset.id}`}>
  <div className="pulse-scene-surface">
   <div className="pulse-scene-top"><span><bdi>0{index+1}</bdi> / {labels.choices[asset.id==='eventies'?1:0]}</span><span>{t.projectsSection.filters[asset.categoryKey]}</span></div>
   <div className="pulse-scene-grid"><div className="pulse-scene-copy"><h3 id={`scene-title-${asset.id}`}><span className="pulse-line-mask"><span>{copy.title}</span></span></h3><p>{copy.short}</p><ul>{copy.technology.slice(0,3).map(tech=><li key={tech}><bdi>{tech}</bdi></li>)}</ul><NavLink className="pulse-case-link" route={{...route,page:'projects',project:asset.id}} navigate={navigate}><span>{labels.readCase}</span><Up/></NavLink></div>
    <NavLink className="pulse-scene-media" route={{...route,page:'projects',project:asset.id}} navigate={navigate} aria-label={`${labels.readCase}: ${copy.title}`}><ProjectMediaSet asset={asset}/><span className="pulse-media-corner"><Up/></span></NavLink>
   </div>
   <div className="pulse-scene-bottom"><span>{copy.status}</span><span>{asset.id==='terminal-nfc'?storyCopy[locale].redacted:storyCopy[locale].real}</span></div>

  </div>
 </article></>;
};

export default function EngineeringHome({route,navigate}:Props){
 const {t,locale}=useI18n(),copy=engineeringHomeCopy[locale],labels=pageCopy[locale];
 const root=useRef<HTMLElement>(null);useEngineeringHomeMotion(root,locale);
 const [role,software]=t.identity.role.split(' | ');
 return <main ref={root} id="main" className="vision-home pulse-home" tabIndex={-1}>
  <div className="app-home-hero"><section className="vision-opening pulse-opening vision-canvas" data-home-intro aria-labelledby="vision-title">
   <div className="pulse-hero-copy"><div className="pulse-identity"><span className="pulse-kicker">{copy.software} × {copy.hardware} × {copy.product}</span><p className="pulse-roles">{role}<span>{software}</span></p><h1 id="vision-title" className="pulse-name" tabIndex={-1}>{t.identity.name.split(' ').map((word,index)=><React.Fragment key={word}>{index>0&&' '}<span className="pulse-line-mask"><span className="pulse-name-word">{word}</span></span></React.Fragment>)}</h1><p className="pulse-statement">{t.hero.headline}</p></div><div className="pulse-actions"><NavLink className="pulse-primary" route={{...route,page:'projects',project:undefined}} navigate={navigate}><span className="pulse-action-text">{t.hero.actions.viewProjects}<Up/></span></NavLink><a className="pulse-resume" href={RESUME_PDF} target="_blank" rel="noopener noreferrer">{t.hero.actions.downloadResume}<ArrowDown size={16} aria-hidden="true"/></a></div></div>
   <div className="app-portrait-slot" aria-hidden="true"/>

  </section>
  <div className="pulse-hero-foot vision-canvas"><span>{t.hero.technicalMeta[0]}</span><a href="#vision-work">{copy.work}<ArrowDown size={17} aria-hidden="true"/></a></div></div>
  <SkillToolbelt/>
  <section className="pulse-work vision-canvas" id="vision-work" aria-labelledby="vision-work-title"><header className="pulse-work-heading"><div><span className="pulse-kicker">01 / {copy.work}</span><h2 id="vision-work-title">{copy.selected}</h2></div><NavLink className="pulse-text-link" route={{...route,page:'projects',project:undefined}} navigate={navigate}>{labels.allProjects}<Up/></NavLink></header><nav className="pulse-work-index" aria-label={copy.work}>{projects.map((asset,index)=><a href={`#home-work-${asset.id}`} key={asset.id}><bdi>0{index+1}</bdi>{t.projects[asset.id].title}<ArrowDown size={14} aria-hidden="true"/></a>)}<span className="pulse-work-progress" aria-hidden="true"/></nav><div className="pulse-scenes">{projects.map((asset,index)=><Scene key={asset.id} asset={asset} index={index} route={route} navigate={navigate}/>)}</div></section>
  <HomeStory route={route} navigate={navigate}/>
 </main>;
}

