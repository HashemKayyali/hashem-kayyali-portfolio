// Optional Edge browser QA; set PLAYWRIGHT_PACKAGE to an external Playwright install.
require('node:fs').mkdirSync('output/playwright', { recursive: true });
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const fs = require('node:fs');
fs.mkdirSync('output/playwright', { recursive: true });
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage(); const errors=[],bad=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push({url:r.url(),status:r.status()});});
 try{
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
  for(const locale of ['ar','de','fr','es','en']){
   await page.locator('.mobile-nav .lang-select__trigger').click();
   await page.locator(`.mobile-nav .lang-select__option[lang="${locale}"]`).click();
   await page.waitForFunction(l=>document.documentElement.lang===l,locale);
   assert.equal(await page.locator('.project-card').count(),11);
   assert.equal(await page.getAttribute('html','dir'),locale==='ar'?'rtl':'ltr');
  }
  await page.goBack(); await page.waitForFunction(()=>document.documentElement.lang==='es');
  await page.goForward();await page.waitForFunction(()=>document.documentElement.lang==='en');
  checks.push('Five UI language switches and history Back/Forward keep correct complete locale');
  await page.locator('.mobile-nav__menu').click(); await page.locator('.mobile-drawer').waitFor();
  await page.locator('.mobile-drawer .nav-row').nth(1).click();
  await page.locator('.mobile-drawer').waitFor({state:'detached'});
  await page.locator('#about').screenshot({path:'output/playwright/modernization-about-mobile.jpg',type:'jpeg',quality:88});
  checks.push('Mobile navigation opens, reaches About and closes');
  await page.locator('#resume').screenshot({path:'output/playwright/modernization-journey-mobile.jpg',type:'jpeg',quality:88});
  await page.locator('.project-index summary').click();
  await page.locator('.project-index').screenshot({path:'output/playwright/modernization-index-mobile.jpg',type:'jpeg',quality:88});
  await page.locator('.project-index button').nth(8).click(); await page.locator('.project-detail').waitFor();
  await page.screenshot({path:'output/playwright/modernization-financial-mobile.jpg',type:'jpeg',quality:90});
  assert.equal(await page.locator('.project-detail').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
  await page.keyboard.press('Escape'); await page.locator('.project-detail').waitFor({state:'detached'});
  assert.equal(await page.evaluate(()=>document.activeElement.closest('.project-index')!==null),true);
  checks.push('Mobile financial details have no overflow and return focus to index');
  await page.setViewportSize({width:1366,height:900});
  await page.locator('#about').screenshot({path:'output/playwright/modernization-about-desktop.jpg',type:'jpeg',quality:88});
  await page.locator('#resume').screenshot({path:'output/playwright/modernization-journey-desktop.jpg',type:'jpeg',quality:88});
  await page.goto('http://127.0.0.1:4173/de/',{waitUntil:'networkidle'});
  await page.setViewportSize({width:390,height:844});
  await page.locator('.project-index summary').click(); await page.locator('.project-index button').nth(8).click();
  await page.locator('.project-detail').waitFor();
  await page.screenshot({path:'output/playwright/modernization-financial-de-mobile.jpg',type:'jpeg',quality:90});
  await page.keyboard.press('Escape');
  const normal=await context.newPage();await normal.emulateMedia({reducedMotion:'no-preference'});
  await normal.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
  await normal.locator('.mobile-nav__menu').click();await normal.locator('.mobile-drawer .nav-row').nth(3).click();
  await normal.locator('.mobile-drawer').waitFor({state:'detached'});
  await normal.waitForFunction(()=>{const r=document.querySelector('#portfolio').getBoundingClientRect();return r.top<150&&r.bottom>0;});
  await normal.mouse.wheel(0,650);await normal.waitForTimeout(500);
  assert.equal(await normal.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  checks.push('Normal-motion mobile section navigation and scrolling work');
  assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);checks.push('No runtime errors or failed media/asset HTTP responses during tested flow');
  fs.writeFileSync('output/playwright/modernization-navigation.json',JSON.stringify({checks,errors,bad},null,2));
  console.log(JSON.stringify({checks,errors,bad},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
