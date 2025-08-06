import { CacheConfig, RequestConfig, ResponseData, CacheStorage } from '@/types';

/**
 * 内存缓存存储实现
 */
declare class MemoryCacheStorage implements CacheStorage {
    private cache;
    private timers;
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    /**
     * 获取缓存大小
     */
    size(): number;
    /**
     * 获取所有缓存键
     */
    keys(): string[];
}
/**
 * LocalStorage 缓存存储实现
 */
declare class LocalStorageCacheStorage implements CacheStorage {
    private prefix;
    constructor(prefix?: string);
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}
/**
 * 缓存管理器
 */
declare class CacheManager {
    private config;
    private storage;
    private keyCache;
    constructor(config?: CacheConfig);
    /**
     * 获取缓存
     */
    get<T = any>(config: RequestConfig): Promise<ResponseData<T> | null>;
    /**
     * 设置缓存
     */
    set<T = any>(config: RequestConfig, response: ResponseData<T>): Promise<void>;
    /**
     * 删除缓存
     */
    delete(config: RequestConfig): Promise<void>;
    /**
     * 清空所有缓存
     */
    clear(): Promise<void>;
    /**
     * 更新配置
     */
    updateConfig(config: Partial<CacheConfig>): void;
    /**
     * 获取当前配置
     */
    getConfig(): Required<CacheConfig>;
    /**
     * 获取缓存的键（带缓存优化）
     */
    private getCachedKey;
    /**
     * 默认缓存键生成器
     */
    private defaultKeyGenerator;
}
/**
 * 创建缓存管理器
 */
declare function createCacheManager(config?: CacheConfig): CacheManager;
/**
 * 创建内存缓存存储
 */
declare function createMemoryStorage(): MemoryCacheStorage;
/**
 * 创建 LocalStorage 缓存存储
 */
declare function createLocalStorage(prefix?: string): LocalStorageCacheStorage;

export { CacheManager, LocalStorageCacheStorage, MemoryCacheStorage, createCacheManager, createLocalStorage, createMemoryStorage };
