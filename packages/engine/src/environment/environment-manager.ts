import type { Logger } from '../types'

// 环境类型
export type Environment = 'development' | 'production' | 'test'

// 平台类型
export type Platform = 'browser' | 'node' | 'webworker' | 'electron' | 'unknown'

// 浏览器类型
export type Browser =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'ie'
  | 'opera'
  | 'unknown'

// 设备类型
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'

// 环境信息接口
export interface EnvironmentInfo {
  // 基础环境
  environment: Environment
  platform: Platform

  // 浏览器信息
  browser: {
    name: Browser
    version: string
    userAgent: string
  }

  // 设备信息
  device: {
    type: DeviceType
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    isTouchDevice: boolean
  }

  // 运行时特性
  features: {
    // Web APIs
    hasLocalStorage: boolean
    hasSessionStorage: boolean
    hasIndexedDB: boolean
    hasWebWorkers: boolean
    hasServiceWorkers: boolean
    hasWebGL: boolean
    hasWebGL2: boolean
    hasWebAssembly: boolean

    // 网络特性
    hasOnlineDetection: boolean
    hasNetworkInformation: boolean

    // 性能特性
    hasPerformanceAPI: boolean
    hasIntersectionObserver: boolean
    hasMutationObserver: boolean
    hasResizeObserver: boolean

    // 媒体特性
    hasMediaDevices: boolean
    hasGetUserMedia: boolean

    // 其他特性
    hasClipboardAPI: boolean
    hasNotificationAPI: boolean
    hasGeolocationAPI: boolean
  }

  // 性能信息
  performance: {
    memory?: {
      used: number
      total: number
      limit: number
    }
    connection?: {
      effectiveType: string
      downlink: number
      rtt: number
      saveData: boolean
    }
  }

  // 屏幕信息
  screen: {
    width: number
    height: number
    availWidth: number
    availHeight: number
    colorDepth: number
    pixelRatio: number
    orientation?: string
  }

  // 时区信息
  timezone: {
    name: string
    offset: number
    dst: boolean
  }
}

// 环境适配配置
export interface EnvironmentAdaptation {
  // 功能降级配置
  fallbacks: {
    storage: 'memory' | 'cookie' | 'none'
    animation: 'css' | 'js' | 'none'
    networking: 'fetch' | 'xhr' | 'none'
  }

  // 性能优化配置
  optimizations: {
    enableLazyLoading: boolean
    enableCodeSplitting: boolean
    enableImageOptimization: boolean
    enableCaching: boolean
    maxConcurrentRequests: number
  }

  // 兼容性配置
  compatibility: {
    enablePolyfills: boolean
    supportedBrowsers: string[]
    minimumVersions: Record<string, string>
  }
}

// 环境管理器接口
export interface EnvironmentManager {
  // 环境检测
  detect: () => EnvironmentInfo
  getEnvironment: () => Environment
  getPlatform: () => Platform
  getBrowser: () => { name: Browser; version: string }
  getDevice: () => { type: DeviceType; isMobile: boolean }

  // 特性检测
  hasFeature: (feature: string) => boolean
  getFeatures: () => Record<string, boolean>
  checkCompatibility: (requirements: Record<string, unknown>) => boolean

  // 环境适配
  getAdaptation: () => EnvironmentAdaptation
  setAdaptation: (adaptation: Partial<EnvironmentAdaptation>) => void
  adaptForEnvironment: (env: EnvironmentInfo) => EnvironmentAdaptation

  // 性能监控
  getPerformanceInfo: () => EnvironmentInfo['performance']
  monitorPerformance: (
    callback: (info: EnvironmentInfo['performance']) => void
  ) => void

  // 事件监听
  onEnvironmentChange: (callback: (info: EnvironmentInfo) => void) => () => void
  onFeatureChange: (
    feature: string,
    callback: (available: boolean) => void
  ) => () => void
}

// 环境管理器实现
export class EnvironmentManagerImpl implements EnvironmentManager {
  private environmentInfo: EnvironmentInfo
  private adaptation: EnvironmentAdaptation
  private changeListeners: Array<(info: EnvironmentInfo) => void> = []
  private featureListeners = new Map<
    string,
    Array<(available: boolean) => void>
  >()

  private logger?: Logger

  constructor(logger?: Logger) {
    this.logger = logger
    this.environmentInfo = this.detectEnvironment()
    this.adaptation = this.createDefaultAdaptation()

    // 监听环境变化
    this.setupEnvironmentListeners()

    // Environment manager initialized (日志已禁用)
  }

  detect(): EnvironmentInfo {
    return { ...this.environmentInfo }
  }

  getEnvironment(): Environment {
    return this.environmentInfo.environment
  }

  getPlatform(): Platform {
    return this.environmentInfo.platform
  }

  getBrowser(): { name: Browser; version: string } {
    return {
      name: this.environmentInfo.browser.name,
      version: this.environmentInfo.browser.version,
    }
  }

  getDevice(): { type: DeviceType; isMobile: boolean } {
    return {
      type: this.environmentInfo.device.type,
      isMobile: this.environmentInfo.device.isMobile,
    }
  }

  hasFeature(feature: string): boolean {
    return (
      this.environmentInfo.features[
      feature as keyof typeof this.environmentInfo.features
      ] || false
    )
  }

  getFeatures(): Record<string, boolean> {
    return { ...this.environmentInfo.features }
  }

  checkCompatibility(requirements: { browser?: Partial<Record<Browser, string>>; features?: string[] }): boolean {
    // 检查浏览器版本兼容性
    if (requirements.browser) {
      const browserReq = requirements.browser?.[this.environmentInfo.browser.name]
      if (
        browserReq &&
        !this.isVersionCompatible(
          this.environmentInfo.browser.version,
          browserReq
        )
      ) {
        return false
      }
    }

    // 检查特性兼容性
    if (requirements.features && Array.isArray(requirements.features)) {
      for (const feature of requirements.features) {
        if (!this.hasFeature(feature)) {
          return false
        }
      }
    }

    return true
  }

  getAdaptation(): EnvironmentAdaptation {
    return { ...this.adaptation }
  }

  setAdaptation(adaptation: Partial<EnvironmentAdaptation>): void {
    this.adaptation = {
      ...this.adaptation,
      ...adaptation,
      fallbacks: { ...this.adaptation.fallbacks, ...adaptation.fallbacks },
      optimizations: {
        ...this.adaptation.optimizations,
        ...adaptation.optimizations,
      },
      compatibility: {
        ...this.adaptation.compatibility,
        ...adaptation.compatibility,
      },
    }

    this.logger?.debug('Environment adaptation updated', adaptation)
  }

  adaptForEnvironment(env: EnvironmentInfo): EnvironmentAdaptation {
    const adaptation: EnvironmentAdaptation = {
      fallbacks: {
        storage: env.features.hasLocalStorage ? 'memory' : 'cookie',
        animation: env.device.isMobile ? 'css' : 'js',
        networking: env.features.hasServiceWorkers ? 'fetch' : 'xhr',
      },
      optimizations: {
        enableLazyLoading: env.device.isMobile,
        enableCodeSplitting: env.environment === 'production',
        enableImageOptimization: env.device.isMobile,
        enableCaching: env.environment === 'production',
        maxConcurrentRequests: env.device.isMobile ? 4 : 8,
      },
      compatibility: {
        enablePolyfills: env.browser.name === 'ie',
        supportedBrowsers: ['chrome', 'firefox', 'safari', 'edge'],
        minimumVersions: {
          chrome: '80',
          firefox: '75',
          safari: '13',
          edge: '80',
        },
      },
    }

    return adaptation
  }

  getPerformanceInfo(): EnvironmentInfo['performance'] {
    return { ...this.environmentInfo.performance }
  }

  monitorPerformance(
    callback: (info: EnvironmentInfo['performance']) => void
  ): void {
    const monitor = () => {
      const perfInfo = this.detectPerformanceInfo()
      callback(perfInfo)
    }

    // 定期监控
    setInterval(monitor, 5000)

    // 立即执行一次
    monitor()
  }

  onEnvironmentChange(callback: (info: EnvironmentInfo) => void): () => void {
    this.changeListeners.push(callback)

    return () => {
      const index = this.changeListeners.indexOf(callback)
      if (index > -1) {
        this.changeListeners.splice(index, 1)
      }
    }
  }

  onFeatureChange(
    feature: string,
    callback: (available: boolean) => void
  ): () => void {
    if (!this.featureListeners.has(feature)) {
      this.featureListeners.set(feature, [])
    }

    const listeners = this.featureListeners.get(feature)
    listeners?.push(callback)

    return () => {
      const listeners = this.featureListeners.get(feature)
      if (listeners) {
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  // 私有方法
  private detectEnvironment(): EnvironmentInfo {
    return {
      environment: this.detectEnv(),
      platform: this.detectPlatform(),
      browser: this.detectBrowser(),
      device: this.detectDevice(),
      features: this.detectFeatures(),
      performance: this.detectPerformanceInfo(),
      screen: this.detectScreenInfo(),
      timezone: this.detectTimezone(),
    }
  }

  private detectEnv(): Environment {
    try {
      // 尝试访问 Node.js 环境变量
      if (typeof process !== 'undefined' && process.env) {
        const nodeEnv = process.env.NODE_ENV
        if (nodeEnv === 'production') return 'production'
        if (nodeEnv === 'test') return 'test'
      }

      // 检测测试环境
      if (
        typeof globalThis !== 'undefined' &&
        (globalThis as { __vitest__?: unknown }).__vitest__ !== undefined
      ) {
        return 'test'
      }

      if (
        typeof window !== 'undefined' &&
        (window as { __karma__?: unknown }).__karma__ !== undefined
      ) {
        return 'test'
      }

      return 'development'
    } catch {
      return 'development'
    }
  }

  private detectPlatform(): Platform {
    if (typeof window !== 'undefined') {
      // 检测 Electron

      const w = window as unknown as { require?: unknown; process?: { type?: unknown } }
      const processKey = 'process'
      if (w.require && w[processKey]?.type) {
        return 'electron'
      }

      // 检测 Web Worker
      if (typeof (globalThis as { importScripts?: unknown }).importScripts === 'function') {
        return 'webworker'
      }

      return 'browser'
    }

    try {
      // 检测 Node.js 环境
      if (typeof process !== 'undefined' && process.versions?.node) {
        return 'node'
      }

      return 'unknown'
    } catch {
      return 'unknown'
    }
  }

  private detectBrowser(): {
    name: Browser
    version: string
    userAgent: string
  } {
    if (typeof navigator === 'undefined') {
      return { name: 'unknown', version: '', userAgent: '' }
    }

    const userAgent = navigator.userAgent
    let name: Browser = 'unknown'
    let version = ''

    // Chrome
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      name = 'chrome'
      const match = userAgent.match(/Chrome\/(\d+)/)
      version = match ? match[1] : ''
    }
    // Edge
    else if (userAgent.includes('Edg')) {
      name = 'edge'
      const match = userAgent.match(/Edg\/(\d+)/)
      version = match ? match[1] : ''
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      name = 'firefox'
      const match = userAgent.match(/Firefox\/(\d+)/)
      version = match ? match[1] : ''
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'safari'
      const match = userAgent.match(/Version\/(\d+)/)
      version = match ? match[1] : ''
    }
    // IE
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      name = 'ie'
      const match = userAgent.match(/(?:MSIE |rv:)(\d+)/)
      version = match ? match[1] : ''
    }
    // Opera
    else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      name = 'opera'
      const match = userAgent.match(/(?:Opera|OPR)\/(\d+)/)
      version = match ? match[1] : ''
    }

    return { name, version, userAgent }
  }

  private detectDevice(): EnvironmentInfo['device'] {
    if (typeof navigator === 'undefined') {
      return {
        type: 'unknown',
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        isTouchDevice: false,
      }
    }

    const userAgent = navigator.userAgent
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android(?=.*Tablet)|Tablet/i.test(userAgent)
    const isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0

    let type: DeviceType = 'desktop'
    if (isTablet) {
      type = 'tablet'
    } else if (isMobile) {
      type = 'mobile'
    }

    return {
      type,
      isMobile,
      isTablet,
      isDesktop: type === 'desktop',
      isTouchDevice,
    }
  }

  private detectFeatures(): EnvironmentInfo['features'] {
    const hasWindow = typeof window !== 'undefined'
    const hasNavigator = typeof navigator !== 'undefined'

    return {
      // Storage APIs
      hasLocalStorage: hasWindow && 'localStorage' in window,
      hasSessionStorage: hasWindow && 'sessionStorage' in window,
      hasIndexedDB: hasWindow && 'indexedDB' in window,

      // Worker APIs
      hasWebWorkers: hasWindow && 'Worker' in window,
      hasServiceWorkers: hasNavigator && 'serviceWorker' in navigator,

      // Graphics APIs
      hasWebGL: hasWindow && this.checkWebGL(),
      hasWebGL2: hasWindow && this.checkWebGL2(),
      hasWebAssembly: typeof WebAssembly !== 'undefined',

      // Network APIs
      hasOnlineDetection: hasNavigator && 'onLine' in navigator,
      hasNetworkInformation: hasNavigator && 'connection' in navigator,

      // Performance APIs
      hasPerformanceAPI: hasWindow && 'performance' in window,
      hasIntersectionObserver: hasWindow && 'IntersectionObserver' in window,
      hasMutationObserver: hasWindow && 'MutationObserver' in window,
      hasResizeObserver: hasWindow && 'ResizeObserver' in window,

      // Media APIs
      hasMediaDevices: hasNavigator && 'mediaDevices' in navigator,
      hasGetUserMedia: hasNavigator && 'getUserMedia' in navigator,

      // Other APIs
      hasClipboardAPI: hasNavigator && 'clipboard' in navigator,
      hasNotificationAPI: hasWindow && 'Notification' in window,
      hasGeolocationAPI: hasNavigator && 'geolocation' in navigator,
    }
  }

  private detectPerformanceInfo(): EnvironmentInfo['performance'] {
    const info: EnvironmentInfo['performance'] = {}

    // Memory information
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
      if (!memory) return info
      info.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      }
    }

    // Network information
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).connection
      if (!connection) return info
      info.connection = {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
      }
    }

    return info
  }

  private detectScreenInfo(): EnvironmentInfo['screen'] {
    if (typeof screen === 'undefined') {
      return {
        width: 0,
        height: 0,
        availWidth: 0,
        availHeight: 0,
        colorDepth: 0,
        pixelRatio: 1,
      }
    }

    return {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      orientation:
        typeof screen.orientation !== 'undefined'
          ? screen.orientation.type
          : undefined,
    }
  }

  private detectTimezone(): EnvironmentInfo['timezone'] {
    const now = new Date()
    const january = new Date(now.getFullYear(), 0, 1)
    const july = new Date(now.getFullYear(), 6, 1)
    const offset = -now.getTimezoneOffset()
    const dst =
      offset !== -january.getTimezoneOffset() ||
      offset !== -july.getTimezoneOffset()

    return {
      name: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offset,
      dst,
    }
  }

  private checkWebGL(): boolean {
    try {
      if (typeof document === 'undefined') return false
      const canvas = document.createElement('canvas')
      return !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      )
    } catch {
      return false
    }
  }

  private checkWebGL2(): boolean {
    try {
      if (typeof document === 'undefined') return false
      const canvas = document.createElement('canvas')
      return !!canvas.getContext('webgl2')
    } catch {
      return false
    }
  }

  private createDefaultAdaptation(): EnvironmentAdaptation {
    return {
      fallbacks: {
        storage: 'memory',
        animation: 'css',
        networking: 'fetch',
      },
      optimizations: {
        enableLazyLoading: false,
        enableCodeSplitting: false,
        enableImageOptimization: false,
        enableCaching: true,
        maxConcurrentRequests: 6,
      },
      compatibility: {
        enablePolyfills: false,
        supportedBrowsers: ['chrome', 'firefox', 'safari', 'edge'],
        minimumVersions: {
          chrome: '80',
          firefox: '75',
          safari: '13',
          edge: '80',
        },
      },
    }
  }

  private setupEnvironmentListeners(): void {
    if (typeof window === 'undefined') return

    // 监听在线状态变化
    window.addEventListener('online', () => this.handleEnvironmentChange())
    window.addEventListener('offline', () => this.handleEnvironmentChange())

    // 监听屏幕方向变化
    if (screen.orientation) {
      screen.orientation.addEventListener('change', () =>
        this.handleEnvironmentChange()
      )
    }

    // 监听窗口大小变化
    window.addEventListener('resize', () => this.handleEnvironmentChange())
  }

  private handleEnvironmentChange(): void {
    const newInfo = this.detectEnvironment()
    const hasChanged =
      JSON.stringify(newInfo) !== JSON.stringify(this.environmentInfo)

    if (hasChanged) {
      this.environmentInfo = newInfo
      this.changeListeners.forEach(callback => {
        try {
          callback(newInfo)
        } catch (error) {
          this.logger?.error('Error in environment change callback', error)
        }
      })
    }
  }

  private isVersionCompatible(current: string, required: string): boolean {
    const currentParts = current.split('.').map(Number)
    const requiredParts = required.split('.').map(Number)

    for (
      let i = 0;
      i < Math.max(currentParts.length, requiredParts.length);
      i++
    ) {
      const currentPart = currentParts[i] || 0
      const requiredPart = requiredParts[i] || 0

      if (currentPart > requiredPart) return true
      if (currentPart < requiredPart) return false
    }

    return true
  }
}

// 工厂函数
export function createEnvironmentManager(logger?: Logger): EnvironmentManager {
  return new EnvironmentManagerImpl(logger)
}

// 全局环境管理器
let globalEnvironmentManager: EnvironmentManager | undefined

export function getGlobalEnvironmentManager(): EnvironmentManager {
  if (!globalEnvironmentManager) {
    globalEnvironmentManager = createEnvironmentManager()
  }
  return globalEnvironmentManager
}

export function setGlobalEnvironmentManager(manager: EnvironmentManager): void {
  globalEnvironmentManager = manager
}
