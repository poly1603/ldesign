/**
 * 模板管理器 - 统一管理模板扫描、加载和查询
 * 框架无关的核心管理器类
 */

import type {
  DeviceType,
  TemplateFilter,
  TemplateLoadOptions,
  TemplateManagerOptions,
  TemplateMetadata,
  TemplateRegistryItem,
  TemplateScanResult,
  PerformanceMetrics,
} from '../types'

/**
 * 模板管理器基类
 * 提供框架无关的模板管理功能
 */
export abstract class TemplateManager {
  protected initialized = false
  protected scanResult: TemplateScanResult | null = null
  protected options: TemplateManagerOptions
  protected registry = new Map<string, TemplateRegistryItem>()
  protected filterCache = new Map<string, { data: TemplateMetadata[]; timestamp: number }>()
  protected readonly FILTER_CACHE_TTL = 60000 // 缓存1分钟
  protected readonly FILTER_CACHE_MAX_SIZE = 100 // 最大缓存条目
  protected metrics: PerformanceMetrics = {}

  /**
   * 构造函数
   */
  constructor(options: TemplateManagerOptions = {}) {
    this.options = {
      autoScan: true,
      debug: false,
      strict: false,
      ...options,
    }
  }

  /**
   * 初始化（扫描所有模板）
   */
  async initialize(): Promise<TemplateScanResult> {
    if (this.initialized && this.scanResult) {
      return this.scanResult
    }

    const startTime = Date.now()
    
    try {
      // 扫描模板
      this.scanResult = await this.scan()
      
      // 注册模板
      this.registerTemplates(this.scanResult.templates)
      
      this.initialized = true
      this.metrics.loadTime = Date.now() - startTime
      
      if (this.options.debug) {
        console.log(`[TemplateManager] 初始化完成，耗时 ${this.metrics.loadTime}ms`)
        console.log(`[TemplateManager] 找到 ${this.scanResult.count} 个模板`)
      }
      
      return this.scanResult
    } catch (error) {
      this.metrics.errorRate = (this.metrics.errorRate || 0) + 1
      throw error
    }
  }

  /**
   * 扫描模板（由子类实现）
   */
  protected abstract scan(): Promise<TemplateScanResult>

  /**
   * 加载模板（由子类实现）
   */
  abstract loadTemplate(
    category: string,
    device: string,
    name: string,
    options?: TemplateLoadOptions
  ): Promise<any>

  /**
   * 注册模板到注册表
   */
  protected registerTemplates(templates: TemplateMetadata[]): void {
    for (const metadata of templates) {
      const key = this.getTemplateKey(metadata)
      
      if (this.registry.has(key) && this.options.strict) {
        console.warn(`[TemplateManager] 模板已存在：${key}`)
      }
      
      this.registry.set(key, {
        metadata,
        loader: () => this.loadTemplate(
          metadata.category,
          metadata.device,
          metadata.name
        ),
        loaded: false,
        useCount: 0,
      })
    }
  }

  /**
   * 生成模板唯一键
   */
  protected getTemplateKey(metadata: TemplateMetadata): string {
    return `${metadata.category}/${metadata.device}/${metadata.name}`
  }

  /**
   * 确保已初始化
   */
  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  /**
   * 获取所有模板元数据
   */
  async getAllTemplates(): Promise<TemplateMetadata[]> {
    await this.ensureInitialized()
    return Array.from(this.registry.values()).map(item => item.metadata)
  }

  /**
   * 根据过滤条件查询模板
   */
  async queryTemplates(filter: TemplateFilter = {}): Promise<TemplateMetadata[]> {
    await this.ensureInitialized()
    
    // 生成缓存键
    const cacheKey = this.getFilterCacheKey(filter)
    
    // 检查缓存
    const cached = this.filterCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.FILTER_CACHE_TTL) {
      if (this.options.debug) {
        console.log(`[TemplateManager] 使用缓存的过滤结果：${cacheKey}`)
      }
      return cached.data
    }
    
    // 执行过滤
    let templates = Array.from(this.registry.values()).map(item => item.metadata)
    
    // 按分类过滤
    if (filter.category) {
      const categories = Array.isArray(filter.category) ? filter.category : [filter.category]
      templates = templates.filter(t => categories.includes(t.category))
    }
    
    // 按设备类型过滤
    if (filter.device) {
      const devices = Array.isArray(filter.device) ? filter.device : [filter.device]
      templates = templates.filter(t => devices.includes(t.device))
    }
    
    // 按名称过滤
    if (filter.name) {
      if (filter.name instanceof RegExp) {
        templates = templates.filter(t => filter.name!.test(t.name))
      } else {
        templates = templates.filter(t => t.name.includes(filter.name as string))
      }
    }
    
    // 按标签过滤
    if (filter.tags && filter.tags.length > 0) {
      templates = templates.filter(t => 
        t.tags && filter.tags!.some(tag => t.tags!.includes(tag))
      )
    }
    
    // 按作者过滤
    if (filter.author) {
      templates = templates.filter(t => t.author === filter.author)
    }
    
    // 只要默认模板
    if (filter.defaultOnly) {
      templates = templates.filter(t => t.isDefault)
    }
    
    // SSR 支持
    if (filter.ssr !== undefined) {
      templates = templates.filter(t => t.ssr === filter.ssr)
    }
    
    // 响应式支持
    if (filter.responsive !== undefined) {
      templates = templates.filter(t => t.responsive === filter.responsive)
    }
    
    // 搜索关键词
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.displayName.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      )
    }
    
    // 更新缓存
    this.updateFilterCache(cacheKey, templates)
    
    return templates
  }

  /**
   * 生成过滤缓存键
   */
  protected getFilterCacheKey(filter: TemplateFilter): string {
    return JSON.stringify(filter)
  }

  /**
   * 更新过滤缓存
   */
  protected updateFilterCache(key: string, data: TemplateMetadata[]): void {
    // 检查缓存大小
    if (this.filterCache.size >= this.FILTER_CACHE_MAX_SIZE) {
      // 删除最旧的缓存项
      const oldestKey = this.filterCache.keys().next().value
      this.filterCache.delete(oldestKey)
    }
    
    this.filterCache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * 根据分类获取模板
   */
  async getTemplatesByCategory(category: TemplateCategory): Promise<TemplateMetadata[]> {
    return this.queryTemplates({ category })
  }

  /**
   * 根据设备类型获取模板
   */
  async getTemplatesByDevice(device: DeviceType): Promise<TemplateMetadata[]> {
    return this.queryTemplates({ device })
  }

  /**
   * 获取默认模板
   */
  async getDefaultTemplate(
    category: TemplateCategory,
    device: DeviceType
  ): Promise<TemplateMetadata | null> {
    const templates = await this.queryTemplates({
      category,
      device,
      defaultOnly: true,
    })
    
    return templates[0] || null
  }

  /**
   * 检查模板是否存在
   */
  async hasTemplate(
    category: string,
    device: string,
    name: string
  ): Promise<boolean> {
    await this.ensureInitialized()
    const key = `${category}/${device}/${name}`
    return this.registry.has(key)
  }

  /**
   * 获取模板元数据
   */
  async getTemplateMetadata(
    category: string,
    device: string,
    name: string
  ): Promise<TemplateMetadata | null> {
    await this.ensureInitialized()
    const key = `${category}/${device}/${name}`
    const item = this.registry.get(key)
    return item ? item.metadata : null
  }

  /**
   * 预加载模板
   */
  async preloadTemplate(
    category: string,
    device: string,
    name: string
  ): Promise<void> {
    const key = `${category}/${device}/${name}`
    const item = this.registry.get(key)
    
    if (!item) {
      throw new Error(`模板不存在：${key}`)
    }
    
    if (!item.loaded) {
      const startTime = Date.now()
      item.component = await item.loader()
      item.loaded = true
      item.loadedAt = Date.now()
      
      if (this.options.debug) {
        console.log(`[TemplateManager] 预加载模板：${key}，耗时 ${Date.now() - startTime}ms`)
      }
    }
  }

  /**
   * 批量预加载模板
   */
  async preloadTemplates(filter: TemplateFilter = {}): Promise<void> {
    const templates = await this.queryTemplates(filter)
    const promises = templates.map(t => 
      this.preloadTemplate(t.category, t.device, t.name)
    )
    await Promise.all(promises)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.filterCache.clear()
    
    // 清除已加载的组件
    for (const item of this.registry.values()) {
      if (item.loaded) {
        item.component = undefined
        item.loaded = false
        item.loadedAt = undefined
      }
    }
    
    if (this.options.debug) {
      console.log('[TemplateManager] 缓存已清除')
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    const loadedCount = Array.from(this.registry.values()).filter(item => item.loaded).length
    const totalCount = this.registry.size
    
    return {
      ...this.metrics,
      cacheHitRate: totalCount > 0 ? loadedCount / totalCount : 0,
    }
  }

  /**
   * 重置管理器
   */
  async reset(): Promise<void> {
    this.initialized = false
    this.scanResult = null
    this.registry.clear()
    this.clearCache()
    this.metrics = {}
    
    if (this.options.autoScan) {
      await this.initialize()
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearCache()
    this.registry.clear()
    this.scanResult = null
    this.initialized = false
    this.metrics = {}
  }
}

export default TemplateManager
