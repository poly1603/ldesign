import { ResponsiveManager as ResponsiveManager$1, ResponsiveConfig, Breakpoint, DeviceInfo, ContainerInfo, AdaptiveStrategy } from '../types/responsive.js';
import { WatermarkInstance } from '../types/instance.js';

/**
 * 响应式管理器
 */

/**
 * 响应式管理器
 * 负责水印的响应式布局和设备适配
 */
declare class ResponsiveManager implements ResponsiveManager$1 {
    private instances;
    private breakpoints;
    private mediaQueries;
    private resizeObserver?;
    private deviceInfo;
    private containerInfos;
    private eventListeners;
    private adaptiveStrategies;
    private config;
    private initialized;
    constructor(config: ResponsiveConfig);
    /**
     * 初始化响应式管理器
     */
    init(): Promise<void>;
    /**
     * 注册实例
     */
    registerInstance(instance: WatermarkInstance): Promise<void>;
    /**
     * 注销实例
     */
    unregisterInstance(instanceId: string): Promise<void>;
    /**
     * 更新实例响应式配置
     */
    updateInstance(instance: WatermarkInstance): Promise<void>;
    /**
     * 获取当前断点
     */
    getCurrentBreakpoint(): Breakpoint | null;
    /**
     * 获取设备信息
     */
    getDeviceInfo(): DeviceInfo;
    /**
     * 获取容器信息
     */
    getContainerInfo(container: Element): ContainerInfo;
    /**
     * 添加断点
     */
    addBreakpoint(breakpoint: Breakpoint): void;
    /**
     * 移除断点
     */
    removeBreakpoint(name: string): boolean;
    /**
     * 添加自适应策略
     */
    addAdaptiveStrategy(name: string, strategy: AdaptiveStrategy): void;
    /**
     * 移除自适应策略
     */
    removeAdaptiveStrategy(name: string): boolean;
    /**
     * 手动触发响应式更新
     */
    triggerUpdate(instanceId?: string): Promise<void>;
    /**
     * 获取响应式状态
     */
    getState(): {
        currentBreakpoint: Breakpoint | null;
        deviceInfo: DeviceInfo;
        registeredInstances: number;
        activeBreakpoints: string[];
    };
    /**
     * 销毁响应式管理器
     */
    dispose(): Promise<void>;
    private detectDevice;
    private setupDefaultBreakpoints;
    private setupDefaultStrategies;
    private setupMediaQueries;
    private setupMediaQuery;
    private setupResizeObserver;
    private setupWindowListeners;
    private setupOrientationListeners;
    private handleWindowResize;
    private handleOrientationChange;
    private handleBreakpointChange;
    private handleInstanceResize;
    private applyResponsiveConfig;
    private applyBreakpointConfig;
    private applyAdaptiveStrategies;
}

export { ResponsiveManager };
