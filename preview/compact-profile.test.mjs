import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as skillLinks from './skills-project-links.ts';
const {SKILL_IDS,projectsForSkills}=skillLinks;
import {projectAssets} from '../data/projectAssets.ts';
import {experienceAssets,RESUME_PDF,RESUME_DOCX} from '../data/profile.ts';
import {workbenchArtwork,disciplineArtwork,workbenchCopy} from './skills-workbench-copy.ts';
import {pageCopy} from './page-copy.ts';

const require=createRequire(import.meta.url);
function loadTs(path,imports={}){
 const source=readFileSync(new URL(path,import.meta.url),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const module={exports:{}};
 vm.runInNewContext('(function(require,module,exports){'+compiled+'\n})',{location:{hash:''},console})(name=>{
  if(name.endsWith('.css'))return {};
  if(name in imports)return imports[name];
  return require(name);
 },module,module.exports);
 return module.exports;
}
const dictionaries=Object.fromEntries(['en','ar','de','fr','es'].map(locale=>[locale,loadTs(`../content/locales/${locale}.ts`).default]));
const icon=()=>null;
const Hero=({eyebrow,title,description,visual,actions})=>React.createElement('header',null,eyebrow,React.createElement('h1',null,title),description,visual,actions);
const motion={captureLayout(){},captureEvidence(){}};
/** Component render harness: real authored dictionaries/matching and JSX; only
 * browser-only motion/router/image effects are replaced. Hook state supports
 * repeated tool/category events without introducing a DOM dependency. */
function component(path,locale){
 const states=[];let cursor=0;
 const hooks={...React,useEffect(){},useLayoutEffect(){},useMemo:create=>create(),useRef:value=>({current:value}),useState(initial){const slot=cursor++;if(!(slot in states))states[slot]=typeof initial==='function'?initial():initial;return [states[slot],value=>{states[slot]=typeof value==='function'?value(states[slot]):value;}];}};
 const imports={react:hooks,'lucide-react':new Proxy({},{get:()=>icon}),'../i18n/useI18n':{useI18n:()=>({t:dictionaries[locale],locale})},'../data/profile':{experienceAssets,RESUME_PDF,RESUME_DOCX},'./CompactHero':{__esModule:true,default:Hero},'./experience-journey-motion':{useExperienceJourneyMotion(){}},'../data/projectAssets':{projectAssets},'./page-copy':{pageCopy},'./PageShell':{NavLink:({children,route,navigate,...props})=>React.createElement('a',{...props,href:`/${route.project??route.page}/`},children)},'./PortfolioSections':{ProductImage:()=>null},'./skills-project-links':skillLinks,'./skills-workbench-copy':{workbenchArtwork,disciplineArtwork,workbenchCopy},'./skills-workbench-motion':{useSkillsWorkbenchMotion:()=>motion}};
 const Component=loadTs(path,imports).default;
 return {render(){cursor=0;return Component({route:{locale,page:'skills'},navigate(){}});}};
}
function nodes(tree,predicate,result=[]){
 if(Array.isArray(tree)){tree.forEach(child=>nodes(child,predicate,result));return result;}
 if(!tree||typeof tree!=='object')return result;
 if(predicate(tree))result.push(tree);
 nodes(tree.props?.children,predicate,result);return result;
}
const text=tree=>renderToStaticMarkup(tree).replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/\s+/g,' ').trim();
const normalize=value=>value.replace(/\s+/g,' ').trim();

for(const locale of Object.keys(dictionaries))test(`${locale}: every career fact and all six roles are readable without a disclosure`,()=>{
 const app=component('./ExperienceJourney.tsx',locale),tree=app.render(),visible=text(tree),dictionary=dictionaries[locale];
 assert.equal(nodes(tree,node=>node.type==='details').length,0);
 const facts=[];
 for(const entry of dictionary.resume.experience){
  facts.push(entry.company,entry.period,entry.location,...entry.points,...(entry.responsibilities??[]));
  for(const key of ['role','employment','mode','badge'])if(entry[key])facts.push(entry[key]);
  for(const role of entry.roles??[])facts.push(role.title,role.period,role.employment,role.mode,...role.points);
 }
 assert.equal(nodes(tree,node=>node.props?.className==='journey-role').length,6);
 for(const fact of facts)assert.ok(visible.includes(normalize(fact)),`Missing fact: ${fact}`);
 for(const value of [...Object.values(dictionary.resume.education),...Object.values(dictionary.resume.downloadCard),dictionary.resume.coreStrengths.title,...dictionary.resume.coreStrengths.items,dictionary.resume.profileEyebrow,dictionary.resume.journeyTitle,dictionary.resume.journeySupport,dictionary.resume.title])assert.ok(visible.includes(normalize(value)),`Missing supporting source: ${value}`);
 assert.equal(nodes(tree,node=>node.type==='a'&&node.props.href===RESUME_PDF).length,1);
 assert.equal(nodes(tree,node=>node.type==='a'&&node.props.href===RESUME_DOCX).length,1);
});

for(const locale of Object.keys(dictionaries))test(`${locale}: all 32 tools select exact evidence immediately in their group`,()=>{
 const app=component('./SkillsWorkbench.tsx',locale);let tree=app.render();
 const buttons=nodes(tree,node=>node.props?.['data-workbench-tool']!==undefined);
 assert.equal(buttons.length,32);
 for(let index=0;index<32;index++){
  nodes(tree,node=>node.props?.['data-workbench-tool']===index)[0].props.onClick();tree=app.render();
  const evidence=nodes(tree,node=>node.props?.id==='wb-inline-evidence');assert.equal(evidence.length,1);assert.equal(evidence[0].props['data-wb-near-tool'],index);
  const fragment=nodes(tree,node=>node.type===React.Fragment&&Array.isArray(node.props.children)&&node.props.children[0]?.props?.['data-workbench-tool']===index)[0];
  assert.equal(fragment.props.children[1],evidence[0],'Evidence must immediately follow its selected tool');
  const group=nodes(tree,node=>node.props?.className==='wb-tool-group'&&nodes(node,child=>child===evidence[0]).length)[0];assert.ok(group&&!group.props.hidden);
  const expected=projectsForSkills([SKILL_IDS[index]]);
  const links=nodes(evidence[0],node=>node.props?.route?.project);
  assert.deepEqual(links.map(link=>link.props.route.project),expected.map(connection=>connection.id));
  if(expected.length)assert.ok(text(evidence[0]).includes(normalize(dictionaries[locale].about.skills.flat()[index])),'Matched skill is labelled in the current locale');
  else assert.ok(text(evidence[0]).includes(workbenchCopy[locale].empty),'Unsupported skill shows the honest empty state');
  assert.equal(nodes(tree,node=>node.props?.['data-workbench-tool']===index)[0].props['aria-pressed'],true);
 }
 // Same tool toggles off; changing category clears stale evidence and leaves all
 // source tools available in the DOM inside their semantic groups.
 nodes(tree,node=>node.props?.['data-workbench-tool']===31)[0].props.onClick();tree=app.render();assert.equal(nodes(tree,node=>node.props?.id==='wb-inline-evidence').length,0);
 nodes(tree,node=>node.props?.['data-wb-category']===1)[0].props.onClick();tree=app.render();assert.equal(nodes(tree,node=>node.props?.className==='wb-tool-group'&&!node.props.hidden).length,1);
 assert.equal(nodes(tree,node=>node.props?.['data-workbench-tool']!==undefined).length,32);
 const visible=text(tree);for(const capability of dictionaries[locale].capabilities.items)assert.ok(visible.includes(normalize(capability.description)));
});


for(const locale of Object.keys(dictionaries))test(`${locale}: preview follows the selection, falls back to the first match and Clear restores every linked project`,()=>{
 const app=component('./SkillsWorkbench.tsx',locale);let tree=app.render();
 const click=predicate=>{nodes(tree,predicate)[0].props.onClick();tree=app.render();};
 const previewId=()=>nodes(tree,node=>node.props?.['data-wb-preview'])[0]?.props['data-wb-preview'];
 const selectorIds=()=>nodes(tree,node=>node.props?.['data-wb-project']).map(node=>node.props['data-wb-project']);
 const status=()=>text(nodes(tree,node=>node.props?.className==='wb-selection-status')[0]);
 const label=skill=>normalize(dictionaries[locale].about.skills.flat()[SKILL_IDS.indexOf(skill)]);
 const everyLinked=projectsForSkills(SKILL_IDS).map(item=>item.id);
 assert.deepEqual(selectorIds(),everyLinked);assert.ok(status().endsWith(`(${everyLinked.length})`));
 // PCB Design: the remembered project (Eventies) is not a match, so the preview falls back to the first.
 click(node=>node.props?.['data-workbench-tool']===SKILL_IDS.indexOf('pcb-design'));
 assert.deepEqual(selectorIds(),['bike-tower','basket-beats','vr-cycling','bike-land-trainer']);assert.equal(previewId(),'bike-tower');assert.ok(status().endsWith('(4)'));
 click(node=>node.props?.['data-wb-project']==='vr-cycling');assert.equal(previewId(),'vr-cycling');
 // A new skill that still includes the chosen project keeps it; one that does not falls back.
 click(node=>node.props?.['data-workbench-tool']===SKILL_IDS.indexOf('ble'));assert.equal(previewId(),'vr-cycling');
 click(node=>node.props?.['data-workbench-tool']===SKILL_IDS.indexOf('supabase'));assert.equal(previewId(),'eventies');
 assert.ok(text(nodes(tree,node=>node.props?.className==='wb-match')[0]).includes(label('supabase')));
 // Unsupported skill: honest empty state in both panels and a zero count.
 click(node=>node.props?.['data-workbench-tool']===SKILL_IDS.indexOf('react-native'));
 assert.equal(previewId(),undefined);assert.ok(status().endsWith('(0)'));
 assert.equal(nodes(tree,node=>node.props?.className==='wb-empty').length,2);
 // Category union, then Clear restores the complete linked set.
 click(node=>node.props?.['data-wb-category']===4);
 assert.deepEqual(selectorIds(),['umniah-youthconnect','outreach-automation','traffic-flow-analytics']);
 click(node=>node.props?.className==='wb-reset');assert.deepEqual(selectorIds(),everyLinked);
});
