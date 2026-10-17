/** Optional authoring tool: Playwright + installed Edge. Never part of a build.
 * PLAYWRIGHT_PACKAGE may point at a bundled Playwright module on the host.
 * Run against the Vite dev server: node scripts/capture-brand-assets.mjs URL
 */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`${process.argv[2] || 'http://127.0.0.1:3000'}/seo/brand-assets.html`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#og').screenshot({ path: resolve('public/og-image.png'), type: 'png' });
  console.log('Captured public/og-image.png (1200x630) from the current brand source.');
} finally { await browser.close(); }
