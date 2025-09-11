/**
 * 响应式管理器
 * 
 * 负责监听容器大小变化，自动调整图表尺寸和配置
 */

import type { ECharts } from 'echarts'
import type { ChartConfig, ChartSize } from '../core/types'
import { RESIZE_DEBOUNCE_DELAY } from '../core/constants'
import { debounce, detectDevice, isElementInViewport } from '../utils/helpers'
import { adjustConfigForSize } from '../config/defaults'

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
  /** 是否启用响应式 */
  enabled: boolean
  /** 防抖延迟 */
  debounceDelay: number
  /** 是否监听窗口大小变化 */
  watchWindow: boolean
  /** 是否监听容器大小变化 */
  watchContainer: boolean
  /** 是否在容器进入视口时调整大小 */
  resizeOnVisible: boolean
  /** 断点配置 */
  breakpoints: ResponsiveBreakpoints
}

/**
 * 响应式断点配置
 */
export interface ResponsiveBreakpoints {
  /** 移动端断点 */
  mobile: number
  /** 平板断点 */
  tablet: number
  /** 桌面端断点 */
  desktop: number
}

/**
 * 尺寸变化回调函数
 */
export type ResizeCallback = (size: ChartSize, device: DeviceInfo) => void

/**
 * 设备信息
 */
export interface DeviceInfo {
  /** 是否为移动端 */
  isMobile: boolean
  /** 是否为平板 */
  isTablet: boolean
  /** 是否为桌面端 */
  isDesktop: boolean
  /** 屏幕宽度 */
  screenWidth: number
  /** 屏幕高度 */
  screenHeight: number
  /** 容器宽度 */
  containerWidth: number
  /** 容器高度 */
  containerHeight: number
}

/**
 * 响应式管理器类
 * 
 * 提供自动响应式调整功能，支持多种监听模式和自定义断点
 */
export class ResponsiveManager {
  /** 容器元素 */
  private _container: HTMLElement | null = null

  /** ECharts 实例 */
  private _echarts: ECharts | null = null

  /** 图表配置 */
  private _config: ChartConfig | null = null

  /** 响应式配置 */
  private _responsiveConfig: ResponsiveConfig

  /** 尺寸变化回调函数列表 */
  private _resizeCallbacks: Set<ResizeCallback> = new Set()

  /** ResizeObserver 实例 */
  private _resizeObserver: ResizeObserver | null = null

  /** IntersectionObserver 实例 */
  private _intersectionObserver: IntersectionObserver | null = null

  /** 防抖的调整大小函数 */
  private _debouncedResize: () => void

  /** 当前设备信息 */
  private _currentDevice: DeviceInfo | null = null

  /** 是否已初始化 */
  private _initialized = false

  /** 性能监控 */
  private _performanceMetrics = {
    resizeCount: 0,
    lastResizeTime: 0,
    averageResizeTime: 0
  }

  /** 可见性状态 */
  private _isVisible = true

  /** 最后一次尺寸 */
  private _lastSize: ChartSize | null = null

  constructor(config: Partial<ResponsiveConfig> = {}) {
    this._responsiveConfig = {
      enabled: true,
      debounceDelay: RESIZE_DEBOUNCE_DELAY,
      watchWindow: true,
      watchContainer: true,
      resizeOnVisible: true,
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200,
      },
      ...config,
    }

    this._debouncedResize = debounce(
      this._handleResize.bind(this),
      this._responsiveConfig.debounceDelay
    )
  }

  /**
   * 初始化响应式管理器
   * @param container - 容器元素
   * @param echarts - ECharts 实例
   * @param config - 图表配置
   */
  initialize(container: HTMLElement, echarts: ECharts, config: ChartConfig): void {
    this._container = container
    this._echarts = echarts
    this._config = config

    if (this._responsiveConfig.enabled) {
      this._setupObservers()
      this._updateDeviceInfo()
      this._initialized = true
    }
  }

  /**
   * 启用响应式
   */
  enable(): void {
    if (this._responsiveConfig.enabled) return

    this._responsiveConfig.enabled = true
    if (this._container && this._echarts && this._config) {
      this._setupObservers()
      this._updateDeviceInfo()
    }
  }

  /**
   * 禁用响应式
   */
  disable(): void {
    if (!this._responsiveConfig.enabled) return

    this._responsiveConfig.enabled = false
    this._cleanupObservers()
  }

  /**
   * 手动触发大小调整
   * @param size - 指定尺寸（可选）
   */
  resize(size?: ChartSize): void {
    if (!this._echarts || !this._container) return

    const targetSize = size || this._getContainerSize()
    this._echarts.resize(targetSize)

    this._updateDeviceInfo()
    this._notifyResizeCallbacks(targetSize)
  }

  /**
   * 添加尺寸变化回调
   * @param callback - 回调函数
   */
  onResize(callback: ResizeCallback): void {
    this._resizeCallbacks.add(callback)
  }

  /**
   * 移除尺寸变化回调
   * @param callback - 回调函数
   */
  offResize(callback: ResizeCallback): void {
    this._resizeCallbacks.delete(callback)
  }

  /**
   * 获取当前设备信息
   * @returns 设备信息
   */
  getDeviceInfo(): DeviceInfo | null {
    return this._currentDevice
  }

  /**
   * 获取当前容器尺寸
   * @returns 容器尺寸
   */
  getContainerSize(): ChartSize {
    return this._getContainerSize()
  }

  /**
   * 更新响应式配置
   * @param config - 新的响应式配置
   */
  updateConfig(config: Partial<ResponsiveConfig>): void {
    const oldEnabled = this._responsiveConfig.enabled
    this._responsiveConfig = { ...this._responsiveConfig, ...config }

    // 重新创建防抖函数
    this._debouncedResize = debounce(
      this._handleResize.bind(this),
      this._responsiveConfig.debounceDelay
    )

    // 如果启用状态发生变化，重新设置观察器
    if (oldEnabled !== this._responsiveConfig.enabled) {
      if (this._responsiveConfig.enabled) {
        this.enable()
      } else {
        this.disable()
      }
    } else if (this._responsiveConfig.enabled && this._initialized) {
      // 重新设置观察器
      this._cleanupObservers()
      this._setupObservers()
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    return { ...this._performanceMetrics }
  }

  /**
   * 重置性能指标
   */
  resetPerformanceMetrics(): void {
    this._performanceMetrics = {
      resizeCount: 0,
      lastResizeTime: 0,
      averageResizeTime: 0
    }
  }

  /**
   * 设置可见性状态
   * @param visible - 是否可见
   */
  setVisibility(visible: boolean): void {
    this._isVisible = visible

    // 如果从不可见变为可见，触发一次 resize
    if (visible && this._echarts && this._container) {
      this._handleResize()
    }
  }

  /**
   * 强制刷新
   */
  forceRefresh(): void {
    if (this._echarts && this._container && this._isVisible) {
      this._lastSize = null // 重置缓存的尺寸
      this._handleResize()
    }
  }

  /**
   * 销毁响应式管理器
   */
  dispose(): void {
    this._cleanupObservers()
    this._resizeCallbacks.clear()
    this._container = null
    this._echarts = null
    this._config = null
    this._currentDevice = null
    this._lastSize = null
    this._initialized = false
  }

  /**
   * 设置观察器
   */
  private _setupObservers(): void {
    if (!this._container) return

    // 设置 ResizeObserver
    if (this._responsiveConfig.watchContainer && typeof window !== 'undefined' && 'ResizeObserver' in window) {
      try {
        this._resizeObserver = new ResizeObserver(this._debouncedResize)
        this._resizeObserver.observe(this._container)
      } catch (error) {
        console.warn('ResizeObserver 初始化失败，跳过响应式监听:', error)
      }
    }

    // 设置 IntersectionObserver
    if (this._responsiveConfig.resizeOnVisible && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      try {
        this._intersectionObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                this._debouncedResize()
              }
            }
          },
          { threshold: 0.1 }
        )
        this._intersectionObserver.observe(this._container)
      } catch (error) {
        console.warn('IntersectionObserver 初始化失败，跳过可见性监听:', error)
      }
    }

    // 设置窗口大小变化监听
    if (this._responsiveConfig.watchWindow && typeof window !== 'undefined') {
      try {
        window.addEventListener('resize', this._debouncedResize)
        window.addEventListener('orientationchange', this._debouncedResize)
      } catch (error) {
        console.warn('窗口事件监听器初始化失败:', error)
      }
    }
  }

  /**
   * 清理观察器
   */
  private _cleanupObservers(): void {
    if (this._resizeObserver) {
      try {
        if (typeof this._resizeObserver.disconnect === 'function') {
          this._resizeObserver.disconnect()
        }
      } catch (error) {
        console.warn('ResizeObserver 清理失败:', error)
      }
      this._resizeObserver = null
    }

    if (this._intersectionObserver) {
      try {
        if (typeof this._intersectionObserver.disconnect === 'function') {
          this._intersectionObserver.disconnect()
        }
      } catch (error) {
        console.warn('IntersectionObserver 清理失败:', error)
      }
      this._intersectionObserver = null
    }

    if (this._responsiveConfig.watchWindow) {
      window.removeEventListener('resize', this._debouncedResize)
      window.removeEventListener('orientationchange', this._debouncedResize)
    }
  }

  /**
   * 处理大小变化
   */
  private _handleResize(): void {
    if (!this._echarts || !this._container || !this._config) return

    // 性能监控开始
    const startTime = performance.now()

    const size = this._getContainerSize()

    // 检查尺寸是否真的发生了变化
    if (this._lastSize &&
      Math.abs((size.width as number) - (this._lastSize.width as number)) < 1 &&
      Math.abs((size.height as number) - (this._lastSize.height as number)) < 1) {
      return // 尺寸没有显著变化，跳过 resize
    }

    // 只有在可见时才进行 resize
    if (!this._isVisible) {
      this._lastSize = size
      return
    }

    this._echarts.resize(size)
    this._lastSize = size

    this._updateDeviceInfo()
    this._notifyResizeCallbacks(size)

    // 根据设备类型调整配置
    this._adjustConfigForDevice()

    // 性能监控结束
    const endTime = performance.now()
    const resizeTime = endTime - startTime

    this._performanceMetrics.resizeCount++
    this._performanceMetrics.lastResizeTime = resizeTime
    this._performanceMetrics.averageResizeTime =
      (this._performanceMetrics.averageResizeTime * (this._performanceMetrics.resizeCount - 1) + resizeTime) /
      this._performanceMetrics.resizeCount
  }

  /**
   * 获取容器尺寸
   * @returns 容器尺寸
   */
  private _getContainerSize(): ChartSize {
    if (!this._container) {
      return { width: 400, height: 300 }
    }

    const rect = this._container.getBoundingClientRect()
    return {
      width: rect.width || this._container.offsetWidth,
      height: rect.height || this._container.offsetHeight,
    }
  }

  /**
   * 更新设备信息
   */
  private _updateDeviceInfo(): void {
    if (!this._container) return

    const deviceInfo = detectDevice()
    const containerSize = this._getContainerSize()

    this._currentDevice = {
      ...deviceInfo,
      containerWidth: containerSize.width as number,
      containerHeight: containerSize.height as number,
    }
  }

  /**
   * 通知尺寸变化回调
   * @param size - 新尺寸
   */
  private _notifyResizeCallbacks(size: ChartSize): void {
    if (!this._currentDevice) return

    for (const callback of this._resizeCallbacks) {
      try {
        callback(size, this._currentDevice)
      } catch (error) {
        console.error('响应式回调执行失败:', error)
      }
    }
  }

  /**
   * 根据设备类型调整配置
   */
  private _adjustConfigForDevice(): void {
    if (!this._config || !this._currentDevice || !this._echarts) return

    const adjustedConfig = adjustConfigForSize(
      this._config,
      this._currentDevice.containerWidth,
      this._currentDevice.containerHeight
    )

    // 这里可以根据需要更新 ECharts 配置
    // 注意：这需要与主 Chart 类协调，避免配置冲突
  }
}

/**
 * 创建响应式管理器实例
 * @param config - 响应式配置
 * @returns 响应式管理器实例
 */
export function createResponsiveManager(config?: Partial<ResponsiveConfig>): ResponsiveManager {
  return new ResponsiveManager(config)
}
