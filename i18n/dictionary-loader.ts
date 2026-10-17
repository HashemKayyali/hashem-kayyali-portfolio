import type { Dictionary, Locale } from '../content/types';

// Literal imports keep inactive languages out of the initial browser bundle.
const loaders: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  en: () => import('../content/locales/en.ts'),
  ar: () => import('../content/locales/ar.ts'),
  de: () => import('../content/locales/de.ts'),
  fr: () => import('../content/locales/fr.ts'),
  es: () => import('../content/locales/es.ts'),
};
const cache = new Map<Locale, Dictionary>();
const pending = new Map<Locale, Promise<Dictionary>>();

export const cachedDictionary = (locale: Locale) => cache.get(locale);

export const loadDictionary = (locale: Locale): Promise<Dictionary> => {
  const cached = cache.get(locale);
  if (cached) return Promise.resolve(cached);
  const loading = pending.get(locale);
  if (loading) return loading;
  const promise = loaders[locale]().then(({ default: dictionary }) => {
    cache.set(locale, dictionary);
    return dictionary;
  }).finally(() => pending.delete(locale));
  pending.set(locale, promise);
  return promise;
};

/** Only the newest request can commit; rejection keeps the last complete page. */
export const createLocaleRequest = (
  load: (locale: Locale) => Promise<Dictionary> = loadDictionary,
) => {
  let version = 0;
  return async (locale: Locale, commit: (dictionary: Dictionary) => void) => {
    const request = ++version;
    try {
      const dictionary = await load(locale);
      if (request !== version) return 'superseded' as const;
      commit(dictionary);
      return 'committed' as const;
    } catch (error) {
      if (request === version) console.error(`Unable to load language ${locale}; the current language is retained.`, error);
      return request === version ? 'failed' as const : 'superseded' as const;
    }
  };
};
