/**
 * 尺寸存储管理器
 */
import type { SizeMode } from '../types';
/**
 * 存储管理器选项
 */
export interface SizeStorageManagerOptions {
    /** 是否启用存储 */
    enabled?: boolean;
    /** 存储类型 */
    type?: 'localStorage' | 'sessionStorage';
    /** 存储键名 */
    key?: string;
}
/**
 * 尺寸存储管理器实现
 */
export declare class SizeStorageManager {
    private options;
    private storage;
    constructor(options?: SizeStorageManagerOptions);
    /**
     * 保存当前尺寸模式
     */
    saveCurrentMode(mode: SizeMode): void;
    /**
     * 获取保存的尺寸模式
     */
    getSavedMode(): SizeMode | null;
    /**
     * 清除保存的尺寸模式
     */
    clearSavedMode(): void;
    /**
     * 检查是否启用存储
     */
    isEnabled(): boolean;
}
//# sourceMappingURL=storage-manager.d.ts.map