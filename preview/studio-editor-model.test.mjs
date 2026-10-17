import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync(new URL('./studio-editor-model.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {createEditorState,editorReducer,editorMove,nextEditorialOrder}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('late A save cannot pair the A identity with an attempted B selection',async()=>{
 let state=createEditorState('2026-10-16');const dispatch=action=>{state=editorReducer(state,action);};
 const draftA={...state.draft,media_id:'media-a',caption:'Edited A'};
 dispatch({type:'select',id:'A',draft:draftA});dispatch({type:'change',key:'caption',value:'Unsaved A'});dispatch({type:'start',token:1});
 let resolve;const response=new Promise(done=>resolve=done);const save=response.then(()=>dispatch({type:'saved',token:1,id:'A'}));
 dispatch({type:'select',id:'B',draft:{...draftA,media_id:'media-b',caption:'B'}});
 assert.equal(state.selected,'A');assert.equal(state.draft.caption,'Unsaved A');
 resolve();await save;
 assert.equal(state.selected,'A');assert.equal(state.draft.media_id,'media-a');assert.equal(state.draft.caption,'Unsaved A');assert.equal(state.dirty,false);
 dispatch({type:'select',id:'B',draft:{...draftA,media_id:'media-b',caption:'B'}});
 dispatch({type:'saved',token:1,id:'A'});
 assert.equal(state.selected,'B');assert.equal(state.draft.caption,'B');
});
test('failed save unlocks selection without discarding the unsaved draft',()=>{
 let state=createEditorState('2026-10-16');state=editorReducer(state,{type:'change',key:'caption',value:'Keep my draft'});state=editorReducer(state,{type:'start',token:7});
 state=editorReducer(state,{type:'select',id:null,draft:createEditorState('2026-10-16').draft});assert.equal(state.draft.caption,'Keep my draft');
 state=editorReducer(state,{type:'failed',token:7});assert.equal(state.request,null);assert.equal(state.draft.caption,'Keep my draft');assert.equal(state.dirty,true);
});
test('an editorial move sends one identity and direction for arbitrarily long lists',()=>{
 const items=Array.from({length:301},(_,index)=>({id:`record-${index}`}));
 assert.deepEqual(editorMove('posts',items,250,-1),{resource:'posts',id:'record-250',direction:'up'});
 assert.deepEqual(editorMove('gallery',items,200,1),{resource:'gallery',id:'record-200',direction:'down'});
 assert.equal(editorMove('posts',items,0,-1),null);assert.equal(editorMove('posts',items,300,1),null);
});
test('new editorial records append after persisted order gaps and ties',()=>{
 assert.equal(nextEditorialOrder([]),0);
 // Deletion and earlier imports can leave gaps: length would incorrectly insert at 3.
 assert.equal(nextEditorialOrder([{sort_order:40},{sort_order:2},{sort_order:40}]),41);
 assert.equal(nextEditorialOrder([{sort_order:0},{sort_order:1},{sort_order:9}]),10);
});
