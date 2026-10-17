import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dictionaries } from '../content';
import { cachedDictionary, createLocaleRequest } from './dictionary-loader';
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
  const [{ locale, t }, setLanguage] = useState(() => {
    const locale = initialLocale ?? (typeof window === 'undefined'
      ? DEFAULT_LOCALE : localeFromPath(window.location.pathname));
    // Vite removes this SSR-only branch and its static dictionary imports
    // from the browser graph. Build-time rendering still has every locale.
    const t = import.meta.env.SSR ? dictionaries[locale] : cachedDictionary(locale);
    if (!t) throw new Error(`Dictionary ${locale} must load before rendering.`);
    return { locale, t };
  });
  const requestLocale = useMemo(() => createLocaleRequest(), []);
  const initialPreferenceApplied = useRef(false);

  const changeLocale = useCallback((next: Locale, navigation: 'push' | 'replace' | 'pop') => {
    void requestLocale(next, (dictionary) => {
      setLanguage({ locale: next, t: dictionary });
      if (navigation !== 'pop') {
        storeLocale(next);
        if (navigation === 'push') window.history.pushState({}, '', pathForLocale(next));
        else window.history.replaceState({}, '', pathForLocale(next));
      }
    }).then((result) => {
      if (result === 'failed' && navigation === 'pop') {
        window.history.replaceState({}, '', pathForLocale(locale));
      }
    });
  }, [requestLocale, locale]);

  /*
   * A returning visitor who saved a language and then opens the bare root is
   * moved to their language's URL. Client-side and preference-based only: no
   * crawler carries localStorage, so `/` is always English to a crawler, and
   * nothing here keys off IP or Accept-Language.
   */
  useEffect(() => {
    if (initialPreferenceApplied.current) return;
    initialPreferenceApplied.current = true;
    if (window.location.pathname !== '/') return;
    const stored = readStoredLocale();
    if (stored === DEFAULT_LOCALE) return;
    changeLocale(stored, 'replace');
  }, [changeLocale]);

  const setLocale = useCallback((next: Locale) => {
    // Pushed rather than assigned: the language version has its own URL for
    // sharing and crawling, without a reload throwing away the WebGL context.
    changeLocale(next, 'push');
  }, [changeLocale]);

  // Back and forward must move between language versions like any other URL.
  useEffect(() => {
    const onPopState = () => changeLocale(localeFromPath(window.location.pathname), 'pop');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [changeLocale]);

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
