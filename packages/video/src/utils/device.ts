/**
 * 设备检测工具函数
 * 提供设备类型、操作系统、浏览器等检测功能
 */

import { DeviceType, OSType, BrowserType, ScreenOrientation } from '../types/device'
import type {
  DeviceInfo,
  OSInfo,
  BrowserInfo,
  ScreenInfo,
  ViewportInfo,
  NetworkInfo,
  DeviceCapabilities,
  PerformanceInfo,
  ScreenOrientation
} from '../types/device'

/**
 * 获取用户代理字符串
 */
export function getUserAgent(): string {
  return navigator.userAgent || ''
}

/**
 * 检测设备类型
 */
export function detectDeviceType(): DeviceType {
  const ua = getUserAgent().toLowerCase()

  // 检测智能电视
  if (/smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast/i.test(ua)) {
    return DeviceType.TV
  }

  // 检测移动设备
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return DeviceType.MOBILE
  }

  // 检测平板设备
  if (/tablet|ipad|playbook|silk/i.test(ua) ||
    (/android/i.test(ua) && !/mobile/i.test(ua))) {
    return DeviceType.TABLET
  }

  // 默认为桌面设备
  return DeviceType.DESKTOP
}

/**
 * 检测操作系统
 */
export function detectOS(): OSInfo {
  const ua = getUserAgent()
  const platform = navigator.platform || ''

  // iOS
  if (/iPad|iPhone|iPod/.test(ua)) {
    const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/)
    const version = match ? `${match[1]}.${match[2]}.${match[3] || '0'}` : 'unknown'
    return {
      type: OSType.IOS,
      name: 'iOS',
      version,
      architecture: /iPad/.test(ua) ? 'arm64' : 'arm'
    }
  }

  // Android
  if (/Android/.test(ua)) {
    const match = ua.match(/Android (\d+(?:\.\d+)*)/)
    const version = match ? match[1] : 'unknown'
    return {
      type: OSType.ANDROID,
      name: 'Android',
      version,
      architecture: /arm64|aarch64/i.test(ua) ? 'arm64' : 'arm'
    }
  }

  // Windows
  if (/Windows/.test(ua)) {
    let version = 'unknown'
    if (/Windows NT 10/.test(ua)) version = '10'
    else if (/Windows NT 6.3/.test(ua)) version = '8.1'
    else if (/Windows NT 6.2/.test(ua)) version = '8'
    else if (/Windows NT 6.1/.test(ua)) version = '7'

    return {
      type: OSType.WINDOWS,
      name: 'Windows',
      version,
      architecture: /WOW64|Win64|x64/.test(ua) ? 'x64' : 'x86'
    }
  }

  // macOS
  if (/Macintosh|Mac OS X/.test(ua)) {
    const match = ua.match(/Mac OS X (\d+(?:[._]\d+)*)/)
    const version = match ? match[1].replace(/_/g, '.') : 'unknown'
    return {
      type: OSType.MACOS,
      name: 'macOS',
      version,
      architecture: /Intel/.test(ua) ? 'x64' : 'arm64'
    }
  }

  // Linux
  if (/Linux/.test(ua)) {
    return {
      type: OSType.LINUX,
      name: 'Linux',
      version: 'unknown',
      architecture: /x86_64|amd64/.test(ua) ? 'x64' : 'x86'
    }
  }

  return {
    type: OSType.UNKNOWN,
    name: 'Unknown',
    version: 'unknown',
    architecture: 'unknown'
  }
}

/**
 * 检测浏览器
 */
export function detectBrowser(): BrowserInfo {
  const ua = getUserAgent()

  // Chrome
  if (/Chrome/.test(ua) && !/Chromium|Edge/.test(ua)) {
    const match = ua.match(/Chrome\/(\d+(?:\.\d+)*)/)
    return {
      type: BrowserType.CHROME,
      name: 'Chrome',
      version: match ? match[1] : 'unknown',
      engine: 'Blink',
      engineVersion: 'unknown',
      userAgent: ua,
      mobile: /Mobile/.test(ua),
      webview: /wv/.test(ua)
    }
  }

  // Firefox
  if (/Firefox/.test(ua)) {
    const match = ua.match(/Firefox\/(\d+(?:\.\d+)*)/)
    return {
      type: BrowserType.FIREFOX,
      name: 'Firefox',
      version: match ? match[1] : 'unknown',
      engine: 'Gecko',
      engineVersion: 'unknown',
      userAgent: ua,
      mobile: /Mobile/.test(ua),
      webview: false
    }
  }

  // Safari
  if (/Safari/.test(ua) && !/Chrome|Chromium/.test(ua)) {
    const match = ua.match(/Version\/(\d+(?:\.\d+)*)/)
    return {
      type: BrowserType.SAFARI,
      name: 'Safari',
      version: match ? match[1] : 'unknown',
      engine: 'WebKit',
      engineVersion: 'unknown',
      userAgent: ua,
      mobile: /Mobile/.test(ua),
      webview: false
    }
  }

  // Edge
  if (/Edge/.test(ua)) {
    const match = ua.match(/Edge\/(\d+(?:\.\d+)*)/)
    return {
      type: BrowserType.EDGE,
      name: 'Edge',
      version: match ? match[1] : 'unknown',
      engine: 'EdgeHTML',
      engineVersion: 'unknown',
      userAgent: ua,
      mobile: /Mobile/.test(ua),
      webview: false
    }
  }

  // 微信浏览器
  if (/MicroMessenger/.test(ua)) {
    const match = ua.match(/MicroMessenger\/(\d+(?:\.\d+)*)/)
    return {
      type: BrowserType.WECHAT,
      name: 'WeChat',
      version: match ? match[1] : 'unknown',
      engine: 'WebKit',
      engineVersion: 'unknown',
      userAgent: ua,
      mobile: true,
      webview: true
    }
  }

  return {
    type: BrowserType.UNKNOWN,
    name: 'Unknown',
    version: 'unknown',
    engine: 'unknown',
    engineVersion: 'unknown',
    userAgent: ua,
    mobile: /Mobile/.test(ua),
    webview: false
  }
}

/**
 * 检测屏幕信息
 */
export function detectScreen(): ScreenInfo {
  const screen = window.screen

  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: screen.colorDepth,
    orientation: screen.width > screen.height ? ScreenOrientation.LANDSCAPE : ScreenOrientation.PORTRAIT,
    orientationSupport: 'orientation' in screen
  }
}

/**
 * 检测视口信息
 */
export function detectViewport(): ViewportInfo {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX || window.pageXOffset,
    scrollY: window.scrollY || window.pageYOffset,
    zoom: window.devicePixelRatio || 1
  }
}

/**
 * 检测网络信息
 */
export function detectNetwork(): NetworkInfo {
  const connection = (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection

  if (connection) {
    return {
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
      online: navigator.onLine
    }
  }

  return {
    type: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    online: navigator.onLine
  }
}

/**
 * 检测设备能力
 */
export function detectCapabilities(): DeviceCapabilities {
  return {
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    mouse: matchMedia('(pointer: fine)').matches,
    keyboard: true, // 假设所有设备都有键盘支持
    fullscreen: !!(document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled),
    pip: 'pictureInPictureEnabled' in document,
    orientationLock: 'orientation' in screen && 'lock' in screen.orientation,
    vibration: 'vibrate' in navigator,
    deviceMotion: 'DeviceMotionEvent' in window,
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    webWorkers: 'Worker' in window,
    serviceWorkers: 'serviceWorker' in navigator,
    webAssembly: 'WebAssembly' in window
  }
}

/**
 * 检测性能信息
 */
export function detectPerformance(): PerformanceInfo {
  const memory = (performance as any).memory
  const hardwareConcurrency = navigator.hardwareConcurrency || 1

  return {
    cpuCores: hardwareConcurrency,
    memory: memory ? Math.round(memory.jsHeapSizeLimit / 1024 / 1024 / 1024 * 100) / 100 : 0,
    gpu: detectGPU(),
    hardwareAcceleration: detectHardwareAcceleration()
  }
}

/**
 * 检测GPU信息
 */
function detectGPU() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        return {
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        }
      }
    }
  } catch (e) {
    // 忽略错误
  }

  return undefined
}

/**
 * 检测硬件加速支持
 */
function detectHardwareAcceleration(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch (e) {
    return false
  }
}

/**
 * 获取完整设备信息
 */
export function getDeviceInfo(): DeviceInfo {
  const deviceType = detectDeviceType()
  const os = detectOS()
  const browser = detectBrowser()
  const screen = detectScreen()
  const viewport = detectViewport()
  const network = detectNetwork()
  const performance = detectPerformance()
  const capabilities = detectCapabilities()

  return {
    type: deviceType,
    os,
    browser,
    screen,
    viewport,
    network,
    performance,
    capabilities,
    isMobile: deviceType === DeviceType.MOBILE,
    isTablet: deviceType === DeviceType.TABLET,
    isDesktop: deviceType === DeviceType.DESKTOP,
    isTV: deviceType === DeviceType.TV,
    isTouch: capabilities.touch,
    isLandscape: screen.orientation === ScreenOrientation.LANDSCAPE,
    isPortrait: screen.orientation === ScreenOrientation.PORTRAIT
  }
}

/**
 * 检查是否支持特定功能
 */
export function supports(feature: string): boolean {
  const capabilities = detectCapabilities()

  switch (feature.toLowerCase()) {
    case 'touch':
      return capabilities.touch
    case 'fullscreen':
      return capabilities.fullscreen
    case 'pip':
    case 'pictureinpicture':
      return capabilities.pip
    case 'webgl':
      return detectHardwareAcceleration()
    case 'webworkers':
      return capabilities.webWorkers
    case 'serviceworkers':
      return capabilities.serviceWorkers
    case 'webassembly':
      return capabilities.webAssembly
    default:
      return false
  }
}
