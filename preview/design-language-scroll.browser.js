async(page)=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:4176/preview/en/projects/bike-tower/');
 await page.waitForTimeout(1300);
 await page.evaluate(()=>scrollTo(0,1600));await page.waitForTimeout(200);
 const before=await page.evaluate(()=>scrollY);
 await page.locator('.language-select select').selectOption('ar');
 await page.waitForTimeout(1500);
 const after=await page.evaluate(()=>scrollY);
 if(Math.abs(after-before)>2)throw Error(`Language switch moved scroll from ${before} to ${after}`);
 const focused=await page.evaluate(()=>!!document.activeElement.closest('.language-select'));
 if(!focused)throw Error('Language selection did not retain focus');
 return {before,after,focused,direction:await page.evaluate(()=>document.documentElement.dir)};
}
