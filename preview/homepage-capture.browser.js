async(page)=>{
 const rows=[],errors=[],failed=[];
 const onError=e=>errors.push(e.message),onResponse=r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});};
 page.on('pageerror',onError);page.on('response',onResponse);
 await page.bringToFront();await page.emulateMedia({reducedMotion:'no-preference'});
 try{
  for(const locale of ['en','ar','de','fr','es'])for(const [width,height] of [[320,740],[390,844],[768,1024],[1024,768],[1366,768],[1920,1080],[2560,1440]]){
   await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4176/preview/'+locale+'/');
   await page.waitForFunction(()=>document.querySelector('[data-home-intro]')?.dataset.intro==='complete');await page.evaluate(()=>document.fonts.ready);
   const path='output/playwright/homepage-redesign/final-'+locale+'-'+width+'.png';await page.screenshot({path});
   const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,headings:document.querySelectorAll('main h1').length,dir:document.documentElement.dir,lang:document.documentElement.lang,heroImage:document.querySelector('.vision-stage-image img').currentSrc,controls:[...document.querySelectorAll('[data-home-project-choice]')].map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})),name:{font:getComputedStyle(document.querySelector('h1')).fontFamily,weight:getComputedStyle(document.querySelector('h1')).fontWeight}}));
   if(metrics.overflow>0||metrics.headings!==1||metrics.controls.some(e=>e.height<44))throw Error(JSON.stringify({locale,width,metrics}));
   rows.push({locale,width,height,path,metrics});
   if(width===390||width===1366){
    await page.locator('#vision-work-title').scrollIntoViewIfNeeded();await page.waitForTimeout(800);await page.screenshot({path:'output/playwright/homepage-redesign/final-work-'+locale+'-'+width+'.png'});
   }
  }
  return{rows,errors,failed};
 }finally{page.off('pageerror',onError);page.off('response',onResponse);}
}
