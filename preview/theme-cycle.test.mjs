import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Transpile themes.ts and theme-cycle.ts (which imports './themes') into data-URL modules.
const transpile=file=>ts.transpile(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022});
const url=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const themesUrl=url(transpile('./themes.ts'));
const cycleSource=transpile('./theme-cycle.ts').replace(/from\s*['"]\.\/themes['"]/,`from '${themesUrl}'`);

// Minimal browser surface used by themes.ts and theme-cycle.ts.
let clock=0,reduced=false,storage=new Map(),root,doc,events;
function installDom(){
 events=new EventTarget();clock=0;reduced=false;storage=new Map();
 root={dataset:{theme:'metal'},style:{setProperty(){},colorScheme:''},hasAttribute:name=>name==='data-menu-open'&&root.menuOpen,menuOpen:false};
 const docEvents=new EventTarget();
 doc={hidden:false,documentElement:root,activeElement:null,selectors:new Set(),querySelector:selector=>[...doc.selectors].some(s=>selector.includes(s))?{}:null,addEventListener:docEvents.addEventListener.bind(docEvents),removeEventListener:docEvents.removeEventListener.bind(docEvents),dispatch:type=>docEvents.dispatchEvent(new Event(type))};
 Object.assign(globalThis,{document:doc,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),dispatchEvent:events.dispatchEvent.bind(events),window:globalThis,
  matchMedia:()=>({get matches(){return reduced;},addEventListener(){},removeEventListener(){}}),
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value))}});
 Object.defineProperty(globalThis,'performance',{value:{now:()=>clock},configurable:true});
 Object.defineProperty(globalThis,'navigator',{value:{hardwareConcurrency:8},configurable:true});
}
async function cycle(t){
 installDom();t.mock.timers.enable({apis:['setTimeout']});
 const {startThemeCycle}=await import(url(cycleSource)+'#'+Math.random());
 const advance=ms=>{clock+=ms;t.mock.timers.tick(ms);};
 return {stop:startThemeCycle(),advance,theme:()=>root.dataset.theme};
}

test('Advances one edition every 10 seconds, starting from Sterling, and loops',async t=>{
 const c=await cycle(t);c.advance(9_999);assert.equal(c.theme(),'metal');
 c.advance(1);assert.equal(c.theme(),'atelier');
 c.advance(10_000);assert.equal(c.theme(),'burgundy');
 for(const expected of ['onyx','rose','metal']){c.advance(10_000);assert.equal(c.theme(),expected);}
 assert.equal(storage.size,0,'automatic changes are never stored as a visitor choice');c.stop();
});
test('A stored menu choice no longer disables the cycle: it continues from that edition',async t=>{
 installDom();storage.set('portfolio-v2-theme-choice','rose');root.dataset.theme='rose';t.mock.timers.enable({apis:['setTimeout']});
 const {startThemeCycle}=await import(url(cycleSource)+'#'+Math.random());const stop=startThemeCycle();
 clock+=10_000;t.mock.timers.tick(10_000);assert.equal(root.dataset.theme,'metal');
 clock+=10_000;t.mock.timers.tick(10_000);assert.equal(root.dataset.theme,'atelier');stop();
});
test('Choosing an edition in the menu keeps it 10 seconds, then the cycle continues',async t=>{
 const c=await cycle(t);c.advance(5_000);
 root.dataset.theme='onyx';dispatchEvent(new CustomEvent('portfolio-theme-change',{detail:{id:'onyx',chosen:true}}));
 c.advance(9_999);assert.equal(c.theme(),'onyx','the pick stays a full interval');
 c.advance(1);assert.equal(c.theme(),'rose','then the cycle moves on');c.stop();
});
test('Constrained devices (Save-Data, low memory, 2 cores) still cycle every 10 seconds',async t=>{
 for(const navigatorStub of [{connection:{saveData:true}},{deviceMemory:2},{hardwareConcurrency:2}]){
  installDom();Object.defineProperty(globalThis,'navigator',{value:navigatorStub,configurable:true});t.mock.timers.enable({apis:['setTimeout']});
  const {startThemeCycle}=await import(url(cycleSource)+'#'+Math.random());const stop=startThemeCycle();
  clock+=9_999;t.mock.timers.tick(9_999);assert.equal(root.dataset.theme,'metal',JSON.stringify(navigatorStub));
  clock+=1;t.mock.timers.tick(1);assert.equal(root.dataset.theme,'atelier',JSON.stringify(navigatorStub));stop();t.mock.timers.reset();
 }
 Object.defineProperty(globalThis,'navigator',{value:{hardwareConcurrency:8},configurable:true});
});
test('Reduced motion still cycles every 10 seconds',async t=>{
 installDom();reduced=true;t.mock.timers.enable({apis:['setTimeout']});
 const {startThemeCycle}=await import(url(cycleSource)+'#'+Math.random());const stop=startThemeCycle();
 clock+=10_000;t.mock.timers.tick(10_000);assert.equal(root.dataset.theme,'atelier');
 clock+=10_000;t.mock.timers.tick(10_000);assert.equal(root.dataset.theme,'burgundy');stop();
});
test('Background tabs pause; returning restarts a full 10 seconds',async t=>{
 const c=await cycle(t);c.advance(5_000);doc.hidden=true;doc.dispatch('visibilitychange');
 c.advance(60_000);assert.equal(c.theme(),'metal');
 doc.hidden=false;doc.dispatch('visibilitychange');c.advance(9_000);assert.equal(c.theme(),'metal');
 c.advance(1_000);assert.equal(c.theme(),'atelier');c.stop();
});
test('Repeated visibility events never create concurrent timers',async t=>{
 const c=await cycle(t);for(let i=0;i<5;i++)doc.dispatch('visibilitychange');
 c.advance(10_000);assert.equal(c.theme(),'atelier','exactly one step');c.advance(9_000);assert.equal(c.theme(),'atelier');c.stop();
});
test('Scrolling, typing, open menus, dialogs and transitions never delay the change',async t=>{
 const c=await cycle(t);c.advance(9_500);dispatchEvent(new Event('scroll'));c.advance(500);
 assert.equal(c.theme(),'atelier','changes on schedule even while scrolling');
 for(const block of [()=>{doc.activeElement={matches:()=>true};},()=>{root.menuOpen=true;},()=>{root.dataset.projectTransit='true';},()=>{doc.selectors.add('dialog[open]');},()=>{doc.selectors.add('.route-stage[inert]');}]){
  const before=c.theme();block();c.advance(10_000);assert.notEqual(c.theme(),before,'not deferred');
  doc.activeElement=null;root.menuOpen=false;delete root.dataset.projectTransit;doc.selectors.clear();
 }
 c.stop();
});
test('stop() removes timers and listeners',async t=>{
 const c=await cycle(t);c.stop();c.advance(120_000);assert.equal(c.theme(),'metal');
 dispatchEvent(new Event('scroll'));doc.dispatch('visibilitychange');c.advance(60_000);assert.equal(c.theme(),'metal');
});
