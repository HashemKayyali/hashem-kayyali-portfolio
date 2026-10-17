import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePreviewRoute,previewUrl} from './routes.ts';
import {contactDraft} from './contact-model.ts';
test('Localized page and project paths round-trip without losing their destination',()=>{
 for(const locale of ['en','ar','de','fr','es'])for(const page of ['home','about','projects','experience','skills','contact']) {
  const route={locale,page};assert.deepEqual(parsePreviewRoute('http://localhost'+previewUrl(route)),route);
 }
 const caseRoute={locale:'ar',page:'projects',project:'bike-tower'};
 assert.deepEqual(parsePreviewRoute('http://localhost'+previewUrl(caseRoute)),caseRoute);
});
test('Legacy review links still resolve; unknown pages and project slugs produce a recoverable 404 view',()=>{
 assert.deepEqual(parsePreviewRoute('http://localhost/preview/?lang=fr&project=eventies'),{locale:'fr',page:'projects',project:'eventies'});
 assert.deepEqual(parsePreviewRoute('http://localhost/preview/ar/projects/unknown/'),{locale:'ar',page:'not-found'});
 assert.deepEqual(parsePreviewRoute('http://localhost/preview/en/unknown/'),{locale:'en',page:'not-found'});
 assert.deepEqual(parsePreviewRoute('http://localhost/preview/'),{locale:'en',page:'home'});
 assert.deepEqual(parsePreviewRoute('http://localhost/preview/?lang=ar#resume'),{locale:'ar',page:'experience'});
 assert.deepEqual(parsePreviewRoute('http://localhost/preview/#capabilities'),{locale:'en',page:'skills'});
 assert.deepEqual(parsePreviewRoute('http://localhost/preview/en/#projects'),{locale:'en',page:'home'});
});
test('Contact drafts reject whitespace, malformed addresses and header injection, then encode the real message',()=>{
 assert.equal(contactDraft({name:' ',email:'a@example.com',message:'A valid message about a project.'},'owner@example.com'),null);
 assert.equal(contactDraft({name:'A',email:'broken',message:'A valid message about a project.'},'owner@example.com'),null);
 assert.equal(contactDraft({name:'A',email:'a@example.com\r\nBcc:other@example.com',message:'A valid message about a project.'},'owner@example.com'),null);
 const result=contactDraft({name:'Ali & Sara',email:'ali@example.com',message:'Engineering & NFC? Let us discuss.'},'owner@example.com');
 assert.ok(result.startsWith('mailto:owner@example.com?'));
 const query=new URL(result).searchParams;assert.ok(query.get('body').includes('Ali & Sara'));assert.ok(query.get('body').includes('Engineering & NFC?'));
 assert.equal(query.get('bcc'),null);
 const rawBody=result.split('&body=')[1];assert.ok(rawBody.includes('%20')&&!rawBody.includes('+'));
 assert.equal(decodeURIComponent(rawBody),'Name: Ali & Sara\r\nEmail: ali@example.com\r\n\r\nEngineering & NFC? Let us discuss.');
});
