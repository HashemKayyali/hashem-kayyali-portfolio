import type {ProjectId} from '../content/types';

const normalized=(value:string)=>value.toLowerCase().trim().replace(/\s+/g,' ');
// Narrow nomenclature aliases, never category or substring guesses. Returned labels
// remain the exact approved technology strings; no connection implies a rating.
const aliases:Readonly<Record<string,readonly string[]>>={
 'microcontrollers / esp32':['microcontrollers','esp32','esp32-s3'],
 'websocket':['websockets'],
 'pcb design':['custom pcb'],
};
export function skillProjectConnections(skills:readonly string[],projects:Readonly<Record<ProjectId,{technology:readonly string[]}>>):{id:ProjectId;technology:string[]}[] {
 const terms=new Set(skills.flatMap(skill=>[normalized(skill),...(aliases[normalized(skill)]??[])]));
 return (Object.entries(projects) as [ProjectId,{technology:readonly string[]}][]).flatMap(([id,project])=>{
  const technology=project.technology.filter(term=>terms.has(normalized(term)));
  return technology.length?[{id,technology}]:[];
 });
}
