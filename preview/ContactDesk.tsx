import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Mail,MessageCircle,ArrowUpRight,MapPin,Copy,Check} from 'lucide-react';
import {useI18n} from '../i18n/useI18n';
import {profile} from '../data/profile';
import {pageCopy} from './page-copy';
import {contactDraft,type ContactInput} from './contact-model';
import {useContactDeskMotion} from './contact-desk-motion';
import CompactHero from './CompactHero';
import './contact-hero.css';

const utilityCopy={
 en:{copy:'Copy email address',copied:'Email address copied',failed:'Select the email address above to copy it.'},
 ar:{copy:'انسخ البريد الإلكتروني',copied:'تم نسخ البريد الإلكتروني',failed:'حدد عنوان البريد أعلاه لنسخه.'},
 de:{copy:'E-Mail-Adresse kopieren',copied:'E-Mail-Adresse kopiert',failed:'Markieren Sie die E-Mail-Adresse oben, um sie zu kopieren.'},
 fr:{copy:'Copier l’adresse e-mail',copied:'Adresse e-mail copiée',failed:'Sélectionnez l’adresse e-mail ci-dessus pour la copier.'},
 es:{copy:'Copiar correo electrónico',copied:'Correo electrónico copiado',failed:'Selecciona la dirección de arriba para copiarla.'},
};
const Arrow=()=> <ArrowUpRight className="desk-arrow" size={18} aria-hidden="true"/>;

export default function ContactDesk(){
 const {t,locale}=useI18n(),copy=pageCopy[locale],utility=utilityCopy[locale];
 const root=useRef<HTMLElement>(null),draftLink=useRef<HTMLAnchorElement>(null),copyTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),alive=useRef(true);
 const [values,setValues]=useState<ContactInput>({name:'',email:'',message:''});
 const [stage,setStage]=useState<'idle'|'invalid'|'prepared'>('idle'),[draft,setDraft]=useState(''),[invalid,setInvalid]=useState<Record<string,boolean>>({});
 const [copied,setCopied]=useState<'idle'|'copied'|'failed'>('idle');
 const showStatus=stage!=='idle'||Object.values(invalid).some(Boolean);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;clearTimeout(copyTimer.current);};},[]);
 useLayoutEffect(()=>{if(stage==='prepared')draftLink.current?.focus({preventScroll:true});},[stage]);
 useContactDeskMotion(root,locale);
 const update=(field:keyof ContactInput,value:string)=>{setValues(previous=>({...previous,[field]:value}));setStage('idle');setDraft('');setInvalid(previous=>({...previous,[field]:false}));};
 const copyEmail=async()=>{clearTimeout(copyTimer.current);try{await navigator.clipboard.writeText(profile.email);if(!alive.current)return;setCopied('copied');copyTimer.current=setTimeout(()=>{if(alive.current)setCopied('idle');},2500);}catch{if(alive.current)setCopied('failed');}};
 const submit=(event:React.FormEvent<HTMLFormElement>)=>{
  event.preventDefault();const uri=contactDraft(values,profile.email);
  if(!uri){const field=!values.name.trim()?'name':values.message.trim().length<10?'message':'email';setInvalid({[field]:true});setStage('invalid');setDraft('');event.currentTarget.querySelector<HTMLElement>(`[name="${field}"]`)?.focus({preventScroll:true});return;}
  setInvalid({});setDraft(uri);setStage('prepared');
 };
 return <main ref={root} className="page-content contact-page contact-desk" id="main" tabIndex={-1}>
  <CompactHero className="contact-opening" eyebrow={'05 / '+t.contact.eyebrow} title={t.contact.title} description={t.contact.heading} visual={<div className="contact-hero-art" aria-hidden="true"><Mail size={108} strokeWidth={.8}/><span><MessageCircle size={26} strokeWidth={1.2}/><bdi>{profile.email}</bdi><ArrowUpRight size={23}/></span><i><MapPin size={15}/>{t.identity.location}</i></div>}/>
  <div className="container desk-container">
   <div className="desk-layout">
    <aside className="desk-direct" id="contact-direct" aria-label={t.contact.aria}>
     <p className="desk-introduction">{t.contact.supporting}</p>
     <div className="desk-channel-group">
      <div className="desk-email-pair"><a className="desk-channel desk-email" href={profile.social.email}><span className="desk-channel-icon"><Mail size={19} aria-hidden="true"/></span><span className="desk-channel-copy"><span>{t.contact.actions.email}</span><bdi>{profile.email}</bdi></span><Arrow/></a><button className="desk-copy" type="button" onClick={copyEmail} aria-label={copied==='copied'?utility.copied:utility.copy} title={copied==='copied'?utility.copied:utility.copy}>{copied==='copied'?<Check size={17} aria-hidden="true"/>:<Copy size={17} aria-hidden="true"/>}</button></div>
      {copied!=='idle'&&<p className="desk-copy-status" role="status" aria-live="polite">{copied==='copied'?utility.copied:utility.failed}</p>}
      <a className="desk-channel desk-whatsapp" href={profile.social.whatsapp} target="_blank" rel="noopener noreferrer"><span className="desk-channel-icon"><MessageCircle size={19} aria-hidden="true"/></span><span className="desk-channel-copy"><span>{t.contact.actions.whatsapp}</span><bdi>{profile.phone}</bdi></span><Arrow/></a>
      <div className="desk-socials"><a className="desk-channel" href={profile.social.linkedin} target="_blank" rel="noopener noreferrer"><span className="desk-channel-copy"><span>{t.contact.index.linkedin}</span><bdi>{profile.linkedinHandle}</bdi></span><Arrow/></a><a className="desk-channel" href={profile.social.instagram} target="_blank" rel="noopener noreferrer"><span className="desk-channel-copy"><span>{t.contact.index.instagram}</span><bdi>{profile.instagramHandle}</bdi></span><Arrow/></a></div>
     </div>
     <div className="desk-signature"><span>{t.identity.name}</span><span><MapPin size={13} aria-hidden="true"/>{t.identity.location}</span></div>
    </aside>
    <section className="contact-form-region desk-compose" id="contact-compose" aria-labelledby="contact-form-title" data-draft-state={stage}>
     <span className="desk-compose-edge" aria-hidden="true"/>
     <header className="desk-compose-header"><div><span className="index" dir="ltr">01 / 02</span><h2 id="contact-form-title">{copy.formTitle}</h2></div><span className="desk-postmark" aria-hidden="true"><Mail size={24}/></span></header>
     <p className="form-help" id="contact-form-help">{copy.formHelp}</p>
     <form className="contact-form desk-form" onSubmit={submit} onReset={()=>{setValues({name:'',email:'',message:''});setDraft('');setStage('idle');setInvalid({});}} onInvalid={event=>{const name=(event.target as HTMLInputElement).name;setInvalid(previous=>({...previous,[name]:true}));setStage('invalid');}}>
      <div className="desk-field-pair"><label htmlFor="contact-name">{copy.name}<input id="contact-name" name="name" autoComplete="name" required maxLength={80} pattern={'.*\\S.*'} value={values.name} onChange={event=>update('name',event.target.value)} aria-invalid={invalid.name||undefined} aria-describedby={invalid.name?'contact-feedback':undefined}/></label><label htmlFor="contact-email">{copy.email}<input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} dir="ltr" value={values.email} onChange={event=>update('email',event.target.value)} aria-invalid={invalid.email||undefined} aria-describedby={invalid.email?'contact-feedback':undefined}/></label></div>
      <label htmlFor="contact-message"><span className="desk-message-label">{copy.message}<bdi className="desk-character-count" aria-hidden="true">{values.message.length} / 4000</bdi></span><textarea id="contact-message" name="message" required minLength={10} maxLength={4000} rows={4} value={values.message} onChange={event=>update('message',event.target.value)} aria-invalid={invalid.message||undefined} aria-describedby={invalid.message?'contact-feedback':undefined}/></label>
      <div className="desk-form-actions">{draft?<a ref={draftLink} className="button-primary prepared-draft" href={draft}>{copy.draft}<Arrow/></a>:<button className="button-primary" type="submit" aria-describedby="contact-form-help">{copy.prepare}<Arrow/></button>}<Mail className="desk-action-mark" size={18} aria-hidden="true"/></div>
      {showStatus&&<p className="form-status" id="contact-feedback" role="status" aria-live="polite">{stage==='prepared'?copy.prepared:copy.invalid}</p>}
     </form>
    </section>
   </div>
  </div>
 </main>;
}
