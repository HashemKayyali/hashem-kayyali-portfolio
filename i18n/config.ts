// Explicit extension: also loaded directly by Node in the validation script.
import { LOCALES, type Direction, type Locale } from '../content/types.ts';

export { LOCALES };
export type { Direction, Locale };

/** Persisted preference. Anything else in this key is ignored. */
export const STORAGE_KEY = 'portfolio-language';

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * The canonical production origin, with no trailing slash.
 *
 * Every absolute URL the page publishes — canonical, hreflang, Open Graph,
 * structured data, sitemap — is built from this one value, so there is a single
 * place to change if the hostname ever does.
 */
export const SITE_URL = 'https://hashemkayyali.com';

interface LocaleMeta {
  /** Endonym: the language names itself, in itself. No country flags. */
  nativeName: string;
  dir: Direction;
  /** Used for `<html lang>` and for hreflang: language only, no region. */
  htmlLang: string;
  /**
   * Open Graph wants language_TERRITORY, which is a different convention from
   * hreflang. Territory here reflects the audience, not a separate URL.
   */
  ogLocale: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { nativeName: 'English', dir: 'ltr', htmlLang: 'en', ogLocale: 'en_US' },
  ar: { nativeName: 'العربية', dir: 'rtl', htmlLang: 'ar', ogLocale: 'ar_JO' },
  de: { nativeName: 'Deutsch', dir: 'ltr', htmlLang: 'de', ogLocale: 'de_DE' },
  fr: { nativeName: 'Français', dir: 'ltr', htmlLang: 'fr', ogLocale: 'fr_FR' },
  es: { nativeName: 'Español', dir: 'ltr', htmlLang: 'es', ogLocale: 'es_ES' },
};

/** Absolute canonical URL for a locale's home page. */
export const canonicalUrl = (locale: Locale): string =>
  `${SITE_URL}${pathForLocale(locale)}`;

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

/**
 * The URL is what makes a language version exist for a crawler, so it is the
 * authority on which language renders. English lives at the root rather than
 * at `/en/`, so the branded URL stays clean and there is no second indexable
 * copy of the English page.
 */
export const pathForLocale = (locale: Locale): string =>
  locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;

/** Reads the locale out of a pathname. Returns English for the root. */
export const localeFromPath = (pathname: string): Locale => {
  const segment = pathname.split('/').filter(Boolean)[0];
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
};

/** Swaps the locale prefix on a path, preserving whatever follows it. */
export const localizePath = (pathname: string, locale: Locale): string => {
  const segments = pathname.split('/').filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  const rest = segments.join('/');
  const prefix = pathForLocale(locale);
  return rest ? `${prefix}${rest}/`.replace('//', '/') : prefix;
};

export const directionOf = (locale: Locale): Direction => LOCALE_META[locale].dir;

/**
 * Reads the saved preference. Falls back to English for a missing, unknown, or
 * unreadable value — private-mode storage access throws rather than returning
 * null, so the read is guarded rather than null-checked.
 */
export const readStoredLocale = (): Locale => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
};

export const storeLocale = (locale: Locale): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* Preference is a convenience; losing it must never break the page. */
  }
};
