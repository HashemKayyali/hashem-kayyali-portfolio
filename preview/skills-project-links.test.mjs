import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PROJECT_IDS} from '../content/types.ts';
import {projectAssets} from '../data/projectAssets.ts';
import {SKILL_CATEGORIES,SKILL_IDS,PROJECT_SKILLS,projectsForSkills,skillsForProject} from './skills-project-links.ts';

const source=JSON.parse(readFileSync(new URL('../content/master.json',import.meta.url),'utf8'));
const LOCALES=['en','ar','de','fr','es'];
// The owner-approved matrix, written out literally in both directions so any drift fails loudly.
const APPROVED={
 'eventies':['next-js','react','typescript','tailwind-css','responsive-ui','supabase'],
 'glitzz-lab':['next-js','react','typescript','tailwind-css','responsive-ui','rest-apis','supabase'],
 'umniah-youthconnect':['flutter','dart','cross-platform','supabase','excel-csv'],
 'terminal-nfc':['csharp','wpf','supabase','microcontrollers','real-time-communication','custom-hardware'],
 'bike-tower':['flutter','dart','cross-platform','websocket','microcontrollers','embedded-cpp','wifi','real-time-communication','pcb-design','custom-hardware'],
 'basket-beats':['flutter','dart','websocket','microcontrollers','embedded-cpp','wifi','real-time-communication','pcb-design','custom-hardware'],
 'vr-cycling':['microcontrollers','embedded-cpp','ble','real-time-communication','pcb-design','custom-hardware'],
 'bike-land-trainer':['microcontrollers','embedded-cpp','ble','real-time-communication','pcb-design','custom-hardware'],
 'financial-operations':['react','typescript','tailwind-css','responsive-ui','supabase','postgresql','sql'],
 'outreach-automation':['next-js','react','typescript','tailwind-css','supabase','postgresql','sql','email-automation','excel-csv'],
 'traffic-flow-analytics':['python','opencv','computer-vision','excel-csv'],
};
const SKILL_TO_PROJECTS={
 'next-js':['eventies','glitzz-lab','outreach-automation'],
 'react':['eventies','glitzz-lab','financial-operations','outreach-automation'],
 'typescript':['eventies','glitzz-lab','financial-operations','outreach-automation'],
 'javascript':[],
 'tailwind-css':['eventies','glitzz-lab','financial-operations','outreach-automation'],
 'responsive-ui':['eventies','glitzz-lab','financial-operations'],
 'react-native':[],
 'flutter':['umniah-youthconnect','bike-tower','basket-beats'],
 'dart':['umniah-youthconnect','bike-tower','basket-beats'],
 'android-studio':[],
 'cross-platform':['umniah-youthconnect','bike-tower'],
 'csharp':['terminal-nfc'],'wpf':['terminal-nfc'],'dotnet-web-api':[],
 'rest-apis':['glitzz-lab'],
 'supabase':['eventies','glitzz-lab','umniah-youthconnect','terminal-nfc','financial-operations','outreach-automation'],
 'postgresql':['financial-operations','outreach-automation'],
 'sql':['financial-operations','outreach-automation'],
 'websocket':['bike-tower','basket-beats'],
 'microcontrollers':['terminal-nfc','bike-tower','basket-beats','vr-cycling','bike-land-trainer'],
 'embedded-cpp':['bike-tower','basket-beats','vr-cycling','bike-land-trainer'],
 'ble':['vr-cycling','bike-land-trainer'],
 'nfc':[],
 'wifi':['bike-tower','basket-beats'],
 'real-time-communication':['terminal-nfc','bike-tower','basket-beats','vr-cycling','bike-land-trainer'],
 'pcb-design':['bike-tower','basket-beats','vr-cycling','bike-land-trainer'],
 'custom-hardware':['terminal-nfc','bike-tower','basket-beats','vr-cycling','bike-land-trainer'],
 'python':['traffic-flow-analytics'],'opencv':['traffic-flow-analytics'],'computer-vision':['traffic-flow-analytics'],
 'email-automation':['outreach-automation'],
 'excel-csv':['umniah-youthconnect','outreach-automation','traffic-flow-analytics'],
};
const sorted=list=>[...list].sort();
const groups=Object.values(source.about.skills);
const labels=locale=>groups.flatMap(group=>group.map(item=>item[locale]));

test('1-3: exactly 32 skills in 5 categories, and 11 projects in their established order',()=>{
 assert.equal(SKILL_IDS.length,32);assert.equal(new Set(SKILL_IDS).size,32);
 assert.equal(SKILL_CATEGORIES.length,5);assert.deepEqual(SKILL_CATEGORIES.map(group=>group.length),[6,5,8,8,5]);
 assert.deepEqual(groups.map(group=>group.length),[6,5,8,8,5],'content source keeps the same groups');
 assert.equal(PROJECT_IDS.length,11);assert.deepEqual(projectAssets.map(asset=>asset.id),[...PROJECT_IDS]);
 assert.deepEqual(source.projects.map(project=>project.id),[...PROJECT_IDS]);
});
test('4-5: every relationship names a valid skill and project, with no duplicates',()=>{
 assert.deepEqual(sorted(Object.keys(PROJECT_SKILLS)),sorted(PROJECT_IDS));
 for(const [id,skills] of Object.entries(PROJECT_SKILLS)){
  for(const skill of skills)assert.ok(SKILL_IDS.includes(skill),`${id}: unknown skill ${skill}`);
  assert.equal(new Set(skills).size,skills.length,`${id}: duplicate skill`);
 }
});
test('6: every skill returns exactly its approved projects, in project order',()=>{
 assert.deepEqual(sorted(Object.keys(SKILL_TO_PROJECTS)),sorted(SKILL_IDS));
 for(const skill of SKILL_IDS)assert.deepEqual(projectsForSkills([skill]).map(item=>item.id),SKILL_TO_PROJECTS[skill],skill);
});
test('7: every project returns exactly its approved skills, and both directions agree',()=>{
 for(const id of PROJECT_IDS){
  assert.deepEqual(sorted(skillsForProject(id)),sorted(APPROVED[id]),id);
  assert.deepEqual(sorted(SKILL_IDS.filter(skill=>SKILL_TO_PROJECTS[skill].includes(id))),sorted(APPROVED[id]),`${id} (reverse)`);
 }
});
test('8: category filters return the union of their skills, de-duplicated and in project order',()=>{
 for(const group of SKILL_CATEGORIES){
  const union=new Set(group.flatMap(skill=>SKILL_TO_PROJECTS[skill]));
  const result=projectsForSkills(group);
  assert.deepEqual(result.map(item=>item.id),PROJECT_IDS.filter(id=>union.has(id)));
  for(const item of result)assert.deepEqual(item.skills,group.filter(skill=>APPROVED[item.id].includes(skill)));
 }
 assert.deepEqual(projectsForSkills(SKILL_IDS).map(item=>item.id),[...PROJECT_IDS]);
});
test('9-10: every locale lists the same 32 skills by position, so ids resolve identically',()=>{
 for(const locale of LOCALES){
  assert.equal(labels(locale).length,32,locale);assert.ok(labels(locale).every(Boolean),locale);
  assert.ok(labels(locale)[SKILL_IDS.indexOf('microcontrollers')].includes('ESP32')&&labels(locale)[SKILL_IDS.indexOf('microcontrollers')].includes('ESP8266'),`${locale}: renamed skill`);
  assert.ok(readFileSync(new URL(`../content/locales/${locale}.ts`,import.meta.url),'utf8').includes(JSON.stringify(labels(locale)[SKILL_IDS.indexOf('microcontrollers')]).slice(1,-1)),`${locale}: generated locale is current`);
 }
 // Spot-check positional alignment against the English source labels.
 const en=labels('en');
 assert.deepEqual([en[SKILL_IDS.indexOf('microcontrollers')],en[SKILL_IDS.indexOf('pcb-design')],en[SKILL_IDS.indexOf('excel-csv')],en[SKILL_IDS.indexOf('csharp')],en[SKILL_IDS.indexOf('websocket')]],['Microcontrollers / ESP32 & ESP8266','PCB Design','Excel / CSV Processing','C#','WebSocket']);
});
test('13-14: Terminal NFC sits under Supabase and Microcontrollers (not PCB); both cycling projects under PCB Design',()=>{
 for(const skill of ['supabase','microcontrollers'])assert.ok(projectsForSkills([skill]).some(item=>item.id==='terminal-nfc'),skill);
 assert.ok(!projectsForSkills(['pcb-design']).some(item=>item.id==='terminal-nfc'));
 const pcb=projectsForSkills(['pcb-design']).map(item=>item.id);
 assert.ok(pcb.includes('vr-cycling')&&pcb.includes('bike-land-trainer'));
});
test('15: skills with no supported project resolve to an empty result',()=>{
 for(const skill of ['javascript','react-native','android-studio'])assert.deepEqual(projectsForSkills([skill]),[]);
});
