async(page)=>{
 const rows=[],errors=[],warnings=[],failed=[];
 const error=e=>errors.push(e.message),message=m=>{if(m.type()==='error'||(m.type()==='warning'&&m.text().includes('GSAP')))warnings.push(m.text());},response=r=>{if(r.status()>=400)failed.push(r.url());};
 page.on('pageerror',error);page.on('console',message);page.on('response',response);await page.bringToFront();await page.emulateMedia({reducedMotion:'no-preference'});
 try{for(const l of ['en','ar','de','fr','es'])for(const [w,h]of [[320,740],[390,844],[768,1024],[1024,768],[1366,768],[1920,1080],[2560,1440]]){
  await page.setViewportSize({width:w,height:h});await page.goto('http://127.0.0.1:4176/preview/'+l+'/');await page.locator('.pulse-portrait img').waitFor();
  const first=await page.locator('.pulse-portrait img').evaluate(e=>({top:e.getBoundingClientRect().top,height:e.getBoundingClientRect().height,opacity:getComputedStyle(e).opacity,loading:e.loading,priority:e.fetchPriority}));
  if(first.top>=h-60||first.opacity!=='1'||first.loading!=='eager')throw Error('Immediate portrait failed '+l+w);
  await page.waitForFunction(()=>document.querySelector('[data-home-intro]')?.dataset.intro==='complete');await page.evaluate(()=>document.fonts.ready);await page.locator('.pulse-portrait img').evaluate(e=>e.decode());
  await page.screenshot({path:'output/playwright/product-signal/final-'+l+'-'+w+'.png'});
  const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,h1:document.querySelector('main h1').textContent,dir:document.documentElement.dir,triggers:window.__portfolioMotion().triggers.length}));
  if(metrics.overflow>0)throw Error(JSON.stringify({w,l,metrics}));rows.push({l,w,h,first,metrics});
  if(w===1366||w===390){await page.locator('#home-work-bike-tower').scrollIntoViewIfNeeded();await page.waitForTimeout(850);await page.locator('[data-home-scene="bike-tower"] .pulse-scene-media img').evaluate(e=>e.decode());await page.screenshot({path:'output/playwright/product-signal/final-work-'+l+'-'+w+'.png'});}
 }return{rows,errors,warnings,failed};}finally{page.off('pageerror',error);page.off('console',message);page.off('response',response);}
}
