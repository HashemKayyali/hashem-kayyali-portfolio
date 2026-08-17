import type { Profile, WarpRamp } from '../types';

/**
 * Language-invariant facts only. Everything a reader sees as prose — role,
 * summaries, section copy — comes from `content/locales/*` through `useI18n`.
 * An email address and a phone number read the same in all five languages, so
 * they stay here rather than being duplicated five times.
 */
export const profile: Profile = {
  email: 'hashemkayyali99@gmail.com',
  phone: '+962 78 600 9370',
  whatsapp: '+962786009370',
  social: {
    linkedin: 'https://www.linkedin.com/in/hashem-kayyali-a4852a2b7/',
    instagram: 'https://www.instagram.com/hashemkayyali/',
    whatsapp: 'https://wa.me/962786009370',
    email: 'mailto:hashemkayyali99@gmail.com',
  },
  /** Handles, not translated prose: they are the accounts' own names. */
  linkedinHandle: 'hashem-kayyali',
  instagramHandle: '@hashemkayyali',
};

export const RESUME_PDF = '/resume/hashem-kayyali-resume.pdf';
export const RESUME_DOCX = '/resume/hashem-kayyali-resume.docx';
export const PROFILE_IMAGE = '/images/hashem-profile.webp';

/**
 * The pinned section headers (About, Resume, Selected Projects) share one
 * palette, so they read as the same piece of furniture down the page.
 */
export const SECTION_WARP_RAMP: WarpRamp = ['#ffffff', '#a11b3d', '#000000', '#ffffff', '#000000'];

/** Which `ui.alt` key names each journey photograph. */
export type ExperienceAltKey = 'eventiesExperience' | 'terminalExperience' | 'umniahExperience';

export interface ExperienceAsset {
  image: string;
  altKey: ExperienceAltKey;
  warpRamp: WarpRamp;
}

/**
 * Imagery and palette for the journey, index-aligned with
 * `t.resume.experience`. Ramps were tuned per employer and are unchanged.
 */
export const experienceAssets: ExperienceAsset[] = [
  {
    image: '/experience/rd-product-engineer.webp',
    altKey: 'eventiesExperience',
    /* Same ramp as the Eventies project card, which is the reference for both. */
    warpRamp: ['#000000', '#471199', '#000000', '#81239f', '#d6d6d6'],
  },
  {
    image: '/experience/the-terminal-vr.webp',
    altKey: 'terminalExperience',
    /* Tested in the colour lab: sky blue and teal over black. */
    warpRamp: ['#f2f2f2', '#3fa9de', '#000000', '#071421', '#055f66'],
  },
  {
    image: '/experience/umniah.webp',
    altKey: 'umniahExperience',
    /* Tested in the colour lab: the operator's red against navy. */
    warpRamp: ['#f2f2f2', '#d1203c', '#000000', '#12234a', '#ffffff'],
  },
];

/**
 * Palettes for the four capability stages. All four open on the same near-black
 * and keep black as the mid stop, so they stay one family of ink surfaces; only
 * the two lit stops differ, which is what lets the reader tell the stages apart
 * at a glance without a legend.
 */
export const CAPABILITY_RAMPS: WarpRamp[] = [
  ['#0d0206', '#8a5f18', '#000000', '#c48f30', '#e6d5b4'], // Define — amber
  ['#0d0206', '#8f1839', '#000000', '#c9385f', '#f2dae0'], // Build — the house burgundy
  ['#0d0206', '#0f6d78', '#000000', '#2fa9b5', '#dff0f2'], // Connect — signal teal
  ['#0d0206', '#4a2a9c', '#000000', '#7a55d1', '#e4dcf6'], // Operate — violet
];

/** The closing plate's own palette: a cool green lit inside the ink. */
export const CONTACT_RAMP: WarpRamp = ['#04120c', '#0d6047', '#000000', '#23a077', '#dcf2e7'];

/** Tested in the colour lab: deep navy and indigo lifting into white. */
export const ABOUT_STORY_RAMP: WarpRamp = ['#ffffff', '#01122d', '#070434', '#f2f2f2', '#d8d8d8'];
