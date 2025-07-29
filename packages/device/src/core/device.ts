import { UAParser } from 'ua-parser-js'
import type {
  DeviceInfo,
  OSInfo,
  BrowserInfo,
  ScreenInfo,
  NetworkInfo,
  PerformanceInfo,
  DeviceFeatures,
  CompleteDeviceInfo,
  DeviceDetectionConfig,
  DeviceChangeEvent,
  DeviceType,
  OSType,
  BrowserType,
  Orientation,
  NetworkType
} from '../types'
import { EventEmitter } from '../utils/event-emitter'
import { detectFeatures, detectPerformance, detectNetwork } from '../utils'

/**
 * 设备检测核心类
 */
export class Device extends EventEmitter {
  private parser: UAParser
  private cache: Map<string, any> = new Map()
  private config: DeviceDetectionConfig
  private lastInfo?: CompleteDeviceInfo
  private orientationListener?: () => void
  private networkListener?: () => void

  constructor(config: DeviceDetectionConfig = {}) {
    super()
    this.config = {
      detailed: true,
      includePerformance: true,
      includeNetwork: true,
      includeBattery: true,
      includeFeatures: true,
      cacheTime: 5000,
      ...config
    }
    
    this.parser = new UAParser(this.config.customUserAgent)
    this.setupEventListeners()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      // 监听屏幕方向变化
      this.orientationListener = () => {
        const oldOrientation = this.lastInfo?.device.orientation
        const newOrientation = this.getOrientation()
        
        if (oldOrientation && oldOrientation !== newOrientation) {
          this.emit('change', {
            type: 'orientation',
            oldValue: oldOrientation,
            newValue: newOrientation,
            timestamp: Date.now()
          } as DeviceChangeEvent)
        }
      }
      
      window.addEventListener('orientationchange', this.orientationListener)
      window.addEventListener('resize', this.orientationListener)
      
      // 监听网络状态变化
      this.networkListener = () => {
        const oldNetwork = this.lastInfo?.network
        const newNetwork = this.getNetworkInfo()
        
        if (oldNetwork && JSON.stringify(oldNetwork) !== JSON.stringify(newNetwork)) {
          this.emit('change', {
            type: 'network',
            oldValue: oldNetwork,
            newValue: newNetwork,
            timestamp: Date.now()
          } as DeviceChangeEvent)
        }
      }
      
      window.addEventListener('online', this.networkListener)
      window.addEventListener('offline', this.networkListener)
    }
  }

  /**
   * 获取完整设备信息
   */
  async getInfo(): Promise<CompleteDeviceInfo> {
    const cacheKey = 'complete-device-info'
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      this.lastInfo = cached
      return cached
    }

    const info: CompleteDeviceInfo = {
      device: this.getDeviceInfo(),
      os: this.getOSInfo(),
      browser: this.getBrowserInfo(),
      timestamp: Date.now()
    }

    if (this.config.includeNetwork) {
      info.network = this.getNetworkInfo()
    }

    if (this.config.includePerformance) {
      info.performance = await this.getPerformanceInfo()
    }

    if (this.config.includeFeatures) {
      info.features = await this.getDeviceFeatures()
    }

    this.setCache(cacheKey, info)
    this.lastInfo = info
    return info
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    const cacheKey = 'device-info'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = this.parser.getResult()
    const screen = this.getScreenInfo()
    
    const deviceInfo: DeviceInfo = {
      type: this.getDeviceType(result),
      model: result.device.model || undefined,
      vendor: result.device.vendor || undefined,
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      isDesktop: this.isDesktop(),
      isTouchDevice: this.isTouchDevice(),
      pixelRatio: this.getPixelRatio(),
      screen,
      orientation: this.getOrientation()
    }

    this.setCache(cacheKey, deviceInfo)
    return deviceInfo
  }

  /**
   * 获取操作系统信息
   */
  getOSInfo(): OSInfo {
    const cacheKey = 'os-info'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = this.parser.getResult()
    const osName = this.normalizeOSName(result.os.name || 'Unknown')
    
    const osInfo: OSInfo = {
      name: osName,
      version: result.os.version,
      architecture: this.getArchitecture(),
      isMobile: this.isOSMobile(osName),
      isDesktop: this.isOSDesktop(osName)
    }

    this.setCache(cacheKey, osInfo)
    return osInfo
  }

  /**
   * 获取浏览器信息
   */
  getBrowserInfo(): BrowserInfo {
    const cacheKey = 'browser-info'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const result = this.parser.getResult()
    const browserName = this.normalizeBrowserName(result.browser.name || 'Unknown')
    
    const browserInfo: BrowserInfo = {
      name: browserName,
      version: result.browser.version,
      engine: result.engine.name,
      engineVersion: result.engine.version,
      userAgent: navigator.userAgent,
      supportsWebGL: this.supportsWebGL(),
      supportsWebRTC: this.supportsWebRTC(),
      supportsServiceWorker: this.supportsServiceWorker(),
      supportsPushAPI: this.supportsPushAPI(),
      supportsNotification: this.supportsNotification(),
      supportsGeolocation: this.supportsGeolocation(),
      supportsLocalStorage: this.supportsLocalStorage(),
      supportsSessionStorage: this.supportsSessionStorage(),
      supportsIndexedDB: this.supportsIndexedDB(),
      supportsWebAssembly: this.supportsWebAssembly()
    }

    this.setCache(cacheKey, browserInfo)
    return browserInfo
  }

  /**
   * 获取屏幕信息
   */
  getScreenInfo(): ScreenInfo {
    if (typeof window === 'undefined' || !window.screen) {
      return {
        width: 0,
        height: 0,
        availWidth: 0,
        availHeight: 0,
        colorDepth: 24,
        pixelDepth: 24,
        devicePixelRatio: 1
      }
    }

    return {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      devicePixelRatio: this.getPixelRatio()
    }
  }

  /**
   * 获取网络信息
   */
  getNetworkInfo(): NetworkInfo {
    return detectNetwork()
  }

  /**
   * 获取性能信息
   */
  async getPerformanceInfo(): Promise<PerformanceInfo> {
    const cacheKey = 'performance-info'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const performanceInfo = await detectPerformance()
    this.setCache(cacheKey, performanceInfo)
    return performanceInfo
  }

  /**
   * 获取设备特性
   */
  async getDeviceFeatures(): Promise<DeviceFeatures> {
    const cacheKey = 'device-features'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const features = await detectFeatures()
    this.setCache(cacheKey, features)
    return features
  }

  /**
   * 获取设备类型
   */
  private getDeviceType(result: any): DeviceType {
    const type = result.device.type
    
    if (type === 'mobile') return DeviceType.MOBILE
    if (type === 'tablet') return DeviceType.TABLET
    if (type === 'smarttv') return DeviceType.TV
    if (type === 'wearable') return DeviceType.WEARABLE
    if (type === 'console') return DeviceType.CONSOLE
    if (type === 'embedded') return DeviceType.EMBEDDED
    
    // 如果没有明确类型，根据其他信息推断
    if (this.isMobile()) return DeviceType.MOBILE
    if (this.isTablet()) return DeviceType.TABLET
    
    return DeviceType.DESKTOP
  }

  /**
   * 标准化操作系统名称
   */
  private normalizeOSName(osName: string): OSType {
    const name = osName.toLowerCase()
    
    if (name.includes('windows')) return OSType.WINDOWS
    if (name.includes('mac') || name.includes('darwin')) return OSType.MACOS
    if (name.includes('linux')) return OSType.LINUX
    if (name.includes('android')) return OSType.ANDROID
    if (name.includes('ios') || name.includes('iphone') || name.includes('ipad')) return OSType.IOS
    if (name.includes('chrome')) return OSType.CHROME_OS
    if (name.includes('ubuntu')) return OSType.UBUNTU
    
    return OSType.UNKNOWN
  }

  /**
   * 标准化浏览器名称
   */
  private normalizeBrowserName(browserName: string): BrowserType {
    const name = browserName.toLowerCase()
    
    if (name.includes('chrome')) return BrowserType.CHROME
    if (name.includes('firefox')) return BrowserType.FIREFOX
    if (name.includes('safari')) return BrowserType.SAFARI
    if (name.includes('edge')) return BrowserType.EDGE
    if (name.includes('ie') || name.includes('internet explorer')) return BrowserType.IE
    if (name.includes('opera')) return BrowserType.OPERA
    if (name.includes('samsung')) return BrowserType.SAMSUNG
    if (name.includes('uc')) return BrowserType.UC
    if (name.includes('wechat')) return BrowserType.WECHAT
    if (name.includes('qq')) return BrowserType.QQ
    
    return BrowserType.UNKNOWN
  }

  /**
   * 判断是否为移动设备
   */
  isMobile(): boolean {
    const result = this.parser.getResult()
    return result.device.type === 'mobile' || /Mobi|Android/i.test(navigator.userAgent)
  }

  /**
   * 判断是否为平板设备
   */
  isTablet(): boolean {
    const result = this.parser.getResult()
    return result.device.type === 'tablet' || /iPad|Tablet/i.test(navigator.userAgent)
  }

  /**
   * 判断是否为桌面设备
   */
  isDesktop(): boolean {
    return !this.isMobile() && !this.isTablet()
  }

  /**
   * 判断是否为触摸设备
   */
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  /**
   * 获取设备像素比
   */
  getPixelRatio(): number {
    return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  }

  /**
   * 获取设备方向
   */
  getOrientation(): Orientation {
    if (typeof window === 'undefined') return Orientation.LANDSCAPE
    
    if (window.screen && 'orientation' in window.screen) {
      return window.screen.orientation.angle === 0 || window.screen.orientation.angle === 180
        ? Orientation.PORTRAIT
        : Orientation.LANDSCAPE
    }
    
    return window.innerHeight > window.innerWidth
      ? Orientation.PORTRAIT
      : Orientation.LANDSCAPE
  }

  /**
   * 获取系统架构
   */
  private getArchitecture(): string | undefined {
    if (typeof navigator !== 'undefined' && 'platform' in navigator) {
      const platform = navigator.platform.toLowerCase()
      if (platform.includes('win32') || platform.includes('wow64')) return 'x64'
      if (platform.includes('win16')) return 'x86'
      if (platform.includes('arm')) return 'arm'
    }
    return undefined
  }

  /**
   * 判断操作系统是否为移动系统
   */
  private isOSMobile(osName: OSType): boolean {
    return [OSType.ANDROID, OSType.IOS].includes(osName)
  }

  /**
   * 判断操作系统是否为桌面系统
   */
  private isOSDesktop(osName: OSType): boolean {
    return [OSType.WINDOWS, OSType.MACOS, OSType.LINUX, OSType.UBUNTU, OSType.CHROME_OS].includes(osName)
  }

  // 浏览器特性检测方法
  private supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch {
      return false
    }
  }

  private supportsWebRTC(): boolean {
    return !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection)
  }

  private supportsServiceWorker(): boolean {
    return 'serviceWorker' in navigator
  }

  private supportsPushAPI(): boolean {
    return 'PushManager' in window
  }

  private supportsNotification(): boolean {
    return 'Notification' in window
  }

  private supportsGeolocation(): boolean {
    return 'geolocation' in navigator
  }

  private supportsLocalStorage(): boolean {
    try {
      return 'localStorage' in window && window.localStorage !== null
    } catch {
      return false
    }
  }

  private supportsSessionStorage(): boolean {
    try {
      return 'sessionStorage' in window && window.sessionStorage !== null
    } catch {
      return false
    }
  }

  private supportsIndexedDB(): boolean {
    return 'indexedDB' in window
  }

  private supportsWebAssembly(): boolean {
    return 'WebAssembly' in window
  }

  /**
   * 缓存相关方法
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    const { data, timestamp } = cached
    const now = Date.now()
    
    if (now - timestamp > (this.config.cacheTime || 5000)) {
      this.cache.delete(key)
      return null
    }
    
    return data
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      if (this.orientationListener) {
        window.removeEventListener('orientationchange', this.orientationListener)
        window.removeEventListener('resize', this.orientationListener)
      }
      
      if (this.networkListener) {
        window.removeEventListener('online', this.networkListener)
        window.removeEventListener('offline', this.networkListener)
      }
    }
    
    this.clearCache()
    this.removeAllListeners()
  }
}