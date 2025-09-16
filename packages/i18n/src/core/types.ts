/**
 * 语言信息接口
 *
 * 定义了语言包的基本元信息，包括显示名称、代码、文本方向等
 * 用于在语言切换器和语言管理功能中显示语言信息
 *
 * @example
 * ```typescript
 * const languageInfo: LanguageInfo = {
 *   name: 'English',
 *   nativeName: 'English',
 *   code: 'en',
 *   region: 'US',
 *   direction: 'ltr',
 *   dateFormat: 'MM/DD/YYYY',
 *   flag: '🇺🇸'
 * }
 * ```
 */
export interface LanguageInfo {
  /** 语言显示名称（英文名称，用于国际化显示） */
  name: string
  /** 本地语言名称（该语言的本地称呼） */
  nativeName: string
  /** ISO 639-1 语言代码（如 'en', 'zh-CN', 'ja'） */
  code: string
  /** ISO 3166-1 区域代码（如 'US', 'CN', 'JP'） */
  region?: string
  /** 文本方向（从左到右或从右到左） */
  direction: 'ltr' | 'rtl'
  /** 默认日期格式（用于日期格式化） */
  dateFormat: string
  /** 国旗图标（Unicode 表情符号或图标字符串） */
  flag?: string
}

/**
 * 缓存配置接口
 *
 * 定义了国际化系统的缓存策略和性能优化配置
 * 包括缓存大小限制、TTL 设置、内存管理等
 *
 * @example
 * ```typescript
 * const cacheOptions: CacheOptions = {
 *   enabled: true,
 *   maxSize: 1000,
 *   maxMemory: 50 * 1024 * 1024, // 50MB
 *   defaultTTL: 60 * 60 * 1000,  // 1小时
 *   enableTTL: true,
 *   cleanupInterval: 5 * 60 * 1000, // 5分钟
 *   memoryPressureThreshold: 0.8
 * }
 * ```
 */
export interface CacheOptions {
  /** 是否启用缓存功能 */
  enabled: boolean
  /** 最大缓存条目数（超出时使用 LRU 策略清理） */
  maxSize: number
  /** 最大内存使用量（字节，用于内存压力检测） */
  maxMemory?: number
  /** 默认生存时间（毫秒，缓存项的有效期） */
  defaultTTL?: number
  /** 是否启用 TTL 功能（时间到期自动清理） */
  enableTTL?: boolean
  /** 清理间隔（毫秒，定期清理过期缓存的间隔） */
  cleanupInterval?: number
  /** 内存压力阈值（0-1，超出时触发主动清理） */
  memoryPressureThreshold?: number
}

/**
 * 存储类型枚举
 *
 * 定义了语言偏好设置的存储方式
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'none' | 'memory'

/**
 * 语言切换回调函数类型
 *
 * @param locale 新的语言代码
 */
export type LanguageChangedCallback = (locale: string) => void

/**
 * 加载错误回调函数类型
 *
 * @param locale 加载失败的语言代码
 * @param error 错误对象
 */
export type LoadErrorCallback = (locale: string, error: Error) => void

/**
 * I18n 配置选项接口
 *
 * 定义了国际化系统的完整配置选项
 * 包括默认语言、存储策略、缓存配置、事件回调等
 *
 * @example
 * ```typescript
 * const i18nOptions: I18nOptions = {
 *   defaultLocale: 'zh-CN',
 *   fallbackLocale: 'en',
 *   storage: 'localStorage',
 *   storageKey: 'app-locale',
 *   autoDetect: true,
 *   preload: ['en', 'zh-CN'],
 *   cache: { enabled: true, maxSize: 1000 },
 *   onLanguageChanged: (locale) => console.log('语言已切换到:', locale),
 *   onLoadError: (locale, error) => console.error('语言加载失败:', locale, error)
 * }
 * ```
 */
export interface I18nOptions {
  /** 默认语言代码（系统启动时使用的语言） */
  defaultLocale?: string
  /** 降级语言代码（翻译缺失时的备用语言） */
  fallbackLocale?: string
  /** 存储方式（语言偏好设置的持久化方式） */
  storage?: StorageType
  /** 存储键名（在 localStorage/sessionStorage 中使用的键名） */
  storageKey?: string
  /** 是否自动检测浏览器语言（根据 navigator.language 自动设置） */
  autoDetect?: boolean
  /** 预加载的语言列表（系统启动时预先加载的语言包） */
  preload?: readonly string[]
  /** 缓存配置（翻译结果的缓存策略） */
  cache?: Partial<CacheOptions>
  /** 静态语言包数据（直接提供翻译数据，无需加载器） */
  messages?: Record<string, Record<string, any>>
  /** 自定义加载器（用于从外部源加载语言包） */
  customLoader?: Loader
  /** 语言切换回调函数（语言切换成功时触发） */
  onLanguageChanged?: LanguageChangedCallback
  /** 加载错误回调函数（语言包加载失败时触发） */
  onLoadError?: LoadErrorCallback
}

/**
 * 基础数据类型
 *
 * 定义了翻译参数中允许的基础数据类型
 */
export type PrimitiveValue = string | number | boolean | null | undefined

/**
 * 翻译参数值类型
 *
 * 支持基础类型和嵌套对象，用于字符串插值和复数处理
 */
export type TranslationParamValue = PrimitiveValue | Record<string, unknown>

/**
 * 翻译参数类型
 *
 * 定义了传递给翻译函数的参数对象结构
 * 支持字符串插值、复数处理、条件翻译等功能
 *
 * @example
 * ```typescript
 * const params: TranslationParams = {
 *   name: 'John',
 *   count: 5,
 *   isActive: true,
 *   user: { id: 1, role: 'admin' }
 * }
 * ```
 */
export type TranslationParams = Record<string, TranslationParamValue>

/**
 * 嵌套对象值类型
 *
 * 定义了翻译内容中允许的值类型
 */
export type NestedObjectValue =
  | string
  | NestedObject
  | readonly string[]
  | number
  | boolean
  | null
  | undefined

/**
 * 嵌套对象类型
 *
 * 定义了翻译内容的层级结构，支持深度嵌套的键值对
 * 用于组织和存储多层级的翻译内容
 *
 * @example
 * ```typescript
 * const translations: NestedObject = {
 *   common: {
 *     ok: '确定',
 *     cancel: '取消',
 *     actions: ['保存', '删除', '编辑']
 *   },
 *   user: {
 *     profile: {
 *       name: '姓名',
 *       email: '邮箱'
 *     }
 *   }
 * }
 * ```
 */
export interface NestedObject {
  readonly [key: string]: NestedObjectValue
}

/**
 * 语言包类型
 *
 * 定义了完整语言包的结构，包含语言元信息和翻译内容
 * 每个语言包都必须包含这两个部分才能正常工作
 *
 * @example
 * ```typescript
 * const languagePackage: LanguagePackage = {
 *   info: {
 *     name: 'Chinese Simplified',
 *     nativeName: '中文简体',
 *     code: 'zh-CN',
 *     direction: 'ltr',
 *     dateFormat: 'YYYY年M月D日'
 *   },
 *   translations: {
 *     common: {
 *       ok: '确定',
 *       cancel: '取消'
 *     }
 *   }
 * }
 * ```
 */
export interface LanguagePackage {
  /** 语言信息（包含语言的元数据和显示信息） */
  readonly info: LanguageInfo
  /** 翻译内容（该语言的所有翻译键值对） */
  readonly translations: NestedObject
}

/**
 * 加载器接口
 *
 * 定义了语言包加载器的标准接口
 * 负责从各种来源（静态文件、API、内存等）加载语言包
 *
 * @example
 * ```typescript
 * class CustomLoader implements Loader {
 *   async load(locale: string): Promise<LanguagePackage> {
 *     const response = await fetch(`/api/i18n/${locale}`)
 *     return response.json()
 *   }
 *
 *   async preload(locale: string): Promise<void> {
 *     await this.load(locale)
 *   }
 *
 *   isLoaded(locale: string): boolean {
 *     return this.loadedPackages.has(locale)
 *   }
 * }
 * ```
 */
export interface Loader {
  /**
   * 加载语言包
   * @param locale 语言代码
   * @returns 语言包数据的 Promise
   */
  load(locale: string): Promise<LanguagePackage>

  /**
   * 预加载语言包（不切换当前语言）
   * @param locale 语言代码
   * @returns 预加载完成的 Promise
   */
  preload(locale: string): Promise<void>

  /**
   * 检查语言包是否已加载
   * @param locale 语言代码
   * @returns 是否已加载
   */
  isLoaded(locale: string): boolean

  /**
   * 获取已加载的语言包（可选方法）
   * @param locale 语言代码
   * @returns 语言包数据或 undefined
   */
  getLoadedPackage?(locale: string): LanguagePackage | undefined
}

/**
 * 存储接口
 *
 * 定义了语言偏好设置的持久化存储接口
 * 支持多种存储方式：localStorage、sessionStorage、内存存储等
 *
 * @example
 * ```typescript
 * class LocalStorageImpl implements Storage {
 *   constructor(private key: string) {}
 *
 *   getLanguage(): string | null {
 *     return localStorage.getItem(this.key)
 *   }
 *
 *   setLanguage(locale: string): void {
 *     localStorage.setItem(this.key, locale)
 *   }
 *
 *   clearLanguage(): void {
 *     localStorage.removeItem(this.key)
 *   }
 * }
 * ```
 */
export interface Storage {
  /**
   * 获取存储的语言代码
   * @returns 语言代码或 null（如果未设置）
   */
  getLanguage(): string | null

  /**
   * 设置存储的语言代码
   * @param locale 语言代码
   */
  setLanguage(locale: string): void

  /**
   * 清除存储的语言代码
   */
  clearLanguage(): void
}

/**
 * 语言检测器接口
 *
 * 定义了浏览器语言自动检测的接口
 * 用于根据用户的浏览器设置自动选择合适的语言
 *
 * @example
 * ```typescript
 * class BrowserDetector implements Detector {
 *   detect(): string[] {
 *     const languages = navigator.languages || [navigator.language]
 *     return languages.map(lang => lang.toLowerCase())
 *   }
 * }
 * ```
 */
export interface Detector {
  /**
   * 检测浏览器支持的语言列表
   * @returns 语言代码数组（按优先级排序）
   */
  detect(): readonly string[]
}

/**
 * 复数规则函数类型
 *
 * 定义了复数形式计算的函数签名
 * 根据数量返回对应的复数类别索引
 *
 * @param count 数量
 * @returns 复数类别索引（0: zero, 1: one, 2: two, 3: few, 4: many, 5: other）
 */
export type PluralRule = (count: number) => number

/**
 * 复数规则映射
 *
 * 定义了不同语言的复数规则映射表
 * 键为语言代码，值为对应的复数规则函数
 */
export interface PluralRules {
  readonly [locale: string]: PluralRule
}

/**
 * 插值选项接口
 *
 * 定义了字符串插值的配置选项
 * 用于控制插值的格式和安全性
 *
 * @example
 * ```typescript
 * const options: InterpolationOptions = {
 *   prefix: '{{',
 *   suffix: '}}',
 *   escapeValue: true
 * }
 * ```
 */
export interface InterpolationOptions {
  /** 插值前缀（默认为 '{{'） */
  prefix?: string
  /** 插值后缀（默认为 '}}'） */
  suffix?: string
  /** 是否转义 HTML 特殊字符（防止 XSS 攻击） */
  escapeValue?: boolean
}

/**
 * 翻译选项接口
 *
 * 定义了翻译函数的完整配置选项
 * 继承插值选项，并添加翻译特有的配置
 *
 * @example
 * ```typescript
 * const options: TranslationOptions = {
 *   defaultValue: '翻译缺失',
 *   count: 5,
 *   context: 'formal',
 *   escapeValue: true
 * }
 * ```
 */
export interface TranslationOptions extends InterpolationOptions {
  /** 默认值（当翻译键不存在时返回的值） */
  defaultValue?: string
  /** 计数（用于复数形式处理） */
  count?: number
  /** 上下文（用于条件翻译和语境区分） */
  context?: string
}

/**
 * 缓存项接口
 *
 * 定义了缓存系统中单个缓存项的结构
 * 包含缓存值、时间戳和访问统计信息
 *
 * @template T 缓存值的类型
 *
 * @example
 * ```typescript
 * const cacheItem: CacheItem<string> = {
 *   value: '翻译结果',
 *   timestamp: Date.now(),
 *   accessCount: 5
 * }
 * ```
 */
export interface CacheItem<T = string> {
  /** 缓存的值 */
  readonly value: T
  /** 创建时间戳（毫秒） */
  readonly timestamp: number
  /** 访问次数（用于 LRU 算法） */
  accessCount: number
}

/**
 * 缓存统计信息接口
 *
 * 定义了缓存系统的性能统计数据
 */
export interface CacheStats {
  /** 缓存项总数 */
  readonly size: number
  /** 缓存命中次数 */
  readonly hits: number
  /** 缓存未命中次数 */
  readonly misses: number
  /** 缓存命中率（0-1） */
  readonly hitRate: number
  /** 内存使用百分比（0-1） */
  readonly memoryUsagePercent: number
}

/**
 * LRU 缓存接口
 *
 * 定义了 LRU（最近最少使用）缓存的标准接口
 * 提供高性能的缓存操作和自动清理机制
 *
 * @template T 缓存值的类型
 *
 * @example
 * ```typescript
 * const cache: LRUCache<string> = new LRUCacheImpl({
 *   maxSize: 1000,
 *   enableTTL: true,
 *   defaultTTL: 60000
 * })
 *
 * cache.set('key1', 'value1')
 * const value = cache.get('key1') // 'value1'
 * ```
 */
export interface LRUCache<T = string> {
  /**
   * 获取缓存项
   * @param key 缓存键
   * @returns 缓存值或 undefined
   */
  get(key: string): T | undefined

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   */
  set(key: string, value: T): void

  /**
   * 删除缓存项
   * @param key 缓存键
   * @returns 是否删除成功
   */
  delete(key: string): boolean

  /**
   * 清空所有缓存
   */
  clear(): void

  /**
   * 获取缓存项数量
   * @returns 缓存项总数
   */
  size(): number

  /**
   * 获取缓存统计信息
   * @returns 缓存统计数据
   */
  getStats?(): CacheStats
}

/**
 * 事件类型枚举
 *
 * 定义了国际化系统支持的所有事件类型
 */
export type I18nEventType =
  | 'languageChanged'  // 语言切换事件
  | 'loaded'           // 语言包加载完成事件
  | 'loadError'        // 语言包加载失败事件
  | 'translationMissing' // 翻译缺失事件
  | 'cacheCleared'     // 缓存清理事件

/**
 * 语言切换事件参数
 */
export interface LanguageChangedEventArgs {
  /** 新的语言代码 */
  readonly newLocale: string
  /** 之前的语言代码 */
  readonly previousLocale: string
}

/**
 * 语言包加载事件参数
 */
export interface LoadedEventArgs {
  /** 加载的语言代码 */
  readonly locale: string
  /** 语言包数据 */
  readonly package: LanguagePackage
}

/**
 * 加载错误事件参数
 */
export interface LoadErrorEventArgs {
  /** 加载失败的语言代码 */
  readonly locale: string
  /** 错误对象 */
  readonly error: Error
}

/**
 * 翻译缺失事件参数
 */
export interface TranslationMissingEventArgs {
  /** 缺失的翻译键 */
  readonly key: string
  /** 当前语言代码 */
  readonly locale: string
  /** 降级语言代码 */
  readonly fallbackLocale?: string
}

/**
 * 事件参数映射
 */
export interface I18nEventArgsMap {
  languageChanged: LanguageChangedEventArgs
  loaded: LoadedEventArgs
  loadError: LoadErrorEventArgs
  translationMissing: TranslationMissingEventArgs
  cacheCleared: Record<string, never>
}

/**
 * 类型安全的事件监听器
 *
 * @template T 事件类型
 */
export type I18nEventListener<T extends I18nEventType = I18nEventType> =
  (args: I18nEventArgsMap[T]) => void

/**
 * 事件发射器接口
 *
 * 定义了类型安全的事件系统接口
 * 支持强类型的事件监听和触发
 *
 * @example
 * ```typescript
 * const emitter: EventEmitter = new EventEmitterImpl()
 *
 * emitter.on('languageChanged', ({ newLocale, previousLocale }) => {
 *   console.log(`语言从 ${previousLocale} 切换到 ${newLocale}`)
 * })
 *
 * emitter.emit('languageChanged', {
 *   newLocale: 'zh-CN',
 *   previousLocale: 'en'
 * })
 * ```
 */
export interface EventEmitter {
  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on<T extends I18nEventType>(event: T, listener: I18nEventListener<T>): void

  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off<T extends I18nEventType>(event: T, listener: I18nEventListener<T>): void

  /**
   * 触发事件
   * @param event 事件类型
   * @param args 事件参数
   */
  emit<T extends I18nEventType>(event: T, args: I18nEventArgsMap[T]): void
}

/**
 * 翻译函数类型
 *
 * 定义了翻译函数的标准签名，支持泛型返回类型
 *
 * @template T 返回值类型（默认为 string）
 * @param key 翻译键
 * @param params 插值参数
 * @param options 翻译选项
 * @returns 翻译结果
 *
 * @example
 * ```typescript
 * const t: TranslationFunction = (key, params, options) => {
 *   // 翻译逻辑
 *   return '翻译结果'
 * }
 *
 * // 使用示例
 * const message = t('welcome.message', { name: 'John' })
 * const count = t<number>('items.count', { count: 5 })
 * ```
 */
export type TranslationFunction = <T = string>(
  key: string,
  params?: TranslationParams,
  options?: TranslationOptions
) => T

/**
 * 批量翻译结果接口
 *
 * 定义了批量翻译操作的返回结果结构
 * 包含翻译结果、统计信息和失败详情
 *
 * @example
 * ```typescript
 * const result: BatchTranslationResult = {
 *   translations: {
 *     'common.ok': '确定',
 *     'common.cancel': '取消'
 *   },
 *   successCount: 2,
 *   failureCount: 0,
 *   failedKeys: []
 * }
 * ```
 */
export interface BatchTranslationResult {
  /** 翻译结果映射（键名到翻译结果的映射） */
  readonly translations: Record<string, string>
  /** 成功翻译的键数量 */
  readonly successCount: number
  /** 失败翻译的键数量 */
  readonly failureCount: number
  /** 失败的键列表（用于错误处理和调试） */
  readonly failedKeys: readonly string[]
}

/**
 * 性能指标接口
 *
 * 定义了国际化系统的性能监控数据结构
 */
export interface PerformanceMetrics {
  /** 翻译操作总数 */
  readonly translationCount: number
  /** 平均翻译时间（毫秒） */
  readonly averageTranslationTime: number
  /** 缓存命中率（0-1） */
  readonly cacheHitRate: number
  /** 内存使用量（字节） */
  readonly memoryUsage: number
  /** 语言切换次数 */
  readonly languageChangeCount: number
  /** 最慢的翻译操作列表 */
  readonly slowTranslations: ReadonlyArray<{
    readonly key: string
    readonly time: number
    readonly timestamp: number
  }>
}

/**
 * 优化建议类型
 *
 * 定义了性能优化建议的结构
 */
export interface OptimizationSuggestion {
  /** 建议类型 */
  readonly type: 'cache' | 'preload' | 'memory' | 'performance'
  /** 建议标题 */
  readonly title: string
  /** 建议描述 */
  readonly description: string
  /** 优先级（1-5，5为最高） */
  readonly priority: 1 | 2 | 3 | 4 | 5
}

/**
 * I18n 实例接口
 *
 * 定义了国际化系统的完整 API 接口
 * 包含翻译、语言管理、性能监控等所有功能
 *
 * @example
 * ```typescript
 * const i18n: I18nInstance = await createI18n({
 *   defaultLocale: 'zh-CN',
 *   fallbackLocale: 'en'
 * })
 *
 * await i18n.init()
 * const message = i18n.t('welcome.message', { name: 'John' })
 * await i18n.changeLanguage('en')
 * ```
 */
export interface I18nInstance extends EventEmitter {
  /**
   * 同步初始化国际化系统（基础功能）
   *
   * 提供基础的同步初始化，确保翻译功能立即可用
   * 主要用于解决组件渲染时 i18n 还未准备好的问题
   */
  initSync?(): void

  /**
   * 异步初始化国际化系统（完整功能）
   * @returns 初始化完成的 Promise
   */
  init(): Promise<void>

  /**
   * 切换当前语言
   * @param locale 目标语言代码
   * @returns 切换完成的 Promise
   */
  changeLanguage(locale: string): Promise<void>

  /** 翻译函数（核心功能） */
  readonly t: TranslationFunction

  /**
   * 批量翻译多个键
   * @param keys 翻译键数组
   * @param params 公共插值参数
   * @returns 批量翻译结果
   */
  batchTranslate(
    keys: readonly string[],
    params?: TranslationParams
  ): BatchTranslationResult

  /**
   * 获取可用语言列表
   * @returns 语言信息数组
   */
  getAvailableLanguages(): readonly LanguageInfo[]

  /**
   * 获取当前语言代码
   * @returns 当前语言代码
   */
  getCurrentLanguage(): string

  /**
   * 获取当前语言信息
   * @returns 当前语言信息或 undefined
   */
  getCurrentLanguageInfo(): LanguageInfo | undefined

  /**
   * 预加载指定语言
   * @param locale 语言代码
   * @returns 预加载完成的 Promise
   */
  preloadLanguage(locale: string): Promise<void>

  /**
   * 检查语言是否已加载
   * @param locale 语言代码
   * @returns 是否已加载
   */
  isLanguageLoaded(locale: string): boolean

  /**
   * 检查翻译键是否存在
   * @param key 翻译键
   * @param locale 语言代码（可选，默认为当前语言）
   * @returns 是否存在
   */
  exists(key: string, locale?: string): boolean

  /**
   * 获取所有翻译键
   * @param locale 语言代码（可选，默认为当前语言）
   * @returns 翻译键数组
   */
  getKeys(locale?: string): readonly string[]

  /**
   * 检查是否已初始化
   * @returns 是否已初始化
   */
  isReady(): boolean

  /**
   * 销毁实例并清理资源
   * @returns 销毁完成的 Promise
   */
  destroy(): Promise<void>

  /** 加载器实例（内部使用，可选） */
  readonly loader?: Loader

  /**
   * 获取性能指标
   * @returns 性能指标数据
   */
  getPerformanceMetrics?(): PerformanceMetrics

  /**
   * 生成性能报告
   * @returns 性能报告字符串
   */
  generatePerformanceReport?(): string

  /**
   * 获取优化建议
   * @returns 优化建议数组
   */
  getOptimizationSuggestions?(): readonly OptimizationSuggestion[]

  /**
   * 预热缓存
   * @param keys 要预热的翻译键数组
   */
  warmUpCache?(keys: readonly string[]): void

  /**
   * 清理缓存
   */
  cleanupCache?(): void
}

// 注意：Vue 集成相关的类型定义已移除，专注于核心功能
