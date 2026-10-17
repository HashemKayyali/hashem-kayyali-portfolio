async(page)=>{
 const browser=page.context().browser(),out=[];
 for(const [width,height,locale] of [[1366,768,'en'],[1536,864,'ar'],[1920,1080,'en'],[2560,1440,'ar'],[390,844,'en'],[320,740,'ar']]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,recordVideo:{dir:'output/playwright/creative-director/videos',size:{width,height}}});
  const view=await context.newPage(),errors=[];view.on('pageerror',e=>errors.push(e.message));
  await view.goto('http://127.0.0.1:4176/preview/creative/'+locale+'/');
  await view.locator('.hero').waitFor();await view.waitForFunction(()=>document.querySelector('.hero')?.dataset.portraitFinished==='complete');await view.waitForTimeout(600);
  await view.locator('#projects').scrollIntoViewIfNeeded();await view.waitForTimeout(1300);
  if(width>800){await view.locator('.lab-feature--terminal-nfc').scrollIntoViewIfNeeded();await view.waitForTimeout(1100);}
  await view.goto('http://127.0.0.1:4176/preview/creative/'+locale+'/projects/');await view.locator('[data-gallery-project="bike-tower"]').waitFor();await view.waitForTimeout(1100);
  await view.locator('[data-gallery-project="bike-tower"]').click();await view.waitForURL('**/projects/bike-tower/');await view.locator('.signature-case').waitFor();await view.waitForTimeout(1500);
  await view.goBack();await view.waitForURL('**/'+locale+'/projects/');await view.waitForTimeout(1300);
  const video=view.video(),path='output/playwright/creative-director/videos/lab-'+locale+'-'+width+'.webm';await context.close();await video.saveAs(path);out.push({path,viewport:[width,height],locale,errors});
 }
 return out;
}
