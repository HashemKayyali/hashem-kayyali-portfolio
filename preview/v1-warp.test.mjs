import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

test('recovered V1 shader matches the original archived fragment, not the approximate Home field',async()=>{
 const path=new URL('./v1-warp-shader.ts',import.meta.url);
 assert.ok(existsSync(path),'Exact V1 shader source has not been recovered');
 const {V1_FRAGMENT_SHADER,V1_EDITORIAL_FRAGMENT_SHADER}=await import(path.href);
 assert.equal(createHash('sha256').update(V1_FRAGMENT_SHADER).digest('hex'),'a378a6f85f61762e2c10ddd7561ec1bde7bb5a9fa97424eee93cd281fd5671bf');
 const originalGeometry=V1_FRAGMENT_SHADER.slice(0,V1_FRAGMENT_SHADER.indexOf('  float vignette'));
 assert.ok(V1_EDITORIAL_FRAGMENT_SHADER.startsWith(originalGeometry),'Light adaptation changed the original noise, motion or fold equations');
 assert.ok(!V1_EDITORIAL_FRAGMENT_SHADER.includes('color *= 0.76'),'Dark vignette would muddy the light paper');
 assert.ok(!V1_EDITORIAL_FRAGMENT_SHADER.includes('color += 0.018'),'Screen-space grain is not part of the editorial finish');
});
