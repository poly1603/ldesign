/**
 * 设备类型检测和管理
 */

export type DeviceType = 'desktop' | 'tablet' | 'mobile'

export interface DeviceInfo {
  type: DeviceType
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  userAgent: string
}

/**
 * 设备断点配置
 */
export const DEVICE_BREAKPOINTS = {
  mobile: {
    min: 0,
    max: 767
  },
  tablet: {
    min: 768,
    max: 1023
  },
  desktop: {
    min: 1024,
    max: Infinity
  }
} as const

/**
 * 检测当前设备类型
 */
export function detectDeviceType(width?: number): DeviceType {
  const screenWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1024)
  
  if (screenWidth <= DEVICE_BREAKPOINTS.mobile.max) {
    return 'mobile'
  } else if (screenWidth <= DEVICE_BREAKPOINTS.tablet.max) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * 获取设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop',
      width: 1024,
      height: 768,
      orientation: 'landscape',
      userAgent: ''
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight
  const type = detectDeviceType(width)
  const orientation = width > height ? 'landscape' : 'portrait'
  const userAgent = navigator.userAgent

  return {
    type,
    width,
    height,
    orientation,
    userAgent
  }
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 
    'blackberry', 'windows phone', 'mobile'
  ]
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword))
}

/**
 * 检测是否为平板设备
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  const tabletKeywords = ['ipad', 'tablet', 'kindle']
  const width = window.innerWidth
  
  // 基于用户代理和屏幕尺寸判断
  const hasTabletUA = tabletKeywords.some(keyword => userAgent.includes(keyword))
  const hasTabletSize = width >= DEVICE_BREAKPOINTS.tablet.min && width <= DEVICE_BREAKPOINTS.tablet.max
  
  return hasTabletUA || hasTabletSize
}

/**
 * 监听设备变化
 */
export function watchDeviceChange(callback: (deviceInfo: DeviceInfo) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handleResize = () => {
    callback(getDeviceInfo())
  }

  const handleOrientationChange = () => {
    // 延迟执行，等待屏幕旋转完成
    setTimeout(() => {
      callback(getDeviceInfo())
    }, 100)
  }

  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleOrientationChange)

  return () => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleOrientationChange)
  }
}

/**
 * 获取设备类型的CSS类名
 */
export function getDeviceClassName(deviceType?: DeviceType): string {
  const type = deviceType ?? detectDeviceType()
  return `device-${type}`
}

/**
 * 判断是否为触摸设备
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 || 
         (navigator as any).msMaxTouchPoints > 0
}

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1
  return window.devicePixelRatio || 1
}

/**
 * 检测是否为高分辨率设备
 */
export function isHighDPIDevice(): boolean {
  return getDevicePixelRatio() > 1
}
