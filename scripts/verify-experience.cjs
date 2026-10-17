/** Optional Edge QA against a running preview; no production dependencies. */
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const results = [], errors = [], failedAssets = [];
fs.mkdirSync('output/journey', { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failedAssets.push(response.url()); });

    for (const locale of ['en', 'ar', 'de', 'fr', 'es']) {
      await page.goto(base + (locale === 'en' ? '/' : `/${locale}/`), { waitUntil: 'networkidle' });
      assert.equal(await page.getAttribute('html', 'dir'), locale === 'ar' ? 'rtl' : 'ltr');
      const terminal = page.locator('[data-company="terminal"]');
      assert.equal(await page.locator('.experience-company').count(), 4);
      assert.equal(await page.locator('.experience-role__title').count(), 6);
      assert.equal(await terminal.locator('img').count(), 1);
      assert.equal(await terminal.locator('.experience-role--grouped').count(), 3);
      assert.equal(await page.locator('.experience-timeline canvas').count(), 0);
      for (const role of await page.locator('.experience-role').all()) {
        for (const selector of ['.experience-role__title', '.experience-role__association', '.experience-role__period', '.experience-role__location', '.experience-role__description > p']) {
          assert.equal(await role.locator(selector).isVisible(), true);
          assert.notEqual((await role.locator(selector).innerText()).trim(), '');
        }
      }
      results.push({ name: `${locale}: four employers, six roles, visible facts and one Terminal logo`, ok: true });

      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 960 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        for (const title of await page.locator('.experience-role__title').all()) {
          assert.equal(await title.evaluate(element => element.scrollWidth <= element.clientWidth + 1), true);
        }
        const geometry = await terminal.evaluate(group => {
          const logo = group.querySelector('.experience-company__logo').getBoundingClientRect();
          const roles = [...group.querySelectorAll('.experience-role--grouped')];
          const rtl = getComputedStyle(group).direction === 'rtl';
          return roles.map(role => {
            const box = role.getBoundingClientRect();
            const node = getComputedStyle(role, '::before');
            const line = getComputedStyle(role, '::after');
            const title = role.querySelector('.experience-role__title').getBoundingClientRect();
            const nodeCenter = rtl ? box.right - parseFloat(node.right) - 3.5 : box.left + parseFloat(node.left) + 3.5;
            return { top: box.top, bottom: box.bottom, nodeCenter, logoCenter: (logo.left + logo.right) / 2, lineWidth: line.width, lineContent: line.content, titleLeft: title.left, titleRight: title.right, logoLeft: logo.left, logoRight: logo.right, rtl };
          });
        });
        for (let i = 0; i < 3; i++) {
          assert.ok(Math.abs(geometry[i].nodeCenter - geometry[i].logoCenter) <= 1);
          if (i < 2) {
            assert.ok(geometry[i].bottom < geometry[i + 1].top);
            assert.equal(geometry[i].lineWidth, '1px');
            assert.notEqual(geometry[i].lineContent, 'none');
          } else assert.equal(geometry[i].lineContent, 'none');
          assert.ok(geometry[i].rtl ? geometry[i].titleRight < geometry[i].logoLeft : geometry[i].titleLeft > geometry[i].logoRight);
        }
        results.push({ name: `${locale}: ${width}px wrapping and connected RTL-aware geometry`, ok: true });
      }

      const disclosure = page.locator('[data-company="eventies"] details');
      const summary = disclosure.locator('summary');
      assert.equal(await disclosure.getAttribute('open'), null);
      assert.equal(await disclosure.locator('.experience-role__additional').isVisible(), false);
      await summary.focus();
      await page.keyboard.press('Enter');
      assert.notEqual(await disclosure.getAttribute('open'), null);
      assert.equal(await disclosure.locator('.experience-role__additional').isVisible(), true);
      assert.ok(await summary.evaluate(element => element.getBoundingClientRect().height >= 44));
      assert.notEqual(await summary.evaluate(element => getComputedStyle(element).outlineStyle), 'none');
      await page.keyboard.press('Space');
      assert.equal(await disclosure.getAttribute('open'), null);
      results.push({ name: `${locale}: native disclosure keyboard toggle, focus and touch target`, ok: true });
    }

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.experience-role__title').first().evaluate(element => getComputedStyle(element).opacity), '1');
    assert.equal(await page.locator('.experience-role__title').first().evaluate(element => getComputedStyle(element).animationName), 'none');
    results.push({ name: 'Normal motion: career information visible without entrance animation', ok: true });
    for (const open of [true, false]) {
      await page.evaluate(open => document.querySelectorAll('.experience-role__details').forEach(details => { details.open = open; }), open);
      await page.waitForTimeout(200);
      await page.evaluate(() => {
        const stack = document.querySelector('.project-stack');
        const pinnedTop = parseFloat(getComputedStyle(stack.firstElementChild).top);
        window.scrollTo({ top: stack.getBoundingClientRect().top + scrollY - pinnedTop, behavior: 'instant' });
      });
      await page.waitForFunction(() => {
        const card = document.querySelector('.project-stack__inner');
        return new DOMMatrixReadOnly(getComputedStyle(card).transform).a >= 0.999;
      }, null, { timeout: 3000 });
    }
    results.push({ name: 'Opening/closing experience keeps project stack position and full pinned card scale', ok: true });
    assert.deepEqual(errors, []);
    assert.deepEqual(failedAssets, []);
    console.log(JSON.stringify({ results, errors, failedAssets }, null, 2));
    fs.writeFileSync('output/journey/functional.json', JSON.stringify({ results, errors, failedAssets }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
