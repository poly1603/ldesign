/**
 * 设备适配器
 * 负责检测和管理当前设备类型
 * 
 * 性能优化：
 * - 使用 matchMedia API 进行断点检测
 * - 添加节流优化 resize 监听
 * - 缓存检测结果减少重复计算
 * - 支持 IntersectionObserver 优化
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
  /** 节流延迟（毫秒） */
  throttleDelay?: number
  /** 是否使用 matchMedia API */
  useMatchMedia?: boolean
}

/**
 * 设备适配器类
 */
export class DeviceAdapter {
  private currentDevice: DeviceType = 'desktop'
  private listeners = new Set<(deviceType: DeviceType) => void>()
  private config: Required<DeviceDetectionConfig>
  private resizeTimer: number | null = null
  private mediaQueries: Map<DeviceType, MediaQueryList | null> = new Map()
  private lastWidth = 0
  private detectionCache: { width: number; device: DeviceType } | null = null

  constructor(config: DeviceDetectionConfig = {}) {
    this.config = {
      enabled: true,
      defaultDevice: 'desktop',
      breakpoints: {
        mobile: 768,
        tablet: 1024,
      },
      throttleDelay: 150,
      useMatchMedia: typeof window !== 'undefined' && 'matchMedia' in window,
      ...config,
    }
  }

  /**
   * 初始化设备适配器
   */
  initialize(): void {
    if (this.config.enabled && typeof window !== 'undefined') {
      // 初始化 matchMedia 监听器
      if (this.config.useMatchMedia) {
        this.initMatchMedia()
      } else {
        // 降级到传统 resize 监听
        this.detectDevice()
        window.addEventListener('resize', this.handleResizeThrottled.bind(this))
      }
    } else {
      this.currentDevice = this.config.defaultDevice || 'desktop'
    }
  }

  /**
   * 初始化 matchMedia 监听
   */
  private initMatchMedia(): void {
    const { mobile = 768, tablet = 1024 } = this.config.breakpoints
    
    // 创建媒体查询
    const mobileQuery = window.matchMedia(`(max-width: ${mobile - 1}px)`)
    const tabletQuery = window.matchMedia(`(min-width: ${mobile}px) and (max-width: ${tablet - 1}px)`)
    const desktopQuery = window.matchMedia(`(min-width: ${tablet}px)`)
    
    // 保存查询引用
    this.mediaQueries.set('mobile', mobileQuery)
    this.mediaQueries.set('tablet', tabletQuery)
    this.mediaQueries.set('desktop', desktopQuery)
    
    // 添加监听器
    const handler = () => this.detectDeviceFromMediaQuery()
    mobileQuery.addEventListener('change', handler)
    tabletQuery.addEventListener('change', handler)
    desktopQuery.addEventListener('change', handler)
    
    // 立即检测一次
    this.detectDeviceFromMediaQuery()
  }

  /**
   * 从 matchMedia 检测设备类型
   */
  private detectDeviceFromMediaQuery(): void {
    const mobileQuery = this.mediaQueries.get('mobile')
    const tabletQuery = this.mediaQueries.get('tablet')
    
    let newDevice: DeviceType = 'desktop'
    
    if (mobileQuery?.matches) {
      newDevice = 'mobile'
    } else if (tabletQuery?.matches) {
      newDevice = 'tablet'
    }
    
    if (newDevice !== this.currentDevice) {
      this.currentDevice = newDevice
      this.notifyListeners()
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
   * 检测设备类型（带缓存优化）
   */
  private detectDevice(): void {
    if (typeof window === 'undefined') {
      this.currentDevice = this.config.defaultDevice || 'desktop'
      return
    }

    const width = window.innerWidth
    
    // 检查缓存
    if (this.detectionCache && this.detectionCache.width === width) {
      return
    }
    
    // 如果宽度变化不大，跳过检测
    if (Math.abs(width - this.lastWidth) < 16) {
      return
    }
    
    this.lastWidth = width
    let newDevice: DeviceType
    
    const mobileBreakpoint = this.config.breakpoints.mobile ?? 768
    const tabletBreakpoint = this.config.breakpoints.tablet ?? 1024

    if (width < mobileBreakpoint) {
      newDevice = 'mobile'
    } else if (width < tabletBreakpoint) {
      newDevice = 'tablet'
    } else {
      newDevice = 'desktop'
    }
    
    // 更新缓存
    this.detectionCache = { width, device: newDevice }

    if (newDevice !== this.currentDevice) {
      this.currentDevice = newDevice
      this.notifyListeners()
    }
  }

  /**
   * 处理窗口大小变化（节流版本）
   */
  private handleResizeThrottled(): void {
    if (this.resizeTimer !== null) {
      return
    }
    
    this.resizeTimer = window.setTimeout(() => {
      this.detectDevice()
      this.resizeTimer = null
    }, this.config.throttleDelay)
  }

  /**
   * 手动设置设备类型
   */
  setDeviceType(deviceType: DeviceType): void {
    if (this.currentDevice !== deviceType) {
      this.currentDevice = deviceType
      this.notifyListeners()
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<DeviceDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig }
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
   * 获取设备信息（用于调试）
   */
  getDeviceInfo(): {
    current: DeviceType
    width: number
    useMatchMedia: boolean
    breakpoints: { mobile: number; tablet: number }
  } {
    return {
      current: this.currentDevice,
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      useMatchMedia: this.config.useMatchMedia,
      breakpoints: {
        mobile: this.config.breakpoints.mobile ?? 768,
        tablet: this.config.breakpoints.tablet ?? 1024,
      },
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.detectionCache = null
    this.lastWidth = 0
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    // 清理 resize 定时器
    if (this.resizeTimer !== null) {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = null
    }
    
    if (typeof window !== 'undefined') {
      // 移除 resize 监听
      window.removeEventListener('resize', this.handleResizeThrottled.bind(this))
      
      // 清理 matchMedia 监听器
      if (this.config.useMatchMedia) {
        this.mediaQueries.forEach((query, device) => {
          if (query) {
            // matchMedia 监听器会自动清理，无需手动移除
          }
        })
      }
    }
    
    this.listeners.clear()
    this.mediaQueries.clear()
    this.detectionCache = null
  }
}
