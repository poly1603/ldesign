import type { LanguagePackage, Loader } from './types'

/**
 * 加载器配置选项
 */
export interface LoaderOptions {
  /** 最大重试次数 */
  maxRetries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 是否使用指数退避 */
  exponentialBackoff?: boolean
  /** 并行加载的最大数量 */
  maxConcurrent?: number
  /** 预加载优先级 */
  preloadPriority?: 'high' | 'normal' | 'low'
}

/**
 * 加载状态
 */
type LoadingState = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * 加载器统计信息
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
 */
export abstract class EnhancedLoader implements Loader {
  protected loadedPackages = new Map<string, LanguagePackage>()
  protected loadingPromises = new Map<string, Promise<LanguagePackage>>()
  protected loadingStates = new Map<string, LoadingState>()
  protected loadTimes = new Map<string, number>()
  protected stats: LoaderStats = {
    successCount: 0,
    errorCount: 0,
    cacheHits: 0,
    averageLoadTime: 0,
    currentConcurrent: 0,
  }

  protected options: Required<LoaderOptions>

  constructor(options: LoaderOptions = {}) {
    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      maxConcurrent: 5,
      preloadPriority: 'normal',
      ...options,
    }
  }

  /**
   * 加载语言包（带重试和并发控制）
   */
  async load(locale: string): Promise<LanguagePackage> {
    const startTime = performance.now()

    // 检查缓存
    if (this.loadedPackages.has(locale)) {
      this.stats.cacheHits++
      return this.loadedPackages.get(locale)!
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale)!
    }

    // 并发控制
    await this.waitForConcurrencySlot()

    // 开始加载
    this.loadingStates.set(locale, 'loading')
    this.stats.currentConcurrent++

    const loadingPromise = this.loadWithRetry(locale)
    this.loadingPromises.set(locale, loadingPromise)

    try {
      const languagePackage = await loadingPromise
      this.loadedPackages.set(locale, languagePackage)
      this.loadingStates.set(locale, 'loaded')
      this.stats.successCount++

      // 记录加载时间
      const loadTime = performance.now() - startTime
      this.loadTimes.set(locale, loadTime)
      this.updateAverageLoadTime(loadTime)

      return languagePackage
    }
    catch (error) {
      this.loadingStates.set(locale, 'error')
      this.stats.errorCount++
      throw error
    }
    finally {
      this.loadingPromises.delete(locale)
      this.stats.currentConcurrent--
    }
  }

  /**
   * 批量并行加载
   */
  async loadBatch(locales: string[]): Promise<Map<string, LanguagePackage | Error>> {
    const results = new Map<string, LanguagePackage | Error>()

    // 分批处理以控制并发
    const batches = this.chunkArray(locales, this.options.maxConcurrent)

    for (const batch of batches) {
      const promises = batch.map(async (locale) => {
        try {
          const pkg = await this.load(locale)
          results.set(locale, pkg)
        }
        catch (error) {
          results.set(locale, error as Error)
        }
      })

      await Promise.all(promises)
    }

    return results
  }

  /**
   * 智能预加载（支持优先级）
   */
  async preload(locale: string): Promise<void> {
    // 如果已经加载或正在加载，直接返回
    if (this.isLoaded(locale) || this.loadingPromises.has(locale)) {
      return
    }

    // 根据优先级决定是否立即加载
    if (this.options.preloadPriority === 'high') {
      await this.load(locale)
    }
    else {
      // 低优先级预加载，使用 requestIdleCallback 或 setTimeout
      this.schedulePreload(locale)
    }
  }

  /**
   * 带重试的加载
   */
  private async loadWithRetry(locale: string): Promise<LanguagePackage> {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await this.loadLanguagePackage(locale)
      }
      catch (error) {
        lastError = error as Error

        if (attempt < this.options.maxRetries) {
          const delay = this.calculateRetryDelay(attempt)
          await this.sleep(delay)
        }
      }
    }

    throw lastError
  }

  /**
   * 计算重试延迟
   */
  private calculateRetryDelay(attempt: number): number {
    if (!this.options.exponentialBackoff) {
      return this.options.retryDelay
    }

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
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
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
      // 使用预定义的语言包映射，避免动态导入问题
      const localeMap: Record<
        string,
        () => Promise<{ default: LanguagePackage }>
      > = {
        'en': () => import('../locales/en'),
        'zh-CN': () => import('../locales/zh-CN'),
        'ja': () => import('../locales/ja'),
      }

      const loader = localeMap[locale]
      if (!loader) {
        throw new Error(`Language package for '${locale}' is not available`)
      }

      const localeModule = await loader()

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
}
