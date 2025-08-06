/**
 * 设备检测核心模块
 * 统一管理所有设备检测相关功能
 */

import type { DeviceDetectionConfig, DeviceType, ResponsiveBreakpoints } from '../../types'

// ============ 常量定义 ============

/**
 * 默认响应式断点配置
 */
export const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
}

/**
 * 默认设备检测配置
 */
export const DEFAULT_DEVICE_CONFIG: DeviceDetectionConfig = {
  mobileBreakpoint: DEFAULT_BREAKPOINTS.md,
  tabletBreakpoint: DEFAULT_BREAKPOINTS.lg,
  desktopBreakpoint: DEFAULT_BREAKPOINTS.lg,
}

// ============ 缓存管理 ============

// 缓存视口信息，避免重复计算
let cachedViewport: { width: number, height: number, timestamp: number } | null = null
const VIEWPORT_CACHE_TTL = 100 // 100ms缓存

/**
 * 清除视口缓存（主要用于测试）
 */
export function clearViewportCache(): void {
  cachedViewport = null
}

// ============ 视口检测 ============

/**
 * 获取视口宽度
 */
export function getViewportWidth(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_BREAKPOINTS.xl // SSR 默认值
  }

  const now = Date.now()
  if (cachedViewport && (now - cachedViewport.timestamp) < VIEWPORT_CACHE_TTL) {
    return cachedViewport.width
  }

  const width = window.innerWidth || document.documentElement.clientWidth || 1920
  const height = window.innerHeight || document.documentElement.clientHeight || 1080

  cachedViewport = { width, height, timestamp: now }
  return width
}

/**
 * 获取视口高度
 */
export function getViewportHeight(): number {
  if (typeof window === 'undefined') {
    return 1080 // SSR 默认值
  }

  const now = Date.now()
  if (cachedViewport && (now - cachedViewport.timestamp) < VIEWPORT_CACHE_TTL) {
    return cachedViewport.height
  }

  const width = window.innerWidth || document.documentElement.clientWidth || 1920
  const height = window.innerHeight || document.documentElement.clientHeight || 1080

  cachedViewport = { width, height, timestamp: now }
  return height
}

// ============ 设备类型检测 ============

/**
 * 基于视口宽度检测设备类型
 */
export function detectDeviceByViewport(config: DeviceDetectionConfig = DEFAULT_DEVICE_CONFIG): DeviceType {
  const width = getViewportWidth()

  if (width < config.mobileBreakpoint) {
    return 'mobile'
  }
  else if (width < config.tabletBreakpoint) {
    return 'tablet'
  }
  else {
    return 'desktop'
  }
}

/**
 * 基于 User Agent 检测设备类型
 */
export function detectDeviceByUserAgent(): DeviceType {
  if (typeof navigator === 'undefined') {
    return 'desktop' // SSR 默认值
  }

  const userAgent = navigator.userAgent.toLowerCase()

  // 移动设备检测
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
  if (mobileRegex.test(userAgent)) {
    // 进一步区分平板和手机
    const tabletRegex = /ipad|android(?!.*mobile)|tablet/i
    return tabletRegex.test(userAgent) ? 'tablet' : 'mobile'
  }

  return 'desktop'
}

/**
 * 综合检测设备类型（优先使用视口，User Agent 作为辅助）
 */
export function detectDevice(config: DeviceDetectionConfig = DEFAULT_DEVICE_CONFIG): DeviceType {
  const viewportDevice = detectDeviceByViewport(config)
  const userAgentDevice = detectDeviceByUserAgent()

  // 如果 User Agent 检测为移动设备，但视口很大，可能是桌面浏览器的移动模式
  if (userAgentDevice === 'mobile' && viewportDevice === 'desktop') {
    return 'mobile' // 信任 User Agent
  }

  // 其他情况优先使用视口检测结果
  return viewportDevice
}

// ============ 触摸设备检测 ============

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return 'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || ((navigator as { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  return detectDevice() === 'mobile'
}

/**
 * 检测是否为平板设备
 */
export function isTabletDevice(): boolean {
  return detectDevice() === 'tablet'
}

// ============ 设备支持检查 ============

/**
 * 检查当前设备是否支持指定的宽度范围
 */
export function checkDeviceSupport(minWidth?: number, maxWidth?: number): boolean {
  const currentWidth = getViewportWidth()

  if (minWidth !== undefined && currentWidth < minWidth) {
    return false
  }

  if (maxWidth !== undefined && currentWidth > maxWidth) {
    return false
  }

  return true
}

// ============ 设备信息 ============

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  type: DeviceType
  width: number
  height: number
  isTouch: boolean
  userAgent: string
  timestamp: number
}

/**
 * 获取完整的设备信息
 */
export function getDeviceInfo(config: DeviceDetectionConfig = DEFAULT_DEVICE_CONFIG): DeviceInfo {
  return {
    type: detectDevice(config),
    width: getViewportWidth(),
    height: getViewportHeight(),
    isTouch: isTouchDevice(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: Date.now(),
  }
}

// ============ 设备变化监听 ============

/**
 * 设备变化回调函数类型
 */
export type DeviceChangeCallback = (newDevice: DeviceType, oldDevice: DeviceType, info: DeviceInfo) => void

/**
 * 创建设备变化监听器
 */
export function createDeviceWatcher(
  callback: DeviceChangeCallback,
  config: DeviceDetectionConfig = DEFAULT_DEVICE_CONFIG,
): () => void {
  let currentDevice = detectDevice(config)

  const handleResize = (): void => {
    clearViewportCache() // 清除缓存以获取最新值
    const newDevice = detectDevice(config)
    if (newDevice !== currentDevice) {
      const oldDevice = currentDevice
      currentDevice = newDevice
      callback(newDevice, oldDevice, getDeviceInfo(config))
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }

  return () => { } // SSR 环境返回空函数
}

/**
 * 监听设备变化（简化版本）
 */
export function watchDeviceChange(
  callback: DeviceChangeCallback,
  config: DeviceDetectionConfig = DEFAULT_DEVICE_CONFIG,
): () => void {
  return createDeviceWatcher(callback, config)
}
