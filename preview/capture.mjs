import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/hashe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output = new URL('../output/playwright/light-burgundy/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
for (const [name, width, height, locale] of [['desktop',1440,1050,'en'],['mobile',390,844,'en'],['arabic-desktop',1440,1050,'ar'],['arabic-mobile',390,844,'ar']]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:4176/preview/?lang=${locale}`);
  await page.locator('.hero h1').waitFor();
  await page.evaluate(async () => { await document.fonts.ready; document.querySelectorAll('img').forEach(img => img.loading = 'eager'); await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
  await page.screenshot({path: new URL(`${name}-hero.png`, output).pathname.replace(/^\//,''), fullPage: false});
  await page.screenshot({path: new URL(`${name}-full.png`, output).pathname.replace(/^\//,''), fullPage: true});
  for (const section of ['projects','about','resume','contact']) {
    const box = await page.locator(`#${section}`).boundingBox();
    await page.screenshot({path: new URL(`${name}-${section}.png`, output).pathname.replace(/^\//,''), fullPage:true, clip:{x:0,y:box.y,width,height:box.height}});
  }
  await page.goto(`http://127.0.0.1:4176/preview/?lang=${locale}&project=eventies`);
  await page.locator('.case-intro h1').waitFor();
  await page.evaluate(async () => { await document.fonts.ready; document.querySelectorAll('img').forEach(img => img.loading = 'eager'); await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
  await page.screenshot({path: new URL(`${name}-case.png`, output).pathname.replace(/^\//,''), fullPage: false});
  await page.screenshot({path: new URL(`${name}-case-full.png`, output).pathname.replace(/^\//,''), fullPage: true});
  const caseBody = await page.locator('.case-body').boundingBox();
  await page.screenshot({path: new URL(`${name}-case-body.png`, output).pathname.replace(/^\//,''), fullPage:true, clip:{x:0,y:caseBody.y,width,height:caseBody.height}});
  await page.close();
}
await writeFile(new URL('capture-errors.json', output),JSON.stringify(errors,null,2));
await browser.close();
console.log(JSON.stringify({errors,output:output.href}));
