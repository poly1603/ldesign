/**
 * 设备适配器
 * 负责检测和管理当前设备类型
 */

import type { DeviceType } from '../types/template'

/**
 * 设备检测配置
 */
export interface DeviceDetectionConfig {
  /** 是否启用自动检测 */
  enabled?: boolean
  /** 默认设备类型 */
  defaultDevice?: DeviceType
  /** 自定义断点 */
  breakpoints?: {
    mobile?: number
    tablet?: number
  }
}

/**
 * 设备适配器类
 */
export class DeviceAdapter {
  private currentDevice: DeviceType = 'desktop'
  private listeners = new Set<(deviceType: DeviceType) => void>()
  private config: DeviceDetectionConfig

  constructor(config: DeviceDetectionConfig = {}) {
    this.config = {
      enabled: true,
      defaultDevice: 'desktop',
      breakpoints: {
        mobile: 768,
        tablet: 1024,
      },
      ...config,
    }
  }

  /**
   * 初始化设备适配器
   */
  initialize(): void {
    if (this.config.enabled && typeof window !== 'undefined') {
      this.detectDevice()
      window.addEventListener('resize', this.handleResize.bind(this))
    } else {
      this.currentDevice = this.config.defaultDevice || 'desktop'
    }
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDevice(): DeviceType {
    return this.currentDevice
  }

  /**
   * 添加设备变化监听器
   */
  addDeviceChangeListener(listener: (deviceType: DeviceType) => void): void {
    this.listeners.add(listener)
  }

  /**
   * 移除设备变化监听器
   */
  removeDeviceChangeListener(listener: (deviceType: DeviceType) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * 检测设备类型
   */
  private detectDevice(): void {
    if (typeof window === 'undefined') {
      this.currentDevice = this.config.defaultDevice || 'desktop'
      return
    }

    const width = window.innerWidth
    let newDevice: DeviceType

    if (width < (this.config.breakpoints?.mobile || 768)) {
      newDevice = 'mobile'
    } else if (width < (this.config.breakpoints?.tablet || 1024)) {
      newDevice = 'tablet'
    } else {
      newDevice = 'desktop'
    }

    if (newDevice !== this.currentDevice) {
      const oldDevice = this.currentDevice
      this.currentDevice = newDevice
      this.notifyListeners()
    }
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    this.detectDevice()
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.currentDevice)
      } catch (error) {
        console.error('Device change listener error:', error)
      }
    }
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize.bind(this))
    }
    this.listeners.clear()
  }
}
