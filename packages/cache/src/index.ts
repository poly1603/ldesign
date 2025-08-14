// 核心导出
export * from './types'
export * from './utils'

// 核心功能
export { CacheManager } from './core/cache-manager'

// 存储引擎
export { StorageEngineFactory } from './engines/factory'
export { BaseStorageEngine } from './engines/base-engine'
export { LocalStorageEngine } from './engines/local-storage-engine'
export { SessionStorageEngine } from './engines/session-storage-engine'
export { CookieEngine } from './engines/cookie-engine'
export { IndexedDBEngine } from './engines/indexeddb-engine'
export { MemoryEngine } from './engines/memory-engine'

// 策略
export { StorageStrategy } from './strategies/storage-strategy'

// 安全
export { SecurityManager } from './security/security-manager'
export { AESCrypto } from './security/aes-crypto'
export { KeyObfuscator } from './security/key-obfuscator'

// 导入类型
import type { CacheOptions } from './types'
import { CacheManager } from './core/cache-manager'
import { StorageEngineFactory } from './engines/factory'

/**
 * 创建缓存管理器实例
 */
export function createCache(options?: CacheOptions) {
  return new CacheManager(options)
}

/**
 * 默认缓存管理器实例（延迟初始化）
 */
let _defaultCache: CacheManager | null = null
export const defaultCache = (() => {
  if (!_defaultCache) {
    _defaultCache = new CacheManager()
  }
  return _defaultCache
})()

// 默认导出
export default {
  CacheManager,
  createCache,
  defaultCache,
  StorageEngineFactory,
}
