import { StorageEngineConfig } from '../types/index.js'
import { BaseStorageEngine } from './base-engine.js'

/**
 * IndexedDB 存储引擎
 */
declare class IndexedDBEngine extends BaseStorageEngine {
  readonly name: 'indexedDB'
  readonly maxSize: number
  private db
  private dbName
  private version
  private storeName
  private constructor()
  /**
   * 创建 IndexedDB 引擎实例
   */
  static create(
    config?: StorageEngineConfig['indexedDB']
  ): Promise<IndexedDBEngine>
  get available(): boolean
  /**
   * 初始化数据库
   */
  private initialize
  /**
   * 获取事务
   */
  private getTransaction
  /**
   * 获取对象存储
   */
  private getStore
  /**
   * 执行 IndexedDB 请求
   */
  private executeRequest
  /**
   * 设置缓存项
   */
  setItem(key: string, value: string, ttl?: number): Promise<void>
  /**
   * 获取缓存项
   */
  getItem(key: string): Promise<string | null>
  /**
   * 删除缓存项
   */
  removeItem(key: string): Promise<void>
  /**
   * 清空所有缓存项
   */
  clear(): Promise<void>
  /**
   * 获取所有键名
   */
  keys(): Promise<string[]>
  /**
   * 获取缓存项数量
   */
  length(): Promise<number>
  /**
   * 清理过期项
   */
  cleanup(): Promise<void>
  /**
   * 获取数据库大小估算
   */
  getDatabaseSize(): Promise<number>
  /**
   * 更新使用大小
   */
  protected updateUsedSize(): Promise<void>
}

export { IndexedDBEngine }
