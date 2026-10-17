import test from 'node:test';
import assert from 'node:assert/strict';
import {createGallerySelection} from './case-gallery-selection.ts';

const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
test('A slow image decode cannot replace a newer gallery selection',async()=>{
 const first=deferred(),last=deferred(),committed=[],pending=[];
 const selection=createGallerySelection(index=>index===1?first.promise:last.promise,index=>committed.push(index),index=>pending.push(index));
 const oldRequest=selection.request(1),newRequest=selection.request(4);
 last.resolve();assert.equal(await newRequest,true);first.resolve();assert.equal(await oldRequest,false);
 assert.deepEqual(committed,[4]);assert.deepEqual(pending,[1,4,null]);
});
test('Cancellation and route teardown invalidate unresolved image decodes',async()=>{
 const image=deferred(),committed=[];
 const selection=createGallerySelection(()=>image.promise,index=>committed.push(index));
 const request=selection.request(2);selection.cancel();image.resolve();assert.equal(await request,false);
 selection.dispose();assert.equal(await selection.request(3),false);assert.deepEqual(committed,[]);
});
test('A failed incoming image keeps the currently readable evidence and clears loading',async()=>{
 const committed=[],pending=[];
 const selection=createGallerySelection(()=>Promise.reject(new Error('decode failed')),index=>committed.push(index),index=>pending.push(index));
 assert.equal(await selection.request(1),false);assert.deepEqual(committed,[]);assert.deepEqual(pending,[1,null]);
});
