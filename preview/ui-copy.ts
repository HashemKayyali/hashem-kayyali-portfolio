import type { Locale } from '../content/types';

// Preview-only accessibility chrome; all portfolio copy remains in the shared dictionaries.
export const skipToContent: Record<Locale, string> = {
  en: 'Skip to content', ar: 'انتقل إلى المحتوى', de: 'Zum Inhalt springen',
  fr: 'Aller au contenu', es: 'Saltar al contenido',
};
