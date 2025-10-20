/**
 * useI18n - Main composable for Vue i18n
 */

import type { I18nInstance, InterpolationParams, Locale, MessageKey, TranslateOptions } from '../../../types';
import { computed, type ComputedRef, inject, onUnmounted, ref, type Ref, watchEffect } from 'vue';
import { I18N_SYMBOL } from '../constants';

export interface UseI18nOptions {
  useScope?: 'global' | 'local';
  messages?: Record<string, any>;
  locale?: string;
  fallbackLocale?: string | string[];
  inheritLocale?: boolean;
  namespace?: string;
}

export interface UseI18nReturn {
  // Properties
  locale: Ref<Locale>;
  fallbackLocale: Ref<Locale | Locale[]>;
  messages: ComputedRef<Record<string, any>>;
  availableLocales: ComputedRef<Locale[]>;
  
  // Methods
  t: (key: MessageKey, params?: InterpolationParams | TranslateOptions) => string;
  te: (key: MessageKey, locale?: Locale) => boolean;
  tm: (key: MessageKey) => any;
  rt: (message: string, params?: InterpolationParams) => string;
  
  // Plural
  tc: (key: MessageKey, count: number, params?: InterpolationParams) => string;
  tp: (key: MessageKey, count: number, params?: InterpolationParams) => string; // Alias for tc
  
  // Date & Number formatting
  d: (value: Date | number | string, format?: string) => string;
  n: (value: number, format?: string) => string;
  
  // Locale management
  setLocale: (locale: Locale) => Promise<void>;
  getLocale: () => Locale;
  setFallbackLocale: (locale: Locale | Locale[]) => void;
  getFallbackLocale: () => Locale | Locale[];
  
  // Message management
  mergeLocaleMessage: (locale: Locale, messages: Record<string, any>) => void;
  getLocaleMessage: (locale: Locale) => Record<string, any>;
  setLocaleMessage: (locale: Locale, messages: Record<string, any>) => void;
  
  // Instance
  i18n: I18nInstance;
}

export function useI18n(options: UseI18nOptions = {}): UseI18nReturn {
  const {
    useScope = 'global',
    messages: localMessages,
    locale: localLocale,
    fallbackLocale: localFallback,
    inheritLocale = true,
    namespace
  } = options;

  // Get global i18n instance
  const globalI18n = inject(I18N_SYMBOL);
  
  if (!globalI18n) {
    throw new Error('[useI18n] No i18n instance found. Make sure to install the i18n plugin.');
  }

  // Create local scope if needed
  let i18n: I18nInstance;
  
  if (useScope === 'local' && localMessages) {
    // Create a local i18n instance
    i18n = globalI18n.clone({
      locale: localLocale || (inheritLocale ? globalI18n.locale : undefined),
      fallbackLocale: localFallback || (inheritLocale ? globalI18n.fallbackLocale : undefined),
      messages: localMessages
    });
  } else {
    i18n = globalI18n;
  }

  // Create reactive refs
  const locale = ref(i18n.locale || 'en_us');
  const fallbackLocale = ref(i18n.fallbackLocale || 'en_us');

  // Sync locale changes with cleanup
  const stopWatchLocale = watchEffect(() => {
    i18n.locale = locale.value;
  });

  const stopWatchFallback = watchEffect(() => {
    i18n.fallbackLocale = fallbackLocale.value;
  });

  // Listen to locale changes
  const unsubscribe = i18n.on('localeChanged', ({ locale: newLocale }) => {
    locale.value = newLocale;
  });
  
  // Cleanup on unmount
  onUnmounted(() => {
    stopWatchLocale();
    stopWatchFallback();
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe();
    }
    
    // Clean up local instance if created
    if (useScope === 'local' && i18n !== globalI18n && 'destroy' in i18n) {
      i18n.destroy();
    }
  });

  // Computed properties
  const messages = computed(() => i18n.getMessages(locale.value) || {});
  const availableLocales = computed(() => i18n.getAvailableLocales());

  // Translation function with namespace support
  const t = (key: MessageKey, params?: InterpolationParams | TranslateOptions): string => {
    const actualKey = namespace ? `${namespace}.${key}` : key;
    return i18n.t(actualKey, params);
  };

  // Check if translation exists
  const te = (key: MessageKey, checkLocale?: Locale): boolean => {
    const actualKey = namespace ? `${namespace}.${key}` : key;
    return i18n.exists(actualKey, { locale: checkLocale });
  };

  // Get raw message
  const tm = (key: MessageKey): any => {
    const actualKey = namespace ? `${namespace}.${key}` : key;
    const messages = i18n.getMessages(locale.value);
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
  };

  // Interpolate raw translation
  const rt = (message: string, params?: InterpolationParams): string => {
    return i18n.interpolation.interpolate(message, params || {}, locale.value);
  };

  // Translation with count (pluralization)
  const tc = (key: MessageKey, count: number, params?: InterpolationParams): string => {
    const actualKey = namespace ? `${namespace}.${key}` : key;
    return i18n.plural(actualKey, count, { params });
  };

  // Date formatting
  const d = (value: Date | number | string, format?: string): string => {
    return i18n.date(value, format ? { dateStyle: format as any } : undefined);
  };

  // Number formatting
  const n = (value: number, format?: string): string => {
    if (format === 'currency') {
      return i18n.currency(value, 'USD'); // Default currency
    } else if (format === 'percent') {
      return i18n.number(value, { style: 'percent' });
    }
    return i18n.number(value);
  };

  // Locale management
  const setLocale = async (newLocale: Locale): Promise<void> => {
    await i18n.setLocale(newLocale);
    locale.value = newLocale;
  };

  const getLocale = (): Locale => locale.value || 'en_us';

  const setFallbackLocale = (newFallback: Locale | Locale[]): void => {
    i18n.fallbackLocale = newFallback;
    fallbackLocale.value = newFallback;
  };

  const getFallbackLocale = (): Locale | Locale[] => fallbackLocale.value;

  // Message management
  const mergeLocaleMessage = (locale: Locale, messages: Record<string, any>): void => {
    i18n.mergeMessages(locale, messages, namespace);
  };

  const getLocaleMessage = (locale: Locale): Record<string, any> => {
    return i18n.getMessages(locale, namespace) || {};
  };

  const setLocaleMessage = (locale: Locale, messages: Record<string, any>): void => {
    i18n.setMessages(locale, messages, namespace);
  };

  return {
    // Properties
    locale: locale as Ref<Locale>,
    fallbackLocale: fallbackLocale as Ref<Locale | Locale[]>,
    messages,
    availableLocales,
    
    // Methods
    t,
    te,
    tm,
    rt,
    tc,
    tp: tc, // Alias for tc
    d,
    n,
    
    // Locale management
    setLocale,
    getLocale,
    setFallbackLocale,
    getFallbackLocale,
    
    // Message management
    mergeLocaleMessage,
    getLocaleMessage,
    setLocaleMessage,
    
    // Instance
    i18n
  };
}