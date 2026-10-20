import test from 'node:test';
import assert from 'node:assert/strict';

test('address-bar resizes (innerHeight only) never reach layout-resize handlers',async()=>{
 const target=new EventTarget();
 Object.assign(globalThis,{innerWidth:390,innerHeight:664,document:{documentElement:{clientHeight:664}},
  addEventListener:target.addEventListener.bind(target),removeEventListener:target.removeEventListener.bind(target)});
 const {onLayoutResize}=await import('./layout-resize.ts');
 let calls=0;const stop=onLayoutResize(()=>calls++);
 const resize=(change)=>{Object.assign(globalThis,change.window??{});Object.assign(document.documentElement,change.root??{});target.dispatchEvent(new Event('resize'));};
 resize({window:{innerHeight:745}});resize({window:{innerHeight:664}});
 assert.equal(calls,0,'Safari toolbar collapse/expand');
 resize({window:{innerWidth:844,innerHeight:390},root:{clientHeight:340}});
 assert.equal(calls,1,'rotation');
 resize({root:{clientHeight:500}});
 assert.equal(calls,2,'desktop window height');
 stop();resize({window:{innerWidth:320}});
 assert.equal(calls,2,'removed');
});
