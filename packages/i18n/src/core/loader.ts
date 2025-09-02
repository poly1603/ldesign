import type { LanguagePackage, Loader } from './types'

/**
 * 加载优先级枚举
 *
 * 定义了不同加载操作的优先级级别
 */
export type LoadPriority = 'high' | 'normal' | 'low'

/**
 * 懒加载配置接口
 *
 * 定义了懒加载功能的配置选项
 */
export interface LazyLoadConfig {
  /** 是否启用懒加载 */
  enabled?: boolean
  /** 每次加载的块大小（翻译键数量） */
  chunkSize?: number
  /** 懒加载优先级 */
  priority?: LoadPriority
}

/**
 * 按需加载配置接口
 *
 * 定义了按需加载功能的配置选项
 */
export interface OnDemandConfig {
  /** 是否启用按需加载 */
  enabled?: boolean
  /** 支持按需加载的命名空间列表 */
  namespaces?: readonly string[]
  /** 触发按需加载的阈值（访问次数） */
  threshold?: number
}

/**
 * 缓存配置接口
 *
 * 定义了加载器缓存的配置选项
 */
export interface LoaderCacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 最大缓存条目数 */
  maxSize?: number
  /** 缓存生存时间（毫秒） */
  ttl?: number
}

/**
 * 加载器配置选项接口
 *
 * 定义了语言包加载器的完整配置选项
 * 包括重试策略、并发控制、缓存配置等
 *
 * @example
 * ```typescript
 * const loaderOptions: LoaderOptions = {
 *   maxRetries: 3,
 *   retryDelay: 1000,
 *   exponentialBackoff: true,
 *   maxConcurrent: 5,
 *   preloadPriority: 'high',
 *   lazyLoad: {
 *     enabled: true,
 *     chunkSize: 50,
 *     priority: 'normal'
 *   },
 *   onDemand: {
 *     enabled: true,
 *     namespaces: ['common', 'validation'],
 *     threshold: 10
 *   },
 *   cache: {
 *     enabled: true,
 *     maxSize: 100,
 *     ttl: 300000 // 5分钟
 *   }
 * }
 * ```
 */
export interface LoaderOptions {
  /** 最大重试次数（网络请求失败时的重试次数） */
  maxRetries?: number
  /** 重试延迟时间（毫秒，每次重试前的等待时间） */
  retryDelay?: number
  /** 是否使用指数退避策略（重试延迟时间递增） */
  exponentialBackoff?: boolean
  /** 并行加载的最大数量（同时进行的加载请求数限制） */
  maxConcurrent?: number
  /** 预加载操作的优先级 */
  preloadPriority?: LoadPriority
  /** 懒加载配置（延迟加载部分翻译内容） */
  lazyLoad?: LazyLoadConfig
  /** 按需加载配置（根据使用情况动态加载） */
  onDemand?: OnDemandConfig
  /** 缓存配置（加载结果的缓存策略） */
  cache?: LoaderCacheConfig
  /** 自定义语言包加载器函数 */
  customLoader?: (locale: string) => Promise<LanguagePackage>
}

/**
 * 加载状态枚举
 *
 * 定义了语言包的加载状态
 */
export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * 加载器统计信息接口
 *
 * 定义了加载器的性能统计数据
 * 用于监控加载器的运行状态和性能表现
 *
 * @example
 * ```typescript
 * const stats: LoaderStats = {
 *   successCount: 15,
 *   errorCount: 2,
 *   cacheHits: 8,
 *   averageLoadTime: 120,
 *   currentConcurrent: 2
 * }
 * ```
 */
export interface LoaderStats {
  /** 加载成功次数 */
  successCount: number
  /** 加载失败次数 */
  errorCount: number
  /** 缓存命中次数 */
  cacheHits: number
  /** 平均加载时间（毫秒） */
  averageLoadTime: number
  /** 当前并发加载数 */
  currentConcurrent: number
}

/**
 * 增强的加载器基类
 *
 * 提供了语言包加载的高级功能，包括：
 * - 🔄 智能重试机制
 * - 🚀 并发控制
 * - 💾 缓存管理
 * - 📊 性能统计
 * - 🎯 懒加载支持
 * - 📦 按需加载
 *
 * 这是一个抽象基类，具体的加载器实现需要继承此类并实现抽象方法
 *
 * @example
 * ```typescript
 * class HttpLoader extends EnhancedLoader {
 *   protected async loadPackageData(locale: string): Promise<LanguagePackage> {
 *     const response = await fetch(`/api/i18n/${locale}`)
 *     return response.json()
 *   }
 * }
 *
 * const loader = new HttpLoader({
 *   maxRetries: 3,
 *   maxConcurrent: 5,
 *   cache: { enabled: true, maxSize: 50 }
 * })
 * ```
 */
export abstract class EnhancedLoader implements Loader {
  // ==================== 内部状态管理 ====================

  /** 已加载的语言包缓存 */
  protected readonly loadedPackages = new Map<string, LanguagePackage>()

  /** 正在进行的加载 Promise 缓存（防止重复加载） */
  protected readonly loadingPromises = new Map<string, Promise<LanguagePackage>>()

  /** 各语言包的加载状态 */
  protected readonly loadingStates = new Map<string, LoadingState>()

  /** 各语言包的加载时间记录 */
  protected readonly loadTimes = new Map<string, number>()

  /** 加载器统计信息 */
  protected stats: LoaderStats = {
    successCount: 0,
    errorCount: 0,
    cacheHits: 0,
    averageLoadTime: 0,
    currentConcurrent: 0,
  }

  /** 配置选项（合并了默认值和用户配置） */
  protected readonly options: Required<LoaderOptions>

  /**
   * 创建增强加载器实例
   *
   * @param options 加载器配置选项
   */
  constructor(options: LoaderOptions = {}) {
    // 合并默认配置和用户配置
    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      maxConcurrent: 5,
      preloadPriority: 'normal',
      lazyLoad: {
        enabled: true,
        chunkSize: 50,
        priority: 'normal',
        ...options.lazyLoad,
      },
      onDemand: {
        enabled: true,
        namespaces: [],
        threshold: 10,
        ...options.onDemand,
      },
      cache: {
        enabled: true,
        maxSize: 100,
        ttl: 300000, // 5分钟
        ...options.cache,
      },
      customLoader: undefined,
      ...options,
    } as Required<LoaderOptions>
  }

  // ==================== 核心加载方法 ====================

  /**
   * 加载语言包（带重试和并发控制）
   *
   * 这是加载器的核心方法，提供以下功能：
   * 1. 缓存检查：避免重复加载
   * 2. 并发控制：限制同时进行的加载数量
   * 3. 重试机制：网络失败时自动重试
   * 4. 性能统计：记录加载时间和成功率
   *
   * @param locale 要加载的语言代码
   * @returns 语言包数据的 Promise
   *
   * @throws {Error} 加载失败时抛出错误
   *
   * @example
   * ```typescript
   * try {
   *   const package = await loader.load('zh-CN')
   *   console.log('语言包加载成功:', package.info.name)
   * } catch (error) {
   *   console.error('语言包加载失败:', error)
   * }
   * ```
   */
  async load(locale: string): Promise<LanguagePackage> {
    const startTime = performance.now()

    // 1. 检查缓存：如果已经加载过，直接返回缓存的结果
    if (this.loadedPackages.has(locale)) {
      this.stats.cacheHits++
      return this.loadedPackages.get(locale)!
    }

    // 2. 检查是否正在加载：避免重复的并发加载请求
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale)!
    }

    // 3. 并发控制：等待可用的并发槽位
    await this.waitForConcurrencySlot()

    // 4. 开始加载：更新状态和统计信息
    this.loadingStates.set(locale, 'loading')
    this.stats.currentConcurrent++

    // 5. 创建加载 Promise 并缓存（防止重复加载）
    const loadingPromise = this.loadWithRetry(locale)
    this.loadingPromises.set(locale, loadingPromise)

    try {
      // 6. 执行实际加载
      const languagePackage = await loadingPromise

      // 7. 缓存加载结果
      this.loadedPackages.set(locale, languagePackage)
      this.loadingStates.set(locale, 'loaded')
      this.stats.successCount++

      // 8. 记录性能数据
      const loadTime = performance.now() - startTime
      this.loadTimes.set(locale, loadTime)
      this.updateAverageLoadTime(loadTime)

      return languagePackage
    }
    catch (error) {
      // 9. 处理加载失败
      this.loadingStates.set(locale, 'error')
      this.stats.errorCount++
      throw error
    }
    finally {
      // 10. 清理：移除加载 Promise 并减少并发计数
      this.loadingPromises.delete(locale)
      this.stats.currentConcurrent--
    }
  }

  /**
   * 批量并行加载多个语言包
   *
   * 支持同时加载多个语言包，自动控制并发数量
   * 即使部分语言包加载失败，也会继续加载其他语言包
   *
   * @param locales 要加载的语言代码数组
   * @returns 加载结果映射表（成功返回语言包，失败返回错误对象）
   *
   * @example
   * ```typescript
   * const results = await loader.loadBatch(['en', 'zh-CN', 'ja'])
   *
   * for (const [locale, result] of results) {
   *   if (result instanceof Error) {
   *     console.error(`${locale} 加载失败:`, result.message)
   *   } else {
   *     console.log(`${locale} 加载成功:`, result.info.name)
   *   }
   * }
   * ```
   */
  async loadBatch(locales: readonly string[]): Promise<Map<string, LanguagePackage | Error>> {
    const results = new Map<string, LanguagePackage | Error>()

    // 分批处理以控制并发数量
    const batches = this.chunkArray(locales, this.options.maxConcurrent)

    // 逐批处理，确保不超过最大并发限制
    for (const batch of batches) {
      const promises = batch.map(async (locale) => {
        try {
          const pkg = await this.load(locale)
          results.set(locale, pkg)
        }
        catch (error) {
          // 记录失败的语言包，但不影响其他语言包的加载
          results.set(locale, error as Error)
        }
      })

      // 等待当前批次的所有加载完成
      await Promise.all(promises)
    }

    return results
  }

  /**
   * 智能预加载（支持优先级控制）
   *
   * 根据配置的优先级策略预加载语言包
   * 高优先级：立即加载
   * 普通优先级：延迟加载
   * 低优先级：空闲时加载
   *
   * @param locale 要预加载的语言代码
   * @returns 预加载完成的 Promise
   *
   * @example
   * ```typescript
   * // 预加载常用语言
   * await Promise.all([
   *   loader.preload('en'),
   *   loader.preload('zh-CN'),
   *   loader.preload('ja')
   * ])
   * ```
   */
  async preload(locale: string): Promise<void> {
    // 如果已经加载或正在加载，直接返回
    if (this.isLoaded(locale) || this.loadingPromises.has(locale)) {
      return
    }

    // 根据优先级决定加载策略
    switch (this.options.preloadPriority) {
      case 'high':
        // 高优先级：立即加载
        await this.load(locale)
        break

      case 'normal':
        // 普通优先级：延迟加载（避免阻塞主要操作）
        setTimeout(() => {
          this.load(locale).catch(() => {
            // 预加载失败不抛出错误，只记录日志
            console.debug(`预加载语言包失败: ${locale}`)
          })
        }, 100)
        break

      case 'low':
        // 低优先级：空闲时加载
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => {
            this.load(locale).catch(() => {
              console.debug(`空闲时预加载语言包失败: ${locale}`)
            })
          })
        } else {
          // 降级方案：使用 setTimeout
          setTimeout(() => {
            this.load(locale).catch(() => {
              console.debug(`预加载语言包失败: ${locale}`)
            })
          }, 1000)
        }
        break
    }
  }

  // ==================== 内部辅助方法 ====================

  /**
   * 带重试机制的加载方法
   *
   * 实现智能重试策略：
   * 1. 支持指数退避算法
   * 2. 可配置最大重试次数
   * 3. 记录每次重试的错误信息
   *
   * @param locale 要加载的语言代码
   * @returns 语言包数据的 Promise
   *
   * @throws {Error} 所有重试都失败时抛出最后一次的错误
   */
  private async loadWithRetry(locale: string): Promise<LanguagePackage> {
    let lastError: Error | undefined

    // 执行重试循环（包括初始尝试）
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        // 调用具体的加载实现（由子类提供）
        return await this.loadLanguagePackage(locale)
      }
      catch (error) {
        lastError = error as Error

        // 如果还有重试机会，计算延迟时间并等待
        if (attempt < this.options.maxRetries) {
          const delay = this.calculateRetryDelay(attempt)
          await this.sleep(delay)
        }
      }
    }

    // 所有重试都失败，抛出最后一次的错误
    throw lastError
  }

  /**
   * 计算重试延迟时间
   *
   * 支持两种策略：
   * 1. 固定延迟：每次重试使用相同的延迟时间
   * 2. 指数退避：延迟时间随重试次数指数增长
   *
   * @param attempt 当前重试次数（从0开始）
   * @returns 延迟时间（毫秒）
   */
  private calculateRetryDelay(attempt: number): number {
    if (!this.options.exponentialBackoff) {
      // 固定延迟策略
      return this.options.retryDelay
    }

    // 指数退避策略：delay * (2 ^ attempt)
    return this.options.retryDelay * (2 ** attempt)
  }

  /**
   * 等待并发槽位
   */
  private async waitForConcurrencySlot(): Promise<void> {
    while (this.stats.currentConcurrent >= this.options.maxConcurrent) {
      await this.sleep(10) // 等待10ms后重试
    }
  }

  /**
   * 调度预加载
   */
  private schedulePreload(locale: string): void {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        this.load(locale).catch(() => {
          // 预加载失败时静默处理
        })
      })
    }
    else {
      setTimeout(() => {
        this.load(locale).catch(() => {
          // 预加载失败时静默处理
        })
      }, 100)
    }
  }

  /**
   * 更新平均加载时间
   */
  private updateAverageLoadTime(newTime: number): void {
    const totalRequests = this.stats.successCount + this.stats.errorCount
    if (totalRequests === 1) {
      this.stats.averageLoadTime = newTime
    }
    else {
      this.stats.averageLoadTime = (this.stats.averageLoadTime * (totalRequests - 1) + newTime) / totalRequests
    }
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: readonly T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 检查是否已加载
   */
  isLoaded(locale: string): boolean {
    return this.loadedPackages.has(locale)
  }

  /**
   * 获取加载状态
   */
  getLoadingState(locale: string): LoadingState {
    return this.loadingStates.get(locale) || 'idle'
  }

  /**
   * 获取统计信息
   */
  getStats(): LoaderStats {
    return { ...this.stats }
  }

  /**
   * 清除缓存
   */
  clearCache(locale?: string): void {
    if (locale) {
      this.loadedPackages.delete(locale)
      this.loadingStates.delete(locale)
      this.loadTimes.delete(locale)
    }
    else {
      this.loadedPackages.clear()
      this.loadingStates.clear()
      this.loadTimes.clear()
    }
  }

  /**
   * 获取已加载的语言包
   */
  getLoadedPackage(locale: string): LanguagePackage | undefined {
    return this.loadedPackages.get(locale)
  }

  /**
   * 抽象方法：实际加载语言包
   */
  protected abstract loadLanguagePackage(locale: string): Promise<LanguagePackage>
}

/**
 * 默认语言包加载器
 */
export class DefaultLoader extends EnhancedLoader {
  private availableLocales: string[]

  constructor(availableLocales: string[] = [], options: LoaderOptions = {}) {
    super(options)
    this.availableLocales = availableLocales
  }

  /**
   * 获取可用的语言列表
   */
  getAvailableLocales(): string[] {
    return [...this.availableLocales]
  }

  /**
   * 实际加载语言包的方法（子类可以重写）
   * @param locale 语言代码
   * @returns 语言包
   */
  protected async loadLanguagePackage(
    locale: string,
  ): Promise<LanguagePackage> {
    try {
      // 尝试动态加载语言包
      // 注意：这里不再使用预定义的映射，而是让用户自己提供语言包

      // 如果有自定义的语言包加载器，使用它
      if (this.options.customLoader) {
        return await this.options.customLoader(locale)
      }

      // 否则返回一个空的语言包，避免构建错误
      console.warn(`No language package found for locale '${locale}'. Please provide language packages through options.messages or options.customLoader.`)

      return {
        info: {
          name: `Empty package for ${locale}`,
          nativeName: `Empty package for ${locale}`,
          code: locale,
          direction: 'ltr',
          dateFormat: 'YYYY-MM-DD',
        },
        translations: {},
      }

      // 注意：下面的代码不会执行，但保留以供参考
      const localeModule = { default: null } as any

      if (!localeModule.default) {
        throw new Error(
          `Language package for '${locale}' does not have a default export`,
        )
      }

      return localeModule.default as LanguagePackage
    }
    catch (error) {
      throw new Error(
        `Failed to load language package for '${locale}': ${error}`,
      )
    }
  }

  /**
   * 添加可用语言
   * @param locale 语言代码
   */
  addAvailableLocale(locale: string): void {
    if (!this.availableLocales.includes(locale)) {
      this.availableLocales.push(locale)
    }
  }

  /**
   * 移除可用语言
   * @param locale 语言代码
   */
  removeAvailableLocale(locale: string): void {
    const index = this.availableLocales.indexOf(locale)
    if (index > -1) {
      this.availableLocales.splice(index, 1)
    }
  }
}

/**
 * 静态语言包加载器（用于预定义的语言包）
 */
export class StaticLoader implements Loader {
  private packages = new Map<string, LanguagePackage>()
  private loadedPackages = new Map<string, LanguagePackage>()

  /**
   * 注册语言包
   * @param locale 语言代码
   * @param packageData 语言包数据
   */
  registerPackage(locale: string, packageData: LanguagePackage): void {
    this.packages.set(locale, packageData)
  }

  /**
   * 批量注册语言包
   * @param packages 语言包映射
   */
  registerPackages(packages: Record<string, LanguagePackage>): void {
    for (const [locale, packageData] of Object.entries(packages)) {
      this.registerPackage(locale, packageData)
    }
  }

  /**
   * 加载语言包
   * @param locale 语言代码
   * @returns 语言包
   */
  async load(locale: string): Promise<LanguagePackage> {
    const packageData = this.packages.get(locale)
    if (!packageData) {
      throw new Error(`Language package for '${locale}' is not registered`)
    }

    // 缓存已加载的语言包
    this.loadedPackages.set(locale, packageData)
    return packageData
  }

  /**
   * 预加载语言包
   * @param locale 语言代码
   */
  async preload(locale: string): Promise<void> {
    await this.load(locale)
  }

  /**
   * 检查语言包是否已加载
   * @param locale 语言代码
   * @returns 是否已加载
   */
  isLoaded(locale: string): boolean {
    return this.packages.has(locale)
  }

  /**
   * 获取可用的语言列表
   * @returns 可用语言代码数组
   */
  getAvailableLocales(): string[] {
    return Array.from(this.packages.keys())
  }

  /**
   * 获取已加载的语言包
   * @param locale 语言代码
   * @returns 语言包或 undefined
   */
  getLoadedPackage(locale: string): LanguagePackage | undefined {
    return this.loadedPackages.get(locale)
  }

  /**
   * 获取注册的语言包（无论是否已加载）
   * @param locale 语言代码
   * @returns 语言包或 undefined
   */
  getRegisteredPackage(locale: string): LanguagePackage | undefined {
    return this.packages.get(locale)
  }
}

/**
 * HTTP 语言包加载器（从远程服务器加载）
 */
export class HttpLoader extends EnhancedLoader {
  private baseUrl: string
  private fetchOptions: Record<string, unknown>

  constructor(
    baseUrl: string,
    fetchOptions: Record<string, unknown> = {},
    loaderOptions: LoaderOptions = {},
  ) {
    super(loaderOptions)
    this.baseUrl = baseUrl.replace(/\/$/, '') // 移除末尾的斜杠
    this.fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...((fetchOptions.headers as Record<string, string>) || {}),
      },
      ...fetchOptions,
    }
  }

  /**
   * 从远程服务器获取语言包
   * @param locale 语言代码
   * @returns 语言包
   */
  protected async loadLanguagePackage(locale: string): Promise<LanguagePackage> {
    const url = `${this.baseUrl}/${locale}.json`

    try {
      const response = await fetch(url, this.fetchOptions)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // 验证数据格式
      if (!this.isValidLanguagePackage(data)) {
        throw new Error('Invalid language package format')
      }

      return data as LanguagePackage
    }
    catch (error) {
      throw new Error(
        `Failed to fetch language package for '${locale}' from '${url}': ${error}`,
      )
    }
  }

  /**
   * 验证语言包格式
   * @param data 数据对象
   * @returns 是否为有效的语言包
   */
  private isValidLanguagePackage(data: unknown): data is LanguagePackage {
    return (
      data !== null
      && typeof data === 'object'
      && 'info' in data
      && typeof (data as LanguagePackage).info === 'object'
      && typeof (data as LanguagePackage).info.name === 'string'
      && typeof (data as LanguagePackage).info.code === 'string'
      && 'translations' in data
      && typeof (data as LanguagePackage).translations === 'object'
    )
  }

  /**
   * 获取已加载的语言包
   * @param locale 语言代码
   * @returns 语言包或 undefined
   */
  getLoadedPackage(locale: string): LanguagePackage | undefined {
    return this.loadedPackages.get(locale)
  }

  /**
   * 懒加载语言包的特定命名空间
   * @param locale 语言代码
   * @param namespace 命名空间
   * @returns 语言包的部分内容
   */
  async loadNamespace(locale: string, namespace: string): Promise<Partial<LanguagePackage>> {
    if (!this.options.lazyLoad?.enabled) {
      return this.load(locale)
    }

    const cacheKey = `${locale}:${namespace}`

    // 检查缓存
    if (this.loadedPackages.has(cacheKey)) {
      return this.loadedPackages.get(cacheKey)!
    }

    try {
      // 构建命名空间特定的 URL
      const url = this.buildNamespaceUrl(locale, namespace)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // 缓存命名空间数据
      this.loadedPackages.set(cacheKey, data)

      return data
    }
    catch (error) {
      throw new Error(
        `Failed to load namespace '${namespace}' for locale '${locale}': ${error}`
      )
    }
  }

  /**
   * 按需加载翻译键
   * @param locale 语言代码
   * @param keys 需要加载的键列表
   * @returns 包含指定键的翻译对象
   */
  async loadKeys(locale: string, keys: string[]): Promise<Record<string, any>> {
    if (!this.options.onDemand?.enabled || keys.length < (this.options.onDemand.threshold || 10)) {
      const fullPackage = await this.load(locale)
      return this.extractKeys(fullPackage.translations, keys)
    }

    try {
      // 构建按需加载的 URL
      const url = this.buildKeysUrl(locale, keys)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    }
    catch (error) {
      // 回退到完整加载
      const fullPackage = await this.load(locale)
      return this.extractKeys(fullPackage.translations, keys)
    }
  }

  /**
   * 预加载多个语言包
   * @param locales 语言代码列表
   * @param priority 加载优先级
   */
  async preloadLocales(locales: string[], priority: 'high' | 'normal' | 'low' = 'normal'): Promise<void> {
    const loadPromises = locales.map(locale =>
      this.loadWithPriority(locale, priority)
    )

    await Promise.allSettled(loadPromises)
  }

  /**
   * 带优先级的加载
   * @param locale 语言代码
   * @param priority 优先级
   */
  private async loadWithPriority(locale: string, priority: 'high' | 'normal' | 'low'): Promise<LanguagePackage> {
    // 根据优先级调整加载延迟
    const delay = priority === 'high' ? 0 : priority === 'normal' ? 100 : 500

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    return this.load(locale)
  }

  /**
   * 构建命名空间 URL
   * @param locale 语言代码
   * @param namespace 命名空间
   */
  private buildNamespaceUrl(locale: string, namespace: string): string {
    return `${this.baseUrl}/${locale}/${namespace}.json`
  }

  /**
   * 构建按需加载 URL
   * @param locale 语言代码
   * @param keys 键列表
   */
  private buildKeysUrl(locale: string, keys: string[]): string {
    const keyParams = keys.join(',')
    return `${this.baseUrl}/${locale}/keys?keys=${encodeURIComponent(keyParams)}`
  }

  /**
   * 从翻译对象中提取指定的键
   * @param translations 翻译对象
   * @param keys 键列表
   */
  private extractKeys(translations: Record<string, any>, keys: string[]): Record<string, any> {
    const result: Record<string, any> = {}

    for (const key of keys) {
      const value = this.getNestedValue(translations, key)
      if (value !== undefined) {
        this.setNestedValue(result, key, value)
      }
    }

    return result
  }

  /**
   * 获取嵌套对象的值
   * @param obj 对象
   * @param path 路径
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * 设置嵌套对象的值
   * @param obj 对象
   * @param path 路径
   * @param value 值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!

    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {}
      }
      return current[key]
    }, obj)

    target[lastKey] = value
  }
}
