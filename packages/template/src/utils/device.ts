import type { DeviceDetectionConfig, DeviceType, ResponsiveBreakpoints } from '@/types'

/**
 * 默认响应式断点配置
 */
export const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
}

/**
 * 默认设备检测配置
 */
export const DEFAULT_DEVICE_CONFIG: DeviceDetectionConfig = {
  mobileBreakpoint: DEFAULT_BREAKPOINTS.md,
  tabletBreakpoint: DEFAULT_BREAKPOINTS.lg,
  desktopBreakpoint: DEFAULT_BREAKPOINTS.xl
}

/**
 * 获取当前视口宽度
 */
export function getViewportWidth(): number {
  if (typeof window === 'undefined')
    return 1920
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
}

/**
 * 获取当前视口高度
 */
export function getViewportHeight(): number {
  if (typeof window === 'undefined')
    return 1080
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined')
    return false

  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'mobile',
    'android',
    'iphone',
    'ipod',
    'blackberry',
    'windows phone',
    'opera mini',
    'iemobile'
  ]

  return mobileKeywords.some(keyword => userAgent.includes(keyword))
}

/**
 * 检测是否为平板设备
 */
export function isTabletDevice(): boolean {
  if (typeof navigator === 'undefined')
    return false

  const userAgent = navigator.userAgent.toLowerCase()
  const tabletKeywords = ['ipad', 'tablet', 'kindle', 'playbook', 'silk']

  return tabletKeywords.some(keyword => userAgent.includes(keyword))
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined')
    return false

  return 'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || (navigator as any).msMaxTouchPoints > 0
}

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
 * 基于用户代理检测设备类型
 */
export function detectDeviceByUserAgent(): DeviceType {
  if (isMobileDevice())
    return 'mobile'
  if (isTabletDevice())
    return 'tablet'
  return 'desktop'
}

/**
 * 综合检测设备类型
 */
export function detectDevice(config: DeviceDetectionConfig = DEFAULT_DEVICE_CONFIG): DeviceType {
  // 优先使用自定义检测器
  if (config.customDetector) {
    return config.customDetector()
  }

  // 结合用户代理和视口宽度检测
  const userAgentDevice = detectDeviceByUserAgent()
  const viewportDevice = detectDeviceByViewport(config)

  // 如果用户代理检测为移动设备，优先采用
  if (userAgentDevice === 'mobile')
    return 'mobile'

  // 如果用户代理检测为平板，但视口较小，可能是小平板或大手机
  if (userAgentDevice === 'tablet' && viewportDevice === 'mobile') {
    return 'tablet'
  }

  // 其他情况采用视口检测结果
  return viewportDevice
}

/**
 * 创建设备变化监听器
 */
export function createDeviceWatcher(
  callback: (device: DeviceType) => void,
  config: DeviceDetectionConfig = DEFAULT_DEVICE_CONFIG
): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  let currentDevice = detectDevice(config)

  const handleResize = () => {
    const newDevice = detectDevice(config)
    if (newDevice !== currentDevice) {
      currentDevice = newDevice
      callback(newDevice)
    }
  }

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 监听屏幕方向变化
  if ('orientation' in window) {
    window.addEventListener('orientationchange', handleResize)
  }

  // 返回清理函数
  return () => {
    window.removeEventListener('resize', handleResize)
    if ('orientation' in window) {
      window.removeEventListener('orientationchange', handleResize)
    }
  }
}

/**
 * 获取设备信息
 */
export function getDeviceInfo() {
  const width = getViewportWidth()
  const height = getViewportHeight()
  const device = detectDevice()
  const isMobile = isMobileDevice()
  const isTablet = isTabletDevice()
  const isTouch = isTouchDevice()

  return {
    width,
    height,
    device,
    isMobile,
    isTablet,
    isTouch,
    aspectRatio: width / height,
    orientation: width > height ? 'landscape' : 'portrait'
  }
}

/**
 * 检查设备是否支持指定的最小/最大宽度
 */
export function checkDeviceSupport(minWidth?: number, maxWidth?: number): boolean {
  const width = getViewportWidth()

  if (minWidth && width < minWidth)
    return false
  if (maxWidth && width > maxWidth)
    return false

  return true
}
