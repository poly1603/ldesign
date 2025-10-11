/**
 * 内置翻译模块
 *
 * 汇总所有内置语言包，提供统一的导出接口
 */

import type { BuiltInLanguagePackage } from './types'
import de from './de'
import en from './en'
import es from './es'
import fr from './fr'
import ja from './ja'
import ko from './ko'
import ru from './ru'
import zhCN from './zh-CN'

/**
 * 所有内置语言包
 */
export const builtInTranslations: Record<string, BuiltInLanguagePackage> = {
  'zh-CN': zhCN,
  'zh': zhCN, // 别名
  'en': en,
  'en-US': en, // 别名
  'ja': ja,
  'ja-JP': ja,
  'ko': ko,
  'ko-KR': ko,
  'es': es,
  'es-ES': es,
  'fr': fr,
  'fr-FR': fr,
  'de': de,
  'de-DE': de,
  'ru': ru,
  'ru-RU': ru,
}

/**
 * 获取内置语言包
 *
 * @param locale 语言代码
 * @returns 内置语言包或 undefined
 */
export function getBuiltInTranslation(locale: string): BuiltInLanguagePackage | undefined {
  return builtInTranslations[locale]
}

/**
 * 检查是否有内置语言包
 *
 * @param locale 语言代码
 * @returns 是否有内置语言包
 */
export function hasBuiltInTranslation(locale: string): boolean {
  return locale in builtInTranslations
}

/**
 * 获取所有支持的内置语言列表
 *
 * @returns 内置语言代码数组
 */
export function getBuiltInLocales(): string[] {
  return Object.keys(builtInTranslations)
}

/**
 * 获取内置语言的信息列表
 *
 * @returns 语言信息数组
 */
export function getBuiltInLanguageInfos() {
  return Object.values(builtInTranslations).map(pkg => pkg.info)
}

// 导出类型定义
export type {
  BuiltInLanguagePackage,
  BuiltInTranslations,
  BusinessTranslations,
  CommonTranslations,
  DateTimeTranslations,
  ErrorTranslations,
  NotificationTranslations,
  UITranslations,
  ValidationTranslations,
} from './types'

// 导出各语言包
export { de, en, es, fr, ja, ko, ru, zhCN }
