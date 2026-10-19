import React,{useRef} from 'react';
import {Boxes,Code2,Radio,FlaskConical,Workflow,ArrowUpRight,Plus} from 'lucide-react';
import {useI18n} from '../i18n/useI18n';
import {profile} from '../data/profile';
import {useAboutMotion} from './about-motion';
import {NavLink} from './PageShell';
import {pageCopy} from './page-copy';
import type {Navigate,PreviewRoute} from './routes';

const signals=[Boxes,Code2,Radio,FlaskConical,Workflow];
const number=(index:number)=>String(index+1).padStart(2,'0');
export default function AboutDossier({route,navigate}:{route:PreviewRoute;navigate:Navigate}){
 const {t,locale}=useI18n(),root=useRef<HTMLElement>(null);useAboutMotion(root,locale);
 return <section ref={root} className="about section-pad profile-about about-dossier" id="about" aria-labelledby="about-title"><div className="container">
  <header className="section-heading profile-heading atelier-about-opening"><div className="atelier-about-copy"><span className="index" dir="ltr">03 / {t.about.engineeringFocusTitle}</span><h1 id="about-title" tabIndex={-1}>{t.about.title}</h1><p>{t.about.subtitle}</p><div className="atelier-person-meta"><span>{t.identity.name}</span><p>{t.identity.role.split(' | ').slice(0,2).join(' · ')}</p></div></div><div className="app-portrait-slot" aria-hidden="true"/></header>
  <div className="dossier-body">
   <section className="dossier-signals" aria-labelledby="dossier-focus-title"><header><h2 id="dossier-focus-title">{t.about.engineeringFocusTitle}</h2><span className="dossier-signal-line" aria-hidden="true"/></header><ul>{t.about.engineeringFocus.map((focus,index)=>{const Icon=signals[index%signals.length];return <li key={index}><span className="dossier-signal-icon" aria-hidden="true"><Icon size={18}/></span><span>{focus}</span><bdi className="index">{number(index)}</bdi></li>;})}</ul></section>
   <nav className="dossier-index" aria-label={t.about.title}>{t.about.sections.map((section,index)=><a href={`#about-section-${index}`} key={index} data-dossier-link={index}><bdi className="index">{number(index)}</bdi><span>{section.title}</span><span className="dossier-index-dot" aria-hidden="true"/></a>)}</nav>
   <div className="dossier-folios">{t.about.sections.map((section,index)=><section key={index} className={`dossier-folio dossier-folio--${index}`} id={`about-chapter-${index}`} data-dossier-folio={index} aria-labelledby={`about-section-${index}`}><span className="dossier-folio-rule" aria-hidden="true"/><header className="dossier-folio-header"><bdi className="dossier-ordinal" aria-hidden="true">{number(index)}</bdi><h2 id={`about-section-${index}`} tabIndex={-1}>{section.title}</h2><span className="dossier-registration" aria-hidden="true">+</span></header><div className="dossier-paragraphs">{section.paragraphs.map((paragraph,p)=><p key={p} data-about-paragraph>{paragraph}</p>)}</div></section>)}</div>
   <section className="dossier-toolkit" aria-labelledby="dossier-toolkit-title"><header><span className="index" dir="ltr">05</span><h2 id="dossier-toolkit-title">{t.about.toolkitTitle}</h2><p>{t.about.toolkitIntro}</p></header><div className="dossier-tools">{t.about.skillCategories.map((category,index)=><details className="dossier-tool" key={index}><summary><bdi className="index">{number(index)}</bdi><h3>{category}</h3><bdi className="dossier-tool-count">{String(t.about.skills[index].length).padStart(2,'0')}</bdi><Plus size={17} aria-hidden="true"/></summary><div className="dossier-tool-panel"><ul>{t.about.skills[index].map(skill=><li key={skill}><bdi>{skill}</bdi></li>)}</ul></div></details>)}</div></section>
   <div className="dossier-signoff"><span>{t.identity.name}</span><div>{(["experience","skills"] as const).map(page=><NavLink key={page} route={{...route,page}} navigate={navigate}>{pageCopy[locale].nav[page]}<ArrowUpRight size={18} aria-hidden="true"/></NavLink>)}<a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight size={18} aria-hidden="true"/></a></div></div>
  </div>
 </div></section>;
}
