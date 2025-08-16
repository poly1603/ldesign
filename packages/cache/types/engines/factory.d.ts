import {
  StorageEngine,
  StorageEngineConfig,
  IStorageEngine,
} from '../types/index.js'

/**
 * 存储引擎工厂
 */
declare class StorageEngineFactory {
  /**
   * 创建存储引擎实例
   */
  static create(
    type: StorageEngine,
    config?: StorageEngineConfig[StorageEngine]
  ): Promise<IStorageEngine>
  /**
   * 检查存储引擎是否可用
   */
  static isAvailable(type: StorageEngine): boolean
  /**
   * 获取所有可用的存储引擎
   */
  static getAvailableEngines(): StorageEngine[]
  /**
   * 获取推荐的存储引擎
   */
  static getRecommendedEngine(): StorageEngine
}

export { StorageEngineFactory }
