async page=>{
 const base='http://127.0.0.1:4176/preview/',results=[],errors=[],onError=e=>errors.push(e.message);page.on('pageerror',onError);
 const settle=async()=>{await page.waitForTimeout(550);};
 const verify=async(label,portrait=false)=>{const state=await page.evaluate(()=>({header:+getComputedStyle(document.querySelector('.header-layout')).opacity,footer:+getComputedStyle(document.querySelector('.compact-footer')).opacity,stage:+getComputedStyle(document.querySelector('.route-stage')).opacity,inert:document.querySelector('.route-stage').inert,portrait:+getComputedStyle(document.querySelector('.shared-hero-portrait')).opacity,documents:performance.getEntriesByType('navigation').length}));if(state.header!==1||state.footer!==1||state.stage!==1||state.inert||portrait&&state.portrait!==1||state.documents!==1)throw Error(label+' '+JSON.stringify(state));results.push({label,...state});};
 const nav=async(locale,name)=>{const toggle=page.locator('.navigation-toggle');if(await toggle.isVisible())await toggle.click();await page.locator('#primary-navigation a[href="/preview/'+locale+'/'+name+'"]').click();await page.waitForURL(base+locale+'/'+name);await settle();};
 const language=async(locale)=>{await page.locator('.language-trigger').click();await page.locator('[role=menuitemradio][lang='+locale+']').click();await page.waitForURL('**/preview/'+locale+'/**');};
 try{
  for(const source of ['en','ar'])for(const width of [320,390,1440,1920]){
   const locale=source==='en'?'ar':'en';await page.setViewportSize({width,height:width<800?844:1000});await page.goto(base+source+'/');await page.locator('.pulse-name').waitFor();await settle();await language(locale);await settle();await verify(source+'>'+locale+' '+width+' language',true);
   for(const name of ['about/','projects/','contact/','skills/','experience/','']){await nav(locale,name);await verify(locale+' '+width+' '+(name||'home'),['about/',''].includes(name));}
  }
  await page.setViewportSize({width:1440,height:900});await page.goto(base+'en/');await page.locator('.pulse-name').waitFor();await settle();
  for(const locale of ['de','fr','es','ar','en']){await language(locale);await settle();await nav(locale,'about/');await verify('five-language follow-up '+locale,true);await nav(locale,'');}
  await language('ar');await page.waitForTimeout(65);await nav('ar','contact/');await verify('page interrupts language entrance');
  await page.goBack();await settle();await verify('Back to localized home',true);await page.goBack();await settle();await verify('Back changes locale',true);await nav('en','projects/');await verify('page after locale Back');
  await page.locator('.language-trigger').click();await page.locator('[role=menuitemradio][lang=ar]').click();await page.waitForURL('**/ar/projects/');await page.waitForTimeout(65);await page.emulateMedia({reducedMotion:'reduce'});await settle();await nav('ar','about/');await verify('live reduced motion and page',true);
  if(errors.length)throw Error(JSON.stringify(errors));return {passed:true,groups:results.length,minimumHeader:Math.min(...results.map(x=>x.header)),minimumFooter:Math.min(...results.map(x=>x.footer)),errors};
 }finally{page.off('pageerror',onError);await page.emulateMedia({reducedMotion:'no-preference'});}
}
