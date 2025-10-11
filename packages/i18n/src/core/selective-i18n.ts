/**
 * 选择性 I18n 创建函数
 *
 * 提供便捷的创建函数，支持语言选择配置和内容扩展
 *
 * @author LDesign Team
 * @version 2.0.0
 */

import type { SelectiveI18nOptions } from './language-config'
import type { I18nInstance, I18nOptions } from './types'
import { BuiltInLoader, type BuiltInLoaderOptions } from './built-in-loader'
import { ExtensionLoader, type ExtensionLoaderOptions, type TranslationExtension } from './extension-loader'
import { I18n } from './i18n'
import { createLanguageRegistry } from './language-config'

/**
 * 选择性 I18n 配置选项
 *
 * 整合语言选择和内容扩展功能的配置接口
 */
export interface ConfigurableI18nOptions extends SelectiveI18nOptions {
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

  // 扩展功能选项
  /** 全局扩展 */
  globalExtensions?: TranslationExtension[]
  /** 语言特定扩展 */
  languageExtensions?: Record<string, TranslationExtension[]>
  /** 扩展加载器选项 */
  extensionOptions?: Omit<ExtensionLoaderOptions, 'baseLoader' | 'globalExtensions' | 'languageExtensions'>

  // 其他 I18n 选项
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage' | 'memory' | 'none'
  /** 存储键名 */
  storageKey?: string
  /** 自动检测语言 */
  autoDetect?: boolean
  /** 预加载语言列表 */
  preload?: string[]
  /** 缓存配置 */
  cache?: any
  /** 自定义加载器 */
  customLoader?: any
  /** 初始化回调 */
  onInit?: () => void
  /** 语言变更回调 */
  onLanguageChanged?: (locale: string) => void
  /** 加载错误回调 */
  onLoadError?: (locale: string, error: Error) => void
}

/**
 * 创建选择性 I18n 实例
 *
 * 支持语言选择配置，只加载启用的语言
 *
 * @param options 配置选项
 * @returns I18n 实例
 *
 * @example
 * ```typescript
 * // 只启用中文和英文
 * const i18n = createSelectiveI18n({
 *   locale: 'zh-CN',
 *   languageConfig: {
 *     enabled: ['zh-CN', 'en']
 *   },
 *   messages: {
 *     'zh-CN': { hello: '你好' },
 *     'en': { hello: 'Hello' }
 *   }
 * })
 *
 * // 使用过滤器启用亚洲语言
 * const i18n = createSelectiveI18n({
 *   locale: 'zh-CN',
 *   languageConfig: {
 *     enabled: {
 *       regions: ['CN', 'JP', 'KR']
 *     }
 *   },
 *   strictMode: true
 * })
 * ```
 */
export function createSelectiveI18n(options: ConfigurableI18nOptions): I18nInstance {
  // 验证必需参数
  if (!options.locale) {
    throw new Error('locale is required')
  }

  // 创建内置加载器配置
  const builtInLoaderOptions: BuiltInLoaderOptions = {
    userMessages: options.messages,
    customLoader: options.customLoader,
    useBuiltIn: true,
    preferBuiltIn: false,
    fallbackToBuiltIn: true,
    languageConfig: options.languageConfig,
    enabledLanguages: options.languageConfig?.enabled,
    strictMode: options.strictMode,
  }

  // 创建语言注册表
  const registry = createLanguageRegistry(options.languageConfig || {
    enabled: [],
    defaultLocale: options.locale,
    fallbackLocale: options.fallbackLocale || options.locale,
  })

  // 创建内置加载器
  const builtInLoader = new BuiltInLoader(builtInLoaderOptions)

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
    customLoader: builtInLoader,
    onLanguageChanged: options.onLanguageChanged,
    onLoadError: options.onLoadError,
  }

  // 创建 I18n 实例
  const i18n = new I18n(i18nOptions)

    // 添加访问内部组件的方法
    ; (i18n as any).getLanguageRegistry = () => registry
  ; (i18n as any).getBuiltInLoader = () => builtInLoader

  // 添加初始化回调支持
  if (options.onInit) {
    const originalInit = i18n.init.bind(i18n)
    i18n.init = async () => {
      await originalInit()
      options.onInit?.()
    }
  }

  return i18n
}

/**
 * 创建可扩展 I18n 实例
 *
 * 支持翻译内容扩展功能
 *
 * @param options 配置选项
 * @returns I18n 实例
 *
 * @example
 * ```typescript
 * // 基础扩展用法
 * const i18n = createExtensibleI18n({
 *   locale: 'zh-CN',
 *   messages: {
 *     'zh-CN': { hello: '你好' },
 *     'en': { hello: 'Hello' }
 *   },
 *   globalExtensions: [{
 *     translations: {
 *       common: { customMessage: '自定义消息' }
 *     }
 *   }]
 * })
 *
 * // 语言特定扩展
 * const i18n = createExtensibleI18n({
 *   locale: 'zh-CN',
 *   languageExtensions: {
 *     'zh-CN': [{
 *       translations: { ui: { customButton: '自定义按钮' } }
 *     }],
 *     'en': [{
 *       translations: { ui: { customButton: 'Custom Button' } }
 *     }]
 *   }
 * })
 * ```
 */
export function createExtensibleI18n(options: ConfigurableI18nOptions): I18nInstance {
  // 验证必需参数
  if (!options.locale) {
    throw new Error('locale is required')
  }

  // 创建内置加载器
  const builtInLoaderOptions: BuiltInLoaderOptions = {
    userMessages: options.messages,
    customLoader: options.customLoader,
    useBuiltIn: true,
    preferBuiltIn: false,
    fallbackToBuiltIn: true,
    languageConfig: options.languageConfig,
    enabledLanguages: options.languageConfig?.enabled,
    strictMode: options.strictMode,
  }

  const builtInLoader = new BuiltInLoader(builtInLoaderOptions)

  // 创建扩展加载器
  const extensionLoaderOptions: ExtensionLoaderOptions = {
    baseLoader: builtInLoader,
    globalExtensions: options.globalExtensions,
    languageExtensions: options.languageExtensions,
    ...options.extensionOptions,
  }

  const extensionLoader = new ExtensionLoader(extensionLoaderOptions)

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
    customLoader: extensionLoader,
    onLanguageChanged: options.onLanguageChanged,
    onLoadError: options.onLoadError,
  }

  // 创建 I18n 实例
  const i18n = new I18n(i18nOptions)

    // 添加访问内部组件的方法
    ; (i18n as any).getExtensionLoader = () => extensionLoader
  ; (i18n as any).getBuiltInLoader = () => builtInLoader

  // 添加初始化回调支持
  if (options.onInit) {
    const originalInit = i18n.init.bind(i18n)
    i18n.init = async () => {
      await originalInit()
      options.onInit?.()
    }
  }

  return i18n
}

/**
 * 创建可配置 I18n 实例
 *
 * 整合语言选择和内容扩展功能
 *
 * @param options 配置选项
 * @returns I18n 实例
 *
 * @example
 * ```typescript
 * // 完整功能配置
 * const i18n = createConfigurableI18n({
 *   locale: 'zh-CN',
 *   languageConfig: {
 *     enabled: ['zh-CN', 'en', 'ja'],
 *     defaultLocale: 'zh-CN',
 *     fallbackLocale: 'en'
 *   },
 *   messages: {
 *     'zh-CN': { hello: '你好' },
 *     'en': { hello: 'Hello' }
 *   },
 *   globalExtensions: [{
 *     translations: {
 *       common: { customMessage: '自定义消息' }
 *     }
 *   }],
 *   languageExtensions: {
 *     'zh-CN': [{
 *       translations: { ui: { customButton: '自定义按钮' } }
 *     }]
 *   },
 *   strictMode: true,
 *   loadingStrategy: 'lazy'
 * })
 * ```
 */
export function createConfigurableI18n(options: ConfigurableI18nOptions): I18nInstance {
  // 验证必需参数
  if (!options.locale) {
    throw new Error('locale is required')
  }

  // 确保总是有语言配置
  const normalizedOptions = {
    ...options,
    languageConfig: options.languageConfig || {
      enabled: [], // 空数组表示启用所有语言
      defaultLocale: options.locale,
      fallbackLocale: options.fallbackLocale || options.locale,
    },
  }

  // 如果有扩展配置，使用扩展加载器
  if (options.globalExtensions || options.languageExtensions) {
    return createExtensibleI18n(normalizedOptions)
  }

  // 使用选择性加载器
  return createSelectiveI18n(normalizedOptions)
}

/**
 * 默认导出可配置创建函数
 */
export default createConfigurableI18n
