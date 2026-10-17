import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePreviewRoute,previewUrl,PAGES} from './routes.ts';
import {projectAssets} from '../data/projectAssets.ts';
test('Creative review routes stay isolated through every locale, page and project',()=>{
 for(const locale of ['en','ar','de','fr','es'])for(const destination of [...PAGES.map(page=>({page})),...projectAssets.map(asset=>({page:'projects',project:asset.id}))]){
  const route={locale,...destination,experience:'creative'};
  assert.ok(previewUrl(route).startsWith('/preview/creative/'));
  assert.deepEqual(parsePreviewRoute('http://localhost'+previewUrl(route)),route);
 }
 assert.deepEqual(parsePreviewRoute('http://localhost/preview/creative/ar/unknown/'),{locale:'ar',page:'not-found',experience:'creative'});
 assert.deepEqual(parsePreviewRoute('http://localhost/preview/ar/'),{locale:'ar',page:'home'});
});
