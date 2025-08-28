import type { StorageEngineConfig } from '../types';
import { BaseStorageEngine } from './base-engine';
/**
 * Cookie 存储引擎
 */
export declare class CookieEngine extends BaseStorageEngine {
    readonly name: "cookie";
    readonly maxSize: number;
    private domain?;
    private path;
    private secure;
    private sameSite;
    private httpOnly;
    constructor(config?: StorageEngineConfig['cookie']);
    get available(): boolean;
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
     * 清理过期项（Cookie 会自动过期，这里主要是更新统计）
     */
    cleanup(): Promise<void>;
    /**
     * 获取剩余存储空间
     */
    getRemainingSpace(): number;
    /**
     * 获取存储使用率
     */
    getUsageRatio(): number;
}
//# sourceMappingURL=cookie-engine.d.ts.map