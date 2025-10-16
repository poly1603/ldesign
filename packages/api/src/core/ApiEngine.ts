/**
 * API 引擎核心实现
 * 提供插件系统、方法注册、调用机制等核心功能
 */

import type { HttpClient } from '@ldesign/http'
import type {
  ApiCallOptions,
  ApiEngine,
  ApiEngineConfig,
  ApiMethodConfig,
  ApiPlugin,
  CacheStats,
  DebounceManager,
  DeduplicationManager,
} from '../types'
import type { ErrorReporter } from '../utils/ErrorReporter'
import type { PerformanceMonitor } from '../utils/PerformanceMonitor'
import type { ErrorMiddleware, RequestMiddleware, ResponseMiddleware } from '../types'
import { createHttpClient } from '@ldesign/http'
import { ApiError, ApiErrorFactory } from '../utils/ApiError'
import { CacheManager } from '../utils/CacheManager'
import { DebounceManagerImpl } from '../utils/DebounceManager'
import { DeduplicationManagerImpl } from '../utils/DeduplicationManager'
import { getGlobalErrorReporter } from '../utils/ErrorReporter'
import { getGlobalPerformanceMonitor } from '../utils/PerformanceMonitor'
import { LRUCache } from '../utils/LRUCache'
import { RequestQueueManager } from '../utils/RequestQueue'
import { version as libVersion } from '../version'

/**
 * 默认配置常量
 */
const DEFAULT_CONFIG = {
  HTTP_TIMEOUT: 10000,
  CACHE_TTL: 300000, // 5分钟
  CACHE_MAX_SIZE: 100,
  DEBOUNCE_DELAY: 300,
  DEFAULT_CONCURRENCY: 5,
  CIRCUIT_CLEANUP_INTERVAL: 3600000, // 1小时
  CIRCUIT_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24小时
} as const

/**
 * 断路器默认配置
 */
const DEFAULT_FAILURE_THRESHOLD = 5
const DEFAULT_HALF_OPEN_AFTER = 30000
const DEFAULT_SUCCESS_THRESHOLD = 1

/**
 * API 引擎实现类
 */
export class ApiEngineImpl implements ApiEngine {
  /** 配置 */
  public readonly config: ApiEngineConfig

  /** HTTP 客户端 */
  public readonly httpClient: HttpClient

  /** 已注册的插件 */
  public readonly plugins = new Map<string, ApiPlugin>()

  /** 已注册的方法 */
  public readonly methods = new Map<string, ApiMethodConfig>()

  /** 缓存管理器 */
  private readonly cacheManager: CacheManager

  /** 防抖管理器 */
  private readonly debounceManager: DebounceManager

  /** 去重管理器 */
  private readonly deduplicationManager: DeduplicationManager

  /** 请求队列管理器（可选） */
  private requestQueueManager: RequestQueueManager | null = null

  /** 是否已销毁 */
  private destroyed = false

  /** 断路器状态 */
  private readonly circuitStates = new Map<string, { state: 'closed' | 'open' | 'half-open', failureCount: number, successCount: number, nextTryAt: number }>()

  /** 错误报告器 */
  private errorReporter: ErrorReporter | null = null

  /** 性能监控器 */
  private performanceMonitor: PerformanceMonitor | null = null

  /** 断路器状态清理定时器 */
  private circuitStatesCleanupTimer: ReturnType<typeof setInterval> | null = null

  /** 中间件缓存 */
  private middlewareCache: LRUCache<{
    request: RequestMiddleware[]
    response: ResponseMiddleware[]
    error: ErrorMiddleware[]
  }>

  constructor(config: ApiEngineConfig = {}) {
    this.config = {
      appName: 'LDesign API',
      version: libVersion,
      debug: false,
      ...config,
      http: {
        timeout: DEFAULT_CONFIG.HTTP_TIMEOUT,
        ...(config.http || {}),
      },
      cache: {
        enabled: true,
        ttl: DEFAULT_CONFIG.CACHE_TTL,
        maxSize: DEFAULT_CONFIG.CACHE_MAX_SIZE,
        storage: 'memory',
        ...(config.cache || {}),
      },
      debounce: {
        enabled: true,
        delay: DEFAULT_CONFIG.DEBOUNCE_DELAY,
        ...(config.debounce || {}),
      },
      deduplication: {
        enabled: true,
        ...(config.deduplication || {}),
      },
    }

    // 创建 HTTP 客户端
    this.httpClient = createHttpClient(this.config?.http!)

    // 创建管理器
    this.cacheManager = new CacheManager(this.config?.cache!)
    this.debounceManager = new DebounceManagerImpl()
    this.deduplicationManager = new DeduplicationManagerImpl()

    // 初始化中间件缓存（最多缓存 100 个不同的中间件组合）
    this.middlewareCache = new LRUCache({
      maxSize: 100,
      defaultTTL: 3600000, // 1小时
      enabled: true,
    })

    // 创建请求队列（按需）
    if (this.config?.queue?.enabled) {
      const q = {
        enabled: true,
        concurrency: this.config?.queue.concurrency ?? DEFAULT_CONFIG.DEFAULT_CONCURRENCY,
        maxQueue: this.config?.queue.maxQueue ?? 0,
      }
      this.requestQueueManager = new RequestQueueManager(q)
    }

    // 初始化错误报告器
    this.errorReporter = getGlobalErrorReporter()

    // 初始化性能监控器
    this.performanceMonitor = getGlobalPerformanceMonitor()

    // 启动断路器状态清理定时器
    this.startCircuitBreakerCleanup()

    this.log('API Engine initialized', this.config)
  }

  /**
   * 注册插件
   */
  async use(plugin: ApiPlugin): Promise<void> {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }

    if (this.plugins.has(plugin.name)) {
      this.log(`Plugin "${plugin.name}" already registered, skipping`)
      return
    }

    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(
            `Plugin "${plugin.name}" depends on "${dep}", but it's not registered`,
          )
        }
      }
    }

    // 注册 API 方法
    if (plugin.apis) {
      for (const [methodName, methodConfig] of Object.entries(plugin.apis)) {
        this.register(methodName, methodConfig)
      }
    }

    // 执行插件安装
    if (plugin.install) {
      await plugin.install(this)
    }

    this.plugins.set(plugin.name, plugin)
    this.log(`Plugin "${plugin.name}" registered successfully`)
  }

  /**
   * 卸载插件
   */
  async unuse(pluginName: string): Promise<void> {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }

    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      this.log(`Plugin "${pluginName}" not found, skipping`)
      return
    }

    // 检查是否有其他插件依赖此插件
    for (const [name, p] of this.plugins) {
      if (name !== pluginName && p.dependencies?.includes(pluginName)) {
        throw new Error(
          `Cannot uninstall plugin "${pluginName}" because "${name}" depends on it`,
        )
      }
    }

    // 卸载 API 方法
    if (plugin.apis) {
      for (const methodName of Object.keys(plugin.apis)) {
        this.unregister(methodName)
      }
    }

    // 执行插件卸载
    if (plugin.uninstall) {
      await plugin.uninstall(this)
    }

    this.plugins.delete(pluginName)
    this.log(`Plugin "${pluginName}" uninstalled successfully`)
  }

  /**
   * 注册 API 方法
   */
  register(methodName: string, config: ApiMethodConfig): void {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }

    if (this.methods.has(methodName)) {
      this.log(`Method "${methodName}" already registered, overriding`)
    }

    this.methods.set(methodName, config)
    this.log(`Method "${methodName}" registered successfully`)
  }

  /**
   * 注册多个 API 方法
   */
  registerBatch(methods: Record<string, ApiMethodConfig>): void {
    for (const [methodName, config] of Object.entries(methods)) {
      this.register(methodName, config)
    }
  }

  /**
   * 取消注册 API 方法
   */
  unregister(methodName: string): void {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }

    if (this.methods.has(methodName)) {
      this.methods.delete(methodName)
      this.log(`Method "${methodName}" unregistered successfully`)
    }
  }

  /**
   * 检查缓存并返回缓存数据（如果存在）
   */
  private checkCache<T>(
    methodName: string,
    params: unknown,
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
    cacheKey: string,
  ): T | null {
    if (!options.skipCache && this.shouldUseCache(methodConfig, options)) {
      const cachedData = this.cacheManager.get<T>(cacheKey)
      if (cachedData !== null) {
        this.log(`Cache hit for method "${methodName}"`)
        return cachedData
      }
    }
    return null
  }

  /**
   * 构建重试配置
   */
  private buildRetryConfig(
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ) {
    return {
      enabled: false,
      retries: 0,
      delay: 0,
      backoff: 'fixed' as 'fixed' | 'exponential',
      maxDelay: undefined as number | undefined,
      retryOn: (error: unknown, _attempt: number) => true,
      ...this.config?.retry,
      ...methodConfig.retry,
      ...options.retry,
    }
  }

  /**
   * 构建断路器配置
   */
  private buildCircuitBreakerConfig(
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ) {
    return {
      enabled: this.config?.retry?.circuitBreaker?.enabled || methodConfig.retry?.circuitBreaker?.enabled || options.retry?.circuitBreaker?.enabled || false,
      failureThreshold: options.retry?.circuitBreaker?.failureThreshold ?? methodConfig.retry?.circuitBreaker?.failureThreshold ?? this.config?.retry?.circuitBreaker?.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD,
      halfOpenAfter: options.retry?.circuitBreaker?.halfOpenAfter ?? methodConfig.retry?.circuitBreaker?.halfOpenAfter ?? this.config?.retry?.circuitBreaker?.halfOpenAfter ?? DEFAULT_HALF_OPEN_AFTER,
      successThreshold: options.retry?.circuitBreaker?.successThreshold ?? methodConfig.retry?.circuitBreaker?.successThreshold ?? this.config?.retry?.circuitBreaker?.successThreshold ?? DEFAULT_SUCCESS_THRESHOLD,
    }
  }

  /**
   * 检查断路器状态并抛出错误（如果需要）
   */
  private checkCircuitBreaker(
    methodName: string,
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
    cb: ReturnType<typeof this.buildCircuitBreakerConfig>,
  ): void {
    if (!cb.enabled) {
      return
    }

    const st = this.circuitStates.get(methodName)
    const now = Date.now()
    
    if (st?.state === 'open' && now < st.nextTryAt) {
      const err = new Error(`Circuit breaker open for method "${methodName}"`)
      methodConfig.onError?.(err)
      options.onError?.(err)
      throw err
    }
    
    if (st?.state === 'open' && now >= st.nextTryAt) {
      // 半开
      this.circuitStates.set(methodName, { 
        state: 'half-open', 
        failureCount: st.failureCount, 
        successCount: 0, 
        nextTryAt: now + cb.halfOpenAfter,
      })
    }
  }

  /**
   * 处理断路器成功反馈
   */
  private handleCircuitBreakerSuccess(
    methodName: string,
    cb: ReturnType<typeof this.buildCircuitBreakerConfig>,
  ): void {
    if (!cb.enabled) {
      return
    }

    const st = this.circuitStates.get(methodName)
    if (st?.state === 'half-open') {
      const successCount = (st.successCount ?? 0) + 1
      if (successCount >= cb.successThreshold) {
        this.circuitStates.set(methodName, { 
          state: 'closed', 
          failureCount: 0, 
          successCount: 0, 
          nextTryAt: 0,
        })
      }
      else {
        this.circuitStates.set(methodName, { ...st, successCount })
      }
    }
    else if (!st || st.state !== 'closed') {
      this.circuitStates.set(methodName, { 
        state: 'closed', 
        failureCount: 0, 
        successCount: 0, 
        nextTryAt: 0,
      })
    }
  }

  /**
   * 处理断路器失败反馈
   */
  private handleCircuitBreakerFailure(
    methodName: string,
    cb: ReturnType<typeof this.buildCircuitBreakerConfig>,
  ): void {
    if (!cb.enabled) {
      return
    }

    const st = this.circuitStates.get(methodName) ?? { 
      state: 'closed' as const, 
      failureCount: 0, 
      successCount: 0, 
      nextTryAt: 0,
    }
    const failureCount = st.failureCount + 1
    
    if (st.state === 'half-open') {
      // 半开失败立即打开
      this.circuitStates.set(methodName, { 
        state: 'open', 
        failureCount, 
        successCount: 0, 
        nextTryAt: Date.now() + cb.halfOpenAfter,
      })
    }
    else if (failureCount >= cb.failureThreshold) {
      this.circuitStates.set(methodName, { 
        state: 'open', 
        failureCount, 
        successCount: 0, 
        nextTryAt: Date.now() + cb.halfOpenAfter,
      })
    }
    else {
      this.circuitStates.set(methodName, { ...st, failureCount })
    }
  }

  /**
   * 缓存成功结果
   */
  private cacheResult<T>(
    cacheKey: string,
    data: T,
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): void {
    if (!options.skipCache && this.shouldUseCache(methodConfig, options)) {
      const cacheConfig = {
        ...this.config?.cache,
        ...methodConfig.cache,
        ...options.cache,
      }
      this.cacheManager.set<T>(cacheKey, data, cacheConfig.ttl!)
    }
  }

  /**
   * 调用成功回调
   */
  private invokeSuccessCallbacks<T>(
    data: T,
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): void {
    methodConfig.onSuccess?.(data)
    options.onSuccess?.(data)
  }

  /**
   * 计算重试延迟（包括错动）
   */
  private calculateRetryDelay(
    attempt: number,
    retryConfig: ReturnType<typeof this.buildRetryConfig>,
  ): number {
    const baseDelay = retryConfig.delay || 0
    let delay = baseDelay
    
    if (retryConfig.backoff === 'exponential') {
      delay = baseDelay * 2 ** attempt
      if (retryConfig.maxDelay) {
        delay = Math.min(delay, retryConfig.maxDelay)
      }
    }
    
    const jitter = (retryConfig as any).jitter ?? this.config?.retry?.jitter ?? 0
    if (typeof jitter === 'number' && jitter > 0) {
      const delta = delay * jitter
      const min = Math.max(0, delay - delta)
      const max = delay + delta
      delay = Math.floor(min + Math.random() * (max - min))
    }
    
    return delay
  }

  /**
   * 调用 API 方法
   */
  async call<T = unknown>(
    methodName: string,
    params?: unknown,
    options: ApiCallOptions = {},
  ): Promise<T> {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }

    const methodConfig = this.methods.get(methodName)
    if (!methodConfig) {
      throw new Error(`Method "${methodName}" not found`)
    }

    // 开始性能监控
    const endMonitoring = this.performanceMonitor?.startCall(methodName, params) || (() => {})

    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(methodName, params)

      // 检查缓存
      const cachedData = this.checkCache<T>(methodName, params, methodConfig, options, cacheKey)
      if (cachedData !== null) {
        endMonitoring() // 成功结束监控
        return cachedData
      }

      // 获取中间件（带缓存）
      const middlewares = this.getMiddlewares(methodName, methodConfig, options)
      const reqMiddlewares = middlewares.request
      const resMiddlewares = middlewares.response
      const errMiddlewares = middlewares.error

      // 计算重试配置
      const retryConfig = this.buildRetryConfig(methodConfig, options)

      const ctx = { methodName, params, engine: this }

      const performOnce = async (): Promise<T> => {
        // 生成请求配置
        const requestConfigRaw
          = typeof methodConfig.config === 'function'
            ? methodConfig.config(params)
            : methodConfig.config

        // 规范化请求配置（解析函数型 headers/data/params）
        let requestConfig = this.normalizeRequestConfig(requestConfigRaw, params)

        // 请求中间件
        for (const mw of reqMiddlewares) {
          requestConfig = await Promise.resolve(mw(requestConfig, ctx))
        }

        // 发送请求（可选队列）
        const useQueue = this.shouldUseQueue(methodConfig, options)
        const effectiveQueue = {
          enabled: this.config?.queue?.enabled ?? false,
          concurrency: this.config?.queue?.concurrency ?? 5,
          maxQueue: this.config?.queue?.maxQueue ?? 0,
          ...methodConfig.queue,
          ...options.queue,
        }

        const send = () => this.httpClient.request(requestConfig)

        let response
        if (useQueue) {
          if (!this.requestQueueManager) {
            this.requestQueueManager = new RequestQueueManager({
              enabled: true,
              concurrency: effectiveQueue.concurrency ?? 5,
              maxQueue: effectiveQueue.maxQueue ?? 0,
            })
          }
          else {
            this.requestQueueManager.updateConfig({
              concurrency: effectiveQueue.concurrency,
              maxQueue: effectiveQueue.maxQueue,
            })
          }
          response = await this.requestQueueManager.enqueue(send, options.priority ?? 0)
        }
        else {
          response = await send()
        }

        // 响应中间件
        for (const mw of resMiddlewares) {
          response = await Promise.resolve(mw(response, { ...ctx, request: requestConfig }))
        }

        // 数据转换
        let data = response.data
        if (methodConfig.transform) {
          data = methodConfig.transform(response)
        }

        // 数据验证
        if (methodConfig.validate && !methodConfig.validate(data)) {
          throw new Error(`Data validation failed for method "${methodName}"`)
        }

        return data
      }

      // 含重试的执行器
      const executeWithRetry = async (): Promise<T> => {
        let attempt = 0

        // 断路器预检查
        const cb = this.buildCircuitBreakerConfig(methodConfig, options)
        this.checkCircuitBreaker(methodName, methodConfig, options, cb)

        while (true) {
          try {
            const data = await performOnce()
            // 断路器成功反馈
            this.handleCircuitBreakerSuccess(methodName, cb)

            // 缓存结果
            this.cacheResult(cacheKey, data, methodConfig, options)

            // 成功回调
            this.invokeSuccessCallbacks(data, methodConfig, options)

            // 结束性能监控（成功）
            endMonitoring()

            return data
          }
          catch (err) {
            // 断路器失败反馈
            this.handleCircuitBreakerFailure(methodName, cb)

            // 错误中间件尝试恢复
            let recovered: any | undefined
            for (const mw of errMiddlewares) {
              const res = await Promise.resolve(mw(err, { ...ctx, attempt }))
              if (res && typeof res === 'object' && 'data' in res) {
                recovered = res
                break
              }
            }

            if (recovered) {
              // 中间件已经构造了一个响应，走后续数据处理
              let data: any = recovered.data
              if (methodConfig.transform) {
                data = methodConfig.transform(recovered)
              }
              if (methodConfig.validate && !methodConfig.validate(data)) {
                throw new Error(`Data validation failed for method "${methodName}"`)
              }

              this.cacheResult(cacheKey, data, methodConfig, options)
              this.invokeSuccessCallbacks(data, methodConfig, options)
              return data
            }

            // 决定是否重试
            const canRetry = retryConfig.enabled && attempt < (retryConfig.retries || 0)
              && (retryConfig.retryOn?.(err, attempt) ?? true)

            if (!canRetry) {
              // 调用错误回调
              methodConfig.onError?.(err)
              options.onError?.(err)
              throw err
            }

            // 退避计算 + 抖动
            const delay = this.calculateRetryDelay(attempt, retryConfig)
            await new Promise(resolve => globalThis.setTimeout(resolve, delay))
            attempt++
          }
        }
      }

      // 请求去重
      if (
        !options.skipDeduplication
        && this.shouldUseDeduplication(methodConfig, options)
      ) {
        const deduplicationKey = this.generateDeduplicationKey(
          methodName,
          params,
        )
        return await this.deduplicationManager.execute(
          deduplicationKey,
          executeWithRetry,
        )
      }

      // 防抖处理
      if (
        !options.skipDebounce
        && this.shouldUseDebounce(methodConfig, options)
      ) {
        const debounceKey = this.generateDebounceKey(methodName, params)
        const debounceConfig = {
          ...this.config?.debounce,
          ...methodConfig.debounce,
          ...options.debounce,
        }
        return await this.debounceManager.execute(
          debounceKey,
          executeWithRetry,
          debounceConfig.delay!,
        )
      }

      // 直接执行
      return await executeWithRetry()
    }
    catch (error) {
      this.log(`Error calling method "${methodName}":`, error)

      // 创建增强的错误对象
      const apiError = this.createApiError(error, {
        methodName,
        params,
        config: methodConfig,
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      })

      // 报告错误
      this.reportError(apiError)

      // 结束性能监控（错误）
      endMonitoring(apiError)

      // 错误处理
      if (methodConfig.onError) {
        methodConfig.onError(apiError)
      }
      if (options.onError) {
        options.onError(apiError)
      }

      throw apiError
    }
  }

  /**
   * 批量调用 API 方法
   */
  async callBatch<T = unknown>(
    calls: Array<{ methodName: string, params?: unknown, options?: ApiCallOptions }>,
  ): Promise<T[]> {
    const promises = calls.map(({ methodName, params, options }) =>
      this.call<T>(methodName, params, options),
    )
    return Promise.all(promises)
  }

  /**
   * 检查方法是否存在
   */
  hasMethod(methodName: string): boolean {
    return this.methods.has(methodName)
  }

  /**
   * 获取所有方法名称
   */
  getMethodNames(): string[] {
    return Array.from(this.methods.keys())
  }

  /**
   * 清除缓存
   */
  clearCache(methodName?: string): void {
    if (methodName) {
      // 清除特定方法的缓存
      const pattern = new RegExp(`^${methodName}:`)
      this.cacheManager.clearByPattern(pattern)
    }
    else {
      // 清除所有缓存
      this.cacheManager.clear()
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): CacheStats {
    return this.cacheManager.getStats()
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    // 清理断路器状态定时器
    if (this.circuitStatesCleanupTimer) {
      clearInterval(this.circuitStatesCleanupTimer)
      this.circuitStatesCleanupTimer = null
    }

    // 清理断路器状态
    this.circuitStates.clear()

    // 清理中间件缓存
    this.middlewareCache.destroy()

    // 优先调用管理器的销毁方法以清理定时器等资源
    if (typeof (this.cacheManager as unknown as { destroy?: () => void }).destroy === 'function') {
      ; (this.cacheManager as unknown as { destroy: () => void }).destroy()
    }
    else {
      this.cacheManager.clear()
    }

    this.debounceManager.clear()

    if (typeof (this.deduplicationManager as unknown as { destroy?: () => void }).destroy === 'function') {
      ; (this.deduplicationManager as unknown as { destroy: () => void }).destroy()
    }
    else {
      this.deduplicationManager.clear()
    }

    this.plugins.clear()
    this.methods.clear()

    this.destroyed = true
    this.log('API Engine destroyed')
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(methodName: string, params?: unknown): string {
    const keyGenerator = this.config?.cache?.keyGenerator
    if (keyGenerator) {
      return keyGenerator(methodName, params)
    }
    return `${methodName}:${JSON.stringify(params || {})}`
  }

  /**
   * 生成防抖键
   */
  private generateDebounceKey(methodName: string, params?: unknown): string {
    return `${methodName}:${JSON.stringify(params || {})}`
  }

  /**
   * 生成去重键
   */
  private generateDeduplicationKey(methodName: string, params?: unknown): string {
    const keyGenerator = this.config?.deduplication?.keyGenerator
    if (keyGenerator) {
      return keyGenerator(methodName, params)
    }
    return `${methodName}:${JSON.stringify(params || {})}`
  }

  /**
   * 判断是否应该使用缓存
   */
  private shouldUseCache(
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): boolean {
    const globalEnabled = this.config?.cache?.enabled ?? true
    const methodEnabled = methodConfig.cache?.enabled ?? true
    const optionEnabled = options.cache?.enabled ?? true
    return globalEnabled && methodEnabled && optionEnabled
  }

  /**
   * 判断是否应该使用防抖
   */
  private shouldUseDebounce(
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): boolean {
    const globalEnabled = this.config?.debounce?.enabled ?? true
    const methodEnabled = methodConfig.debounce?.enabled ?? true
    const optionEnabled = options.debounce?.enabled ?? true
    return globalEnabled && methodEnabled && optionEnabled
  }

  /**
   * 判断是否应该使用去重
   */
  private shouldUseDeduplication(
    methodConfig: ApiMethodConfig,
    _options: ApiCallOptions,
  ): boolean {
    const globalEnabled = this.config?.deduplication?.enabled ?? true
    const methodEnabled = methodConfig.deduplication?.enabled ?? true
    return globalEnabled && methodEnabled
  }

  /**
   * 判断是否使用请求队列
   */
  private shouldUseQueue(
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): boolean {
    const globalEnabled = this.config?.queue?.enabled ?? false
    const methodEnabled = methodConfig.queue?.enabled ?? undefined
    const optionEnabled = options.queue?.enabled ?? undefined

    const decided = optionEnabled ?? methodEnabled ?? globalEnabled
    return !!decided
  }

  /**
   * 将可能包含函数值的请求配置规范化
   */
  private normalizeRequestConfig(config: any, params?: unknown): any {
    const normalized = { ...config }

    // 解析 data 为函数的情况
    if (typeof normalized.data === 'function') {
      try {
        normalized.data = normalized.data.length > 0 ? normalized.data(params) : normalized.data()
      }
      catch {
        // 保持原值以避免破坏调用
      }
    }

    // 解析 params 为函数的情况
    if (typeof normalized.params === 'function') {
      try {
        normalized.params = normalized.params.length > 0 ? normalized.params(params) : normalized.params()
      }
      catch {
        // 忽略解析错误
      }
    }

    // 解析 headers 中函数值
    if (normalized.headers && typeof normalized.headers === 'object') {
      const headers: Record<string, unknown> = { ...normalized.headers }
      for (const key of Object.keys(headers)) {
        const val = (headers as Record<string, unknown>)[key]
        if (typeof val === 'function') {
          try {
            ; (headers as Record<string, unknown>)[key] = (val as (...args: unknown[]) => unknown).length > 0
              ? (val as (p?: unknown) => unknown)(params)
              : (val as () => unknown)()
          }
          catch {
            // 解析失败则保留原值
          }
        }
      }
      normalized.headers = headers
    }

    return normalized
  }

  /**
   * 创建API错误对象
   */
  private createApiError(error: unknown, context: any): ApiError {
    if (error instanceof ApiError) {
      return error
    }

    // 检查是否是HTTP响应错误
    if (error && typeof error === 'object' && 'response' in error) {
      return ApiErrorFactory.fromHttpResponse(error, context)
    }

    // 检查是否是网络错误
    if (error instanceof Error) {
      return ApiErrorFactory.fromNetworkError(error, context)
    }

    // 其他未知错误
    return ApiErrorFactory.fromUnknownError(error, context)
  }

  /**
   * 报告错误
   */
  private reportError(error: ApiError): void {
    if (this.errorReporter) {
      this.errorReporter.report(error)
    }
  }

  /**
   * 设置错误报告器
   */
  setErrorReporter(reporter: ErrorReporter | null): void {
    this.errorReporter = reporter
  }

  /**
   * 获取错误报告器
   */
  getErrorReporter(): ErrorReporter | null {
    return this.errorReporter
  }

  /**
   * 设置性能监控器
   */
  setPerformanceMonitor(monitor: PerformanceMonitor | null): void {
    this.performanceMonitor = monitor
  }

  /**
   * 获取性能监控器
   */
  getPerformanceMonitor(): PerformanceMonitor | null {
    return this.performanceMonitor
  }

  /**
   * 获取中间件数组（带缓存）
   */
  private getMiddlewares(
    methodName: string,
    methodConfig: ApiMethodConfig,
    options: ApiCallOptions,
  ): {
    request: RequestMiddleware[]
    response: ResponseMiddleware[]
    error: ErrorMiddleware[]
  } {
    // 如果 options 中有中间件，不使用缓存
    if (options.middlewares) {
      return {
        request: [
          ...(this.config?.middlewares?.request || []),
          ...(methodConfig.middlewares?.request || []),
          ...(options.middlewares?.request || []),
        ],
        response: [
          ...(this.config?.middlewares?.response || []),
          ...(methodConfig.middlewares?.response || []),
          ...(options.middlewares?.response || []),
        ],
        error: [
          ...(this.config?.middlewares?.error || []),
          ...(methodConfig.middlewares?.error || []),
          ...(options.middlewares?.error || []),
        ],
      }
    }

    // 尝试从缓存获取
    const cacheKey = methodName
    const cached = this.middlewareCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // 创建新的中间件数组
    const middlewares = {
      request: [
        ...(this.config?.middlewares?.request || []),
        ...(methodConfig.middlewares?.request || []),
      ],
      response: [
        ...(this.config?.middlewares?.response || []),
        ...(methodConfig.middlewares?.response || []),
      ],
      error: [
        ...(this.config?.middlewares?.error || []),
        ...(methodConfig.middlewares?.error || []),
      ],
    }

    // 存入缓存
    this.middlewareCache.set(cacheKey, middlewares)

    return middlewares
  }

  /**
   * 启动断路器状态清理定时器
   */
  private startCircuitBreakerCleanup(): void {
    // 每小时清理一次过期的断路器状态
    this.circuitStatesCleanupTimer = setInterval(() => {
      const now = Date.now()
      const expiredKeys: string[] = []

      for (const [methodName, state] of this.circuitStates.entries()) {
        // 清理24小时未使用的状态（closed 且 failureCount 为 0）
        if (
          state.state === 'closed'
          && state.failureCount === 0
          && now - state.nextTryAt > DEFAULT_CONFIG.CIRCUIT_EXPIRE_TIME
        ) {
          expiredKeys.push(methodName)
        }
      }

      // 批量删除过期项
      expiredKeys.forEach((key) => {
        this.circuitStates.delete(key)
      })

      if (expiredKeys.length > 0) {
        this.log(`Cleaned up ${expiredKeys.length} expired circuit breaker states`)
      }
    }, DEFAULT_CONFIG.CIRCUIT_CLEANUP_INTERVAL)
  }

  /**
   * 日志输出
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config?.debug) {
      console.warn(`[API Engine] ${message}`, ...args)
    }
  }
}
