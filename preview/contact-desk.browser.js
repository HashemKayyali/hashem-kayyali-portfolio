async page=>{
 const base='http://127.0.0.1:4176/preview/';await page.setViewportSize({width:1440,height:900});await page.goto(base+'en/contact/');await page.locator('.contact-form').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(900);
 const before=await page.locator('.contact-form-region').evaluate(e=>e.getBoundingClientRect().height);
 await page.locator('#contact-name').fill('Portfolio review');await page.locator('#contact-email').fill('review@example.test');await page.locator('#contact-message').fill('A technical conversation about this portfolio.');
 await page.locator('.language-trigger').click();await page.locator('[role=menuitemradio][lang=ar]').click();await page.waitForURL('**/ar/contact/');await page.waitForTimeout(600);
 const retained={name:await page.locator('#contact-name').inputValue(),email:await page.locator('#contact-email').inputValue(),message:await page.locator('#contact-message').inputValue()};
 const passed=before<600&&retained.name==='Portfolio review'&&retained.email==='review@example.test'&&retained.message.length>10;
 return {passed,height:before,retained};
}
