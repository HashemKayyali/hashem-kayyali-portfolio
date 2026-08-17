/**
 * Content and localization validation.
 *
 *   node scripts/validate-content.mjs
 *
 * The repository has no test runner and this task is not a reason to introduce
 * one, so the guarantees that matter are checked here instead: that the five
 * dictionaries are complete and structurally identical, that every project and
 * every modal label survives translation, that direction is mapped correctly,
 * and that no retired copy has crept back into the production source.
 *
 * Exits non-zero on the first failing check so it can gate a build.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dictionaries } from '../content/index.ts';
import { LOCALES, PROJECT_IDS } from '../content/types.ts';
import { DEFAULT_LOCALE, directionOf, isLocale } from '../i18n/config.ts';
import { projectAssets } from '../data/projectAssets.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const results = [];
const fail = (name, detail) => results.push({ name, ok: false, detail });
const pass = (name, detail = '') => results.push({ name, ok: true, detail });

/* -- 1. Supported locale set ---------------------------------------------- */
{
  const expected = ['en', 'ar', 'de', 'fr', 'es'];
  const actual = [...LOCALES];
  const keys = Object.keys(dictionaries);
  if (actual.join() === expected.join() && keys.sort().join() === [...expected].sort().join()) {
    pass('locale set is exactly en/ar/de/fr/es');
  } else {
    fail('locale set is exactly en/ar/de/fr/es', `got ${actual.join()} / ${keys.join()}`);
  }
}

/* -- 2. Every dictionary matches the English schema ------------------------ */
{
  /** Structural signature: key names, nesting, and array lengths. */
  const shape = (node, path = '') => {
    if (Array.isArray(node)) {
      return `[${node.length}]{${node.map((item, i) => shape(item, `${path}[${i}]`)).join(',')}}`;
    }
    if (node !== null && typeof node === 'object') {
      return `{${Object.keys(node)
        .sort()
        .map((key) => `${key}:${shape(node[key], `${path}.${key}`)}`)
        .join(',')}}`;
    }
    return typeof node;
  };

  const reference = shape(dictionaries.en);
  const drifted = LOCALES.filter((locale) => shape(dictionaries[locale]) !== reference);
  if (drifted.length === 0) {
    pass('every locale matches the English schema', `${LOCALES.length} dictionaries`);
  } else {
    fail('every locale matches the English schema', `drifted: ${drifted.join(', ')}`);
  }
}

/* -- 2b. No empty or placeholder-shaped values ----------------------------- */
{
  const empties = [];
  const walk = (node, path) => {
    if (typeof node === 'string') {
      if (node.trim() === '') empties.push(path);
      return;
    }
    if (Array.isArray(node)) return node.forEach((item, i) => walk(item, `${path}[${i}]`));
    if (node !== null && typeof node === 'object') {
      return Object.entries(node).forEach(([key, value]) => walk(value, `${path}.${key}`));
    }
    if (node === undefined) empties.push(path);
  };
  LOCALES.forEach((locale) => walk(dictionaries[locale], locale));

  if (empties.length === 0) pass('no empty strings in any dictionary');
  else fail('no empty strings in any dictionary', empties.slice(0, 8).join(', '));
}

/* -- 3. All 10 projects exist in every locale ------------------------------ */
{
  const missing = [];
  LOCALES.forEach((locale) => {
    PROJECT_IDS.forEach((id) => {
      const project = dictionaries[locale].projects[id];
      if (!project) missing.push(`${locale}/${id}`);
      else if (!project.overview || !project.short || project.capabilities.length === 0) {
        missing.push(`${locale}/${id} (incomplete)`);
      }
    });
  });

  const assetIds = projectAssets.map((asset) => asset.id).sort();
  const contentIds = [...PROJECT_IDS].sort();
  const idsAligned = assetIds.join() === contentIds.join();

  if (missing.length === 0 && PROJECT_IDS.length === 10 && idsAligned) {
    pass('all 10 project slugs exist in every locale', 'assets and content ids aligned');
  } else {
    fail(
      'all 10 project slugs exist in every locale',
      missing.length ? missing.slice(0, 6).join(', ') : `asset/content id mismatch`,
    );
  }
}

/* -- 3b. Fields that are optional in the type but required in practice -------
   `role` and `responsibilities` are optional so the other entries need not
   carry them; that means a migration could drop them everywhere without any
   schema check noticing. These assert they survive. */
{
  const missing = [];
  LOCALES.forEach((locale) => {
    const dictionary = dictionaries[locale];
    if (!dictionary.projects.eventies.role) missing.push(`${locale}: eventies card role`);
    if (!dictionary.projects.eventies.contribution) missing.push(`${locale}: eventies contribution`);
    if (!dictionary.resume.profileHeadline) missing.push(`${locale}: profile headline`);
    if (!dictionary.actions.viewProject) missing.push(`${locale}: view-project CTA`);

    const eventies = dictionary.resume.experience[0];
    if (eventies.points.length === 0) missing.push(`${locale}: eventies journey points`);
    if (!eventies.responsibilities?.length) missing.push(`${locale}: eventies scope pills`);
  });

  if (missing.length === 0) {
    pass('role, contribution, headline and CTA present in every locale');
  } else {
    fail('role, contribution, headline and CTA present in every locale', missing.slice(0, 6).join(', '));
  }
}

/* -- 4. No missing Project Modal labels ------------------------------------ */
{
  const labelKeys = Object.keys(dictionaries.en.projectModal.labels);
  const a11yKeys = Object.keys(dictionaries.en.projectModal.a11y);
  /* Templates are only useful if their placeholders survived translation. */
  const required = {
    caseStudy: ['{title}'],
    imageViewer: ['{title}'],
    showImage: ['{index}', '{count}'],
    openImageFullScreen: ['{index}'],
    screenshot: ['{title}', '{index}'],
    screenshotOf: ['{title}', '{index}', '{count}'],
  };

  const problems = [];
  LOCALES.forEach((locale) => {
    const modal = dictionaries[locale].projectModal;
    labelKeys.forEach((key) => {
      if (!modal.labels[key]) problems.push(`${locale}.labels.${key}`);
    });
    a11yKeys.forEach((key) => {
      if (!modal.a11y[key]) problems.push(`${locale}.a11y.${key}`);
      (required[key] ?? []).forEach((token) => {
        if (!modal.a11y[key].includes(token)) {
          problems.push(`${locale}.a11y.${key} missing ${token}`);
        }
      });
    });
  });

  if (problems.length === 0) {
    pass('no missing modal labels', `${labelKeys.length} labels + ${a11yKeys.length} templates`);
  } else {
    fail('no missing modal labels', problems.slice(0, 6).join(', '));
  }
}

/* -- 5. Invalid saved locale falls back to English ------------------------- */
{
  const rejected = ['', 'xx', 'EN', 'en-US', null, undefined, 42, 'zh'];
  const wrong = rejected.filter((value) => isLocale(value));
  const accepts = LOCALES.every((locale) => isLocale(locale));
  if (wrong.length === 0 && accepts && DEFAULT_LOCALE === 'en') {
    pass('invalid saved locale falls back to English');
  } else {
    fail('invalid saved locale falls back to English', `wrongly accepted: ${wrong.join(', ')}`);
  }
}

/* -- 6. Arabic is RTL, everything else LTR --------------------------------- */
{
  const wrong = LOCALES.filter(
    (locale) => directionOf(locale) !== (locale === 'ar' ? 'rtl' : 'ltr'),
  );
  if (wrong.length === 0) pass('ar maps to rtl, all others to ltr');
  else fail('ar maps to rtl, all others to ltr', wrong.join(', '));
}

/* -- Source scan ----------------------------------------------------------- */
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.html']);

/**
 * `.worktrees` and `.claude` hold sibling git worktrees — other branches of
 * this same repository, checked out inside it. Their files are not this
 * branch's production source, and scanning them reports retired copy from
 * whatever those branches happen to contain. Only reachable when the validator
 * runs from the canonical repository root, which is exactly where it matters.
 */
const SKIP_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  '.git',
  '.worktrees',
  '.claude',
  'docs',
  'public',
  'scripts',
]);

const sourceFiles = [];
const collect = (directory) => {
  for (const entry of readdirSync(directory)) {
    if (SKIP_DIRECTORIES.has(entry)) continue;
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) collect(full);
    else if (SCAN_EXTENSIONS.has(extname(entry))) sourceFiles.push(full);
  }
};
collect(ROOT);

const scan = (patterns) => {
  const hits = [];
  for (const file of sourceFiles) {
    const text = readFileSync(file, 'utf8');
    for (const pattern of patterns) {
      if (text.toLowerCase().includes(pattern.toLowerCase())) {
        hits.push(`${relative(ROOT, file)}: ${pattern}`);
      }
    }
  }
  return hits;
};

/* -- 7. Retired job-seeking copy ------------------------------------------- */
{
  const forbidden = [
    'Open to software engineering and R&D opportunities',
    'Target roles',
    'Recruiter-focused',
    'ATS-friendly',
    "Let's Work Together",
    'I am interested in',
    'Have a role or product challenge in mind',
    'Arabic and English experience',
    'Bilingual booking experience',
    'freelanceStatus',
  ];
  const hits = scan(forbidden);
  if (hits.length === 0) pass('no job-seeking copy in production source', `${forbidden.length} patterns`);
  else fail('no job-seeking copy in production source', hits.join(' | '));
}

/* -- 8. Component-level hardware detail ------------------------------------
   ESP32 and "microcontrollers" are approved engineering vocabulary and are not
   listed here; what must not be public is part-level detail. */
{
  const forbidden = ['MPU6050', 'Hall Sensor', 'Hall-effect', 'Hall Effect', 'MOSFET', 'FastLED'];
  const hits = scan(forbidden);
  if (hits.length === 0) pass('no component-level hardware names in source', `${forbidden.length} patterns`);
  else fail('no component-level hardware names in source', hits.join(' | '));
}

/* -- 9. The generator holds no copy ----------------------------------------
   Approved wording must live in the content source, not in the transform. A
   second place to look for a string is how two versions of it start to exist. */
{
  const generator = readFileSync(resolve(ROOT, 'scripts/generate-locales.mjs'), 'utf8');
  const smuggled = [
    'Engineering ownership from product architecture',
    'Full ownership of Eventies',
    'Co-Founder & R&D Product Engineer',
    'View project',
    'PROFILE_HEADLINE',
    'EVENTIES_CONTRIBUTION',
    'EVENTIES_JOURNEY',
  ].filter((phrase) => generator.includes(phrase));

  /* Any long quoted literal is a smell: the generator's own strings are paths,
     keys and file-header boilerplate, all short. */
  const longLiterals = (generator.match(/'[^'\n]{60,}'/g) ?? []).filter(
    (literal) => !literal.includes('Hashem_Portfolio_Content_Master'),
  );

  if (smuggled.length === 0 && longLiterals.length === 0) {
    pass('generator contains no approved copy', 'transform only');
  } else {
    fail(
      'generator contains no approved copy',
      [...smuggled, ...longLiterals.map((l) => l.slice(0, 40) + '…')].join(' | '),
    );
  }
}

/* -- 10. Generated dictionaries match the source ----------------------------
   Re-runs the generator and checks the files it writes are byte-identical to
   the ones checked in. That proves two things at once: generation is
   deterministic, and nobody has hand-edited a dictionary out of sync with the
   content source. Writing identical bytes makes this a no-op on disk.

   Skipped rather than failed when the source is absent: it is deliberately
   gitignored, so a clean checkout cannot run this check. */
{
  const localeFiles = LOCALES.map((locale) => resolve(ROOT, `content/locales/${locale}.ts`));
  const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

  if (!existsSync(resolve(ROOT, 'Hashem_Portfolio_Content_Master_v3_5LANG.json'))) {
    pass('generated dictionaries match the source', 'skipped — authoring JSON not present');
  } else {
    const before = localeFiles.map(hash);
    execFileSync(process.execPath, [resolve(ROOT, 'scripts/generate-locales.mjs')], {
      cwd: ROOT,
      stdio: 'ignore',
    });
    const after = localeFiles.map(hash);
    const drifted = LOCALES.filter((_, index) => before[index] !== after[index]);

    if (drifted.length === 0) {
      pass('generated dictionaries match the source', 'regeneration is a no-op');
    } else {
      fail('generated dictionaries match the source', `regenerating changed: ${drifted.join(', ')}`);
    }
  }
}

/* -- Report ---------------------------------------------------------------- */
const failures = results.filter((result) => !result.ok);
for (const result of results) {
  const mark = result.ok ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${result.name}${result.detail ? `  — ${result.detail}` : ''}`);
}
console.log(`\n${results.length - failures.length}/${results.length} checks passed`);

if (failures.length > 0) process.exit(1);
