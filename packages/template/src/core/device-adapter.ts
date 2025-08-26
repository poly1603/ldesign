/**
 * 设备适配器
 * 基于 @ldesign/device 包的轻量级适配层，专注于模板系统的设备适配
 */

import type { DeviceDetectorOptions, DeviceInfo } from '@ldesign/device'
import type {
  DeviceAdapterConfig,
  DeviceType,
  EventData,
  EventListener,
  TemplateInfo,
} from '../types'

import { DeviceDetector } from '@ldesign/device'

/**
 * 设备适配器类 - 简化版本，完全依赖 @ldesign/device
 */
export class DeviceAdapter {
  private config: Required<DeviceAdapterConfig>
  private deviceDetector: DeviceDetector
  private listeners = new Map<string, EventListener[]>()

  constructor(config: DeviceAdapterConfig = {}) {
    this.config = this.normalizeConfig(config)

    // 配置设备检测器，使用 @ldesign/device 的标准配置
    const detectorOptions: DeviceDetectorOptions = {
      enableResize: this.config.watchDeviceChange,
      enableOrientation: this.config.watchDeviceChange,
      breakpoints: {
        mobile: this.config.breakpoints?.mobile || 768,
        tablet: this.config.breakpoints?.tablet || 1024,
      },
      debounceDelay: this.config.debounceDelay,
    }

    this.deviceDetector = new DeviceDetector(detectorOptions)
    this.setupDeviceListeners()
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
      watchDeviceChange: config.watchDeviceChange ?? true,
      breakpoints: config.breakpoints ?? { mobile: 768, tablet: 1024 },
      debounceDelay: config.debounceDelay ?? 150,
    }
  }

  /**
   * 设置设备监听器
   */
  private setupDeviceListeners(): void {
    if (this.config.watchDeviceChange) {
      // 监听设备类型变化
      this.deviceDetector.on('deviceChange', (deviceInfo: any) => {
        this.emit('device:change', {
          type: 'device:change',
          oldDeviceType: this.getCurrentDeviceType(),
          newDeviceType: deviceInfo.type as DeviceType,
          deviceInfo,
          timestamp: Date.now(),
        })
      })

      // 监听屏幕方向变化
      this.deviceDetector.on('orientationChange', (orientation: any) => {
        this.emit('device:orientation:change', {
          type: 'device:orientation:change',
          orientation,
          timestamp: Date.now(),
        })
      })
    }
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDeviceType(): DeviceType {
    if (this.config.autoDetect) {
      return this.deviceDetector.getDeviceType() as DeviceType
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
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo {
    return this.deviceDetector.getDeviceInfo()
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
   * 检查是否有指定模板
   */
  hasTemplate(
    category: string,
    templates: TemplateInfo[],
    targetDeviceType?: DeviceType,
  ): boolean {
    const deviceType = targetDeviceType || this.getCurrentDeviceType()
    return templates.some(template =>
      template.category === category && template.deviceType === deviceType,
    )
  }

  /**
   * 设置设备类型
   */
  setDeviceType(deviceType: DeviceType): void {
    // 这里可以强制设置设备类型，覆盖自动检测
    this.config.defaultDeviceType = deviceType
    this.emit('device:change', {
      type: 'device:change',
      oldDeviceType: this.getCurrentDeviceType(),
      newDeviceType: deviceType,
      timestamp: Date.now(),
    })
  }

  /**
   * 启用自动检测
   */
  enableAutoDetect(): void {
    this.config.autoDetect = true
    // 重新启动设备检测
    this.setupDeviceListeners()
  }

  /**
   * 禁用自动检测
   */
  disableAutoDetect(): void {
    this.config.autoDetect = false
  }

  /**
   * 销毁适配器（别名方法）
   */
  dispose(): void {
    this.destroy()
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    this.deviceDetector.destroy()
    this.listeners.clear()
  }
}
