import test from 'node:test';import assert from 'node:assert/strict';
import {projectAssets} from '../data/projectAssets.ts';
import {casePresentation,visibleCaseMedia,caseNeighbors} from './case-presentation.ts';
test('Every approved project has a deliberate case composition and circular neighbors',()=>{
 for(const asset of projectAssets){assert.ok(casePresentation[asset.id]);const {previous,next}=caseNeighbors(asset.id);assert.notEqual(previous.id,asset.id);assert.notEqual(next.id,asset.id);assert.equal(caseNeighbors(next.id).previous.id,asset.id);}
 assert.equal(new Set(Object.values(casePresentation).map(p=>p.identity)).size,11);
});
test('Confidential Umniah and Glitzz media are excluded before rendering',()=>{
 assert.deepEqual(visibleCaseMedia(projectAssets.find(a=>a.id==='umniah-youthconnect')),[]);
 const media=visibleCaseMedia(projectAssets.find(a=>a.id==='glitzz-lab'));
 assert.equal(media.length,6);assert.ok(media.every(src=>!/(screenshot-0[67]|thumbs\/screenshot-0[67])/.test(src)));
});
test('No source diagrams are falsely classified as screenshots',()=>{
 for(const id of ['financial-operations','outreach-automation'])assert.equal(casePresentation[id].evidence,'illustration');
 assert.equal(casePresentation['vr-cycling'].evidence,'supplied');
});
