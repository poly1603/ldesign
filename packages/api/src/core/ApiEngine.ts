/**
 * API 引擎核心实现
 * 提供插件系统、方法注册、调用机制等核心功能
 */

import { createHttpClient } from '@ldesign/http'
import type { HttpClient } from '@ldesign/http'
import type {
  ApiEngine,
  ApiEngineConfig,
  ApiPlugin,
  ApiMethodConfig,
  ApiCallOptions,
  CacheStats,
  CacheItem,
  DebounceManager,
  DeduplicationManager,
} from '../types'
import { CacheManager } from '../utils/CacheManager'
import { DebounceManagerImpl } from '../utils/DebounceManager'
import { DeduplicationManagerImpl } from '../utils/DeduplicationManager'

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

  /** 是否已销毁 */
  private destroyed = false

  constructor(config: ApiEngineConfig = {}) {
    this.config = {
      appName: 'LDesign API',
      version: '1.0.0',
      debug: false,
      http: {
        timeout: 10000,
        ...config.http,
      },
      cache: {
        enabled: true,
        ttl: 300000, // 5分钟
        maxSize: 100,
        storage: 'memory',
        ...config.cache,
      },
      debounce: {
        enabled: true,
        delay: 300,
        ...config.debounce,
      },
      deduplication: {
        enabled: true,
        ...config.deduplication,
      },
      ...config,
    }

    // 创建 HTTP 客户端
    this.httpClient = createHttpClient(this.config.http!)

    // 创建管理器
    this.cacheManager = new CacheManager(this.config.cache!)
    this.debounceManager = new DebounceManagerImpl()
    this.deduplicationManager = new DeduplicationManagerImpl()

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
          throw new Error(`Plugin "${plugin.name}" depends on "${dep}", but it's not registered`)
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
        throw new Error(`Cannot uninstall plugin "${pluginName}" because "${name}" depends on it`)
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
  async call<T = any>(methodName: string, params?: any, options: ApiCallOptions = {}): Promise<T> {
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
        const cachedData = this.cacheManager.get(cacheKey)
        if (cachedData !== null) {
          this.log(`Cache hit for method "${methodName}"`)
          return cachedData
        }
      }

      // 创建执行函数
      const executeRequest = async (): Promise<T> => {
        // 生成请求配置
        const requestConfig = typeof methodConfig.config === 'function'
          ? methodConfig.config(params)
          : methodConfig.config

        // 发送请求
        const response = await this.httpClient.request(requestConfig)

        // 数据转换
        let data = response.data
        if (methodConfig.transform) {
          data = methodConfig.transform(response)
        }

        // 数据验证
        if (methodConfig.validate && !methodConfig.validate(data)) {
          throw new Error(`Data validation failed for method "${methodName}"`)
        }

        // 缓存结果
        if (!options.skipCache && this.shouldUseCache(methodConfig, options)) {
          const cacheConfig = { ...this.config.cache, ...methodConfig.cache, ...options.cache }
          this.cacheManager.set(cacheKey, data, cacheConfig.ttl!)
        }

        // 成功回调
        if (methodConfig.onSuccess) {
          methodConfig.onSuccess(data)
        }
        if (options.onSuccess) {
          options.onSuccess(data)
        }

        return data
      }

      // 请求去重
      if (!options.skipDeduplication && this.shouldUseDeduplication(methodConfig, options)) {
        const deduplicationKey = this.generateDeduplicationKey(methodName, params)
        return await this.deduplicationManager.execute(deduplicationKey, executeRequest)
      }

      // 防抖处理
      if (!options.skipDebounce && this.shouldUseDebounce(methodConfig, options)) {
        const debounceKey = this.generateDebounceKey(methodName, params)
        const debounceConfig = { ...this.config.debounce, ...methodConfig.debounce, ...options.debounce }
        return await this.debounceManager.execute(debounceKey, executeRequest, debounceConfig.delay!)
      }

      // 直接执行
      return await executeRequest()
    } catch (error) {
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
  async callBatch<T = any>(calls: Array<{ methodName: string; params?: any; options?: ApiCallOptions }>): Promise<T[]> {
    const promises = calls.map(({ methodName, params, options }) =>
      this.call<T>(methodName, params, options)
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
    } else {
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

    this.cacheManager.clear()
    this.debounceManager.clear()
    this.deduplicationManager.clear()
    this.plugins.clear()
    this.methods.clear()

    this.destroyed = true
    this.log('API Engine destroyed')
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(methodName: string, params?: any): string {
    const keyGenerator = this.config.cache?.keyGenerator
    if (keyGenerator) {
      return keyGenerator(methodName, params)
    }
    return `${methodName}:${JSON.stringify(params || {})}`
  }

  /**
   * 生成防抖键
   */
  private generateDebounceKey(methodName: string, params?: any): string {
    return `${methodName}:${JSON.stringify(params || {})}`
  }

  /**
   * 生成去重键
   */
  private generateDeduplicationKey(methodName: string, params?: any): string {
    const keyGenerator = this.config.deduplication?.keyGenerator
    if (keyGenerator) {
      return keyGenerator(methodName, params)
    }
    return `${methodName}:${JSON.stringify(params || {})}`
  }

  /**
   * 判断是否应该使用缓存
   */
  private shouldUseCache(methodConfig: ApiMethodConfig, options: ApiCallOptions): boolean {
    const globalEnabled = this.config.cache?.enabled ?? true
    const methodEnabled = methodConfig.cache?.enabled ?? true
    const optionEnabled = options.cache?.enabled ?? true
    return globalEnabled && methodEnabled && optionEnabled
  }

  /**
   * 判断是否应该使用防抖
   */
  private shouldUseDebounce(methodConfig: ApiMethodConfig, options: ApiCallOptions): boolean {
    const globalEnabled = this.config.debounce?.enabled ?? true
    const methodEnabled = methodConfig.debounce?.enabled ?? true
    const optionEnabled = options.debounce?.enabled ?? true
    return globalEnabled && methodEnabled && optionEnabled
  }

  /**
   * 判断是否应该使用去重
   */
  private shouldUseDeduplication(methodConfig: ApiMethodConfig, options: ApiCallOptions): boolean {
    const globalEnabled = this.config.deduplication?.enabled ?? true
    const methodEnabled = methodConfig.deduplication?.enabled ?? true
    return globalEnabled && methodEnabled
  }

  /**
   * 日志输出
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[API Engine] ${message}`, ...args)
    }
  }
}
