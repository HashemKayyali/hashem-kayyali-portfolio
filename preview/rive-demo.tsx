// Development-only specimen; never mounted in the portfolio's Hero or entry build.
import React from 'react';
import {createRoot} from 'react-dom/client';
import {I18nContext} from '../i18n/LanguageProvider';
import {loadDictionary} from '../i18n/dictionary-loader';
import ConnectedSignature from './ConnectedSignature';
import './light.css';
import './refinement.css';
import './brand.css';

void loadDictionary('en').then(t=>createRoot(document.getElementById('rive-demo')!).render(
 <I18nContext.Provider value={{locale:'en',dir:'ltr',t,setLocale:()=>{}}}><div style={{padding:24}}><p style={{fontSize:12,color:'var(--muted)'}}>Prepared fallback · focus or activate to inspect interaction states.</p><ConnectedSignature/></div></I18nContext.Provider>
));
