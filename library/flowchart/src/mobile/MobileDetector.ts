/**
 * 移动设备检测工具
 * 
 * 提供设备类型检测、屏幕尺寸判断、触摸支持检测等功能
 */

export interface DeviceInfo {
  /** 设备类型 */
  type: 'mobile' | 'tablet' | 'desktop'
  /** 是否支持触摸 */
  hasTouch: boolean
  /** 屏幕宽度 */
  screenWidth: number
  /** 屏幕高度 */
  screenHeight: number
  /** 设备像素比 */
  pixelRatio: number
  /** 是否为横屏 */
  isLandscape: boolean
  /** 操作系统 */
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown'
  /** 浏览器类型 */
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'
}

export interface BreakpointConfig {
  /** 移动端断点 */
  mobile: number
  /** 平板端断点 */
  tablet: number
  /** 桌面端断点 */
  desktop: number
}

/**
 * 移动设备检测器类
 */
export class MobileDetector {
  private static instance: MobileDetector | null = null
  private deviceInfo: DeviceInfo
  private breakpoints: BreakpointConfig
  private listeners: Array<(deviceInfo: DeviceInfo) => void> = []

  constructor(breakpoints?: Partial<BreakpointConfig>) {
    this.breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
      ...breakpoints
    }

    this.deviceInfo = this.detectDevice()
    this.bindEvents()
  }

  /**
   * 获取单例实例
   */
  static getInstance(breakpoints?: Partial<BreakpointConfig>): MobileDetector {
    if (!MobileDetector.instance) {
      MobileDetector.instance = new MobileDetector(breakpoints)
    }
    return MobileDetector.instance
  }

  /**
   * 检测设备信息
   */
  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase()
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const pixelRatio = window.devicePixelRatio || 1

    return {
      type: this.getDeviceType(screenWidth),
      hasTouch: this.hasTouchSupport(),
      screenWidth,
      screenHeight,
      pixelRatio,
      isLandscape: screenWidth > screenHeight,
      os: this.detectOS(userAgent),
      browser: this.detectBrowser(userAgent)
    }
  }

  /**
   * 获取设备类型
   */
  private getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
    if (width < this.breakpoints.mobile) {
      return 'mobile'
    } else if (width < this.breakpoints.tablet) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  /**
   * 检测触摸支持
   */
  private hasTouchSupport(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    )
  }

  /**
   * 检测操作系统
   */
  private detectOS(userAgent: string): DeviceInfo['os'] {
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios'
    } else if (/android/.test(userAgent)) {
      return 'android'
    } else if (/windows/.test(userAgent)) {
      return 'windows'
    } else if (/mac/.test(userAgent)) {
      return 'macos'
    } else if (/linux/.test(userAgent)) {
      return 'linux'
    } else {
      return 'unknown'
    }
  }

  /**
   * 检测浏览器类型
   */
  private detectBrowser(userAgent: string): DeviceInfo['browser'] {
    if (/chrome/.test(userAgent) && !/edge/.test(userAgent)) {
      return 'chrome'
    } else if (/firefox/.test(userAgent)) {
      return 'firefox'
    } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      return 'safari'
    } else if (/edge/.test(userAgent)) {
      return 'edge'
    } else {
      return 'unknown'
    }
  }

  /**
   * 绑定事件监听器
   */
  private bindEvents(): void {
    window.addEventListener('resize', this.handleResize.bind(this))
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this))
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    const oldDeviceInfo = { ...this.deviceInfo }
    this.deviceInfo = this.detectDevice()

    // 如果设备类型发生变化，通知监听器
    if (oldDeviceInfo.type !== this.deviceInfo.type || 
        oldDeviceInfo.isLandscape !== this.deviceInfo.isLandscape) {
      this.notifyListeners()
    }
  }

  /**
   * 处理屏幕方向变化
   */
  private handleOrientationChange(): void {
    // 延迟检测，等待屏幕方向变化完成
    setTimeout(() => {
      this.deviceInfo = this.detectDevice()
      this.notifyListeners()
    }, 100)
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.deviceInfo)
      } catch (error) {
        console.error('设备信息监听器执行错误:', error)
      }
    })
  }

  /**
   * 获取当前设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo }
  }

  /**
   * 是否为移动设备
   */
  isMobile(): boolean {
    return this.deviceInfo.type === 'mobile'
  }

  /**
   * 是否为平板设备
   */
  isTablet(): boolean {
    return this.deviceInfo.type === 'tablet'
  }

  /**
   * 是否为桌面设备
   */
  isDesktop(): boolean {
    return this.deviceInfo.type === 'desktop'
  }

  /**
   * 是否支持触摸
   */
  hasTouch(): boolean {
    return this.deviceInfo.hasTouch
  }

  /**
   * 是否为横屏
   */
  isLandscape(): boolean {
    return this.deviceInfo.isLandscape
  }

  /**
   * 是否为竖屏
   */
  isPortrait(): boolean {
    return !this.deviceInfo.isLandscape
  }

  /**
   * 获取屏幕尺寸
   */
  getScreenSize(): { width: number; height: number } {
    return {
      width: this.deviceInfo.screenWidth,
      height: this.deviceInfo.screenHeight
    }
  }

  /**
   * 添加设备信息变化监听器
   */
  addListener(listener: (deviceInfo: DeviceInfo) => void): void {
    this.listeners.push(listener)
  }

  /**
   * 移除设备信息变化监听器
   */
  removeListener(listener: (deviceInfo: DeviceInfo) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * 销毁检测器
   */
  destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this))
    window.removeEventListener('orientationchange', this.handleOrientationChange.bind(this))
    this.listeners = []
    MobileDetector.instance = null
  }
}

// 导出单例实例
export const mobileDetector = MobileDetector.getInstance()

// 导出便捷方法
export const isMobile = () => mobileDetector.isMobile()
export const isTablet = () => mobileDetector.isTablet()
export const isDesktop = () => mobileDetector.isDesktop()
export const hasTouch = () => mobileDetector.hasTouch()
export const getDeviceInfo = () => mobileDetector.getDeviceInfo()
