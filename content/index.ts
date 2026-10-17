// Explicit extensions: these modules are also loaded directly by Node in
// `scripts/validate-content.mjs`, which resolves ESM specifiers literally.
import type { Dictionary, Locale } from './types.ts';
import en from './locales/en.ts';
import ar from './locales/ar.ts';
import de from './locales/de.ts';
import fr from './locales/fr.ts';
import es from './locales/es.ts';

/**
 * Complete dictionaries for prerendering and content/SEO validation. The
 * browser uses i18n/dictionary-loader.ts to fetch only the active locale;
 * LanguageProvider's SSR-only reference to this module is removed by Vite.
 */
export const dictionaries: Record<Locale, Dictionary> = { en, ar, de, fr, es };
