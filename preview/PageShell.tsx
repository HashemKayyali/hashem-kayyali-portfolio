import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import Glyph from './Glyph';
import {gsap} from 'gsap';
import {holdSmoothScroll} from './smooth-scroll';
import {ChevronDown,Plus} from 'lucide-react';
import {useI18n} from '../i18n/useI18n';
import LanguageMenu from './LanguageMenu';
import BrandMark from './BrandMark';
import ThemeMenu from './ThemeMenu';
import {profile} from '../data/profile';
import {CORE_PAGES,previewUrl,type Navigate,type PreviewRoute} from './routes';
import {studioCopy} from './studio-copy';
import {pageCopy} from './page-copy';
import {prefetchCaseStudy} from './case-loader';
import {preloadProjectImage,rememberProjectLink} from './project-transit';

export const ReviewExperience=createContext<PreviewRoute['experience']>(undefined);
export function NavLink({route:destination,navigate,hash='',children,onClick,...props}:{route:PreviewRoute;navigate:Navigate;hash?:string}&React.AnchorHTMLAttributes<HTMLAnchorElement>) {
 const experience=useContext(ReviewExperience),route=experience?{...destination,experience}:destination;
 const prefetch=()=>{if(route.project){void prefetchCaseStudy().catch(()=>{});void preloadProjectImage(route.project);}};
 return <a {...props} href={previewUrl(route,hash)} onPointerEnter={event=>{props.onPointerEnter?.(event);prefetch();}} onFocus={event=>{props.onFocus?.(event);prefetch();}} onClick={event=>{onClick?.(event);if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||props.target==='_blank')return;event.preventDefault();prefetch();rememberProjectLink(route,event.currentTarget);navigate(route,hash);}}>{children}</a>;
}

export function Header({route,navigate}:{route:PreviewRoute;navigate:Navigate}) {
 const {t,locale}=useI18n();const copy=pageCopy[locale];
 const [open,setOpen]=useState(false);const toggle=useRef<HTMLButtonElement>(null),header=useRef<HTMLElement>(null);
 useEffect(()=>setOpen(false),[route.page,route.project,route.locale]);
 useEffect(()=>{if(!open)return;const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);toggle.current?.focus();}};addEventListener('keydown',escape);return()=>removeEventListener('keydown',escape);},[open]);
 useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!header.current?.contains(event.target as Node))setOpen(false);};addEventListener('pointerdown',outside);return()=>removeEventListener('pointerdown',outside);},[open]);
 useEffect(()=>{
  // Phone/tablet menu: a full sheet below the header. GSAP owns the opening; CSS owns the close.
  const nav=header.current?.querySelector<HTMLElement>('#primary-navigation'),root=document.documentElement,compact=matchMedia('(max-width:800px)');
  const leave=()=>{if(!compact.matches)setOpen(false);};compact.addEventListener('change',leave);
  const locked=open&&compact.matches;root.toggleAttribute('data-menu-open',locked);
  // iOS Safari still scrolls the page under overflow:hidden; touch drags move only a sheet that can scroll.
  const block=(event:TouchEvent)=>{if(nav?.contains(event.target as Node)&&nav.scrollHeight>nav.clientHeight)return;if(event.cancelable)event.preventDefault();};
  if(locked){document.addEventListener('touchmove',block,{passive:false});holdSmoothScroll(true);}
  const ctx=nav&&open&&compact.matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches?gsap.context(()=>{
   gsap.fromTo(nav,{clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.62,ease:'expo.out',clearProps:'clipPath'});
   gsap.fromTo(nav.querySelectorAll(':scope>a,:scope>.studio-nav,:scope>.nav-sheet-foot'),{y:28,autoAlpha:0},{y:0,autoAlpha:1,duration:.72,ease:'expo.out',stagger:.045,delay:.05,clearProps:'transform,opacity,visibility'});
  },nav):undefined;
  return()=>{ctx?.revert();compact.removeEventListener('change',leave);root.removeAttribute('data-menu-open');if(locked){document.removeEventListener('touchmove',block);holdSmoothScroll(false);}};
 },[open]);
 useEffect(()=>{
  // A hairline shadow once the page moves under the sticky header.
  let frame=0;const sync=()=>{frame=0;header.current?.toggleAttribute('data-scrolled',scrollY>8);};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(sync);};sync();addEventListener('scroll',schedule,{passive:true});
  return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',schedule);};
 },[]);
 return <header ref={header} className="site-header" onBlurCapture={event=>{if(open&&!event.currentTarget.contains(event.relatedTarget as Node))setOpen(false);}}><div className="container header-layout">
  <NavLink className="signature" route={{locale,page:'home'}} navigate={navigate} aria-label={t.navigation.home}><BrandMark className="monogram"/><span>{t.identity.name}</span></NavLink>
  <div className="header-preferences"><LanguageMenu/><ThemeMenu/></div>
  <button ref={toggle} className="navigation-toggle" aria-controls="primary-navigation" aria-expanded={open} aria-label={open?t.navigation.closeNavigation:t.navigation.openNavigation} onClick={()=>setOpen(value=>!value)}>{open?copy.closeMenu:copy.menu}<Plus className="navigation-toggle-icon" aria-hidden="true" size={16} strokeWidth={1.75}/></button>
  <nav id="primary-navigation" aria-label={t.navigation.primaryNavigation} data-open={open}>{CORE_PAGES.map(page=><NavLink key={page} route={{locale,page}} navigate={navigate} aria-current={(route.project?'projects':route.page)===page?'page':undefined} onClick={()=>setOpen(false)}>{copy.nav[page]}</NavLink>)}<StudioNav route={route} navigate={navigate} close={()=>setOpen(false)}/><div className="nav-sheet-foot"><a href={profile.social.email}>{t.contact.index.email}</a><a href={profile.social.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a><a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></div></nav>
 </div></header>;
}

function StudioNav({route,navigate,close}:{route:PreviewRoute;navigate:Navigate;close:()=>void}){
 const root=useRef<HTMLDetailsElement>(null),{locale}=useI18n(),copy=studioCopy[locale];
 useEffect(()=>{if(root.current)root.current.open=false;},[route.page,route.locale]);
 return <details ref={root} className="studio-nav" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))event.currentTarget.open=false;}} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus();}}}><summary data-active={['gallery','journal'].includes(route.page)}>{copy.studio}<ChevronDown className="studio-nav-chevron" aria-hidden="true" size={14} strokeWidth={1.75}/></summary><div>{(['gallery','journal'] as const).map(page=><NavLink key={page} route={{locale,page}} navigate={navigate} aria-current={route.page===page?'page':undefined} onClick={close}>{copy[page]}</NavLink>)}</div></details>;
}

export function ContactLinks() {
 const {t}=useI18n();
 return <div className="contact-links" aria-label={t.contact.aria}>
  <a href={profile.social.email}><span>{t.contact.index.email}</span><bdi>{profile.email}</bdi><span className="arrow" aria-hidden="true"><Glyph name="up-right"/></span></a>
  <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer"><span>LinkedIn</span><bdi>{profile.linkedinHandle}</bdi><span className="arrow" aria-hidden="true"><Glyph name="up-right"/></span></a>
  <a href={profile.social.whatsapp} target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><bdi>{profile.phone}</bdi><span className="arrow" aria-hidden="true"><Glyph name="up-right"/></span></a>
  <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer"><span>Instagram</span><bdi>{profile.instagramHandle}</bdi><span className="arrow" aria-hidden="true"><Glyph name="up-right"/></span></a>
 </div>;
}

export function Footer({route,navigate}:{route:PreviewRoute;navigate:Navigate}) {
 const {t,locale}=useI18n();
 return <footer className="compact-footer container"><span>© {new Date().getFullYear()} {t.footer.copyrightName}</span><span>{t.identity.location}</span><NavLink route={{locale,page:'contact'}} navigate={navigate}>{pageCopy[locale].nav.contact}<span aria-hidden="true"><Glyph name="up-right"/></span></NavLink></footer>;
}
