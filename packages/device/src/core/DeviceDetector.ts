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
 */
export class DeviceDetector extends EventEmitter<DeviceDetectorEvents> {
  private options: Required<DeviceDetectorOptions>
  private moduleLoader: ModuleLoader
  private currentDeviceInfo: DeviceInfo
  private resizeHandler?: () => void
  private orientationHandler?: () => void
  private isDestroyed = false

  // 性能优化：缓存计算结果
  private cachedUserAgent?: string
  private cachedOS?: { name: string, version: string }
  private cachedBrowser?: { name: string, version: string }
  private lastDetectionTime = 0
  private readonly minDetectionInterval = 16 // 约60fps

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
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.currentDeviceInfo }
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
  async loadModule<T extends DeviceModule = DeviceModule>(name: string): Promise<T> {
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
      }
    }

    // 性能优化：限制检测频率
    const now = performance.now()
    if (now - this.lastDetectionTime < this.minDetectionInterval) {
      return this.currentDeviceInfo
    }
    this.lastDetectionTime = now

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

    return {
      type: getDeviceTypeByWidth(width, this.options.breakpoints),
      orientation: getScreenOrientation(),
      width,
      height,
      pixelRatio: getPixelRatio(),
      isTouchDevice: isTouchDevice(),
      userAgent,
      os: os!,
      browser: browser!,
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
      window.addEventListener('orientationchange', this.orientationHandler, { passive: true })

      // 同时监听 resize 事件作为备选方案
      if (!this.options.enableResize) {
        window.addEventListener('resize', this.orientationHandler, { passive: true })
      }
    }
  }

  /**
   * 处理设备变化 - 优化版本
   */
  private handleDeviceChange(): void {
    const oldDeviceInfo = this.currentDeviceInfo
    const newDeviceInfo = this.detectDevice()

    // 只有在真正发生变化时才更新和触发事件
    if (this.hasDeviceInfoChanged(oldDeviceInfo, newDeviceInfo)) {
      this.currentDeviceInfo = newDeviceInfo

      // 检查设备类型是否发生变化
      if (oldDeviceInfo.type !== newDeviceInfo.type) {
        this.emit('deviceChange', newDeviceInfo)
      }

      // 检查屏幕方向是否发生变化
      if (oldDeviceInfo.orientation !== newDeviceInfo.orientation) {
        this.emit('orientationChange', newDeviceInfo.orientation)
      }

      // 检查尺寸是否发生变化
      if (oldDeviceInfo.width !== newDeviceInfo.width || oldDeviceInfo.height !== newDeviceInfo.height) {
        this.emit('resize', { width: newDeviceInfo.width, height: newDeviceInfo.height })
      }
    }
  }

  /**
   * 检查设备信息是否发生变化
   */
  private hasDeviceInfoChanged(oldInfo: DeviceInfo, newInfo: DeviceInfo): boolean {
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
