/**
 * useI18nAsync - Async loading hook for React
 */

import { useState, useEffect } from 'react';
import { useI18n } from './useI18n';
import type { Locale } from '../../../types';

export interface UseI18nAsyncOptions {
  loadOnMount?: boolean;
  locale?: Locale;
  loader?: (locale: Locale) => Promise<Record<string, any>>;
}

export interface UseI18nAsyncReturn {
  loading: boolean;
  error: Error | null;
  ready: boolean;
  loadMessages: (locale: Locale) => Promise<void>;
}

export function useI18nAsync(options: UseI18nAsyncOptions = {}): UseI18nAsyncReturn {
  const { locale, mergeMessages } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ready, setReady] = useState(false);

  const loadMessages = async (targetLocale: Locale) => {
    if (!options.loader) {
      console.warn('[useI18nAsync] No loader provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const messages = await options.loader(targetLocale);
      mergeMessages(targetLocale, messages);
      setReady(true);
    } catch (err) {
      setError(err as Error);
      console.error('[useI18nAsync] Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.loadOnMount) {
      const targetLocale = options.locale || locale;
      loadMessages(targetLocale);
    }
  }, []);

  return {
    loading,
    error,
    ready,
    loadMessages
  };
}