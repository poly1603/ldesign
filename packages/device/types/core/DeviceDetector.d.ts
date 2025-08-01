import { DeviceDetectorEvents, DeviceDetectorOptions, DeviceType, Orientation, DeviceInfo } from '../types/index.js';
import { EventEmitter } from './EventEmitter.js';

/**
 * 设备检测器主类
 */
declare class DeviceDetector extends EventEmitter<DeviceDetectorEvents> {
    private options;
    private moduleLoader;
    private currentDeviceInfo;
    private resizeHandler?;
    private orientationHandler?;
    private isDestroyed;
    constructor(options?: DeviceDetectorOptions);
    /**
     * 获取当前设备类型
     */
    getDeviceType(): DeviceType;
    /**
     * 获取当前屏幕方向
     */
    getOrientation(): Orientation;
    /**
     * 获取完整的设备信息
     */
    getDeviceInfo(): DeviceInfo;
    /**
     * 检查是否为移动设备
     */
    isMobile(): boolean;
    /**
     * 检查是否为平板设备
     */
    isTablet(): boolean;
    /**
     * 检查是否为桌面设备
     */
    isDesktop(): boolean;
    /**
     * 检查是否为触摸设备
     */
    isTouchDevice(): boolean;
    /**
     * 刷新设备信息
     */
    refresh(): void;
    /**
     * 动态加载扩展模块
     */
    loadModule<T = any>(name: string): Promise<T>;
    /**
     * 卸载扩展模块
     */
    unloadModule(name: string): Promise<void>;
    /**
     * 检查模块是否已加载
     */
    isModuleLoaded(name: string): boolean;
    /**
     * 获取已加载的模块列表
     */
    getLoadedModules(): string[];
    /**
     * 销毁检测器，清理资源
     */
    destroy(): Promise<void>;
    /**
     * 检测设备信息
     */
    private detectDevice;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 移除事件监听器
     */
    private removeEventListeners;
}

export { DeviceDetector };
