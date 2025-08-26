/**
 * 设备服务
 * 基于 @ldesign/device 包的高级设备检测和适配服务
 */

import type { DeviceInfo } from '@ldesign/device'
import type {
  DeviceType,
  EventData,
  EventListener,
  TemplateInfo,
} from '../types'

import { DeviceDetector } from '@ldesign/device'

/**
 * 设备服务配置
 */
interface DeviceServiceConfig {
  /** 是否启用高级检测 */
  enableAdvancedDetection?: boolean
  /** 自定义断点 */
  customBreakpoints?: Record<string, number>
  /** 检测间隔 */
  detectionInterval?: number
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
}

/**
 * 设备服务类 - 简化版本，专注于模板系统的设备适配
 */
export class DeviceService {
  private config: Required<DeviceServiceConfig>
  private deviceDetector: DeviceDetector
  private listeners = new Map<string, EventListener[]>()
  private performanceMetrics = new Map<string, number>()

  constructor(config: DeviceServiceConfig = {}) {
    this.config = this.normalizeConfig(config)
    this.deviceDetector = this.createDetector()
    this.setupEventListeners()
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config: DeviceServiceConfig): Required<DeviceServiceConfig> {
    return {
      enableAdvancedDetection: config.enableAdvancedDetection ?? true,
      customBreakpoints: config.customBreakpoints ?? {
        mobile: 768,
        tablet: 1024,
        desktop: 1200,
      },
      detectionInterval: config.detectionInterval ?? 100,
      enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? false,
    }
  }

  /**
   * 创建设备检测器
   */
  private createDetector(): DeviceDetector {
    return new DeviceDetector({
      enableResize: true,
      enableOrientation: true,
      breakpoints: {
        mobile: this.config.customBreakpoints.mobile,
        tablet: this.config.customBreakpoints.tablet,
      },
      debounceDelay: this.config.detectionInterval,
    })
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.deviceDetector.on('deviceChange', (deviceInfo: any) => {
      this.recordPerformanceMetric('device_detection_time', Date.now())

      this.emit('device:detected', {
        type: 'device:detected',
        newDeviceType: deviceInfo.type as DeviceType,
        deviceInfo,
        timestamp: Date.now(),
      })
    })

    this.deviceDetector.on('orientationChange', (orientation: any) => {
      this.emit('device:orientation:change', {
        type: 'device:orientation:change',
        orientation,
        timestamp: Date.now(),
      })
    })
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDeviceType(): DeviceType {
    return this.deviceDetector.getDeviceType() as DeviceType
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return this.deviceDetector.getDeviceInfo()
  }

  /**
   * 检测设备能力
   */
  getDeviceCapabilities(): Record<string, boolean> {
    const deviceInfo = this.getDeviceInfo()

    return {
      touchSupport: deviceInfo.isTouchDevice || false,
      highDPI: (deviceInfo.pixelRatio || 1) > 1,
      webGL: this.checkWebGLSupport(),
      localStorage: this.checkLocalStorageSupport(),
      serviceWorker: this.checkServiceWorkerSupport(),
    }
  }

  /**
   * 选择最佳模板
   */
  selectOptimalTemplate(
    category: string,
    availableTemplates: TemplateInfo[],
    preferences?: Record<string, any>,
  ): TemplateInfo | null {
    const startTime = Date.now()
    const deviceType = this.getCurrentDeviceType()
    const capabilities = this.getDeviceCapabilities()

    // 过滤符合设备类型的模板
    const compatibleTemplates = availableTemplates.filter(template =>
      template.category === category && template.deviceType === deviceType,
    )

    if (compatibleTemplates.length === 0) {
      // 应用回退策略
      return this.applyFallbackStrategy(category, availableTemplates, deviceType)
    }

    // 根据设备能力和偏好选择最佳模板
    const bestTemplate = this.rankTemplates(compatibleTemplates, capabilities, preferences)

    this.recordPerformanceMetric('template_selection_time', Date.now() - startTime)

    return bestTemplate
  }

  /**
   * 应用回退策略
   */
  private applyFallbackStrategy(
    category: string,
    availableTemplates: TemplateInfo[],
    targetDevice: DeviceType,
  ): TemplateInfo | null {
    const fallbackOrder: Record<DeviceType, DeviceType[]> = {
      mobile: ['mobile', 'tablet', 'desktop'],
      tablet: ['tablet', 'desktop', 'mobile'],
      desktop: ['desktop', 'tablet', 'mobile'],
    }

    const order = fallbackOrder[targetDevice] || [targetDevice]

    for (const deviceType of order) {
      const template = availableTemplates.find(t =>
        t.category === category && t.deviceType === deviceType,
      )
      if (template) {
        return template
      }
    }

    return null
  }

  /**
   * 模板排序
   */
  private rankTemplates(
    templates: TemplateInfo[],
    _capabilities: Record<string, boolean>,
    _preferences?: Record<string, any>,
  ): TemplateInfo {
    // 简单的排序逻辑，可以根据需要扩展
    return templates[0]
  }

  /**
   * 检查 WebGL 支持
   */
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    }
    catch {
      return false
    }
  }

  /**
   * 检查 LocalStorage 支持
   */
  private checkLocalStorageSupport(): boolean {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 检查 Service Worker 支持
   */
  private checkServiceWorkerSupport(): boolean {
    return 'serviceWorker' in navigator
  }

  /**
   * 记录性能指标
   */
  private recordPerformanceMetric(name: string, value: number): void {
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMetrics.set(name, value)
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics)
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: EventData): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data)
        }
        catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * 启动服务
   */
  start(): void {
    // DeviceDetector 在构造函数中自动启动
    // 这里可以添加额外的初始化逻辑
  }

  /**
   * 停止服务
   */
  stop(): void {
    this.deviceDetector.destroy()
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.stop()
    this.listeners.clear()
    this.performanceMetrics.clear()
  }
}
