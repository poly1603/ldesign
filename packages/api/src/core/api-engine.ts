import type { ApiEngine, ApiEngineConfig, ApiMethod, ApiPlugin } from '../types'
import { createHttpClient, type HttpClient } from '@ldesign/http'
import { CacheManager } from './cache-manager'
import { DebounceManager } from './debounce-manager'
import { DeduplicationManager } from './deduplication-manager'
import { PluginManager } from './plugin-manager'

/**
 * API 引擎实现类
 */
export class ApiEngineImpl implements ApiEngine {
  /** 配置 */
  public readonly config: ApiEngineConfig

  /** HTTP 客户端 */
  private readonly httpClient: HttpClient

  /** 插件管理器 */
  private readonly pluginManager: PluginManager

  /** 缓存管理器 */
  private readonly cacheManager: CacheManager

  /** 防抖管理器 */
  private readonly debounceManager: DebounceManager

  /** 请求去重管理器 */
  private readonly deduplicationManager: DeduplicationManager

  /** API 方法注册表 */
  private readonly apiMethods = new Map<string, ApiMethod>()

  /** 是否已销毁 */
  private destroyed = false

  constructor(config: ApiEngineConfig = {}) {
    this.config = {
      debug: false,
      cache: {
        enabled: true,
        ttl: 300000, // 5分钟
        maxSize: 100,
        storage: 'memory',
        prefix: 'api_cache_',
      },
      debounce: {
        enabled: true,
        delay: 300,
      },
      deduplication: {
        enabled: true,
      },
      ...config,
    }

    // 创建 HTTP 客户端
    this.httpClient = createHttpClient(this.config.http)

    // 创建管理器
    this.pluginManager = new PluginManager(this)
    this.cacheManager = new CacheManager(this.config.cache!)
    this.debounceManager = new DebounceManager(this.config.debounce!)
    this.deduplicationManager = new DeduplicationManager(
      this.config.deduplication!
    )

    this.log('API Engine initialized', { config: this.config })
  }

  /**
   * 使用插件
   */
  async use(plugin: ApiPlugin): Promise<void> {
    this.checkDestroyed()
    await this.pluginManager.register(plugin)
  }

  /**
   * 注册 API 方法
   */
  register(name: string, method: ApiMethod): void {
    this.checkDestroyed()

    if (this.apiMethods.has(name)) {
      this.log(`API method "${name}" already exists, overriding`, { method })
    }

    this.apiMethods.set(name, { ...method, name })
    this.log(`API method "${name}" registered`, { method })
  }

  /**
   * 批量注册 API 方法
   */
  registerBatch(methods: Record<string, ApiMethod>): void {
    this.checkDestroyed()

    Object.entries(methods).forEach(([name, method]) => {
      this.register(name, method)
    })
  }

  /**
   * 调用 API 方法
   */
  async call<T = any, P = any>(name: string, params?: P): Promise<T> {
    this.checkDestroyed()

    const method = this.apiMethods.get(name)
    if (!method) {
      throw new Error(`API method "${name}" not found`)
    }

    this.log(`Calling API method "${name}"`, { params })

    try {
      // 生成请求配置
      const requestConfig =
        typeof method.config === 'function'
          ? method.config(params)
          : method.config

      // 检查缓存
      if (method.cache?.enabled !== false && this.config.cache?.enabled) {
        const cacheKey = this.generateCacheKey(name, params)
        const cachedResult = await this.cacheManager.get<T>(cacheKey)
        if (cachedResult !== null) {
          this.log(`Cache hit for API method "${name}"`, { cacheKey })
          return cachedResult
        }
      }

      // 请求去重
      if (
        method.deduplication !== false &&
        this.config.deduplication?.enabled
      ) {
        const deduplicationKey = this.generateDeduplicationKey(name, params)
        const result = await this.deduplicationManager.execute<T>(
          deduplicationKey,
          () => this.executeRequest<T>(method, requestConfig, params)
        )
        return result
      }

      // 防抖处理
      if (method.debounce?.enabled !== false && this.config.debounce?.enabled) {
        const debounceKey = this.generateDebounceKey(name, params)
        const delay =
          method.debounce?.delay ?? this.config.debounce?.delay ?? 300
        const result = await this.debounceManager.execute<T>(
          debounceKey,
          () => this.executeRequest<T>(method, requestConfig, params),
          delay
        )
        return result
      }

      // 直接执行请求
      return await this.executeRequest<T>(method, requestConfig, params)
    } catch (error) {
      this.log(`API method "${name}" failed`, { error })

      // 调用错误处理函数
      if (method.onError) {
        method.onError(error)
      }

      throw error
    }
  }

  /**
   * 获取 API 方法
   */
  getMethod(name: string): ApiMethod | undefined {
    return this.apiMethods.get(name)
  }

  /**
   * 获取所有 API 方法
   */
  getAllMethods(): Record<string, ApiMethod> {
    const result: Record<string, ApiMethod> = {}
    this.apiMethods.forEach((method, name) => {
      result[name] = method
    })
    return result
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    this.log('Destroying API Engine')

    // 清理资源
    this.apiMethods.clear()
    this.cacheManager.clear()
    this.debounceManager.clear()
    this.deduplicationManager.clear()

    this.destroyed = true
  }

  /**
   * 执行实际的 HTTP 请求
   */
  private async executeRequest<T>(
    method: ApiMethod,
    requestConfig: any,
    params?: any
  ): Promise<T> {
    // 发送 HTTP 请求
    const response = await this.httpClient.request(requestConfig)

    // 数据转换
    let result = response.data
    if (method.transform) {
      result = method.transform(result)
    }

    // 数据验证
    if (method.validate && !method.validate(result)) {
      throw new Error(`API method "${method.name}" response validation failed`)
    }

    // 缓存结果
    if (method.cache?.enabled !== false && this.config.cache?.enabled) {
      const cacheKey = this.generateCacheKey(method.name, params)
      const ttl = method.cache?.ttl ?? this.config.cache?.ttl ?? 300000
      await this.cacheManager.set(cacheKey, result, ttl)
    }

    return result
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(methodName: string, params?: any): string {
    const prefix = this.config.cache?.prefix ?? 'api_cache_'
    const paramsStr = params ? JSON.stringify(params) : ''
    return `${prefix}${methodName}_${this.hashCode(paramsStr)}`
  }

  /**
   * 生成防抖键
   */
  private generateDebounceKey(methodName: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : ''
    return `${methodName}_${this.hashCode(paramsStr)}`
  }

  /**
   * 生成请求去重键
   */
  private generateDeduplicationKey(methodName: string, params?: any): string {
    if (this.config.deduplication?.keyGenerator) {
      const requestConfig =
        typeof this.apiMethods.get(methodName)?.config === 'function'
          ? (this.apiMethods.get(methodName)!.config as Function)(params)
          : this.apiMethods.get(methodName)?.config
      return this.config.deduplication.keyGenerator(requestConfig)
    }

    const paramsStr = params ? JSON.stringify(params) : ''
    return `${methodName}_${this.hashCode(paramsStr)}`
  }

  /**
   * 简单哈希函数
   */
  private hashCode(str: string): number {
    let hash = 0
    if (str.length === 0) return hash
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash)
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('API Engine has been destroyed')
    }
  }

  /**
   * 日志输出
   */
  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[API Engine] ${message}`, data || '')
    }
  }
}

/**
 * 创建 API 引擎实例
 */
export function createApiEngine(config?: ApiEngineConfig): ApiEngine {
  return new ApiEngineImpl(config)
}
