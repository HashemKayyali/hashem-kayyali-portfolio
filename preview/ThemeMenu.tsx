import React,{useEffect,useRef,useState} from 'react';
import {Check,ChevronDown,Contrast} from 'lucide-react';
import {useI18n} from '../i18n/useI18n';
import {applyTheme,THEMES,type ThemeId} from './themes';
const labels={en:{title:'Appearance',names:['Champagne','Bordeaux','Petrol','Aubergine','Sterling']},ar:{title:'المظهر',names:['شامبانيا','بوردو','بترولي','باذنجاني','سترلينغ']},de:{title:'Darstellung',names:['Champagner','Bordeaux','Petrol','Aubergine','Sterling']},fr:{title:'Apparence',names:['Champagne','Bordeaux','Pétrole','Aubergine','Sterling']},es:{title:'Apariencia',names:['Champán','Burdeos','Petróleo','Berenjena','Sterling']}};
export default function ThemeMenu(){
 const {locale}=useI18n(),copy=labels[locale];
 const [id,setId]=useState<ThemeId>(()=>document.documentElement.dataset.theme as ThemeId||'atelier'),[open,setOpen]=useState(false),[active,setActive]=useState(0);
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const selected=THEMES.findIndex(t=>t.id===id),theme=THEMES[selected]??THEMES[0];
 const focus=(index:number)=>{const i=(index+THEMES.length)%THEMES.length;setActive(i);root.current?.querySelectorAll<HTMLButtonElement>('[role=menuitemradio]')[i]?.focus({preventScroll:true});};
 const close=()=>{setOpen(false);trigger.current?.focus({preventScroll:true});};
 useEffect(()=>{if(open){window.dispatchEvent(new CustomEvent('portfolio-preference-open',{detail:'theme'}));focus(selected);}},[open]);
 useEffect(()=>{setOpen(false);},[locale]);
 useEffect(()=>{const changed=()=>setId(document.documentElement.dataset.theme as ThemeId);const other=(e:Event)=>{if((e as CustomEvent).detail!=='theme')setOpen(false);};window.addEventListener('portfolio-theme-change',changed);window.addEventListener('portfolio-preference-open',other);return()=>{window.removeEventListener('portfolio-theme-change',changed);window.removeEventListener('portfolio-preference-open',other);};},[]);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 const swatch=(colors:typeof theme.colors)=><span className="theme-swatches" aria-hidden="true">{[colors.smokeA,colors.smokeB].map((color,i)=><i key={i} style={{background:color}}/>)}</span>;
 return <div ref={root} className="theme-menu" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
  <button ref={trigger} type="button" className="theme-trigger" aria-label={`${copy.title}: ${copy.names[selected]}`} aria-haspopup="menu" aria-expanded={open} aria-controls="theme-options" onClick={()=>setOpen(v=>!v)} onKeyDown={e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();setOpen(true);}if(e.key==='Escape'){e.preventDefault();close();}}}><Contrast className="theme-emblem" size={17} strokeWidth={1.4} aria-hidden="true"/><span className="theme-trigger-label">{copy.names[selected]}</span><ChevronDown className="theme-chevron" size={12} aria-hidden="true"/></button>
  {open&&<div id="theme-options" className="theme-options" role="menu" aria-label={copy.title} onKeyDown={e=>{if(['ArrowDown','ArrowUp','Home','End','Escape'].includes(e.key))e.preventDefault();if(e.key==='ArrowDown')focus(active+1);if(e.key==='ArrowUp')focus(active-1);if(e.key==='Home')focus(0);if(e.key==='End')focus(THEMES.length-1);if(e.key==='Escape')close();}}>{THEMES.map((t,i)=><button key={t.id} type="button" data-theme-choice={t.id} role="menuitemradio" aria-checked={id===t.id} tabIndex={active===i?0:-1} onFocus={()=>setActive(i)} onClick={()=>{applyTheme(t.id);close();}}>{swatch(t.colors)}<span>{copy.names[i]}</span>{id===t.id&&<Check size={15} aria-hidden="true"/>}</button>)}</div>}
 </div>;
}
