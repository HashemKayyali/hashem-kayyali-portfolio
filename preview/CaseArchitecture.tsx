import React from 'react';
import {useI18n} from '../i18n/useI18n';
import type {ProjectAsset} from '../data/projectAssets';
import {caseCopy} from './case-copy';
/** Relationship diagrams illustrate only the approved copy, never a fabricated UI. */
export default function CaseArchitecture({asset,compact=false}:{asset:ProjectAsset;compact?:boolean}) {
 const {t,locale}=useI18n(),copy=t.projects[asset.id],labels=caseCopy[locale];
 const hardware=asset.id==='bike-tower',terminal=asset.id==='terminal-nfc',access=asset.id==='umniah-youthconnect';
 const nodes=hardware?[
  {title:labels.input,detail:copy.capabilities[0]},
  {title:'ESP32-S3',detail:labels.processing},
  {title:'WebSockets / UDP',detail:labels.network},
  {title:'Flutter',detail:labels.controller},
  {title:copy.capabilities[2],detail:'LED Control'},
 ]:terminal?[
  {title:'RFID',detail:labels.termAuth},
  {title:labels.termClients,detail:labels.termClientsDetail},
  {title:'Supabase',detail:labels.termData},
  {title:labels.termDashboard,detail:labels.termDashboardDetail},
  {title:labels.termSensors,detail:labels.termSensorsDetail},
 ]:access?[
  {title:labels.member,detail:'Flutter / Dart'},
  {title:'Supabase',detail:labels.sharedData},
  {title:labels.access,detail:labels.leader},
  {title:copy.capabilities[2],detail:''},
 ]:asset.id==='eventies'?[
  {title:copy.capabilities[0],detail:'Next.js / TypeScript'},
  {title:copy.capabilities[1],detail:''},
  {title:'Supabase',detail:labels.sharedData},
  {title:copy.capabilities[2],detail:''},
 ]:asset.id==='basket-beats'?[
  {title:'Sensors',detail:labels.input},{title:'Embedded C++',detail:copy.capabilities[0]},
  {title:'WebSockets / UDP',detail:labels.network},{title:'Flutter',detail:copy.capabilities[2]},
 ]:asset.id==='glitzz-lab'?[
  {title:copy.capabilities[0],detail:'Next.js / TypeScript'},
  {title:'Supabase',detail:copy.capabilities[1]},
  {title:'Meta WhatsApp',detail:copy.capabilities[2]},
 ]:asset.id==='vr-cycling'?[
  {title:copy.capabilities[0],detail:labels.input},{title:'Microcontrollers / Embedded C++',detail:labels.processing},
  {title:copy.capabilities[1],detail:copy.capabilities[2]},
 ]:asset.id==='bike-land-trainer'?[
  {title:'Sensors',detail:labels.input},{title:'Embedded C++',detail:labels.processing},
  {title:copy.capabilities[0],detail:''},{title:copy.capabilities[2],detail:''},
 ]:asset.id==='financial-operations'?[
  {title:'React / TypeScript',detail:labels.webApp},
  {title:'Supabase / PostgreSQL',detail:labels.sharedData},
  {title:copy.capabilities[0],detail:''},{title:copy.capabilities[2],detail:''},
 ]:asset.id==='outreach-automation'?[
  {title:copy.capabilities[0],detail:'Next.js / TypeScript'},
  {title:copy.capabilities[1],detail:'SMTP'},
  {title:copy.capabilities[2],detail:'IMAP'},
 ]:[
  {title:'YOLOv8',detail:labels.trDetect},
  {title:'BoT-SORT',detail:labels.trTrack},
  {title:labels.trCount,detail:labels.trCountDetail},
  {title:'PySide6',detail:labels.trUi},
  {title:'CSV / Excel',detail:labels.trReports},
 ];
 return <figure className={`case-architecture${compact?' case-architecture--compact':''}`} aria-label={labels.illustration}>
  <div className="system-caption"><span className="brand-dash" aria-hidden="true"/><span>{labels.illustration}</span></div>
  <ol className="system-path">{nodes.map((node,index)=><li key={index} className="system-node"><span className="system-number" aria-hidden="true" dir="ltr">{String(index+1).padStart(2,'0')}</span><strong><bdi>{node.title}</bdi></strong>{node.detail&&<small><bdi>{node.detail}</bdi></small>}<span className="system-connector" aria-hidden="true"/></li>)}</ol>
  {!compact&&<figcaption>{copy.engineering}</figcaption>}
 </figure>;
}
