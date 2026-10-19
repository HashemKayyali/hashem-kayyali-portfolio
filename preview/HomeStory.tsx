import React,{useRef} from 'react';
import {ArrowUpRight,ArrowDown,ArrowRight,ScanSearch,Network,IterationCw,Mail} from 'lucide-react';
import {useI18n} from '../i18n/useI18n';
import {profile,RESUME_PDF,experienceAssets} from '../data/profile';
import {NavLink} from './PageShell';
import {processIllustrations} from './process-illustrations';
import {engineeringHomeCopy} from './engineering-home-copy';
import {pageCopy} from './page-copy';
import {homeStoryCopy} from './home-story-copy';
import {useHomeStoryMotion} from './home-story-motion';
import type {Navigate,PreviewRoute} from './routes';
import {cdnImage,localFallback} from './static-media';

/** Process art: Cloudinary (eco, gate-approved) when enabled, otherwise the local 640/1280 files. */
function ProcessImage({image}:{image:(typeof processIllustrations)[number]}){
 const local=`${image.small} 640w, ${image.src} 1280w`,cdn=cdnImage([image.small,image.src],image.src);
 return <img src={cdn?.src??image.src} srcSet={cdn?.srcSet??local} onError={cdn?localFallback(image.src,local):undefined} sizes="(max-width:800px) 30vw, 540px" width={image.width} height={image.height} loading="lazy" decoding="async" alt=""/>;
}
const icons=[ScanSearch,Network,IterationCw];
export default function HomeStory({route,navigate}:{route:PreviewRoute;navigate:Navigate}){
 const {t,locale}=useI18n(),copy=homeStoryCopy[locale],home=engineeringHomeCopy[locale],labels=pageCopy[locale];
 const root=useRef<HTMLDivElement>(null);useHomeStoryMotion(root,locale);
 return <div ref={root} className="home-story" data-story-motion="static">
  <section className="story-method" id="vision-approach" aria-labelledby="story-method-title"><div className="vision-canvas">
   <header className="story-heading"><div><span className="pulse-kicker">02 / {home.approach}</span><h2 id="story-method-title">{copy.title}</h2></div><p>{t.hero.supporting}</p></header>
   <div className="story-method-layout"><div className="story-chapters"><span className="story-spine" aria-hidden="true"><i/></span>{copy.steps.map((step,index)=>{const Icon=icons[index];return <article key={index} className="story-chapter" data-story-chapter={index} aria-labelledby={`story-step-${index}`}><span className="story-step-number" aria-hidden="true">0{index+1}</span><div className="story-chapter-content"><div className="story-step-label"><Icon size={18} strokeWidth={1.4} aria-hidden="true"/><span>{step.tag}</span></div><h3 id={`story-step-${index}`}>{step.title}</h3><p>{step.body}</p></div></article>;})}</div>
    <div className="story-visual" aria-hidden="true"><div className="story-board"><div className="story-board-heading"><span>{t.about.engineeringFocusTitle}</span><span className="story-board-counter" dir="ltr">01—03</span></div><div className="story-evidence">{processIllustrations.map((image,i)=><figure key={image.src} className="story-sheet" data-story-sheet={i}><div className="story-sheet-top"><span>0{i+1}</span><span>{copy.steps[i].title}</span></div><div className="story-sheet-image"><ProcessImage image={image}/></div><figcaption><span>{copy.steps[i].tag}</span></figcaption></figure>)}</div><div className="story-board-meter"><i/></div><div className="story-board-footer">{t.about.engineeringFocus.slice(0,3).map(focus=><span key={focus}>{focus}</span>)}</div></div></div>
   </div><div className="story-method-foot"><NavLink className="pulse-text-link" route={{...route,page:'about',project:undefined}} navigate={navigate}>{labels.readMore}<ArrowUpRight size={18} aria-hidden="true"/></NavLink><span>{t.about.focusValue}</span></div>
  </div></section>
  <section className="story-career vision-canvas" id="vision-person" aria-labelledby="story-career-title"><header className="story-heading"><div><span className="pulse-kicker">03 / {labels.nav.experience}</span><h2 id="story-career-title">{copy.career}</h2></div><NavLink className="pulse-text-link" route={{...route,page:'experience',project:undefined}} navigate={navigate}>{t.resume.journeyTitle}<ArrowUpRight size={18} aria-hidden="true"/></NavLink></header>
   <ol className="story-career-list">{t.resume.experience.map((entry,index)=>{const role=entry.roles?.[0],brand=experienceAssets[entry.id];return <li key={entry.id} className="story-career-entry"><div className={`story-career-company${brand?' story-career-company--branded':''}`}>{brand&&<span className="story-career-logo" aria-hidden="true"><img src={brand.image.replace(/\.webp$/,'-thumb-320.webp')} width={52} height={52} alt="" loading="lazy" decoding="async"/></span>}<div><span className="story-career-number" aria-hidden="true">0{index+1}</span><h3>{entry.company}</h3><p>{entry.location}</p></div></div><div className="story-career-role"><h4>{role?.title??entry.role}</h4><p>{role?.employment??entry.employment}<span aria-hidden="true"> · </span>{role?.mode??entry.mode}</p></div><span className="story-career-period">{role?.period??entry.period}</span><span className="story-career-rule" aria-hidden="true"/></li>;})}</ol>
  </section>
  <section className="story-contact" id="vision-contact" aria-labelledby="story-contact-title"><div className="vision-canvas"><header className="story-contact-heading"><span className="pulse-kicker">04 / {labels.nav.contact}</span><span>{t.identity.location}</span></header><div className="story-contact-layout"><div><p className="story-contact-prompt">{copy.contact}</p><h2 id="story-contact-title">{home.conversation.split(' ').map((word,i)=><React.Fragment key={i}>{i>0&&' '}<span className="story-word-mask"><span className="story-contact-word">{word}</span></span></React.Fragment>)}</h2><p className="story-contact-intro">{t.contact.heading}</p></div><NavLink className="story-contact-action" route={{...route,page:'contact',project:undefined}} navigate={navigate}><span>{copy.write}</span><span className="story-arrow-disc"><ArrowRight size={36} strokeWidth={1.25} aria-hidden="true"/></span></NavLink></div><div className="story-correspondence"><span className="story-correspondence-rule" aria-hidden="true"/><a className="story-email" href={profile.social.email}><Mail size={20} strokeWidth={1.4} aria-hidden="true"/><bdi>{profile.email}</bdi><ArrowUpRight size={18} aria-hidden="true"/></a><a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight size={17} aria-hidden="true"/></a><a href={RESUME_PDF} target="_blank" rel="noopener noreferrer">{t.hero.actions.downloadResume}<ArrowDown size={17} aria-hidden="true"/></a></div></div></section>
 </div>;
}
