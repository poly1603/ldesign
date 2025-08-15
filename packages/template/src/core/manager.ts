/**
 * 模板管理器 - 重构版本
 *
 * 使用外部包：
 * - @ldesign/device 进行设备检测
 * - @ldesign/cache 进行缓存管理
 *
 * 专注于模板的核心管理功能
 */

import type {
  DeviceType,
  TemplateManagerConfig,
  TemplateMetadata,
  TemplateRenderOptions,
  TemplateLoadResult,
  TemplateScanResult,
  TemplateChangeEvent,
} from '../types'
import { TemplateScanner } from './scanner'
import { TemplateLoader } from './loader'

// TODO: 稍后替换为外部包
// import { DeviceDetector } from '@ldesign/device'
// import { createCache } from '@ldesign/cache'

/**
 * 简单的设备检测（临时实现）
 */
class SimpleDeviceDetector {
  private listeners: Array<(device: DeviceType) => void> = []
  private currentDevice: DeviceType = 'desktop'

  constructor() {
    this.currentDevice = this.detectDevice()
    this.setupListener()
  }

  detectDevice(): DeviceType {
    if (typeof window === 'undefined') return 'desktop'

    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  getDeviceType(): DeviceType {
    return this.currentDevice
  }

  on(event: string, callback: (device: DeviceType) => void): void {
    if (event === 'deviceChange') {
      this.listeners.push(callback)
    }
  }

  private setupListener(): void {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const newDevice = this.detectDevice()
      if (newDevice !== this.currentDevice) {
        const oldDevice = this.currentDevice
        this.currentDevice = newDevice
        this.listeners.forEach(listener => listener(newDevice))
      }
    }

    window.addEventListener('resize', handleResize)
  }
}

/**
 * 简单的事件发射器
 */
class SimpleEventEmitter {
  private events = new Map<string, Array<(...args: any[]) => void>>()

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args)
        } catch (error) {
          console.error(`Event callback error for ${event}:`, error)
        }
      })
    }
  }

  off(event: string, callback: (...args: any[]) => void): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
}

/**
 * 模板管理器
 */
export class TemplateManager extends SimpleEventEmitter {
  private scanner: TemplateScanner
  private loader: TemplateLoader
  private deviceDetector: SimpleDeviceDetector
  private config: Required<TemplateManagerConfig>
  private templates: TemplateMetadata[] = []
  private currentTemplate: TemplateMetadata | null = null

  constructor(config: TemplateManagerConfig = {}) {
    super()

    this.config = {
      enableCache: true,
      cacheExpiration: 5 * 60 * 1000,
      autoDetectDevice: true,
      debug: false,
      ...config,
    }

    this.scanner = new TemplateScanner()
    this.loader = new TemplateLoader()
    this.deviceDetector = new SimpleDeviceDetector()

    this.setupDeviceListener()

    if (this.config.debug) {
      console.log('🎯 TemplateManager 初始化完成', this.config)
    }
  }

  /**
   * 扫描模板
   */
  async scanTemplates(): Promise<TemplateScanResult> {
    try {
      const result = await this.scanner.scanTemplates()
      this.templates = result.templates

      this.emit('scan:complete', {
        type: 'scan:complete',
        scanResult: result,
        timestamp: Date.now(),
      } as TemplateChangeEvent)

      if (this.config.debug) {
        console.log('📊 模板扫描完成:', result)
      }

      return result
    } catch (error) {
      console.error('❌ 模板扫描失败:', error)
      throw error
    }
  }

  /**
   * 渲染模板
   */
  async render(options: TemplateRenderOptions): Promise<TemplateLoadResult> {
    const { category, template, device } = options
    const targetDevice = device || this.getCurrentDevice()

    // 查找模板
    const metadata = this.findTemplate(category, targetDevice, template)
    if (!metadata) {
      throw new Error(`Template not found: ${category}/${targetDevice}/${template}`)
    }

    try {
      // 加载模板
      const result = await this.loader.loadTemplate(metadata)

      // 更新当前模板
      const oldTemplate = this.currentTemplate
      this.currentTemplate = metadata

      // 发射模板变化事件
      this.emit('template:change', {
        type: 'template:change',
        newTemplate: metadata,
        oldTemplate,
        timestamp: Date.now(),
      } as TemplateChangeEvent)

      if (this.config.debug) {
        console.log('🎨 模板渲染成功:', result)
      }

      return result
    } catch (error) {
      console.error('❌ 模板渲染失败:', error)
      throw error
    }
  }

  /**
   * 切换模板
   */
  async switchTemplate(category: string, device: DeviceType, template: string): Promise<void> {
    await this.render({ category, device, template })
  }

  /**
   * 获取模板列表
   */
  getTemplates(category?: string, device?: DeviceType): TemplateMetadata[] {
    let filtered = this.templates

    if (category) {
      filtered = filtered.filter(t => t.category === category)
    }

    if (device) {
      filtered = filtered.filter(t => t.device === device)
    }

    return filtered
  }

  /**
   * 检查模板是否存在
   */
  hasTemplate(category: string, device: DeviceType, template: string): boolean {
    return this.findTemplate(category, device, template) !== null
  }

  /**
   * 查找模板
   */
  findTemplate(category: string, device: DeviceType, template: string): TemplateMetadata | null {
    return this.templates.find(t => t.category === category && t.device === device && t.template === template) || null
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDevice(): DeviceType {
    return this.deviceDetector.getDeviceType()
  }

  /**
   * 获取当前模板
   */
  getCurrentTemplate(): TemplateMetadata | null {
    return this.currentTemplate
  }

  /**
   * 预加载模板
   */
  async preloadTemplates(templates?: TemplateMetadata[]): Promise<void> {
    const templatesToPreload = templates || this.templates
    await this.loader.preloadTemplates(templatesToPreload)
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.scanner.clearCache()
    this.loader.clearCache()

    if (this.config.debug) {
      console.log('🗑️ 所有缓存已清空')
    }
  }

  /**
   * 刷新模板列表
   */
  async refresh(): Promise<void> {
    this.clearCache()
    await this.scanTemplates()
  }

  /**
   * 获取可用分类
   */
  getAvailableCategories(): string[] {
    return [...new Set(this.templates.map(t => t.category))]
  }

  /**
   * 获取可用设备类型
   */
  getAvailableDevices(): DeviceType[] {
    return [...new Set(this.templates.map(t => t.device))]
  }

  /**
   * 设置设备监听器
   */
  private setupDeviceListener(): void {
    if (!this.config.autoDetectDevice) return

    this.deviceDetector.on('deviceChange', (newDevice: DeviceType) => {
      const oldDevice = this.getCurrentDevice()

      this.emit('device:change', {
        type: 'device:change',
        newDevice,
        oldDevice,
        timestamp: Date.now(),
      } as TemplateChangeEvent)

      if (this.config.debug) {
        console.log('📱 设备类型变化:', `${oldDevice} -> ${newDevice}`)
      }
    })
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearCache()
    this.templates = []
    this.currentTemplate = null

    if (this.config.debug) {
      console.log('💥 TemplateManager 已销毁')
    }
  }
}
