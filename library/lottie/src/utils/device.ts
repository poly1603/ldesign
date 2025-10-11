/**
 * 设备检测和响应式工具
 */

export type DeviceType = 'desktop' | 'tablet' | 'mobile'
export type PerformanceTier = 'high' | 'medium' | 'low'

export interface DeviceInfo {
  type: DeviceType
  performanceTier: PerformanceTier
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouch: boolean
  screenWidth: number
  screenHeight: number
  devicePixelRatio: number
  supportsWebGL: boolean
  hardwareConcurrency: number
  memory?: number
}

/**
 * 设备检测类
 */
export class DeviceDetector {
  private static instance: DeviceDetector | null = null
  private deviceInfo: DeviceInfo | null = null

  private constructor() {
    this.detectDevice()
  }

  static getInstance(): DeviceDetector {
    if (!DeviceDetector.instance) {
      DeviceDetector.instance = new DeviceDetector()
    }
    return DeviceDetector.instance
  }

  /**
   * 检测设备信息
   */
  private detectDevice(): void {
    const userAgent = navigator.userAgent.toLowerCase()
    const width = window.innerWidth
    const height = window.innerHeight

    // 检测设备类型
    const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) || 
                     (isMobile && Math.min(width, height) >= 600)
    const isDesktop = !isMobile && !isTablet

    let type: DeviceType = 'desktop'
    if (isMobile && !isTablet) {
      type = 'mobile'
    } else if (isTablet) {
      type = 'tablet'
    }

    // 检测触摸支持
    const isTouch = 'ontouchstart' in window || 
                    navigator.maxTouchPoints > 0 ||
                    (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch

    // 检测 WebGL 支持
    const supportsWebGL = this.checkWebGLSupport()

    // 获取硬件信息
    const hardwareConcurrency = navigator.hardwareConcurrency || 2
    const memory = (navigator as any).deviceMemory

    // 检测性能等级
    const performanceTier = this.detectPerformanceTier(
      hardwareConcurrency,
      memory,
      supportsWebGL,
      type
    )

    this.deviceInfo = {
      type,
      performanceTier,
      isMobile,
      isTablet,
      isDesktop,
      isTouch,
      screenWidth: width,
      screenHeight: height,
      devicePixelRatio: window.devicePixelRatio || 1,
      supportsWebGL,
      hardwareConcurrency,
      memory
    }
  }

  /**
   * 检测 WebGL 支持
   */
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(
        canvas.getContext('webgl') || 
        canvas.getContext('experimental-webgl')
      )
    } catch (e) {
      return false
    }
  }

  /**
   * 检测性能等级
   */
  private detectPerformanceTier(
    cores: number,
    memory: number | undefined,
    webgl: boolean,
    deviceType: DeviceType
  ): PerformanceTier {
    // 高性能设备
    if (
      deviceType === 'desktop' &&
      cores >= 4 &&
      (!memory || memory >= 4) &&
      webgl
    ) {
      return 'high'
    }

    // 中等性能设备
    if (
      cores >= 2 &&
      (!memory || memory >= 2)
    ) {
      return 'medium'
    }

    // 低性能设备
    return 'low'
  }

  /**
   * 获取设备信息
   */
  getInfo(): DeviceInfo {
    if (!this.deviceInfo) {
      this.detectDevice()
    }
    return this.deviceInfo!
  }

  /**
   * 获取推荐的渲染器
   */
  getRecommendedRenderer(): 'svg' | 'canvas' | 'html' {
    const info = this.getInfo()
    
    // 移动设备优先使用 canvas（性能更好）
    if (info.isMobile) {
      return info.performanceTier === 'low' ? 'html' : 'canvas'
    }

    // 平板根据性能选择
    if (info.isTablet) {
      return info.performanceTier === 'high' ? 'svg' : 'canvas'
    }

    // 桌面设备默认 SVG（质量最好）
    return 'svg'
  }

  /**
   * 获取推荐的质量
   */
  getRecommendedQuality(): 'low' | 'medium' | 'high' {
    const info = this.getInfo()
    
    if (info.performanceTier === 'low') {
      return 'low'
    } else if (info.performanceTier === 'medium') {
      return 'medium'
    } else {
      return 'high'
    }
  }

  /**
   * 是否应该启用性能监控
   */
  shouldEnableMonitoring(): boolean {
    const info = this.getInfo()
    // 低性能设备启用监控，以便及时降级
    return info.performanceTier === 'low' || info.isMobile
  }

  /**
   * 获取推荐的帧率
   */
  getRecommendedFPS(): number {
    const info = this.getInfo()
    
    if (info.performanceTier === 'low') {
      return 30
    } else if (info.performanceTier === 'medium') {
      return 45
    } else {
      return 60
    }
  }
}

/**
 * 响应式容器观察器
 */
export class ResponsiveObserver {
  private observer: ResizeObserver | null = null
  private callbacks: Map<HTMLElement, (size: { width: number; height: number }) => void> = new Map()

  /**
   * 观察元素大小变化
   */
  observe(element: HTMLElement, callback: (size: { width: number; height: number }) => void): void {
    if (!this.observer) {
      this.observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const callback = this.callbacks.get(entry.target as HTMLElement)
          if (callback) {
            const { width, height } = entry.contentRect
            callback({ width, height })
          }
        })
      })
    }

    this.callbacks.set(element, callback)
    this.observer.observe(element)
  }

  /**
   * 停止观察
   */
  unobserve(element: HTMLElement): void {
    if (this.observer) {
      this.observer.unobserve(element)
      this.callbacks.delete(element)
    }
  }

  /**
   * 断开所有观察
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.callbacks.clear()
    }
  }
}

/**
 * 获取设备信息（单例）
 */
export function getDeviceInfo(): DeviceInfo {
  return DeviceDetector.getInstance().getInfo()
}

/**
 * 获取推荐配置
 */
export function getRecommendedConfig() {
  const detector = DeviceDetector.getInstance()
  
  return {
    renderer: detector.getRecommendedRenderer(),
    quality: detector.getRecommendedQuality(),
    enableMonitoring: detector.shouldEnableMonitoring(),
    targetFPS: detector.getRecommendedFPS()
  }
}
