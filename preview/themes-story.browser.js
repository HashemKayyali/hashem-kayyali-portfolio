async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
 const assert=(ok,message)=>{if(!ok)throw Error(message);};
 const themes=['atelier','burgundy','onyx','rose','metal'];
 const choose=async id=>{await page.locator('.theme-trigger').click();await page.locator(`[data-theme-choice=${id}]`).click();await page.waitForTimeout(460);};
 const probe=()=>page.evaluate(()=>{
  const root=document.documentElement,shell=document.querySelector('.luxury-portfolio'),head=document.querySelector('.site-header'),theme=document.querySelector('.theme-trigger');
  const overflow=[...document.querySelectorAll('.header-layout>*,.story-heading,.story-chapter,.story-career-entry,.story-correspondence,.theme-trigger,.language-trigger')].filter(e=>{const r=e.getBoundingClientRect();return r.width&& (r.left<-.5||r.right>innerWidth+.5);}).map(e=>e.className);
  return {theme:root.dataset.theme,bg:getComputedStyle(shell).backgroundColor,ink:getComputedStyle(shell).color,header:head.getBoundingClientRect().height,opacity:getComputedStyle(head).opacity,overflow,width:root.scrollWidth,viewport:innerWidth,controls:[theme.getBoundingClientRect().width,theme.getBoundingClientRect().height],story:document.querySelector('.home-story')?.dataset.storyMotion,chapters:document.querySelectorAll('[data-story-chapter]').length,employers:document.querySelectorAll('.story-career-entry').length};
 });
 for(const locale of ['en','ar'])for(const width of [1920,1440,390,320]){
  await page.setViewportSize({width,height:width<500?844:1000});await page.goto(`http://127.0.0.1:4176/preview/${locale}/`);await page.locator('.story-contact').waitFor();await page.waitForTimeout(1250);
  for(const id of themes){await choose(id);const p=await probe();assert(p.theme===id,`theme ${locale}/${width}/${id}`);assert(p.header===68&&p.opacity==='1',`header ${JSON.stringify(p)}`);assert(!p.overflow.length&&p.width<=width,`overflow ${JSON.stringify(p)}`);assert(p.controls.every(v=>v>=44),`target ${JSON.stringify(p)}`);assert(p.chapters===3&&p.employers===4,'chapter/employer inventory');results.push({locale,width,id,background:p.bg,mode:p.story});}
 }
 // Theme persistence across all page families, source-approved employers and protected media.
 for(const id of themes){await choose(id);for(const path of ['about/','projects/','experience/','skills/','contact/','projects/eventies/','projects/terminal-nfc/']){
  await page.goto(`http://127.0.0.1:4176/preview/en/${path}`);await page.locator('main h1').waitFor();await page.waitForTimeout(550);const p=await probe();assert(p.theme===id,`persistence ${id}/${path}`);assert(!p.overflow.length&&p.width<=p.viewport,`route overflow ${id}/${path}: ${JSON.stringify(p)}`);assert(p.opacity==='1','nav visible');results.push({id,path,width:p.viewport,background:p.bg});
 }}
 await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:4176/preview/en/');await page.waitForTimeout(1500);
 const checks=await page.evaluate(async()=>{
  const source=(await import('http://127.0.0.1:5176/content/locales/en.ts')).default;
  const career=[...document.querySelectorAll('.story-career-entry')].map(e=>e.textContent);
  const correct=source.resume.experience.every((e,i)=>career[i].includes(e.company)&&career[i].includes(e.roles?.[0]?.title??e.role)&&career[i].includes(e.roles?.[0]?.period??e.period));
  return {correct,canvas:document.querySelector('canvas').dataset.frame,images:[...document.querySelectorAll('.story-sheet img')].map(e=>({src:e.currentSrc,complete:e.complete,native:e.naturalWidth}))};
 });assert(checks.correct,'career factual preservation');
 assert(errors.length===0,`page errors: ${errors}`);
 return {passed:results.length,results,checks,errors};
}
