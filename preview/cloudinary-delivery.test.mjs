import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const load=async()=>import('data:text/javascript;base64,'+Buffer.from(ts.transpile(fs.readFileSync(new URL('./cloudinary-delivery.ts',import.meta.url),'utf8'),{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022})).toString('base64'));
const image='https://res.cloudinary.com/demo/image/upload/v12/portfolio/studio/0b0b8f3a-1111-4222-8333-444455556666.jpg';
test('Cloudinary images get automatic format, quality and a width limit',async()=>{const {cloudinaryUrl}=await load();
 assert.equal(cloudinaryUrl(image,800),'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_800/v12/portfolio/studio/0b0b8f3a-1111-4222-8333-444455556666.jpg');
 assert.equal(cloudinaryUrl(image),'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v12/portfolio/studio/0b0b8f3a-1111-4222-8333-444455556666.jpg');});
test('videos keep their container and non-Cloudinary or look-alike URLs pass through',async()=>{const {cloudinaryUrl,isCloudinaryUrl}=await load();
 assert.equal(cloudinaryUrl('https://res.cloudinary.com/demo/video/upload/v3/a.mp4',900),'https://res.cloudinary.com/demo/video/upload/q_auto/v3/a.mp4');
 for(const url of ['/projects/bike-tower/cover.webp','https://evil.example/res.cloudinary.com/demo/image/upload/a.jpg','http://res.cloudinary.com/demo/image/upload/a.jpg','https://res.cloudinary.com.evil.example/demo/image/upload/a.jpg']){assert.equal(cloudinaryUrl(url,800),url);assert.equal(isCloudinaryUrl(url),false);}});
test('srcset never upscales beyond the original and skips videos',async()=>{const {cloudinarySrcSet}=await load();
 const set=cloudinarySrcSet(image,1000);assert.match(set,/w_480\/.* 480w, .*w_800\/.* 800w, .*w_1000\/.* 1000w$/);assert.ok(!set.includes('w_1200'));
 assert.equal(cloudinarySrcSet('https://res.cloudinary.com/demo/video/upload/v3/a.mp4',1920),undefined);assert.equal(cloudinarySrcSet('/x.webp',800),undefined);});
test('eco quality is opt-in and static images keep their local composition',async()=>{const {cloudinaryUrl,staticAttributes}=await load();
 assert.equal(cloudinaryUrl(image,800,'eco'),'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto:eco,c_limit,w_800/v12/portfolio/studio/0b0b8f3a-1111-4222-8333-444455556666.jpg');
 const cover='https://res.cloudinary.com/demo/image/upload/v7/portfolio/projects/x/cover.webp',card='https://res.cloudinary.com/demo/image/upload/v8/portfolio/projects/x/card-cover.webp';
 // One source: the full width ladder, capped at the original; the default src keeps the local width.
 const one=staticAttributes([{url:cover,width:1600,quality:'auto',variantWidth:320},{url:cover,width:1600,quality:'auto',variantWidth:1600}],{url:cover,width:1600,quality:'auto',variantWidth:640});
 assert.match(one.src,/w_640\//);assert.match(one.srcSet,/w_480\/.* 480w, .*w_1200\/.* 1200w, .*w_1600\/.* 1600w$/);
 // Card crop + cover: exactly the local widths and pictures, so density never swaps the composition.
 const mixed=staticAttributes([{url:card,width:900,quality:'auto',variantWidth:320},{url:card,width:900,quality:'auto',variantWidth:640},{url:cover,width:1331,quality:'eco',variantWidth:1331}],{url:card,width:900,quality:'auto',variantWidth:640});
 // Static images pin WebP (f_auto served JPEG XL / JPEG in the A/B run) and include the local 640/960 steps.
 assert.match(one.src,/\/f_webp,q_auto,c_limit,w_640\//);assert.ok(!one.srcSet.includes('f_auto'));assert.match(one.srcSet,/w_640\/.* 640w, .*w_960\/.* 960w/);
 assert.ok(mixed.srcSet.split(', ').every(c=>c.includes('/f_webp,')));
 assert.equal(mixed.srcSet.split(', ').length,3);assert.match(mixed.srcSet,/card-cover\.webp 320w, .*card-cover\.webp 640w, .*q_auto:eco,c_limit,w_1331\/v7\/.*cover\.webp 1331w$/);});
test('hybrid routing: only case-gallery screenshots may use Cloudinary',async()=>{const {cdnRoutable}=await load();
 for(const path of ['/projects/eventies/screenshot-01.webp','/projects/glitzz-lab/screenshot-05.webp','/projects/bike-land-smart-cycling-trainer/screenshot-01.webp'])assert.ok(cdnRoutable(path),path);
 for(const path of ['/covers/eventies.webp','/covers/eventies-640.webp','/projects/bike-tower/cover.webp','/projects/basket-beats/card-cover-thumb-640.webp','/projects/eventies/thumbs/screenshot-02.webp','/engineering-process/01-context.webp','/v2-media/terminal-invoices-1586.webp','/images/hashem-profile.webp','/og-image-sterling.png'])assert.ok(!cdnRoutable(path),path);});
