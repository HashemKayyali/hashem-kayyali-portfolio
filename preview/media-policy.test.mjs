import test from 'node:test';import assert from 'node:assert/strict';import {withheldMedia} from './media-policy.ts';
test('Consolidation recovery archives cannot be served through normal or Vite filesystem paths',()=>{
 for(const path of ['/archive','/archive/approved-v2-before-consolidation.zip','/archive/other-worktree-drafts.zip','/%61rchive/other-worktree-drafts.zip','/%2561rchive/other-worktree-drafts.zip','/ARCHIVE/README.local.md','/@fs/C:/Users/hashe/Desktop/portfolio-v2/archive/other-worktree-drafts.zip','/@fs/C:\\Users\\hashe\\Desktop\\portfolio-v2\\archive\\approved-v2-before-consolidation.zip'])assert.equal(withheldMedia(path),true,path);
 assert.equal(withheldMedia('/engineering-process/01-context.webp'),false);
});
test('V2 withholds private raw screenshot folders and every unsafe thumbnail variant',()=>{
 for(const path of ['/projects/umniah-youthconnect/cover.webp','/projects/umniah-youthconnect/thumbs/screenshot-10.webp','/projects/umniah-youthconnect/card-cover-thumb-320.webp','/projects/glitzz-lab/screenshot-06.webp','/projects/glitzz-lab/thumbs/screenshot-07.webp','/projects/the-terminal-nfc/cover.webp','/projects/bike-tower/thumbs/screenshot-01.webp'])assert.equal(withheldMedia(path),true,path);
 for(const path of ['/projects/glitzz-lab/cover.webp','/projects/glitzz-lab/screenshot-05.webp','/projects/bike-tower/cover.webp','/v2-media/terminal-cover-1280.webp','/v2-media/bike-interface-1-640.webp','/v2-media/umniah-architecture.svg'])assert.equal(withheldMedia(path),false,path);
});
test('Encoded URLs, Windows case and Vite public/filesystem aliases cannot bypass privacy policy',()=>{
 for(const path of ['/projects/%75mniah-youthconnect/cover.webp','/public/projects/umniah-youthconnect/cover.webp','/@fs/C:/Users/hashe/Desktop/site-v2-light-burgundy/public/projects/umniah-youthconnect/cover.webp','/projects/UMNIAH-YOUTHCONNECT/cover.webp','/projects%2Fglitzz-lab%2Fscreenshot-06.webp','/public/projects/other/../umniah-youthconnect/cover.webp','/projects/%2575mniah-youthconnect/cover.webp','/output/checkpoints/signature-before-2026-10-12.zip','/@fs/C:/Users/hashe/Desktop/site-v2-light-burgundy/output/checkpoints/signature-before-2026-10-12.zip'])assert.equal(withheldMedia(path),true,path);
 assert.equal(withheldMedia('/v2-media/%74erminal-cover-1280.webp'),false);
});
