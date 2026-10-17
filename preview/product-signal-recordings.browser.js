async(page)=>{
 const browser=page.context().browser(),rows=[];
 for(const [width,height,locale]of [[1366,768,'en'],[1920,1080,'ar'],[390,844,'en'],[320,740,'ar']]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,recordVideo:{dir:'output/playwright/product-signal/videos',size:{width,height}}});
  let video;const errors=[];
  try{
   const view=await context.newPage();video=view.video();view.on('pageerror',e=>errors.push(e.message));await view.bringToFront();
   await view.goto('http://127.0.0.1:4176/preview/'+locale+'/');await view.waitForFunction(()=>document.querySelector('[data-home-intro]')?.dataset.intro==='complete');await view.waitForTimeout(400);
   if(width<801){await view.locator('.navigation-toggle').click();await view.waitForTimeout(500);await view.keyboard.press('Escape');}else{await view.locator('.pulse-primary').hover();await view.waitForTimeout(450);await view.mouse.move(20,80);}
   // Real incremental native scroll captures continuous layer and image-depth motion.
   const distance=await view.locator('.pulse-scenes').evaluate(e=>e.getBoundingClientRect().bottom+scrollY),steps=64;
   const markers=await view.locator('[data-scene-marker]').evaluateAll(nodes=>nodes.map(e=>({id:e.getAttribute('data-scene-marker'),y:e.getBoundingClientRect().top+scrollY}))),held=new Set();
   for(let i=1;i<=steps;i++){
    const y=distance*i/steps;await view.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await view.waitForTimeout(160);
    for(const marker of markers)if(!held.has(marker.id)&&y>=marker.y-106){
     held.add(marker.id);await view.locator('[data-home-scene="'+marker.id+'"] .pulse-scene-media img').evaluate(e=>e.decode());await view.waitForTimeout(950);
    }
   }
   await view.waitForTimeout(550);await view.locator('.pulse-approach').scrollIntoViewIfNeeded();await view.waitForTimeout(1100);await view.locator('.pulse-contact').scrollIntoViewIfNeeded();await view.waitForTimeout(1100);
   const path='output/playwright/product-signal/videos/signal-'+locale+'-'+width+'.webm';await context.close();await video.saveAs(path);rows.push({width,height,locale,path,errors});
  }catch(error){await context.close();if(video)await video.saveAs('output/playwright/product-signal/videos/partial-'+locale+'-'+width+'.webm');throw error;}
 }
 return rows;
}
