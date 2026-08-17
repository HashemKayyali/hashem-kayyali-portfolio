// Explicit extension: also loaded directly by Node in the validation script.
import { LOCALES, type Direction, type Locale } from '../content/types.ts';

export { LOCALES };
export type { Direction, Locale };

/** Persisted preference. Anything else in this key is ignored. */
export const STORAGE_KEY = 'portfolio-language';

export const DEFAULT_LOCALE: Locale = 'en';

interface LocaleMeta {
  /** Endonym: the language names itself, in itself. No country flags. */
  nativeName: string;
  dir: Direction;
  htmlLang: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { nativeName: 'English', dir: 'ltr', htmlLang: 'en' },
  ar: { nativeName: 'العربية', dir: 'rtl', htmlLang: 'ar' },
  de: { nativeName: 'Deutsch', dir: 'ltr', htmlLang: 'de' },
  fr: { nativeName: 'Français', dir: 'ltr', htmlLang: 'fr' },
  es: { nativeName: 'Español', dir: 'ltr', htmlLang: 'es' },
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

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
