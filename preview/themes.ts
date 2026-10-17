export type ThemeId='atelier'|'burgundy'|'onyx'|'rose'|'metal';
type Colors=Record<'paper'|'raised'|'surface'|'strong'|'tonal'|'ink'|'muted'|'accent'|'hover'|'secondary'|'onAccent'|'line'|'panel'|'panelAlt'|'panelInk'|'panelMuted'|'panelAccent'|'field'|'fieldBorder'|'smokeA'|'smokeB',string>;
export type PortfolioTheme={id:ThemeId;scheme:'dark'|'light';colors:Colors;smoke?:{ramp:[string,string,string,string,string];opacity:number}};
export const THEME_STORAGE_KEY='portfolio-v2-theme';
export const THEMES:PortfolioTheme[]=[
 {id:'atelier',scheme:'dark',colors:{paper:'#11171a',raised:'#1a2327',surface:'#192329',strong:'#243038',tonal:'#223a3d',ink:'#f1eee7',muted:'#b2b7b5',accent:'#cdb58b',hover:'#d7c2a2',secondary:'#e0cab1',onAccent:'#17242b',line:'#3b4649',panel:'#e9e0d0',panelAlt:'#d3c8b6',panelInk:'#17242b',panelMuted:'#475153',panelAccent:'#795a33',field:'#f8f4ec',fieldBorder:'#807769',smokeA:'#cdb58b',smokeB:'#223a3d'},smoke:{ramp:['#11171a','#1b4a4e','#cdb58b','#2e6b6b','#f4e7c9'],opacity:.9}},
 {id:'burgundy',scheme:'dark',colors:{paper:'#1e0b13',raised:'#2d121e',surface:'#351624',strong:'#4d2637',tonal:'#491528',ink:'#f4eee4',muted:'#c7bcb3',accent:'#e3d2b9',hover:'#eee0cb',secondary:'#d8c8af',onAccent:'#2b0b18',line:'#67434d',panel:'#ede4d5',panelAlt:'#ded2bd',panelInk:'#360c1e',panelMuted:'#65534c',panelAccent:'#5b112b',field:'#faf5ec',fieldBorder:'#8c796f',smokeA:'#520720',smokeB:'#c5bba7'},smoke:{ramp:['#1e0b13','#4a0b25','#e4d6bd','#7a1838','#f7ecd8'],opacity:.9}},
 {id:'onyx',scheme:'dark',colors:{paper:'#081e22',raised:'#0d2e33',surface:'#10353b',strong:'#17484e',tonal:'#12464b',ink:'#edf0f0',muted:'#bdcbce',accent:'#c4d0d2',hover:'#e0e7e8',secondary:'#bbc7ca',onAccent:'#103038',line:'#3b6268',panel:'#dce2e3',panelAlt:'#c5d0d2',panelInk:'#0b3036',panelMuted:'#415c61',panelAccent:'#14535c',field:'#f4f7f7',fieldBorder:'#738f95',smokeA:'#00555a',smokeB:'#c6d2d4'},smoke:{ramp:['#081e22','#064a51','#d3e1e3','#0b6d76','#f1f7f7'],opacity:.9}},
 {id:'rose',scheme:'dark',colors:{paper:'#190f20',raised:'#26192f',surface:'#2e1d38',strong:'#432a50',tonal:'#42224f',ink:'#eeeaf0',muted:'#c6bdcd',accent:'#d1cbd8',hover:'#e8e1ec',secondary:'#bbb4c8',onAccent:'#291532',line:'#675371',panel:'#e0e1e5',panelAlt:'#c9cbd3',panelInk:'#30143c',panelMuted:'#5b5164',panelAccent:'#542961',field:'#f3f3f6',fieldBorder:'#867c91',smokeA:'#461952',smokeB:'#bdc2d0'},smoke:{ramp:['#190f20','#3f1752','#cfd3e0','#5f2876','#f1f1f6'],opacity:.9}},
 {id:'metal',scheme:'dark',colors:{paper:'#0c0d10',raised:'#191b20',surface:'#1d2026',strong:'#2b2e35',tonal:'#282c33',ink:'#e8e9eb',muted:'#b1b5bd',accent:'#d5ba7c',hover:'#e7cc91',secondary:'#c5c8cf',onAccent:'#191714',line:'#454953',panel:'#d9dadd',panelAlt:'#bfc2c8',panelInk:'#17191e',panelMuted:'#50545d',panelAccent:'#685224',field:'#f0f0f2',fieldBorder:'#797f89',smokeA:'#c5c8cf',smokeB:'#727985'},smoke:{ramp:['#0c0d10','#2c3540','#c5c8cf','#58626e','#efe0bd'],opacity:.9}}
];
export function readStoredTheme(storage:Pick<Storage,'getItem'>):ThemeId{try{const value=storage.getItem(THEME_STORAGE_KEY);return THEMES.find(t=>t.id===value)?.id??'atelier';}catch{return 'atelier';}}
export function themeSmokeRamp(theme:PortfolioTheme){return theme.smoke?.ramp??[theme.colors.paper,theme.colors.paper,theme.colors.smokeA,theme.colors.smokeB,theme.colors.paper];}
let transition:ViewTransition|undefined,version=0;
/** Route/image choreography takes priority over a palette-only viewport blend. */
export function cancelThemeTransition(){transition?.skipTransition();transition=undefined;delete document.documentElement.dataset.themeTransition;}
export function applyTheme(id:ThemeId,persist=true){
 const theme=THEMES.find(t=>t.id===id)??THEMES[0],root=document.documentElement,intent=++version;
 cancelThemeTransition();
 if(persist)try{localStorage.setItem(THEME_STORAGE_KEY,theme.id);}catch{/* The selected palette still works for this visit. */}
 const write=()=>{
  if(intent!==version)return;
  for(const [name,value]of Object.entries(theme.colors))root.style.setProperty('--theme-'+name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value);
  root.style.setProperty('--theme-smoke-opacity',String(theme.smoke?.opacity??.65));
  root.style.setProperty('--theme-smoke-glow',theme.smoke?'70%':'33.333%');
  root.dataset.theme=theme.id;root.style.colorScheme=theme.scheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme.colors.paper);
  window.dispatchEvent(new CustomEvent('portfolio-theme-change',{detail:{id:theme.id,ramp:themeSmokeRamp(theme)}}));
 };
 const device=navigator as Navigator&{connection?:{saveData?:boolean};deviceMemory?:number};
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches||device.connection?.saveData||(device.deviceMemory??8)<=2||device.hardwareConcurrency<=2;
 const routeBusy=document.querySelector('.route-stage')?.hasAttribute('inert')||Boolean(root.dataset.projectTransit);
 if(persist&&root.dataset.theme!==theme.id&&document.startViewTransition&&!reduced&&!routeBusy){
  root.dataset.themeTransition='true';const active=document.startViewTransition(write);transition=active;
  void active.ready.catch(()=>{});void active.finished.catch(()=>{}).finally(()=>{if(transition===active){transition=undefined;delete root.dataset.themeTransition;}});
 }else{delete root.dataset.themeTransition;write();}
}
export function initializeTheme(){let id:ThemeId='atelier';try{id=readStoredTheme(localStorage);}catch{}applyTheme(id,false);}
