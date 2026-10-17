const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const fs = require('node:fs');
fs.mkdirSync('output/playwright', { recursive: true });
const assert = require('node:assert/strict');
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const focusOnly = process.argv.includes('--focus-only');
const results = [], errors = [];
let browser;
async function check(name, action) { try { await action(); results.push({name,ok:true}); console.log('PASS',name); } catch (e) { results.push({name,ok:false,error:e.message}); console.log('FAIL',name,e.message); } }
(async () => {
  browser = await chromium.launch({channel:'msedge',headless:true});
  const context = await browser.newContext({viewport:{width:1366,height:900}, reducedMotion:'reduce'});
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base, {waitUntil:'networkidle'});
  if (focusOnly) {
    await page.locator('.project-card__button').first().click({force:true});
    await page.locator('.project-detail').waitFor();
    await check('modal moves focus inside and contains keyboard navigation', async()=>{
      assert.equal(await page.evaluate(()=>document.activeElement.closest('.project-detail')!==null),true);
      for(let i=0;i<25;i++){ await page.keyboard.press('Tab'); assert.equal(await page.evaluate(()=>document.activeElement.closest('.project-detail')!==null),true); }
    });
  } else {
    for (const locale of ['en','ar','de','fr','es']) {
      await page.goto(base+(locale==='en'?'/':`/${locale}/`),{waitUntil:'networkidle'});
      await check(`${locale}: localized identity, About, journey and education`,async()=>{
        assert.equal(await page.locator('.project-card').count(),11);
        assert.equal(await page.locator('.about__reading-group').count(),4);
        assert.equal(await page.locator('.about__reading-group p').count(),6);
        assert.equal(await page.locator('.experience-company').count(),4);
        assert.equal(await page.locator('.experience-role--grouped').count(),3);
        assert.equal(await page.getAttribute('html','dir'),locale==='ar'?'rtl':'ltr');
        assert.match(await page.locator('#resume').innerText(),/2021/);
        assert.match(await page.locator('#resume').innerText(),/2026/);
        assert.doesNotMatch(await page.locator('.hero__role').innerText(),/Co-Founder|Senior/);
      });
      for(const width of [390,768,1366]) {
        await page.setViewportSize({width,height:900});
        await check(`${locale}: width ${width} no overflow`,async()=>{
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
          for (const title of await page.locator('.project-card__title').all()) assert.equal(await title.evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
        });
      }
      await page.setViewportSize({width:1366,height:900});
      const filters = page.locator('.portfolio-filter');
      const expected = [11,2,3,4,1,1];
      await check(`${locale}: all category filters`,async()=>{
        for (let i=0;i<expected.length;i++){await filters.nth(i).click({force:true}); await page.waitForFunction(n=>document.querySelectorAll('.project-card').length===n,expected[i]); assert.equal(await page.locator('.project-index li').count(),expected[i]);}
        await filters.first().click({force:true});
      });
      await page.locator('.project-index summary').click();
      await check(`${locale}: eleven project details, focus and scroll restoration`,async()=>{
        const index = page.locator('.project-index button');
        for(let i=0;i<11;i++) {
          await index.nth(i).click();
          await page.locator('.project-detail').waitFor();
          assert.notEqual(await page.locator('.case-study__lede').innerText(),'');
          assert.equal(await page.locator('.project-detail__title').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
          assert.equal(await page.evaluate(()=>document.activeElement.closest('.project-detail')!==null),true);
          if (i===8) assert.equal(await page.locator('.project-detail__media-caption').count(),1);
          await page.keyboard.press('Escape'); await page.locator('.project-detail').waitFor({state:'detached'});
          assert.equal(await page.evaluate(()=>document.body.style.overflow!=='hidden'),true);
        }
      });
      if(locale==='en'||locale==='ar') {
        await check(`${locale}: gallery arrows, fullscreen and focus trap`,async()=>{
          await page.locator('.project-index button').first().click();
          await page.locator('.project-detail').waitFor();
          const image=page.locator('.project-stage__image');
          const first=await image.getAttribute('src');
          await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');
          await page.waitForFunction(old=>document.querySelector('.project-stage__image')?.getAttribute('src')!==old,first);
          await page.locator('.project-stage__trigger').click(); await page.locator('.project-viewer').waitFor();
          for(let i=0;i<22;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.closest('.project-viewer')!==null),true);}
          await page.keyboard.press('Escape');await page.locator('.project-viewer').waitFor({state:'detached'});
          await page.keyboard.press('Escape');await page.locator('.project-detail').waitFor({state:'detached'});
        });
      }
      await page.goto(base+(locale==='en'?'/':`/${locale}/`));
      await page.setViewportSize({width:390,height:844});
      await page.screenshot({path:`output/playwright/modernization-${locale}-mobile.jpg`,type:'jpeg',quality:90});
      await page.setViewportSize({width:1366,height:900});
      await page.screenshot({path:`output/playwright/modernization-${locale}-desktop.jpg`,type:'jpeg',quality:90});
    }
    await check('resume PDF/DOCX served successfully',async()=>{
      for(const path of ['/resume/hashem-kayyali-resume.pdf','/resume/hashem-kayyali-resume.docx']) assert.equal((await context.request.get(base+path)).status(),200);
    });
    await check('no browser runtime errors',async()=>assert.deepEqual(errors,[]));
  }
  await browser.close();
  fs.mkdirSync('output/playwright',{recursive:true});
  fs.writeFileSync(`output/playwright/${focusOnly?'baseline-focus':'modernization-functional'}.json`,JSON.stringify({results,errors},null,2));
  if(results.some(r=>!r.ok)) process.exitCode=1;
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1});
