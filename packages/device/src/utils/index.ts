import type { DeviceType, Orientation } from '../types'

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout)
      clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined')
    return false

  const userAgent = window.navigator.userAgent
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  return mobileRegex.test(userAgent)
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined')
    return false

  return (
    'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || (navigator as any).msMaxTouchPoints > 0
  )
}

/**
 * 根据屏幕宽度判断设备类型
 */
export function getDeviceTypeByWidth(
  width: number,
  breakpoints = { mobile: 768, tablet: 1024 },
): DeviceType {
  if (width < breakpoints.mobile)
    return 'mobile'
  if (width < breakpoints.tablet)
    return 'tablet'
  return 'desktop'
}

/**
 * 获取屏幕方向
 */
export function getScreenOrientation(): Orientation {
  if (typeof window === 'undefined')
    return 'landscape'

  // 优先使用 screen.orientation API
  if (screen.orientation)
    return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? 'portrait' : 'landscape'

  // 降级到窗口尺寸判断
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
}

/**
 * 解析用户代理字符串获取操作系统信息
 */
export function parseOS(userAgent: string): { name: string, version: string } {
  const os = { name: 'unknown', version: 'unknown' }

  // Windows
  const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/)
  if (windowsMatch) {
    os.name = 'Windows'
    const version = windowsMatch[1]
    const versionMap: Record<string, string> = {
      '10.0': '10',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': '7',
      '6.0': 'Vista',
      '5.1': 'XP',
    }
    os.version = versionMap[version] || version
  }
  // macOS
  else {
    const macMatch = userAgent.match(/Mac OS X ([\d_]+)/)
    if (macMatch) {
      os.name = 'macOS'
      os.version = macMatch[1].replace(/_/g, '.')
    }
    // iOS
    else {
      const iosMatch = userAgent.match(/OS ([\d_]+) like Mac OS X/)
      if (iosMatch) {
        os.name = 'iOS'
        os.version = iosMatch[1].replace(/_/g, '.')
      }
      // Android
      else {
        const androidMatch = userAgent.match(/Android ([\d.]+)/)
        if (androidMatch) {
          os.name = 'Android'
          os.version = androidMatch[1]
        }
        // Linux
        else if (/Linux/.test(userAgent)) {
          os.name = 'Linux'
        }
      }
    }
  }

  return os
}

/**
 * 解析用户代理字符串获取浏览器信息
 */
export function parseBrowser(userAgent: string): { name: string, version: string } {
  const browser = { name: 'unknown', version: 'unknown' }

  // Chrome
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/)
  if (chromeMatch && !/Edg/.test(userAgent)) {
    browser.name = 'Chrome'
    browser.version = chromeMatch[1]
  }
  // Edge
  else {
    const edgeMatch = userAgent.match(/Edg\/(\d+)/)
    if (edgeMatch) {
      browser.name = 'Edge'
      browser.version = edgeMatch[1]
    }
    // Firefox
    else {
      const firefoxMatch = userAgent.match(/Firefox\/(\d+)/)
      if (firefoxMatch) {
        browser.name = 'Firefox'
        browser.version = firefoxMatch[1]
      }
      // Safari
      else {
        const safariMatch = userAgent.match(/Version\/(\d+)/)
        if (safariMatch) {
          browser.name = 'Safari'
          browser.version = safariMatch[1]
        }
        // Internet Explorer
        else {
          const ieMatch = userAgent.match(/MSIE (\d+)/) || userAgent.match(/Trident.*rv:(\d+)/)
          if (ieMatch) {
            browser.name = 'Internet Explorer'
            browser.version = ieMatch[1]
          }
        }
      }
    }
  }

  return browser
}

/**
 * 获取设备像素比
 */
export function getPixelRatio(): number {
  if (typeof window === 'undefined')
    return 1
  return window.devicePixelRatio || 1
}

/**
 * 检查是否支持某个 API
 */
export function isAPISupported(api: string): boolean {
  if (typeof window === 'undefined')
    return false

  const parts = api.split('.')
  let obj: any = window

  for (const part of parts) {
    if (!(part in obj))
      return false
    obj = obj[part]
  }

  return true
}

/**
 * 安全地访问 navigator API
 */
export function safeNavigatorAccess<T>(
  accessor: (navigator: Navigator) => T,
  fallback: T,
): T {
  if (typeof navigator === 'undefined')
    return fallback

  try {
    return accessor(navigator)
  }
  catch {
    return fallback
  }
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0)
    return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
