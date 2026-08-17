export interface SocialLinks {
  linkedin: string;
  instagram: string;
  whatsapp: string;
  email: string;
}

/**
 * Contact facts, not copy. Anything a reader would expect to see translated
 * lives in `content/locales/*` instead.
 */
export interface Profile {
  email: string;
  phone: string;
  whatsapp: string;
  social: SocialLinks;
  linkedinHandle: string;
  instagramHandle: string;
}

/**
 * The five stops the warp shader mixes between, darkest to lightest. Omit it
 * and the surface uses the shared burgundy field; set it and that surface
 * renders its own frame in these colours.
 */
export type WarpRamp = readonly [string, string, string, string, string];
