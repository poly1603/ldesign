/**
 * 应用 i18n 配置
 *
 * 这个文件包含应用的 i18n 配置选项，用于扩展 @ldesign/i18n 的内置功能
 */

import type { I18nOptions } from '@ldesign/i18n'

/**
 * 应用 i18n 配置选项
 */
export const appI18nConfig: I18nOptions = {
  // 默认语言
  defaultLocale: 'zh-CN',

  // 备用语言
  fallbackLocale: 'en',

  // 存储配置
  storage: 'localStorage',

  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
  },

  // 事件监听
  onLanguageChanged: (locale: string) => {
    console.log(`🌐 语言已切换到: ${locale}`)
    // 更新 HTML lang 属性
    document.documentElement.lang = locale
    // 可以在这里添加其他语言切换后的逻辑
  },

  onLoadError: (locale: string, error: Error) => {
    console.error(`❌ 语言包加载失败 [${locale}]:`, error)
  },
}

// 导出应用自定义语言包（如果有的话）
// export { appLocales } from './locales'
