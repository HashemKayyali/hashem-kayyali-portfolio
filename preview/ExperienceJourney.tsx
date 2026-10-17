import React,{useRef} from 'react';
import {ArrowDown,ArrowDownRight} from 'lucide-react';
import {useI18n} from '../i18n/useI18n';
import type {ExperienceCopy,ExperienceRoleCopy} from '../content/types';
import {experienceAssets,RESUME_PDF,RESUME_DOCX} from '../data/profile';
import CompactHero from './CompactHero';
import {useExperienceJourneyMotion} from './experience-journey-motion';
import './experience-journey.css';

type JourneyRole=Omit<ExperienceRoleCopy,'employment'|'mode'>&{employment?:string;mode?:string};
const companyAnchor=(id:ExperienceCopy['id'])=>`profile-company-${id}`;
const entryRoles=(entry:ExperienceCopy):JourneyRole[]=>entry.roles?.length?entry.roles:[{title:entry.role??entry.company,period:entry.period,employment:entry.employment,mode:entry.mode,points:entry.points}];

function CompanyImage({entry,hero=false}:{entry:ExperienceCopy;hero?:boolean}) {
 const asset=experienceAssets[entry.id];
 if(!asset)return null;
 return <img src={asset.image.replace(/\.webp$/,'-thumb-320.webp')} width={320} height={entry.id==='independent'?314:320} alt="" aria-hidden="true" loading={hero?'eager':'lazy'} decoding="async"/>;
}

/** Every source fact is readable, including the complete Terminal progression. */
function Role({role,entry}:{role:JourneyRole;entry:ExperienceCopy}) {
 return <>
  <header className="journey-role-heading"><h3>{role.title}</h3><p className="journey-date">{role.period}</p></header>
  <p className="journey-role-context">{[role.employment,entry.location,role.mode].filter(Boolean).map((item,i)=><span key={`${i}:${item}`}>{item}</span>)}</p>
  <ul className="journey-role-points">{role.points.map(point=><li key={point}>{point}</li>)}</ul>
 </>;
}

export default function ExperienceJourney() {
 const {t,locale}=useI18n();const root=useRef<HTMLElement>(null),entries=t.resume.experience;
 useExperienceJourneyMotion(root,locale);
 return <section ref={root} className="experience-journey" id="resume" aria-label={t.resume.journeyTitle} data-arrivals-owned="experience">
  <CompactHero className="journey-opening container" eyebrow={`04 / ${t.resume.profileEyebrow}`} title={t.resume.journeyTitle} description={t.resume.journeySupport}
   actions={<a className="journey-read-link" href={`#${companyAnchor(entries[0].id)}`}>{t.resume.title}<ArrowDownRight size={19} aria-hidden="true"/></a>}
   visual={<nav className="journey-plane-stage" aria-label={t.resume.journeyTitle}><div className="journey-plane-depth">{entries.map((entry,index)=><a key={entry.id} className={`journey-plane journey-plane--${index}`} href={`#${companyAnchor(entry.id)}`} data-company={entry.id}><span className="journey-plane-media"><CompanyImage entry={entry} hero/></span><span className="journey-plane-name">{entry.company}</span></a>)}</div></nav>}/>
  <div className="journey-body container">
   {/* Desktop reading companion: mirrors the chapter in view. Decorative; the list below is the content. */}
   <aside className="journey-rail" aria-hidden="true"><div className="journey-rail-sticky">
    <div className="journey-rail-marks">{entries.map((entry,index)=><span key={entry.id} className="journey-rail-mark" data-index={index}><CompanyImage entry={entry}/></span>)}</div>
    <div className="journey-rail-names">{entries.map((entry,index)=><span key={entry.id} className="journey-rail-name" data-index={index}><strong>{entry.company}</strong><bdi>{entry.period}</bdi></span>)}</div>
    <ol className="journey-rail-steps">{entries.map((entry,index)=><li key={entry.id} data-index={index}><i/><bdi>{String(index+1).padStart(2,'0')}</bdi><span>{entry.company}</span></li>)}</ol>
   </div></aside>
   <ol className="journey-folios" aria-label={t.resume.title}><li className="journey-progress" aria-hidden="true"><i/></li>{entries.map((entry,index)=><li className="journey-folio-arrival" key={entry.id} data-journey-reveal={entry.id} data-index={index}>
    <span className="journey-track-index" aria-hidden="true"><bdi>{String(index+1).padStart(2,'0')}</bdi><i/></span>
    <section id={companyAnchor(entry.id)} className="journey-company-anchor journey-folio" tabIndex={-1} aria-labelledby={`${companyAnchor(entry.id)}-title`}>
     <header className="journey-company-header"><span className="journey-company-image" aria-hidden="true"><CompanyImage entry={entry}/></span><div className="journey-company-heading"><div className="journey-company-title"><h2 id={`${companyAnchor(entry.id)}-title`} tabIndex={-1}>{entry.company}</h2>{entry.badge&&<span className="journey-current">{entry.badge}</span>}</div><p className="journey-date">{entry.period}</p></div></header>
     {entry.responsibilities?.length&&<ul className="journey-responsibilities">{entry.responsibilities.map(item=><li key={item}>{item}</li>)}</ul>}
     {entry.roles?.length&&entry.points.length>0&&<div className="journey-entry-context">{entry.points.map(point=><p key={point}>{point}</p>)}</div>}
     <ol className="journey-roles">{entryRoles(entry).map(role=><li className="journey-role" key={`${entry.id}:${role.title}`}><Role role={role} entry={entry}/></li>)}</ol>
    </section>
   </li>)}</ol>
   <aside className="journey-dossier" aria-labelledby="journey-education-title">
    <section className="journey-dossier-block journey-education" data-journey-reveal="education"><h2 id="journey-education-title">{t.resume.education.title}</h2><p className="journey-degree">{t.resume.education.degree}</p><p>{t.resume.education.university}</p><p className="journey-date">{t.resume.education.period}</p><p className="journey-graduated">{t.resume.education.status}</p></section>
    <section className="journey-dossier-block journey-strengths" data-journey-reveal="strengths" aria-labelledby="journey-strengths-title"><h2 id="journey-strengths-title">{t.resume.coreStrengths.title}</h2><ul>{t.resume.coreStrengths.items.map(item=><li key={item}>{item}</li>)}</ul></section>
    <section className="journey-dossier-block journey-resume" data-journey-reveal="downloads" aria-labelledby="journey-download-title"><h2 id="journey-download-title">{t.resume.downloadCard.title}</h2><p>{t.resume.downloadCard.copy}</p><p>{t.resume.downloadCard.availability}</p><div className="journey-downloads"><a href={RESUME_PDF} target="_blank" rel="noopener noreferrer">{t.resume.downloadCard.pdf}<ArrowDown size={17} aria-hidden="true"/></a><a href={RESUME_DOCX} download>{t.resume.downloadCard.word}<ArrowDown size={17} aria-hidden="true"/></a></div></section>
   </aside>
  </div>
 </section>;
}
