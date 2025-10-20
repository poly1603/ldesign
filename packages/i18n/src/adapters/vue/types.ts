/**
 * Type definitions for Vue i18n adapter
 */

import type { InjectionKey } from 'vue';
import type { I18nInstance, InterpolationParams, Locale, MessageKey } from '../../types';

// Augment Vue global properties
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $i18n: I18nInstance;
    $t: (key: MessageKey, params?: InterpolationParams) => string;
    $locale: {
      get: () => Locale;
      set: (locale: Locale) => void;
    };
  }
}

export interface VueI18nInstance extends I18nInstance {
  // Vue-specific methods
}

export interface VueI18nOptions {
  globalProperties?: boolean;
  directives?: boolean;
  components?: boolean;
}

export type I18nInjectionKey = InjectionKey<I18nInstance>;