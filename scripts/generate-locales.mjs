/**
 * Generates `content/locales/*.ts` from the approved content source.
 *
 *   node scripts/generate-locales.mjs
 *
 * The source JSON stores every string as a `{ en, ar, de, fr, es }` map. This
 * transposes it into one typed dictionary per locale, so components read a flat
 * localized object instead of resolving a language at every call site.
 *
 * The transform is mechanical on purpose: no string is rewritten, shortened, or
 * reworded here. Re-running it must reproduce the checked-in files byte for
 * byte, which is what makes the generated content auditable against the source.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = resolve(ROOT, 'Hashem_Portfolio_Content_Master_v3_5LANG.json');
const OUT_DIR = resolve(ROOT, 'content/locales');

const LOCALES = ['en', 'ar', 'de', 'fr', 'es'];

const source = JSON.parse(readFileSync(SOURCE, 'utf8'));

/** True for a `{ en, ar, de, fr, es }` translation map. */
const isTranslationMap = (node) =>
  node !== null &&
  typeof node === 'object' &&
  !Array.isArray(node) &&
  LOCALES.every((locale) => typeof node[locale] === 'string');

/** Resolves a translation map — or a tree of them — down to one locale. */
const pick = (node, locale) => {
  if (isTranslationMap(node)) return node[locale];
  if (Array.isArray(node)) return node.map((item) => pick(item, locale));
  if (node !== null && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, pick(value, locale)]),
    );
  }
  return node;
};

/** Ordered values of a named group, so components can map by index. */
const listOf = (group, locale) => Object.values(group).map((entry) => pick(entry, locale));

/**
 * Technology chips are stored as English tokens. Translate the ones the source
 * provides a term for; leave the rest, which are proper nouns (Next.js, FTMS).
 */
const technology = (tokens, locale) =>
  tokens.map((token) => source.technologyTerms[token]?.[locale] ?? token);

/**
 * The role title held at one employer, looked up by company name.
 *
 * Lets a project reference a role that is authored in the resume rather than
 * restating it: the string exists once, in one place, and feeds both the
 * journey entry and the project card.
 */
const roleOfCompany = (company) => {
  const entry = source.resume.experience.find((item) => item.company === company);
  if (!entry?.role) {
    throw new Error(`roleFromCompany: no experience entry with a role for "${company}"`);
  }
  return entry.role;
};

const buildProjects = (locale) =>
  Object.fromEntries(
    source.projects.map((project) => [
      project.id,
      {
        title: project.title,
        category: pick(project.category, locale),
        status: pick(project.status, locale),
        // A project may name the role held on it by pointing at the experience
        // entry that already carries that title, so the role is authored once
        // and the card and the journey cannot drift apart.
        ...(project.roleFromCompany
          ? { role: pick(roleOfCompany(project.roleFromCompany), locale) }
          : {}),
        short: pick(project.short, locale),
        overview: pick(project.overview, locale),
        purpose: pick(project.purpose, locale),
        contribution: pick(project.contribution, locale),
        engineering: pick(project.engineering, locale),
        capabilities: pick(project.capabilities, locale),
        considerations: pick(project.considerations, locale),
        technology: technology(project.technology, locale),
      },
    ]),
  );

const buildExperience = (locale) =>
  source.resume.experience.map((entry) => {
    const copy = {
      company: entry.company,
      // One employer holds a role progression instead of a single title, and
      // spans the combined period of those roles.
      period: pick(entry.period ?? entry.overallPeriod, locale),
      location: pick(entry.location, locale),
      points: pick(entry.points, locale),
    };

    // Present only on the entry that names the dimensions its role covers.
    if (entry.responsibilities) {
      copy.responsibilities = pick(entry.responsibilities, locale);
    }
    if (entry.role) copy.role = pick(entry.role, locale);
    if (entry.mode) copy.mode = pick(entry.mode, locale);
    if (entry.badge) copy.badge = pick(entry.badge, locale);
    if (entry.roles) {
      copy.roles = entry.roles.map((role) => ({
        title: pick(role.title, locale),
        period: pick(role.period, locale),
      }));
    }
    return copy;
  });

const buildDictionary = (locale) => ({
  identity: pick(source.identity, locale),
  hero: {
    headline: pick(source.hero.headline, locale),
    supporting: pick(source.hero.supporting, locale),
    actions: pick(source.hero.actions, locale),
    technicalMeta: pick(source.hero.technicalMeta, locale),
  },
  navigation: pick(source.navigation, locale),
  about: {
    title: pick(source.about.title, locale),
    subtitle: pick(source.about.subtitle, locale),
    story1: pick(source.about.story1, locale),
    story2: pick(source.about.story2, locale),
    engineeringFocusTitle: pick(source.about.engineeringFocusTitle, locale),
    engineeringFocus: listOf(source.about.engineeringFocus, locale),
    toolkitTitle: pick(source.about.toolkitTitle, locale),
    toolkitIntro: pick(source.about.toolkitIntro, locale),
    toolkitAria: pick(source.about.toolkitAria, locale),
    skillCategories: listOf(source.about.skillCategories, locale),
    skills: Object.values(source.about.skills).map((group) => pick(group, locale)),
    metadataLabels: pick(source.about.metadataLabels, locale),
    focusValue: pick(source.about.focusValue, locale),
  },
  resume: {
    title: pick(source.resume.title, locale),
    subtitle: pick(source.resume.subtitle, locale),
    profileEyebrow: pick(source.resume.profileEyebrow, locale),
    profileHeadline: pick(source.resume.profileHeadline, locale),
    profileSummary: pick(source.resume.profileSummary, locale),
    journeyTitle: pick(source.resume.journeyTitle, locale),
    journeySupport: pick(source.resume.journeySupport, locale),
    experience: buildExperience(locale),
    downloadCard: pick(source.resume.downloadCard, locale),
    education: pick(source.resume.education, locale),
    coreStrengths: {
      title: pick(source.resume.coreStrengths.title, locale),
      items: pick(source.resume.coreStrengths.items, locale),
    },
    metricLabels: pick(source.resume.metricLabels, locale),
  },
  projectsSection: {
    title: pick(source.projectsSection.title, locale),
    subtitle: pick(source.projectsSection.subtitle, locale),
    filters: pick(source.projectsSection.filters, locale),
  },
  projects: buildProjects(locale),
  projectModal: {
    labels: pick(source.projectModal.labels, locale),
    a11y: pick(source.projectModal.a11yTemplates, locale),
  },
  capabilities: {
    title: pick(source.capabilities.title, locale),
    subtitle: pick(source.capabilities.subtitle, locale),
    flow: pick(source.capabilities.flow, locale),
    items: source.capabilities.items.map((item) => ({
      number: item.number,
      title: pick(item.title, locale),
      description: pick(item.description, locale),
    })),
  },
  contact: pick(source.contact, locale),
  footer: {
    eyebrow: pick(source.footer.eyebrow, locale),
    pageSections: pick(source.footer.pageSections, locale),
    role: pick(source.footer.role, locale),
    backToTop: pick(source.footer.backToTop, locale),
    copyrightName: source.footer.copyrightName,
    navigation: source.footer.navigation.map((entry) => ({
      number: entry.number,
      label: pick(entry.label, locale),
    })),
  },
  seo: pick(source.seo, locale),
  ui: pick(source.ui, locale),
  actions: {
    // Card call to action. Lives under `projectsSection` in the source, beside
    // the section's other visible strings.
    viewProject: pick(source.projectsSection.viewProject, locale),
  },
});

mkdirSync(OUT_DIR, { recursive: true });

for (const locale of LOCALES) {
  const dictionary = buildDictionary(locale);
  const body = JSON.stringify(dictionary, null, 2);
  const file = [
    '/**',
    ' * GENERATED FILE — do not edit by hand.',
    ' *',
    ' * Source: Hashem_Portfolio_Content_Master_v3_5LANG.json',
    ' * Regenerate: node scripts/generate-locales.mjs',
    ' */',
    '',
    "import type { Dictionary } from '../types';",
    '',
    `const ${locale}: Dictionary = ${body};`,
    '',
    `export default ${locale};`,
    '',
  ].join('\n');

  writeFileSync(resolve(OUT_DIR, `${locale}.ts`), file, 'utf8');
  console.log(`generated content/locales/${locale}.ts (${body.length} chars)`);
}
