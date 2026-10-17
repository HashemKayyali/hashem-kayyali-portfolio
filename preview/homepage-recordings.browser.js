async(page)=>{
 const browser=page.context().browser(),rows=[];
 for(const [width,height,locale] of [[1366,768,'en'],[1920,1080,'ar'],[390,844,'en'],[320,740,'ar']]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,recordVideo:{dir:'output/playwright/homepage-redesign/videos',size:{width,height}}});
  let video;const errors=[];
  try{
   const view=await context.newPage();video=view.video();view.on('pageerror',e=>errors.push(e.message));
   await view.bringToFront();await view.goto('http://127.0.0.1:4176/preview/'+locale+'/');
   await view.waitForFunction(()=>document.querySelector('[data-home-intro]')?.dataset.intro==='complete');await view.waitForTimeout(450);
   if(width<801){await view.locator('.navigation-toggle').click();await view.waitForTimeout(600);await view.keyboard.press('Escape');await view.waitForTimeout(200);}
   for(const id of ['eventies','terminal-nfc','bike-tower']){await view.locator('[data-home-project-choice="'+id+'"]').click();await view.waitForTimeout(850);}
   await view.locator('#vision-work-title').scrollIntoViewIfNeeded();await view.waitForTimeout(850);
   const step=width<801?450:700;
   for(let i=0;i<6;i++){await view.evaluate(step=>scrollBy({top:step,behavior:'smooth'}),step);await view.waitForTimeout(700);}
   await view.locator('#vision-contact-title').scrollIntoViewIfNeeded();await view.waitForTimeout(850);
   const path='output/playwright/homepage-redesign/videos/home-'+locale+'-'+width+'.webm';
   await context.close();await video.saveAs(path);rows.push({width,height,locale,path,errors});
  }catch(error){await context.close();if(video)await video.saveAs('output/playwright/homepage-redesign/videos/partial-'+locale+'-'+width+'.webm');throw error;}
 }
 return rows;
}
