import { test } from 'node:test';
import assert from 'node:assert/strict';
import { motionState, frameDue, validRiveHeader } from './motion-policy.ts';
test('Motion remains static on reduced motion or constrained devices and pauses hidden/offscreen surfaces',()=>{
  assert.equal(motionState({reduced:true,lowPower:false,hidden:false,visible:true}),'reduced');
  assert.equal(motionState({reduced:false,lowPower:true,hidden:false,visible:true}),'low-power');
  assert.equal(motionState({reduced:false,lowPower:false,hidden:true,visible:true}),'hidden');
  assert.equal(motionState({reduced:false,lowPower:false,hidden:false,visible:false}),'offscreen');
  assert.equal(motionState({reduced:false,lowPower:false,hidden:false,visible:true}),'active');
});
test('Frame scheduling caps actual paints without changing the GSAP global ticker',()=>{
  assert.equal(frameDue(1,.95,12),false);
  assert.equal(frameDue(1,.9,12),true);
  assert.equal(frameDue(1,.9,8),false);
});
test('Malformed or HTML Rive assets never trigger runtime import',()=>{
  assert.equal(validRiveHeader(new TextEncoder().encode('<!doctype html>').buffer),false);
  assert.equal(validRiveHeader(new Uint8Array([82,73,86,69,7,0]).buffer),true);
  assert.equal(validRiveHeader(new Uint8Array([82,73]).buffer),false);
});
