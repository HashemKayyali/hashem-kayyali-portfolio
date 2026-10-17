async page=>{
 await page.bringToFront();await page.emulateMedia({reducedMotion:'reduce'});const results=[];
 try{
  for(const locale of ['en','ar'])for(const width of [1440,320]){
   await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:4176/preview/${locale}/skills/`);await page.evaluate(()=>document.fonts.ready);await page.locator('[data-wb-category="-1"]').click();
   for(const id of ['atelier','burgundy','onyx','rose','metal']){
    await page.locator('.theme-trigger').click();await page.locator(`[data-theme-choice="${id}"]`).click();
    const state=await page.evaluate(()=>{
     const root=document.querySelector('main'),rgb=v=>{const c=v.match(/[\d.]+/g)?.map(Number);return c?[c[0],c[1],c[2],c[3]??1]:[0,0,0,0];},lum=a=>{const c=a.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;},failures=[];
     const nodes=[...root.querySelectorAll('h1,h2,h3,p,li,.index,.wb-tool bdi,[data-wb-category]>span:not(.wb-mark):not(.wb-category-icon),[data-wb-category]>.wb-category-count,.wb-current,.wb-count,.wb-case-link,[data-wb-project]>span,[data-wb-project]>bdi,.wb-inventory-foot>span,.wb-reset')].filter(e=>!e.closest('[inert]')&&e.getClientRects().length&& !e.disabled);
     for(const e of nodes){const style=getComputedStyle(e);let node=e,layers=[];while(node){const b=rgb(getComputedStyle(node).backgroundColor);if(b[3])layers.push(b);node=node.parentElement;}let bg=[255,255,255];for(const b of layers.reverse())bg=b.slice(0,3).map((v,i)=>v*b[3]+bg[i]*(1-b[3]));const fg=rgb(style.color).slice(0,3),ratio=(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05),min=parseFloat(style.fontSize)>=24?3:4.5;if(ratio<min-.01)failures.push({text:e.textContent.slice(0,60),ratio,min,color:style.color,bg});}
     return{theme:document.documentElement.dataset.theme,checked:nodes.length,failures,overflow:document.documentElement.scrollWidth-innerWidth,panels:[...root.querySelectorAll('.wb-inventory,.wb-inspector,.wb-scope')].map(e=>getComputedStyle(e).backgroundColor)};
    });
    if(state.theme!==id||state.failures.length||state.overflow>1)throw Error(JSON.stringify({locale,width,id,state}));
    await page.keyboard.press('Tab');const category=page.locator('[data-wb-category="0"]');await category.focus();const focus=await category.evaluate(e=>({outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,offset:getComputedStyle(e).outlineOffset,visible:e.matches(':focus-visible')}));if(!focus.visible||focus.outline!=='solid'||parseFloat(focus.width)<2)throw Error(JSON.stringify(focus));results.push({locale,width,id,...state,focus});
   }
  }
  return{passed:true,groups:results.length,contrastChecks:results.reduce((n,r)=>n+r.checked,0),results};
 }finally{await page.emulateMedia({reducedMotion:'no-preference'});}
}
