import test from 'node:test';
import assert from 'node:assert/strict';
import {arrivalDisposition} from './viewport-arrivals-model.ts';

const candidate={top:950,bottom:1100,width:620,height:150,viewportHeight:900,rendered:true,focused:false,allowed:true};

test('route restoration keeps visible and already passed arrival groups readable',()=>{
 assert.equal(arrivalDisposition({...candidate,top:700,bottom:850}),'settled');
 assert.equal(arrivalDisposition({...candidate,top:-200,bottom:-50}),'settled');
 assert.equal(arrivalDisposition({...candidate,top:900,bottom:1050}),'settled');
 assert.equal(arrivalDisposition(candidate),'armed');
});

test('focus and motion restrictions prevent an offscreen entrance from hiding content',()=>{
 assert.equal(arrivalDisposition({...candidate,focused:true}),'settled');
 assert.equal(arrivalDisposition({...candidate,allowed:false}),'settled');
});

test('filtered and unattached layout remains untouched until it has readable geometry',()=>{
 assert.equal(arrivalDisposition({...candidate,rendered:false}),'deferred');
 assert.equal(arrivalDisposition({...candidate,width:0}),'deferred');
 assert.equal(arrivalDisposition({...candidate,height:0}),'deferred');
});
