/**
 * The shape every locale dictionary must satisfy.
 *
 * English is the schema authority: `content/locales/*.ts` are generated from the
 * approved content source by `scripts/generate-locales.mjs` and typed against
 * this interface, so a locale missing a field fails `tsc` rather than rendering
 * `undefined` in production.
 */

export const LOCALES = ['en', 'ar', 'de', 'fr', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export type Direction = 'ltr' | 'rtl';

/** Stable ids from the approved content source. Assets key off these too. */
export const PROJECT_IDS = [
  'eventies',
  'glitzz-lab',
  'umniah-youthconnect',
  'terminal-nfc',
  'bike-tower',
  'basket-beats',
  'vr-cycling',
  'bike-land-trainer',
  'outreach-automation',
  'traffic-flow-analytics',
] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];

/**
 * Filtering keys off these, never off the rendered label — a localized category
 * string would break the filter the moment the language changes.
 */
export const CATEGORY_KEYS = [
  'webPlatform',
  'businessSystem',
  'rdIot',
  'automationSystem',
  'computerVision',
] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];
export type FilterKey = 'all' | CategoryKey;

export interface LocalizedProject {
  /** Product name: a proper noun, identical in every locale. */
  title: string;
  category: string;
  status: string;
  /**
   * Supporting metadata naming the role held on this project. Present only
   * where the relationship to the product is not obvious from the copy.
   */
  role?: string;
  /** Card copy. Stays compact enough for the approved card composition. */
  short: string;
  overview: string;
  purpose: string;
  contribution: string;
  engineering: string;
  capabilities: string[];
  considerations: string[];
  technology: string[];
}

export interface ExperienceRoleCopy {
  title: string;
  period: string;
}

export interface ExperienceCopy {
  company: string;
  /** Absent where the employer holds a role progression instead. */
  role?: string;
  period: string;
  location: string;
  mode?: string;
  /** Present on the current role only. */
  badge?: string;
  /** Role progression inside one employer, oldest first. */
  roles?: ExperienceRoleCopy[];
  /**
   * Prose form of the entry. Where present it replaces `points`, for a role
   * whose scope reads as one continuous responsibility rather than a list of
   * separable duties.
   */
  summary?: string;
  /**
   * A short row naming the dimensions the role covers — at most a few words
   * each, rendered as the same quiet pills the entry's mode uses.
   */
  responsibilities?: string[];
  /** Empty where `summary` carries the entry instead. */
  points: string[];
}

export interface CapabilityCopy {
  number: string;
  title: string;
  description: string;
}

export interface FooterNavCopy {
  number: string;
  label: string;
}

export interface Dictionary {
  identity: {
    name: string;
    role: string;
    location: string;
  };
  hero: {
    headline: string;
    supporting: string;
    actions: {
      viewProjects: string;
      downloadResume: string;
      whatsapp: string;
    };
    technicalMeta: string[];
  };
  navigation: {
    home: string;
    about: string;
    resume: string;
    projects: string;
    capabilities: string;
    contact: string;
    downloadResume: string;
    language: string;
    openNavigation: string;
    closeNavigation: string;
    primaryNavigation: string;
    mobileNavigation: string;
    selectLanguage: string;
  };
  about: {
    title: string;
    subtitle: string;
    story1: string;
    story2: string;
    engineeringFocusTitle: string;
    /** Five labels, fixed order. */
    engineeringFocus: string[];
    toolkitTitle: string;
    toolkitIntro: string;
    toolkitAria: string;
    /** Five category names, index-aligned with `skills`. */
    skillCategories: string[];
    skills: string[][];
    metadataLabels: {
      location: string;
      currentRole: string;
      email: string;
      focus: string;
    };
    focusValue: string;
  };
  resume: {
    title: string;
    subtitle: string;
    profileEyebrow: string;
    profileHeadline: string;
    profileSummary: string;
    journeyTitle: string;
    journeySupport: string;
    experience: ExperienceCopy[];
    downloadCard: {
      title: string;
      copy: string;
      availability: string;
      pdf: string;
      word: string;
    };
    education: {
      title: string;
      degree: string;
      status: string;
    };
    coreStrengths: {
      title: string;
      items: string[];
    };
    metricLabels: {
      selectedProjects: string;
      engineeringDomains: string;
    };
  };
  projectsSection: {
    title: string;
    subtitle: string;
    filters: Record<FilterKey, string>;
  };
  projects: Record<ProjectId, LocalizedProject>;
  projectModal: {
    labels: {
      overview: string;
      purpose: string;
      contribution: string;
      engineering: string;
      capabilities: string;
      considerations: string;
      technology: string;
      visitLive: string;
      privateProject: string;
      viewFullScreen: string;
      previousImage: string;
      nextImage: string;
      closeDetails: string;
      screenshots: string;
      closeImageViewer: string;
      projectFilters: string;
      expand: string;
      imageUnavailable: string;
      privateSourceCode: string;
    };
    /** `{title}` / `{index}` / `{count}` placeholders, filled by `format()`. */
    a11y: {
      caseStudy: string;
      imageViewer: string;
      showImage: string;
      openImageFullScreen: string;
      screenshot: string;
      screenshotOf: string;
    };
  };
  capabilities: {
    title: string;
    subtitle: string;
    /** Stage words for the delivery-path rail. */
    flow: {
      define: string;
      build: string;
      connect: string;
      operate: string;
      caption: string;
    };
    items: CapabilityCopy[];
  };
  contact: {
    title: string;
    subtitle: string;
    eyebrow: string;
    heading: string;
    supporting: string;
    actions: {
      email: string;
      whatsapp: string;
    };
    index: {
      email: string;
      phone: string;
      location: string;
      linkedin: string;
      instagram: string;
    };
    aria: string;
  };
  footer: {
    eyebrow: string;
    pageSections: string;
    role: string;
    backToTop: string;
    copyrightName: string;
    navigation: FooterNavCopy[];
  };
  seo: {
    title: string;
    description: string;
  };
  ui: {
    labels: {
      currentRole: string;
      location: string;
      email: string;
      phone: string;
      focus: string;
      education: string;
      coreStrengths: string;
    };
    alt: {
      profile: string;
      eventiesExperience: string;
      terminalExperience: string;
      umniahExperience: string;
    };
  };
  /** Card-level call to action. Not part of the modal label set. */
  actions: {
    viewProject: string;
  };
}
