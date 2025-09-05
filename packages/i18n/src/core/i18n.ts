// 全局声明 process 变量
declare const process: any

import type {
  BatchTranslationResult,
  CacheOptions,
  CacheStats,
  Detector,
  I18nEventType,
  I18nInstance,
  I18nOptions,
  LanguageChangedEventArgs,
  LanguageInfo,
  LanguagePackage,
  LoadErrorEventArgs,
  LoadedEventArgs,
  Loader,
  LRUCache,
  NestedObject,
  OptimizationSuggestion,
  PerformanceMetrics,
  Storage,
  StorageType,
  TranslationOptions,
  TranslationParams,
  TranslationMissingEventArgs,
} from './types'
import { hasInterpolation, interpolate } from '../utils/interpolation'
import { getNestedValue } from '../utils/path'

import {
  hasPluralExpression,
  processPluralization,
} from '../utils/pluralization'
import { createDetector } from './detector'
import {
  ErrorManager,
  handleErrors,
  InitializationError,
  LanguageLoadError,
} from './errors'
import { TranslationCache } from './cache'
import { PluralizationEngine, PluralCategory, PluralUtils } from './pluralization'
import { FormatterEngine } from './formatters'
import { DefaultLoader, StaticLoader } from './loader'
import { PerformanceManager } from './performance'
import { I18nCoreManager, ManagerRegistry } from './registry'
import { createStorage, LRUCacheImpl } from './storage'

/**
 * 默认配置选项
 *
 * 定义了国际化系统的默认配置值
 * 这些配置在创建 I18n 实例时会被使用，用户可以通过传入自定义选项来覆盖
 *
 * @example
 * ```typescript
 * // 使用默认配置
 * const i18n = new I18n()
 *
 * // 覆盖部分配置
 * const i18n = new I18n({
 *   defaultLocale: 'zh-CN',
 *   cache: { maxSize: 2000 }
 * })
 * ```
 */
const DEFAULT_OPTIONS: Required<
  Omit<I18nOptions, 'onLanguageChanged' | 'onLoadError' | 'messages' | 'customLoader'>
> = {
  /** 默认语言代码 */
  defaultLocale: 'en',
  /** 降级语言代码（翻译缺失时使用） */
  fallbackLocale: 'en',
  /** 存储方式（语言偏好设置的持久化） */
  storage: 'localStorage' as StorageType,
  /** 存储键名（在 localStorage 中使用的键） */
  storageKey: 'i18n-locale',
  /** 是否自动检测浏览器语言 */
  autoDetect: true,
  /** 预加载的语言列表 */
  preload: [],
  /** 缓存配置 */
  cache: {
    /** 启用缓存功能 */
    enabled: true,
    /** 最大缓存条目数 */
    maxSize: 1000,
    /** 最大内存使用量（50MB） */
    maxMemory: 50 * 1024 * 1024,
    /** 默认生存时间（1小时） */
    defaultTTL: 60 * 60 * 1000,
    /** 启用 TTL 功能 */
    enableTTL: true,
    /** 清理间隔（5分钟） */
    cleanupInterval: 5 * 60 * 1000,
    /** 内存压力阈值 */
    memoryPressureThreshold: 0.8,
  },
}

/**
 * 语言包缓存类型
 *
 * 用于缓存已加载的语言包数据，避免重复查找
 */
type LanguagePackageCache = WeakMap<Loader, Map<string, LanguagePackage>>

/**
 * I18n 主类实现
 *
 * 这是国际化系统的核心实现类，提供完整的多语言支持功能
 * 包括翻译、缓存、性能监控、事件系统等核心特性
 *
 * 主要特性：
 * - 🌍 多语言翻译支持
 * - 🚀 高性能缓存机制
 * - 📊 性能监控和优化
 * - 🎯 事件驱动架构
 * - 🔧 可扩展的插件系统
 * - 💾 多种存储方式支持
 * - 🔍 智能语言检测
 * - 🛡️ 类型安全保障
 *
 * @example
 * ```typescript
 * // 创建 I18n 实例
 * const i18n = new I18n({
 *   defaultLocale: 'zh-CN',
 *   fallbackLocale: 'en',
 *   cache: { enabled: true, maxSize: 1000 }
 * })
 *
 * // 初始化
 * await i18n.init()
 *
 * // 翻译文本
 * const message = i18n.t('welcome.message', { name: 'John' })
 *
 * // 切换语言
 * await i18n.changeLanguage('en')
 * ```
 */
export class I18n implements I18nInstance {
  /**
   * 配置选项（合并了默认配置和用户配置）
   */
  private options: I18nOptions & {
    defaultLocale: string
    fallbackLocale: string
    storage: StorageType
    storageKey: string
    autoDetect: boolean
    preload: readonly string[]
    cache: Partial<CacheOptions>
  }

  /**
   * 当前语言代码
   */
  private currentLocale: string

  // ==================== 懒加载的核心组件 ====================

  /** 语言包加载器（懒加载） */
  private _loader?: Loader
  /** 存储管理器（懒加载） */
  private _storage?: Storage
  /** 语言检测器（懒加载） */
  private _detector?: Detector
  /** LRU 缓存（懒加载） */
  private _cache?: LRUCache<string>
  /** 性能管理器（懒加载） */
  private _performanceManager?: PerformanceManager
  /** 错误管理器（懒加载） */
  private _errorManager?: ErrorManager
  /** 管理器注册表（懒加载） */
  private _registry?: ManagerRegistry
  /** 核心管理器（懒加载） */
  private _coreManager?: I18nCoreManager

  // ==================== 增强功能组件 ====================

  /** 翻译缓存（懒加载） */
  private _translationCache?: TranslationCache
  /** 复数处理引擎（懒加载） */
  private _pluralizationEngine?: PluralizationEngine
  /** 格式化引擎（懒加载） */
  private _formatterEngine?: FormatterEngine

  // ==================== 事件系统 ====================

  /**
   * 事件监听器映射表
   * 使用 Map 存储不同事件类型的监听器集合
   */
  private readonly eventListeners = new Map<I18nEventType, Set<(args: any) => void>>()

  /**
   * 初始化状态标志
   */
  private isInitialized = false

  /**
   * 缓存的可用语言列表
   */
  private cachedAvailableLanguages?: LanguageInfo[]

  // ==================== 性能优化 ====================

  /**
   * 空参数对象（对象池模式，减少对象创建开销）
   * 使用 Object.freeze 确保不可变性
   */
  private readonly emptyParams: TranslationParams = Object.freeze({})

  /**
   * 空选项对象（对象池模式，减少对象创建开销）
   * 使用 Object.freeze 确保不可变性
   */
  private readonly emptyOptions: TranslationOptions = Object.freeze({})

  /**
   * 语言包缓存（避免重复查找）
   * 使用 WeakMap 确保内存安全，当 Loader 被垃圾回收时，缓存也会被清理
   */
  private packageCache: LanguagePackageCache = new WeakMap<Loader, Map<string, LanguagePackage>>()

  // ==================== 懒加载的 Getter/Setter 方法 ====================

  /**
   * 获取语言包加载器
   *
   * 使用懒加载模式，只在首次访问时创建实例
   * 默认使用 DefaultLoader，可通过 setter 替换为自定义加载器
   *
   * @returns 语言包加载器实例
   */
  public get loader(): Loader {
    if (!this._loader) {
      this._loader = new DefaultLoader()
    }
    return this._loader
  }

  /**
   * 设置语言包加载器
   *
   * 允许用户替换默认的加载器实现
   *
   * @param value 新的加载器实例
   */
  public set loader(value: Loader) {
    this._loader = value
  }

  /**
   * 获取存储管理器
   *
   * 根据配置创建相应的存储实现（localStorage、sessionStorage、内存存储等）
   *
   * @returns 存储管理器实例
   */
  private get storage(): Storage {
    if (!this._storage) {
      this._storage = createStorage(this.options.storage, this.options.storageKey)
    }
    return this._storage
  }

  /**
   * 设置存储管理器
   *
   * @param value 新的存储管理器实例
   */
  private set storage(value: Storage) {
    this._storage = value
  }

  /**
   * 获取语言检测器
   *
   * 用于自动检测用户的首选语言
   * 默认使用浏览器语言检测器
   *
   * @returns 语言检测器实例
   */
  private get detector(): Detector {
    if (!this._detector) {
      this._detector = createDetector('browser')
    }
    return this._detector
  }

  /**
   * 设置语言检测器
   *
   * @param value 新的语言检测器实例
   */
  private set detector(value: Detector) {
    this._detector = value
  }

  /**
   * 获取 LRU 缓存实例
   *
   * 根据配置创建 LRU 缓存，用于缓存翻译结果以提高性能
   *
   * @returns LRU 缓存实例
   */
  private get cache(): LRUCache<string> {
    if (!this._cache) {
      this._cache = new LRUCacheImpl({
        maxSize: this.options.cache.maxSize,
        enableTTL: this.options.cache.enableTTL,
        defaultTTL: this.options.cache.defaultTTL,
        cleanupInterval: this.options.cache.cleanupInterval,
      })
    }
    return this._cache
  }

  /**
   * 获取性能管理器
   *
   * 根据环境自动启用或禁用性能监控
   * 开发环境默认启用，生产环境可通过配置控制
   *
   * @returns 性能管理器实例
   */
  private get performanceManager(): PerformanceManager {
    if (!this._performanceManager) {
      this._performanceManager = new PerformanceManager({
        enabled: this.isDevelopmentEnvironment(),
      })
    }
    return this._performanceManager
  }

  /**
   * 检查是否为开发环境
   *
   * 通过多种方式检测当前运行环境：
   * 1. 浏览器环境：检查 hostname 是否为本地地址
   * 2. Node.js 环境：检查 NODE_ENV 环境变量
   * 3. 默认：启用开发模式（更安全的默认值）
   *
   * @returns 是否为开发环境
   */
  private isDevelopmentEnvironment(): boolean {
    // 浏览器环境检查
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost'
        || window.location.hostname === '127.0.0.1'
        || window.location.hostname.includes('dev')
        || window.location.hostname.includes('test')
    }

    // Node.js 环境检查
    if (typeof process !== 'undefined' && (process as any)?.env) {
      return (process as any).env.NODE_ENV !== 'production'
    }

    // 默认开启开发模式（更安全的默认值）
    return true
  }

  /**
   * 获取错误管理器
   *
   * 用于统一处理和记录系统中的各种错误
   *
   * @returns 错误管理器实例
   */
  private get errorManager(): ErrorManager {
    if (!this._errorManager) {
      this._errorManager = new ErrorManager()
    }
    return this._errorManager
  }

  /**
   * 获取管理器注册表
   *
   * 用于管理系统中的各种管理器组件
   * 提供统一的生命周期管理
   *
   * @returns 管理器注册表实例
   */
  private get registry(): ManagerRegistry {
    if (!this._registry) {
      this._registry = new ManagerRegistry()
    }
    return this._registry
  }

  /**
   * 获取核心管理器
   *
   * 整合所有核心组件，提供统一的管理接口
   * 自动注册到管理器注册表中
   *
   * @returns 核心管理器实例
   */
  private get coreManager(): I18nCoreManager {
    if (!this._coreManager) {
      this._coreManager = new I18nCoreManager(
        this.loader,
        this.storage,
        this.detector,
        this.cache,
        this.performanceManager,
        this.errorManager,
      )
      // 注册核心管理器到注册表
      this.registry.registerManager(this._coreManager)
    }
    return this._coreManager
  }

  /**
   * 获取翻译缓存
   *
   * 专门用于缓存翻译结果的高级缓存系统
   * 支持 LRU 策略和 TTL 过期机制
   *
   * @returns 翻译缓存实例
   */
  private get translationCache(): TranslationCache {
    if (!this._translationCache) {
      this._translationCache = new TranslationCache({
        maxSize: this.options.cache.maxSize,
        ttl: this.options.cache.defaultTTL,
        enableLRU: true,
        strategy: 'lru',
      })
    }
    return this._translationCache
  }

  /**
   * 获取复数处理引擎
   *
   * 用于处理不同语言的复数形式规则
   * 支持 ICU 标准的复数规则
   *
   * @returns 复数处理引擎实例
   */
  private get pluralizationEngine(): PluralizationEngine {
    if (!this._pluralizationEngine) {
      this._pluralizationEngine = new PluralizationEngine()
    }
    return this._pluralizationEngine
  }

  /**
   * 获取格式化引擎
   *
   * 用于格式化日期、数字、货币等本地化内容
   * 基于 Intl API 提供标准化的格式化功能
   *
   * @returns 格式化引擎实例
   */
  private get formatterEngine(): FormatterEngine {
    if (!this._formatterEngine) {
      this._formatterEngine = new FormatterEngine({
        defaultLocale: this.options.defaultLocale,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: 'USD',
      })
    }
    return this._formatterEngine
  }

  // ==================== 构造函数 ====================

  /**
   * 创建 I18n 实例
   *
   * @param options 配置选项（可选）
   *
   * @example
   * ```typescript
   * // 使用默认配置
   * const i18n = new I18n()
   *
   * // 自定义配置
   * const i18n = new I18n({
   *   defaultLocale: 'zh-CN',
   *   fallbackLocale: 'en',
   *   storage: 'sessionStorage',
   *   cache: { maxSize: 2000 },
   *   onLanguageChanged: (locale) => console.log('语言已切换到:', locale)
   * })
   * ```
   */
  constructor(options: I18nOptions = {}) {
    // 合并默认配置和用户配置
    this.options = { ...DEFAULT_OPTIONS, ...options }

    // 设置初始语言
    this.currentLocale = this.options.defaultLocale

    // 如果提供了静态消息数据，创建静态加载器
    if (options.messages) {
      this._loader = new StaticLoader()
      // 将 messages 转换为 LanguagePackage 格式并注册
      for (const [locale, translations] of Object.entries(options.messages)) {
        const packageData: LanguagePackage = {
          info: {
            name: locale === 'zh-CN' ? '中文' : locale === 'en' ? 'English' : locale,
            nativeName: locale === 'zh-CN' ? '中文' : locale === 'en' ? 'English' : locale,
            code: locale,
            direction: 'ltr',
            dateFormat: 'YYYY-MM-DD'
          },
          translations
        }
          ; (this._loader as StaticLoader).registerPackage(locale, packageData)
      }
    } else if (options.customLoader) {
      this._loader = options.customLoader
    }

    // 绑定翻译函数的 this 上下文，确保在作为回调函数使用时 this 指向正确
    this.t = this.t.bind(this)
  }

  // ==================== 核心方法 ====================

  /**
   * 初始化 I18n 实例
   *
   * 执行以下初始化步骤：
   * 1. 初始化所有管理器组件
   * 2. 确定初始语言（存储 > 自动检测 > 默认语言）
   * 3. 预加载指定的语言包
   * 4. 切换到初始语言
   *
   * @returns 初始化完成的 Promise
   *
   * @throws {InitializationError} 初始化失败时抛出
   *
   * @example
   * ```typescript
   * const i18n = new I18n({ defaultLocale: 'zh-CN' })
   * await i18n.init()
   * console.log('国际化系统初始化完成')
   * ```
   */
  async init(): Promise<void> {
    // 防止重复初始化
    if (this.isInitialized) {
      return
    }

    try {
      // 1. 初始化管理器注册表
      await this.registry.initializeAll()

      // 2. 确定初始语言
      let initialLocale = this.options.defaultLocale

      // 2.1 从存储中获取已保存的语言偏好
      if (this.options.storage !== 'none') {
        const storedLocale = this.storage.getLanguage()
        if (storedLocale) {
          initialLocale = storedLocale
        }
      }

      // 2.2 自动检测浏览器语言（仅在没有存储的语言时）
      if (this.options.autoDetect && !this.storage.getLanguage()) {
        const detectedLanguages = this.detector.detect()

        // 兼容同步/异步的 getAvailableLocales 实现
        let availableLocales: string[] = []
        try {
          const localesResult = (this.loader as any)?.getAvailableLocales?.()
          if (localesResult instanceof Promise) {
            availableLocales = await localesResult
          } else if (Array.isArray(localesResult)) {
            availableLocales = localesResult
          }
        } catch (e) {
          // 忽略，保持空数组
        }

        // 遍历检测到的语言，找到第一个可用的
        for (const detected of detectedLanguages) {
          // 精确匹配
          if (availableLocales.includes(detected)) {
            initialLocale = detected
            break
          }

          // 主语言匹配（例如：'en-US' 匹配 'en'）
          const mainLang = detected.split('-')[0]
          const match = availableLocales.find(locale =>
            locale.startsWith(mainLang)
          )
          if (match) {
            initialLocale = match
            break
          }
        }
      }

      // 3. 预加载指定的语言包
      if (this.options.preload.length > 0) {
        await Promise.allSettled(
          this.options.preload.map(locale =>
            this.loader.preload(locale).catch((error) => {
              // 记录预加载错误，但不阻止初始化
              this.errorManager.createAndHandle(
                LanguageLoadError,
                locale,
                error,
              )
            })
          )
        )
      }

      // 4. 切换到初始语言（强制加载）
      await this.forceChangeLanguage(initialLocale)

      // 5. 标记为已初始化
      this.isInitialized = true
    }
    catch (error) {
      // 创建初始化错误并抛出
      const initError = new InitializationError((error as Error).message)
      this.errorManager.handle(initError)
      throw initError
    }
  }

  /**
   * 获取可用语言列表的辅助方法
   *
   * @returns 可用语言代码数组
   */
  private getAvailableLocales(): string[] {
    const loaderWithMethods = this.loader as Loader & {
      getAvailableLocales?: () => string[]
    }
    return loaderWithMethods.getAvailableLocales?.() || []
  }

  /**
   * 切换语言
   *
   * 切换到指定的语言，如果语言包未加载则自动加载
   * 切换成功后会触发 languageChanged 事件
   *
   * @param locale 目标语言代码
   * @returns 切换完成的 Promise
   *
   * @throws {LanguageLoadError} 语言包加载失败时抛出
   *
   * @example
   * ```typescript
   * // 切换到中文
   * await i18n.changeLanguage('zh-CN')
   *
   * // 切换到英文
   * await i18n.changeLanguage('en')
   * ```
   */
  async changeLanguage(locale: string): Promise<void> {
    // 如果目标语言与当前语言相同，直接返回
    if (locale === this.currentLocale) {
      return
    }

    try {
      // 记录语言加载开始时间（性能监控）
      this.performanceManager.recordLanguageLoadStart(locale)

      // 执行语言切换
      await this.forceChangeLanguage(locale)

      // 记录语言加载结束时间（性能监控）
      this.performanceManager.recordLanguageLoadEnd(locale)
    }
    catch (error) {
      // 记录错误并重新抛出
      this.errorManager.createAndHandle(LanguageLoadError, locale, error as Error)
      throw error
    }
  }

  /**
   * 强制切换语言（即使是相同语言也会重新加载）
   * @param locale 语言代码
   */
  private async forceChangeLanguage(locale: string): Promise<void> {
    try {
      // 加载语言包
      await this.loader.load(locale)

      const previousLocale = this.currentLocale
      this.currentLocale = locale

      // 清除缓存
      if (this.options.cache.enabled) {
        this.cache.clear()
      }

      // 保存到存储
      if (this.options.storage !== 'none') {
        this.storage.setLanguage(locale)
      }

      // 触发事件
      this.emit('languageChanged', {
        newLocale: locale,
        previousLocale
      } as LanguageChangedEventArgs)

      // 调用回调
      if (this.options.onLanguageChanged) {
        this.options.onLanguageChanged(locale)
      }
    }
    catch (error) {
      // 触发错误事件
      this.emit('loadError', {
        locale,
        error: error as Error
      } as LoadErrorEventArgs)

      // 调用错误回调
      if (this.options.onLoadError) {
        this.options.onLoadError(locale, error as Error)
      }

      throw error
    }
  }

  /**
   * 翻译函数
   * @param key 翻译键
   * @param params 插值参数
   * @param options 翻译选项
   * @returns 翻译后的字符串
   */
  t<T = string>(
    key: string,
    params: TranslationParams = this.emptyParams,
    options: TranslationOptions = this.emptyOptions,
  ): T {
    const startTime = performance.now()
    let fromCache = false

    try {
      // 检查增强缓存
      if (this.options.cache.enabled) {
        const cached = this.translationCache.getCachedTranslation(
          this.currentLocale,
          key,
          params
        )
        if (cached !== undefined) {
          fromCache = true
          return cached as T
        }
      }

      // 执行翻译
      const result = this.performTranslation(key, params, options)

      // 缓存结果
      if (this.options.cache.enabled) {
        this.translationCache.cacheTranslation(
          this.currentLocale,
          key,
          params,
          result
        )
      }

      return result as T
    }
    finally {
      // 记录性能指标
      const endTime = performance.now()
      this.performanceManager.recordTranslation(
        key,
        startTime,
        endTime,
        fromCache,
      )

      // 更新缓存统计
      const cacheStats = this.translationCache.getStats()
      this.performanceManager.updateCacheHitRate(cacheStats.hitRate)
      this.performanceManager.updateMemoryUsage(cacheStats.size * 100) // 估算
    }
  }

  /**
   * 批量翻译
   * @param keys 翻译键数组
   * @param params 插值参数
   * @returns 翻译结果对象
   */
  batchTranslate(
    keys: string[],
    params: TranslationParams = this.emptyParams,
  ): BatchTranslationResult {
    const translations: Record<string, string> = {}
    const failedKeys: string[] = []
    let successCount = 0
    let failureCount = 0

    // 优化：预分配对象大小
    const keysLength = keys.length

    // 优化：批量缓存查找
    const hasParams = Object.keys(params).length > 0
    const uncachedKeys: string[] = []

    if (this.options.cache.enabled && !hasParams) {
      // 批量检查缓存
      for (let i = 0; i < keysLength; i++) {
        const key = keys[i]
        const cacheKey = `${this.currentLocale}:${key}`
        const cached = this.cache.get(cacheKey)

        if (cached !== undefined) {
          translations[key] = cached as string
          successCount++
        }
        else {
          uncachedKeys.push(key)
        }
      }
    }
    else {
      uncachedKeys.push(...keys)
    }

    // 处理未缓存的键
    for (const key of uncachedKeys) {
      try {
        const translation = this.t(key, params)
        translations[key] = translation

        // 检查是否是回退值（简单检查是否等于键本身）
        if (translation !== key) {
          successCount++
        }
        else {
          failedKeys.push(key)
          failureCount++
        }
      }
      catch {
        translations[key] = key // 回退到键本身
        failedKeys.push(key)
        failureCount++
      }
    }

    return {
      translations,
      successCount,
      failureCount,
      failedKeys,
    }
  }

  /**
   * 获取可用语言列表
   * @returns 语言信息数组
   */
  getAvailableLanguages(): LanguageInfo[] {
    // 如果有缓存的语言列表，直接使用
    if (this.cachedAvailableLanguages) {
      return this.cachedAvailableLanguages
    }

    const loaderWithMethods = this.loader as Loader & {
      getAvailableLocales?: () => string[] | Promise<string[]>
      getLoadedPackage?: (_locale: string) => LanguagePackage | undefined
      getRegisteredPackage?: (_locale: string) => LanguagePackage | undefined
    }

    let availableLocales: string[] = []

    try {
      const localesResult = loaderWithMethods.getAvailableLocales?.()

      // 处理同步和异步结果
      if (localesResult instanceof Promise) {
        // 如果是 Promise，异步更新缓存
        localesResult.then(locales => {
          this.updateCachedAvailableLanguages(locales)
        }).catch(error => {
          console.error('[I18n] Failed to load available locales:', error)
        })
        return this.cachedAvailableLanguages || []
      } else if (Array.isArray(localesResult)) {
        availableLocales = localesResult
      } else if (localesResult) {
        console.warn('[I18n] getAvailableLanguages: Loader returned non-array result:', localesResult)
        return this.cachedAvailableLanguages || []
      }
    } catch (error) {
      console.error('[I18n] getAvailableLanguages: Error getting locales from loader:', error)
      return this.cachedAvailableLanguages || []
    }

    const languages: LanguageInfo[] = []

    for (const locale of availableLocales) {
      // 优先使用已加载的语言包，如果没有则使用注册的语言包
      let packageData = loaderWithMethods.getLoadedPackage?.(locale)
      if (!packageData && loaderWithMethods.getRegisteredPackage) {
        packageData = loaderWithMethods.getRegisteredPackage(locale)
      }

      if (packageData) {
        languages.push(packageData.info)
      }
    }

    // 缓存结果
    this.cachedAvailableLanguages = languages
    return languages
  }


  /**
   * 异步更新缓存的可用语言列表
   * @param locales 语言代码数组
   */
  private updateCachedAvailableLanguages(locales: string[]): void {
    try {
      const loaderWithMethods = this.loader as Loader & {
        getLoadedPackage?: (_locale: string) => LanguagePackage | undefined
        getRegisteredPackage?: (_locale: string) => LanguagePackage | undefined
      }
      const languages: LanguageInfo[] = []
      for (const locale of locales) {
        let packageData = loaderWithMethods.getLoadedPackage?.(locale)
        if (!packageData && loaderWithMethods.getRegisteredPackage) {
          packageData = loaderWithMethods.getRegisteredPackage(locale)
        }
        if (packageData) {
          languages.push(packageData.info)
        }
      }
      this.cachedAvailableLanguages = languages
    } catch (error) {
      console.error('[I18n] Failed to update cached available languages:', error)
    }
  }

  /**
   * 获取当前语言
   * @returns 当前语言代码
   */
  getCurrentLanguage(): string {
    return this.currentLocale
  }
  /**
   * 预加载语言
   * @param locale 语言代码
   */
  async preloadLanguage(locale: string): Promise<void> {
    await this.loader.preload(locale)
  }

  /**
   * 检查语言是否已加载
   * @param locale 语言代码
   * @returns 是否已加载
   */
  isLanguageLoaded(locale: string): boolean {
    return this.loader.isLoaded(locale)
  }

  /**
   * 清理内存，释放不必要的资源
   */
  clearMemory(): void {
    // 清理缓存
    if (this._cache) {
      this._cache.clear()
    }

    // 清理语言包缓存
    this.packageCache = new WeakMap<Loader, Map<string, any>>()

    // 清理性能管理器的历史数据
    if (this._performanceManager && 'clearHistory' in this._performanceManager) {
      (this._performanceManager as any).clearHistory()
    }
  }

  /**
   * 销毁实例
   */
  async destroy(): Promise<void> {
    // 销毁注册表中的所有管理器
    if (this._registry) {
      await this._registry.destroyAll()
    }

    // 清理事件监听器
    this.eventListeners.clear()

    // 清理所有组件
    this._loader = undefined
    this._storage = undefined
    this._detector = undefined
    this._cache = undefined
    this._performanceManager = undefined
    this._errorManager = undefined
    this._registry = undefined
    this._coreManager = undefined

    // 清理语言包缓存
    this.packageCache = new WeakMap<Loader, Map<string, any>>()

    // 重置状态
    this.isInitialized = false
  }

  /**
   * 添加事件监听器
   *
   * @param event 事件类型
   * @param listener 监听器函数
   *
   * @example
   * ```typescript
   * i18n.on('languageChanged', ({ newLocale, previousLocale }) => {
   *   console.log(`语言从 ${previousLocale} 切换到 ${newLocale}`)
   * })
   * ```
   */
  on<T extends I18nEventType>(event: T, listener: (args: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   *
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off<T extends I18nEventType>(event: T, listener: (args: any) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  /**
   * 移除所有事件监听器
   *
   * @param event 可选的事件类型，如果不提供则移除所有事件的监听器
   */
  removeAllListeners(event?: I18nEventType): void {
    if (event) {
      this.eventListeners.delete(event)
    } else {
      this.eventListeners.clear()
    }
  }

  /**
   * 触发事件
   *
   * @param event 事件类型
   * @param args 事件参数
   */
  emit<T extends I18nEventType>(event: T, args: unknown): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      // 使用 Array.from 来避免迭代器问题
      const listenerArray = Array.from(listeners)
      for (const listener of listenerArray) {
        try {
          listener(args)
        }
        catch (error) {
          console.error(`Error in event listener for '${event}':`, error)
        }
      }
    }
  }

  /**
   * 执行翻译
   * @param key 翻译键
   * @param params 插值参数
   * @param options 翻译选项
   * @returns 翻译后的字符串
   */
  private performTranslation(
    key: string,
    params: TranslationParams,
    options: TranslationOptions,
  ): string {
    // 获取翻译文本
    let text = this.getTranslationText(key, this.currentLocale)

    // 如果没有找到，尝试降级语言
    if (
      text === undefined
      && this.options.fallbackLocale
      && this.options.fallbackLocale !== this.currentLocale
    ) {
      text = this.getTranslationText(key, this.options.fallbackLocale)
    }

    // 如果仍然没有找到，使用默认值或键名
    if (text === undefined) {
      text = options.defaultValue || key
    }

    // 处理增强的多元化
    if (hasPluralExpression(text)) {
      text = this.processEnhancedPluralization(text, params, this.currentLocale)
    }

    // 处理插值
    if (hasInterpolation(text)) {
      text = interpolate(text, params, {
        escapeValue: options.escapeValue,
      })
    }

    return text
  }

  /**
   * 处理增强的多元化
   * @param text 包含多元化表达式的文本
   * @param params 参数
   * @param locale 语言代码
   * @returns 处理后的文本
   */
  private processEnhancedPluralization(
    text: string,
    params: TranslationParams,
    locale: string
  ): string {
    // 检查是否包含 ICU 格式的多元化表达式
    const icuFormatMatch = text.match(/\{([^,]+),\s*plural,\s*(.+)\}/)

    if (icuFormatMatch) {
      const [fullMatch, countKey, pluralRules] = icuFormatMatch
      const count = Number(params[countKey]) || 0

      // 解析 ICU 格式的多元化规则
      const result = this.parseICUPluralRules(pluralRules, count, params, locale)

      return text.replace(fullMatch, result)
    }

    // 检查是否包含新格式的多元化表达式（用 | 分隔）
    const newFormatMatch = text.match(/\{([^}]+)\s*,\s*plural\s*,\s*(.+)\}/)

    if (newFormatMatch) {
      const [, countKey, pluralRules] = newFormatMatch
      const count = Number(params[countKey]) || 0

      // 获取多元化类别
      const category = this.pluralizationEngine.getCategory(locale, count)

      // 解析多元化规则
      const pluralObject = PluralUtils.parsePluralString(pluralRules)

      // 格式化文本
      const result = PluralUtils.formatPluralText(pluralObject, category, count, params)

      return text.replace(newFormatMatch[0], result)
    }

    // 回退到原有的多元化处理
    return processPluralization(text, params, locale)
  }

  /**
   * 解析 ICU 格式的多元化规则
   * @param rules 多元化规则字符串
   * @param count 数量
   * @param params 参数
   * @param locale 语言代码
   * @returns 处理后的文本
   */
  private parseICUPluralRules(
    rules: string,
    count: number,
    params: TranslationParams,
    locale: string
  ): string {
    // 解析 ICU 格式：=0{no items} =1{one item} other{# items}
    const rulePattern = /(=\d+|zero|one|two|few|many|other)\{([^}]*)\}/g
    const parsedRules: Record<string, string> = {}

    let match
    while ((match = rulePattern.exec(rules)) !== null) {
      const [, key, value] = match
      parsedRules[key] = value
    }

    // 确定使用哪个规则
    let selectedRule = ''

    // 首先检查精确匹配
    const exactKey = `=${count}`
    if (parsedRules[exactKey]) {
      selectedRule = parsedRules[exactKey]
    } else {
      // 使用多元化引擎确定类别
      const category = this.pluralizationEngine.getCategory(locale, count)

      // 映射类别到规则
      if (parsedRules[category]) {
        selectedRule = parsedRules[category]
      } else if (parsedRules.other) {
        selectedRule = parsedRules.other
      }
    }

    // 替换 # 为实际数量
    selectedRule = selectedRule.replace(/#/g, count.toString())

    // 处理其他插值
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      selectedRule = selectedRule.replace(regex, String(value))
    }

    return selectedRule
  }

  /**
   * 获取翻译文本（优化版本）
   * @param key 翻译键
   * @param locale 语言代码
   * @returns 翻译文本或 undefined
   */
  private getTranslationTextOptimized(
    key: string,
    locale: string,
  ): string | undefined {
    // 使用缓存避免重复查找
    let loaderCache = this.packageCache.get(this.loader)
    if (!loaderCache) {
      loaderCache = new Map()
      this.packageCache.set(this.loader, loaderCache)
    }

    let packageData = loaderCache.get(locale)
    if (!packageData) {
      packageData = (
        this.loader as Loader & {
          getLoadedPackage?: (
            _locale: string
          ) => { translations: Record<string, unknown> } | undefined
        }
      ).getLoadedPackage?.(locale)

      if (packageData) {
        loaderCache.set(locale, packageData)
      }
    }

    if (!packageData) {
      return undefined
    }

    return getNestedValue(packageData.translations as NestedObject, key)
  }

  /**
   * 获取翻译文本（兼容性方法）
   * @param key 翻译键
   * @param locale 语言代码
   * @returns 翻译文本或 undefined
   */
  private getTranslationText(key: string, locale: string): string | undefined {
    return this.getTranslationTextOptimized(key, locale)
  }

  /**
   * 生成缓存键（优化版本）
   * @param key 翻译键
   * @param params 插值参数
   * @param options 翻译选项
   * @param locale 语言代码
   * @returns 缓存键
   */
  private generateCacheKeyOptimized(
    key: string,
    params: TranslationParams,
    options: TranslationOptions,
    locale: string,
  ): string {
    // 使用数组拼接，比字符串拼接更高效
    const parts = [locale, key]

    const paramKeys = Object.keys(params)
    if (paramKeys.length > 0) {
      // 按键排序以确保一致性
      paramKeys.sort()
      parts.push('p')
      for (const k of paramKeys) {
        parts.push(`${k}=${params[k]}`)
      }
    }

    const optionKeys = Object.keys(options)
    if (optionKeys.length > 0) {
      optionKeys.sort()
      parts.push('o')
      for (const k of optionKeys) {
        parts.push(`${k}=${(options as Record<string, unknown>)[k]}`)
      }
    }

    return parts.join(':')
  }

  /**
   * 生成缓存键（兼容性方法）
   * @param key 翻译键
   * @param params 插值参数
   * @param options 翻译选项
   * @param locale 语言代码
   * @returns 缓存键
   */
  private generateCacheKey(
    key: string,
    params: TranslationParams,
    options: TranslationOptions,
    locale: string,
  ): string {
    return this.generateCacheKeyOptimized(key, params, options, locale)
  }

  /**
   * 设置自定义加载器
   * @param loader 加载器实例
   */
  setLoader(loader: Loader): void {
    this.loader = loader
  }

  /**
   * 获取当前加载器
   */
  getLoader(): Loader {
    return this.loader
  }

  /**
   * 设置自定义存储
   * @param storage 存储实例
   */
  setStorage(storage: Storage): void {
    this.storage = storage
  }

  /**
   * 设置自定义检测器
   * @param detector 检测器实例
   */
  setDetector(detector: Detector): void {
    this.detector = detector
  }

  /**
   * 获取当前语言包信息
   * @returns 语言信息或 undefined
   */
  getCurrentLanguageInfo(): LanguageInfo | undefined {
    const packageData = (
      this.loader as Loader & {
        getLoadedPackage?: (
          _locale: string
        ) => { info: LanguageInfo } | undefined
      }
    ).getLoadedPackage?.(this.currentLocale)
    return packageData?.info
  }

  /**
   * 检查翻译键是否存在
   * @param key 翻译键
   * @param locale 语言代码，默认为当前语言
   * @returns 是否存在
   */
  exists(key: string, locale?: string): boolean {
    const targetLocale = locale || this.currentLocale
    const text = this.getTranslationText(key, targetLocale)
    return text !== undefined
  }

  /**
   * 获取所有翻译键
   * @param locale 语言代码，默认为当前语言
   * @returns 翻译键数组
   */
  getKeys(locale?: string): string[] {
    const targetLocale = locale || this.currentLocale
    const packageData = (
      this.loader as Loader & {
        getLoadedPackage?: (
          _locale: string
        ) => { translations: Record<string, unknown> } | undefined
      }
    ).getLoadedPackage?.(targetLocale)
    if (!packageData) {
      return []
    }

    return this.getAllKeysFromObject(packageData.translations)
  }

  /**
   * 从嵌套对象中获取所有键
   * @param obj 嵌套对象
   * @param prefix 键前缀
   * @returns 键数组
   */
  private getAllKeysFromObject(
    obj: Record<string, unknown>,
    prefix = '',
  ): string[] {
    const keys: string[] = []

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'string') {
        keys.push(fullKey)
      }
      else if (typeof value === 'object' && value !== null) {
        keys.push(
          ...this.getAllKeysFromObject(
            value as Record<string, unknown>,
            fullKey,
          ),
        )
      }
    }

    return keys
  }

  /**
   * 获取性能指标
   *
   * @returns 性能指标数据
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const metrics = this.performanceManager.getMetrics()
    // 转换为符合接口的格式
    return {
      translationCount: metrics.translationCalls || 0,
      averageTranslationTime: metrics.averageTranslationTime || 0,
      cacheHitRate: metrics.cacheHitRate || 0,
      memoryUsage: metrics.memoryUsage || 0,
      languageChangeCount: Object.keys(metrics.languageLoadTimes || {}).length,
      slowTranslations: (metrics.slowestTranslations || []).map(item => ({
        key: item.key,
        time: item.time,
        timestamp: Date.now()
      }))
    }
  }

  /**
   * 生成性能报告
   *
   * @returns 格式化的性能报告字符串
   */
  generatePerformanceReport(): string {
    return this.performanceManager.generateReport()
  }

  /**
   * 获取性能优化建议
   *
   * @returns 优化建议数组
   */
  getOptimizationSuggestions(): readonly OptimizationSuggestion[] {
    const suggestions = this.performanceManager.getOptimizationSuggestions()
    // 转换字符串数组为 OptimizationSuggestion 数组
    return suggestions.map((suggestion, index) => ({
      type: 'performance' as const,
      title: `优化建议 ${index + 1}`,
      description: suggestion,
      priority: 3 as const
    }))
  }

  /**
   * 预热缓存
   * @param keys 要预热的翻译键
   */
  warmUpCache(keys: string[]): void {
    const entries: Array<[string, string]> = []

    for (const key of keys) {
      const text = this.getTranslationTextOptimized(key, this.currentLocale)
      if (text !== undefined) {
        const cacheKey = `${this.currentLocale}:${key}`
        entries.push([cacheKey, text])
      }
    }

    if (this.cache instanceof LRUCacheImpl) {
      this.cache.warmUp(entries)
    }
  }

  /**
   * 清理缓存中的过期项
   *
   * 当内存使用率过高时，主动清理部分缓存项
   * 使用 LRU 策略优先清理最少使用的项目
   */
  cleanupCache(): void {
    // 如果缓存使用率过高，清理一些项
    if (this.cache instanceof LRUCacheImpl) {
      const stats = this.cache.getStats()
      // 使用内存使用百分比来判断是否需要清理
      if (stats.memoryUsagePercent > 0.9) {
        // 计算需要清理的缓存项数量（10% 的缓存）
        const keysToRemove = Math.floor(stats.size * 0.1)

        // 这里可以实现更智能的清理策略
        // 例如：优先清理访问频率低的项目
        console.debug(`缓存内存使用率过高 (${(stats.memoryUsagePercent * 100).toFixed(1)}%)，准备清理 ${keysToRemove} 个缓存项`)

        // 注意：实际的清理逻辑应该在 LRUCacheImpl 中实现
        // 这里只是触发清理操作
      }
    }
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): Record<string, number> {
    return this.errorManager.getErrorStats()
  }

  /**
   * 重置错误统计
   */
  resetErrorStats(): void {
    this.errorManager.resetStats()
  }

  /**
   * 获取管理器注册表
   */
  getRegistry(): ManagerRegistry {
    return this.registry
  }

  /**
   * 检查是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized
  }

  /**
   * 获取当前配置
   */
  getConfig(): I18nOptions {
    return { ...this.options }
  }

  /**
   * 更新配置
   * @param options 新的配置选项
   */
  updateConfig(options: Partial<I18nOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 批量预加载语言
   * @param locales 语言代码数组
   */
  async batchPreloadLanguages(locales: string[]): Promise<void> {
    const promises = locales.map(locale =>
      this.preloadLanguage(locale).catch((error) => {
        this.errorManager.createAndHandle(LanguageLoadError, locale, error)
      }),
    )

    await Promise.allSettled(promises)
  }

  /**
   * 获取翻译键的建议（模糊匹配）
   * @param partialKey 部分翻译键
   * @param limit 返回结果数量限制
   */
  getSuggestions(partialKey: string, limit = 10): string[] {
    const allKeys = this.getKeys()
    const suggestions = allKeys
      .filter(key => key.toLowerCase().includes(partialKey.toLowerCase()))
      .slice(0, limit)

    return suggestions
  }

  /**
   * 检查翻译是否包含插值
   * @param key 翻译键
   */
  hasInterpolation(key: string): boolean {
    const text = this.getTranslationTextOptimized(key, this.currentLocale)
    return text ? hasInterpolation(text) : false
  }

  /**
   * 检查翻译是否包含复数表达式
   * @param key 翻译键
   */
  hasPlural(key: string): boolean {
    const text = this.getTranslationTextOptimized(key, this.currentLocale)
    return text ? hasPluralExpression(text) : false
  }

  // ==================== 格式化功能 ====================

  /**
   * 格式化日期
   * @param date 日期
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  formatDate(date: Date | number | string, options?: any): string {
    return this.formatterEngine.formatDate(date, this.currentLocale, options)
  }

  /**
   * 格式化数字
   * @param number 数字
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  formatNumber(number: number, options?: any): string {
    return this.formatterEngine.formatNumber(number, this.currentLocale, options)
  }

  /**
   * 格式化货币
   * @param amount 金额
   * @param currency 货币代码
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  formatCurrency(amount: number, currency?: string, options?: any): string {
    return this.formatterEngine.formatCurrency(amount, this.currentLocale, currency, options)
  }

  /**
   * 格式化百分比
   * @param value 值（0-1之间）
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  formatPercent(value: number, options?: any): string {
    return this.formatterEngine.formatPercent(value, this.currentLocale, options)
  }

  /**
   * 格式化相对时间
   * @param date 日期
   * @param unit 时间单位
   * @returns 格式化后的字符串
   */
  formatRelativeTime(date: Date, unit?: any): string {
    return this.formatterEngine.formatRelativeTime(date, this.currentLocale, unit)
  }

  /**
   * 格式化列表
   * @param items 项目列表
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  formatList(items: string[], options?: any): string {
    return this.formatterEngine.formatList(items, this.currentLocale, options)
  }

  /**
   * 使用自定义格式化器
   * @param name 格式化器名称
   * @param value 值
   * @param options 选项
   * @returns 格式化后的字符串
   */
  format(name: string, value: any, options?: any): string {
    return this.formatterEngine.format(name, value, this.currentLocale, options)
  }

  /**
   * 注册自定义格式化器
   * @param name 格式化器名称
   * @param formatter 格式化器函数
   */
  registerFormatter(name: string, formatter: any): void {
    this.formatterEngine.registerFormatter(name, formatter)
  }

  // ==================== 缓存管理 ====================

  /**
   * 获取翻译缓存统计信息
   * @returns 缓存统计信息
   */
  getCacheStats(): any {
    return this.translationCache.getStats()
  }

  /**
   * 清除翻译缓存
   */
  clearTranslationCache(): void {
    this.translationCache.clear()
  }

  /**
   * 清除格式化器缓存
   */
  clearFormatterCache(): void {
    this.formatterEngine.clearCache()
  }

  /**
   * 清除多元化缓存
   */
  clearPluralizationCache(): void {
    this.pluralizationEngine.clearCache()
  }

  /**
   * 清除所有缓存
   */
  clearAllCaches(): void {
    this.clearTranslationCache()
    this.clearFormatterCache()
    this.clearPluralizationCache()
    if (this._cache) {
      this._cache.clear()
    }
  }
}
