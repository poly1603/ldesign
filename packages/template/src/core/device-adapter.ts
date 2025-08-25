/**
 * 设备适配器
 * 深度集成@ldesign/device包，实现智能模板选择和优雅降级处理
 */

import type {
  DeviceAdapterConfig,
  DeviceType,
  EventData,
  EventListener,
  TemplateInfo,
} from '../types'

/**
 * 设备检测器接口（模拟@ldesign/device包的接口）
 */
interface DeviceDetector {
  getDeviceType: () => DeviceType
  isMobile: () => boolean
  isTablet: () => boolean
  isDesktop: () => boolean
  getScreenSize: () => { width: number, height: number }
  getOrientation: () => 'portrait' | 'landscape'
  on: (event: string, listener: Function) => void
  off: (event: string, listener: Function) => void
}

/**
 * 设备适配器类
 */
export class DeviceAdapter {
  private config: Required<DeviceAdapterConfig>
  private deviceDetector: DeviceDetector | null = null
  private currentDeviceType: DeviceType
  private listeners = new Map<string, EventListener[]>()

  constructor(config: DeviceAdapterConfig = {}) {
    this.config = this.normalizeConfig(config)
    this.currentDeviceType = this.config.defaultDeviceType
    this.initializeDeviceDetector()
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config: DeviceAdapterConfig): Required<DeviceAdapterConfig> {
    return {
      defaultDeviceType: config.defaultDeviceType ?? 'desktop',
      fallbackStrategy: config.fallbackStrategy ?? {
        mobile: ['mobile', 'tablet', 'desktop'],
        tablet: ['tablet', 'desktop', 'mobile'],
        desktop: ['desktop', 'tablet', 'mobile'],
      },
      autoDetect: config.autoDetect ?? true,
      customDetector: config.customDetector ?? (() => 'desktop' as DeviceType),
      watchDeviceChange: config.watchDeviceChange ?? true,
    }
  }

  /**
   * 初始化设备检测器
   */
  private async initializeDeviceDetector(): Promise<void> {
    try {
      // 尝试导入@ldesign/device包
      const deviceModule = await this.importDeviceModule()
      if (deviceModule) {
        this.deviceDetector = deviceModule
        this.setupDeviceChangeListener()
      }
    }
    catch (error) {
      console.warn('Failed to load @ldesign/device, using fallback detection', error)
    }

    // 初始设备类型检测
    this.updateCurrentDeviceType()
  }

  /**
   * 导入设备检测模块
   */
  private async importDeviceModule(): Promise<DeviceDetector | null> {
    try {
      // 尝试导入@ldesign/device包
      const module = await import('@ldesign/device')

      // 创建适配器来桥接不同的接口
      if (module.DeviceDetector) {
        const detector = new module.DeviceDetector()
        return this.createDetectorAdapter(detector)
      }
      else if (module.default) {
        const detector = typeof module.default === 'function' ? new module.default() : module.default
        return this.createDetectorAdapter(detector)
      }

      return null
    }
    catch (error) {
      console.warn('Failed to import @ldesign/device, using fallback detector:', error)
      // 如果导入失败，使用内置的简单检测器
      return this.createFallbackDetector()
    }
  }

  /**
   * 创建设备检测器适配器
   */
  private createDetectorAdapter(externalDetector: any): DeviceDetector {
    return {
      getDeviceType: () => {
        if (typeof externalDetector.getDeviceType === 'function') {
          return externalDetector.getDeviceType()
        }
        return this.detectDeviceTypeFromUserAgent()
      },

      isMobile: () => {
        if (typeof externalDetector.isMobile === 'function') {
          return externalDetector.isMobile()
        }
        return this.detectDeviceTypeFromUserAgent() === 'mobile'
      },

      isTablet: () => {
        if (typeof externalDetector.isTablet === 'function') {
          return externalDetector.isTablet()
        }
        return this.detectDeviceTypeFromUserAgent() === 'tablet'
      },

      isDesktop: () => {
        if (typeof externalDetector.isDesktop === 'function') {
          return externalDetector.isDesktop()
        }
        return this.detectDeviceTypeFromUserAgent() === 'desktop'
      },

      getScreenSize: () => {
        if (typeof externalDetector.getScreenSize === 'function') {
          return externalDetector.getScreenSize()
        }
        return {
          width: window.innerWidth || 0,
          height: window.innerHeight || 0,
        }
      },

      getOrientation: () => {
        if (typeof externalDetector.getOrientation === 'function') {
          return externalDetector.getOrientation()
        }
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      },

      on: (event: string, listener: Function) => {
        if (typeof externalDetector.on === 'function') {
          externalDetector.on(event, listener)
        }
      },

      off: (event: string, listener: Function) => {
        if (typeof externalDetector.off === 'function') {
          externalDetector.off(event, listener)
        }
      },
    }
  }

  /**
   * 创建回退设备检测器
   */
  private createFallbackDetector(): DeviceDetector {
    const listeners = new Map<string, Function[]>()

    return {
      getDeviceType: (): DeviceType => {
        if (this.config.customDetector) {
          return this.config.customDetector()
        }
        return this.detectDeviceTypeFromUserAgent()
      },

      isMobile: (): boolean => {
        return this.detectDeviceTypeFromUserAgent() === 'mobile'
      },

      isTablet: (): boolean => {
        return this.detectDeviceTypeFromUserAgent() === 'tablet'
      },

      isDesktop: (): boolean => {
        return this.detectDeviceTypeFromUserAgent() === 'desktop'
      },

      getScreenSize: () => ({
        width: window.innerWidth || 0,
        height: window.innerHeight || 0,
      }),

      getOrientation: (): 'portrait' | 'landscape' => {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      },

      on: (event: string, listener: Function) => {
        if (!listeners.has(event)) {
          listeners.set(event, [])
        }
        listeners.get(event)!.push(listener)
      },

      off: (event: string, listener: Function) => {
        const eventListeners = listeners.get(event)
        if (eventListeners) {
          const index = eventListeners.indexOf(listener)
          if (index > -1) {
            eventListeners.splice(index, 1)
          }
        }
      },
    }
  }

  /**
   * 从User Agent检测设备类型
   */
  private detectDeviceTypeFromUserAgent(): DeviceType {
    if (typeof window === 'undefined') {
      return this.config.defaultDeviceType
    }

    const userAgent = navigator.userAgent.toLowerCase()
    const width = window.innerWidth

    // 移动设备检测
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile'
    }

    // 平板设备检测
    if (/tablet|ipad|playbook|silk/i.test(userAgent)
      || (width >= 768 && width <= 1024)) {
      return 'tablet'
    }

    // 默认为桌面设备
    return 'desktop'
  }

  /**
   * 设置设备变化监听器
   */
  private setupDeviceChangeListener(): void {
    if (!this.config.watchDeviceChange || !this.deviceDetector) {
      return
    }

    // 监听设备类型变化
    this.deviceDetector.on('devicechange', () => {
      this.updateCurrentDeviceType()
    })

    // 监听窗口大小变化（用于响应式检测）
    if (typeof window !== 'undefined') {
      let resizeTimer: NodeJS.Timeout
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          this.updateCurrentDeviceType()
        }, 250) // 防抖
      })
    }
  }

  /**
   * 更新当前设备类型
   */
  private updateCurrentDeviceType(): void {
    const newDeviceType = this.getCurrentDeviceType()

    if (newDeviceType !== this.currentDeviceType) {
      const oldDeviceType = this.currentDeviceType
      this.currentDeviceType = newDeviceType

      this.emit('device:change', {
        oldDeviceType,
        newDeviceType,
        timestamp: Date.now(),
      })
    }
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDeviceType(): DeviceType {
    if (this.config.autoDetect && this.deviceDetector) {
      return this.deviceDetector.getDeviceType()
    }

    if (this.config.customDetector) {
      return this.config.customDetector()
    }

    return this.config.defaultDeviceType
  }

  /**
   * 选择最适合的模板
   */
  selectBestTemplate(
    category: string,
    availableTemplates: TemplateInfo[],
  ): TemplateInfo | null {
    const targetDeviceType = this.getCurrentDeviceType()

    // 按设备类型分组
    const templatesByDevice = availableTemplates.reduce((acc, template) => {
      if (template.category === category) {
        acc[template.deviceType] = template
      }
      return acc
    }, {} as Record<DeviceType, TemplateInfo>)

    // 应用回退策略
    const fallbackOrder = this.config.fallbackStrategy[targetDeviceType] || [targetDeviceType]

    for (const deviceType of fallbackOrder) {
      if (templatesByDevice[deviceType]) {
        return templatesByDevice[deviceType]
      }
    }

    return null
  }

  /**
   * 应用回退策略
   */
  applyFallbackStrategy(
    targetDevice: DeviceType,
    availableDevices: DeviceType[],
  ): DeviceType | null {
    const fallbackOrder = this.config.fallbackStrategy[targetDevice] || [targetDevice]

    for (const deviceType of fallbackOrder) {
      if (availableDevices.includes(deviceType)) {
        return deviceType
      }
    }

    return null
  }

  /**
   * 检查模板是否存在
   */
  hasTemplate(
    category: string,
    availableTemplates: TemplateInfo[],
    deviceType?: DeviceType,
  ): boolean {
    const targetDeviceType = deviceType || this.getCurrentDeviceType()

    return availableTemplates.some(template =>
      template.category === category && template.deviceType === targetDeviceType,
    )
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): {
    deviceType: DeviceType
    screenSize: { width: number, height: number }
    orientation: 'portrait' | 'landscape'
    userAgent: string
  } {
    const screenSize = this.deviceDetector?.getScreenSize() || { width: 0, height: 0 }
    const orientation = this.deviceDetector?.getOrientation() || 'landscape'

    return {
      deviceType: this.getCurrentDeviceType(),
      screenSize,
      orientation,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    }
  }

  /**
   * 设置自定义设备检测器
   */
  setCustomDetector(detector: () => DeviceType): void {
    this.config.customDetector = detector
    this.updateCurrentDeviceType()
  }

  /**
   * 设置回退策略
   */
  setFallbackStrategy(strategy: Record<DeviceType, DeviceType[]>): void {
    this.config.fallbackStrategy = { ...this.config.fallbackStrategy, ...strategy }
  }

  /**
   * 强制设置设备类型
   */
  setDeviceType(deviceType: DeviceType): void {
    const oldDeviceType = this.currentDeviceType
    this.currentDeviceType = deviceType
    this.config.autoDetect = false // 禁用自动检测

    this.emit('device:change', {
      oldDeviceType,
      newDeviceType: deviceType,
      forced: true,
      timestamp: Date.now(),
    })
  }

  /**
   * 启用自动检测
   */
  enableAutoDetect(): void {
    this.config.autoDetect = true
    this.updateCurrentDeviceType()
  }

  /**
   * 事件发射器
   */
  private emit(type: string, data: any): void {
    const eventData: EventData = {
      type: type as any,
      timestamp: Date.now(),
      data,
    }

    const listeners = this.listeners.get(type) || []
    listeners.forEach((listener) => {
      try {
        listener(eventData)
      }
      catch (error) {
        console.error(`Error in event listener for ${type}:`, error)
      }
    })
  }

  /**
   * 添加事件监听器
   */
  on(type: string, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.listeners.clear()

    // 清理设备检测器的监听器
    if (this.deviceDetector) {
      // 这里应该清理设备检测器的监听器
      // 具体实现取决于@ldesign/device包的API
    }
  }
}
