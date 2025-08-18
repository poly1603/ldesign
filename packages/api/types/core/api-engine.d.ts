import {
  ApiEngine,
  ApiEngineConfig,
  ApiPlugin,
  ApiMethod,
} from '../types/index.js'

/**
 * API 引擎实现类
 */
declare class ApiEngineImpl implements ApiEngine {
  /** 配置 */
  readonly config: ApiEngineConfig
  /** HTTP 客户端 */
  private readonly httpClient
  /** 插件管理器 */
  private readonly pluginManager
  /** 缓存管理器 */
  private readonly cacheManager
  /** 防抖管理器 */
  private readonly debounceManager
  /** 请求去重管理器 */
  private readonly deduplicationManager
  /** API 方法注册表 */
  private readonly apiMethods
  /** 是否已销毁 */
  private destroyed
  constructor(config?: ApiEngineConfig)
  /**
   * 使用插件
   */
  use(plugin: ApiPlugin): Promise<void>
  /**
   * 注册 API 方法
   */
  register(name: string, method: ApiMethod): void
  /**
   * 批量注册 API 方法
   */
  registerBatch(methods: Record<string, ApiMethod>): void
  /**
   * 调用 API 方法
   */
  call<
    T = unknown,
    P extends Record<string, unknown> | undefined = Record<string, unknown>
  >(name: string, params?: P): Promise<T>
  /**
   * 获取 API 方法
   */
  getMethod(name: string): ApiMethod | undefined
  /**
   * 获取所有 API 方法
   */
  getAllMethods(): Record<string, ApiMethod>
  /**
   * 销毁引擎
   */
  destroy(): void
  /**
   * 执行实际的 HTTP 请求
   */
  private executeRequest
  /**
   * 生成缓存键
   */
  private generateCacheKey
  /**
   * 生成防抖键
   */
  private generateDebounceKey
  /**
   * 生成请求去重键
   */
  private generateDeduplicationKey
  /**
   * 简单哈希函数
   */
  private hashCode
  /**
   * 检查是否已销毁
   */
  private checkDestroyed
  /**
   * 日志输出
   */
  private log
}
/**
 * 创建 API 引擎实例
 */
declare function createApiEngine(config?: ApiEngineConfig): ApiEngine

export { ApiEngineImpl, createApiEngine }
