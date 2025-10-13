/**
 * useTranslation - Simplified translation hook for React
 */

import { useI18n } from './useI18n';
import type { MessageKey, InterpolationParams } from '../../../types';

export interface UseTranslationReturn {
  t: (key: MessageKey, params?: InterpolationParams) => string;
  i18n: any;
  ready: boolean;
}

export function useTranslation(namespace?: string): UseTranslationReturn {
  const i18nReturn = useI18n(namespace);
  
  return {
    t: i18nReturn.t,
    i18n: i18nReturn,
    ready: true
  };
}