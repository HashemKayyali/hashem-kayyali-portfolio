async page=>{
 await page.bringToFront();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:5176/preview/en/');
 await page.locator('.skill-toolbelt').scrollIntoViewIfNeeded();
 await page.locator('.skill-toolbelt').hover();
 await page.waitForTimeout(300);
 const state=await page.evaluate(()=>({buttons:document.querySelectorAll('.skill-toolbelt button').length,playing:document.querySelector('.skill-toolbelt').dataset.playing,images:document.querySelectorAll('[data-toolbelt-skill] img').length,inline:document.querySelectorAll('[data-toolbelt-skill] svg').length,count:document.querySelectorAll('[data-toolbelt-skill]').length}));
 if(state.buttons||state.playing!=='true'||state.images!==45||state.inline||state.count!==45)throw Error('Continuous image rail: '+JSON.stringify(state));
 return {passed:true,state};
}
