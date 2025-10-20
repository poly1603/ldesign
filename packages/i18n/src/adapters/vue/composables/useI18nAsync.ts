/**
 * useI18nAsync - Async loading hook
 */

import type { Locale } from '../../../types';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { useI18n } from './useI18n';

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
  let abortController: AbortController | null = null;

  const loadMessages = async (targetLocale: Locale) => {
    if (!options.loader) {
      console.warn('[useI18nAsync] No loader provided');
      return;
    }

    // Cancel previous request if exists
    if (abortController) {
      abortController.abort();
    }
    
    abortController = new AbortController();
    
    loading.value = true;
    error.value = null;

    try {
      const messages = await options.loader(targetLocale);
      
      // Check if request was aborted
      if (!abortController.signal.aborted) {
        mergeLocaleMessage(targetLocale, messages);
        ready.value = true;
      }
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        error.value = err as Error;
        console.error('[useI18nAsync] Failed to load messages:', err);
      }
    } finally {
      loading.value = false;
      abortController = null;
    }
  };

  onMounted(() => {
    if (options.loadLocale) {
      const targetLocale = options.locale || locale.value;
      loadMessages(targetLocale);
    }
  });
  
  // Cleanup on unmount
  onUnmounted(() => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  });

  return {
    loading,
    error,
    ready,
    loadMessages
  };
}
