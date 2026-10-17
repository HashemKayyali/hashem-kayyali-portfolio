import test from 'node:test';
import assert from 'node:assert/strict';
import {setStudioMediaSnapshot,getStudioProjectCover,studioProjectAlt,studioCaseSources,dynamicMediaSize} from './studio-media-registry.ts';
const url='https://res.cloudinary.com/portfolio/image/upload/v1/portfolio/studio/a.webp';
const item={media_id:'a',alt:'A diagram describing the NFC transaction',caption:'System',sort_order:1,is_cover:true,media:{id:'a',kind:'image',url,width:1000,height:600,alt:'Library description'}};
test('project-specific accessible descriptions survive cover, case and fullscreen resolution',()=>{
 setStudioMediaSnapshot({configured:true,posts:[],gallery:[],projectMedia:[{project_id:'terminal-nfc',enabled:true,items:[item]}]});
 assert.equal(studioProjectAlt('terminal-nfc',url,'fallback'),item.alt);
 assert.equal(getStudioProjectCover('terminal-nfc').url,url);
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
