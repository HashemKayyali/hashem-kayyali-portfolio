import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {withheldMedia} from '../preview/media-policy.ts';

test('Cloudinary upload plan never includes withheld media and stays out of the Studio namespace',()=>{
 execFileSync(process.execPath,['scripts/cloudinary-media.mjs'],{cwd:new URL('..',import.meta.url),stdio:'pipe'});
 const {assets}=JSON.parse(readFileSync(new URL('../media/cloudinary-manifest.json',import.meta.url),'utf8'));
 assert.ok(assets.length>0);
 assert.equal(new Set(assets.map(a=>a.publicId)).size,assets.length,'public IDs are unique');
 for(const asset of assets){
  assert.ok(!withheldMedia(asset.source),asset.source+' is withheld');
  assert.ok(asset.localFallbacks.every(path=>!withheldMedia(path)),asset.publicId+' lists a withheld fallback');
  assert.match(asset.publicId,/^portfolio\/(projects|site)\/[a-z0-9/-]+$/);
  assert.ok(!asset.publicId.startsWith('portfolio/studio/'));
  assert.equal(createHash('md5').update(readFileSync(new URL('../public'+asset.source,import.meta.url))).digest('hex'),asset.md5,asset.source+' checksum');
 }
 for(const id of ['umniah-youthconnect','the-terminal-nfc'])assert.ok(!assets.some(a=>a.source.startsWith(`/projects/${id}/`)),id+' raw folder');
});
