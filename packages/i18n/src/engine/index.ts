/**
 * @ldesign/i18n - Engine Plugin Integration
 * 为 @ldesign/engine 提供国际化插件
 */

import type { EnginePlugin } from '@ldesign/engine';
import type { App } from 'vue';
import type { I18nConfig, I18nInstance } from '../types';
import { createI18n } from '../index';
import { createVueI18n } from '../adapters/vue';

export interface I18nEnginePluginOptions extends I18nConfig {
  /**
   * 是否自动检测浏览器语言
   */
  detectBrowserLanguage?: boolean;
  /**
   * 是否持久化语言设置到 localStorage
   */
  persistLanguage?: boolean;
  /**
   * localStorage 的 key
   */
  storageKey?: string;
  /**
   * 是否在开发环境显示缺失的翻译键
   */
  showMissingKeys?: boolean;
}

/**
 * 创建 i18n Engine 插件
 */
export function createI18nEnginePlugin(options: I18nEnginePluginOptions = {}): EnginePlugin {
  const {
    detectBrowserLanguage = true,
    persistLanguage = true,
    storageKey = 'ldesign-locale',
    showMissingKeys = import.meta.env.DEV,
    ...i18nConfig
  } = options;

  let i18nInstance: I18nInstance;
  let vuePlugin: any;

  return {
    name: '@ldesign/i18n',
    version: '3.0.0',
    
    async install(app: App) {
      // 从 localStorage 恢复语言设置
      if (persistLanguage && typeof window !== 'undefined') {
        const savedLocale = localStorage.getItem(storageKey);
        if (savedLocale) {
          i18nConfig.locale = savedLocale;
        }
      }

      // 自动检测浏览器语言
      if (detectBrowserLanguage && !i18nConfig.locale && typeof window !== 'undefined') {
        const browserLang = navigator.language.split('-')[0];
        i18nConfig.locale = browserLang;
      }

      // 设置缺失键处理器
      if (showMissingKeys) {
        i18nConfig.missingKeyHandler = (key: string, locale: string) => {
          console.warn(`[i18n] Missing translation key: "${key}" for locale: "${locale}"`);
          return `[${key}]`;
        };
      }

      // 创建 Vue 插件
      vuePlugin = createVueI18n(i18nConfig);
      i18nInstance = vuePlugin.i18n;

      // 监听语言变化，持久化到 localStorage
      if (persistLanguage && typeof window !== 'undefined') {
        i18nInstance.on('localeChanged', ({ locale }) => {
          if (locale) {
            localStorage.setItem(storageKey, locale);
          }
        });
      }

      // 安装 Vue 插件
      app.use(vuePlugin);

      // 在开发环境添加全局访问
      if (import.meta.env.DEV && typeof window !== 'undefined') {
        (window as any).__I18N__ = i18nInstance;
      }

      console.log(`✅ [@ldesign/i18n] Plugin installed (locale: ${i18nInstance.locale})`);
    },

    async onReady() {
      // 初始化 i18n
      if (i18nInstance) {
        await i18nInstance.init();
        console.log('✅ [@ldesign/i18n] Initialized');
      }
    },

    // 提供API
    api: {
      get i18n() {
        return i18nInstance;
      },
      
      async changeLocale(locale: string) {
        if (i18nInstance) {
          await i18nInstance.setLocale(locale);
        }
      },
      
      t(key: string, params?: Record<string, any>) {
        return i18nInstance?.t(key, params) || key;
      },
      
      getCurrentLocale() {
        return i18nInstance?.locale;
      },
      
      getAvailableLocales() {
        return i18nInstance?.getAvailableLocales() || [];
      }
    }
  };
}

/**
 * 创建默认配置的 i18n Engine 插件
 */
export function createDefaultI18nEnginePlugin() {
  return createI18nEnginePlugin({
    locale: 'zh-CN',
    fallbackLocale: 'en-US',
    messages: {},
    detectBrowserLanguage: true,
    persistLanguage: true,
    showMissingKeys: true
  });
}

// 导出插件实例（可选）
export const i18nPlugin = createI18nEnginePlugin;