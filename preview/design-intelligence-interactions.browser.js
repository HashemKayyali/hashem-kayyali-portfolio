async(page)=>{
 const out='C:/Users/hashe/Desktop/site-v2-light-burgundy/output/playwright/design-intelligence',rows=[],failures=[];
 const check=(ok,label)=>{if(!ok)failures.push(label);};
 const context=await page.context().browser().newContext({viewport:{width:390,height:844},recordVideo:{dir:out+'/raw',size:{width:390,height:844}}});
 const p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:4176/preview/en/');await p.waitForTimeout(2300);
 await p.locator('.navigation-toggle').click();await p.screenshot({path:out+'/after-mobile-navigation-open.png'});
 check(await p.locator('.navigation-toggle').getAttribute('aria-expanded')==='true','Menu did not open');
 await p.keyboard.press('Escape');check(await p.locator('.navigation-toggle').getAttribute('aria-expanded')==='false','Escape did not dismiss');
 check(await p.locator('.navigation-toggle').evaluate(x=>x===document.activeElement),'Escape focus not returned');
 await p.keyboard.press('Enter');await p.keyboard.press('Tab');check(await p.evaluate(()=>!!document.activeElement.closest('#primary-navigation')),'Keyboard opening did not lead to navigation links');await p.keyboard.press('Escape');
 await p.locator('.navigation-toggle').click();await p.locator('.hero h1').click();check(await p.locator('.navigation-toggle').getAttribute('aria-expanded')==='false','Outside pointer did not dismiss');
 await p.locator('.navigation-toggle').click();await p.locator('.site-header nav a[href$="/projects/"]').click();await p.waitForURL('**/projects/');await p.waitForTimeout(1000);
 check(await p.locator('[data-gallery-project]').count()===11,'Gallery lost projects');
 for(const locale of ['ar','de','fr','es','en']){
  await p.locator('.language-select select').focus();await p.locator('.language-select select').selectOption(locale);await p.waitForURL('**/'+locale+'/projects/');await p.waitForTimeout(700);
  const row=await p.evaluate(()=>({locale:document.documentElement.lang,dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth-innerWidth,focused:!!document.activeElement.closest('.language-select')}));rows.push(row);
  check(row.overflow<=0,locale+' gallery overflow');check(row.focused,locale+' lost select focus');check(row.dir===(locale==='ar'?'rtl':'ltr'),locale+' direction');
 }
 await p.locator('.gallery-project-link[data-gallery-project="bike-tower"]').click();await p.waitForURL('**/bike-tower/');await p.waitForTimeout(1000);
 await p.evaluate(()=>scrollTo(0,1600));await p.waitForTimeout(100);const before=await p.evaluate(()=>scrollY);
 await p.locator('.language-select select').selectOption('ar');await p.waitForTimeout(1200);const after=await p.evaluate(()=>scrollY);check(Math.abs(after-before)<=2,'Case language scroll shifted');
 check(await p.locator('.language-select select').evaluate(x=>x===document.activeElement),'Case select lost focus');
 await p.screenshot({path:out+'/after-ar-mobile-case-reading.png'});
 const video=p.video();await p.close();await video.saveAs(out+'/after-navigation-languages-mobile.webm');await context.close();

 const motion=await page.context().browser().newContext({viewport:{width:1440,height:1000}}),m=await motion.newPage();
 await m.goto('http://127.0.0.1:4176/preview/en/');await m.waitForTimeout(2700);
 const frame=()=>m.locator('.home-silk canvas').first().getAttribute('data-frame');
 const start=Number(await frame());await m.waitForTimeout(500);check(Number(await frame())>start,'Smoke not advancing');
 check(m.workers().length===1,'Expected one shared Worker');
 await m.evaluate(()=>window.dispatchEvent(new CustomEvent('portfolio-motion-pause',{detail:true})));await m.waitForTimeout(200);const paused=await frame();await m.waitForTimeout(400);check(await frame()===paused,'Paused smoke repainted');
 await m.evaluate(()=>window.dispatchEvent(new CustomEvent('portfolio-motion-pause',{detail:false})));await m.waitForTimeout(400);check(await frame()!==paused,'Smoke did not resume');
 await m.setViewportSize({width:390,height:844});await m.waitForTimeout(400);check(await m.locator('.home-silk canvas').first().evaluate(c=>c.width===320&&c.height===240),'Worker did not resize at breakpoint');
 await m.setViewportSize({width:1440,height:1000});await m.waitForTimeout(400);
 await m.evaluate(()=>scrollTo(0,3200));await m.waitForTimeout(400);const offscreen=await frame();await m.waitForTimeout(400);check(await frame()===offscreen,'Offscreen Hero smoke repainted');
 await m.locator('.site-header nav a[href$="/about/"]').click();await m.waitForURL('**/about/');await m.waitForTimeout(700);check(m.workers().length===0,'Worker leaked on About');
 await m.goto('http://127.0.0.1:4176/preview/en/');await m.waitForTimeout(2300);await m.emulateMedia({reducedMotion:'reduce'});await m.waitForTimeout(400);check(m.workers().length===0,'Worker survived reduced motion');
 check(await m.locator('.portrait-reveal').evaluate(x=>getComputedStyle(x).clipPath)==='none','Reduced portrait still masked');
 await m.screenshot({path:out+'/after-reduced-motion-desktop.png'});await motion.close();
 check(!errors.length,'Browser errors: '+errors.join(', '));return {rows,caseScroll:{before,after},failures,errors};
}
