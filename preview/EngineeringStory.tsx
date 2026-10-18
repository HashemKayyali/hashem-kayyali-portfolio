import React from 'react';
import {useI18n} from '../i18n/useI18n';
import {isSuppliedCover,type ProjectAsset} from '../data/projectAssets';
import {caseCopy} from './case-copy';
import StoryMedia from './StoryMedia';
import {storyCopy} from './story-copy';
import MotionField from './MotionField';

function Architecture() {
 const {locale}=useI18n();const copy=storyCopy[locale];
 return <figure className="architecture" aria-label={copy.diagram}>
  <div className="architecture-clients" dir="ltr"><span><b>WPF POS</b><small>{copy.terminal[0]}</small></span><span><b>NFC</b><small>{copy.terminal[1]}</small></span></div>
  <div className="architecture-links" aria-hidden="true"><span>↓</span><span>↓</span></div>
  <div className="architecture-api"><span className="index">01 — API</span><strong dir="ltr">.NET Web API</strong><p>{copy.terminal[2]}</p></div>
  <div className="architecture-links" aria-hidden="true"><span>↕</span><span>↕</span></div>
  <div className="architecture-clients"><span><b>{locale==='ar'?'البيانات المركزية':locale==='de'?'Zentrale Daten':locale==='fr'?'Données centrales':locale==='es'?'Datos centrales':'Central data'}</b><small>{locale==='ar'?'الحسابات · الفواتير · الاستخدام':locale==='de'?'Konten · Rechnungen · Nutzung':locale==='fr'?'Comptes · factures · utilisation':locale==='es'?'Cuentas · facturas · uso':'Accounts · invoices · usage'}</small></span><span><b>{locale==='ar'?'الأجهزة المتصلة':locale==='de'?'Verbundene Geräte':locale==='fr'?'Appareils connectés':locale==='es'?'Dispositivos conectados':'Connected devices'}</b><small>{copy.terminal[2]}</small></span></div>
  <figcaption>{copy.diagram}</figcaption>
 </figure>;
}

export default function EngineeringStory({asset}:{asset:ProjectAsset}) {
 const {t,locale}=useI18n();const labels=storyCopy[locale],copy=t.projects[asset.id];
 if(!['bike-tower','terminal-nfc','eventies'].includes(asset.id)) return null;
 const bike=asset.id==='bike-tower',terminal=asset.id==='terminal-nfc';
 const headings=bike?labels.bike:terminal?labels.terminal:labels.eventies;
 const sources=bike?[asset.image,asset.gallery[0],'concept:bike-concept']:terminal?[asset.image,asset.gallery[0],null]:[asset.gallery[0],asset.gallery[1],'concept:eventies-concept'];
 const captions=bike?[labels.real,labels.redacted,labels.concept]:terminal?[isSuppliedCover(asset.image)?caseCopy[locale].supplied:labels.redacted,labels.redacted,labels.diagram]:[labels.real,labels.real,labels.concept];
 // New story captions refer to the approved project data; no duplicated facts database.
 const paragraphs=[copy.capabilities[0],copy.capabilities[1],copy.capabilities[2]??copy.short];
 return <section className={`container engineering-story story--${asset.id}`} aria-labelledby="engineering-story-title" data-progress="0">
  <header className="story-heading"><span className="index">{t.projectsSection.filters[asset.categoryKey]}</span><h2 id="engineering-story-title">{labels.story}</h2></header>
  <div className="story-track"><span className="story-progress" aria-hidden="true"/>
   {headings.map((heading,index)=><article className={`story-step story-step--${index}`} key={heading}>
    <span className="story-node" aria-hidden="true">0{index+1}</span>
    <div className="story-step-copy"><h3>{heading}</h3><p>{paragraphs[index]}</p>{index===1&&<p className="story-technology" dir="ltr">{copy.technology.slice(0,4).join(' / ')}</p>}</div>
    {sources[index] ? <figure className={`story-visual ${index===2?'concept-visual':''}`}>
     {asset.id==='eventies'&&index===1&&<MotionField className="spotlight-field"/>}
     <div className="story-media-mask"><StoryMedia source={sources[index]!} alt={`${copy.title} — ${headings[index]}. ${captions[index]}`}/></div><figcaption>{captions[index]}</figcaption>
    </figure>:<Architecture/>}
   </article>)}
  </div>
 </section>;
}
