/**
 * 国际化插件配置（应用侧）
 *
 * 移除 app/src/i18n/locales/index.ts 后，这里直接汇总语言包，
 * 保持对外导出的 API 不变，避免影响现有调用。
 */

import { createI18nEnginePlugin } from '@ldesign/i18n/vue/index.ts'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

// 基础语言设定
export const defaultLocale = 'zh-CN'
export const fallbackLocale = 'en'

// 汇总消息
export const messages = {
  'zh-CN': zhCN,
  en,
  ja
} as const

// 轻量语言信息（仅涵盖当前应用使用的语言）
const languageInfoMap: Record<string, { code: string; name: string; flag: string; nativeName?: string }> = {
  'zh-CN': { code: 'zh-CN', name: '简体中文', flag: '', nativeName: '简体中文' },
  en: { code: 'en', name: 'English', flag: '', nativeName: 'English' },
  ja: { code: 'ja', name: '日本語', flag: '', nativeName: '日本語' }
}

// 供应用 UI 使用的可用语言列表
export function getAvailableLocales() {
  const codes = Object.keys(messages)
  return codes.map(code => languageInfoMap[code] || { code, name: code.toUpperCase(), flag: '', nativeName: code.toUpperCase() })
}

// 创建国际化引擎插件
export const i18nPlugin = createI18nEnginePlugin({
  locale: defaultLocale,
  fallbackLocale,
  messages,

  // 持久化设置
  storage: 'localStorage',
  storageKey: 'ldesign-app-locale',

  // 自动检测
  autoDetect: true,

  // 明确启用语言，确保 UI 可见
  enabledLanguages: ['zh-CN', 'en', 'ja'],

  // 禁用内置翻译，只使用用户提供的翻译
  useBuiltIn: false,
  preferBuiltIn: false,
  fallbackToBuiltIn: false,

  // 缓存与性能
  cache: {
    enabled: true,
    maxSize: 100,
    defaultTTL: 60 * 60 * 1000,
    maxMemory: 50 * 1024 * 1024,
    enableTTL: true,
    cleanupInterval: 5 * 60 * 1000,
    memoryPressureThreshold: 0.8
  },

  onLanguageChanged: (locale: string) => {
    document.documentElement.lang = locale
    console.log(`[I18n] Language changed to: ${locale}`)
  },

  onLoadError: (error: Error) => {
    console.error('[I18n] Failed to load locale:', error)
  }
})

export default i18nPlugin
