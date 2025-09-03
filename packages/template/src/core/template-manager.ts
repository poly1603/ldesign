/**
 * 模板管理器
 * 统一管理模板扫描、加载、缓存和设备适配
 */

import type {
  DeviceType,
  EventListener,
  LoadResult,
  TemplateEvents,
  TemplateInfo,
  TemplateManagerConfig,
} from '../types'
import { DEFAULT_CONFIG } from '../types'
import { DeviceAdapter } from './device-adapter'
import { TemplateScanner } from '../scanner'
import { TemplateLoader } from './template-loader'

/**
 * 模板管理器类
 * 整个模板系统的核心管理器
 */
export class TemplateManager {
  private config: TemplateManagerConfig
  private scanner: TemplateScanner
  private loader: TemplateLoader
  private deviceAdapter: DeviceAdapter
  private templates: Map<string, TemplateInfo> = new Map()
  private categoryIndex: Map<string, Map<DeviceType, TemplateInfo[]>> = new Map()
  private listeners: Map<keyof TemplateEvents, Set<EventListener>> = new Map()
  private initialized = false

  constructor(config: Partial<TemplateManagerConfig> = {}) {
    // 合并默认配置
    this.config = { ...DEFAULT_CONFIG, ...config } as TemplateManagerConfig

    // 初始化子模块
    this.scanner = new TemplateScanner({
      templateRoot: this.config.templateRoot,
      extensions: this.config.scanner?.extensions,
      maxDepth: this.config.scanner?.maxDepth,
    })

    this.loader = new TemplateLoader(this.config.cache)
    this.deviceAdapter = new DeviceAdapter(this.config.deviceDetection)

    // 监听设备变化
    this.deviceAdapter.addDeviceChangeListener((deviceType) => {
      this.emit('device:change', this.deviceAdapter.getCurrentDevice(), deviceType)
    })
  }

  /**
   * 初始化管理器
   */
  async initialize(): Promise<void> {
    if (this.initialized)
      return

    try {
      // 初始化设备适配器
      this.deviceAdapter.initialize()

      // 扫描模板
      await this.scanTemplates()

      // 预加载模板
      if (this.config.enablePreload && this.config.preloadTemplates.length > 0) {
        await this.preloadTemplates(this.config.preloadTemplates)
      }

      this.initialized = true
    }
    catch (error) {
      console.error('Failed to initialize TemplateManager:', error)
      throw error
    }
  }

  /**
   * 扫描模板
   */
  async scanTemplates(): Promise<{ count: number, templates: TemplateInfo[], duration: number }> {
    try {
      const result = await this.scanner.scan()

      // 保存已注册的内置模板
      const existingTemplates = new Map(this.templates)
      const existingCategoryIndex = new Map()
      for (const [category, deviceMap] of this.categoryIndex) {
        existingCategoryIndex.set(category, new Map(deviceMap))
      }

      // 清空现有索引
      this.templates.clear()
      this.categoryIndex.clear()

      // 重新添加已注册的内置模板
      for (const [id, template] of existingTemplates) {
        this.templates.set(id, template)
        this.addToIndex(template)
      }

      // 添加扫描到的模板
      for (const template of result.templates) {
        this.templates.set(template.id, template)
        this.addToIndex(template)
      }

      if (this.config.debug) {
        console.log(`Scanned ${result.count} templates in ${result.duration}ms`)
      }

      return result
    }
    catch (error) {
      console.error('Template scanning failed:', error)
      throw error
    }
  }

  /**
   * 添加模板到索引
   */
  private addToIndex(template: TemplateInfo): void {
    if (!this.categoryIndex.has(template.category)) {
      this.categoryIndex.set(template.category, new Map())
    }

    const categoryMap = this.categoryIndex.get(template.category)!
    if (!categoryMap.has(template.deviceType)) {
      categoryMap.set(template.deviceType, [])
    }

    categoryMap.get(template.deviceType)!.push(template)
  }

  /**
   * 手动注册模板
   */
  registerTemplate(template: TemplateInfo): void {
    // 添加到模板映射
    this.templates.set(template.id, template)
    // 添加到索引
    this.addToIndex(template)

    if (this.config.debug) {
      console.log(`Registered template: ${template.id}`)
    }
  }

  /**
   * 批量注册模板
   */
  registerTemplates(templates: TemplateInfo[]): void {
    for (const template of templates) {
      this.registerTemplate(template)
    }

    if (this.config.debug) {
      console.log(`Registered ${templates.length} templates`)
    }
  }

  /**
   * 渲染模板
   */
  async render(
    category: string,
    deviceType?: DeviceType,
    templateName?: string,
    props?: Record<string, any>,
  ): Promise<LoadResult> {
    if (!this.initialized) {
      await this.initialize()
    }

    const targetDevice = deviceType || this.deviceAdapter.getCurrentDevice()
    const template = this.findBestTemplate(category, targetDevice, templateName)

    if (!template) {
      throw new Error(`No template found for category: ${category}, device: ${targetDevice}`)
    }

    this.emit('template:loading', template.id)

    try {
      const result = await this.loader.load(template)
      this.emit('template:loaded', template)
      return result
    }
    catch (error) {
      this.emit('template:error', template.id, error as Error)
      throw error
    }
  }

  /**
   * 查找最适合的模板
   */
  private findBestTemplate(
    category: string,
    deviceType: DeviceType,
    templateName?: string,
  ): TemplateInfo | null {
    const categoryMap = this.categoryIndex.get(category)
    if (!categoryMap)
      return null

    const deviceTemplates = categoryMap.get(deviceType)
    if (!deviceTemplates || deviceTemplates.length === 0) {
      // 尝试降级到其他设备类型
      return this.findFallbackTemplate(category, deviceType)
    }

    if (templateName) {
      // 查找指定名称的模板
      return deviceTemplates.find(t => t.name === templateName) || null
    }

    // 查找默认模板
    const defaultTemplate = deviceTemplates.find(t => t.isDefault)
    if (defaultTemplate)
      return defaultTemplate

    // 返回第一个模板
    return deviceTemplates[0] || null
  }

  /**
   * 查找降级模板
   */
  private findFallbackTemplate(category: string, deviceType: DeviceType): TemplateInfo | null {
    const categoryMap = this.categoryIndex.get(category)
    if (!categoryMap)
      return null

    // 降级顺序
    const fallbackOrder: Record<DeviceType, DeviceType[]> = {
      mobile: ['tablet', 'desktop'],
      tablet: ['desktop', 'mobile'],
      desktop: ['tablet', 'mobile'],
    }

    for (const fallbackDevice of fallbackOrder[deviceType]) {
      const templates = categoryMap.get(fallbackDevice)
      if (templates && templates.length > 0) {
        const defaultTemplate = templates.find(t => t.isDefault)
        return defaultTemplate || templates[0]
      }
    }

    return null
  }

  /**
   * 切换模板
   */
  async switchTemplate(
    category: string,
    templateName: string,
    deviceType?: DeviceType,
  ): Promise<LoadResult> {
    const targetDevice = deviceType || this.deviceAdapter.getCurrentDevice()
    const oldTemplate = this.findBestTemplate(category, targetDevice)

    const result = await this.render(category, targetDevice, templateName)

    this.emit('template:switch', oldTemplate, result.template)

    return result
  }

  /**
   * 预加载模板
   */
  async preloadTemplates(templateIds: string[]): Promise<void> {
    const templates: TemplateInfo[] = []

    for (const templateId of templateIds) {
      const [category, device, name] = templateId.split(':')
      const template = this.findBestTemplate(
        category,
        (device as DeviceType) || this.deviceAdapter.getCurrentDevice(),
        name,
      )

      if (template) {
        templates.push(template)
      }
    }

    await this.loader.preload(templates)
  }

  /**
   * 获取模板列表
   */
  getTemplates(category?: string, deviceType?: DeviceType): TemplateInfo[] {
    if (!category) {
      return Array.from(this.templates.values())
    }

    const categoryMap = this.categoryIndex.get(category)
    if (!categoryMap)
      return []

    if (!deviceType) {
      const allTemplates: TemplateInfo[] = []
      for (const templates of categoryMap.values()) {
        allTemplates.push(...templates)
      }
      return allTemplates
    }

    return categoryMap.get(deviceType) || []
  }

  /**
   * 获取分类列表
   */
  getCategories(): string[] {
    return Array.from(this.categoryIndex.keys())
  }

  /**
   * 获取指定分类的可用设备类型
   */
  getAvailableDeviceTypes(category: string): DeviceType[] {
    const categoryMap = this.categoryIndex.get(category)
    if (!categoryMap)
      return []

    return Array.from(categoryMap.keys())
  }

  /**
   * 检查模板是否存在
   */
  hasTemplate(category: string, deviceType?: DeviceType, templateName?: string): boolean {
    const targetDevice = deviceType || this.deviceAdapter.getCurrentDevice()
    const template = this.findBestTemplate(category, targetDevice, templateName)
    return template !== null
  }

  /**
   * 获取模板信息
   */
  getTemplateInfo(templateId: string): TemplateInfo | null {
    return this.templates.get(templateId) || null
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDevice(): DeviceType {
    return this.deviceAdapter.getCurrentDevice()
  }

  /**
   * 手动设置设备类型
   */
  setDeviceType(deviceType: DeviceType): void {
    this.deviceAdapter.setDeviceType(deviceType)
  }

  /**
   * 获取初始化状态
   */
  get isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 清除缓存
   */
  clearCache(category?: string, deviceType?: DeviceType): void {
    if (category && deviceType) {
      this.loader.clearCache(`${category}:${deviceType}:.*`)
    }
    else if (category) {
      this.loader.clearCache(`${category}:.*`)
    }
    else {
      this.loader.clearCache()
    }

    this.emit('cache:clear', category, deviceType)
  }

  /**
   * 刷新模板列表
   */
  async refresh(): Promise<void> {
    await this.scanTemplates()
  }

  /**
   * 添加事件监听器
   */
  on<K extends keyof TemplateEvents>(event: K, listener: TemplateEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as EventListener)
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof TemplateEvents>(event: K, listener: TemplateEvents[K]): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener as EventListener)
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof TemplateEvents>(event: K, ...args: Parameters<TemplateEvents[K]>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(...args)
        }
        catch (error) {
          console.error(`Error in ${event} listener:`, error)
        }
      })
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<TemplateManagerConfig>): void {
    this.config = { ...this.config, ...config }

    // 更新子模块配置
    if (config.cache) {
      this.loader.updateConfig(config.cache)
    }

    if (config.deviceDetection) {
      this.deviceAdapter.updateConfig(config.deviceDetection)
    }
  }

  /**
   * 获取配置
   */
  getConfig(): TemplateManagerConfig {
    return { ...this.config }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.deviceAdapter.destroy()
    this.loader.destroy()
    this.templates.clear()
    this.categoryIndex.clear()
    this.listeners.clear()
    this.initialized = false
  }
}

/**
 * 创建模板管理器实例
 */
export function createTemplateManager(config?: Partial<TemplateManagerConfig>): TemplateManager {
  return new TemplateManager(config)
}
