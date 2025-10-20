/**
 * Vue 3 I18n Plugin
 */

import type { App, Plugin } from 'vue';
import type { I18nInstance } from '../../types';
import * as components from './components';
import { I18N_SYMBOL } from './constants';
import { vT, vTHtml, vTPlural } from './directives';

export interface I18nPluginOptions {
  globalProperties?: boolean;
  directives?: boolean;
  components?: boolean;
  defaultLocale?: string;
}

export function createI18nPlugin(
  i18n: I18nInstance,
  options: I18nPluginOptions = {}
): Plugin {
  const {
    globalProperties = true,
    directives = true,
    components: registerComponents = true,
  } = options;

  return {
    install(app: App) {
      // Provide i18n instance
      app.provide(I18N_SYMBOL, i18n);

      // Add global properties
      if (globalProperties) {
        app.config.globalProperties.$i18n = i18n;
        app.config.globalProperties.$t = i18n.t.bind(i18n);
        app.config.globalProperties.$locale = {
          get: () => i18n.locale,
          set: (locale: string) => { i18n.locale = locale; }
        };
      }

      // Register directives
      if (directives) {
        app.directive('t', vT);
        app.directive('t-html', vTHtml);
        app.directive('t-plural', vTPlural);
      }

      // Register components
      if (registerComponents) {
        Object.entries(components).forEach(([name, component]) => {
          if (name !== 'default' && component) {
            app.component(name, component);
          }
        });
      }

      // Initialize i18n
      if (!i18n.initialized) {
        i18n.init().catch(console.error);
      }
    }
  };
}

export class LDesignI18nPlugin implements Plugin {
  private i18n: I18nInstance;
  private options: I18nPluginOptions;

  constructor(i18n: I18nInstance, options: I18nPluginOptions = {}) {
    this.i18n = i18n;
    this.options = options;
  }

  install(app: App) {
    createI18nPlugin(this.i18n, this.options).install(app);
  }
}