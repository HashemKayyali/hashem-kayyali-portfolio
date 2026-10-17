const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const fs = require('node:fs');
const phase = process.argv[2] || 'after';
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
fs.mkdirSync('output/journey', { recursive: true });
(async () => {
 const browser = await chromium.launch({ channel: 'msedge', headless: true });
 try {
  for (const locale of ['en', 'ar']) {
   for (const [device, width] of [['desktop', 1440], ['mobile', 390]]) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
    await page.goto(base + (locale === 'en' ? '/' : '/' + locale + '/'), { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.evaluate(() => Promise.all([...document.querySelectorAll('.resume-layout__main img')].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}); })));
    const bounds = await page.locator('.resume-layout__main').boundingBox();
    await page.screenshot({ path: `output/journey/${phase}-${locale}-${device}.png`, fullPage: true, clip: bounds });
    console.log(`${phase} ${locale} ${device}: ${Math.round(bounds.width)}x${Math.round(bounds.height)}`);
    await page.close();
   }
  }
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
