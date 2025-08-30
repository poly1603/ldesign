/**
 * 设备适配器
 * 负责设备类型检测和响应式切换
 */

import type { DeviceType, DeviceDetectionConfig } from '../types'

export interface DeviceInfo {
  /** 设备类型 */
  type: DeviceType
  /** 屏幕宽度 */
  width: number
  /** 屏幕高度 */
  height: number
  /** 像素比 */
  pixelRatio: number
  /** 是否为触摸设备 */
  isTouchDevice: boolean
  /** 用户代理字符串 */
  userAgent: string
  /** 是否为移动设备 */
  isMobile: boolean
  /** 是否为平板设备 */
  isTablet: boolean
  /** 是否为桌面设备 */
  isDesktop: boolean
}

export type DeviceChangeCallback = (deviceType: DeviceType, deviceInfo: DeviceInfo) => void

/**
 * 设备适配器类
 * 提供设备检测、监听和适配功能
 */
export class DeviceAdapter {
  private config: DeviceDetectionConfig
  private currentDevice: DeviceType
  private currentDeviceInfo: DeviceInfo
  private listeners: Set<DeviceChangeCallback> = new Set()
  private resizeObserver?: ResizeObserver
  private mediaQueryLists: MediaQueryList[] = []
  private isInitialized = false

  constructor(config: DeviceDetectionConfig) {
    this.config = { ...config }
    this.currentDevice = config.customDetector?.() || 'desktop'
    this.currentDeviceInfo = this.createDeviceInfo()
  }

  /**
   * 初始化设备适配器
   */
  initialize(): void {
    if (this.isInitialized) return

    if (typeof window === 'undefined') {
      // 服务端渲染环境
      this.isInitialized = true
      return
    }

    // 初始检测
    this.updateDeviceInfo()

    if (this.config.autoDetect) {
      this.setupAutoDetection()
    }

    this.isInitialized = true
  }

  /**
   * 设置自动检测
   */
  private setupAutoDetection(): void {
    // 监听窗口大小变化
    this.setupResizeObserver()

    // 监听媒体查询变化
    this.setupMediaQueries()

    // 监听方向变化
    this.setupOrientationChange()
  }

  /**
   * 设置ResizeObserver监听
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize()
      })

      this.resizeObserver.observe(document.documentElement)
    } else {
      // 降级到window.resize事件
      window.addEventListener('resize', this.handleResize.bind(this))
    }
  }

  /**
   * 设置媒体查询监听
   */
  private setupMediaQueries(): void {
    const queries = [
      `(max-width: ${this.config.mobileBreakpoint - 1}px)`,
      `(min-width: ${this.config.mobileBreakpoint}px) and (max-width: ${this.config.tabletBreakpoint - 1}px)`,
      `(min-width: ${this.config.tabletBreakpoint}px)`,
    ]

    queries.forEach(query => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', this.handleMediaQueryChange.bind(this))
      this.mediaQueryLists.push(mql)
    })
  }

  /**
   * 设置方向变化监听
   */
  private setupOrientationChange(): void {
    if ('orientation' in window) {
      window.addEventListener('orientationchange', () => {
        // 延迟执行，等待方向变化完成
        setTimeout(() => {
          this.handleResize()
        }, 100)
      })
    }
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    const oldDevice = this.currentDevice
    const oldDeviceInfo = { ...this.currentDeviceInfo }

    this.updateDeviceInfo()

    if (oldDevice !== this.currentDevice) {
      this.notifyDeviceChange(oldDevice, oldDeviceInfo)
    }
  }

  /**
   * 处理媒体查询变化
   */
  private handleMediaQueryChange(): void {
    this.handleResize()
  }

  /**
   * 更新设备信息
   */
  private updateDeviceInfo(): void {
    const newDeviceInfo = this.createDeviceInfo()

    // 如果禁用自动检测，使用默认设备类型
    const newDeviceType = this.config.autoDetect
      ? this.detectDeviceType(newDeviceInfo)
      : this.config.defaultDevice || 'desktop'

    this.currentDeviceInfo = newDeviceInfo
    this.currentDevice = newDeviceType
  }

  /**
   * 创建设备信息对象
   */
  private createDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        width: 1920,
        height: 1080,
        pixelRatio: 1,
        isTouchDevice: false,
        userAgent: '',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const pixelRatio = window.devicePixelRatio || 1
    const userAgent = navigator.userAgent
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // 基于宽度的设备类型检测（如果启用自动检测）
    const type = this.config.autoDetect
      ? this.detectDeviceTypeByWidth(width)
      : this.config.defaultDevice || 'desktop'

    return {
      type,
      width,
      height,
      pixelRatio,
      isTouchDevice,
      userAgent,
      isMobile: type === 'mobile',
      isTablet: type === 'tablet',
      isDesktop: type === 'desktop',
    }
  }

  /**
   * 检测设备类型
   */
  private detectDeviceType(deviceInfo: DeviceInfo): DeviceType {
    // 优先使用自定义检测器
    if (this.config.customDetector) {
      return this.config.customDetector()
    }

    return this.detectDeviceTypeByWidth(deviceInfo.width)
  }

  /**
   * 根据宽度检测设备类型
   */
  private detectDeviceTypeByWidth(width: number): DeviceType {
    if (width < this.config.mobileBreakpoint) {
      return 'mobile'
    } else if (width < this.config.tabletBreakpoint) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  /**
   * 通知设备变化
   */
  private notifyDeviceChange(oldDevice: DeviceType, oldDeviceInfo: DeviceInfo): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentDevice, this.currentDeviceInfo)
      } catch (error) {
        console.error('Device change callback error:', error)
      }
    })
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDevice(): DeviceType {
    return this.currentDevice
  }

  /**
   * 获取当前设备信息
   */
  getCurrentDeviceInfo(): DeviceInfo {
    return { ...this.currentDeviceInfo }
  }

  /**
   * 添加设备变化监听器
   */
  addDeviceChangeListener(callback: DeviceChangeCallback): () => void {
    this.listeners.add(callback)

    // 返回取消监听的函数
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * 移除设备变化监听器
   */
  removeDeviceChangeListener(callback: DeviceChangeCallback): void {
    this.listeners.delete(callback)
  }

  /**
   * 手动设置设备类型
   */
  setDeviceType(deviceType: DeviceType): void {
    const oldDevice = this.currentDevice
    const oldDeviceInfo = { ...this.currentDeviceInfo }

    this.currentDevice = deviceType
    this.currentDeviceInfo = {
      ...this.currentDeviceInfo,
      type: deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
    }

    if (oldDevice !== deviceType) {
      this.notifyDeviceChange(oldDevice, oldDeviceInfo)
    }
  }

  /**
   * 检查是否为指定设备类型
   */
  isDevice(deviceType: DeviceType): boolean {
    return this.currentDevice === deviceType
  }

  /**
   * 检查是否为移动设备
   */
  isMobile(): boolean {
    return this.currentDevice === 'mobile'
  }

  /**
   * 检查是否为平板设备
   */
  isTablet(): boolean {
    return this.currentDevice === 'tablet'
  }

  /**
   * 检查是否为桌面设备
   */
  isDesktop(): boolean {
    return this.currentDevice === 'desktop'
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DeviceDetectionConfig>): void {
    this.config = { ...this.config, ...config }

    if (this.isInitialized) {
      this.updateDeviceInfo()
    }
  }

  /**
   * 获取配置
   */
  getConfig(): DeviceDetectionConfig {
    return { ...this.config }
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    // 清理ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = undefined
    }

    // 清理媒体查询监听器
    this.mediaQueryLists.forEach(mql => {
      mql.removeEventListener('change', this.handleMediaQueryChange.bind(this))
    })
    this.mediaQueryLists = []

    // 清理事件监听器
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize.bind(this))
      window.removeEventListener('orientationchange', this.handleResize.bind(this))
    }

    // 清理回调函数
    this.listeners.clear()

    this.isInitialized = false
  }
}

/**
 * 创建设备适配器实例
 */
export function createDeviceAdapter(config: DeviceDetectionConfig): DeviceAdapter {
  return new DeviceAdapter(config)
}
