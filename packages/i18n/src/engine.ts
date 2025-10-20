/**
 * @ldesign/i18n - Engine Plugin Integration
 * 
 * 提供与 @ldesign/engine 的集成
 * 
 * 注意：此文件用于兼容旧的 Engine 插件系统
 * 新项目建议使用 plugin.ts 中的 createI18nPlugin
 */

import type { App } from 'vue';
import type { I18nConfig, I18nInstance } from './types';
import { ref } from 'vue';

import { createVueI18n } from './adapters/vue';

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
   * 语言变化时的回调
   */
  onLocaleChange?: (locale: string) => void;
}

/**
 * 创建 i18n Engine 插件
 */
export function createI18nEnginePlugin(options: I18nEnginePluginOptions = {}) {
  const {
    detectBrowserLanguage = true,
    persistLanguage = true,
    storageKey = 'ldesign-locale',
    onLocaleChange,
    ...i18nConfig
  } = options;

  let i18nInstance: I18nInstance;
  let vuePlugin: any;

  // 确定初始 locale
  let initialLocale = i18nConfig.locale || 'zh-CN';

  // 从 localStorage 恢复（优先级最高）
  if (persistLanguage && typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem(storageKey);
    if (savedLocale) {
      initialLocale = savedLocale;
    }
  }

  // 自动检测浏览器语言（优先级次之）
  if (detectBrowserLanguage && !i18nConfig.locale && typeof window !== 'undefined') {
    const browserLang = navigator.language; // 使用完整的语言代码，如 zh-CN
    if (browserLang) {
      initialLocale = browserLang;
    }
  }

  // 响应式的 locale 状态 - 作为唯一的语言状态源
  const localeRef = ref(initialLocale);

  // 初始化函数
  const initialize = () => {
    // 使用 localeRef 的值作为初始语言
    i18nConfig.locale = localeRef.value;

    // 创建 i18n 实例和 Vue 插件
    vuePlugin = createVueI18n(i18nConfig);
    i18nInstance = vuePlugin.i18n;

    // 监听语言变化，持久化到 localStorage
    i18nInstance.on('localeChanged', ({ locale }) => {
      if (!locale) return;

      // 更新响应式 locale (单一状态源)
      localeRef.value = locale;

      if (persistLanguage && typeof window !== 'undefined') {
        localStorage.setItem(storageKey, locale);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = String(locale).split('-')[0];
      }
      // 调用自定义回调
      if (onLocaleChange) {
        onLocaleChange(locale);
      }
    });

    // 初始化时同步 <html lang>
    if (typeof document !== 'undefined' && i18nInstance?.locale) {
      document.documentElement.lang = String(i18nInstance.locale).split('-')[0];
    }

    return { i18nInstance, vuePlugin };
  };

  // 返回插件对象
  return {
    name: '@ldesign/i18n',
    version: '3.0.0',

    // 暴露响应式 locale - 其他插件可以直接使用
    localeRef,

    // Engine 插件的 install 方法
    async install(context: any) {
      const { i18nInstance: instance } = initialize();

      // 将 API 添加到 context
      if (context.engine) {
        context.engine.i18n = instance;

        // 初始化时同步当前语言到 engine.state
        if (context.engine.state && instance.locale) {
          context.engine.state.set('locale', instance.locale);
        }

        // 监听语言变化，同步到 engine.state
        instance.on('localeChanged', ({ locale }) => {
          if (context.engine.state && locale) {
            context.engine.state.set('locale', locale);
          }
        });
      }
    },

    // Vue 插件安装函数
    setupVueApp(app: App) {
      const { vuePlugin: plugin } = initialize();
      if (plugin) {
        app.use(plugin);
      }
    },

    // 提供API
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
  });
}

// 导出插件实例
export const i18nPlugin = createI18nEnginePlugin;