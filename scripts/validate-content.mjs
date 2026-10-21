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

/* -- 3. All 11 projects exist in every locale ------------------------------ */
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

  if (missing.length === 0 && PROJECT_IDS.length === 11 && idsAligned) {
    pass('all 11 project slugs exist in every locale', 'assets and content ids aligned');
  } else {
    fail(
      'all 11 project slugs exist in every locale',
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
  'dist-ssr',
  'output',
  'tests',
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

   The public canonical source is required, including on a clean checkout. */
{
  const localeFiles = LOCALES.map((locale) => resolve(ROOT, `content/locales/${locale}.ts`));
  const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

  if (!existsSync(resolve(ROOT, 'content/master.json'))) {
    fail('generated dictionaries match the source', 'public canonical source is missing');
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

/* -- 11. Approved professional record survives every locale ---------------- */
{
  const problems = [];
  const ids = ['eventies', 'independent', 'terminal', 'umniah'];
  const graduated = { en: 'Graduated', ar: 'متخرج', de: 'Abgeschlossen', fr: 'Diplômé', es: 'Graduado' };
  for (const locale of LOCALES) {
    const d = dictionaries[locale];
    const sections = d.about.sections;
    if (sections.length !== 4 || sections.map(s => s.paragraphs.length).join() !== '1,1,1,3') {
      problems.push(`${locale}: About must preserve six paragraphs in four groups`);
    }
    if (d.about.story1 !== sections[0]?.paragraphs[0] || d.about.story2 !== sections[1]?.paragraphs[0]) {
      problems.push(`${locale}: legacy About fields diverged from sections`);
    }
    const experience = d.resume.experience;
    if (experience.map(e => e.id).join() !== ids.join()) problems.push(`${locale}: experience ids/order`);
    for (const entry of experience) {
      if (!entry.company || !entry.period || !entry.location) problems.push(`${locale}/${entry.id}: metadata`);
      if (entry.id !== 'terminal' && (!entry.role || !entry.employment || !entry.mode || !entry.points.length)) {
        problems.push(`${locale}/${entry.id}: role metadata or description`);
      }
    }
    const terminal = experience.find(e => e.id === 'terminal');
    if (terminal?.roles?.length !== 3 || new Set(terminal.roles.map(r => r.title)).size !== 3) {
      problems.push(`${locale}: three distinct Terminal roles required`);
    } else {
      for (const role of terminal.roles) {
        if (!role.title || !role.period || !role.employment || !role.mode || !role.points?.length) {
          problems.push(`${locale}: incomplete Terminal role`);
        }
      }
    }
    const education = d.resume.education;
    if (!education.university || !education.period || education.status !== graduated[locale]) {
      problems.push(`${locale}: university, dates and graduated status`);
    }
    if (d.identity.role !== d.resume.profileHeadline || d.identity.role !== d.footer.role) {
      problems.push(`${locale}: primary professional identities diverged`);
    }
    const financial = d.projects['financial-operations'];
    if (!financial?.mediaCaption || !financial?.narrativeLabels || financial.technology.some(term => /playwright/i.test(term))) {
      problems.push(`${locale}: financial project public content`);
    }
    if (new Set(Object.values(d.projects).map(p => p.overview)).size !== 11) {
      problems.push(`${locale}: project stories must be distinct`);
    }
  }
  const en = dictionaries.en;
  const canonicalHeadline = 'R&D Product Engineer | Software Engineer | Embedded Systems, IoT & Hardware–Software Integration';
  if (en.identity.role !== canonicalHeadline) problems.push('en: approved professional headline');
  const experience = en.resume.experience;
  if (experience[0].period !== 'January 2026 – Present' || experience[0].role !== 'Technical Lead' || experience[0].employment !== 'Part-time' || experience[0].mode !== 'Remote') {
    problems.push('en: Eventies approved role and dates');
  }
  if (experience[1].period !== 'August 2025 – Present' || experience[1].employment !== 'Self-employed' || experience[1].mode !== 'On-site') {
    problems.push('en: independent approved dates and metadata');
  }
  const expectedRoles = [
    ['Technical Training Lead — Software & VR Content', 'July 2025 – Present', 'Freelance', 'Hybrid'],
    ['Technical Operations Engineer', 'February 2025 – July 2025', 'Full-time', 'Hybrid'],
    ['Sales', 'January 2025 – February 2025', 'Full-time', 'On-site'],
  ];
  const terminalRoles = experience.find(e => e.id === 'terminal')?.roles ?? [];
  if (terminalRoles.map(r => [r.title, r.period, r.employment, r.mode].join('|')).join('\n') !== expectedRoles.map(r => r.join('|')).join('\n')) {
    problems.push('en: Terminal progression must match approved record, newest first');
  }
  if (en.resume.education.university !== 'Amman Arab University' || en.resume.education.period !== 'October 2021 – September 2026' || en.resume.education.degree !== "Bachelor's Degree in Computer Software Engineering") {
    problems.push('en: approved education record');
  }
  const paragraphs = en.about.sections.flatMap(s => s.paragraphs).join('\n\n');
  const approvedAboutHash = 'e4bda046e3893f2419979de26caf41d4f969bc417cf28a3bbf27c492153f3ad0';
  if (createHash('sha256').update(paragraphs).digest('hex') !== approvedAboutHash) {
    problems.push('en: approved six About paragraphs changed');
  }
  if (problems.length) fail('approved About, experience, education and identities', problems.join(' | '));
  else pass('approved About, experience, education and identities', 'six paragraphs, four employers, three Terminal roles');
}

/* -- 12. Public canonical source, technologies and privacy ----------------- */
{
  const problems = [];
  const sourcePath = resolve(ROOT, 'content/master.json');
  if (existsSync(sourcePath)) {
    const master = JSON.parse(readFileSync(sourcePath, 'utf8'));
    for (const key of ['meta', 'voiceSummary', 'locales']) {
      if (key in master) problems.push(`authoring-only field ${key}`);
    }
    if ('metrics' in master.resume || 'colophon' in master.footer) problems.push('unused private authoring fields');
    if (master.projects.map(p => p.id).join() !== PROJECT_IDS.join()) problems.push('canonical project ids/order');
    const expectedTechnology = {
      eventies: ['Next.js', 'TypeScript', 'Supabase'],
      'glitzz-lab': ['Next.js', 'TypeScript', 'Supabase', 'Meta WhatsApp Integration'],
      'umniah-youthconnect': ['Flutter', 'Dart', 'Supabase'],
      'terminal-nfc': ['C#', 'WPF', 'Supabase', 'RFID', 'Motion Sensors'],
      'bike-tower': ['Flutter', 'Dart', 'ESP32-S3', 'Embedded C++', 'WebSockets', 'UDP', 'Custom PCB', 'LED Control'],
      'basket-beats': ['Flutter', 'Dart', 'Embedded C++', 'Sensors', 'WebSockets', 'UDP', 'Custom PCB'],
      'financial-operations': ['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'Recharts'],
      'outreach-automation': ['Next.js', 'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'SMTP/IMAP'],
      'traffic-flow-analytics': ['Python', 'PySide6', 'OpenCV', 'YOLOv8', 'BoT-SORT'],
    };
    for (const project of master.projects) {
      const required = expectedTechnology[project.id];
      if (required && required.join() !== project.technology.join()) problems.push(`${project.id}: approved technology`);
      if (/coin mode/i.test(JSON.stringify(project))) problems.push(`${project.id}: unverified Coin Mode`);
    }
    if (/photograph|compliance|accredit|certif/i.test(JSON.stringify(master.projects.find(p => p.id === 'financial-operations')))) {
      problems.push('financial project contains excluded business/compliance claims');
    }
    const identityText = JSON.stringify({ identity: master.identity, hero: master.hero, footer: master.footer, seo: master.seo, education: master.resume.education });
    if (/co-founder|cofounder|senior|architect|in progress|currently in|en cours|derzeit in Bearbeitung|لا تزال مستمرة/i.test(identityText)) {
      problems.push('outdated identity or education status');
    }
    const generator = readFileSync(resolve(ROOT, 'scripts/generate-locales.mjs'), 'utf8');
    if (!generator.includes("'content/master.json'") || generator.includes("const SOURCE = resolve(ROOT, 'Hashem_Portfolio")) {
      problems.push('generator must use public canonical source');
    }
  } else problems.push('public canonical content/master.json missing');
  if (problems.length) fail('public canonical source and approved technologies', problems.join(' | '));
  else pass('public canonical source and approved technologies', 'public fields only; no unverified operational features');
}

/* -- Report ---------------------------------------------------------------- */
const failures = results.filter((result) => !result.ok);
for (const result of results) {
  const mark = result.ok ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${result.name}${result.detail ? `  — ${result.detail}` : ''}`);
}
console.log(`\n${results.length - failures.length}/${results.length} checks passed`);

if (failures.length > 0) process.exit(1);
