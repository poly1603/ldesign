/**
 * @ldesign/i18n Vue 3 Adapter
 * Complete Vue 3 integration with plugin, composables, and components
 */

import type { App } from 'vue';
import type { I18nConfig, I18nInstance } from '../../types';
import { OptimizedI18n } from '../../core/i18n-optimized';
import { I18N_SYMBOL } from './constants';

// Import and re-export plugin
import { createI18nPlugin, LDesignI18nPlugin } from './plugin';
export { createI18nPlugin, LDesignI18nPlugin };

// Export components
export { default as I18nProvider } from './components/I18nProvider.vue';
export { default as I18nText } from './components/I18nText.vue';
export { default as I18nTranslate } from './components/I18nTranslate.vue';
export { default as LocaleSwitcher } from './components/LocaleSwitcher.vue';

// Export composables
export { useI18n } from './composables/useI18n';
export { useI18nAsync } from './composables/useI18nAsync';
export { useLocale } from './composables/useLocale';
export { useTranslation } from './composables/useTranslation';

// Export directives
export { vT } from './directives/vT';
export { vTHtml } from './directives/vTHtml';
export { vTPlural } from './directives/vTPlural';

// Export types
export * from './types';

// Export utilities
export { createI18n } from './utils/createI18n';
export { defineI18nConfig } from './utils/defineI18nConfig';
export { loadLocaleMessages } from './utils/loadLocaleMessages';

// Quick setup function for Vue apps
export function setupI18n(app: App, config?: I18nConfig): I18nInstance {
  const i18n = new OptimizedI18n(config);
  
  // Install as plugin
  app.use(createI18nPlugin(i18n));
  
  // Provide globally
  app.provide(I18N_SYMBOL, i18n);
  
  return i18n;
}
