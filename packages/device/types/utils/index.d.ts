import type { DeviceType, Orientation } from '../types';
/**
 * 高性能防抖函数
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @param immediate - 是否立即执行
 */
export declare function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number, immediate?: boolean): (...args: Parameters<T>) => void;
/**
 * 高性能节流函数
 * @param func - 要节流的函数
 * @param wait - 等待时间（毫秒）
 * @param options - 配置选项
 * @param options.leading - 是否在开始时执行
 * @param options.trailing - 是否在结束时执行
 */
export declare function throttle<T extends (...args: unknown[]) => unknown>(func: T, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): (...args: Parameters<T>) => void;
/**
 * 检测是否为移动设备
 * @param userAgent - 可选的用户代理字符串，如果不提供则使用当前浏览器的 userAgent
 */
export declare function isMobileDevice(userAgent?: string): boolean;
/**
 * 检测是否为触摸设备
 */
export declare function isTouchDevice(): boolean;
/**
 * 根据屏幕宽度判断设备类型
 */
export declare function getDeviceTypeByWidth(width: number, breakpoints?: {
    mobile: number;
    tablet: number;
}): DeviceType;
/**
 * 获取屏幕方向
 * @param width - 可选的屏幕宽度，如果不提供则使用当前窗口宽度
 * @param height - 可选的屏幕高度，如果不提供则使用当前窗口高度
 */
export declare function getScreenOrientation(width?: number, height?: number): Orientation;
/**
 * 解析用户代理字符串获取操作系统信息（带缓存）
 */
export declare function parseOS(userAgent: string): {
    name: string;
    version: string;
};
/**
 * 解析用户代理字符串获取浏览器信息（带缓存）
 */
export declare function parseBrowser(userAgent: string): {
    name: string;
    version: string;
};
/**
 * 获取设备像素比
 */
export declare function getPixelRatio(): number;
/**
 * 检查是否支持某个 API
 */
export declare function isAPISupported(api: string): boolean;
/**
 * 安全地访问 navigator API
 */
export declare function safeNavigatorAccess<T>(accessor: (navigator: Navigator) => T, fallback: T): T;
export declare function safeNavigatorAccess<K extends keyof Navigator>(property: K, fallback?: Navigator[K]): Navigator[K] | undefined;
/**
 * 格式化字节大小
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * 生成唯一 ID
 * @param prefix - 可选的前缀
 */
export declare function generateId(prefix?: string): string;
//# sourceMappingURL=index.d.ts.map