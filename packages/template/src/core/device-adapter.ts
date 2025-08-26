/**
 * 设备适配器
 * 直接使用@ldesign/device包，实现智能模板选择和优雅降级处理
 */

import type {
  DeviceAdapterConfig,
  DeviceType,
  EventData,
  EventListener,
  TemplateInfo,
} from '../types'

// 直接导入@ldesign/device包
import { DeviceDetector } from '@ldesign/device'
import type { DeviceDetectorOptions } from '@ldesign/device'

/**
 * 设备适配器类
 */
export class DeviceAdapter {
  private config: Required<DeviceAdapterConfig>
  private deviceDetector: DeviceDetector
  private currentDeviceType: DeviceType
  private listeners = new Map<string, EventListener[]>()

  constructor(config: DeviceAdapterConfig = {}) {
    this.config = this.normalizeConfig(config)
    this.currentDeviceType = this.config.defaultDeviceType

    // 直接创建 DeviceDetector 实例
    const detectorOptions: DeviceDetectorOptions = {
      enableResize: this.config.watchDeviceChange,
      enableOrientation: this.config.watchDeviceChange,
      breakpoints: {
        mobile: 768,
        tablet: 1024,
      },
      debounceDelay: 100,
    }

    this.deviceDetector = new DeviceDetector(detectorOptions)
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
  private initializeDeviceDetector(): void {
    this.setupDeviceChangeListener()
    this.updateCurrentDeviceType()
  }









  /**
   * 设置设备变化监听器
   */
  private setupDeviceChangeListener(): void {
    if (!this.config.watchDeviceChange) {
      return
    }

    // 监听设备信息变化
    this.deviceDetector.on('deviceInfoChange', (deviceInfo: any) => {
      const newDeviceType = deviceInfo.type as DeviceType
      if (newDeviceType !== this.currentDeviceType) {
        const oldDeviceType = this.currentDeviceType
        this.currentDeviceType = newDeviceType

        this.emit('device:change', {
          oldDeviceType,
          newDeviceType,
          timestamp: Date.now(),
        })
      }
    })
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
    if (this.config.autoDetect) {
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
    const deviceInfo = this.deviceDetector.getDeviceInfo()

    return {
      deviceType: this.getCurrentDeviceType(),
      screenSize: { width: deviceInfo.width, height: deviceInfo.height },
      orientation: deviceInfo.orientation,
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

    // 清理设备检测器
    if (this.deviceDetector) {
      this.deviceDetector.destroy()
    }
  }
}
