import React,{useEffect,useRef,useState} from 'react';
import {Globe2,ChevronDown,Check} from 'lucide-react';
import {useI18n} from '../i18n/useI18n';
import {LOCALES,LOCALE_META} from '../i18n/config';

/** A consistent, non-modal language menu. Opening and focusing never scroll. */
export default function LanguageMenu(){
 const {t,locale,setLocale}=useI18n();
 const [open,setOpen]=useState(false),[active,setActive]=useState<number>(LOCALES.indexOf(locale));
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const focusItem=(index:number)=>{const next=(index+LOCALES.length)%LOCALES.length;setActive(next);root.current?.querySelectorAll<HTMLButtonElement>('[role=menuitemradio]')[next]?.focus({preventScroll:true});};
 const close=()=>{setOpen(false);trigger.current?.focus({preventScroll:true});};
 useEffect(()=>{if(open){window.dispatchEvent(new CustomEvent('portfolio-preference-open',{detail:'language'}));focusItem(LOCALES.indexOf(locale));}},[open]);
 useEffect(()=>{const other=(e:Event)=>{if((e as CustomEvent).detail!=='language')setOpen(false);};window.addEventListener('portfolio-preference-open',other);return()=>window.removeEventListener('portfolio-preference-open',other);},[]);
 useEffect(()=>{setOpen(false);},[locale]);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 return <div ref={root} className="language-select language-menu" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
  <button ref={trigger} className="language-trigger" type="button" aria-label={`${t.navigation.selectLanguage}: ${LOCALE_META[locale].nativeName}`} aria-haspopup="menu" aria-expanded={open} aria-controls="language-options" onClick={()=>setOpen(v=>!v)} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);}if(e.key==='Escape'){e.preventDefault();close();}}}><Globe2 size={16} aria-hidden="true"/><span lang={locale}>{LOCALE_META[locale].nativeName}</span><ChevronDown size={13} aria-hidden="true"/></button>
  {open&&<div id="language-options" className="language-options" role="menu" aria-label={t.navigation.selectLanguage} onKeyDown={e=>{if(['ArrowDown','ArrowUp','Home','End','Escape'].includes(e.key))e.preventDefault();if(e.key==='ArrowDown')focusItem(active+1);if(e.key==='ArrowUp')focusItem(active-1);if(e.key==='Home')focusItem(0);if(e.key==='End')focusItem(LOCALES.length-1);if(e.key==='Escape')close();}}>{LOCALES.map((language,index)=><button type="button" key={language} role="menuitemradio" aria-checked={locale===language} tabIndex={active===index?0:-1} onFocus={()=>setActive(index)} onClick={()=>{close();if(language!==locale)setLocale(language);}}><span className="language-code" aria-hidden="true">{language.toUpperCase()}</span><span lang={language} dir={language==='ar'?'rtl':'ltr'}>{LOCALE_META[language].nativeName}</span>{locale===language&&<Check size={14} aria-hidden="true"/>}</button>)}</div>}
 </div>;
}
