async page=>{
 await page.bringToFront();await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:900});
 const results=[];
 try{
  for(const id of ['atelier','burgundy','onyx','rose','metal'])for(const path of ['','experience/','skills/','contact/']){
   await page.goto('http://127.0.0.1:4176/preview/en/'+path);await page.locator('.theme-trigger').click();await page.locator(`[data-theme-choice=${id}]`).click();
   const state=await page.evaluate(async id=>{
    const theme=(await import('http://127.0.0.1:5176/preview/themes.ts')).THEMES.find(t=>t.id===id),probe=document.createElement('i');probe.style.background=theme.colors.panel;document.body.append(probe);const expected=getComputedStyle(probe).backgroundColor;probe.remove();
    const cards=[...document.querySelectorAll('.pulse-scene--0 .pulse-scene-surface,.story-board,.profile-company,.profile-skill-section,.skills-approach>div>article,.story-career-entry')].map(e=>({class:e.className,color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor,shadow:getComputedStyle(e).boxShadow}));
    const rgb=v=>{const c=v.match(/[\d.]+/g)?.map(Number);return c?[c[0],c[1],c[2],c[3]??1]:[0,0,0,0];};const lum=a=>{const c=a.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
    const elements=[...document.querySelectorAll('.pulse-scene--0 h3,.pulse-scene--0 p,.pulse-scene--0 li,.pulse-scene--0 a.pulse-case-link,.pulse-scene--0 .pulse-scene-top,.pulse-scene--0 .pulse-scene-bottom,.story-board-heading,.story-sheet-top,.story-sheet figcaption,.story-board-footer,.profile-company h2,.profile-company h3,.profile-company p,.profile-company summary,.profile-current,.profile-responsibilities li,.profile-skill-section h2,.profile-skill-list li,.skill-project-evidence a,.skill-project-evidence p,.skills-approach article h3,.skills-approach article p,.story-career-entry h3,.story-career-entry h4,.story-career-entry p,.story-career-period,.pulse-primary,.pulse-resume,.pulse-text-link,.story-project-link,.story-contact-action,.desk-compose .button-primary')],failures=[];
    for(const e of elements){const style=getComputedStyle(e);let node=e,layers=[];while(node){const b=rgb(getComputedStyle(node).backgroundColor);if(b[3])layers.push(b);node=node.parentElement;}let bg=[255,255,255];for(const b of layers.reverse())bg=b.slice(0,3).map((v,i)=>v*b[3]+bg[i]*(1-b[3]));const fg=rgb(style.color).slice(0,3),ratio=(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05),min=parseFloat(style.fontSize)>=24?3:4.5;if(ratio<min)failures.push({text:e.textContent.slice(0,50),class:e.className,ratio,min,color:style.color,bg});}
    return {theme:document.documentElement.dataset.theme,expected,cards,checked:elements.length,failures};
   },id);
   if(state.theme!==id||state.cards.some(c=>c.bg!==state.expected||c.shadow==='none')||state.failures.length)throw Error(JSON.stringify({id,path,state}));results.push({id,path,...state});
  }
  return {passed:true,groups:results.length,checked:results.reduce((n,g)=>n+g.checked,0),results};
 }finally{await page.emulateMedia({reducedMotion:'no-preference'});}
}
