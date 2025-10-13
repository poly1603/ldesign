/**
 * useI18nAsync - Async loading hook
 */

import { ref, onMounted, type Ref } from 'vue';
import { useI18n } from './useI18n';
import type { Locale } from '../../../types';

export interface UseI18nAsyncOptions {
  loadLocale?: boolean;
  locale?: Locale;
  loader?: (locale: Locale) => Promise<Record<string, any>>;
}

export interface UseI18nAsyncReturn {
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  ready: Ref<boolean>;
  loadMessages: (locale: Locale) => Promise<void>;
}

export function useI18nAsync(options: UseI18nAsyncOptions = {}): UseI18nAsyncReturn {
  const { locale, mergeLocaleMessage } = useI18n();
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const ready = ref(false);

  const loadMessages = async (targetLocale: Locale) => {
    if (!options.loader) {
      console.warn('[useI18nAsync] No loader provided');
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const messages = await options.loader(targetLocale);
      mergeLocaleMessage(targetLocale, messages);
      ready.value = true;
    } catch (err) {
      error.value = err as Error;
      console.error('[useI18nAsync] Failed to load messages:', err);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (options.loadLocale) {
      const targetLocale = options.locale || locale.value;
      loadMessages(targetLocale);
    }
  });

  return {
    loading,
    error,
    ready,
    loadMessages
  };
}