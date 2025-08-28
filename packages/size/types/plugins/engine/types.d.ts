/**
 * Engine 插件类型定义
 */
import type { SizeManagerOptions, SizeMode } from '../../types';
/**
 * Size Engine 插件选项
 */
export interface SizeEnginePluginOptions extends SizeManagerOptions {
    /** 插件名称 */
    name?: string;
    /** 插件版本 */
    version?: string;
    /** 自定义尺寸配置 */
    customSizes?: Record<string, any>;
    /** 是否启用深度合并 */
    enableDeepMerge?: boolean;
    /** 尺寸变化回调 */
    onSizeChanged?: (mode: SizeMode) => void | Promise<void>;
    /** 错误处理回调 */
    onError?: (error: Error) => void;
}
/**
 * Size 适配器接口
 */
export interface SizeAdapter {
    /** 安装适配器 */
    install: (engine: any) => void;
    /** 获取当前尺寸模式 */
    getCurrentMode: () => SizeMode;
    /** 设置尺寸模式 */
    setMode: (mode: SizeMode) => Promise<void>;
    /** 获取可用的尺寸模式 */
    getAvailableModes: () => SizeMode[];
    /** 监听尺寸变化 */
    on: (event: string, callback: Function) => void;
    /** 移除监听器 */
    off: (event: string, callback: Function) => void;
    /** 触发事件 */
    emit: (event: string, data: any) => void;
    /** 销毁适配器 */
    destroy: () => void;
}
//# sourceMappingURL=types.d.ts.map