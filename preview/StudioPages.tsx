import React,{useEffect,useId,useRef,useState} from 'react';
import {ArrowUpRight,Image as ImageIcon,Play,X} from 'lucide-react';
import type {StudioMedia,StudioPost} from '../studio/contracts';
import type {Locale,ProjectId} from '../content/types';
import {useI18n} from '../i18n/useI18n';
import type {Navigate,PreviewRoute} from './routes';
import BrandMark from './BrandMark';
import CompactHero from './CompactHero';
import {useStudioContent} from './StudioProvider';
import {studioCopy,type StudioCopy} from './studio-copy';
import {studioSourceUrl} from './studio-client';
import './studio.css';

export type StudioPageProps={route:PreviewRoute;navigate:Navigate};
export const studioDate=(date:string,locale:Locale)=>{const value=new Date(date);return Number.isNaN(value.getTime())?'':new Intl.DateTimeFormat(locale,{year:'numeric',month:'short',day:'numeric'}).format(value);};
export function StudioMediaView({media,alt,controls=false}:{media:StudioMedia;alt?:string;controls?:boolean}){
 return media.kind==='video'?<video src={controls?media.url:undefined} poster={media.poster_url??undefined} controls={controls} preload="none" playsInline aria-label={alt||media.alt} width={media.width||undefined} height={media.height||undefined}/>:<img src={media.url} alt={alt||media.alt} loading="lazy" decoding="async" width={media.width||undefined} height={media.height||undefined}/>;
}
function StudioState({kind,copy}:{kind:'gallery'|'journal';copy:StudioCopy}){
 const {status,reload}=useStudioContent();
 return <div className="studio-empty" role="status"><ImageIcon size={28} aria-hidden="true"/><p>{status==='loading'?copy.loading:status==='error'?copy.unavailable:kind==='gallery'?copy.emptyGallery:copy.emptyJournal}</p>{status==='error'&&<button className="studio-button" onClick={()=>void reload()}>{copy.retry}</button>}</div>;
}
export function StudioLightbox({media,alt,caption,close,copy}:{key?:string;media:StudioMedia;alt?:string;caption?:string;close:()=>void;copy:StudioCopy}){
 const ref=useRef<HTMLDialogElement>(null),id=useId();
 useEffect(()=>{const dialog=ref.current,previous=document.activeElement as HTMLElement|null;if(!dialog)return;dialog.showModal();return()=>{dialog.querySelectorAll('video').forEach(video=>{video.pause();video.removeAttribute('src');video.load();});if(dialog.open)dialog.close();previous?.focus({preventScroll:true});};},[]);
 return <dialog ref={ref} className="studio-lightbox" aria-label={copy.open} aria-describedby={caption?id:undefined} onCancel={event=>{event.preventDefault();close();}} onClick={event=>{if(event.target===event.currentTarget)close();}}><div className="studio-lightbox-inner"><button className="studio-icon-button studio-close" autoFocus onClick={close} aria-label={copy.close}><X size={22}/></button><StudioMediaView media={media} alt={alt} controls/>{caption&&<p id={id} dir="auto">{caption}</p>}</div></dialog>;
}
export function StudioGallery({route}:StudioPageProps){
 const {t}=useI18n(),copy=studioCopy[route.locale],{content,status}=useStudioContent();
 const [kind,setKind]=useState('all'),[project,setProject]=useState('all'),[selected,setSelected]=useState<string|null>(null);
 const entries=content.gallery.filter(item=>item.published&&item.media),projects=Array.from(new Set(entries.flatMap(item=>item.project_id?[item.project_id]:[])));
 const visible=entries.filter(item=>(kind==='all'||item.media?.kind===kind)&&(project==='all'||item.project_id===project)),active=entries.find(item=>item.id===selected);
 return <main id="main" tabIndex={-1} className="page-content studio-page"><CompactHero eyebrow={copy.gallery} title={copy.galleryIntro} description={copy.galleryDescription} visual={<div className="studio-hero-art studio-hero-art--gallery" aria-hidden="true">{[0,1,2].map(i=><span key={i} className="studio-frame"><i/></span>)}<span className="studio-hero-caption"><ImageIcon size={16}/>01 / {copy.studio}</span></div>}/><section className="studio-container" aria-label={copy.gallery}><div className="studio-toolbar"><div className="studio-segments" aria-label={copy.all}>{(['all','image','video']as const).map(value=><button key={value} className="studio-button" aria-pressed={kind===value} onClick={()=>setKind(value)}>{copy[value]}</button>)}</div>{projects.length>0&&<label className="studio-filter"><span>{copy.project}</span><select value={project} onChange={event=>setProject(event.target.value)}><option value="all">{copy.allProjects}</option>{projects.map(id=><option key={id} value={id}>{t.projects[id as ProjectId]?.title??id}</option>)}</select></label>}</div>{!entries.length?<StudioState kind="gallery" copy={copy}/>:!visible.length?<p className="studio-empty" role="status">{copy.emptyFilter}</p>:<div className="studio-masonry" aria-busy={status==='loading'}>{visible.map(item=><figure className="studio-gallery-item" key={item.id}><button className="studio-media-trigger" onClick={()=>setSelected(item.id)} aria-label={`${copy.open}: ${item.title||item.alt||item.media!.alt}`}><StudioMediaView media={item.media!} alt={item.alt}/><span className="studio-media-kind" aria-hidden="true">{item.media!.kind==='video'?<Play size={16}/>:<ArrowUpRight size={16}/>}</span></button><figcaption>{item.title&&<h2 dir="auto">{item.title}</h2>}{item.caption&&<p dir="auto">{item.caption}</p>}<time dateTime={item.authored_at}>{studioDate(item.authored_at,route.locale)}</time></figcaption></figure>)}</div>}</section>{active?.media&&<StudioLightbox key={active.id} media={active.media} alt={active.alt} caption={active.caption||active.title} copy={copy} close={()=>setSelected(null)}/>}</main>;
}
export function StudioPostCard({post,locale,author,copy}:{key?:string;post:StudioPost;locale:Locale;author:string;copy:StudioCopy}){
 const [expanded,setExpanded]=useState(false),id=useId(),long=post.caption.length>420;
 return <article className="studio-post"><header className="studio-post-header"><BrandMark className="studio-author-mark"/><div><h2>{author}</h2><time dateTime={post.authored_at}>{studioDate(post.authored_at,locale)}</time></div></header>{post.media&&<div className="studio-post-media"><StudioMediaView media={post.media} controls/></div>}<div className="studio-post-body"><p id={id} dir="auto" className={long&&!expanded?'studio-caption-clamped':undefined}>{post.caption}</p>{long&&<button className="studio-text-button" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(value=>!value)}>{expanded?copy.readLess:copy.readMore}</button>}{post.source_url&&studioSourceUrl(post.source_url)&&<a className="studio-original" href={post.source_url} target="_blank" rel="noopener noreferrer">{copy.original}<ArrowUpRight size={16} aria-hidden="true"/></a>}</div></article>;
}
export function StudioJournal({route}:StudioPageProps){
 const {t}=useI18n(),copy=studioCopy[route.locale],{content}=useStudioContent(),posts=content.posts.filter(post=>post.published&&post.media);
 return <main id="main" tabIndex={-1} className="page-content studio-page"><CompactHero eyebrow={copy.journal} title={copy.journalIntro} description={copy.journalDescription} visual={<div className="studio-hero-art studio-hero-art--journal" aria-hidden="true">{[0,1,2].map(i=><span key={i} className="studio-sheet"><b>“</b><i/><i/><i/></span>)}<span className="studio-hero-caption">02 / {copy.studio}</span></div>}/><section className="studio-container studio-journal" aria-label={copy.journal}>{posts.length?posts.map(post=><StudioPostCard key={post.id} post={post} locale={route.locale} author={t.identity.name} copy={copy}/>):<StudioState kind="journal" copy={copy}/>}</section></main>;
}

