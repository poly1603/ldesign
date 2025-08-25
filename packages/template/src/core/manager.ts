/**
 * 模板管理器
 * 高性能动态模板管理系统的核心管理器
 */

import type {
  DeviceType,
  EventData,
  EventListener,
  LoadResult,
  ScanResult,
  TemplateIndex,
  TemplateInfo,
  TemplateManagerConfig,
} from '../types'
import { DeviceAdapter } from './device-adapter'
import { TemplateLoader } from './loader'
import { TemplateScanner } from './scanner'

/**
 * 模板管理器类
 * 统一管理模板扫描、加载、缓存和设备适配
 */
export class TemplateManager {
  private config: TemplateManagerConfig
  private scanner: TemplateScanner
  private loader: TemplateLoader
  private deviceAdapter: DeviceAdapter
  private templateIndex: TemplateIndex | null = null
  private listeners = new Map<string, EventListener[]>()
  private initialized = false

  constructor(config: TemplateManagerConfig = {}) {
    this.config = config
    this.scanner = new TemplateScanner(config.scanner || { scanPaths: ['src/templates/**/*.vue'] })
    this.loader = new TemplateLoader(config.loader)
    this.deviceAdapter = new DeviceAdapter(config.deviceAdapter)

    this.setupEventForwarding()
  }

  /**
   * 设置事件转发
   */
  private setupEventForwarding(): void {
    // 转发扫描器事件
    this.scanner.on('template:scan:start', data => this.emit('template:scan:start', data))
    this.scanner.on('template:scan:progress', data => this.emit('template:scan:progress', data))
    this.scanner.on('template:scan:complete', data => this.emit('template:scan:complete', data))
    this.scanner.on('template:scan:error', data => this.emit('template:scan:error', data))

    // 转发加载器事件
    this.loader.on('template:load:start', data => this.emit('template:load:start', data))
    this.loader.on('template:load:complete', data => this.emit('template:load:complete', data))
    this.loader.on('template:load:error', data => this.emit('template:load:error', data))
    this.loader.on('template:cache:hit', data => this.emit('template:cache:hit', data))
    this.loader.on('template:cache:miss', data => this.emit('template:cache:miss', data))
    this.loader.on('template:cache:evict', data => this.emit('template:cache:evict', data))

    // 转发设备适配器事件
    this.deviceAdapter.on('device:change', data => this.emit('device:change', data))
  }

  /**
   * 初始化管理器
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // 扫描模板
      const scanResult = await this.scanTemplates()
      if (scanResult.count === 0) {
        console.warn('No templates found during scan')
      }

      // 预加载关键模板
      if (this.config.loader?.preloadStrategy !== 'none') {
        await this.loader.preloadTemplates(this.templateIndex!.templates)
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
  async scanTemplates(): Promise<{
    count: number
    templates: TemplateInfo[]
    duration: number
  }> {
    const startTime = Date.now()
    const result = await this.scanner.scan()

    if (result.success) {
      this.templateIndex = result.index
    }

    const duration = Date.now() - startTime
    return {
      count: result.index?.templates.length || 0,
      templates: result.index?.templates || [],
      duration,
    }
  }

  /**
   * 渲染模板
   */
  async render(
    category: string,
    deviceType?: DeviceType,
    props?: Record<string, any>,
  ): Promise<LoadResult> {
    // 确保已初始化
    if (!this.initialized) {
      await this.initialize()
    }

    if (!this.templateIndex) {
      throw new Error('No template index available. Please scan templates first.')
    }

    // 确定目标设备类型
    const targetDeviceType = deviceType || this.deviceAdapter.getCurrentDeviceType()

    // 查找最适合的模板
    const templateInfo = this.findBestTemplate(category, targetDeviceType)
    if (!templateInfo) {
      throw new Error(`No template found for category: ${category}, device: ${targetDeviceType}`)
    }

    // 加载模板
    const loadResult = await this.loader.loadTemplate(templateInfo)

    if (!loadResult.success) {
      throw loadResult.error || new Error('Failed to load template')
    }

    return loadResult
  }

  /**
   * 查找最适合的模板
   */
  private findBestTemplate(category: string, deviceType: DeviceType): TemplateInfo | null {
    if (!this.templateIndex) {
      return null
    }

    // 获取该分类下的所有模板
    const categoryTemplates = this.templateIndex.templates.filter(t => t.category === category)

    if (categoryTemplates.length === 0) {
      return null
    }

    // 使用设备适配器选择最佳模板
    return this.deviceAdapter.selectBestTemplate(category, categoryTemplates)
  }

  /**
   * 预加载模板
   */
  async preloadTemplate(category: string, deviceType?: DeviceType): Promise<void> {
    if (!this.templateIndex) {
      await this.initialize()
    }

    const targetDeviceType = deviceType || this.deviceAdapter.getCurrentDeviceType()
    const templateInfo = this.findBestTemplate(category, targetDeviceType)

    if (templateInfo) {
      await this.loader.preloadTemplate(templateInfo)
    }
  }

  /**
   * 批量预加载模板
   */
  async preloadTemplates(categories: string[], deviceType?: DeviceType): Promise<void> {
    const promises = categories.map(category =>
      this.preloadTemplate(category, deviceType),
    )

    await Promise.allSettled(promises)
  }

  /**
   * 检查模板是否存在
   */
  hasTemplate(category: string, deviceType?: DeviceType): boolean {
    if (!this.templateIndex) {
      return false
    }

    const targetDeviceType = deviceType || this.deviceAdapter.getCurrentDeviceType()
    return this.deviceAdapter.hasTemplate(category, this.templateIndex.templates, targetDeviceType)
  }

  /**
   * 获取模板信息
   */
  getTemplateInfo(category: string, deviceType?: DeviceType): TemplateInfo | null {
    if (!this.templateIndex) {
      return null
    }

    const targetDeviceType = deviceType || this.deviceAdapter.getCurrentDeviceType()
    return this.findBestTemplate(category, targetDeviceType)
  }

  /**
   * 获取所有模板信息
   */
  getAllTemplates(): TemplateInfo[] {
    return this.templateIndex?.templates || []
  }

  /**
   * 获取模板分类列表
   */
  getCategories(): string[] {
    if (!this.templateIndex) {
      return []
    }

    return Object.keys(this.templateIndex.categories)
  }

  /**
   * 获取指定分类的可用设备类型
   */
  getAvailableDeviceTypes(category: string): DeviceType[] {
    if (!this.templateIndex || !this.templateIndex.categories[category]) {
      return []
    }

    return Object.keys(this.templateIndex.categories[category]) as DeviceType[]
  }

  /**
   * 清除缓存
   */
  clearCache(category?: string, deviceType?: DeviceType): void {
    if (category && deviceType) {
      const templateInfo = this.getTemplateInfo(category, deviceType)
      if (templateInfo) {
        const cacheKey = `${category}:${deviceType}:${templateInfo.templateFile.path}`
        this.loader.clearCache(cacheKey)
      }
    }
    else {
      this.loader.clearCache()
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return this.loader.getCacheStats()
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    return this.deviceAdapter.getDeviceInfo()
  }

  /**
   * 设置设备类型
   */
  setDeviceType(deviceType: DeviceType): void {
    this.deviceAdapter.setDeviceType(deviceType)
  }

  /**
   * 启用自动设备检测
   */
  enableAutoDetect(): void {
    this.deviceAdapter.enableAutoDetect()
  }

  /**
   * 重新扫描模板
   */
  async rescan(): Promise<ScanResult> {
    this.templateIndex = null
    const result = await this.scanner.scan()

    if (result.success) {
      this.templateIndex = result.index
    }

    return result
  }

  /**
   * 获取管理器状态
   */
  getStatus(): {
    initialized: boolean
    templateCount: number
    cacheStats: any
    deviceInfo: any
    lastScanTime?: number
  } {
    return {
      initialized: this.initialized,
      templateCount: this.templateIndex?.totalCount || 0,
      cacheStats: this.getCacheStats(),
      deviceInfo: this.getDeviceInfo(),
      lastScanTime: this.templateIndex?.updatedAt,
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<TemplateManagerConfig>): void {
    this.config = { ...this.config, ...config }

    // 重新创建相关组件（如果配置发生变化）
    if (config.scanner) {
      this.scanner.dispose()
      this.scanner = new TemplateScanner({ ...this.config.scanner, ...config.scanner })
    }

    if (config.loader) {
      this.loader.dispose()
      this.loader = new TemplateLoader({ ...this.config.loader, ...config.loader })
    }

    if (config.deviceAdapter) {
      this.deviceAdapter.dispose()
      this.deviceAdapter = new DeviceAdapter({ ...this.config.deviceAdapter, ...config.deviceAdapter })
    }

    // 重新设置事件转发
    this.setupEventForwarding()
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
   * 获取模板列表
   */
  getTemplates(category?: string, deviceType?: DeviceType): TemplateInfo[] {
    return this.scanner.getTemplates(category, deviceType)
  }

  /**
   * 查找模板
   */
  findTemplate(category: string, deviceType: DeviceType, templateName?: string): TemplateInfo | null {
    return this.scanner.findTemplate(category, deviceType, templateName)
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDevice(): DeviceType {
    return this.deviceAdapter.getDeviceInfo().deviceType
  }

  /**
   * 获取配置副本
   */
  getConfig(): TemplateManagerConfig {
    return JSON.parse(JSON.stringify(this.config))
  }

  /**
   * 刷新模板管理器
   */
  async refresh(): Promise<void> {
    await this.rescan()
  }

  /**
   * 获取可用分类
   */
  getAvailableCategories(): string[] {
    return this.scanner.getAvailableCategories()
  }

  /**
   * 获取可用设备类型
   */
  getAvailableDevices(category?: string): DeviceType[] {
    return this.scanner.getAvailableDevices(category)
  }

  /**
   * 监听事件一次
   */
  once(type: string, listener: EventListener): void {
    const onceListener = (data: EventData) => {
      listener(data)
      this.off(type, onceListener)
    }
    this.on(type, onceListener)
  }

  /**
   * 销毁管理器（别名）
   */
  destroy(): void {
    this.dispose()
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.scanner.dispose()
    this.loader.dispose()
    this.deviceAdapter.dispose()
    this.listeners.clear()
    this.templateIndex = null
    this.initialized = false
  }
}
