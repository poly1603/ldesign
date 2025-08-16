import { DeviceType, Orientation } from '../types/index.js'

/**
 * 高性能防抖函数
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @param immediate - 是否立即执行
 */
declare function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void
/**
 * 高性能节流函数
 * @param func - 要节流的函数
 * @param wait - 等待时间（毫秒）
 * @param options - 配置选项
 * @param options.leading - 是否在开始时执行
 * @param options.trailing - 是否在结束时执行
 */
declare function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options?: {
    leading?: boolean
    trailing?: boolean
  }
): (...args: Parameters<T>) => void
/**
 * 检测是否为移动设备
 * @param userAgent - 可选的用户代理字符串，如果不提供则使用当前浏览器的 userAgent
 */
declare function isMobileDevice(userAgent?: string): boolean
/**
 * 检测是否为触摸设备
 */
declare function isTouchDevice(): boolean
/**
 * 根据屏幕宽度判断设备类型
 */
declare function getDeviceTypeByWidth(
  width: number,
  breakpoints?: {
    mobile: number
    tablet: number
  }
): DeviceType
/**
 * 获取屏幕方向
 * @param width - 可选的屏幕宽度，如果不提供则使用当前窗口宽度
 * @param height - 可选的屏幕高度，如果不提供则使用当前窗口高度
 */
declare function getScreenOrientation(
  width?: number,
  height?: number
): Orientation
/**
 * 解析用户代理字符串获取操作系统信息（带缓存）
 */
declare function parseOS(userAgent: string): {
  name: string
  version: string
}
/**
 * 解析用户代理字符串获取浏览器信息（带缓存）
 */
declare function parseBrowser(userAgent: string): {
  name: string
  version: string
}
/**
 * 获取设备像素比
 */
declare function getPixelRatio(): number
/**
 * 检查是否支持某个 API
 */
declare function isAPISupported(api: string): boolean
/**
 * 安全地访问 navigator API
 */
declare function safeNavigatorAccess<T>(
  accessor: (navigator: Navigator) => T,
  fallback: T
): T
declare function safeNavigatorAccess<K extends keyof Navigator>(
  property: K,
  fallback?: Navigator[K]
): Navigator[K] | undefined
/**
 * 格式化字节大小
 */
declare function formatBytes(bytes: number, decimals?: number): string
/**
 * 生成唯一 ID
 * @param prefix - 可选的前缀
 */
declare function generateId(prefix?: string): string

export {
  debounce,
  formatBytes,
  generateId,
  getDeviceTypeByWidth,
  getPixelRatio,
  getScreenOrientation,
  isAPISupported,
  isMobileDevice,
  isTouchDevice,
  parseBrowser,
  parseOS,
  safeNavigatorAccess,
  throttle,
}
