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
  TemplateChangeEvent,
  TemplateLoadResult,
  TemplateManagerConfig,
  TemplateMetadata,
  TemplateRenderOptions,
  TemplateScanResult,
} from '../types'
import { TemplateLoader } from './loader'
import { TemplateScanner } from './scanner'
import { TemplateStorageManager } from './storage'

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

  on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)

    // 返回取消订阅函数
    return () => this.off(event, callback)
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
  private storageManager: TemplateStorageManager | null = null
  private config: Required<Omit<TemplateManagerConfig, 'storage'>> & { storage?: TemplateManagerConfig['storage'] }
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
      storage: config.storage, // 保持 storage 为可选
    }

    this.scanner = new TemplateScanner()
    this.loader = new TemplateLoader()
    this.deviceDetector = new SimpleDeviceDetector()

    // 初始化存储管理器（如果配置了存储选项）
    if (config.storage) {
      this.storageManager = new TemplateStorageManager(config.storage)
    }

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

      // 如果扫描失败，尝试使用预构建的模板
      if (result.count === 0) {
        if (this.config.debug) {
          console.log('🔄 扫描失败，尝试使用预构建模板...')
        }
        return await this.loadPrebuiltTemplates()
      }

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

      // 扫描失败时，尝试使用预构建模板
      if (this.config.debug) {
        console.log('🔄 扫描异常，尝试使用预构建模板...')
      }
      return await this.loadPrebuiltTemplates()
    }
  }

  /**
   * 加载预构建的模板
   */
  private async loadPrebuiltTemplates(): Promise<TemplateScanResult> {
    try {
      // 动态导入预构建的模板元数据
      const { templateMetadata } = await import('../templates')

      const templates: TemplateMetadata[] = []

      // 转换模板元数据为 TemplateMetadata 格式
      for (const [category, categoryData] of Object.entries(templateMetadata)) {
        for (const [device, deviceData] of Object.entries(categoryData)) {
          for (const [template, metadata] of Object.entries(deviceData)) {
            templates.push({
              id: `${category}-${device}-${template}`,
              name: metadata.name,
              description: metadata.description,
              category: metadata.category,
              device: metadata.device as any,
              template: metadata.template,
              path: `templates/${category}/${device}/${template}`,
              component: null, // 将在加载时动态导入
              config: metadata,
            })
          }
        }
      }

      this.templates = templates

      const result: TemplateScanResult = {
        count: templates.length,
        templates,
        duration: 0,
        scannedDirectories: 1,
        scanMode: 'prebuilt',
        debug: {
          scannedPaths: ['templates/index.ts'],
          foundConfigs: templates.length,
          foundComponents: templates.length,
        },
      }

      this.emit('scan:complete', {
        type: 'scan:complete',
        scanResult: result,
        timestamp: Date.now(),
      } as TemplateChangeEvent)

      if (this.config.debug) {
        console.log('✅ 预构建模板加载完成:', result)
      }

      return result
    } catch (error) {
      console.error('❌ 预构建模板加载失败:', error)

      // 返回空结果
      const fallbackResult: TemplateScanResult = {
        count: 0,
        templates: [],
        duration: 0,
        scannedDirectories: 0,
        scanMode: 'fallback',
        debug: {
          scannedPaths: [],
          foundConfigs: 0,
          foundComponents: 0,
        },
      }

      return fallbackResult
    }
  }

  /**
   * 渲染模板
   */
  async render(options: TemplateRenderOptions): Promise<TemplateLoadResult> {
    const { category, device } = options
    let { template } = options
    const targetDevice = device || this.getCurrentDevice()

    // 如果没有指定模板，按优先级选择模板
    if (!template) {
      // 1. 优先使用用户存储的选择
      if (this.storageManager) {
        const storedSelection = this.storageManager.getSelection(category, targetDevice)
        if (storedSelection) {
          template = storedSelection.template

          if (this.config.debug) {
            console.log(`💾 使用存储的模板选择: ${category}/${targetDevice}/${template}`)
          }
        }
      }

      // 2. 如果没有存储的选择，使用默认模板
      if (!template) {
        const defaultTemplate = this.getDefaultTemplate(category, targetDevice)
        if (!defaultTemplate) {
          throw new Error(`No default template found for: ${category}/${targetDevice}`)
        }
        template = defaultTemplate.template

        if (this.config.debug) {
          console.log(`🎯 使用默认模板: ${category}/${targetDevice}/${template}`)
        }
      }
    }

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

      // 如果是用户手动指定的模板，保存选择
      if (options.template && this.storageManager) {
        this.storageManager.saveSelection(category, targetDevice, template)

        if (this.config.debug) {
          console.log(`💾 保存模板选择: ${category}/${targetDevice}/${template}`)
        }
      }

      // 如果是用户手动指定的模板，保存选择
      if (options.template && this.storageManager) {
        this.storageManager.saveSelection(category, targetDevice, template)

        if (this.config.debug) {
          console.log(`💾 保存模板选择: ${category}/${targetDevice}/${template}`)
        }
      }

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
   * 获取默认模板
   */
  getDefaultTemplate(category: string, device: DeviceType): TemplateMetadata | null {
    // 查找指定分类和设备类型下标记为默认的模板
    const defaultTemplate = this.templates.find(
      t => t.category === category && t.device === device && t.config.isDefault === true
    )

    if (defaultTemplate) {
      return defaultTemplate
    }

    // 如果没有找到默认模板，尝试查找名为 'default' 的模板
    const namedDefaultTemplate = this.templates.find(
      t => t.category === category && t.device === device && t.template === 'default'
    )

    if (namedDefaultTemplate) {
      return namedDefaultTemplate
    }

    // 如果还是没有找到，返回该分类和设备类型下的第一个模板
    const firstTemplate = this.templates.find(t => t.category === category && t.device === device)

    return firstTemplate || null
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

  // ============ 存储管理方法 ============

  /**
   * 保存模板选择
   */
  saveTemplateSelection(category: string, device: DeviceType, template: string): void {
    if (this.storageManager) {
      this.storageManager.saveSelection(category, device, template)

      if (this.config.debug) {
        console.log(`💾 手动保存模板选择: ${category}/${device}/${template}`)
      }
    }
  }

  /**
   * 获取存储的模板选择
   */
  getStoredTemplateSelection(category: string, device: DeviceType): string | null {
    if (this.storageManager) {
      const selection = this.storageManager.getSelection(category, device)
      return selection ? selection.template : null
    }
    return null
  }

  /**
   * 删除模板选择
   */
  removeTemplateSelection(category: string, device: DeviceType): void {
    if (this.storageManager) {
      this.storageManager.removeSelection(category, device)

      if (this.config.debug) {
        console.log(`🗑️ 删除模板选择: ${category}/${device}`)
      }
    }
  }

  /**
   * 清空所有模板选择
   */
  clearAllTemplateSelections(): void {
    if (this.storageManager) {
      this.storageManager.clearSelections()

      if (this.config.debug) {
        console.log('🗑️ 清空所有模板选择')
      }
    }
  }

  /**
   * 获取所有存储的模板选择
   */
  getAllStoredSelections(): Record<string, any> {
    if (this.storageManager) {
      return this.storageManager.getAllSelections()
    }
    return {}
  }

  /**
   * 获取存储统计信息
   */
  getStorageStats(): any {
    if (this.storageManager) {
      return this.storageManager.getStats()
    }
    return null
  }

  /**
   * 检查是否启用了存储
   */
  isStorageEnabled(): boolean {
    return this.storageManager !== null
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
   * 获取缓存统计
   */
  getCacheStats(): { components: number; metadata: number } {
    try {
      const loaderStats = this.loader.getCacheStats()
      const scannerStats = this.scanner.getCacheStats()

      if (this.config.debug) {
        console.log('🔍 获取缓存统计:', { loaderStats, scannerStats })
      }

      return {
        components: loaderStats.size,
        metadata: scannerStats.size,
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('❌ 获取缓存统计失败:', error)
      }
      return {
        components: 0,
        metadata: 0,
      }
    }
  }

  /**
   * 清理过期缓存（别名）
   */
  cleanupCache(): void {
    this.clearCache()
  }

  /**
   * 获取配置
   */
  getConfig(): Required<TemplateManagerConfig> {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<TemplateManagerConfig>): void {
    this.config = { ...this.config, ...newConfig }
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
