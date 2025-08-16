import { IStorageEngine, StorageEngine } from '../types/index.js'

/**
 * 存储引擎基类
 */
declare abstract class BaseStorageEngine implements IStorageEngine {
  abstract readonly name: StorageEngine
  abstract readonly available: boolean
  abstract readonly maxSize: number
  protected _usedSize: number
  get usedSize(): number
  /**
   * 设置缓存项
   */
  abstract setItem(key: string, value: string, ttl?: number): Promise<void>
  /**
   * 获取缓存项
   */
  abstract getItem(key: string): Promise<string | null>
  /**
   * 删除缓存项
   */
  abstract removeItem(key: string): Promise<void>
  /**
   * 清空所有缓存项
   */
  abstract clear(): Promise<void>
  /**
   * 获取所有键名
   */
  abstract keys(): Promise<string[]>
  /**
   * 检查键是否存在
   */
  hasItem(key: string): Promise<boolean>
  /**
   * 获取缓存项数量
   */
  abstract length(): Promise<number>
  /**
   * 清理过期项
   */
  cleanup(): Promise<void>
  /**
   * 计算字符串大小（字节）
   */
  protected calculateSize(data: string): number
  /**
   * 更新使用大小
   */
  protected updateUsedSize(): Promise<void>
  /**
   * 检查存储空间是否足够
   */
  protected checkStorageSpace(dataSize: number): boolean
  /**
   * 生成带TTL的数据
   */
  protected createTTLData(value: string, ttl?: number): string
  /**
   * 解析带TTL的数据
   */
  protected parseTTLData(data: string): {
    value: string
    expired: boolean
  }
}

export { BaseStorageEngine }
