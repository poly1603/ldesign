/**
 * @ldesign/cache - 核心入口
 *
 * 只包含最基础的缓存功能，体积最小
 */

import { CacheManager } from './core/cache-manager'

// 核心缓存管理器
export { CacheManager } from './core/cache-manager'

// 基础存储引擎
export { MemoryEngine } from './engines/memory-engine'
export { LocalStorageEngine } from './engines/local-storage-engine'
export { SessionStorageEngine } from './engines/session-storage-engine'

// 基础工具
export { EventEmitter } from './utils/event-emitter'
export { ErrorHandler } from './utils/error-handler'

// 类型定义
export type {
  // 核心类型
  CacheOptions,
  CacheEvent,
  SetOptions,
  GetOptions,
  RemoveOptions,
  ClearOptions,

  // 存储引擎类型
  StorageEngine,
  EngineOptions,
  BaseEngineOptions,
  MemoryEngineOptions,
  LocalStorageEngineOptions,
  SessionStorageEngineOptions,
  IndexedDBEngineOptions,
  CookieEngineOptions,

  // 事件类型
  EventMap,
  EventListener,
  CacheEventListener,
  CacheEventType,

  // 错误类型
  CacheError,
  ErrorType,

  // 其他类型
  SerializableValue,
  CacheMetadata,
  CacheStats
} from './types'

// 预设配置
export const corePresets = {
  /**
   * 内存缓存预设
   */
  memory: {
    engines: {
      memory: { enabled: true }
    }
  },
  
  /**
   * 浏览器存储预设
   */
  browser: {
    engines: {
      memory: { enabled: true },
      localStorage: { enabled: true }
    }
  },
  
  /**
   * 会话存储预设
   */
  session: {
    engines: {
      memory: { enabled: true },
      sessionStorage: { enabled: true }
    }
  }
}

/**
 * 创建核心缓存管理器
 */
export function createCoreCache(preset?: keyof typeof corePresets) {
  const options = preset ? corePresets[preset] : undefined
  return new CacheManager(options)
}
