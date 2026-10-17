async(page)=>{
 const checks=[],errors=[],assert=(v,n)=>{checks.push({name:n,passed:Boolean(v)});if(!v)throw Error(n)},error=e=>errors.push(e.message);
 page.on('pageerror',error);await page.bringToFront();await page.emulateMedia({reducedMotion:'no-preference'});
 const ready=()=>page.waitForFunction(()=>document.querySelector('[data-home-intro]')?.dataset.intro==='complete');
 try{
  await page.setViewportSize({width:1366,height:768});
  for(const prefix of ['', 'creative/']){
   await page.goto('http://127.0.0.1:4176/preview/'+prefix+'en/');await ready();
   assert(await page.locator('.pulse-portrait img').evaluate(e=>e.loading==='eager'&&getComputedStyle(e).opacity==='1'&&e.getBoundingClientRect().bottom<innerHeight),'immediate desktop portrait '+prefix);
   await page.locator('.signature').focus();await page.keyboard.press('Tab');assert(await page.locator('.language-select select').evaluate(e=>e===document.activeElement),'header source-order Tab '+prefix);
   const selectBox=await page.locator('.language-select').boundingBox(),navBox=await page.locator('#primary-navigation').boundingBox();assert(selectBox.x<navBox.x,'visual header matches focus order '+prefix);
   for(const locale of ['ar','de','fr','es','en']){await page.locator('.language-select select').selectOption(locale);await page.waitForURL('**/preview/'+prefix+locale+'/');await ready();assert(await page.locator('html').getAttribute('lang')===locale,'locale '+prefix+locale);assert(await page.locator('.language-select select').evaluate(e=>e===document.activeElement),'language focus '+prefix+locale);}
   await page.locator('.pulse-work-index a').nth(1).click();await page.waitForTimeout(850);
   const caseLink=page.locator('[data-home-scene="eventies"] .pulse-case-link');await caseLink.click();await page.waitForURL('**/projects/eventies/');await page.locator('.signature-case').waitFor();
   assert(await page.locator('.homepage-redesign').count()===0,'Home theme removed on case '+prefix);
   assert(await page.evaluate(()=>window.__portfolioMotion().triggers.every(x=>!String(x.id??'').startsWith('signal:'))),'no leaked signal triggers '+prefix);
   await page.goBack();await page.waitForURL('**/preview/'+prefix+'en/**');await ready();assert(await page.locator('.pulse-home').count()===1,'native Back '+prefix);
  }
  await page.goto('http://127.0.0.1:4176/preview/en/');await ready();await page.evaluate(()=>scrollTo(0,1500));await page.waitForTimeout(900);
  const layer=await page.evaluate(()=>window.__portfolioMotion().triggers.find(t=>t.id==='signal:scene-layer:0'));assert(layer&&layer.progress>0&&layer.progress<1,'real scroll-linked layer progression');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);assert(await page.evaluate(()=>!window.__portfolioMotion().triggers.some(t=>String(t.id??'').includes('scene-layer'))),'responsive resize removes desktop layer triggers');
  await page.locator('[data-home-scene="eventies"] .pulse-scene-media').scrollIntoViewIfNeeded();const y=await page.evaluate(()=>scrollY);await page.locator('[data-home-scene="eventies"] .pulse-scene-media').dispatchEvent('focusin');assert(Math.abs(await page.evaluate(()=>scrollY)-y)<2,'mobile focus preserves native media position');
  await page.locator('.navigation-toggle').click();assert(await page.locator('.navigation-toggle').getAttribute('aria-expanded')==='true','mobile menu opens');await page.keyboard.press('Escape');assert(await page.locator('.navigation-toggle').evaluate(e=>e===document.activeElement),'Escape restores menu focus');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);assert(await page.evaluate(()=>!window.__portfolioMotion().triggers.some(t=>String(t.id??'').startsWith('signal:'))),'live reduced-motion removes every signal trigger');assert(await page.locator('.pulse-scene').first().evaluate(e=>getComputedStyle(e).position==='relative'),'reduced motion uses ordinary flow');
  assert(await page.locator('.pulse-portrait img').evaluate(e=>getComputedStyle(e).opacity==='1'),'reduced motion keeps portrait visible');
  await page.goto('http://127.0.0.1:4176/preview/ar/');await ready();assert(await page.evaluate(()=>document.documentElement.dir==='rtl'),'Arabic direction');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'strict Arabic no horizontal scrollbar');
  assert(await page.locator('[data-home-scene="terminal-nfc"] img').evaluate(e=>e.src.includes('/v2-media/terminal-cover-')),'safe NFC media');
  await page.setViewportSize({width:683,height:384});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'equivalent 200% reflow');
  assert(await page.locator('.pulse-resume').getAttribute('href')==='/resume/hashem-kayyali-resume.pdf','authentic resume');assert(errors.length===0,'no runtime errors');return{checks,errors};
 }finally{page.off('pageerror',error);await page.emulateMedia({reducedMotion:'no-preference'});}
}
