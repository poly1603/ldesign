import type { DeviceDetectorEvents, DeviceDetectorOptions, DeviceInfo, DeviceModule, DeviceType, Orientation } from '../types';
import { EventEmitter } from './EventEmitter';
/**
 * 设备检测器主类
 *
 * 这是一个高性能的设备检测器，能够：
 * - 检测设备类型（桌面、移动、平板）
 * - 监听屏幕方向变化
 * - 检测浏览器和操作系统信息
 * - 动态加载扩展模块（电池、地理位置、网络等）
 * - 提供响应式的设备信息更新
 *
 * @example
 * ```typescript
 * // 创建设备检测器实例
 * const detector = new DeviceDetector({
 *   enableResize: true,
 *   enableOrientation: true,
 *   modules: ['network', 'battery']
 * })
 *
 * // 监听设备变化
 * detector.on('deviceChange', (deviceInfo) => {
 *   console.log('设备信息更新:', deviceInfo)
 * })
 *
 * // 获取当前设备信息
 * const deviceInfo = detector.getDeviceInfo()
 * console.log('当前设备类型:', deviceInfo.type)
 * ```
 */
export declare class DeviceDetector extends EventEmitter<DeviceDetectorEvents> {
    private options;
    private moduleLoader;
    private currentDeviceInfo;
    private resizeHandler?;
    private orientationHandler?;
    private isDestroyed;
    private cachedUserAgent?;
    private cachedOS?;
    private cachedBrowser?;
    private lastDetectionTime;
    private readonly minDetectionInterval;
    private errorCount;
    private readonly maxErrors;
    private lastErrorTime;
    private readonly errorCooldown;
    private performanceMetrics;
    /**
     * 构造函数 - 创建设备检测器实例
     *
     * @param options 配置选项
     * @param options.enableResize 是否启用窗口大小变化监听，默认 true
     * @param options.enableOrientation 是否启用屏幕方向变化监听，默认 true
     * @param options.modules 要加载的扩展模块列表，如 ['network', 'battery', 'geolocation']
     * @param options.breakpoints 设备类型断点配置，用于判断设备类型
     * @param options.debounceTime 事件防抖时间（毫秒），默认 100ms
     *
     * @example
     * ```typescript
     * // 基础配置
     * const detector = new DeviceDetector()
     *
     * // 自定义配置
     * const detector = new DeviceDetector({
     *   enableResize: true,
     *   enableOrientation: true,
     *   modules: ['network', 'battery'],
     *   breakpoints: {
     *     mobile: 768,
     *     tablet: 1024
     *   },
     *   debounceTime: 200
     * })
     * ```
     */
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
     *
     * 返回当前设备的完整信息对象，包括：
     * - 设备类型（desktop、mobile、tablet）
     * - 屏幕尺寸和分辨率信息
     * - 浏览器和操作系统信息
     * - 设备方向和像素比
     * - 触摸支持情况
     *
     * @returns DeviceInfo 设备信息对象
     *
     * @example
     * ```typescript
     * const detector = new DeviceDetector()
     * const deviceInfo = detector.getDeviceInfo()
     *
     * console.log('设备类型:', deviceInfo.type) // 'mobile' | 'tablet' | 'desktop'
     * console.log('屏幕宽度:', deviceInfo.screen.width)
     * console.log('浏览器:', deviceInfo.browser.name)
     * console.log('操作系统:', deviceInfo.os.name)
     * console.log('是否支持触摸:', deviceInfo.features.touch)
     * ```
     */
    getDeviceInfo(): DeviceInfo;
    /**
     * 获取性能指标
     */
    getPerformanceMetrics(): {
        detectionCount: number;
        averageDetectionTime: number;
        lastDetectionDuration: number;
    };
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
    loadModule<T extends DeviceModule = DeviceModule>(name: string): Promise<T>;
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
     * 更新性能指标
     */
    private updatePerformanceMetrics;
    /**
     * 处理检测错误
     */
    private handleDetectionError;
    /**
     * 检测设备信息
     */
    private detectDevice;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 处理设备变化 - 优化版本
     */
    private handleDeviceChange;
    /**
     * 检查设备信息是否发生变化
     */
    private hasDeviceInfoChanged;
    /**
     * 移除事件监听器
     */
    private removeEventListeners;
}
//# sourceMappingURL=DeviceDetector.d.ts.map