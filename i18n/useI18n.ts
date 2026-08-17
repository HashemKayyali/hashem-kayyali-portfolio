import { useContext } from 'react';
import { I18nContext, type I18nContextValue } from './LanguageProvider';

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside LanguageProvider');
  }
  return context;
};

/**
 * Fills `{name}` placeholders in the localized accessibility templates.
 *
 *   format(t.projectModal.a11y.showImage, { index: 2, count: 7 })
 *
 * Word order differs per language, which is exactly why these are templates
 * rather than concatenated fragments.
 */
export const format = (
  template: string,
  values: Record<string, string | number>,
): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
