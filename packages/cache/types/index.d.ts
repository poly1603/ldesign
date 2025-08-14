import { CacheOptions } from './types/index.js'
export {
  CacheEvent,
  CacheEventListener,
  CacheEventType,
  CacheItem,
  CacheMetadata,
  CacheStats,
  DataType,
  EncryptionConfig,
  EngineStats,
  ICacheManager,
  IStorageEngine,
  ObfuscationConfig,
  SecurityConfig,
  SetOptions,
  StorageEngine,
  StorageEngineConfig,
  StorageStrategyConfig,
  StorageStrategyResult,
  UseCacheOptions,
} from './types/index.js'
export {
  debounce,
  deepClone,
  delay,
  formatBytes,
  generateId,
  isBrowser,
  isNode,
  isValidInput,
  safeJsonParse,
  safeJsonStringify,
  throttle,
} from './utils/index.js'
import { CacheManager } from './core/cache-manager.js'
import { StorageEngineFactory } from './engines/factory.js'
export { BaseStorageEngine } from './engines/base-engine.js'
export { LocalStorageEngine } from './engines/local-storage-engine.js'
export { SessionStorageEngine } from './engines/session-storage-engine.js'
export { CookieEngine } from './engines/cookie-engine.js'
export { IndexedDBEngine } from './engines/indexeddb-engine.js'
export { MemoryEngine } from './engines/memory-engine.js'
export { StorageStrategy } from './strategies/storage-strategy.js'
export { SecurityManager } from './security/security-manager.js'
export { AESCrypto } from './security/aes-crypto.js'
export { KeyObfuscator } from './security/key-obfuscator.js'
export { EventEmitter } from './utils/event-emitter.js'

/**
 * 创建缓存管理器实例
 */
declare function createCache(options?: CacheOptions): CacheManager
declare const defaultCache: CacheManager
declare const _default: {
  CacheManager: typeof CacheManager
  createCache: typeof createCache
  defaultCache: CacheManager
  StorageEngineFactory: typeof StorageEngineFactory
}

export {
  CacheManager,
  CacheOptions,
  StorageEngineFactory,
  createCache,
  _default as default,
  defaultCache,
}
