async(page)=>{
 const checks=[],errors=[],assert=(value,label)=>{checks.push({label,passed:Boolean(value)});if(!value)throw Error(label);};
 const error=e=>errors.push(e.message);page.on('pageerror',error);await page.bringToFront();
 const ready=()=>page.waitForFunction(()=>document.querySelector('[data-home-intro]')?.dataset.intro==='complete');
 try{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1366,height:768});
  for(const variant of ['', 'creative/']){
   await page.goto('http://127.0.0.1:4176/preview/'+variant+'en/');await ready();
   for(const id of ['eventies','terminal-nfc','bike-tower']){
    await page.locator('[data-home-project-choice="'+id+'"]').click();
    assert(await page.locator('.vision-project-stage').getAttribute('data-selected-project')===id,variant+' selection '+id);
    assert((await page.locator('.vision-stage-link').getAttribute('href')).endsWith('/projects/'+id+'/'),variant+' case destination '+id);
    assert(await page.locator('[data-home-project-choice][aria-pressed=true]').count()===1,variant+' one pressed control '+id);
   }
   const button=page.locator('[data-home-project-choice="eventies"]');await button.focus();await page.keyboard.press('Space');
   assert(await button.getAttribute('aria-pressed')==='true',variant+' keyboard project selection');
   await page.locator('.vision-stage-link').click();await page.waitForURL('**/projects/eventies/');await page.locator('.signature-case').waitFor();
   assert(await page.locator('.homepage-redesign').count()===0,variant+' Home theme removed on case');
   await page.goBack();await page.waitForURL('**/preview/'+variant+'en/');await ready();
   assert(await page.locator('.vision-project-stage').getAttribute('data-selected-project')==='eventies',variant+' native Back restores chosen project');
   for(const locale of ['ar','de','fr','es','en']){
    await page.locator('.language-select select').selectOption(locale);await page.waitForURL('**/preview/'+variant+locale+'/');await ready();
    assert(await page.locator('html').getAttribute('lang')===locale,variant+' locale '+locale);
    assert(await page.locator('html').getAttribute('dir')===(locale==='ar'?'rtl':'ltr'),variant+' direction '+locale);
    assert(await page.locator('.language-select select').evaluate(e=>e===document.activeElement),variant+' select retains focus '+locale);
   }
   await page.keyboard.press('Tab');await page.locator('.vision-primary').focus();
   assert(await page.locator('.vision-primary').evaluate(e=>getComputedStyle(e).outlineColor==='rgb(219, 248, 121)'),variant+' contrasting primary focus');
  }
  await page.setViewportSize({width:320,height:740});await page.goto('http://127.0.0.1:4176/preview/ar/');await ready();
  await page.locator('.navigation-toggle').click();assert(await page.locator('.navigation-toggle').getAttribute('aria-expanded')==='true','mobile menu opens');
  await page.keyboard.press('Tab');assert(await page.locator('#primary-navigation').evaluate(e=>e.contains(document.activeElement)),'mobile menu keyboard reaches links');
  await page.keyboard.press('Escape');assert(await page.locator('.navigation-toggle').getAttribute('aria-expanded')==='false','Escape closes mobile menu');
  assert(await page.locator('.navigation-toggle').evaluate(e=>e===document.activeElement),'Escape restores menu focus');
  await page.locator('.navigation-toggle').click();await page.locator('#primary-navigation a').filter({hasText:'المشاريع'}).click();await page.waitForURL('**/ar/projects/');
  assert(await page.locator('.homepage-redesign').count()===0,'mobile gallery removes Home identity');
  await page.goto('http://127.0.0.1:4176/preview/en/');await ready();
  await page.locator('#vision-person').scrollIntoViewIfNeeded();await page.waitForFunction(()=>window.__portfolioMotion?.().timelines.some(t=>t.id.includes('chapter:')&&t.active));
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!window.__portfolioMotion?.().timelines.some(t=>t.active),{},{timeout:250});
  assert(await page.locator('#vision-person').evaluate(e=>getComputedStyle(e).opacity==='1'),'live reduced-motion change restores visible chapter');
  await page.goto('http://127.0.0.1:4176/preview/en/');await ready();
  assert(await page.evaluate(()=>window.__portfolioMotion().timelines.every(t=>!t.active)),'static reduced-motion load');
  await page.locator('[data-home-project-choice="terminal-nfc"]').click();assert(await page.locator('.vision-stage-image img').evaluate(e=>e.currentSrc.includes('/v2-media/terminal-cover-')),'NFC selection uses redacted media');
  await page.setViewportSize({width:683,height:384});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'200% equivalent reflow at 683 CSS px');
  const cv=await page.locator('.vision-resume').getAttribute('href');assert(cv==='/resume/hashem-kayyali-resume.pdf','authentic resume destination');
  assert(errors.length===0,'no fresh runtime errors');return{checks,errors};
 }finally{page.off('pageerror',error);await page.emulateMedia({reducedMotion:'no-preference'});}
}
