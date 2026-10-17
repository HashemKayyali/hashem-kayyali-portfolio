import React from 'react';

/** Approved HK Monogram Tile (17 Oct 2026): Libre Caslon Condensed "HK", outlined, in a softly rounded tile. */
export default function BrandMark({className='',title}:{className?:string;title?:string}) {
 return <svg className={`brand-mark ${className}`} viewBox="0 0 100 100" role={title?'img':undefined} aria-label={title} aria-hidden={title?undefined:true} focusable="false">
  <rect x="5" y="5" width="90" height="90" rx="23" fill="none" stroke="currentColor" strokeWidth="3.5"/>
  <path d="M49.89 61L39.26 61L39.26 59.90L42.53 58.98L42.53 27.95L39.26 27.08L39.26 25.97L49.89 25.97L49.89 27.14L46.67 27.95L46.67 58.98L49.89 59.94L49.89 61ZM32.24 61L21.60 61L21.60 59.90L24.88 58.98L24.88 27.95L21.60 27.08L21.60 25.97L32.24 25.97L32.24 27.08L29.02 27.95L29.02 58.98L32.24 59.90L32.24 61ZM44.34 43.52L27.28 43.52L27.28 41.59L44.34 41.59L44.34 43.52ZM61.15 61L50.51 61L50.51 59.90L53.79 58.98L53.79 27.95L50.51 27.08L50.51 25.97L61.15 25.97L61.15 27.08L57.93 27.95L57.93 43.89L68.01 29.81Q68.33 29.42 68.47 29.06Q68.61 28.71 68.61 28.43L68.61 28.43Q68.61 27.30 65.57 27.08L65.57 27.08L65.57 25.97L75.30 25.97L75.30 27.08Q73.62 27.42 72.67 27.75Q71.71 28.09 71.14 28.57Q70.56 29.05 69.96 29.90L69.96 29.90L62.86 39.98L74.47 58.98L78.40 59.90L78.40 61L70.26 61L60.07 43.91L57.93 46.97L57.93 58.98L61.15 59.90L61.15 61Z" fill="currentColor"/>
  <path d="M36 71.5h28" stroke="var(--hk-accent,currentColor)" strokeWidth="3" strokeLinecap="round"/>
 </svg>;
}
