import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { dictionaries } from '../content';
import type { Dictionary, Direction, Locale } from '../content/types';
import { DEFAULT_LOCALE, directionOf, LOCALE_META, readStoredLocale, storeLocale } from './config';

export interface I18nContextValue {
  locale: Locale;
  dir: Direction;
  /** The active dictionary. Named `t` so call sites read `t.hero.headline`. */
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

/** Keeps the description tag in sync without assuming it exists. */
const setMetaDescription = (content: string) => {
  let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = 'description';
    document.head.appendChild(tag);
  }
  tag.content = content;
};

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Resolved before first paint rather than in an effect, so a saved preference
  // never renders one frame of English first.
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === 'undefined' ? DEFAULT_LOCALE : readStoredLocale(),
  );

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    storeLocale(next);
  }, []);

  const t = dictionaries[locale];
  const dir = directionOf(locale);

  // Document-level state the React tree does not own: language, direction, and
  // the metadata a crawler or a screen reader reads.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = LOCALE_META[locale].htmlLang;
    root.dir = dir;
    document.title = t.seo.title;
    setMetaDescription(t.seo.description);
  }, [locale, dir, t]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, dir, t, setLocale }),
    [locale, dir, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export default LanguageProvider;
