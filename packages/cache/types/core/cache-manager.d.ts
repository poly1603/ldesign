import type { CacheEventListener, CacheEventType, CacheMetadata, CacheOptions, CacheStats, ICacheManager, SetOptions, StorageEngine } from '../types';
/**
 * 缓存管理器核心实现
 */
export declare class CacheManager implements ICacheManager {
    private options;
    private engines;
    private strategy;
    private security;
    private eventEmitter;
    private stats;
    private cleanupTimer?;
    private initialized;
    private initPromise;
    constructor(options?: CacheOptions);
    /**
     * 确保已初始化
     */
    private ensureInitialized;
    /**
     * 初始化存储引擎
     */
    private initializeEngines;
    /**
     * 启动清理定时器
     */
    private startCleanupTimer;
    /**
     * 选择存储引擎
     */
    private selectEngine;
    /**
     * 处理键名
     */
    private processKey;
    /**
     * 反处理键名
     */
    private unprocessKey;
    /**
     * 序列化数据
     *
     * 将任意类型的数据序列化为字符串，支持加密选项
     *
     * @param value - 需要序列化的数据
     * @param options - 序列化选项，包含加密设置
     * @returns 序列化后的字符串
     * @throws {Error} 当序列化失败时抛出错误
     *
     * @example
     * ```typescript
     * const serialized = await serializeValue({ name: 'test' })
     * ```
     */
    private serializeValue;
    /**
     * 反序列化数据
     *
     * 将字符串反序列化为原始数据类型，支持解密选项
     *
     * @param data - 需要反序列化的字符串数据
     * @param encrypted - 数据是否已加密
     * @returns 反序列化后的原始数据
     * @throws {Error} 当反序列化失败时抛出错误
     *
     * @example
     * ```typescript
     * const original = await deserializeValue<MyType>(serializedData, false)
     * ```
     */
    private deserializeValue;
    /**
     * 移除对象中的循环引用
     *
     * @param obj - 需要处理的对象
     * @param seen - 已访问的对象集合（用于检测循环引用）
     * @returns 移除循环引用后的对象
     */
    private removeCircularReferences;
    /**
     * 验证 set 方法的输入参数
     *
     * 使用统一的验证工具进行参数验证
     *
     * @param key - 缓存键
     * @param value - 缓存值
     * @param options - 设置选项
     * @throws {ValidationError} 当输入参数无效时抛出错误
     */
    private validateSetInput;
    /**
     * 创建元数据
     */
    private createMetadata;
    /**
     * 获取数据类型
     */
    private getDataType;
    /**
     * 触发事件
     */
    private emitEvent;
    /**
     * 发出策略选择事件
     */
    private emitStrategyEvent;
    /**
     * 设置缓存项
     *
     * 将键值对存储到缓存中，支持多种存储引擎和配置选项
     *
     * @param key - 缓存键，必须是非空字符串
     * @param value - 缓存值，支持任意可序列化的数据类型
     * @param options - 可选的设置选项，包括TTL、存储引擎、加密等
     * @throws {Error} 当键无效、值无法序列化或存储失败时抛出错误
     *
     * @example
     * ```typescript
     * // 基础用法
     * await cache.set('user:123', { name: 'John', age: 30 })
     *
     * // 带选项
     * await cache.set('session:abc', sessionData, {
     *   ttl: 3600000, // 1小时
     *   engine: 'localStorage',
     *   encrypt: true
     * })
     * ```
     */
    set<T = any>(key: string, value: T, options?: SetOptions): Promise<void>;
    /**
     * 获取缓存项
     *
     * 从缓存中获取指定键的值，支持多存储引擎查找和自动过期检查
     *
     * @template T - 期望返回的数据类型
     * @param key - 缓存键，必须是非空字符串
     * @returns 缓存的值，如果不存在或已过期则返回 null
     * @throws {Error} 当键无效或反序列化失败时抛出错误
     *
     * @example
     * ```typescript
     * // 获取字符串值
     * const name = await cache.get<string>('user:name')
     *
     * // 获取对象值
     * const user = await cache.get<User>('user:123')
     * if (user) {
     *   console.log(user.name, user.age)
     * }
     *
     * // 处理不存在的键
     * const data = await cache.get('nonexistent') // 返回 null
     * ```
     */
    get<T = any>(key: string): Promise<T | null>;
    /**
     * 删除缓存项
     *
     * 从所有存储引擎中删除指定键的缓存项，确保数据完全清除
     *
     * @param key - 要删除的缓存键
     * @throws {Error} 当键无效时抛出错误
     *
     * @example
     * ```typescript
     * // 删除单个缓存项
     * await cache.remove('user:123')
     *
     * // 删除后检查是否存在
     * const exists = await cache.has('user:123') // false
     *
     * // 删除不存在的键不会报错
     * await cache.remove('nonexistent-key') // 正常执行
     * ```
     */
    remove(key: string): Promise<void>;
    /**
     * 清空缓存
     */
    clear(engine?: StorageEngine): Promise<void>;
    /**
     * 检查键是否存在
     */
    has(key: string): Promise<boolean>;
    /**
     * 获取所有键名
     */
    keys(engine?: StorageEngine): Promise<string[]>;
    /**
     * 获取缓存项元数据
     */
    getMetadata(key: string): Promise<CacheMetadata | null>;
    /**
     * 获取缓存统计信息
     */
    getStats(): Promise<CacheStats>;
    /**
     * 清理过期项
     */
    cleanup(): Promise<void>;
    /**
     * 添加事件监听器
     */
    on<T = any>(event: CacheEventType, listener: CacheEventListener<T>): void;
    /**
     * 移除事件监听器
     */
    off<T = any>(event: CacheEventType, listener: CacheEventListener<T>): void;
    /**
     * 销毁缓存管理器
     */
    destroy(): Promise<void>;
}
//# sourceMappingURL=cache-manager.d.ts.map