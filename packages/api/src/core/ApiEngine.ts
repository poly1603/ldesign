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
import { createHttpClient } from '@ldesign/http'
import { CacheManager } from '../utils/CacheManager'
import { DebounceManagerImpl } from '../utils/DebounceManager'
import { DeduplicationManagerImpl } from '../utils/DeduplicationManager'
import { RequestQueueManager } from '../utils/RequestQueue'
import { version as libVersion } from '../version'

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
  private readonly circuitStates = new Map<string, { state: 'closed' | 'open' | 'half-open'; failureCount: number; successCount: number; nextTryAt: number }>()

  constructor(config: ApiEngineConfig = {}) {
    this.config = {
      appName: 'LDesign API',
      version: libVersion,
      debug: false,
      ...config,
      http: {
        timeout: 10000,
        ...(config.http || {}),
      },
      cache: {
        enabled: true,
        ttl: 300000, // 5分钟
        maxSize: 100,
        storage: 'memory',
        ...(config.cache || {}),
      },
      debounce: {
        enabled: true,
        delay: 300,
        ...(config.debounce || {}),
      },
      deduplication: {
        enabled: true,
        ...(config.deduplication || {}),
      },
    }

    // 创建 HTTP 客户端
    this.httpClient = createHttpClient(this.config.http!)

    // 创建管理器
    this.cacheManager = new CacheManager(this.config.cache!)
    this.debounceManager = new DebounceManagerImpl()
    this.deduplicationManager = new DeduplicationManagerImpl()

    // 创建请求队列（按需）
    if (this.config.queue?.enabled) {
      const q = {
        enabled: true,
        concurrency: this.config.queue.concurrency ?? 5,
        maxQueue: this.config.queue.maxQueue ?? 0,
      }
      this.requestQueueManager = new RequestQueueManager(q)
    }

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

    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(methodName, params)

      // 检查缓存
      if (!options.skipCache && this.shouldUseCache(methodConfig, options)) {
        const cachedData = this.cacheManager.get<T>(cacheKey)
        if (cachedData !== null) {
          this.log(`Cache hit for method "${methodName}"`)
          return cachedData
        }
      }

      // 组装中间件
      const reqMiddlewares = [
        ...(this.config.middlewares?.request || []),
        ...(methodConfig.middlewares?.request || []),
        ...(options.middlewares?.request || []),
      ]
      const resMiddlewares = [
        ...(this.config.middlewares?.response || []),
        ...(methodConfig.middlewares?.response || []),
        ...(options.middlewares?.response || []),
      ]
      const errMiddlewares = [
        ...(this.config.middlewares?.error || []),
        ...(methodConfig.middlewares?.error || []),
        ...(options.middlewares?.error || []),
      ]

      // 计算重试配置
      const retryConfig = {
        enabled: false,
        retries: 0,
        delay: 0,
        backoff: 'fixed' as 'fixed' | 'exponential',
        maxDelay: undefined as number | undefined,
        retryOn: (error: unknown, _attempt: number) => true,
        ...this.config.retry,
        ...methodConfig.retry,
        ...options.retry,
      }

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
          enabled: this.config.queue?.enabled ?? false,
          concurrency: this.config.queue?.concurrency ?? 5,
          maxQueue: this.config.queue?.maxQueue ?? 0,
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
          } else {
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
        const cb = {
          enabled: this.config.retry?.circuitBreaker?.enabled || methodConfig.retry?.circuitBreaker?.enabled || options.retry?.circuitBreaker?.enabled || false,
          failureThreshold: options.retry?.circuitBreaker?.failureThreshold ?? methodConfig.retry?.circuitBreaker?.failureThreshold ?? this.config.retry?.circuitBreaker?.failureThreshold ?? 5,
          halfOpenAfter: options.retry?.circuitBreaker?.halfOpenAfter ?? methodConfig.retry?.circuitBreaker?.halfOpenAfter ?? this.config.retry?.circuitBreaker?.halfOpenAfter ?? 30000,
          successThreshold: options.retry?.circuitBreaker?.successThreshold ?? methodConfig.retry?.circuitBreaker?.successThreshold ?? this.config.retry?.circuitBreaker?.successThreshold ?? 1,
        }

        if (cb.enabled) {
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
            this.circuitStates.set(methodName, { state: 'half-open', failureCount: st.failureCount, successCount: 0, nextTryAt: now + cb.halfOpenAfter })
          }
        }

        while (true) {
          try {
            const data = await performOnce()
            // 断路器成功反馈
            if (cb.enabled) {
              const st = this.circuitStates.get(methodName)
              if (st?.state === 'half-open') {
                const successCount = (st.successCount ?? 0) + 1
                if (successCount >= cb.successThreshold) {
                  this.circuitStates.set(methodName, { state: 'closed', failureCount: 0, successCount: 0, nextTryAt: 0 })
                }
                else {
                  this.circuitStates.set(methodName, { ...st, successCount })
                }
              }
              else if (!st || st.state !== 'closed') {
                this.circuitStates.set(methodName, { state: 'closed', failureCount: 0, successCount: 0, nextTryAt: 0 })
              }
            }

            // 缓存结果
            if (!options.skipCache && this.shouldUseCache(methodConfig, options)) {
              const cacheConfig = {
                ...this.config.cache,
                ...methodConfig.cache,
                ...options.cache,
              }
              this.cacheManager.set<T>(cacheKey, data, cacheConfig.ttl!)
            }

            // 成功回调
            methodConfig.onSuccess?.(data)
            options.onSuccess?.(data)

            return data
          }
          catch (err) {
            // 断路器失败反馈
            if (cb.enabled) {
              const st = this.circuitStates.get(methodName) ?? { state: 'closed', failureCount: 0, successCount: 0, nextTryAt: 0 }
              const failureCount = st.failureCount + 1
              if (st.state === 'half-open') {
                // 半开失败立即打开
                this.circuitStates.set(methodName, { state: 'open', failureCount, successCount: 0, nextTryAt: Date.now() + cb.halfOpenAfter })
              }
              else if (failureCount >= cb.failureThreshold) {
                this.circuitStates.set(methodName, { state: 'open', failureCount, successCount: 0, nextTryAt: Date.now() + cb.halfOpenAfter })
              }
              else {
                this.circuitStates.set(methodName, { ...st, failureCount })
              }
            }

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

              if (!options.skipCache && this.shouldUseCache(methodConfig, options)) {
                const cacheConfig = {
                  ...this.config.cache,
                  ...methodConfig.cache,
                  ...options.cache,
                }
                this.cacheManager.set<T>(cacheKey, data, cacheConfig.ttl!)
              }

              methodConfig.onSuccess?.(data)
              options.onSuccess?.(data)
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
            const baseDelay = retryConfig.delay || 0
            let delay = baseDelay
            if (retryConfig.backoff === 'exponential') {
              delay = baseDelay * Math.pow(2, attempt)
              if (retryConfig.maxDelay) {
                delay = Math.min(delay, retryConfig.maxDelay)
              }
            }
            const jitter = (retryConfig as any).jitter ?? this.config.retry?.jitter ?? 0
            if (typeof jitter === 'number' && jitter > 0) {
              const delta = delay * jitter
              const min = Math.max(0, delay - delta)
              const max = delay + delta
              delay = Math.floor(min + Math.random() * (max - min))
            }

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
          ...this.config.debounce,
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

      // 错误处理
      if (methodConfig.onError) {
        methodConfig.onError(error)
      }
      if (options.onError) {
        options.onError(error)
      }

      throw error
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
    const keyGenerator = this.config.cache?.keyGenerator
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
    const keyGenerator = this.config.deduplication?.keyGenerator
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
    const globalEnabled = this.config.cache?.enabled ?? true
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
    const globalEnabled = this.config.debounce?.enabled ?? true
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
    const globalEnabled = this.config.deduplication?.enabled ?? true
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
    const globalEnabled = this.config.queue?.enabled ?? false
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
   * 日志输出
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config.debug) {
      console.warn(`[API Engine] ${message}`, ...args)
    }
  }
}
