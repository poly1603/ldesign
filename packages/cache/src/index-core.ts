/**
 * @ldesign/cache - 核心入口
 *
 * 只包含最基础的缓存功能，体积最小
 */

/**
 * @ldesign/cache - 核心入口
 *
 * 只包含最基础的缓存功能，体积最小
 * 使用统一的预设配置系统
 */

import { CacheManager } from './core/cache-manager'
import { getPresetOptions, type CachePreset } from './presets'

// 核心缓存管理器
export { CacheManager } from './core/cache-manager'

// 基础存储引擎
export { MemoryEngine } from './engines/memory-engine'
export { LocalStorageEngine } from './engines/local-storage-engine'
export { SessionStorageEngine } from './engines/session-storage-engine'

// 类型定义
export type {
  // 核心类型
  CacheOptions,
  CacheStats,
  CacheEvent,
  CacheEventListener,
  CacheEventType,
  CacheMetadata,

  // 操作选项
  SetOptions,
  GetOptions,
  RemoveOptions,
  ClearOptions,

  // 引擎选项
  EngineOptions,
  BaseEngineOptions,
  MemoryEngineOptions,
  LocalStorageEngineOptions,
  SessionStorageEngineOptions,
  CookieEngineOptions,
  IndexedDBEngineOptions,

  // 事件类型
  EventMap,
  EventListener,

  // 错误类型
  CacheError,
  ErrorType,

  // 存储引擎类型
  StorageEngine,

  // 其他类型
  SerializableValue,
} from './types'

// 基础工具
export { ErrorHandler } from './utils/error-handler'
export { EventEmitter } from './utils/event-emitter'

/**
 * 核心支持的预设类型（子集）
 */
export type CorePreset = 'memory' | 'browser' | 'session'

/**
 * 创建核心缓存管理器
 *
 * @param preset - 预设类型，支持 memory、browser、session
 * @returns 缓存管理器实例
 */
export function createCoreCache(preset?: CorePreset) {
  const options = preset ? getPresetOptions(preset as CachePreset) : undefined
  return new CacheManager(options)
}
