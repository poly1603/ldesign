/**
 * @ldesign/i18n - Vue 3 Adapter
 * Vue 3 integration for the i18n library
 */

// import type { App, InjectionKey, Plugin, ComputedRef, Ref } from 'vue';
import { inject, provide, computed, ref, watch, reactive, h } from 'vue';
// import type { I18nInstance, I18nConfig, Locale } from '../types';
import { createI18n } from '../index';

// Type aliases to avoid import issues
type App = any;
type InjectionKey<T> = any;
type Plugin = any;
type ComputedRef<T> = any;
type Ref<T> = any;
type I18nInstance = any;
type I18nConfig = any;
type Locale = string;

// Injection key for Vue
export const I18N_INJECTION_KEY: InjectionKey<I18nInstance> = Symbol('i18n');

/**
 * Vue composable return type
 */
export interface UseI18nComposable {
  i18n: I18nInstance;
  t: I18nInstance['t'];
  locale: Ref<Locale>;
  setLocale: (locale: Locale) => Promise<void>;
  availableLocales: ComputedRef<Locale[]>;
  currentLocale: ComputedRef<Locale>;
  fallbackLocale: ComputedRef<Locale | Locale[]>;
  isReady: Ref<boolean>;
}

/**
 * Create Vue plugin for i18n
 */
export function createVueI18n(config?: I18nConfig): Plugin & { i18n: I18nInstance } {
  const i18n = createI18n(config);
  
  return {
    i18n,
    install(app: App) {
      // Provide i18n instance globally
      app.provide(I18N_INJECTION_KEY, i18n);
      
      // Add global properties
      app.config.globalProperties.$i18n = i18n;
      app.config.globalProperties.$t = i18n.t.bind(i18n);
      
      // Add global methods
      app.config.globalProperties.$setLocale = async (locale: Locale) => {
        await i18n.setLocale(locale);
      };
      
      // Initialize i18n
      i18n.init().catch(err => {
        console.error('Failed to initialize i18n:', err);
      });
    }
  };
}

/**
 * Vue composable for using i18n
 */
export function useI18n(config?: I18nConfig): UseI18nComposable {
  // Try to inject existing instance
  const injected = inject(I18N_INJECTION_KEY, null);
  
  // Use injected or create new instance
  const i18n = injected || createI18n(config);
  
  // Reactive locale
  const locale = ref(i18n.locale);
  const isReady = ref(false);
  
  // Watch for locale changes
  const unsubscribe = i18n.on('localeChanged', ({ locale: newLocale }) => {
    if (newLocale) {
      locale.value = newLocale;
    }
  });
  
  // Initialize if not already done
  if (!injected && config?.messages) {
    i18n.init().then(() => {
      isReady.value = true;
    });
  } else {
    isReady.value = true;
  }
  
  // Computed properties
  const availableLocales = computed(() => i18n.getAvailableLocales());
  const currentLocale = computed(() => locale.value);
  const fallbackLocale = computed(() => i18n.fallbackLocale);
  
  // Methods
  const setLocale = async (newLocale: Locale) => {
    await i18n.setLocale(newLocale);
    locale.value = newLocale;
  };
  
  // 让 t 对 locale 产生响应式依赖，切换语言时可触发组件重渲染
  const reactiveT: I18nInstance['t'] = ((key: any, params?: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = locale.value;
    return i18n.t(key, params);
  }) as any;

  return {
    i18n,
    t: reactiveT,
    locale,
    setLocale,
    availableLocales,
    currentLocale,
    fallbackLocale,
    isReady
  };
}

/**
 * Create Vue directive for translations
 */
export const vI18n = {
  mounted(el: HTMLElement, binding: any) {
    const i18n = inject(I18N_INJECTION_KEY);
    if (!i18n) {
      console.warn('i18n instance not found. Make sure to install the i18n plugin.');
      return;
    }
    
    const { value, modifiers } = binding;
    
    if (typeof value === 'string') {
      // Simple translation
      el.textContent = i18n.t(value);
    } else if (typeof value === 'object') {
      // Translation with params
      const { key, params } = value;
      if (modifiers.html) {
        el.innerHTML = i18n.t(key, params);
      } else {
        el.textContent = i18n.t(key, params);
      }
    }
  },
  updated(el: HTMLElement, binding: any) {
    const i18n = inject(I18N_INJECTION_KEY);
    if (!i18n) return;
    
    const { value, modifiers } = binding;
    
    if (typeof value === 'string') {
      el.textContent = i18n.t(value);
    } else if (typeof value === 'object') {
      const { key, params } = value;
      if (modifiers.html) {
        el.innerHTML = i18n.t(key, params);
      } else {
        el.textContent = i18n.t(key, params);
      }
    }
  }
};

/**
 * Translation component for Vue
 */
export const I18nT = {
  name: 'I18nT',
  props: {
    keypath: {
      type: String,
      required: true
    },
    tag: {
      type: String,
      default: 'span'
    },
    params: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props: any) {
    const { t } = useI18n();
    
    const translation = computed(() => {
      return t(props.keypath, props.params);
    });
    
    return () => {
      const { tag } = props;
      return h(tag, translation.value);
    };
  }
};

// Vue-specific helper to create reactive translations
export function useTranslation(key: string, params?: Ref<Record<string, any>>) {
  const { t, locale } = useI18n();
  
  return computed(() => {
    // Trigger reactivity on locale change
    const _ = locale.value;
    return t(key, params?.value);
  });
}

// Helper for plural translations
export function usePlural(key: string, count: Ref<number>, params?: Ref<Record<string, any>>) {
  const { i18n, locale } = useI18n();
  
  return computed(() => {
    // Trigger reactivity on locale change
    const _ = locale.value;
    return i18n.plural(key, count.value, {
      params: { ...params?.value, count: count.value }
    });
  });
}

// Helper for formatted numbers
export function useNumber(value: Ref<number>, options?: Intl.NumberFormatOptions) {
  const { i18n, locale } = useI18n();
  
  return computed(() => {
    // Trigger reactivity on locale change
    const _ = locale.value;
    return i18n.number(value.value, options);
  });
}

// Helper for formatted dates
export function useDate(value: Ref<Date | string | number>, options?: Intl.DateTimeFormatOptions) {
  const { i18n, locale } = useI18n();
  
  return computed(() => {
    // Trigger reactivity on locale change
    const _ = locale.value;
    return i18n.date(value.value, options);
  });
}

// Helper for formatted currency
export function useCurrency(value: Ref<number>, currency: string, options?: Intl.NumberFormatOptions) {
  const { i18n, locale } = useI18n();
  
  return computed(() => {
    // Trigger reactivity on locale change
    const _ = locale.value;
    return i18n.currency(value.value, currency, options);
  });
}

// Helper for relative time
export function useRelativeTime(value: Ref<Date | string | number>, options?: Intl.RelativeTimeFormatOptions) {
  const { i18n, locale } = useI18n();
  
  return computed(() => {
    // Trigger reactivity on locale change
    const _ = locale.value;
    return i18n.relativeTime(value.value, options);
  });
}

// h function is already imported above
