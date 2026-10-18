import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ArrowUpRight,Grid2X2,X} from 'lucide-react';
import {useI18n} from '../i18n/useI18n';
import type {ProjectId} from '../content/types';
import {projectAssets} from '../data/projectAssets';
import {pageCopy} from './page-copy';
import {NavLink} from './PageShell';
import {ProductImage} from './PortfolioSections';
import CompactHero from './CompactHero';
import {SKILL_CATEGORIES,SKILL_IDS,projectsForSkills} from './skills-project-links';
import {workbenchArtwork,disciplineArtwork,workbenchCopy} from './skills-workbench-copy';
import {useSkillsWorkbenchMotion} from './skills-workbench-motion';
import type {Navigate,PreviewRoute} from './routes';
import './skills-workbench.css';

// Non-sensitive selection survives a case-study visit. No persistent ratings.
let remembered={category:-1,tool:null as number|null,project:'eventies' as ProjectId};
const initialSelection=()=>{const match=typeof location==='undefined'?null:location.hash.match(/^#skill-category-([0-4])$/);return {...remembered,...(match?{category:Number(match[1]),tool:null}:{})};};
const Mark=({asset}:{asset:string})=><span className="wb-mark" aria-hidden="true"><img src={`/v2-icons/${asset}.svg`} width={30} height={30} decoding="async" alt=""/></span>;

export default function SkillsWorkbench({route,navigate}:{route:PreviewRoute;navigate:Navigate}){
 const {t,locale}=useI18n(),copy=workbenchCopy[locale],root=useRef<HTMLElement>(null);
 const [selection,setSelection]=useState(initialSelection);
 const tools=useMemo(()=>t.about.skills.flatMap((group,category)=>group.map(name=>({name,category}))).map((tool,index)=>({...tool,index,art:workbenchArtwork[index]})),[t]);
 const connected=useMemo(()=>{
  const skills=selection.tool!==null?[SKILL_IDS[selection.tool]]:selection.category<0?SKILL_IDS:SKILL_CATEGORIES[selection.category];
  return projectsForSkills(skills).map(({id,skills})=>({id,technology:skills.map(skill=>tools[SKILL_IDS.indexOf(skill)].name)}));
 },[tools,selection.category,selection.tool]);
 const preview=connected.find(connection=>connection.id===selection.project)??connected[0];
 const motion=useSkillsWorkbenchMotion(root,locale,selection.category,selection.tool,preview?.id);
 useEffect(()=>{remembered=selection;},[selection]);
 const chooseCategory=(category:number)=>{if(category===selection.category&&selection.tool===null)return;motion.captureLayout();setSelection(state=>({...state,category,tool:null}));};
 const chooseTool=(tool:number)=>{motion.captureEvidence();setSelection(state=>({...state,tool:state.tool===tool?null:tool}));};
 useEffect(()=>{const restore=()=>{const match=location.hash.match(/^#skill-category-([0-4])$/);if(match){motion.captureLayout();setSelection(state=>({...state,category:Number(match[1]),tool:null}));}};addEventListener('hashchange',restore);return()=>removeEventListener('hashchange',restore);},[locale]);
 const keys=(event:React.KeyboardEvent<HTMLElement>)=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  const buttons=[...event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-wb-category]')],index=buttons.indexOf(document.activeElement as HTMLButtonElement);if(index<0)return;
  event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key===(locale==='ar'?'ArrowLeft':'ArrowRight')?1:-1)+buttons.length)%buttons.length;
  buttons[next].focus();chooseCategory(next-1);
 };
 const focusedName=selection.tool!==null?tools[selection.tool].name:selection.category<0?copy.all:t.about.skillCategories[selection.category];
 const resultLinks=()=>!connected.length?<p className="wb-empty">{copy.empty}</p>:<ul className="wb-inline-projects">{connected.map(connection=><li key={connection.id}><NavLink route={{...route,page:'projects',project:connection.id}} navigate={navigate}><span>{t.projects[connection.id].title}<small>{connection.technology.join(' · ')}</small></span><ArrowUpRight size={17} aria-hidden="true"/></NavLink></li>)}</ul>;
 const asset=preview&&projectAssets.find(item=>item.id===preview.id),project=preview&&t.projects[preview.id];
 return <main ref={root} id="main" className="page-content skills-workbench" tabIndex={-1} data-skills-workbench data-wb-motion="static">
  <CompactHero className="wb-hero" eyebrow={`04 / ${t.about.engineeringFocusTitle}`} title={pageCopy[locale].nav.skills} description={t.about.toolkitIntro} visual={<div className="wb-hero-art" aria-hidden="true">{[0,12,19,27,1,15].map(index=><div className="wb-hero-tool" key={index}><Mark asset={workbenchArtwork[index]}/><bdi>{tools[index].name}</bdi></div>)}</div>}/>
  <div className="wb-body container">
  <section className="wb-bench" aria-labelledby="wb-title"><header className="wb-section-heading"><div><span className="index">01 / {copy.tools}</span><h2 id="wb-title">{t.about.toolkitTitle}</h2></div><p>{copy.hint}</p></header>
   <ul className="focus-strip">{t.about.engineeringFocus.map(focus=><li key={focus}>{focus}</li>)}</ul>
   <div className="wb-categories" role="group" aria-label={t.about.toolkitAria} onKeyDown={keys}>
    <button type="button" data-wb-category={-1} aria-pressed={selection.category===-1} onClick={()=>chooseCategory(-1)}><Grid2X2 size={16} aria-hidden="true"/><span>{copy.all}</span><bdi className="wb-category-count">{tools.length}</bdi></button>
    {t.about.skillCategories.map((name,index)=><button id={`skill-category-${index}`} key={index} type="button" data-wb-category={index} aria-pressed={selection.category===index} onClick={()=>chooseCategory(index)}><Mark asset={disciplineArtwork[index]}/><span>{name}</span><bdi className="wb-category-count">{t.about.skills[index].length}</bdi></button>)}
   </div>
   <p className="wb-selection-status" role="status" aria-live="polite">{focusedName} — {copy.evidence} ({connected.length})</p>
   <div className="wb-layout"><section className="wb-inventory" aria-label={t.about.toolkitAria}><header className="wb-inventory-heading"><span className="wb-current">{focusedName}</span><bdi className="wb-count" dir="ltr">{String(tools.filter(tool=>selection.category<0||tool.category===selection.category).length).padStart(2,'0')} / {tools.length}</bdi></header>
    <div className="wb-tools" data-category={selection.category}>{t.about.skillCategories.map((name,category)=><section className="wb-tool-group" data-wb-group={category} hidden={selection.category>=0&&selection.category!==category} key={category} aria-labelledby={`wb-group-${category}`}><h3 id={`wb-group-${category}`}>{name}</h3><div className="wb-tool-chips">{tools.filter(tool=>tool.category===category).map(tool=><React.Fragment key={tool.index}><button type="button" className="wb-tool" data-workbench-tool={tool.index} data-flip-id={`wb-tool-${tool.index}`} data-show={selection.category<0||tool.category===selection.category} aria-pressed={selection.tool===tool.index} aria-controls={selection.tool===tool.index?'wb-inline-evidence wb-desktop-evidence':undefined} onClick={()=>chooseTool(tool.index)}><Mark asset={tool.art}/><bdi lang={/[\u0600-\u06ff]/.test(tool.name)?'ar':undefined}>{tool.name}</bdi></button>{selection.tool===tool.index&&<aside id="wb-inline-evidence" className="wb-inline-evidence" data-wb-near-tool={tool.index} aria-label={`${tool.name}: ${copy.evidence}`}><header><strong>{tool.name}</strong><span>{copy.evidence}</span></header>{resultLinks()}</aside>}</React.Fragment>)}</div></section>)}</div>
    <footer className="wb-inventory-foot"><span>{t.about.focusValue}</span><button className="wb-reset" type="button" disabled={selection.tool===null&&selection.category===-1} onClick={()=>chooseCategory(-1)}>{copy.reset}<X size={15} aria-hidden="true"/></button></footer>
   </section>
   <aside id="wb-desktop-evidence" className="wb-inspector" aria-labelledby="wb-evidence-title"><header className="wb-evidence-heading"><span className="index">02 / {copy.preview}</span><h2 id="wb-evidence-title">{copy.evidence}</h2><p>{focusedName}</p></header>
    {!preview||!asset||!project?<p className="wb-empty">{copy.empty}</p>:<>
     <article className="wb-project-panel" data-wb-preview={preview.id} data-active="true"><NavLink className="wb-preview-image" route={{...route,page:'projects',project:preview.id}} navigate={navigate} aria-label={`${t.actions.viewProject}: ${project.title}`}><div className="project-media-primary"><ProductImage asset={asset} sizes="(max-width:1000px) 320px, 380px"/></div></NavLink><div className="wb-preview-caption"><h3>{project.title}</h3><p>{project.short}</p><small className="wb-match">{preview.technology.join(' · ')}</small><NavLink className="wb-case-link" route={{...route,page:'projects',project:preview.id}} navigate={navigate}>{t.actions.viewProject}<ArrowUpRight size={17} aria-hidden="true"/></NavLink></div></article>
     <div className="wb-project-selector" role="group" aria-label={copy.preview}>{connected.map(connection=><button type="button" key={connection.id} data-wb-project={connection.id} aria-pressed={preview.id===connection.id} onClick={()=>{motion.captureEvidence();setSelection(state=>({...state,project:connection.id}));}}><span>{t.projects[connection.id].title}</span><ArrowUpRight size={14} aria-hidden="true"/></button>)}</div>
    </>}
   </aside></div>
  </section>
  <section className="wb-capabilities" aria-labelledby="wb-capability-title"><header className="wb-section-heading"><div><span className="index">03 / {copy.scope}</span><h2 id="wb-capability-title">{t.capabilities.title}</h2></div><p>{t.capabilities.subtitle}</p></header><div className="wb-scope-grid">{t.capabilities.items.map(item=><article className="wb-scope" key={item.number}><span className="index">{item.number}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>
  </div>
 </main>;
}
