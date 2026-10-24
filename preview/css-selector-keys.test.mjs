import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source=ts.transpile(fs.readFileSync(new URL('./css-selector-keys.ts',import.meta.url),'utf8'),{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022});
const {specificity,splitTrailingIs,rewriteSelectorList,selectorKeys}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

test('specificity follows Selectors Level 4',()=>{
 assert.deepEqual(specificity('html .a.b :is(h1,.c)'),[0,3,1]);
 assert.deepEqual(specificity('#x .a > p::before'),[1,1,2]);
 assert.deepEqual(specificity(':where(.a,#b) p'),[0,0,1]);
 assert.deepEqual(specificity('a:not(.x,#y)'),[1,0,1]);
 assert.deepEqual(specificity('html[dir=rtl] .x:hover'),[0,3,1]);
});
test('a trailing :is() becomes indexed branches with the original specificity when it is reachable',()=>{
 const out=splitTrailingIs('html .light-portfolio :is(.a .b, .c, .d.e)');
 assert.deepEqual(out,['html .light-portfolio .a .b','html .light-portfolio .c:not(._k)','html .light-portfolio .d.e']);
 assert.deepEqual(specificity(out[0]),[0,3,1]);assert.deepEqual(specificity(out[1]),[0,3,1]);
});
test('tag branches among class branches get the smallest padding not below the original',()=>{
 const out=splitTrailingIs('html .light-portfolio :is(h1, h2, .hero-role)');
 assert.deepEqual(out,['html .light-portfolio h1:not(._k)','html .light-portfolio h2:not(._k)','html .light-portfolio .hero-role']);
 assert.deepEqual(specificity(out[0]),[0,2,2]);assert.deepEqual(specificity(out[2]),[0,2,1]);
});
test('child combinators, pseudo suffixes and ids: padding sits before the suffix',()=>{
 const original=':root .x > :is(.a .b, #id):hover::after';
 const out=splitTrailingIs(original);
 assert.deepEqual(out,[':root .x > .a .b:not(#_k):hover::after',':root .x > #id:hover::after']);
 for(const branch of out)assert.ok(specificity(branch)[0]===specificity(original)[0]);
 assert.deepEqual(specificity(out[1]),specificity(original));
});
test('selectors without a trailing :is() are untouched',()=>{
 assert.deepEqual(splitTrailingIs('.a :is(.b,.c) .d'),['.a :is(.b,.c) .d']);
 assert.deepEqual(splitTrailingIs('.a .b'),['.a .b']);
 assert.deepEqual(splitTrailingIs('.a :is(.b, .c):is(:hover)'),['.a :is(.b, .c):is(:hover)']);
});
test('selector lists rewrite each member and the plugin is idempotent',()=>{
 const list='.a :is(.b,.c), .d p, .e :is(span, .f)';
 const once=rewriteSelectorList(list);
 assert.equal(once,'.a .b,.a .c,.d p,.e span:not(._k),.e .f');
 assert.equal(rewriteSelectorList(once),once);
 const rule={selector:'html :is(.x,.y)'};selectorKeys().Rule(rule);assert.equal(rule.selector,'html .x,html .y');
});
