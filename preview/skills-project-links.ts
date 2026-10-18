import {PROJECT_IDS,type ProjectId} from '../content/types.ts';

/*
 * Owner-approved Skills → Projects map (18 Oct 2026). The single source of truth for the
 * Technical Toolkit: relationships are keyed by stable skill ids, never by translated or
 * technology labels, so every locale resolves the same evidence.
 * SKILL_CATEGORIES mirrors `about.skills` in content/master.json, group by group and in order;
 * a test keeps the two aligned in all five locales.
 */
export const SKILL_CATEGORIES=[
 ['next-js','react','typescript','javascript','tailwind-css','responsive-ui'],
 ['react-native','flutter','dart','android-studio','cross-platform'],
 ['csharp','wpf','dotnet-web-api','rest-apis','supabase','postgresql','sql','websocket'],
 ['microcontrollers','embedded-cpp','ble','nfc','wifi','real-time-communication','pcb-design','custom-hardware'],
 ['python','opencv','computer-vision','email-automation','excel-csv'],
] as const;
export type SkillId=(typeof SKILL_CATEGORIES)[number][number];
export const SKILL_IDS:readonly SkillId[]=SKILL_CATEGORIES.flat();

// Every project id must appear and every entry must be a known skill id (checked by tsc).
export const PROJECT_SKILLS={
 'eventies':['next-js','react','typescript','tailwind-css','responsive-ui','supabase'],
 'glitzz-lab':['next-js','react','typescript','tailwind-css','responsive-ui','supabase','rest-apis'],
 'umniah-youthconnect':['flutter','dart','supabase','cross-platform','excel-csv'],
 'terminal-nfc':['csharp','wpf','dotnet-web-api','rest-apis','supabase','nfc','microcontrollers','real-time-communication','custom-hardware'],
 'bike-tower':['flutter','dart','cross-platform','microcontrollers','embedded-cpp','websocket','wifi','real-time-communication','pcb-design','custom-hardware'],
 'basket-beats':['flutter','dart','microcontrollers','embedded-cpp','websocket','wifi','real-time-communication','pcb-design','custom-hardware'],
 'vr-cycling':['microcontrollers','embedded-cpp','ble','real-time-communication','pcb-design','custom-hardware'],
 'bike-land-trainer':['microcontrollers','embedded-cpp','ble','real-time-communication','pcb-design','custom-hardware'],
 'financial-operations':['react','typescript','tailwind-css','responsive-ui','supabase','postgresql','sql'],
 'outreach-automation':['next-js','react','typescript','tailwind-css','supabase','postgresql','sql','email-automation','excel-csv'],
 'traffic-flow-analytics':['python','opencv','computer-vision','excel-csv'],
} as const satisfies Record<ProjectId,readonly SkillId[]>;

const order=(skills:readonly SkillId[])=>[...new Set(skills)].sort((a,b)=>SKILL_IDS.indexOf(a)-SKILL_IDS.indexOf(b));
/** Project → skills, in toolkit order. */
export const skillsForProject=(id:ProjectId):SkillId[]=>order(PROJECT_SKILLS[id]);
/** Skills → projects (union), in project order, each with the selected skills it demonstrates. */
export function projectsForSkills(skills:readonly SkillId[]):{id:ProjectId;skills:SkillId[]}[]{
 const wanted=new Set(skills);
 return PROJECT_IDS.flatMap(id=>{const matched=skillsForProject(id).filter(skill=>wanted.has(skill));return matched.length?[{id,skills:matched}]:[];});
}
