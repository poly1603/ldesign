import type {
  DeviceDetectorEvents,
  DeviceDetectorOptions,
  DeviceInfo,
  DeviceModule,
  DeviceType,
  Orientation,
} from '../types'
import {
  debounce,
  getDeviceTypeByWidth,
  getPixelRatio,
  getScreenOrientation,
  isTouchDevice,
  parseBrowser,
  parseOS,
} from '../utils'
import { EventEmitter } from './EventEmitter'
import { ModuleLoader } from './ModuleLoader'

/**
 * 设备检测器主类
 *
 * 这是一个高性能的设备检测器，能够：
 * - 检测设备类型（桌面、移动、平板）
 * - 监听屏幕方向变化
 * - 检测浏览器和操作系统信息
 * - 动态加载扩展模块（电池、地理位置、网络等）
 * - 提供响应式的设备信息更新
 *
 * @example
 * ```typescript
 * // 创建设备检测器实例
 * const detector = new DeviceDetector({
 *   enableResize: true,
 *   enableOrientation: true,
 *   modules: ['network', 'battery']
 * })
 *
 * // 监听设备变化
 * detector.on('deviceChange', (deviceInfo) => {
 *   console.log('设备信息更新:', deviceInfo)
 * })
 *
 * // 获取当前设备信息
 * const deviceInfo = detector.getDeviceInfo()
 * console.log('当前设备类型:', deviceInfo.type)
 * ```
 */
export class DeviceDetector extends EventEmitter<DeviceDetectorEvents> {
  private options: DeviceDetectorOptions
  private moduleLoader: ModuleLoader
  private currentDeviceInfo: DeviceInfo
  private resizeHandler?: () => void
  private orientationHandler?: () => void
  private isDestroyed = false

  // 性能优化：缓存计算结果
  private cachedUserAgent?: string
  private cachedOS?: { name: string; version: string }
  private cachedBrowser?: { name: string; version: string }
  private lastDetectionTime = 0
  private readonly minDetectionInterval = 16 // 约60fps

  // 错误处理和重试机制
  private errorCount = 0
  private readonly maxErrors = 5
  private lastErrorTime = 0
  private readonly errorCooldown = 5000 // 5秒错误冷却时间

  // 性能监控
  private performanceMetrics = {
    detectionCount: 0,
    averageDetectionTime: 0,
    lastDetectionDuration: 0,
  }

  /**
   * 构造函数 - 创建设备检测器实例
   *
   * @param options 配置选项
   * @param options.enableResize 是否启用窗口大小变化监听，默认 true
   * @param options.enableOrientation 是否启用屏幕方向变化监听，默认 true
   * @param options.modules 要加载的扩展模块列表，如 ['network', 'battery', 'geolocation']
   * @param options.breakpoints 设备类型断点配置，用于判断设备类型
   * @param options.debounceTime 事件防抖时间（毫秒），默认 100ms
   *
   * @example
   * ```typescript
   * // 基础配置
   * const detector = new DeviceDetector()
   *
   * // 自定义配置
   * const detector = new DeviceDetector({
   *   enableResize: true,
   *   enableOrientation: true,
   *   modules: ['network', 'battery'],
   *   breakpoints: {
   *     mobile: 768,
   *     tablet: 1024
   *   },
   *   debounceTime: 200
   * })
   * ```
   */
  constructor(options: DeviceDetectorOptions = {}) {
    super()

    // 设置默认选项
    this.options = {
      enableResize: true,
      enableOrientation: true,
      breakpoints: {
        mobile: 768,
        tablet: 1024,
      },
      debounceDelay: 100,
      ...options,
    }

    this.moduleLoader = new ModuleLoader()
    this.currentDeviceInfo = this.detectDevice()

    this.setupEventListeners()
  }

  /**
   * 获取当前设备类型
   */
  getDeviceType(): DeviceType {
    return this.currentDeviceInfo.type
  }

  /**
   * 获取当前屏幕方向
   */
  getOrientation(): Orientation {
    return this.currentDeviceInfo.orientation
  }

  /**
   * 获取完整的设备信息
   *
   * 返回当前设备的完整信息对象，包括：
   * - 设备类型（desktop、mobile、tablet）
   * - 屏幕尺寸和分辨率信息
   * - 浏览器和操作系统信息
   * - 设备方向和像素比
   * - 触摸支持情况
   *
   * @returns DeviceInfo 设备信息对象
   *
   * @example
   * ```typescript
   * const detector = new DeviceDetector()
   * const deviceInfo = detector.getDeviceInfo()
   *
   * console.log('设备类型:', deviceInfo.type) // 'mobile' | 'tablet' | 'desktop'
   * console.log('屏幕宽度:', deviceInfo.screen.width)
   * console.log('浏览器:', deviceInfo.browser.name)
   * console.log('操作系统:', deviceInfo.os.name)
   * console.log('是否支持触摸:', deviceInfo.features.touch)
   * ```
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.currentDeviceInfo }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics }
  }

  /**
   * 检查是否为移动设备
   */
  isMobile(): boolean {
    return this.currentDeviceInfo.type === 'mobile'
  }

  /**
   * 检查是否为平板设备
   */
  isTablet(): boolean {
    return this.currentDeviceInfo.type === 'tablet'
  }

  /**
   * 检查是否为桌面设备
   */
  isDesktop(): boolean {
    return this.currentDeviceInfo.type === 'desktop'
  }

  /**
   * 检查是否为触摸设备
   */
  isTouchDevice(): boolean {
    return this.currentDeviceInfo.isTouchDevice
  }

  /**
   * 刷新设备信息
   */
  refresh(): void {
    // 强制重新检测，忽略频率限制
    this.lastDetectionTime = 0
    this.handleDeviceChange()
  }

  /**
   * 动态加载扩展模块
   */
  async loadModule<T extends DeviceModule = DeviceModule>(
    name: string,
  ): Promise<T> {
    if (this.isDestroyed) {
      throw new Error('DeviceDetector has been destroyed')
    }
    return this.moduleLoader.loadModuleInstance<T>(name)
  }

  /**
   * 卸载扩展模块
   */
  async unloadModule(name: string): Promise<void> {
    return this.moduleLoader.unload(name)
  }

  /**
   * 检查模块是否已加载
   */
  isModuleLoaded(name: string): boolean {
    return this.moduleLoader.isLoaded(name)
  }

  /**
   * 获取已加载的模块列表
   */
  getLoadedModules(): string[] {
    return this.moduleLoader.getLoadedModules()
  }

  /**
   * 销毁检测器，清理资源
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed)
      return

    this.isDestroyed = true

    // 移除事件监听器
    this.removeEventListeners()

    // 卸载所有模块
    await this.moduleLoader.unloadAll()

    // 清理所有事件监听器
    this.removeAllListeners()

    // 清理缓存
    this.cachedUserAgent = undefined
    this.cachedOS = undefined
    this.cachedBrowser = undefined
  }

  /**
   * 更新性能指标
   */
  private updatePerformanceMetrics(detectionTime: number): void {
    this.performanceMetrics.detectionCount++
    this.performanceMetrics.lastDetectionDuration = detectionTime

    // 计算平均检测时间（使用移动平均）
    const alpha = 0.1 // 平滑因子
    this.performanceMetrics.averageDetectionTime =
      this.performanceMetrics.averageDetectionTime * (1 - alpha) + detectionTime * alpha
  }

  /**
   * 处理检测错误
   */
  private handleDetectionError(error: unknown): void {
    this.errorCount++
    this.lastErrorTime = performance.now()

    console.warn('Device detection error:', error)

    // 如果错误次数过多，触发错误事件
    if (this.errorCount >= this.maxErrors) {
      this.emit('error' as keyof DeviceDetectorEvents, {
        message: 'Too many detection errors',
        count: this.errorCount,
        lastError: error,
      } as any)
    }
  }

  /**
   * 检测设备信息
   */
  private detectDevice(): DeviceInfo {
    if (typeof window === 'undefined') {
      // 服务端渲染环境的默认值
      return {
        type: 'desktop',
        orientation: 'landscape',
        width: 1920,
        height: 1080,
        pixelRatio: 1,
        isTouchDevice: false,
        userAgent: '',
        os: { name: 'unknown', version: 'unknown' },
        browser: { name: 'unknown', version: 'unknown' },
        screen: {
          width: 1920,
          height: 1080,
          pixelRatio: 1,
          availWidth: 1920,
          availHeight: 1080,
        },
        features: {
          touch: false,
        },
      }
    }

    // 错误处理：检查是否在错误冷却期
    const now = performance.now()
    if (this.errorCount >= this.maxErrors && now - this.lastErrorTime < this.errorCooldown) {
      return this.currentDeviceInfo
    }

    // 性能优化：限制检测频率
    if (now - this.lastDetectionTime < this.minDetectionInterval) {
      return this.currentDeviceInfo
    }

    const startTime = now
    this.lastDetectionTime = now

    try {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent

      // 性能优化：缓存用户代理解析结果
      let os = this.cachedOS
      let browser = this.cachedBrowser

      if (this.cachedUserAgent !== userAgent) {
        this.cachedUserAgent = userAgent
        this.cachedOS = os = parseOS(userAgent)
        this.cachedBrowser = browser = parseBrowser(userAgent)
      }

      const pixelRatio = getPixelRatio()
      const touchDevice = isTouchDevice()
      
      const deviceInfo: DeviceInfo = {
        type: getDeviceTypeByWidth(width, this.options.breakpoints),
        orientation: getScreenOrientation(),
        width,
        height,
        pixelRatio,
        isTouchDevice: touchDevice,
        userAgent,
        os: os!,
        browser: browser!,
        screen: {
          width,
          height,
          pixelRatio,
          availWidth: window.screen?.availWidth || width,
          availHeight: window.screen?.availHeight || height,
        },
        features: {
          touch: touchDevice,
          webgl: typeof window !== 'undefined' ? this.detectWebGL() : false,
        },
      }

      // 更新性能指标
      const detectionTime = performance.now() - startTime
      this.updatePerformanceMetrics(detectionTime)

      // 重置错误计数
      this.errorCount = 0

      return deviceInfo
    }
    catch (error) {
      this.handleDetectionError(error)
      return this.currentDeviceInfo
    }
  }

  /**
   * 检测 WebGL 支持
   */
  private detectWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch (e) {
      return false
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined')
      return

    // 窗口缩放监听
    if (this.options.enableResize) {
      this.resizeHandler = debounce(() => {
        if (!this.isDestroyed) {
          this.handleDeviceChange()
        }
      }, this.options.debounceDelay)

      window.addEventListener('resize', this.resizeHandler, { passive: true })
    }

    // 设备方向监听
    if (this.options.enableOrientation) {
      this.orientationHandler = debounce(() => {
        if (!this.isDestroyed) {
          this.handleDeviceChange()
        }
      }, this.options.debounceDelay)

      // 监听 orientationchange 事件
      window.addEventListener('orientationchange', this.orientationHandler, {
        passive: true,
      })

      // 同时监听 resize 事件作为备选方案
      if (!this.options.enableResize) {
        window.addEventListener('resize', this.orientationHandler, {
          passive: true,
        })
      }
    }
  }

  /**
   * 处理设备变化 - 优化版本
   */
  private handleDeviceChange(): void {
    if (this.isDestroyed) {
      return
    }

    try {
      const oldDeviceInfo = this.currentDeviceInfo
      const newDeviceInfo = this.detectDevice()

      // 只有在真正发生变化时才更新和触发事件
      if (this.hasDeviceInfoChanged(oldDeviceInfo, newDeviceInfo)) {
        this.currentDeviceInfo = newDeviceInfo

        // 批量触发事件以提高性能
        const events: Array<{ event: keyof DeviceDetectorEvents; data: any }> = []

        // 检查设备类型是否发生变化
        if (oldDeviceInfo.type !== newDeviceInfo.type) {
          events.push({ event: 'deviceChange', data: newDeviceInfo })
        }

        // 检查屏幕方向是否发生变化
        if (oldDeviceInfo.orientation !== newDeviceInfo.orientation) {
          events.push({ event: 'orientationChange', data: newDeviceInfo.orientation })
        }

        // 检查尺寸是否发生变化
        if (
          oldDeviceInfo.width !== newDeviceInfo.width
          || oldDeviceInfo.height !== newDeviceInfo.height
        ) {
          events.push({
            event: 'resize',
            data: {
              width: newDeviceInfo.width,
              height: newDeviceInfo.height,
            },
          })
        }

        // 批量触发事件
        events.forEach(({ event, data }) => {
          this.emit(event, data)
        })
      }
    }
    catch (error) {
      this.handleDetectionError(error)
    }
  }

  /**
   * 检查设备信息是否发生变化
   */
  private hasDeviceInfoChanged(
    oldInfo: DeviceInfo,
    newInfo: DeviceInfo,
  ): boolean {
    return (
      oldInfo.type !== newInfo.type
      || oldInfo.orientation !== newInfo.orientation
      || oldInfo.width !== newInfo.width
      || oldInfo.height !== newInfo.height
      || oldInfo.pixelRatio !== newInfo.pixelRatio
    )
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    if (typeof window === 'undefined')
      return

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = undefined
    }

    if (this.orientationHandler) {
      window.removeEventListener('orientationchange', this.orientationHandler)
      if (!this.options.enableResize) {
        window.removeEventListener('resize', this.orientationHandler)
      }
      this.orientationHandler = undefined
    }
  }
}
