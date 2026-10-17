async page=>{
 await page.bringToFront();await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:5176/preview/en/skills/');await page.evaluate(()=>document.fonts.ready);
 const state=await page.evaluate(()=>({workbench:!!document.querySelector('[data-skills-workbench]'),skills:document.querySelectorAll('[data-workbench-tool]').length,triggers:window.__portfolioMotion().triggers.map(t=>t.id),height:document.querySelector('main').getBoundingClientRect().height}));
 if(!state.workbench||state.skills!==32||state.triggers.length||state.height>2200)throw Error(JSON.stringify(state));return {passed:true,state};
}
