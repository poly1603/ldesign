/**
 * 尺寸管理器
 */
import type { SizeChangeEvent, SizeConfig, SizeManager, SizeManagerOptions, SizeMode } from '../types';
import { CSSVariableGenerator } from './css-generator';
import { CSSInjector } from './css-injector';
/**
 * 尺寸管理器实现
 */
export declare class SizeManagerImpl implements SizeManager {
    private options;
    private currentMode;
    private cssGenerator;
    private cssInjector;
    private storageManager;
    private listeners;
    private eventListeners;
    constructor(options?: SizeManagerOptions);
    /**
     * 获取当前尺寸模式
     */
    getCurrentMode(): SizeMode;
    /**
     * 设置尺寸模式
     */
    setMode(mode: SizeMode): Promise<void>;
    /**
     * 获取尺寸配置
     */
    getConfig(mode?: SizeMode): SizeConfig;
    /**
     * 生成CSS变量
     */
    generateCSSVariables(mode?: SizeMode): Record<string, string>;
    /**
     * 注入CSS变量
     */
    injectCSS(mode?: SizeMode): void;
    /**
     * 移除CSS变量
     */
    removeCSS(): void;
    /**
     * 监听尺寸变化
     */
    onSizeChange(callback: (event: SizeChangeEvent) => void): () => void;
    /**
     * 初始化管理器
     */
    init(): Promise<void>;
    /**
     * 监听事件
     */
    on(event: string, callback: Function): void;
    /**
     * 移除事件监听
     */
    off(event: string, callback: Function): void;
    /**
     * 触发事件
     */
    emit(event: string, data?: any): void;
    /**
     * 销毁管理器
     */
    destroy(): void;
    /**
     * 触发尺寸变化事件
     */
    private emitSizeChange;
    /**
     * 获取CSS生成器
     */
    getCSSGenerator(): CSSVariableGenerator;
    /**
     * 获取CSS注入器
     */
    getCSSInjector(): CSSInjector;
    /**
     * 更新选项
     */
    updateOptions(options: Partial<SizeManagerOptions>): void;
    /**
     * 获取当前选项
     */
    getOptions(): Required<SizeManagerOptions>;
    /**
     * 检查是否已注入CSS
     */
    isInjected(): boolean;
}
/**
 * 全局尺寸管理器实例
 */
export declare const globalSizeManager: SizeManagerImpl;
/**
 * 创建尺寸管理器实例
 */
export declare function createSizeManager(options?: SizeManagerOptions): SizeManager;
/**
 * 便捷函数：设置全局尺寸模式
 */
export declare function setGlobalSizeMode(mode: SizeMode): void;
/**
 * 便捷函数：获取全局尺寸模式
 */
export declare function getGlobalSizeMode(): SizeMode;
/**
 * 便捷函数：监听全局尺寸变化
 */
export declare function onGlobalSizeChange(callback: (event: SizeChangeEvent) => void): () => void;
//# sourceMappingURL=size-manager.d.ts.map