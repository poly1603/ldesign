import type { DeviceDetectionConfig, DeviceType, ResponsiveBreakpoints } from '../types'

/**
 * 默认响应式断点配置
 */
export const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
}

/**
 * 默认设备检测配置
 */
export const DEFAULT_DEVICE_CONFIG: DeviceDetectionConfig = {
  mobileBreakpoint: DEFAULT_BREAKPOINTS.md,
  tabletBreakpoint: DEFAULT_BREAKPOINTS.lg,
  desktopBreakpoint: DEFAULT_BREAKPOINTS.xl,
}

// 缓存视口信息，避免重复计算
let cachedViewport: {
  width: number
  height: number
  timestamp: number
} | null = null
const VIEWPORT_CACHE_TTL = 100 // 100ms缓存

/**
 * 清除视口缓存（主要用于测试）
 */
export function clearViewportCache(): void {
  cachedViewport = null
}

/**
 * 获取当前视口信息（带缓存）
 */
function getViewportInfo(): { width: number; height: number } {
  const now = Date.now()

  // 检查缓存是否有效
  if (cachedViewport && now - cachedViewport.timestamp < VIEWPORT_CACHE_TTL) {
    return { width: cachedViewport.width, height: cachedViewport.height }
  }

  // 计算新的视口信息
  if (typeof window === 'undefined') {
    const viewport = { width: 1920, height: 1080 }
    cachedViewport = { ...viewport, timestamp: now }
    return viewport
  }

  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight

  cachedViewport = { width, height, timestamp: now }
  return { width, height }
}

/**
 * 获取当前视口宽度
 */
export function getViewportWidth(): number {
  return getViewportInfo().width
}

/**
 * 获取当前视口高度
 */
export function getViewportHeight(): number {
  return getViewportInfo().height
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false

  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'mobile',
    'android',
    'iphone',
    'ipod',
    'blackberry',
    'windows phone',
    'opera mini',
    'iemobile',
  ]

  return mobileKeywords.some(keyword => userAgent.includes(keyword))
}

/**
 * 检测是否为平板设备
 */
export function isTabletDevice(): boolean {
  if (typeof navigator === 'undefined') return false

  const userAgent = navigator.userAgent.toLowerCase()
  const tabletKeywords = ['ipad', 'tablet', 'kindle', 'playbook', 'silk']

  return tabletKeywords.some(keyword => userAgent.includes(keyword))
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    ((navigator as { msMaxTouchPoints?: number }).msMaxTouchPoints ?? 0) > 0
  )
}

/**
 * 基于视口宽度检测设备类型
 */
export function detectDeviceByViewport(config: DeviceDetectionConfig = DEFAULT_DEVICE_CONFIG): DeviceType {
  const width = getViewportWidth()

  if (width < config.mobileBreakpoint) {
    return 'mobile'
  } else if (width < config.tabletBreakpoint) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * 基于用户代理检测设备类型
 */
export function detectDeviceByUserAgent(): DeviceType {
  if (isMobileDevice()) return 'mobile'
  if (isTabletDevice()) return 'tablet'
  return 'desktop'
}

// 缓存设备检测结果
let cachedDevice: {
  device: DeviceType
  timestamp: number
  configHash: string
} | null = null
const DEVICE_CACHE_TTL = 1000 // 1秒缓存

/**
 * 生成配置哈希
 */
function getConfigHash(config: DeviceDetectionConfig): string {
  return JSON.stringify({
    mobile: config.mobileBreakpoint,
    tablet: config.tabletBreakpoint,
    desktop: config.desktopBreakpoint,
  })
}

/**
 * 综合检测设备类型（带缓存）
 */
export function detectDevice(config: DeviceDetectionConfig = DEFAULT_DEVICE_CONFIG): DeviceType {
  // 优先使用自定义检测器
  if (config.customDetector) {
    return config.customDetector()
  }

  const now = Date.now()
  const configHash = getConfigHash(config)

  // 检查缓存是否有效
  if (cachedDevice && now - cachedDevice.timestamp < DEVICE_CACHE_TTL && cachedDevice.configHash === configHash) {
    return cachedDevice.device
  }

  // 结合用户代理和视口宽度检测
  const userAgentDevice = detectDeviceByUserAgent()
  const viewportDevice = detectDeviceByViewport(config)

  let device: DeviceType

  // 如果用户代理检测为移动设备，优先采用
  if (userAgentDevice === 'mobile') {
    device = 'mobile'
  }
  // 如果用户代理检测为平板，但视口较小，可能是小平板或大手机
  else if (userAgentDevice === 'tablet' && viewportDevice === 'mobile') {
    device = 'tablet'
  }
  // 其他情况采用视口检测结果
  else {
    device = viewportDevice
  }

  // 缓存结果
  cachedDevice = { device, timestamp: now, configHash }

  return device
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
  let timeoutId: number | null = null

  // 防抖处理，避免频繁触发
  const handleResize = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      const newDevice = detectDevice(config)
      if (newDevice !== currentDevice) {
        currentDevice = newDevice
        callback(newDevice)
      }
      timeoutId = null
    }, 150) // 150ms 防抖延迟
  }

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 监听屏幕方向变化
  if ('orientation' in window) {
    window.addEventListener('orientationchange', handleResize)
  }

  // 返回清理函数
  return () => {
    // 清理定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    window.removeEventListener('resize', handleResize)
    if ('orientation' in window) {
      window.removeEventListener('orientationchange', handleResize)
    }
  }
}

/**
 * 获取设备信息（优化版本，减少重复计算）
 */
export function getDeviceInfo() {
  const { width, height } = getViewportInfo()
  const device = detectDevice()

  // 基于设备类型推断其他属性，避免重复检测
  const isMobile = device === 'mobile'
  const isTablet = device === 'tablet'
  const isTouch = isMobile || isTablet || isTouchDevice()

  return {
    width,
    height,
    device,
    isMobile,
    isTablet,
    isTouch,
    aspectRatio: width / height,
    orientation: width > height ? 'landscape' : 'portrait',
  }
}

/**
 * 检查设备是否支持指定的最小/最大宽度
 */
export function checkDeviceSupport(minWidth?: number, maxWidth?: number): boolean {
  const width = getViewportWidth()

  if (minWidth && width < minWidth) return false
  if (maxWidth && width > maxWidth) return false

  return true
}
