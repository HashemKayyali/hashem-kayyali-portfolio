import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// scroll-refresh.ts with gsap replaced by a stub that counts refreshes.
const source=ts.transpile(fs.readFileSync(new URL('./scroll-refresh.ts',import.meta.url),'utf8'),{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022})
 .replace(/import \{ ?gsap ?\} from ['"]gsap['"];?/,'const gsap={registerPlugin(){}};')
 .replace(/import \{ ?ScrollTrigger ?\} from ['"]gsap\/ScrollTrigger['"];?/,'const ScrollTrigger=globalThis.__ST;');

let clock=0,events;
async function setup(t){
 clock=0;events=new EventTarget();
 globalThis.__ST={refreshes:0,refresh(){this.refreshes++;},config(vars){this.vars=vars;}};
 Object.assign(globalThis,{scrollY:0,requestAnimationFrame:cb=>setTimeout(cb,16),addEventListener:events.addEventListener.bind(events),dispatch:type=>events.dispatchEvent(new Event(type)),document:{readyState:'complete'}});
 Object.defineProperty(globalThis,'performance',{value:{now:()=>clock},configurable:true});
 t.mock.timers.enable({apis:['setTimeout']});
 const mod=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')+'#'+Math.random());
 // Small steps, so timers scheduled by other timers (interval, then frame) also run.
 const advance=ms=>{for(let left=ms;left>0;left-=10){const step=Math.min(10,left);clock+=step;t.mock.timers.tick(step);}};
 return {...mod,ST:globalThis.__ST,advance};
}

test('a still page refreshes after one quiet interval and frame',async t=>{
 const m=await setup(t);m.configureScrollRefresh();m.advance(1000);
 m.refreshScrollTriggers();assert.equal(m.ST.refreshes,0,'never synchronous');
 m.advance(300);assert.equal(m.ST.refreshes,1);
 assert.equal(m.ST.vars.autoRefreshEvents,'visibilitychange,DOMContentLoaded,resize','window load no longer refreshes mid-scroll');
});
test('while scrolling, refreshes wait for 250 ms of quiet and coalesce into one',async t=>{
 const m=await setup(t);m.configureScrollRefresh();m.advance(1000);
 for(let i=0;i<10;i++){globalThis.scrollY+=40;dispatch('scroll');m.refreshScrollTriggers();m.advance(50);}
 assert.equal(m.ST.refreshes,0,'nothing runs during the scroll');
 m.advance(300);assert.equal(m.ST.refreshes,1,'one refresh once the scroll has stopped');m.advance(2000);assert.equal(m.ST.refreshes,1,'and only one');
});
test('a finger on the screen holds every refresh until it lifts',async t=>{
 const m=await setup(t);m.configureScrollRefresh();m.advance(1000);
 dispatch('touchstart');m.refreshScrollTriggers();m.advance(2000);
 assert.equal(m.ST.refreshes,0);
 dispatch('touchend');m.advance(100);assert.equal(m.ST.refreshes,0,'momentum may still be running');
 m.advance(600);assert.equal(m.ST.refreshes,1);
});
test('a fling that moved without delivering scroll events still counts as scrolling',async t=>{
 const m=await setup(t);m.configureScrollRefresh();m.advance(1000);
 m.refreshScrollTriggers();
 globalThis.scrollY=600;// compositor scrolled while the main thread was busy
 m.advance(300);assert.equal(m.ST.refreshes,0,'moved since the last check');
 m.advance(300);assert.equal(m.ST.refreshes,1,'still afterwards');
});
test('whenScrollIdle runs any job behind the same gate',async t=>{
 const m=await setup(t);m.configureScrollRefresh();m.advance(1000);
 let built=0;globalThis.scrollY=10;dispatch('scroll');
 m.whenScrollIdle(()=>built++);m.whenScrollIdle(()=>built++);
 assert.equal(built,0);m.advance(300);assert.equal(built,2,'distinct jobs both run');
});
