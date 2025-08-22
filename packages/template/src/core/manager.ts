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
import { EventEmitter, TemplateEventType } from '../services/event-emitter'
import { ErrorHandler, TemplateError } from '../services/error-handler'
import { logger } from '../services/logger'
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
    if (typeof window === 'undefined')
      return 'desktop'

    const width = window.innerWidth
    let device: DeviceType
    if (width < 768) {
      device = 'mobile'
    }
    else if (width < 1024) {
      device = 'tablet'
    }
    else {
      device = 'desktop'
    }

    console.log(`📱 SimpleDeviceDetector 设备检测: 宽度=${width}px, 设备类型=${device}`)
    return device
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
    if (typeof window === 'undefined')
      return

    const handleResize = () => {
      const newDevice = this.detectDevice()
      if (newDevice !== this.currentDevice) {
        const oldDevice = this.currentDevice
        this.currentDevice = newDevice
        console.log(`🔄 SimpleDeviceDetector 检测到设备变化: ${oldDevice} -> ${newDevice}`)
        this.listeners.forEach(listener => listener(newDevice))
      }
    }

    window.addEventListener('resize', handleResize)
    console.log('📱 SimpleDeviceDetector 已设置 resize 监听器')
  }
}



/**
 * 模板管理器
 */
export class TemplateManager {
  private eventEmitter: EventEmitter
  private errorHandler: ErrorHandler
  private scanner: TemplateScanner
  private loader: TemplateLoader
  private deviceDetector: SimpleDeviceDetector
  public storageManager: TemplateStorageManager | null = null
  private config: Required<Omit<TemplateManagerConfig, 'storage'>> & { storage?: TemplateManagerConfig['storage'] }
  private templates: TemplateMetadata[] = []
  private currentTemplate: TemplateMetadata | null = null

  constructor(config: TemplateManagerConfig = {}) {
    this.config = {
      enableCache: true,
      cacheExpiration: 5 * 60 * 1000,
      autoDetectDevice: true,
      debug: false,
      ...config,
      storage: config.storage, // 保持 storage 为可选
    }

    // 初始化服务
    this.eventEmitter = new EventEmitter({ debug: this.config.debug })
    this.errorHandler = new ErrorHandler({ debug: this.config.debug })

    // 使用新的自动扫描器
    this.scanner = new TemplateScanner({ debug: this.config.debug })
    this.loader = new TemplateLoader()
    this.deviceDetector = new SimpleDeviceDetector()

    // 初始化存储管理器（如果配置了存储选项）
    if (config.storage) {
      this.storageManager = new TemplateStorageManager(config.storage)
    }

    this.setupDeviceListener()

    if (this.config.debug) {
      logger.info('🎯 TemplateManager 初始化完成 (自动扫描模式)', this.config)
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

      await this.emit(TemplateEventType.SCAN_COMPLETE, {
        type: 'scan:complete',
        scanResult: result,
        timestamp: Date.now(),
      } as TemplateChangeEvent)

      if (this.config.debug) {
        logger.info('📊 模板扫描完成', result)
      }

      return result
    }
    catch (error) {
      const templateError = TemplateError.templateScanError(
        '模板扫描失败',
        { originalError: error },
      )

      try {
        // 尝试通过错误处理器恢复
        await this.errorHandler.handleError(templateError)
      }
      catch {
        // 错误处理器也无法恢复，记录错误并使用预构建模板
        logger.error('❌ 模板扫描失败', error)
      }

      // 扫描失败时，尝试使用预构建模板
      if (this.config.debug) {
        logger.info('🔄 扫描异常，尝试使用预构建模板...')
      }
      return await this.loadPrebuiltTemplates()
    }
  }

  /**
   * 加载预构建的模板
   * 现在直接使用扫描器的回退机制
   */
  private async loadPrebuiltTemplates(): Promise<TemplateScanResult> {
    try {
      if (this.config.debug) {
        console.log('🔄 使用扫描器的回退模板列表')
      }

      // 直接使用扫描器的回退机制
      const fallbackResult = await this.scanner.scanTemplates()

      // 如果扫描器返回了模板，使用它们
      if (fallbackResult.count > 0) {
        this.templates = fallbackResult.templates
        return fallbackResult
      }

      // 如果扫描器也没有返回模板，创建空结果
      const emptyResult: TemplateScanResult = {
        count: 0,
        templates: [],
        duration: 0,
        scannedDirectories: 0,
        scanMode: 'empty',
        debug: {
          scannedPaths: [],
          foundConfigs: 0,
          foundComponents: 0,
        },
      }

      this.emit('scan:complete', {
        type: 'scan:complete',
        scanResult: emptyResult,
        timestamp: Date.now(),
      } as TemplateChangeEvent)

      if (this.config.debug) {
        console.log('⚠️ 没有找到任何模板')
      }

      return emptyResult
    }
    catch (error) {
      console.error('❌ 预构建模板加载失败:', error)

      // 返回空结果
      const errorResult: TemplateScanResult = {
        count: 0,
        templates: [],
        duration: 0,
        scannedDirectories: 0,
        scanMode: 'error',
        debug: {
          scannedPaths: [],
          foundConfigs: 0,
          foundComponents: 0,
        },
      }

      return errorResult
    }
  }

  /**
   * 渲染模板
   */
  async render(options: TemplateRenderOptions): Promise<TemplateLoadResult> {
    const { category, device } = options
    let { template } = options
    const targetDevice = device || this.getCurrentDevice()

    // 确保模板已扫描
    if (this.templates.length === 0) {
      await this.scanTemplates()
    }

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

    // 查找模板，如果不存在则使用智能回退
    let metadata = this.findTemplate(category, targetDevice, template)
    if (!metadata) {
      if (this.config.debug) {
        console.warn(`⚠️ 模板不存在: ${category}/${targetDevice}/${template}，尝试智能回退...`)
      }

      // 智能回退：尝试找到最佳替代模板
      metadata = this.findFallbackTemplate(category, targetDevice, template)

      if (!metadata) {
        throw new Error(`No template or fallback found for: ${category}/${targetDevice}/${template}`)
      }

      if (this.config.debug) {
        console.log(`🔄 使用回退模板: ${category}/${targetDevice}/${metadata.template}`)
      }
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

      // 发射模板变化事件
      await this.emit(TemplateEventType.TEMPLATE_CHANGE, {
        type: 'template:change',
        newTemplate: metadata,
        oldTemplate,
        timestamp: Date.now(),
      } as TemplateChangeEvent)

      if (this.config.debug) {
        logger.info('🎨 模板渲染成功', result)
      }

      return result
    }
    catch (error) {
      const templateError = TemplateError.templateRenderError(
        '模板渲染失败',
        {
          category,
          device: targetDevice,
          template,
          originalError: error,
        },
      )

      logger.error('❌ 模板渲染失败', templateError)
      throw templateError
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
      t => t.category === category && t.device === device && t.config.isDefault === true,
    )

    if (defaultTemplate) {
      return defaultTemplate
    }

    // 如果没有找到默认模板，尝试查找名为 'default' 的模板
    const namedDefaultTemplate = this.templates.find(
      t => t.category === category && t.device === device && t.template === 'default',
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
   * 智能回退模板查找
   * 当指定的模板不存在时，按优先级查找最佳替代模板
   */
  findFallbackTemplate(category: string, device: DeviceType, originalTemplate: string): TemplateMetadata | null {
    if (this.config.debug) {
      console.log(`🔍 开始智能回退查找: ${category}/${device}/${originalTemplate}`)
    }

    // 获取该分类和设备类型下的所有可用模板
    const availableTemplates = this.getTemplates(category, device)

    if (availableTemplates.length === 0) {
      if (this.config.debug) {
        console.warn(`⚠️ 该设备类型下没有可用模板: ${category}/${device}`)
      }
      return null
    }

    // 回退策略优先级：
    // 1. 查找 'default' 模板
    let fallback = availableTemplates.find(t => t.template === 'default')
    if (fallback) {
      if (this.config.debug) {
        console.log(`✅ 找到 default 回退模板: ${fallback.template}`)
      }
      return fallback
    }

    // 2. 查找 'adaptive' 模板（通常是自适应的）
    fallback = availableTemplates.find(t => t.template === 'adaptive')
    if (fallback) {
      if (this.config.debug) {
        console.log(`✅ 找到 adaptive 回退模板: ${fallback.template}`)
      }
      return fallback
    }

    // 3. 查找标记为默认的模板
    fallback = availableTemplates.find(t => t.config.isDefault === true)
    if (fallback) {
      if (this.config.debug) {
        console.log(`✅ 找到标记为默认的回退模板: ${fallback.template}`)
      }
      return fallback
    }

    // 4. 使用第一个可用模板
    fallback = availableTemplates[0]
    if (fallback) {
      if (this.config.debug) {
        console.log(`✅ 使用第一个可用模板作为回退: ${fallback.template}`)
      }
      return fallback
    }

    if (this.config.debug) {
      console.error(`❌ 无法找到任何回退模板: ${category}/${device}`)
    }
    return null
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
  getAllStoredSelections(): Record<string, unknown> {
    if (this.storageManager) {
      return this.storageManager.getAllSelections()
    }
    return {}
  }

  /**
   * 获取存储统计信息
   */
  getStorageStats(): Record<string, unknown> | null {
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
  getCacheStats(): { components: number, metadata: number } {
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
    }
    catch (error) {
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
  getConfig(): TemplateManagerConfig {
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
    if (!this.config.autoDetectDevice) {
      console.log('⚠️ TemplateManager: autoDetectDevice 已禁用')
      return
    }

    console.log('🎯 TemplateManager: 设置设备监听器')

    // 保存当前设备类型，用于比较
    let lastDevice = this.getCurrentDevice()

    this.deviceDetector.on('deviceChange', async (newDevice: DeviceType) => {
      const oldDevice = lastDevice
      lastDevice = newDevice // 更新保存的设备类型

      logger.device(`📱 TemplateManager 接收到设备变化事件: ${oldDevice} -> ${newDevice}`)

      await this.emit(TemplateEventType.DEVICE_CHANGE, {
        type: 'device:change',
        newDevice,
        oldDevice,
        timestamp: Date.now(),
      } as TemplateChangeEvent)

      if (this.config.debug) {
        logger.device('📱 TemplateManager 发出 device:change 事件', `${oldDevice} -> ${newDevice}`)
      }
    })
  }

  // ============ 事件系统代理方法 ============

  /**
   * 监听事件
   */
  on(eventType: TemplateEventType | string, listener: (event: TemplateChangeEvent) => void): () => void {
    return this.eventEmitter.on(eventType, listener)
  }

  /**
   * 监听事件一次
   */
  once(eventType: TemplateEventType | string, listener: (event: TemplateChangeEvent) => void): () => void {
    return this.eventEmitter.once(eventType, listener)
  }

  /**
   * 取消监听事件
   */
  off(eventType: TemplateEventType | string, listener: (event: TemplateChangeEvent) => void): void {
    this.eventEmitter.off(eventType, listener)
  }

  /**
   * 发射事件
   */
  private async emit(eventType: TemplateEventType | string, event: TemplateChangeEvent): Promise<void> {
    await this.eventEmitter.emit(eventType, event)
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearCache()
    this.templates = []
    this.currentTemplate = null
    this.eventEmitter.destroy()

    if (this.config.debug) {
      logger.info('💥 TemplateManager 已销毁')
    }
  }
}
