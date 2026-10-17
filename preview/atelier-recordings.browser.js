async(page)=>{
 const browser=page.context().browser(),rows=[];
 for(const [width,height,locale]of [[1366,768,'en'],[390,844,'ar']]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,recordVideo:{dir:'output/playwright/atelier/videos',size:{width,height}}});const errors=[];
  try{
   const view=await context.newPage(),video=view.video();view.on('pageerror',e=>errors.push(e.message));await view.bringToFront();await view.goto('http://127.0.0.1:4176/preview/'+locale+'/');await view.waitForFunction(()=>document.querySelector('[data-home-intro]')?.dataset.intro==='complete');await view.waitForTimeout(650);
   for(let i=1;i<=28;i++){await view.evaluate(y=>scrollTo({top:y,behavior:'instant'}),i*80);await view.waitForTimeout(130);}await view.waitForTimeout(750);
   const navigate=async(route)=>{await view.evaluate(()=>scrollTo(0,0));if(width<801)await view.locator('.navigation-toggle').click();await view.locator('#primary-navigation a[href$="/'+locale+'/'+route+'/"]').click();await view.waitForURL('**/'+locale+'/'+route+'/');await view.locator('main h1').waitFor();await view.waitForTimeout(1000);};
   await navigate('about');await view.locator('.atelier-profile-portrait img').evaluate(e=>e.decode());await view.waitForTimeout(800);await view.locator('.profile-chapter').first().scrollIntoViewIfNeeded();await view.waitForTimeout(800);
   await navigate('experience');await view.locator('.profile-role-details summary').first().click();await view.waitForTimeout(750);
   await navigate('skills');await view.locator('.skill-category-nav a').nth(3).click();await view.waitForTimeout(900);
   await navigate('projects');await view.locator('[data-gallery-filter="webPlatform"]').click();await view.waitForTimeout(950);await view.locator('[data-gallery-project="eventies"]').first().click();await view.waitForURL('**/projects/eventies/');await view.waitForTimeout(1000);await view.locator('#case-purpose').scrollIntoViewIfNeeded();await view.waitForTimeout(850);
   await navigate('contact');await view.locator('#contact-name').fill('UI review');await view.locator('#contact-email').fill('review@example.com');await view.locator('#contact-message').fill('Local portfolio review draft.');await view.locator('.contact-form button').click();await view.waitForTimeout(1000);
   const path='output/playwright/atelier/videos/atelier-tour-'+locale+'-'+width+'.webm';await context.close();await video.saveAs(path);rows.push({width,height,locale,path,errors});
  }catch(error){await context.close();throw error;}
 }return rows;
}
