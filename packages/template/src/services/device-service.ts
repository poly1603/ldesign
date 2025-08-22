/**
 * 设备检测服务
 * 
 * 提供设备检测和监控功能，包括：
 * - 设备类型检测
 * - 屏幕尺寸监控
 * - 设备变化事件
 * - 设备信息收集
 */

import type { DeviceType } from '../types'

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  /** 设备类型 */
  type: DeviceType
  /** 屏幕宽度 */
  width: number
  /** 屏幕高度 */
  height: number
  /** 设备像素比 */
  pixelRatio: number
  /** 用户代理字符串 */
  userAgent: string
  /** 是否为触摸设备 */
  isTouchDevice: boolean
  /** 操作系统 */
  os: string
  /** 浏览器 */
  browser: string
  /** 网络连接类型 */
  connection?: string
  /** 是否在线 */
  isOnline: boolean
}

/**
 * 设备检测配置
 */
export interface DeviceServiceConfig {
  /** 移动设备断点 */
  mobileBreakpoint?: number
  /** 平板设备断点 */
  tabletBreakpoint?: number
  /** 是否启用调试模式 */
  debug?: boolean
  /** 是否监听窗口大小变化 */
  watchResize?: boolean
  /** 是否监听网络状态变化 */
  watchNetwork?: boolean
  /** 防抖延迟 (毫秒) */
  debounceDelay?: number
}

/**
 * 设备变化事件
 */
export interface DeviceChangeEvent {
  /** 新设备类型 */
  newDevice: DeviceType
  /** 旧设备类型 */
  oldDevice: DeviceType
  /** 设备信息 */
  deviceInfo: DeviceInfo
  /** 时间戳 */
  timestamp: number
}

/**
 * 设备检测服务类
 */
export class DeviceService {
  private config: Required<DeviceServiceConfig>
  private currentDevice: DeviceType = 'desktop'
  private deviceInfo: DeviceInfo
  private listeners: Array<(event: DeviceChangeEvent) => void> = []
  private resizeTimeout: number | null = null

  constructor(config: DeviceServiceConfig = {}) {
    this.config = {
      mobileBreakpoint: 768,
      tabletBreakpoint: 1024,
      debug: false,
      watchResize: true,
      watchNetwork: true,
      debounceDelay: 250,
      ...config,
    }

    this.deviceInfo = this.collectDeviceInfo()
    this.currentDevice = this.detectDeviceType()

    if (this.config.watchResize) {
      this.setupResizeListener()
    }

    if (this.config.watchNetwork) {
      this.setupNetworkListener()
    }

    if (this.config.debug) {
      console.log('📱 设备检测服务已初始化', this.deviceInfo)
    }
  }

  /**
   * 获取当前设备类型
   */
  getDeviceType(): DeviceType {
    return this.currentDevice
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo }
  }

  /**
   * 监听设备变化
   */
  on(event: 'deviceChange', listener: (event: DeviceChangeEvent) => void): () => void {
    this.listeners.push(listener)

    // 返回取消监听函数
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 手动检测设备类型
   */
  detect(): DeviceType {
    const oldDevice = this.currentDevice
    this.deviceInfo = this.collectDeviceInfo()
    this.currentDevice = this.detectDeviceType()

    if (oldDevice !== this.currentDevice) {
      this.emitDeviceChange(oldDevice, this.currentDevice)
    }

    return this.currentDevice
  }

  /**
   * 检测设备类型
   */
  private detectDeviceType(): DeviceType {
    if (typeof window === 'undefined') {
      return 'desktop'
    }

    const width = window.innerWidth

    if (width < this.config.mobileBreakpoint) {
      return 'mobile'
    }
    else if (width < this.config.tabletBreakpoint) {
      return 'tablet'
    }
    else {
      return 'desktop'
    }
  }

  /**
   * 收集设备信息
   */
  private collectDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        width: 1920,
        height: 1080,
        pixelRatio: 1,
        userAgent: '',
        isTouchDevice: false,
        os: 'unknown',
        browser: 'unknown',
        isOnline: true,
      }
    }

    const userAgent = navigator.userAgent
    const width = window.innerWidth
    const height = window.innerHeight
    const pixelRatio = window.devicePixelRatio || 1
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isOnline = navigator.onLine

    return {
      type: this.detectDeviceType(),
      width,
      height,
      pixelRatio,
      userAgent,
      isTouchDevice,
      os: this.detectOS(userAgent),
      browser: this.detectBrowser(userAgent),
      connection: this.getConnectionType(),
      isOnline,
    }
  }

  /**
   * 检测操作系统
   */
  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac OS')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
    return 'Unknown'
  }

  /**
   * 检测浏览器
   */
  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    if (userAgent.includes('Opera')) return 'Opera'
    return 'Unknown'
  }

  /**
   * 获取网络连接类型
   */
  private getConnectionType(): string | undefined {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return connection?.effectiveType || connection?.type
    }
    return undefined
  }

  /**
   * 设置窗口大小变化监听器
   */
  private setupResizeListener(): void {
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => {
      // 防抖处理
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout)
      }

      this.resizeTimeout = window.setTimeout(() => {
        const oldDevice = this.currentDevice
        this.deviceInfo = this.collectDeviceInfo()
        this.currentDevice = this.detectDeviceType()

        if (oldDevice !== this.currentDevice) {
          this.emitDeviceChange(oldDevice, this.currentDevice)
        }
      }, this.config.debounceDelay)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    if (this.config.debug) {
      console.log('📱 窗口大小变化监听器已设置')
    }
  }

  /**
   * 设置网络状态监听器
   */
  private setupNetworkListener(): void {
    if (typeof window === 'undefined') {
      return
    }

    const handleNetworkChange = () => {
      this.deviceInfo = this.collectDeviceInfo()

      if (this.config.debug) {
        console.log('🌐 网络状态变化:', {
          isOnline: this.deviceInfo.isOnline,
          connection: this.deviceInfo.connection,
        })
      }
    }

    window.addEventListener('online', handleNetworkChange)
    window.addEventListener('offline', handleNetworkChange)

    // 监听网络连接变化
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.addEventListener('change', handleNetworkChange)
      }
    }

    if (this.config.debug) {
      console.log('🌐 网络状态监听器已设置')
    }
  }

  /**
   * 发射设备变化事件
   */
  private emitDeviceChange(oldDevice: DeviceType, newDevice: DeviceType): void {
    const event: DeviceChangeEvent = {
      oldDevice,
      newDevice,
      deviceInfo: { ...this.deviceInfo },
      timestamp: Date.now(),
    }

    this.listeners.forEach((listener) => {
      try {
        listener(event)
      }
      catch (error) {
        console.error('设备变化事件监听器错误:', error)
      }
    })

    if (this.config.debug) {
      console.log(`📱 设备变化: ${oldDevice} -> ${newDevice}`, event)
    }
  }

  /**
   * 销毁设备服务
   */
  destroy(): void {
    this.listeners = []

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = null
    }

    if (this.config.debug) {
      console.log('📱 设备检测服务已销毁')
    }
  }
}
