import type { DeviceType, Orientation } from '../types';
/**
 * 防抖函数
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 检测是否为移动设备
 */
export declare function isMobileDevice(): boolean;
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
 */
export declare function getScreenOrientation(): Orientation;
/**
 * 解析用户代理字符串获取操作系统信息
 */
export declare function parseOS(userAgent: string): {
    name: string;
    version: string;
};
/**
 * 解析用户代理字符串获取浏览器信息
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
/**
 * 格式化字节大小
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * 生成唯一 ID
 */
export declare function generateId(): string;
//# sourceMappingURL=index.d.ts.map