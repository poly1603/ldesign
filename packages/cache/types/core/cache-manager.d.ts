import {
  ICacheManager,
  CacheOptions,
  SetOptions,
  StorageEngine,
  CacheMetadata,
  CacheStats,
  CacheEventType,
  CacheEventListener,
} from '../types/index.js'

/**
 * 缓存管理器核心实现
 */
declare class CacheManager implements ICacheManager {
  private options
  private engines
  private strategy
  private security
  private eventEmitter
  private stats
  private cleanupTimer?
  private initialized
  private initPromise
  constructor(options?: CacheOptions)
  /**
   * 确保已初始化
   */
  private ensureInitialized
  /**
   * 初始化存储引擎
   */
  private initializeEngines
  /**
   * 启动清理定时器
   */
  private startCleanupTimer
  /**
   * 选择存储引擎
   */
  private selectEngine
  /**
   * 处理键名
   */
  private processKey
  /**
   * 反处理键名
   */
  private unprocessKey
  /**
   * 序列化数据
   */
  private serializeValue
  /**
   * 反序列化数据
   */
  private deserializeValue
  /**
   * 创建元数据
   */
  private createMetadata
  /**
   * 获取数据类型
   */
  private getDataType
  /**
   * 触发事件
   */
  private emitEvent
  /**
   * 发出策略选择事件
   */
  private emitStrategyEvent
  /**
   * 设置缓存项
   */
  set<T = any>(key: string, value: T, options?: SetOptions): Promise<void>
  /**
   * 获取缓存项
   */
  get<T = any>(key: string): Promise<T | null>
  /**
   * 删除缓存项
   */
  remove(key: string): Promise<void>
  /**
   * 清空缓存
   */
  clear(engine?: StorageEngine): Promise<void>
  /**
   * 检查键是否存在
   */
  has(key: string): Promise<boolean>
  /**
   * 获取所有键名
   */
  keys(engine?: StorageEngine): Promise<string[]>
  /**
   * 获取缓存项元数据
   */
  getMetadata(key: string): Promise<CacheMetadata | null>
  /**
   * 获取缓存统计信息
   */
  getStats(): Promise<CacheStats>
  /**
   * 清理过期项
   */
  cleanup(): Promise<void>
  /**
   * 添加事件监听器
   */
  on<T = any>(event: CacheEventType, listener: CacheEventListener<T>): void
  /**
   * 移除事件监听器
   */
  off<T = any>(event: CacheEventType, listener: CacheEventListener<T>): void
  /**
   * 销毁缓存管理器
   */
  destroy(): Promise<void>
}

export { CacheManager }
