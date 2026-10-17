async page=>{
 const base='http://127.0.0.1:4176/preview/';
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'en/contact/');await page.locator('.desk-form').waitFor();await page.waitForTimeout(650);
 const state=()=>page.evaluate(()=>({url:location.pathname,header:getComputedStyle(document.querySelector('.header-layout')).opacity,footer:getComputedStyle(document.querySelector('.compact-footer')).opacity,stage:getComputedStyle(document.querySelector('.route-stage')).opacity,headerStyle:document.querySelector('.header-layout').getAttribute('style')}));
 const initial=await state();await page.locator('.language-trigger').click();await page.locator('[role=menuitemradio][lang=ar]').click();await page.waitForURL('**/ar/contact/');await page.waitForTimeout(650);const language=await state();
 await page.locator('#primary-navigation a[href="/preview/ar/projects/"]').click();await page.waitForURL('**/ar/projects/');await page.waitForTimeout(750);const nextPage=await state();
 return {passed:[initial,language,nextPage].every(s=>s.header==='1'&&s.footer==='1'&&s.stage==='1'),initial,language,nextPage};
}
