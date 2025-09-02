/**
 * 创建 I18n 实例的便捷函数
 * 
 * 参考 vue-i18n 的 createI18n API 设计
 * 提供更简洁、更直观的创建方式
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { I18n } from './i18n'
import type { I18nInstance, I18nOptions } from './types'

/**
 * 简化的 I18n 配置选项
 * 
 * 参考 vue-i18n 的配置结构，提供更直观的配置方式
 */
export interface CreateI18nOptions extends Omit<I18nOptions, 'defaultLocale'> {
  /** 当前语言（必需） */
  locale: string
  /** 降级语言（可选，默认与 locale 相同） */
  fallbackLocale?: string
  /** 语言包数据 */
  messages?: Record<string, Record<string, any>>
  /** 是否启用传统模式（兼容旧版本 API） */
  legacy?: boolean
  /** 全局注入（Vue 插件使用） */
  globalInjection?: boolean
  /** 是否允许组合式 API */
  allowComposition?: boolean
  /** 缺失翻译时的处理方式 */
  missingWarn?: boolean
  /** 降级翻译时的处理方式 */
  fallbackWarn?: boolean
  /** 静默翻译警告 */
  silentTranslationWarn?: boolean
  /** 静默降级警告 */
  silentFallbackWarn?: boolean
  /** 格式化函数 */
  modifiers?: Record<string, (str: string) => string>
  /** 复数规则 */
  pluralizationRules?: Record<string, (choice: number, choicesLength: number) => number>
  /** 后处理器 */
  postTranslation?: (str: string, key: string) => string
  /** 同步模式 */
  sync?: boolean
  /** 严格模式 */
  strict?: boolean
  /** 转义参数值 */
  escapeParameterHtml?: boolean
}

/**
 * 创建 I18n 实例
 * 
 * 这是创建国际化实例的推荐方式，提供了简洁的 API 和合理的默认配置
 * 
 * @param options 配置选项
 * @returns I18n 实例
 * 
 * @example
 * ```typescript
 * // 基础用法
 * const i18n = createI18n({
 *   locale: 'zh-CN',
 *   messages: {
 *     'zh-CN': {
 *       hello: '你好',
 *       welcome: '欢迎 {name}'
 *     },
 *     'en': {
 *       hello: 'Hello',
 *       welcome: 'Welcome {name}'
 *     }
 *   }
 * })
 * 
 * // 高级用法
 * const i18n = createI18n({
 *   locale: 'zh-CN',
 *   fallbackLocale: 'en',
 *   messages: {
 *     'zh-CN': chineseMessages,
 *     'en': englishMessages
 *   },
 *   legacy: false,
 *   globalInjection: true,
 *   missingWarn: true,
 *   fallbackWarn: false,
 *   modifiers: {
 *     upper: (str) => str.toUpperCase(),
 *     lower: (str) => str.toLowerCase()
 *   }
 * })
 * ```
 */
export function createI18n(options: CreateI18nOptions): I18nInstance {
  // 转换配置格式
  const i18nOptions: I18nOptions = {
    defaultLocale: options.locale,
    fallbackLocale: options.fallbackLocale || options.locale,
    storage: options.storage || 'localStorage',
    storageKey: options.storageKey || 'i18n-locale',
    autoDetect: options.autoDetect ?? true,
    preload: options.preload || [],
    cache: options.cache || {
      enabled: true,
      maxSize: 1000,
      maxMemory: 50 * 1024 * 1024,
      defaultTTL: 60 * 60 * 1000,
      enableTTL: true,
      cleanupInterval: 5 * 60 * 1000,
      memoryPressureThreshold: 0.8,
    },
    messages: options.messages, // 传递 messages 选项
    onLanguageChanged: options.onLanguageChanged,
    onLoadError: options.onLoadError,
  }

  // 创建 I18n 实例
  const i18n = new I18n(i18nOptions)

  return i18n
}

/**
 * 创建全局 I18n 实例
 * 
 * 创建一个全局共享的 I18n 实例，适用于单页应用
 * 
 * @param options 配置选项
 * @returns 全局 I18n 实例
 * 
 * @example
 * ```typescript
 * const globalI18n = createGlobalI18n({
 *   locale: 'zh-CN',
 *   messages: {
 *     'zh-CN': { hello: '你好' },
 *     'en': { hello: 'Hello' }
 *   }
 * })
 * 
 * // 在应用的任何地方使用
 * console.log(globalI18n.t('hello')) // '你好'
 * ```
 */
export function createGlobalI18n(options: CreateI18nOptions): I18nInstance {
  const i18n = createI18n(options)

  // 将实例设置为全局实例
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__LDESIGN_I18N__ = i18n
  }

  return i18n
}

/**
 * 获取全局 I18n 实例
 * 
 * @returns 全局 I18n 实例或 undefined
 * 
 * @example
 * ```typescript
 * const i18n = getGlobalI18n()
 * if (i18n) {
 *   console.log(i18n.t('hello'))
 * }
 * ```
 */
export function getGlobalI18n(): I18nInstance | undefined {
  if (typeof globalThis !== 'undefined') {
    return (globalThis as any).__LDESIGN_I18N__
  }
  return undefined
}

/**
 * 检查是否存在全局 I18n 实例
 * 
 * @returns 是否存在全局实例
 */
export function hasGlobalI18n(): boolean {
  return getGlobalI18n() !== undefined
}

/**
 * 销毁全局 I18n 实例
 * 
 * @example
 * ```typescript
 * // 在应用卸载时清理全局实例
 * destroyGlobalI18n()
 * ```
 */
export async function destroyGlobalI18n(): Promise<void> {
  const i18n = getGlobalI18n()
  if (i18n) {
    await i18n.destroy()
    if (typeof globalThis !== 'undefined') {
      delete (globalThis as any).__LDESIGN_I18N__
    }
  }
}

/**
 * 创建作用域 I18n 实例
 * 
 * 创建一个具有特定作用域的 I18n 实例，适用于组件级别的国际化
 * 
 * @param scope 作用域名称
 * @param options 配置选项
 * @returns 作用域 I18n 实例
 * 
 * @example
 * ```typescript
 * // 为特定组件创建作用域实例
 * const componentI18n = createScopedI18n('UserProfile', {
 *   locale: 'zh-CN',
 *   messages: {
 *     'zh-CN': {
 *       title: '用户资料',
 *       edit: '编辑'
 *     }
 *   }
 * })
 * ```
 */
export function createScopedI18n(scope: string, options: CreateI18nOptions): I18nInstance {
  const i18n: I18nInstance = new I18n(options)

    // 为实例添加作用域标识
    ; (i18n as any).__scope__ = scope

  return i18n
}

/**
 * 默认导出 createI18n 函数
 */
export default createI18n
