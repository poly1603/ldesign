import { DeviceType, Orientation } from '../types/index.js';

/**
 * 防抖函数
 */
declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
declare function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 检测是否为移动设备
 */
declare function isMobileDevice(): boolean;
/**
 * 检测是否为触摸设备
 */
declare function isTouchDevice(): boolean;
/**
 * 根据屏幕宽度判断设备类型
 */
declare function getDeviceTypeByWidth(width: number, breakpoints?: {
    mobile: number;
    tablet: number;
}): DeviceType;
/**
 * 获取屏幕方向
 */
declare function getScreenOrientation(): Orientation;
/**
 * 解析用户代理字符串获取操作系统信息
 */
declare function parseOS(userAgent: string): {
    name: string;
    version: string;
};
/**
 * 解析用户代理字符串获取浏览器信息
 */
declare function parseBrowser(userAgent: string): {
    name: string;
    version: string;
};
/**
 * 获取设备像素比
 */
declare function getPixelRatio(): number;
/**
 * 检查是否支持某个 API
 */
declare function isAPISupported(api: string): boolean;
/**
 * 安全地访问 navigator API
 */
declare function safeNavigatorAccess<T>(accessor: (navigator: Navigator) => T, fallback: T): T;
/**
 * 格式化字节大小
 */
declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * 生成唯一 ID
 */
declare function generateId(): string;

export { debounce, formatBytes, generateId, getDeviceTypeByWidth, getPixelRatio, getScreenOrientation, isAPISupported, isMobileDevice, isTouchDevice, parseBrowser, parseOS, safeNavigatorAccess, throttle };
