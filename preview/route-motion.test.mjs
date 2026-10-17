import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as motion from './route-exit.ts';

test('Language exits fade without translating content and cancellation restores it',()=>{
 const target={opacity:1,y:0};let commits=0;
 const exit=motion.createRouteExit(target,()=>commits++,{language:true});
 exit.timeline.progress(.5);
 assert.equal(target.y,0,'A locale replacement must not move the reading position');
 assert.ok(target.opacity<1&&target.opacity>0);
 exit.dispose();assert.equal(target.opacity,1);assert.equal(target.y,0);assert.equal(commits,0);
});

test('Completed and canceled exits release their real GSAP context targets',()=>{
 assert.equal(typeof motion.createRouteExit,'function','Disposable exit contexts are missing');
 let commits=0;
 for(let index=0;index<15;index++) {
  const target={opacity:1,y:0};
  const exit=motion.createRouteExit(target,()=>commits++);
  exit.timeline.progress(.4);exit.dispose();
  assert.equal(exit.context.data.length,0,'Canceled context retains old page targets');
  assert.equal(exit.timeline.parent,null);
 }
 assert.equal(commits,0);
 const completed=motion.createRouteExit({opacity:1,y:0},()=>commits++);
 completed.timeline.progress(1);
 assert.equal(commits,1);
 assert.equal(completed.context.data.length,0,'Completed context retains old page targets');
 completed.dispose();
});
