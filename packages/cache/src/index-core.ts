/**
 * @ldesign/cache - 核心入口
 *
 * 只包含最基础的缓存功能，体积最小
 */

import { CacheManager } from './core/cache-manager'

// 核心缓存管理器
export { CacheManager } from './core/cache-manager'

export { LocalStorageEngine } from './engines/local-storage-engine'
// 基础存储引擎
export { MemoryEngine } from './engines/memory-engine'
export { SessionStorageEngine } from './engines/session-storage-engine'

// 类型定义
export type {
  BaseEngineOptions,
  // 错误类型
  CacheError,
  CacheEvent,
  CacheEventListener,
  CacheEventType,
  CacheMetadata,

  // 核心类型
  CacheOptions,
  CacheStats,
  ClearOptions,
  CookieEngineOptions,
  EngineOptions,
  ErrorType,
  EventListener,
  // 事件类型
  EventMap,

  GetOptions,
  IndexedDBEngineOptions,
  LocalStorageEngineOptions,
  MemoryEngineOptions,

  RemoveOptions,
  // 其他类型
  SerializableValue,

  SessionStorageEngineOptions,
  SetOptions,
  // 存储引擎类型
  StorageEngine,
} from './types'
export { ErrorHandler } from './utils/error-handler'

// 基础工具
export { EventEmitter } from './utils/event-emitter'

// 预设配置
export const corePresets = {
  /**
   * 内存缓存预设
   */
  memory: {
    engines: {
      memory: { enabled: true },
    },
  },
  
  /**
   * 浏览器存储预设
   */
  browser: {
    engines: {
      memory: { enabled: true },
      localStorage: { enabled: true },
    },
  },
  
  /**
   * 会话存储预设
   */
  session: {
    engines: {
      memory: { enabled: true },
      sessionStorage: { enabled: true },
    },
  },
}

/**
 * 创建核心缓存管理器
 */
export function createCoreCache(preset?: keyof typeof corePresets) {
  const options = preset ? corePresets[preset] : undefined
  return new CacheManager(options)
}
