// Asia/Amman calendar helpers (Intl keeps this correct even if the zone's offset rules change).
const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Amman',year:'numeric',month:'2-digit',day:'2-digit'});
export const ammanDay=(d=new Date())=>fmt.format(d);
export const shift=(day:string,n:number)=>{const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
const dow=(day:string)=>(new Date(day+'T00:00:00Z').getUTCDay()+6)%7; // Monday = 0
export const PRESETS:Record<string,(t:string)=>[string,string]>={
  today:t=>[t,t],yesterday:t=>[shift(t,-1),shift(t,-1)],week:t=>[shift(t,-dow(t)),t],'7d':t=>[shift(t,-6),t],
  month:t=>[t.slice(0,8)+'01',t],'30d':t=>[shift(t,-29),t],'90d':t=>[shift(t,-89),t]};
