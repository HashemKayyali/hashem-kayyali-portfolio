import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('./brand.css',import.meta.url),'utf8');
const token=name=>css.match(new RegExp(name+':(#[a-f0-9]{6})'))?.[1];
const luminance=color=>{const c=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (values[0]+.05)/(values[1]+.05);};
test('Portfolio controls, muted copy and accents meet normal-text contrast on their surfaces',()=>{
 for(const [fg,bg] of [['--burgundy','--white'],['--burgundy-secondary','--paper'],['--ink','--paper'],['--muted','--paper'],['--white','--wine']])assert.ok(contrast(token(fg),token(bg))>=4.5,`${fg}/${bg}`);
});
