import { Storage, CacheOptions, LRUCache } from './types.js';

/**
 * 存储和缓存系统实现
 */

/**
 * 本地存储实现
 */
declare class LocalStorage implements Storage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}
/**
 * 会话存储实现
 */
declare class SessionStorage implements Storage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}
/**
 * 内存存储实现
 */
declare class MemoryStorage implements Storage {
    private store;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}
/**
 * 无存储实现（不保存任何数据）
 */
declare class NoStorage implements Storage {
    getItem(_key: string): string | null;
    setItem(_key: string, _value: string): void;
    removeItem(_key: string): void;
    clear(): void;
}
/**
 * Cookie 存储实现
 */
declare class CookieStorage implements Storage {
    private getCookie;
    private setCookie;
    private deleteCookie;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}
/**
 * LRU 缓存实现
 */
declare class LRUCacheImpl<T = any> implements LRUCache<T> {
    private cache;
    private options;
    constructor(options?: CacheOptions);
    get(key: string): T | undefined;
    set(key: string, value: T, ttl?: number): void;
    delete(key: string): boolean;
    clear(): void;
    size(): number;
    has(key: string): boolean;
    /**
     * 清理过期项
     */
    cleanup(): void;
    /**
     * 获取缓存统计信息
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
    };
}
/**
 * 创建存储实例
 */
declare function createStorage(type: 'localStorage' | 'sessionStorage' | 'memory' | 'cookie' | 'none'): Storage;
/**
 * 创建 LRU 缓存实例
 */
declare function createLRUCache<T = any>(options?: CacheOptions): LRUCache<T>;
/**
 * 默认存储实例
 */
declare const defaultStorage: LocalStorage;
/**
 * 默认缓存实例
 */
declare const defaultCache: LRUCacheImpl<any>;

export { CookieStorage, LRUCacheImpl, LocalStorage, MemoryStorage, NoStorage, SessionStorage, createLRUCache, createStorage, defaultCache, defaultStorage };
