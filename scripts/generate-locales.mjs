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

/**
 * Directed copy that is not in the content source.
 *
 * Both entries were specified after the JSON was frozen, and the JSON itself is
 * untracked — so they live here, in version control, rather than as an edit to
 * the source file that a later hand-off would silently drop. Everything else on
 * the page still comes from the JSON.
 */

/** The card call to action has no key in the content source. */
const VIEW_PROJECT = {
  en: 'View project',
  ar: 'عرض المشروع',
  de: 'Projekt ansehen',
  fr: 'Voir le projet',
  es: 'Ver proyecto',
};

/**
 * Replaces `resume.profileHeadline`. The source line restated the Hero almost
 * word for word; this one names the span of responsibility instead, so the
 * Resume opens on something the Hero has not already said.
 *
 * The deployment noun matches the one each locale already uses in the resume
 * bullets (Bereitstellung / déploiement / despliegue / النشر), so the section
 * stays internally consistent.
 */
const PROFILE_HEADLINE = {
  en: 'Engineering ownership from product architecture to deployment.',
  ar: 'مسؤولية هندسية من بنية المنتج حتى النشر.',
  de: 'Engineering-Verantwortung von der Produktarchitektur bis zur Bereitstellung.',
  fr: 'Responsabilité d’ingénierie, de l’architecture produit au déploiement.',
  es: 'Responsabilidad de ingeniería, desde la arquitectura del producto hasta el despliegue.',
};

/**
 * Eventies — the case study's Contribution section.
 *
 * Overview, Purpose and Engineering are untouched: what the product is, what it
 * solves, and how it is built are separate statements from what one person owns.
 */
const EVENTIES_CONTRIBUTION = {
  en: 'Full ownership of Eventies’ digital product and technical implementation, from initial product structure and experience design through software architecture, frontend and backend development, integrations, testing, deployment, and ongoing platform operations. The role also includes website management, content and service organization, platform maintenance, and continuously translating operational needs into product improvements.',
  ar: 'مسؤولية متكاملة عن المنتج الرقمي والتنفيذ التقني في Eventies، بدءًا من بناء هيكل المنتج وتصميم تجربة الاستخدام، مرورًا بالبنية البرمجية وتطوير الواجهات والأنظمة الخلفية والتكاملات والاختبار والنشر، وصولًا إلى التشغيل المستمر للمنصة. ويشمل الدور كذلك إدارة الموقع، وتنظيم المحتوى والخدمات، وصيانة المنصة، وتحويل الاحتياجات التشغيلية باستمرار إلى تحسينات وتطويرات في المنتج.',
  de: 'Vollständige Verantwortung für das digitale Produkt und die technische Umsetzung von Eventies — von der initialen Produktstruktur und dem Experience Design über Softwarearchitektur, Frontend- und Backend-Entwicklung, Integrationen, Tests und Bereitstellung bis zum laufenden Betrieb der Plattform. Die Rolle umfasst außerdem die Verwaltung der Website, die Organisation von Inhalten und Services, die Wartung der Plattform und die kontinuierliche Übersetzung operativer Anforderungen in Produktverbesserungen.',
  fr: 'Responsabilité complète du produit numérique et de la mise en œuvre technique d’Eventies, de la structure initiale du produit et du design d’expérience jusqu’à l’architecture logicielle, au développement frontend et backend, aux intégrations, aux tests, au déploiement et à l’exploitation continue de la plateforme. Le rôle comprend également la gestion du site, l’organisation des contenus et des services, la maintenance de la plateforme et la traduction continue des besoins opérationnels en améliorations du produit.',
  es: 'Responsabilidad completa del producto digital y de la implementación técnica de Eventies, desde la estructura inicial del producto y el diseño de experiencia hasta la arquitectura de software, el desarrollo frontend y backend, las integraciones, las pruebas, el despliegue y la operación continua de la plataforma. El rol incluye además la gestión del sitio, la organización de contenidos y servicios, el mantenimiento de la plataforma y la traducción continua de necesidades operativas en mejoras del producto.',
};

/** Projects that name the role held on them, keyed by project id. */
const PROJECT_ROLE_IDS = ['eventies'];

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

const buildProjects = (locale) =>
  Object.fromEntries(
    source.projects.map((project) => [
      project.id,
      {
        title: project.title,
        category: pick(project.category, locale),
        status: pick(project.status, locale),
        // Reuses the resume's role string rather than restating it, so the card
        // and the journey can never drift apart.
        ...(PROJECT_ROLE_IDS.includes(project.id)
          ? { role: pick(source.resume.experience[0].role, locale) }
          : {}),
        short: pick(project.short, locale),
        overview: pick(project.overview, locale),
        purpose: pick(project.purpose, locale),
        contribution:
          project.id === 'eventies'
            ? EVENTIES_CONTRIBUTION[locale]
            : pick(project.contribution, locale),
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
    profileHeadline: PROFILE_HEADLINE[locale],
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
    viewProject: VIEW_PROJECT[locale],
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
