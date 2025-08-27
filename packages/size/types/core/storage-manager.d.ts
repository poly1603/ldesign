import { SizeMode } from '../types/index.js';

/**
 * 存储管理器
 */

/**
 * 存储选项
 */
interface StorageOptions {
    /** 存储键前缀 */
    prefix?: string;
    /** 存储类型 */
    type?: 'localStorage' | 'sessionStorage' | 'memory';
    /** 是否启用存储 */
    enabled?: boolean;
}
/**
 * 存储管理器类
 */
declare class StorageManager {
    private options;
    private memoryStorage;
    constructor(options?: StorageOptions);
    /**
     * 获取存储实例
     */
    private getStorage;
    /**
     * 生成存储键
     */
    private getKey;
    /**
     * 设置值
     */
    set<T>(key: string, value: T): void;
    /**
     * 获取值
     */
    get<T>(key: string, defaultValue?: T): T | undefined;
    /**
     * 移除值
     */
    remove(key: string): void;
    /**
     * 清空所有值
     */
    clear(): void;
    /**
     * 检查键是否存在
     */
    has(key: string): boolean;
    /**
     * 获取所有键
     */
    keys(): string[];
    /**
     * 更新选项
     */
    updateOptions(options: Partial<StorageOptions>): void;
    /**
     * 获取当前选项
     */
    getOptions(): Required<StorageOptions>;
    /**
     * 销毁存储管理器
     */
    destroy(): void;
}
/**
 * 全局存储管理器实例
 */
declare const globalStorageManager: StorageManager;
/**
 * 创建存储管理器实例
 */
declare function createStorageManager(options?: StorageOptions): StorageManager;
/**
 * 尺寸存储管理器
 */
declare class SizeStorageManager extends StorageManager {
    private static readonly SIZE_MODE_KEY;
    private static readonly USER_PREFERENCES_KEY;
    /**
     * 保存当前尺寸模式
     */
    saveCurrentMode(mode: SizeMode): void;
    /**
     * 获取保存的尺寸模式
     */
    getSavedMode(): SizeMode | undefined;
    /**
     * 移除保存的尺寸模式
     */
    removeSavedMode(): void;
    /**
     * 保存用户偏好设置
     */
    saveUserPreferences(preferences: Record<string, any>): void;
    /**
     * 获取用户偏好设置
     */
    getUserPreferences(): Record<string, any>;
    /**
     * 移除用户偏好设置
     */
    removeUserPreferences(): void;
}
/**
 * 全局尺寸存储管理器实例
 */
declare const globalSizeStorageManager: SizeStorageManager;
/**
 * 创建尺寸存储管理器实例
 */
declare function createSizeStorageManager(options?: StorageOptions): SizeStorageManager;

export { SizeStorageManager, StorageManager, createSizeStorageManager, createStorageManager, globalSizeStorageManager, globalStorageManager };
export type { StorageOptions };
