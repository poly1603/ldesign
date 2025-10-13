/**
 * useI18n - Main hook for React i18n
 */

import { useCallback, useMemo } from 'react';
import { useI18nContext } from '../I18nProvider';
import type { MessageKey, InterpolationParams, TranslateOptions, Locale } from '../../../types';

export interface UseI18nReturn {
  // Properties
  locale: Locale;
  availableLocales: Locale[];
  
  // Methods
  t: (key: MessageKey, params?: InterpolationParams | TranslateOptions) => string;
  te: (key: MessageKey, locale?: Locale) => boolean;
  tm: (key: MessageKey) => any;
  rt: (message: string, params?: InterpolationParams) => string;
  
  // Plural
  tc: (key: MessageKey, count: number, params?: InterpolationParams) => string;
  
  // Date & Number formatting
  d: (value: Date | number | string, format?: string) => string;
  n: (value: number, format?: string) => string;
  
  // Locale management
  setLocale: (locale: Locale) => Promise<void>;
  getLocale: () => Locale;
  
  // Message management
  mergeMessages: (locale: Locale, messages: Record<string, any>) => void;
  getMessages: (locale?: Locale) => Record<string, any> | null;
  setMessages: (locale: Locale, messages: Record<string, any>) => void;
}

export function useI18n(namespace?: string): UseI18nReturn {
  const { i18n, locale, setLocale } = useI18nContext();

  // Translation function with namespace support
  const t = useCallback(
    (key: MessageKey, params?: InterpolationParams | TranslateOptions): string => {
      const actualKey = namespace ? `${namespace}.${key}` : key;
      return i18n.t(actualKey, params);
    },
    [i18n, namespace]
  );

  // Check if translation exists
  const te = useCallback(
    (key: MessageKey, checkLocale?: Locale): boolean => {
      const actualKey = namespace ? `${namespace}.${key}` : key;
      return i18n.exists(actualKey, { locale: checkLocale });
    },
    [i18n, namespace]
  );

  // Get raw message
  const tm = useCallback(
    (key: MessageKey): any => {
      const actualKey = namespace ? `${namespace}.${key}` : key;
      const messages = i18n.getMessages(locale);
      if (!messages) return undefined;
      
      const keys = actualKey.split('.');
      let result: any = messages;
      
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          return undefined;
        }
      }
      
      return result;
    },
    [i18n, locale, namespace]
  );

  // Interpolate raw translation
  const rt = useCallback(
    (message: string, params?: InterpolationParams): string => {
      return i18n.interpolation.interpolate(message, params || {}, locale);
    },
    [i18n, locale]
  );

  // Translation with count (pluralization)
  const tc = useCallback(
    (key: MessageKey, count: number, params?: InterpolationParams): string => {
      const actualKey = namespace ? `${namespace}.${key}` : key;
      return i18n.plural(actualKey, count, { params });
    },
    [i18n, namespace]
  );

  // Date formatting
  const d = useCallback(
    (value: Date | number | string, format?: string): string => {
      return i18n.date(value, format ? { dateStyle: format as any } : undefined);
    },
    [i18n]
  );

  // Number formatting
  const n = useCallback(
    (value: number, format?: string): string => {
      if (format === 'currency') {
        return i18n.currency(value, 'USD'); // Default currency
      } else if (format === 'percent') {
        return i18n.number(value, { style: 'percent' });
      }
      return i18n.number(value);
    },
    [i18n]
  );

  // Locale management
  const getLocale = useCallback((): Locale => locale, [locale]);

  // Message management
  const mergeMessages = useCallback(
    (locale: Locale, messages: Record<string, any>): void => {
      i18n.mergeMessages(locale, messages, namespace);
    },
    [i18n, namespace]
  );

  const getMessages = useCallback(
    (locale?: Locale): Record<string, any> | null => {
      return i18n.getMessages(locale || i18n.locale, namespace);
    },
    [i18n, namespace]
  );

  const setMessages = useCallback(
    (locale: Locale, messages: Record<string, any>): void => {
      i18n.setMessages(locale, messages, namespace);
    },
    [i18n, namespace]
  );

  const availableLocales = useMemo(() => i18n.getAvailableLocales(), [i18n]);

  return {
    // Properties
    locale,
    availableLocales,
    
    // Methods
    t,
    te,
    tm,
    rt,
    tc,
    d,
    n,
    
    // Locale management
    setLocale,
    getLocale,
    
    // Message management
    mergeMessages,
    getMessages,
    setMessages,
  };
}