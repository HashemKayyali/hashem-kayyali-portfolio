import React,{useRef} from 'react';
import {useI18n} from '../i18n/useI18n';
import {projectAssets} from '../data/projectAssets';
import {Hero,FeaturedProject,featuredIds} from './PortfolioSections';
import {NavLink} from './PageShell';
import {pageCopy} from './page-copy';
import HomeSilk from './HomeSilk';
import type {Navigate,PreviewRoute} from './routes';
import {useHomeMotion} from './home-motion';
export {default as ContactPage} from './ContactDesk';

const Arrow=()=> <span className="arrow" aria-hidden="true">↗</span>;
type Props={route:PreviewRoute;navigate:Navigate};

export function Home({route,navigate}:Props) {
 const {t,locale}=useI18n();const copy=pageCopy[locale];
 const home=useRef<HTMLElement>(null);useHomeMotion(home,locale,locale==='ar');
 const selected=featuredIds.map(id=>projectAssets.find(asset=>asset.id===id)!);
 return <main ref={home} className="page-content home-page home-art-directed" id="main" tabIndex={-1}>
  <Hero route={route} navigate={navigate}/>
  <section className="container home-about" aria-labelledby="home-about-title"><HomeSilk className="home-transition-field"/><span className="home-section-rule" aria-hidden="true"/><div><span className="index">01 / {t.about.engineeringFocusTitle}</span><h2 id="home-about-title">{t.about.title}</h2><NavLink className="button-text" route={{locale,page:'about'}} navigate={navigate}>{copy.readMore}<Arrow/></NavLink></div><div><p>{t.about.sections[0].paragraphs[0]}</p><ul className="focus-strip">{t.about.engineeringFocus.map(focus=><li key={focus}>{focus}</li>)}</ul></div></section>
  <section className="container home-projects" id="projects" aria-labelledby="home-projects-title"><header className="page-section-title"><span className="home-section-rule" aria-hidden="true"/><div><span className="index">02 / {copy.explore}</span><h2 id="home-projects-title">{t.projectsSection.title}</h2></div><NavLink className="button-text" route={{locale,page:'projects'}} navigate={navigate}>{copy.allProjects}<Arrow/></NavLink></header><div className="featured-projects">{selected.map((asset,index)=><FeaturedProject key={asset.id} asset={asset} route={route} navigate={navigate} index={index}/>)}</div></section>
  <section className="container home-bottom" aria-label={copy.highlights}><div className="career-summary"><span className="index">03 / {copy.nav.experience}</span><h2>{copy.highlights}</h2><ol>{t.resume.experience.slice(0,3).map(entry=>{const current=entry.roles?.[0];return <li key={entry.id}><span className="career-node" aria-hidden="true"/><p className="career-company">{entry.company}</p><h3>{current?.title??entry.role}</h3><p className="career-period">{current?.period??entry.period} · {current?.employment??entry.employment}</p></li>;})}</ol><NavLink className="button-text" route={{locale,page:'experience'}} navigate={navigate}>{t.resume.journeyTitle}<Arrow/></NavLink></div>
   <div className="home-toolkit"><span className="index">04 / {copy.nav.skills}</span><h2>{copy.selectedSkills}</h2><p>{t.about.toolkitIntro}</p><ul className="skill-tags">{[...t.about.skills[0].slice(0,3),...t.about.skills[2].slice(0,3),...t.about.skills[3].slice(0,3)].map(skill=><li key={skill}><bdi>{skill}</bdi></li>)}</ul><NavLink className="button-text" route={{locale,page:'skills'}} navigate={navigate}>{t.about.toolkitTitle}<Arrow/></NavLink></div>
  </section>
  <section className="home-invitation"><HomeSilk className="contact-field"/><div className="container"><span className="index">05 / {t.contact.title}</span><h2>{t.contact.heading}</h2><p>{t.contact.supporting}</p><NavLink className="button-primary" route={{locale,page:'contact'}} navigate={navigate}>{copy.nav.contact}<Arrow/></NavLink></div></section>
 </main>;
}

export {default as Skills} from './SkillsWorkbench';

export function NotFound({route,navigate}:Props) {
 const {locale}=useI18n();const copy=pageCopy[locale];
 return <main className="page-content not-found container" id="main" tabIndex={-1}><span className="index">404</span><h1 tabIndex={-1}>{copy.notFound}</h1><NavLink className="button-primary" route={{locale,page:'home'}} navigate={navigate}>{copy.backHome}<Arrow/></NavLink></main>;
}
