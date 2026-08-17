// Explicit extensions: these modules are also loaded directly by Node in
// `scripts/validate-content.mjs`, which resolves ESM specifiers literally.
import type { Dictionary, Locale } from './types.ts';
import en from './locales/en.ts';
import ar from './locales/ar.ts';
import de from './locales/de.ts';
import fr from './locales/fr.ts';
import es from './locales/es.ts';

/**
 * All five dictionaries are bundled statically: switching language is then a
 * state change with no async boundary, so there is no loading state and no
 * moment where half the page is in the previous language.
 */
export const dictionaries: Record<Locale, Dictionary> = { en, ar, de, fr, es };
