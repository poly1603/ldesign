import { StorageEngineConfig } from '../types/index.js';
import { BaseStorageEngine } from './base-engine.js';

/**
 * sessionStorage 存储引擎
 */
declare class SessionStorageEngine extends BaseStorageEngine {
    readonly name: "sessionStorage";
    readonly maxSize: number;
    private keyPrefix;
    constructor(config?: StorageEngineConfig['sessionStorage']);
    get available(): boolean;
    /**
     * 生成完整键名
     */
    private getFullKey;
    /**
     * 从完整键名提取原始键名
     */
    private extractKey;
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
     * 获取缓存项数量
     */
    length(): Promise<number>;
    /**
     * 获取剩余存储空间
     */
    getRemainingSpace(): number;
    /**
     * 获取存储使用率
     */
    getUsageRatio(): number;
}

export { SessionStorageEngine };
