import type { CacheOptions } from './types';
import { CacheManager } from './core/cache-manager';
import { StorageEngineFactory } from './engines/factory';
export { CacheManager } from './core/cache-manager';
export { BaseStorageEngine } from './engines/base-engine';
export { CookieEngine } from './engines/cookie-engine';
export { StorageEngineFactory } from './engines/factory';
export { IndexedDBEngine } from './engines/indexeddb-engine';
export { LocalStorageEngine } from './engines/local-storage-engine';
export { MemoryEngine } from './engines/memory-engine';
export { SessionStorageEngine } from './engines/session-storage-engine';
export { AESCrypto } from './security/aes-crypto';
export { KeyObfuscator } from './security/key-obfuscator';
export { SecurityManager } from './security/security-manager';
export { StorageStrategy } from './strategies/storage-strategy';
export * from './types';
export * from './utils';
/**
 * 创建缓存管理器实例
 */
export declare function createCache(options?: CacheOptions): CacheManager;
export declare const defaultCache: CacheManager;
declare const _default: {
    CacheManager: typeof CacheManager;
    createCache: typeof createCache;
    defaultCache: CacheManager;
    StorageEngineFactory: typeof StorageEngineFactory;
};
export default _default;
//# sourceMappingURL=index.d.ts.map