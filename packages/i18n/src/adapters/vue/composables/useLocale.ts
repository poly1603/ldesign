/**
 * useLocale - Locale management hook
 */

import type { Locale } from '../../../types';
import { type ComputedRef, ref, type Ref } from 'vue';
import { useI18n } from './useI18n';

export interface UseLocaleReturn {
  locale: Ref<Locale>;
  availableLocales: ComputedRef<Locale[]>;
  setLocale: (locale: Locale) => Promise<void>;
  isCurrentLocale: (locale: Locale) => boolean;
}

export function useLocale(): UseLocaleReturn {
  const { locale, availableLocales, setLocale } = useI18n();

  const isCurrentLocale = (checkLocale: Locale): boolean => {
    return locale?.value === checkLocale;
  };

  return {
    locale: locale || ref('en_us'),
    availableLocales,
    setLocale,
    isCurrentLocale
  };
}
