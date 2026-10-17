async page=>{
 const results=[],errors=[];const error=e=>errors.push(e.message);page.on('pageerror',error);
 await page.bringToFront();await page.emulateMedia({reducedMotion:'reduce'});
 try{
  for(const locale of ['en','ar','de','fr','es'])for(const width of [1920,1440,390,320]){
   await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:5176/preview/${locale}/skills/`);await page.evaluate(()=>document.fonts.ready);await page.locator('[data-wb-category="-1"]').click();
   const state=await page.evaluate(async locale=>{
    const {default:t}=await import(`/content/locales/${locale}.ts`),root=document.querySelector('main'),tools=[...root.querySelectorAll('[data-workbench-tool]')],panels=[...root.querySelectorAll('.wb-scope')],active=root.querySelector('[data-wb-preview][data-active=true]');
    const rect=e=>e.getBoundingClientRect(),clip=[];
    for(const e of root.querySelectorAll('button,summary,h1,h2,.wb-preview-image')){if(e.closest('[inert]')||!e.getClientRects().length)continue;const r=rect(e);if(r.left<-.8||r.right>innerWidth+.8)clip.push({text:e.textContent.slice(0,40),x:r.left,right:r.right});}
    const link=active?.querySelector('.wb-case-link'),selector=root.querySelector('.wb-project-selector');
    return{locale,width:innerWidth,height:rect(root).height,overflow:document.documentElement.scrollWidth-innerWidth,clip,labels:tools.map(e=>e.querySelector('bdi').textContent),expected:t.about.skills.flat(),counts:[...root.querySelectorAll('[data-wb-category] .wb-category-count')].map(e=>Number(e.textContent)),images:tools.every(e=>{const i=e.querySelector('img');return i.complete&&i.naturalWidth>0;}),scope:panels.length,background:getComputedStyle(root).backgroundColor,heroBackground:getComputedStyle(root.querySelector('.wb-hero')).backgroundImage,triggers:window.__portfolioMotion().triggers,overlap:link&&selector?rect(link).bottom-rect(selector).top:0,header:getComputedStyle(document.querySelector('.site-header')).opacity};
   },locale);
   if(state.overflow>1||state.clip.length||JSON.stringify(state.labels)!==JSON.stringify(state.expected)||JSON.stringify(state.counts)!=='[32,6,5,8,8,5]'||!state.images||state.scope!==4||state.triggers.length||state.overlap>0||state.header!=='1')throw Error(JSON.stringify(state));
   const categories=[];
   for(let category=0;category<5;category++){
    await page.locator(`[data-wb-category="${category}"]`).click();const s=await page.evaluate(()=>({shown:[...document.querySelectorAll('.wb-tool')].filter(e=>getComputedStyle(e).display!=='none').length,focusable:[...document.querySelectorAll('.wb-tool')].filter(e=>!e.inert&&e.tabIndex===0).length,overflow:document.documentElement.scrollWidth-innerWidth,overlap:document.querySelector('.wb-case-link')?.getBoundingClientRect().bottom-document.querySelector('.wb-project-selector')?.getBoundingClientRect().top}));
    if(s.shown!==[6,5,8,8,5][category]||s.focusable!==s.shown||s.overflow>1||s.overlap>0)throw Error(JSON.stringify({locale,width,category,s}));categories.push(s.shown);
   }
   results.push({locale,width,height:state.height,categories,scope:state.scope,background:state.background,heroBackground:state.heroBackground});
  }
  if(errors.length)throw Error(errors.join('\n'));return {passed:true,groups:results.length,categoryStates:results.length*5,results};
 }finally{page.off('pageerror',error);await page.emulateMedia({reducedMotion:'no-preference'});}
}
