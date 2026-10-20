import test from 'node:test';
import assert from 'node:assert/strict';
import {setStudioMediaSnapshot,getStudioProjectCover,studioCoverSource,studioProjectAlt,studioProjectCaption,studioCaseSources,dynamicMediaSize} from './studio-media-registry.ts';
import {projectLayout,arrangeLayout,publishedLayout,entrySource} from '../studio/project-layout.ts';
import {visibleCaseMedia} from './case-presentation.ts';
import {projectAssets} from '../data/projectAssets.ts';
const url='https://res.cloudinary.com/portfolio/image/upload/v1/portfolio/studio/a.webp';
const image=(id,width=1000,height=600)=>({id,kind:'image',url:url.replace('a.webp',id+'.webp'),width,height,alt:'Library '+id});
const item={media_id:'a',alt:'A diagram describing the NFC transaction',caption:'System',sort_order:1,is_cover:true,media:{id:'a',kind:'image',url,width:1000,height:600,alt:'Library description'}};
const eventies=visibleCaseMedia(projectAssets.find(asset=>asset.id==='eventies'));
const upload=(id,sort_order,extra={})=>({media_id:id,caption:'',alt:'',is_cover:false,sort_order,media:image(id),...extra});
const original=(source,sort_order,extra={})=>({source,caption:'',alt:'',is_cover:false,hidden:false,sort_order,...extra});
const managed=(items,builtins,project_id='eventies')=>({configured:true,posts:[],gallery:[],projectMedia:[{project_id,enabled:true,items,builtins}]});
const snap=value=>{setStudioMediaSnapshot(value);return studioCaseSources('eventies',eventies);};

test('legacy overrides keep their published look: uploads replace the originals',()=>{
 setStudioMediaSnapshot({configured:true,posts:[],gallery:[],projectMedia:[{project_id:'terminal-nfc',enabled:true,items:[item]}]});
 assert.equal(studioProjectAlt('terminal-nfc',url,'fallback'),item.alt);
 assert.equal(getStudioProjectCover('terminal-nfc').url,url);
 assert.equal(studioCoverSource('terminal-nfc'),url);
 assert.deepEqual(studioCaseSources('terminal-nfc',['redacted-canonical']),[url]);
 assert.deepEqual(dynamicMediaSize(url),{width:1000,height:600});
});
test('snapshot replacement restores approved canonical evidence and drops untrusted media',()=>{
 setStudioMediaSnapshot({configured:true,posts:[],gallery:[],projectMedia:[{project_id:'terminal-nfc',enabled:true,items:[{...item,media:{...item.media,url:'https://untrusted.test/private.png'}}]}]});
 assert.equal(getStudioProjectCover('terminal-nfc'),undefined);
 setStudioMediaSnapshot({configured:false,posts:[],gallery:[],projectMedia:[]});
 assert.deepEqual(studioCaseSources('terminal-nfc',['redacted-canonical']),['redacted-canonical']);
 assert.equal(dynamicMediaSize(url),undefined);
 assert.equal(studioProjectAlt('terminal-nfc',url,'fallback'),'fallback');
});
test('1. an upload with the cover on becomes the cover; the original cover follows it',()=>{
 const sources=snap(managed([upload('n',0,{is_cover:true})],eventies.map((source,i)=>original(source,i+1))));
 assert.equal(sources[0],image('n').url);assert.equal(studioCoverSource('eventies'),image('n').url);assert.equal(getStudioProjectCover('eventies').id,'n');
 assert.deepEqual(sources.slice(1),eventies,'every original stays in the gallery');
});
test('2–3. uploads without the cover go first after the original cover, and originals are all kept',()=>{
 const sources=snap(managed([upload('x',1),upload('y',2)],eventies.map((source,i)=>original(source,i===0?0:i+2))));
 assert.deepEqual(sources,[eventies[0],image('x').url,image('y').url,...eventies.slice(1)]);
 assert.equal(studioCoverSource('eventies'),eventies[0]);assert.equal(getStudioProjectCover('eventies'),undefined,'an original cover keeps its local card sources');
});
test('4. saved order is the public order, the cover always first',()=>{
 const builtins=eventies.map((source,i)=>original(source,[0,4,2,3,1][i]));
 assert.deepEqual(snap(managed([],builtins)),[eventies[0],eventies[4],eventies[2],eventies[3],eventies[1]]);
 const chosen=builtins.map((entry,i)=>i===3?{...entry,is_cover:true}:entry);
 assert.deepEqual(snap(managed([],chosen)),[eventies[3],eventies[0],eventies[4],eventies[2],eventies[1]],'an original can be the cover');
});
test('5–7. removing uploads, the custom cover, or hiding originals keeps everything else intact',()=>{
 assert.deepEqual(snap(managed([upload('y',1)],eventies.map((source,i)=>original(source,i===0?0:i+1)))),[eventies[0],image('y').url,...eventies.slice(1)],'removing one upload leaves the rest');
 assert.equal(snap(managed([upload('n',0)],eventies.map((source,i)=>original(source,i+1))))[0],eventies[0],'without a chosen cover the original cover returns');
 const hidden=eventies.map((source,i)=>original(source,i,i===0||i===2?{hidden:true}:{}));
 assert.deepEqual(snap(managed([],hidden)),[eventies[1],eventies[3],eventies[4]],'a hidden original cover falls back to the first visible image');
 assert.deepEqual(snap(managed([],eventies.map((source,i)=>original(source,i)))),eventies,'restoring originals needs no upload');
});
test('9. one project override never changes another project',()=>{
 setStudioMediaSnapshot(managed([upload('n',0,{is_cover:true})],eventies.map((source,i)=>original(source,i+1))));
 const glitzz=visibleCaseMedia(projectAssets.find(asset=>asset.id==='glitzz-lab'));
 assert.deepEqual(studioCaseSources('glitzz-lab',glitzz),glitzz);assert.equal(studioCoverSource('glitzz-lab'),undefined);
});
test('captions and alternative text apply to originals and uploads by source',()=>{
 snap(managed([upload('n',1,{caption:'Build night',alt:'Soldering the sensor'})],eventies.map((source,i)=>original(source,i===0?0:i+1,i===0?{caption:'Launch',alt:'Home page'}:{}))));
 assert.equal(studioProjectCaption('eventies',eventies[0]),'Launch');assert.equal(studioProjectAlt('eventies',eventies[0],'x'),'Home page');
 assert.equal(studioProjectCaption('eventies',image('n').url),'Build night');assert.equal(studioProjectAlt('eventies',image('n').url,'x'),'Soldering the sensor');
 assert.equal(studioProjectCaption('eventies',eventies[1]),undefined,'empty captions keep the coded default');
});
test('layout model: originals added to the code later appear; unknown originals are ignored; legacy disabled uploads are hidden',()=>{
 const layout=projectLayout({project_id:'eventies',enabled:true,items:[],builtins:[original(eventies[0],0),original('/projects/eventies/removed.webp',1)]},eventies);
 assert.deepEqual(layout.map(entrySource),eventies);
 const disabled=arrangeLayout(projectLayout({project_id:'eventies',enabled:false,items:[upload('d',0,{is_cover:true})]},eventies),eventies);
 assert.deepEqual(publishedLayout(disabled,eventies).map(entrySource),eventies);assert.equal(disabled.at(-1).hidden,true);assert.equal(disabled.at(-1).is_cover,false);
 const twoCovers=arrangeLayout(projectLayout(null,eventies).map(entry=>({...entry,is_cover:true})),eventies);
 assert.equal(twoCovers.filter(entry=>entry.is_cover).length,1,'one cover at most');
});
