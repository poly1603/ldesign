/**
 * 语言包配置和动态合并功能
 * 
 * 支持内置语言包和用户自定义语言包的动态合并
 * 用户配置优先级高于内置配置
 */

import zhCN from './zh-CN.json'
import en from './en.json'
import ja from './ja.json'

/**
 * 用户自定义语言包
 * 这里可以添加用户的自定义翻译，会覆盖内置翻译
 */
export const userMessages = {
  'zh-CN': zhCN,
  'en': en,
  'ja': ja, // 日语
  // 用户可以在这里添加更多语言包
  // 'ko': koMessages, // 韩语
} as const

/**
 * 内置语言包（来自 @ldesign/i18n）
 * 这些是 packages/i18n 内置的语言包
 */
export const builtinMessages = {
  'zh-CN': {
    // 内置的中文翻译（基础翻译）
    'language.name': '中文',
    'language.nativeName': '中文',
    'language.switch': '切换语言',
    'language.current': '当前语言',
    'loading': '加载中...',
    'error': '错误',
    'success': '成功',
  },
  'en': {
    // 内置的英文翻译（基础翻译）
    'language.name': 'English',
    'language.nativeName': 'English',
    'language.switch': 'Switch Language',
    'language.current': 'Current Language',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
  },
  'ja': {
    // 内置的日语翻译
    'language.name': '日本語',
    'language.nativeName': '日本語',
    'language.switch': '言語を切り替える',
    'language.current': '現在の言語',
    'loading': '読み込み中...',
    'error': 'エラー',
    'success': '成功',
  }
} as const

/**
 * 内置语言信息映射（来自 @ldesign/i18n）
 */
export const builtinLanguageMap = {
  'zh-CN': { code: 'zh-CN', name: '简体中文', flag: '🇨🇳', nativeName: '简体中文' },
  'zh-TW': { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼', nativeName: '繁體中文' },
  'en': { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  'en-US': { code: 'en-US', name: 'English (US)', flag: '🇺🇸', nativeName: 'English (US)' },
  'en-GB': { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', nativeName: 'English (UK)' },
  'ja': { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  'ko': { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  'fr': { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  'de': { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  'es': { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  'pt': { code: 'pt', name: 'Português', flag: '🇵🇹', nativeName: 'Português' },
  'ru': { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
  'ar': { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
  'hi': { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', nativeName: 'हिन्दी' },
  'th': { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ไทย' },
  'vi': { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
} as const

/**
 * 深度合并对象
 */
function deepMerge(target: any, source: any): any {
  const result = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result
}

/**
 * 创建合并后的语言包
 * 用户配置优先级高于内置配置
 */
export function createMergedMessages() {
  const mergedMessages: Record<string, any> = {}

  // 获取所有可用的语言代码
  const allLocales = new Set([
    ...Object.keys(builtinMessages),
    ...Object.keys(userMessages)
  ])

  // 为每种语言合并翻译
  for (const locale of allLocales) {
    const builtinTranslations = builtinMessages[locale as keyof typeof builtinMessages] || {}
    const userTranslations = userMessages[locale as keyof typeof userMessages] || {}

    // 用户翻译覆盖内置翻译
    mergedMessages[locale] = deepMerge(builtinTranslations, userTranslations)
  }

  return mergedMessages
}

/**
 * 获取可用的语言列表
 * 根据用户配置和内置配置动态生成
 */
export function getAvailableLocales() {
  const mergedMessages = createMergedMessages()
  const availableLocales = Object.keys(mergedMessages)

  return availableLocales.map(code => {
    // 优先使用内置的语言信息
    const builtinInfo = builtinLanguageMap[code as keyof typeof builtinLanguageMap]

    if (builtinInfo) {
      return builtinInfo
    }

    // 如果没有内置信息，生成默认信息
    return {
      code,
      name: code.toUpperCase(),
      flag: '🌐',
      nativeName: code.toUpperCase()
    }
  })
}

/**
 * 默认语言
 */
export const defaultLocale = 'zh-CN'

/**
 * 回退语言
 */
export const fallbackLocale = 'en'

/**
 * 语言代码类型
 */
export type LocaleCode = keyof typeof userMessages

/**
 * 语言信息类型
 */
export type LocaleInfo = {
  code: string
  name: string
  flag: string
  nativeName: string
}

/**
 * 消息类型
 */
export type Messages = typeof userMessages

/**
 * 中文消息类型（用于类型推断）
 */
export type MessageSchema = typeof zhCN

/**
 * 导出合并后的消息（用于插件配置）
 */
export const messages = createMergedMessages()
