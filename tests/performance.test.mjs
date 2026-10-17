import test from 'node:test';
import assert from 'node:assert/strict';
import { cachedDictionary, createLocaleRequest, loadDictionary } from '../i18n/dictionary-loader.ts';
import { publishSharedWarpFrame, setRampRenderer, setSharedWarpSource, subscribeToSharedWarp } from '../components/ui/burgundy-warp-runtime.ts';

test('initial locale loading deduplicates requests and caches its complete dictionary', async () => {
  const first = loadDictionary('es');
  const second = loadDictionary('es');
  assert.equal(first, second);
  const dictionary = await first;
  assert.equal(cachedDictionary('es'), dictionary);
  assert.equal(await loadDictionary('es'), dictionary);
  assert.equal(Object.keys(dictionary.projects).length, 11);
  assert.ok(dictionary.about.sections.length === 4);
});

test('rapid language selection commits only the latest complete dictionary', async () => {
  const waiting = new Map();
  const request = createLocaleRequest((locale) => new Promise((resolve) => waiting.set(locale, resolve)));
  const committed = [];
  const german = request('de', (dictionary) => committed.push(dictionary));
  const arabic = request('ar', (dictionary) => committed.push(dictionary));
  waiting.get('ar')({ locale: 'ar', complete: true });
  assert.equal(await arabic, 'committed');
  waiting.get('de')({ locale: 'de', complete: true });
  assert.equal(await german, 'superseded');
  assert.deepEqual(committed, [{ locale: 'ar', complete: true }]);
});

test('a failed language request keeps the current page and can be retried', async () => {
  let attempts = 0;
  const request = createLocaleRequest(async () => {
    if (++attempts === 1) throw new Error('transient chunk failure');
    return { locale: 'fr', complete: true };
  });
  const committed = [];
  const original = console.error;
  console.error = () => {};
  try {
    assert.equal(await request('fr', (dictionary) => committed.push(dictionary)), 'failed');
    assert.deepEqual(committed, []);
    assert.equal(await request('fr', (dictionary) => committed.push(dictionary)), 'committed');
    assert.deepEqual(committed, [{ locale: 'fr', complete: true }]);
  } finally { console.error = original; }
});

test('warp delivery pauses hidden pages and unsubscribed surfaces, and repaints static frames', () => {
  const original = globalThis.document;
  globalThis.document = { visibilityState: 'visible' };
  const source = { width: 512, height: 384 };
  const ramp = ['#130105', '#25030b', '#4d0d1c', '#741b30', '#902a44'];
  let renders = 0;
  let first = 0;
  let second = 0;
  setSharedWarpSource(source);
  setRampRenderer(() => { renders++; return source; });
  const stopFirst = subscribeToSharedWarp(() => first++, ramp);
  const stopSecond = subscribeToSharedWarp(() => second++, ramp);
  try {
    publishSharedWarpFrame(1000);
    assert.equal(renders, 1, 'one render serves matching palettes');
    assert.equal(first, 1);
    assert.equal(second, 1);
    publishSharedWarpFrame(1010);
    assert.equal(renders, 1, '15fps throttles discarded frames before rendering');
    globalThis.document.visibilityState = 'hidden';
    publishSharedWarpFrame(2000, true);
    assert.equal(renders, 1);
    const stopHidden = subscribeToSharedWarp(() => assert.fail('hidden subscription must not paint'), ramp);
    stopHidden();
    globalThis.document.visibilityState = 'visible';
    publishSharedWarpFrame(2000, true);
    assert.equal(first, 2);
    publishSharedWarpFrame(2000, true);
    assert.equal(first, 3, 'resize repaints even when reduced-motion clock is unchanged');
    stopSecond();
    publishSharedWarpFrame(3000);
    assert.equal(second, 3, 'offscreen/unsubscribed surface no longer draws');
  } finally {
    stopFirst();
    stopSecond();
    setRampRenderer(null);
    setSharedWarpSource(null);
    if (original === undefined) delete globalThis.document;
    else globalThis.document = original;
  }
});
