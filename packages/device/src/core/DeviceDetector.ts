import type {
  BatteryInfo,
  DeviceDetectorEvents,
  DeviceDetectorOptions,
  DeviceInfo,
  DeviceModule,
  DeviceType,
  GeolocationInfo,
  NetworkInfo,
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
import { memoryManager, SafeTimerManager } from '../utils/MemoryManager'
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
 *   
 * })
 *
 * // 获取当前设备信息
 * const deviceInfo = detector.getDeviceInfo()
 * 
 * ```
 */
export class DeviceDetector extends EventEmitter<DeviceDetectorEvents> {
  private options: DeviceDetectorOptions
  private moduleLoader: ModuleLoader
  private currentDeviceInfo: DeviceInfo
  private resizeHandler?: () => void
  private orientationHandler?: () => void
  private isDestroyed = false
  private timerManager: SafeTimerManager

  // 性能优化：缓存计算结果
  private cachedUserAgent?: string
  private cachedOS?: { name: string, version: string }
  private cachedBrowser?: { name: string, version: string }
  private cachedWebGLSupport?: boolean // 缓存WebGL检测结果
  private webglCacheExpireTime = 0 // WebGL缓存过期时间
  private lastDetectionTime = 0
  private readonly minDetectionInterval = 16 // 约60fps

  // 缓存过期时间(毫秒)
  private readonly cacheExpireTime = 60000 // 1分钟
  private readonly webglCacheLifetime = 300000 // WebGL缓存5分钟
  private cacheTimestamp = 0

  // 错误处理和重试机制
  private errorCount = 0
  private readonly maxErrors = 5
  private lastErrorTime = 0
  private readonly errorCooldown = 5000 // 5秒错误冷却时间

  // 性能监控（使用环形缓冲区，避免无限增长）
  private readonly maxMetricsHistory = 100
  private metricsHistory: number[] = []
  private detectionMetrics = {
    detectionCount: 0,
    averageDetectionTime: 0,
    lastDetectionDuration: 0,
  }

  // 模块事件桥接的取消订阅器集合
  private moduleEventUnsubscribers: Map<string, Array<() => void>> = new Map()

  // Canvas对象池（复用canvas元素）
  private static canvasPool: HTMLCanvasElement[] = []
  private static readonly maxCanvasPool = 2

  /**
   * 构造函数 - 创建设备检测器实例
   *
   * @param options 配置选项
   * @param options.enableResize 是否启用窗口大小变化监听，默认 true
   * @param options.enableOrientation 是否启用屏幕方向变化监听，默认 true
   * @param options.modules 要加载的扩展模块列表，如 ['network', 'battery', 'geolocation']
   * @param options.breakpoints 设备类型断点配置，用于判断设备类型
   * @param options.debounceDelay 事件防抖时间（毫秒），默认 100ms
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
   *   debounceDelay: 200
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

    this.timerManager = new SafeTimerManager()
    this.moduleLoader = new ModuleLoader()
    this.currentDeviceInfo = this.detectDevice()

    this.setupEventListeners()

    // 注册内存清理回调
    memoryManager.addGCCallback(() => this.cleanupCache())
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
   *  // 'mobile' | 'tablet' | 'desktop'
   * 
   * 
   * 
   * 
   * ```
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.currentDeviceInfo }
  }

  /**
   * 获取检测性能指标
   */
  getDetectionMetrics() {
    return { ...this.detectionMetrics }
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

    const instance = await this.moduleLoader.loadModuleInstance<T>(name)

    // 桥接模块事件到 DeviceDetector，自适应各模块事件名称
    try {
      const unsubs: Array<() => void> = []
    const withEvents = instance as Partial<{ on: (event: string, handler: (info: unknown) => void) => void; off: (event: string, handler: (info: unknown) => void) => void }>
    const hasOn = typeof withEvents.on === 'function'
    const hasOff = typeof withEvents.off === 'function'

      if (hasOn && hasOff) {
        if (name === 'network') {
          const handler = (info: unknown) => this.emit('networkChange', info as NetworkInfo)
          withEvents.on?.('networkChange', handler)
          unsubs.push(() => withEvents.off?.('networkChange', handler))
        }
        if (name === 'battery') {
          const handler = (info: unknown) => this.emit('batteryChange', info as BatteryInfo)
          withEvents.on?.('batteryChange', handler)
          unsubs.push(() => withEvents.off?.('batteryChange', handler))
        }
        if (name === 'geolocation') {
          const handler = (info: unknown) => this.emit('positionChange', info as GeolocationInfo)
          withEvents.on?.('positionChange', handler)
          unsubs.push(() => withEvents.off?.('positionChange', handler))
        }
      }

      if (unsubs.length > 0) {
        this.moduleEventUnsubscribers.set(name, unsubs)
      }
    }
    catch {
      // 忽略桥接错误，不影响模块加载
    }

    return instance
  }

  /**
   * 卸载扩展模块
   */
  async unloadModule(name: string): Promise<void> {
    const unsubs = this.moduleEventUnsubscribers.get(name)
    if (unsubs && unsubs.length) {
      unsubs.forEach((fn) => {
        try {
          fn()
        }
        catch { }
      })
      this.moduleEventUnsubscribers.delete(name)
    }
    await this.moduleLoader.unload(name)
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

    // 清理定时器
    this.timerManager.clearAll()

    // 先清理模块事件桥接
    this.moduleEventUnsubscribers.forEach((unsubs) => {
      unsubs.forEach((fn) => {
        try {
          fn()
        }
        catch { }
      })
    })
    this.moduleEventUnsubscribers.clear()

    // 卸载所有模块
    await this.moduleLoader.unloadAll()

    // 清理所有事件监听器
    this.removeAllListeners()

    // 清理缓存
    this.cleanupCache()
    
    // 清理性能指标历史
    this.metricsHistory.length = 0
    
    // 移除内存管理器回调
    memoryManager.removeGCCallback(() => this.cleanupCache())
  }

  /**
   * 清理缓存
   */
  private cleanupCache(): void {
    this.cachedUserAgent = undefined
    this.cachedOS = undefined
    this.cachedBrowser = undefined
    this.cachedWebGLSupport = undefined
    this.cacheTimestamp = 0
    this.webglCacheExpireTime = 0
  }

  /**
   * 更新性能指标
   */
  private updatePerformanceMetrics(detectionTime: number): void {
    this.detectionMetrics.detectionCount++
    this.detectionMetrics.lastDetectionDuration = detectionTime

    // 使用环形缓冲区存储历史数据
    this.metricsHistory.push(detectionTime)
    if (this.metricsHistory.length > this.maxMetricsHistory) {
      this.metricsHistory.shift()
    }

    // 计算平均检测时间
    const sum = this.metricsHistory.reduce((a, b) => a + b, 0)
    this.detectionMetrics.averageDetectionTime = sum / this.metricsHistory.length
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
      this.emit('error', {
        message: 'Too many detection errors',
        count: this.errorCount,
        lastError: error as unknown,
      } as { message: string, count: number, lastError: unknown })
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

      // 性能优化：缓存用户代理解析结果,带过期时间
      let os = this.cachedOS
      let browser = this.cachedBrowser

      const cacheExpired = now - this.cacheTimestamp > this.cacheExpireTime

      if (this.cachedUserAgent !== userAgent || cacheExpired) {
        this.cachedUserAgent = userAgent
        this.cachedOS = os = parseOS(userAgent)
        this.cachedBrowser = browser = parseBrowser(userAgent)
        this.cacheTimestamp = now
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
        os: os || { name: 'unknown', version: 'unknown' },
        browser: browser || { name: 'unknown', version: 'unknown' },
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
   *
   * 优化: 缓存检测结果,复用canvas元素，减少内存分配
   */
  private detectWebGL(): boolean {
    const now = Date.now()
    
    // 检查缓存是否有效（优化：直接比较，避免多余计算）
    if (this.cachedWebGLSupport !== undefined && 
        this.webglCacheExpireTime > 0 &&
        now - this.webglCacheExpireTime < this.webglCacheLifetime) {
      return this.cachedWebGLSupport
    }

    try {
      // 从池中获取或创建canvas（优化：减少条件判断）
      const canvas = DeviceDetector.canvasPool.pop() || document.createElement('canvas')
      
      // 最小尺寸以减少内存占用
      canvas.width = 1
      canvas.height = 1
      
      // 尝试获取WebGL上下文（优化：使用更宽松的配置）
      const gl = canvas.getContext('webgl', { 
        failIfMajorPerformanceCaveat: false,
        antialias: false,
        depth: false,
        stencil: false
      }) || canvas.getContext('experimental-webgl', {
        failIfMajorPerformanceCaveat: false,
        antialias: false,
        depth: false,
        stencil: false
      })
      
      this.cachedWebGLSupport = !!gl

      // 清理WebGL上下文以释放GPU内存
      if (gl && 'getExtension' in gl) {
        const loseContext = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')
        loseContext?.loseContext()
      }

      // 将canvas返回池中（优化：重置尺寸以节省内存）
      if (DeviceDetector.canvasPool.length < DeviceDetector.maxCanvasPool) {
        canvas.width = 1
        canvas.height = 1
        DeviceDetector.canvasPool.push(canvas)
      }

      this.webglCacheExpireTime = now
      return this.cachedWebGLSupport
    }
    catch {
      this.cachedWebGLSupport = false
      this.webglCacheExpireTime = now
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
      }, this.options.debounceDelay ?? 100)

      window.addEventListener('resize', this.resizeHandler, { passive: true })
    }

    // 设备方向监听
    if (this.options.enableOrientation) {
      this.orientationHandler = debounce(() => {
        if (!this.isDestroyed) {
          this.handleDeviceChange()
        }
      }, this.options.debounceDelay ?? 100)

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

        // 优化：直接触发事件，避免创建中间数组
        // 检查设备类型是否发生变化
        if (oldDeviceInfo.type !== newDeviceInfo.type) {
          this.emit('deviceChange', newDeviceInfo)
        }

        // 检查屏幕方向是否发生变化
        if (oldDeviceInfo.orientation !== newDeviceInfo.orientation) {
          this.emit('orientationChange', newDeviceInfo.orientation)
        }

        // 检查尺寸是否发生变化
        if (
          oldDeviceInfo.width !== newDeviceInfo.width
          || oldDeviceInfo.height !== newDeviceInfo.height
        ) {
          this.emit('resize', {
            width: newDeviceInfo.width,
            height: newDeviceInfo.height,
          })
        }
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
