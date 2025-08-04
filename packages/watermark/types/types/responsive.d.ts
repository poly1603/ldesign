import { WatermarkConfig } from './config.js';

/**
 * 响应式相关类型定义
 */

interface Breakpoint {
    /** 断点名称 */
    name: string;
    /** 最小宽度 */
    minWidth: number;
    /** 最大宽度 */
    maxWidth?: number;
    /** 断点配置 */
    config: Partial<WatermarkConfig>;
}
interface ResponsiveConfig {
    /** 是否启用响应式 */
    enabled?: boolean;
    /** 断点配置 */
    breakpoints?: Record<string, Partial<WatermarkConfig>>;
    /** 是否自动调整大小 */
    autoResize?: boolean;
    /** 防抖时间(毫秒) */
    debounceTime?: number;
    /** 是否监听方向变化 */
    watchOrientation?: boolean;
    /** 是否监听容器变化 */
    watchContainer?: boolean;
    /** 自定义媒体查询 */
    customQueries?: MediaQuery[];
}
interface MediaQuery {
    /** 查询名称 */
    name: string;
    /** 媒体查询字符串 */
    query: string;
    /** 匹配时的配置 */
    config: Partial<WatermarkConfig>;
    /** 是否当前匹配 */
    matches?: boolean;
}
interface DeviceInfo {
    /** 设备类型 */
    type: 'desktop' | 'tablet' | 'mobile';
    /** 屏幕宽度 */
    screenWidth: number;
    /** 屏幕高度 */
    screenHeight: number;
    /** 设备像素比 */
    pixelRatio: number;
    /** 方向 */
    orientation: 'portrait' | 'landscape';
    /** 是否触摸设备 */
    isTouchDevice: boolean;
    /** 用户代理 */
    userAgent: string;
}
interface ContainerInfo {
    /** 容器宽度 */
    width: number;
    /** 容器高度 */
    height: number;
    /** 容器位置 */
    rect: DOMRect;
    /** 可视区域 */
    viewport: {
        width: number;
        height: number;
    };
    /** 滚动位置 */
    scroll: {
        x: number;
        y: number;
    };
}
interface ResponsiveManager {
    /** 当前设备信息 */
    deviceInfo: DeviceInfo;
    /** 当前容器信息 */
    containerInfo: ContainerInfo;
    /** 当前断点 */
    currentBreakpoint: string;
    /** 是否已初始化 */
    initialized: boolean;
    /** 初始化 */
    init(container: HTMLElement, config: ResponsiveConfig): void;
    /** 销毁 */
    destroy(): void;
    /** 获取当前配置 */
    getCurrentConfig(baseConfig: WatermarkConfig): WatermarkConfig;
    /** 监听容器变化 */
    observeContainer(container: HTMLElement, callback: (info: ContainerInfo) => void): void;
    /** 监听断点变化 */
    observeBreakpoints(callback: (breakpoint: string, config: Partial<WatermarkConfig>) => void): void;
    /** 手动触发重新计算 */
    recalculate(): void;
}
interface ResponsiveEvents {
    /** 断点变化 */
    breakpointChanged: (newBreakpoint: string, oldBreakpoint: string, config: Partial<WatermarkConfig>) => void;
    /** 容器尺寸变化 */
    containerResized: (containerInfo: ContainerInfo) => void;
    /** 设备方向变化 */
    orientationChanged: (orientation: 'portrait' | 'landscape') => void;
    /** 媒体查询匹配变化 */
    mediaQueryChanged: (query: MediaQuery, matches: boolean) => void;
    /** 设备信息更新 */
    deviceInfoUpdated: (deviceInfo: DeviceInfo) => void;
}
type AdaptiveStrategy = 'scale' | 'density' | 'size' | 'spacing' | 'content' | 'hybrid';
interface AdaptiveConfig {
    /** 自适应策略 */
    strategy: AdaptiveStrategy;
    /** 最小缩放比例 */
    minScale?: number;
    /** 最大缩放比例 */
    maxScale?: number;
    /** 最小密度 */
    minDensity?: number;
    /** 最大密度 */
    maxDensity?: number;
    /** 是否保持宽高比 */
    maintainAspectRatio?: boolean;
    /** 自定义计算函数 */
    customCalculator?: (containerInfo: ContainerInfo, deviceInfo: DeviceInfo) => Partial<WatermarkConfig>;
}
interface BreakpointManager {
    /** 所有断点 */
    breakpoints: Map<string, Breakpoint>;
    /** 当前断点 */
    current: string;
    /** 添加断点 */
    add(breakpoint: Breakpoint): void;
    /** 删除断点 */
    remove(name: string): void;
    /** 获取断点 */
    get(name: string): Breakpoint | undefined;
    /** 获取匹配的断点 */
    getMatching(width: number): Breakpoint | undefined;
    /** 获取所有匹配的断点 */
    getAllMatching(width: number): Breakpoint[];
    /** 清空所有断点 */
    clear(): void;
}
interface MediaQueryManager {
    /** 所有媒体查询 */
    queries: Map<string, MediaQuery>;
    /** 添加媒体查询 */
    add(query: MediaQuery): void;
    /** 删除媒体查询 */
    remove(name: string): void;
    /** 获取媒体查询 */
    get(name: string): MediaQuery | undefined;
    /** 检查匹配状态 */
    checkMatches(): void;
    /** 获取所有匹配的查询 */
    getMatching(): MediaQuery[];
    /** 清空所有查询 */
    clear(): void;
}
interface ResizeObserverConfig {
    /** 防抖时间 */
    debounceTime?: number;
    /** 是否观察内容盒子 */
    observeContentBox?: boolean;
    /** 是否观察边框盒子 */
    observeBorderBox?: boolean;
    /** 是否观察设备像素内容盒子 */
    observeDevicePixelContentBox?: boolean;
}
declare const DEFAULT_BREAKPOINTS: Record<string, number>;
declare const DEFAULT_RESPONSIVE_CONFIG: Required<Omit<ResponsiveConfig, 'breakpoints' | 'customQueries'>>;

export { DEFAULT_BREAKPOINTS, DEFAULT_RESPONSIVE_CONFIG };
export type { AdaptiveConfig, AdaptiveStrategy, Breakpoint, BreakpointManager, ContainerInfo, DeviceInfo, MediaQuery, MediaQueryManager, ResizeObserverConfig, ResponsiveConfig, ResponsiveEvents, ResponsiveManager };
