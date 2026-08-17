import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { dictionaries } from '../content';
import type { Dictionary, Direction, Locale } from '../content/types';
import {
  canonicalUrl,
  DEFAULT_LOCALE,
  directionOf,
  localeFromPath,
  LOCALE_META,
  pathForLocale,
  readStoredLocale,
  storeLocale,
} from './config';

export interface I18nContextValue {
  locale: Locale;
  dir: Direction;
  /** The active dictionary. Named `t` so call sites read `t.hero.headline`. */
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

/** Keeps the description tag in sync without assuming it exists. */
const setMetaContent = (selector: string, content: string) => {
  const tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (tag) tag.content = content;
};

/** Points a link tag at a new URL, if that tag is present. */
const setLinkHref = (selector: string, href: string) => {
  const tag = document.head.querySelector<HTMLLinkElement>(selector);
  if (tag) tag.href = href;
};

interface LanguageProviderProps {
  children: React.ReactNode;
  /** Set during prerendering, where there is no URL to read. */
  initialLocale?: Locale;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, initialLocale }) => {
  /*
   * Resolution order: the prerender's locale, then the URL, then English. The
   * saved preference deliberately does not participate here — the URL is what
   * a crawler and a shared link both see, so it has to be what renders.
   */
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;
    if (typeof window === 'undefined') return DEFAULT_LOCALE;
    return localeFromPath(window.location.pathname);
  });

  /*
   * A returning visitor who saved a language and then opens the bare root is
   * moved to their language's URL. Client-side and preference-based only: no
   * crawler carries localStorage, so `/` is always English to a crawler, and
   * nothing here keys off IP or Accept-Language.
   */
  useEffect(() => {
    if (window.location.pathname !== '/') return;
    const stored = readStoredLocale();
    if (stored === DEFAULT_LOCALE) return;
    window.history.replaceState({}, '', pathForLocale(stored));
    setLocaleState(stored);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    storeLocale(next);
    // Pushed rather than assigned: the language version has its own URL for
    // sharing and crawling, without a reload throwing away the WebGL context.
    window.history.pushState({}, '', pathForLocale(next));
  }, []);

  // Back and forward must move between language versions like any other URL.
  useEffect(() => {
    const onPopState = () => setLocaleState(localeFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const t = dictionaries[locale];
  const dir = directionOf(locale);

  // Document-level state the React tree does not own. The prerendered HTML
  // already carries all of this for the URL that was requested; this keeps it
  // correct after an in-page language change.
  useEffect(() => {
    const root = document.documentElement;
    const canonical = canonicalUrl(locale);

    root.lang = LOCALE_META[locale].htmlLang;
    root.dir = dir;
    document.title = t.seo.title;

    setMetaContent('meta[name="description"]', t.seo.description);
    setMetaContent('meta[property="og:title"]', t.seo.title);
    setMetaContent('meta[property="og:description"]', t.seo.description);
    setMetaContent('meta[property="og:url"]', canonical);
    setMetaContent('meta[property="og:locale"]', LOCALE_META[locale].ogLocale);
    setMetaContent('meta[name="twitter:title"]', t.seo.title);
    setMetaContent('meta[name="twitter:description"]', t.seo.description);
    setLinkHref('link[rel="canonical"]', canonical);
  }, [locale, dir, t]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, dir, t, setLocale }),
    [locale, dir, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export default LanguageProvider;
