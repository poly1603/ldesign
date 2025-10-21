/**
 * @ldesign/form - Internationalization
 * 国际化支持
 */

import zhCN from './zh-CN'
import enUS from './en-US'

/**
 * 语言包类型
 */
export type Locale = typeof zhCN

/**
 * 语言代码类型
 */
export type LocaleCode = 'zh-CN' | 'en-US'

/**
 * 内置语言包
 */
export const locales: Record<LocaleCode, Locale> = {
  'zh-CN': zhCN,
  'en-US': enUS
}

/**
 * 当前语言
 */
let currentLocale: LocaleCode = 'zh-CN'

/**
 * 自定义语言包
 */
let customLocales: Record<string, Partial<Locale>> = {}

/**
 * 设置当前语言
 * @param locale 语言代码
 */
export function setLocale(locale: LocaleCode): void {
  if (locales[locale]) {
    currentLocale = locale
  } else {
    console.warn(`Locale "${locale}" not found, using default locale "zh-CN"`)
  }
}

/**
 * 获取当前语言
 */
export function getLocale(): LocaleCode {
  return currentLocale
}

/**
 * 注册自定义语言包
 * @param locale 语言代码
 * @param messages 语言包内容
 */
export function registerLocale(locale: string, messages: Partial<Locale>): void {
  customLocales[locale] = messages
}

/**
 * 获取翻译文本
 * @param path 文本路径，如 'form.submit'
 * @param params 参数对象，用于替换占位符
 */
export function t(path: string, params?: Record<string, any>): string {
  const keys = path.split('.')
  let value: any = locales[currentLocale] || locales['zh-CN']

  // 查找文本
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key]
    } else {
      break
    }
  }

  // 如果未找到，尝试从自定义语言包查找
  if (!value && customLocales[currentLocale]) {
    value = customLocales[currentLocale]
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key]
      } else {
        break
      }
    }
  }

  // 如果还是未找到，返回路径本身
  if (typeof value !== 'string') {
    return path
  }

  // 替换占位符
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match
    })
  }

  return value
}

/**
 * useI18n Hook (用于 Vue)
 */
export function useI18n() {
  return {
    t,
    locale: currentLocale,
    setLocale,
    getLocale
  }
}

/**
 * 导出语言包
 */
export { zhCN, enUS }

/**
 * 默认导出
 */
export default {
  t,
  setLocale,
  getLocale,
  registerLocale,
  useI18n,
  locales,
  zhCN,
  enUS
}



