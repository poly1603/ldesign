/**
 * useTranslation - Simplified translation hook
 */

import type { InterpolationParams, MessageKey } from '../../../types';
import { computed } from 'vue';
import { useI18n } from './useI18n';

export interface UseTranslationOptions {
  namespace?: string;
}

export interface UseTranslationReturn {
  t: (key: MessageKey, params?: InterpolationParams) => string;
  tc: (key: MessageKey, count: number, params?: InterpolationParams) => string;
  te: (key: MessageKey) => boolean;
  locale: string;
  ready: boolean;
}

export function useTranslation(namespace?: string): UseTranslationReturn {
  const { t, tc, te, locale } = useI18n({ namespace });
  
  const ready = computed(() => locale.value !== undefined);

  return {
    t,
    tc,
    te,
    locale: locale.value,
    ready: ready.value
  };
}