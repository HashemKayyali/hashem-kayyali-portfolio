import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {skillProjectConnections} from './skills-project-links.ts';

// Literal expectations catch accidental broad matches and unsupported project claims.
const source=JSON.parse(readFileSync(new URL('../content/master.json',import.meta.url),'utf8'));
const projects=Object.fromEntries(source.projects.map(project=>[project.id,{technology:project.technology}]));
test('web evidence follows approved technologies and never equates React Native with React',()=>{
 assert.deepEqual(skillProjectConnections(['React Native'],projects),[]);
 assert.deepEqual(skillProjectConnections(['React'],projects).map(item=>item.id),['financial-operations','outreach-automation']);
});
test('embedded and communication aliases preserve the exact approved evidence strings',()=>{
 const results=skillProjectConnections(['Microcontrollers / ESP32','WebSocket','PCB Design'],projects);
 assert.deepEqual(results.map(item=>item.id),['bike-tower','basket-beats','vr-cycling','bike-land-trainer']);
 assert.deepEqual(results[0].technology,['ESP32-S3','WebSockets','Custom PCB']);
});
test('backend matches remain separate from unrelated technology names',()=>{
 const result=skillProjectConnections(['C#','WPF','.NET Web API','REST APIs'],projects);
 assert.deepEqual(result,[{id:'terminal-nfc',technology:['C#','WPF','.NET Web API','REST APIs']}]);
 assert.deepEqual(skillProjectConnections(['SQL'],projects),[]);
});
