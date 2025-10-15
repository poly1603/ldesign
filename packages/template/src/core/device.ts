/**
 * 设备检测器
 *
 * 轻量级设备类型检测，支持响应式更新和自定义检测器
 */

import type { DeviceConfig, DeviceType } from '../types'
import { isBrowser } from '../utils'
import { DEFAULT_BREAKPOINTS } from '../utils/constants'
import { getGlobalEmitter } from './events'

/**
 * 设备检测器类
 */
export class DeviceDetector {
  private config: Required<DeviceConfig>
  private currentDevice: DeviceType
  private listeners: Set<(device: DeviceType) => void> = new Set()
  private mediaQueryLists: Map<DeviceType, MediaQueryList> = new Map()
  private resizeObserver: ResizeObserver | null = null
  private emitter = getGlobalEmitter()

  constructor(config: Partial<DeviceConfig> = {}) {
    this.config = {
      breakpoints: {
        ...DEFAULT_BREAKPOINTS,
        ...config.breakpoints,
      },
      defaultDevice: config.defaultDevice || 'desktop',
      enableResponsive: config.enableResponsive ?? true,
      customDetector: config.customDetector,
    }

    this.currentDevice = this.detectDevice()

    // 只在浏览器环境且启用响应式时初始化监听
    if (isBrowser() && this.config.enableResponsive) {
      this.initializeListeners()
    }
  }

  /**
   * 检测当前设备类型
   */
  private detectDevice(): DeviceType {
    if (!isBrowser()) {
      return this.config.defaultDevice!
    }

    // 使用自定义检测器
    if (this.config.customDetector) {
      return this.config.customDetector(window.innerWidth, window.innerHeight)
    }

    const width = window.innerWidth

    if (width < this.config.breakpoints.mobile) {
      return 'mobile'
    }
 else if (width < this.config.breakpoints.tablet) {
      return 'tablet'
    }
 else {
      return 'desktop'
    }
  }

  /**
   * 初始化媒体查询监听器
   */
  private initializeListeners(): void {
    if (!isBrowser())
return

    // 创建媒体查询
    const mobileQuery = window.matchMedia(
      `(max-width: ${this.config.breakpoints.mobile - 1}px)`,
    )
    const tabletQuery = window.matchMedia(
      `(min-width: ${this.config.breakpoints.mobile}px) and (max-width: ${this.config.breakpoints.tablet - 1}px)`,
    )

    // 保存引用
    this.mediaQueryLists.set('mobile', mobileQuery)
    this.mediaQueryLists.set('tablet', tabletQuery)

    // 监听变化
    const handleChange = () => {
      const newDevice = this.detectDevice()
      if (newDevice !== this.currentDevice) {
        const oldDevice = this.currentDevice
        this.currentDevice = newDevice
        this.notifyListeners(newDevice)
        this.emitter.emit('device:changed', { from: oldDevice, to: newDevice })
      }
    }

    mobileQuery.addEventListener('change', handleChange)
    tabletQuery.addEventListener('change', handleChange)

    // 也可以用ResizeObserver作为备选方案
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(handleChange)
      this.resizeObserver.observe(document.documentElement)
    }
  }

  /**
   * 获取当前设备类型
   */
  getDevice(): DeviceType {
    return this.currentDevice
  }

  /**
   * 手动设置设备类型
   */
  setDevice(device: DeviceType): void {
    if (device !== this.currentDevice) {
      const oldDevice = this.currentDevice
      this.currentDevice = device
      this.notifyListeners(device)
      this.emitter.emit('device:changed', { from: oldDevice, to: device })
    }
  }

  /**
   * 添加变化监听器
   */
  addListener(listener: (device: DeviceType) => void): () => void {
    this.listeners.add(listener)
    return () => this.removeListener(listener)
  }

  /**
   * 移除变化监听器
   */
  removeListener(listener: (device: DeviceType) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(device: DeviceType): void {
    this.listeners.forEach((listener) => {
      try {
        listener(device)
      }
 catch (error) {
        console.error('[DeviceDetector] Listener error:', error)
      }
    })
  }

  /**
   * 获取断点配置
   */
  getBreakpoints() {
    return { ...this.config.breakpoints }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DeviceConfig>): void {
    const oldBreakpoints = this.config.breakpoints
    this.config = {
      ...this.config,
      ...config,
      breakpoints: {
        ...this.config.breakpoints,
        ...config.breakpoints,
      },
    }

    // 如果断点变化，重新检测设备
    const breakpointsChanged
      = config.breakpoints
        && (config.breakpoints.mobile !== oldBreakpoints.mobile
          || config.breakpoints.tablet !== oldBreakpoints.tablet)

    if (breakpointsChanged) {
      const newDevice = this.detectDevice()
      if (newDevice !== this.currentDevice) {
        this.currentDevice = newDevice
        this.notifyListeners(newDevice)
      }

      // 重新初始化监听器
      if (isBrowser() && this.config.enableResponsive) {
        this.destroy()
        this.initializeListeners()
      }
    }
  }

  /**
   * 获取配置
   */
  getConfig(): Required<DeviceConfig> {
    return {
      ...this.config,
      breakpoints: { ...this.config.breakpoints },
    }
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
   * 销毁检测器
   */
  destroy(): void {
    // 移除所有监听器
    this.listeners.clear()

    // 断开ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    // 清理MediaQueryList
    this.mediaQueryLists.clear()
  }
}

// 单例实例
let instance: DeviceDetector | null = null

/**
 * 获取设备检测器实例
 */
export function getDeviceDetector(): DeviceDetector {
  if (!instance) {
    instance = new DeviceDetector()
  }
  return instance
}

/**
 * 重置设备检测器
 */
export function resetDeviceDetector(): void {
  if (instance) {
    instance.destroy()
    instance = null
  }
}

/**
 * 便捷函数：检查是否为移动设备
 */
export function isMobile(): boolean {
  return getDeviceDetector().isMobile()
}

/**
 * 便捷函数：检查是否为平板设备
 */
export function isTablet(): boolean {
  return getDeviceDetector().isTablet()
}

/**
 * 便捷函数：检查是否为桌面设备
 */
export function isDesktop(): boolean {
  return getDeviceDetector().isDesktop()
}
