import type { StorageEngineConfig } from '../types';
import { BaseStorageEngine } from './base-engine';
/**
 * 内存缓存项
 */
interface MemoryCacheItem {
    value: string;
    createdAt: number;
    expiresAt?: number;
}
/**
 * 内存存储引擎
 */
export declare class MemoryEngine extends BaseStorageEngine {
    readonly name: "memory";
    readonly available = true;
    readonly maxSize: number;
    private storage;
    private cleanupTimer?;
    constructor(config?: StorageEngineConfig['memory']);
    /**
     * 启动清理定时器
     */
    private startCleanupTimer;
    /**
     * 设置缓存项
     */
    setItem(key: string, value: string, ttl?: number): Promise<void>;
    /**
     * 获取缓存项
     */
    getItem(key: string): Promise<string | null>;
    /**
     * 删除缓存项
     */
    removeItem(key: string): Promise<void>;
    /**
     * 清空所有缓存项
     */
    clear(): Promise<void>;
    /**
     * 获取所有键名
     */
    keys(): Promise<string[]>;
    /**
     * 检查键是否存在
     */
    hasItem(key: string): Promise<boolean>;
    /**
     * 获取缓存项数量
     */
    length(): Promise<number>;
    /**
     * 清理过期项
     */
    cleanup(): Promise<void>;
    /**
     * 清理最旧的项以释放空间
     */
    private evictOldestItems;
    /**
     * 更新使用大小
     */
    protected updateUsedSize(): Promise<void>;
    /**
     * 获取缓存项详细信息
     */
    getItemInfo(key: string): Promise<MemoryCacheItem | null>;
    /**
     * 获取所有缓存项（用于调试）
     */
    getAllItems(): Promise<Record<string, MemoryCacheItem>>;
    /**
     * 获取存储统计
     */
    getStorageStats(): Promise<{
        totalItems: number;
        totalSize: number;
        expiredItems: number;
        oldestItem?: {
            key: string;
            age: number;
        };
        newestItem?: {
            key: string;
            age: number;
        };
    }>;
    /**
     * 销毁引擎
     */
    destroy(): Promise<void>;
}
export {};
//# sourceMappingURL=memory-engine.d.ts.map