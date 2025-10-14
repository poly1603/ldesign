/**
 * @ldesign/i18n - Engine Plugin Integration
 * 为 @ldesign/engine 提供国际化插件
 */

import type { Plugin, PluginContext } from '@ldesign/engine';
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
 * 创建 i18n Engine 插件（返回对象以便在 setupApp 中安装）
 */
export function createI18nEnginePlugin(options: I18nEnginePluginOptions = {}) {
  const {
    detectBrowserLanguage = true,
    persistLanguage = true,
    storageKey = 'ldesign-locale',
    showMissingKeys = import.meta.env.DEV,
    ...i18nConfig
  } = options;

  let i18nInstance: I18nInstance;
  let vuePlugin: any;
  let isInitialized = false;

  // 初始化函数
  const initialize = () => {
    if (isInitialized) return { i18nInstance, vuePlugin };
    
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

    // 创建 i18n 实例和 Vue 插件
    vuePlugin = createVueI18n(i18nConfig);
    i18nInstance = vuePlugin.i18n;

    // 监听语言变化，持久化到 localStorage，并同步 <html lang>
    i18nInstance.on('localeChanged', ({ locale }) => {
      if (!locale) return;
      if (persistLanguage && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, locale);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = String(locale).split('-')[0];
      }
    });

    // 初始化时同步 <html lang>
    if (typeof document !== 'undefined' && i18nInstance?.locale) {
      document.documentElement.lang = String(i18nInstance.locale).split('-')[0];
    }

    // 在开发环境添加全局访问
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      (window as any).__I18N__ = i18nInstance;
    }
    
    isInitialized = true;
    return { i18nInstance, vuePlugin };
  };

  // 返回一个包含 Engine 插件和 Vue 插件的对象
  return {
    name: '@ldesign/i18n',
    version: '3.0.0',
    
    // Engine 插件的 install 方法
    async install(context: PluginContext) {
      const { engine } = context;
      
      // 初始化 i18n
      const { i18nInstance: instance } = initialize();
      
      // 将 API 添加到 engine
      (engine as any).api = (engine as any).api || {};
      Object.assign((engine as any).api, {
        i18n: instance,
        async changeLocale(locale: string) {
          if (instance) {
            await instance.setLocale(locale);
          }
        },
        t(key: string, params?: Record<string, any>) {
          return instance?.t(key, params) || key;
        },
        getCurrentLocale() {
          return instance?.locale;
        },
        getAvailableLocales() {
          return instance?.getAvailableLocales() || [];
        }
      });

      console.log(`✅ [@ldesign/i18n] Engine plugin installed`);
    },
    
    // Vue 插件安装函数（在 setupApp 中调用）
    setupVueApp(app: App) {
      const { vuePlugin: plugin } = initialize();
      if (plugin) {
        app.use(plugin);
        console.log(`✅ [@ldesign/i18n] Vue plugin installed (locale: ${i18nInstance?.locale})`);
      }
    },

    async onReady() {
      // 初始化 i18n
      if (i18nInstance) {
        await i18nInstance.init();
        console.log('✅ [@ldesign/i18n] Initialized');
      }
    },

    // 提供API
    // 提供API（Engine 插件的 api 属性）
    api: {
      get i18n() {
        return i18nInstance;
      },
      
      get vuePlugin() {
        return vuePlugin;
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