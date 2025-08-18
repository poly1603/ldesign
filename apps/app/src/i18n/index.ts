/**
 * 应用 i18n 配置
 *
 * 集成 packages/i18n 的通用翻译和应用特定翻译
 */

import type {
  I18nEnginePluginOptions,
  I18nOptions,
  I18nInstance,
} from '@ldesign/i18n'
import {
  createI18nEnginePlugin,
  I18n,
  StaticLoader,
  zhCNLanguagePackage,
  enLanguagePackage,
} from '@ldesign/i18n'

// 导入应用特定的翻译文件
import appZhCN from '../locales/zh-CN.json'
import appEn from '../locales/en.json'

/**
 * 自定义 i18n 创建函数
 * 合并通用翻译和应用特定翻译
 */
async function createCustomI18n(options?: I18nOptions): Promise<I18nInstance> {
  console.log('🔧 创建自定义 i18n 实例...')
  console.log('🔧 基础选项:', options)

  // 深度合并翻译文件
  function deepMerge(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key])
        ) {
          // 如果是对象，递归合并
          result[key] = deepMerge(result[key] || {}, source[key])
        } else {
          // 如果是基本类型，直接覆盖
          result[key] = source[key]
        }
      }
    }

    return result
  }

  // 先合并，然后强制覆盖 common.hello
  const mergedZhCN = deepMerge(zhCNLanguagePackage.translations, appZhCN)
  const mergedEn = deepMerge(enLanguagePackage.translations, appEn)

  // 强制添加 common.hello 翻译
  if (mergedZhCN.common) {
    ;(mergedZhCN.common as any).hello = '你好'
  }
  if (mergedEn.common) {
    ;(mergedEn.common as any).hello = 'Hello'
  }

  console.log('📦 通用翻译包:', { zhCNLanguagePackage, enLanguagePackage })
  console.log('📦 应用翻译包:', { appZhCN, appEn })

  // 详细检查应用翻译文件的实际内容
  console.log('� 应用翻译文件详细内容:')
  console.log('🔀 合并后的翻译:', { mergedZhCN, mergedEn })

  // 创建静态加载器
  const loader = new StaticLoader()

  // 注册合并后的语言包
  const packages = {
    'zh-CN': {
      info: {
        name: '中文（简体）',
        nativeName: '中文（简体）',
        code: 'zh-CN',
        direction: 'ltr' as const,
        dateFormat: 'YYYY-MM-DD',
        flag: '🇨🇳',
      },
      translations: mergedZhCN,
    },
    en: {
      info: {
        name: 'English',
        nativeName: 'English',
        code: 'en',
        direction: 'ltr' as const,
        dateFormat: 'MM/DD/YYYY',
        flag: '🇺🇸',
      },
      translations: mergedEn,
    },
  }

  console.log('📋 注册语言包:', packages)
  loader.registerPackages(packages)

  // 创建 i18n 实例
  const i18n = new I18n({
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en',
    ...options,
  })
  i18n.setLoader(loader)

  console.log('⚡ 初始化 i18n 实例...')
  await i18n.init()

  console.log('✅ 自定义 i18n 实例创建完成')
  console.log('🌐 可用语言:', i18n.getAvailableLanguages())
  console.log('🔤 当前语言:', i18n.getCurrentLanguage())

  // 测试翻译
  console.log('🧪 测试翻译:')
  console.log('  common.hello:', i18n.t('common.hello'))
  console.log('  app.title:', i18n.t('app.title'))
  console.log('  home.welcome:', i18n.t('home.welcome'))

  // 测试翻译数据是否正确加载
  console.log('🔍 翻译数据检查:')
  console.log('  当前语言:', i18n.getCurrentLanguage())
  console.log('  可用语言:', i18n.getAvailableLanguages())

  return i18n
}

/**
 * 创建应用的 i18n 插件配置
 */
export function createAppI18nPlugin() {
  const options: I18nEnginePluginOptions = {
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

    // 使用自定义创建函数
    createI18n: createCustomI18n,

    // 事件监听
    onLanguageChanged: (locale: string) => {
      console.log(`🌐 语言已切换到: ${locale}`)
      // 更新 HTML lang 属性
      document.documentElement.lang = locale
    },

    onLoadError: (locale: string, error: Error) => {
      console.error(`❌ 语言包加载失败 [${locale}]:`, error)
    },
  }

  return createI18nEnginePlugin(options)
}
