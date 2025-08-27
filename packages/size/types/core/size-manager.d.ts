import { SizeManager, SizeManagerOptions, SizeMode, SizeConfig, SizeChangeEvent } from '../types/index.js';
import { CSSVariableGenerator } from './css-generator.js';
import { CSSInjector } from './css-injector.js';

/**
 * 尺寸管理器
 */

/**
 * 尺寸管理器实现
 */
declare class SizeManagerImpl implements SizeManager {
    private options;
    private currentMode;
    private cssGenerator;
    private cssInjector;
    private storageManager;
    private listeners;
    constructor(options?: SizeManagerOptions);
    /**
     * 获取当前尺寸模式
     */
    getCurrentMode(): SizeMode;
    /**
     * 设置尺寸模式
     */
    setMode(mode: SizeMode): void;
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
declare const globalSizeManager: SizeManagerImpl;
/**
 * 创建尺寸管理器实例
 */
declare function createSizeManager(options?: SizeManagerOptions): SizeManager;
/**
 * 便捷函数：设置全局尺寸模式
 */
declare function setGlobalSizeMode(mode: SizeMode): void;
/**
 * 便捷函数：获取全局尺寸模式
 */
declare function getGlobalSizeMode(): SizeMode;
/**
 * 便捷函数：监听全局尺寸变化
 */
declare function onGlobalSizeChange(callback: (event: SizeChangeEvent) => void): () => void;

export { SizeManagerImpl, createSizeManager, getGlobalSizeMode, globalSizeManager, onGlobalSizeChange, setGlobalSizeMode };
