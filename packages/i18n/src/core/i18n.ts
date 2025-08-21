import type {
  BatchTranslationResult,
  Detector,
  I18nEventListener,
  I18nEventType,
  I18nInstance,
  I18nOptions,
  LanguageInfo,
  LanguagePackage,
  Loader,
  LRUCache,
  NestedObject,
  Storage,
  TranslationOptions,
  TranslationParams,
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
import { DefaultLoader } from './loader'
import { PerformanceManager } from './performance'
import { I18nCoreManager, ManagerRegistry } from './registry'
import { createStorage, LRUCacheImpl } from './storage'

/**
 * 默认配置选项
 */
const DEFAULT_OPTIONS: Required<
  Omit<I18nOptions, 'onLanguageChanged' | 'onLoadError'>
> = {
  defaultLocale: 'en',
  fallbackLocale: 'en',
  storage: 'localStorage',
  storageKey: 'i18n-locale',
  autoDetect: true,
  preload: [],
  cache: {
    enabled: true,
    maxSize: 1000,
    maxMemory: 50 * 1024 * 1024, // 50MB
    defaultTTL: 60 * 60 * 1000, // 1小时
    enableTTL: true,
    cleanupInterval: 5 * 60 * 1000, // 5分钟
    memoryPressureThreshold: 0.8,
  },
}

/**
 * I18n 主类实现
 */
export class I18n implements I18nInstance {
  private options: Required<
    Omit<I18nOptions, 'onLanguageChanged' | 'onLoadError'>
  > & {
    onLanguageChanged?: (_locale: string) => void
    onLoadError?: (_locale: string, _error: Error) => void
  }

  private currentLocale: string

  // 懒加载的组件
  private _loader?: Loader
  private _storage?: Storage
  private _detector?: Detector
  private _cache?: LRUCache<string>
  private _performanceManager?: PerformanceManager
  private _errorManager?: ErrorManager
  private _registry?: ManagerRegistry
  private _coreManager?: I18nCoreManager

  private eventListeners = new Map<I18nEventType, Set<I18nEventListener>>()
  private isInitialized = false

  // 对象池，减少对象创建开销
  private readonly emptyParams: TranslationParams = Object.freeze({})
  private readonly emptyOptions: TranslationOptions = Object.freeze({})

  // 语言包缓存，避免重复查找
  private packageCache = new WeakMap<Loader, Map<string, any>>()

  // 懒加载的getter方法
  public get loader(): Loader {
    if (!this._loader) {
      this._loader = new DefaultLoader()
    }
    return this._loader
  }

  public set loader(value: Loader) {
    this._loader = value
  }

  private get storage(): Storage {
    if (!this._storage) {
      this._storage = createStorage(this.options.storage, this.options.storageKey)
    }
    return this._storage
  }

  private set storage(value: Storage) {
    this._storage = value
  }

  private get detector(): Detector {
    if (!this._detector) {
      this._detector = createDetector('browser')
    }
    return this._detector
  }

  private set detector(value: Detector) {
    this._detector = value
  }

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
   */
  private isDevelopmentEnvironment(): boolean {
    // 浏览器环境检查
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost'
        || window.location.hostname === '127.0.0.1'
        || window.location.hostname.includes('dev')
    }

    // Node.js环境检查
    if (typeof globalThis.process !== 'undefined' && globalThis.process.env) {
      return globalThis.process.env.NODE_ENV !== 'production'
    }

    return true // 默认开启性能监控
  }

  private get errorManager(): ErrorManager {
    if (!this._errorManager) {
      this._errorManager = new ErrorManager()
    }
    return this._errorManager
  }

  private get registry(): ManagerRegistry {
    if (!this._registry) {
      this._registry = new ManagerRegistry()
    }
    return this._registry
  }

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
      // 注册核心管理器
      this.registry.registerManager(this._coreManager)
    }
    return this._coreManager
  }

  constructor(options: I18nOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.currentLocale = this.options.defaultLocale || 'en'

    // 绑定翻译函数的 this 上下文
    this.t = this.t.bind(this)
  }

  /**
   * 初始化 I18n 实例
   */
  @handleErrors()
  async init(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 初始化管理器注册表
      await this.registry.initializeAll()

      // 确定初始语言
      let initialLocale = this.options.defaultLocale

      // 1. 从存储中获取
      if (this.options.storage !== 'none') {
        const storedLocale = this.storage.getLanguage()
        if (storedLocale) {
          initialLocale = storedLocale
        }
      }

      // 2. 自动检测浏览器语言
      if (this.options.autoDetect && !this.storage.getLanguage()) {
        const detectedLanguages = this.detector.detect()
        const availableLocales
          = (
            this.loader as Loader & { getAvailableLocales?: () => string[] }
          ).getAvailableLocales?.() || []

        for (const detected of detectedLanguages) {
          if (availableLocales.includes(detected)) {
            initialLocale = detected
            break
          }

          // 尝试匹配主语言
          const mainLang = detected.split('-')[0]
          const match = availableLocales.find(locale =>
            locale.startsWith(mainLang),
          )
          if (match) {
            initialLocale = match
            break
          }
        }
      }

      // 预加载指定的语言
      if (this.options.preload.length > 0) {
        await Promise.all(
          this.options.preload.map(locale =>
            this.loader.preload(locale).catch((error) => {
              this.errorManager.createAndHandle(
                LanguageLoadError,
                locale,
                error,
              )
            }),
          ),
        )
      }

      // 切换到初始语言（强制加载）
      await this.forceChangeLanguage(initialLocale)

      this.isInitialized = true
    }
    catch (error) {
      const initError = new InitializationError((error as Error).message)
      this.errorManager.handle(initError)
      throw initError
    }
  }

  /**
   * 切换语言
   * @param locale 语言代码
   */
  @handleErrors()
  async changeLanguage(locale: string): Promise<void> {
    if (locale === this.currentLocale) {
      return
    }

    this.performanceManager.recordLanguageLoadStart(locale)
    await this.forceChangeLanguage(locale)
    this.performanceManager.recordLanguageLoadEnd(locale)
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
      this.emit('languageChanged', locale, previousLocale)

      // 调用回调
      if (this.options.onLanguageChanged) {
        this.options.onLanguageChanged(locale)
      }
    }
    catch (error) {
      // 触发错误事件
      this.emit('loadError', locale, error)

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
      // 快速路径：如果没有参数且没有特殊选项，直接查找简单翻译
      const hasParams = Object.keys(params).length > 0
      const hasOptions = Object.keys(options).length > 0

      if (!hasParams && !hasOptions && this.options.cache.enabled) {
        // 使用简化的缓存键
        const simpleCacheKey = `${this.currentLocale}:${key}`
        const cached = this.cache.get(simpleCacheKey)
        if (cached !== undefined) {
          fromCache = true
          return cached as T
        }

        // 快速翻译查找
        const text = this.getTranslationTextOptimized(key, this.currentLocale)
        if (
          text !== undefined
          && !hasInterpolation(text)
          && !hasPluralExpression(text)
        ) {
          this.cache.set(simpleCacheKey, text)
          return text as T
        }
      }

      // 标准路径：生成完整缓存键
      const cacheKey = this.generateCacheKeyOptimized(
        key,
        params,
        options,
        this.currentLocale,
      )

      // 尝试从缓存获取
      if (this.options.cache.enabled) {
        const cached = this.cache.get(cacheKey)
        if (cached !== undefined) {
          fromCache = true
          return cached as T
        }
      }

      // 执行翻译
      const result = this.performTranslation(key, params, options)

      // 缓存结果
      if (this.options.cache.enabled) {
        this.cache.set(cacheKey, result)
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
      if (this.cache instanceof LRUCacheImpl) {
        const stats = this.cache.getStats()
        this.performanceManager.updateCacheHitRate(stats.hitRate)
        this.performanceManager.updateMemoryUsage(stats.size * 100) // 估算
      }
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
    const loaderWithMethods = this.loader as Loader & {
      getAvailableLocales?: () => string[]
      getLoadedPackage?: (_locale: string) => LanguagePackage | undefined
      getRegisteredPackage?: (_locale: string) => LanguagePackage | undefined
    }
    const availableLocales = loaderWithMethods.getAvailableLocales?.() || []
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

    return languages
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
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on(event: I18nEventType, listener: I18nEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off(event: I18nEventType, listener: I18nEventListener): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(event)
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param args 事件参数
   */
  emit(event: I18nEventType, ...args: unknown[]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(...args)
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

    // 处理复数
    if (hasPluralExpression(text)) {
      text = processPluralization(text, params, this.currentLocale)
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
   */
  getPerformanceMetrics() {
    return this.performanceManager.getMetrics()
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(): string {
    return this.performanceManager.generateReport()
  }

  /**
   * 获取性能优化建议
   */
  getOptimizationSuggestions(): string[] {
    return this.performanceManager.getOptimizationSuggestions()
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
   */
  cleanupCache(): void {
    // 如果缓存使用率过高，清理一些项
    if (this.cache instanceof LRUCacheImpl) {
      const stats = this.cache.getStats()
      // 使用内存使用百分比来判断是否需要清理
      if (stats.memoryUsagePercent > 0.9) {
        // 清理 10% 的缓存
        const _keysToRemove = Math.floor(stats.size * 0.1)
        // 这里可以实现更智能的清理策略
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
  getConfig(): Required<
    Omit<I18nOptions, 'onLanguageChanged' | 'onLoadError'>
  > & {
    onLanguageChanged?: (_locale: string) => void
    onLoadError?: (_locale: string, _error: Error) => void
  } {
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
}
