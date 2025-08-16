/**
 * 应用 i18n 配置
 *
 * 这个文件包含应用的 i18n 配置选项，用于扩展 @ldesign/i18n 的内置功能
 */

import type {
  I18nEnginePluginOptions,
  I18nInstance,
  I18nOptions,
} from '@ldesign/i18n'
import { I18n, StaticLoader } from '@ldesign/i18n'
import en from './en'
import zhCN from './zh-CN'

/**
 * 创建带有应用语言包的 I18n 实例
 */
export async function createAppI18n(
  options?: I18nOptions,
): Promise<I18nInstance> {
  console.log('🔧 创建自定义 i18n 实例...')
  console.log('📦 加载应用语言包:', { zhCN, en })

  const loader = new StaticLoader()

  // 注册应用语言包 - 直接使用我们的语言包对象
  const packages = {
    'zh-CN': {
      info: {
        name: '中文（简体）',
        nativeName: '中文（简体）',
        code: 'zh-CN',
        direction: 'ltr' as const,
        dateFormat: 'YYYY-MM-DD',
      },
      translations: zhCN,
    },
    'en': {
      info: {
        name: 'English',
        nativeName: 'English',
        code: 'en',
        direction: 'ltr' as const,
        dateFormat: 'MM/DD/YYYY',
      },
      translations: en,
    },
  }

  console.log('📋 注册语言包:', packages)
  loader.registerPackages(packages)

  const i18n = new I18n(options)
  i18n.setLoader(loader)

  console.log('⚡ 初始化 i18n 实例...')
  await i18n.init()

  console.log('✅ 自定义 i18n 实例创建完成')
  console.log('🌐 可用语言:', i18n.getAvailableLanguages())
  console.log('🔤 当前语言:', i18n.getCurrentLanguage())

  return i18n
}

/**
 * 应用 i18n 配置选项
 */
export const appI18nConfig: I18nEnginePluginOptions = {
  // 默认语言
  defaultLocale: 'zh-CN',

  // 备用语言
  fallbackLocale: 'en',

  // Vue 插件配置
  globalInjection: true,
  globalPropertyName: '$t',

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

/**
 * 为 source 模式创建自定义 i18n 实例
 */
export const createCustomI18n = createAppI18n
