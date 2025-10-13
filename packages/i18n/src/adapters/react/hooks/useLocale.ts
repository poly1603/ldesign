/**
 * useLocale - Locale management hook for React
 */

import { useI18n } from './useI18n';
import type { Locale } from '../../../types';

export interface UseLocaleReturn {
  locale: Locale;
  availableLocales: Locale[];
  setLocale: (locale: Locale) => Promise<void>;
  isCurrentLocale: (locale: Locale) => boolean;
}

export function useLocale(): UseLocaleReturn {
  const { locale, availableLocales, setLocale } = useI18n();

  const isCurrentLocale = (checkLocale: Locale): boolean => {
    return locale === checkLocale;
  };

  return {
    locale,
    availableLocales,
    setLocale,
    isCurrentLocale
  };
}