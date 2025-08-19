/**
 * 设备检测工具模块
 *
 * 提供设备类型检测和相关工具函数
 */

import type { DeviceType } from '../types'

export interface DeviceInfo {
  type: DeviceType
  width: number
  height: number
  pixelRatio: number
  userAgent: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
}

export interface DeviceBreakpoints {
  mobile: number
  tablet: number
  desktop: number
}

/**
 * 默认断点配置
 */
export const DEFAULT_BREAKPOINTS: DeviceBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
}

/**
 * 检测设备类型
 */
export function detectDeviceType(width?: number, breakpoints: DeviceBreakpoints = DEFAULT_BREAKPOINTS): DeviceType {
  const screenWidth = width || (typeof window !== 'undefined' ? window.innerWidth : 1200)

  if (screenWidth < breakpoints.mobile) {
    return 'mobile'
  } else if (screenWidth < breakpoints.tablet) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * 获取设备信息
 */
export function getDeviceInfo(breakpoints?: DeviceBreakpoints): DeviceInfo {
  if (typeof window === 'undefined') {
    // SSR 环境下的默认值
    return {
      type: 'desktop',
      width: 1200,
      height: 800,
      pixelRatio: 1,
      userAgent: '',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      orientation: 'landscape',
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight
  const type = detectDeviceType(width, breakpoints)

  return {
    type,
    width,
    height,
    pixelRatio: window.devicePixelRatio || 1,
    userAgent: navigator.userAgent,
    isMobile: type === 'mobile',
    isTablet: type === 'tablet',
    isDesktop: type === 'desktop',
    orientation: width > height ? 'landscape' : 'portrait',
  }
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检测是否为平板设备
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = navigator.userAgent
  return /iPad|Android(?!.*Mobile)/i.test(userAgent)
}

/**
 * 检测是否为桌面设备
 */
export function isDesktopDevice(): boolean {
  return !isMobileDevice() && !isTabletDevice()
}

/**
 * 检测设备方向
 */
export function getDeviceOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'landscape'

  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
}

/**
 * 检测是否支持触摸
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 获取屏幕像素比
 */
export function getPixelRatio(): number {
  if (typeof window === 'undefined') return 1

  return window.devicePixelRatio || 1
}

/**
 * 检测是否为高分辨率屏幕
 */
export function isHighDPI(): boolean {
  return getPixelRatio() > 1
}

/**
 * 设备检测器类
 */
export class DeviceDetector {
  private listeners: Array<(deviceInfo: DeviceInfo) => void> = []
  private currentDeviceInfo: DeviceInfo
  private breakpoints: DeviceBreakpoints

  constructor(breakpoints: DeviceBreakpoints = DEFAULT_BREAKPOINTS) {
    this.breakpoints = breakpoints
    this.currentDeviceInfo = getDeviceInfo(breakpoints)
    this.setupListener()
  }

  /**
   * 获取当前设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return this.currentDeviceInfo
  }

  /**
   * 获取设备类型
   */
  getDeviceType(): DeviceType {
    return this.currentDeviceInfo.type
  }

  /**
   * 添加设备变化监听器
   */
  addListener(callback: (deviceInfo: DeviceInfo) => void): () => void {
    this.listeners.push(callback)

    // 返回移除监听器的函数
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(): void {
    this.listeners = []
  }

  /**
   * 销毁检测器
   */
  destroy(): void {
    this.removeAllListeners()
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize)
      window.removeEventListener('orientationchange', this.handleResize)
    }
  }

  private setupListener(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('resize', this.handleResize)
    window.addEventListener('orientationchange', this.handleResize)
  }

  private handleResize = (): void => {
    const newDeviceInfo = getDeviceInfo(this.breakpoints)

    // 只有当设备类型发生变化时才触发回调
    if (newDeviceInfo.type !== this.currentDeviceInfo.type) {
      this.currentDeviceInfo = newDeviceInfo
      this.listeners.forEach(callback => callback(newDeviceInfo))
    } else {
      // 更新尺寸信息
      this.currentDeviceInfo = newDeviceInfo
    }
  }
}
