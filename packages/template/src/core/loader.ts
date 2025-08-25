/**
 * 动态模板加载器
 * 实现按需加载、智能缓存和预加载优化
 */

import type { CacheItem, EventData, EventListener, LoaderConfig, LoadResult, TemplateInfo, VueComponent } from '../types'

/**
 * LRU 缓存实现
 */
class LRUCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private maxSize: number
  private ttl: number

  constructor(maxSize = 50, ttl = 30 * 60 * 1000) {
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item)
      return null

    // 检查是否过期
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    // 更新访问信息
    item.accessedAt = Date.now()
    item.accessCount++

    // 移到最后（最近使用）
    this.cache.delete(key)
    this.cache.set(key, item)

    return item.value
  }

  set(key: string, value: T, size = 0): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // 如果缓存已满，删除最久未使用的项
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
      else {
        break
      }
    }

    const item: CacheItem<T> = {
      key,
      value,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 1,
      expiresAt: this.ttl > 0 ? Date.now() + this.ttl : undefined,
      size,
    }

    this.cache.set(key, item)
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

/**
 * 模板加载器类
 */
export class TemplateLoader {
  private config: Required<LoaderConfig>
  private cache: LRUCache<VueComponent>
  private loadingPromises = new Map<string, Promise<VueComponent>>()
  private listeners = new Map<string, EventListener[]>()
  private preloadQueue = new Set<string>()

  constructor(config: LoaderConfig = {}) {
    this.config = this.normalizeConfig(config)
    this.cache = new LRUCache<VueComponent>(
      this.config.maxCacheSize,
      this.config.cacheTTL,
    )
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config: LoaderConfig): Required<LoaderConfig> {
    return {
      enableCache: config.enableCache ?? true,
      cacheStrategy: config.cacheStrategy ?? 'lru',
      maxCacheSize: config.maxCacheSize ?? 50,
      cacheTTL: config.cacheTTL ?? 30 * 60 * 1000, // 30分钟
      preloadStrategy: config.preloadStrategy ?? 'critical',
      criticalTemplates: config.criticalTemplates ?? [],
      loadTimeout: config.loadTimeout ?? 10000, // 10秒
      retryCount: config.retryCount ?? 3,
      retryDelay: config.retryDelay ?? 1000, // 1秒
    }
  }

  /**
   * 加载模板组件
   */
  async loadTemplate(templateInfo: TemplateInfo): Promise<LoadResult> {
    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(templateInfo)

    this.emit('template:load:start', { templateInfo, cacheKey })

    try {
      // 检查缓存
      if (this.config.enableCache && this.cache.has(cacheKey)) {
        const component = this.cache.get(cacheKey)!
        const duration = Date.now() - startTime

        this.emit('template:cache:hit', { templateInfo, cacheKey, duration })

        return {
          success: true,
          component,
          templateInfo,
          duration,
          fromCache: true,
        }
      }

      this.emit('template:cache:miss', { templateInfo, cacheKey })

      // 检查是否正在加载
      if (this.loadingPromises.has(cacheKey)) {
        const component = await this.loadingPromises.get(cacheKey)!
        const duration = Date.now() - startTime

        return {
          success: true,
          component,
          templateInfo,
          duration,
          fromCache: false,
        }
      }

      // 开始加载
      const loadPromise = this.performLoad(templateInfo)
      this.loadingPromises.set(cacheKey, loadPromise)

      try {
        const component = await loadPromise
        const duration = Date.now() - startTime

        // 缓存组件
        if (this.config.enableCache) {
          this.cache.set(cacheKey, component)
        }

        this.emit('template:load:complete', {
          templateInfo,
          cacheKey,
          duration,
          fromCache: false,
        })

        return {
          success: true,
          component,
          templateInfo,
          duration,
          fromCache: false,
        }
      }
      finally {
        this.loadingPromises.delete(cacheKey)
      }
    }
    catch (error) {
      const duration = Date.now() - startTime

      this.emit('template:load:error', {
        templateInfo,
        cacheKey,
        error,
        duration,
      })

      return {
        success: false,
        templateInfo,
        duration,
        fromCache: false,
        error: error as Error,
      }
    }
  }

  /**
   * 执行实际的加载操作
   */
  private async performLoad(templateInfo: TemplateInfo): Promise<VueComponent> {
    const { templateFile } = templateInfo
    let lastError: Error | null = null

    // 重试机制
    for (let attempt = 0; attempt <= this.config.retryCount; attempt++) {
      try {
        // 设置超时
        const loadPromise = this.dynamicImport(templateFile.path)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Template load timeout: ${templateFile.path}`))
          }, this.config.loadTimeout)
        })

        const module = await Promise.race([loadPromise, timeoutPromise])

        // 提取组件
        const component = this.extractComponent(module)
        if (!component) {
          throw new Error(`No valid component found in: ${templateFile.path}`)
        }

        return component
      }
      catch (error) {
        lastError = error as Error

        // 如果不是最后一次尝试，等待后重试
        if (attempt < this.config.retryCount) {
          await this.delay(this.config.retryDelay * (attempt + 1))
        }
      }
    }

    throw lastError || new Error(`Failed to load template: ${templateFile.path}`)
  }

  /**
   * 动态导入模块
   */
  private async dynamicImport(path: string): Promise<any> {
    try {
      // 使用动态 import
      return await import(/* @vite-ignore */ path)
    }
    catch (importError) {
      // 回退方案：检查是否在Vite环境中
      if (typeof window !== 'undefined' && 'import' in window) {
        try {
          // 在浏览器环境中，尝试使用全局模块注册表
          const globalModules = (window as any).__TEMPLATE_MODULES__
          if (globalModules && globalModules[path]) {
            return globalModules[path]
          }
        }
        catch (globError) {
          // ignore glob errors
        }
      }

      throw new Error(`Cannot import module: ${path}`)
    }
  }

  /**
   * 从模块中提取组件
   */
  private extractComponent(module: any): VueComponent | null {
    // 尝试不同的导出方式
    if (module.default) {
      return module.default
    }

    if (typeof module === 'function' || typeof module === 'object') {
      return module
    }

    return null
  }

  /**
   * 预加载模板
   */
  async preloadTemplate(templateInfo: TemplateInfo): Promise<void> {
    const cacheKey = this.generateCacheKey(templateInfo)

    // 如果已经缓存或正在加载，跳过
    if (this.cache.has(cacheKey) || this.loadingPromises.has(cacheKey)) {
      return
    }

    // 添加到预加载队列
    this.preloadQueue.add(cacheKey)

    try {
      await this.loadTemplate(templateInfo)
    }
    catch (error) {
      // 预加载失败不抛出错误，只记录日志
      console.warn(`Preload failed for template: ${templateInfo.category}/${templateInfo.deviceType}`, error)
    }
    finally {
      this.preloadQueue.delete(cacheKey)
    }
  }

  /**
   * 批量预加载
   */
  async preloadTemplates(templates: TemplateInfo[]): Promise<void> {
    const { preloadStrategy, criticalTemplates } = this.config

    let templatesToPreload: TemplateInfo[] = []

    switch (preloadStrategy) {
      case 'critical':
        templatesToPreload = templates.filter(t =>
          criticalTemplates.includes(t.category),
        )
        break

      case 'all':
        templatesToPreload = templates
        break

      case 'idle':
        // 在空闲时间预加载
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            this.preloadTemplates(templates)
          })
          return
        }
        templatesToPreload = templates.slice(0, 5) // 限制数量
        break

      case 'none':
      default:
        return
    }

    // 并发预加载，但限制并发数
    const concurrency = 3
    for (let i = 0; i < templatesToPreload.length; i += concurrency) {
      const batch = templatesToPreload.slice(i, i + concurrency)
      await Promise.allSettled(
        batch.map(template => this.preloadTemplate(template)),
      )
    }
  }

  /**
   * 清除缓存
   */
  clearCache(templateKey?: string): void {
    if (templateKey) {
      this.cache.delete(templateKey)
      this.emit('template:cache:evict', { key: templateKey })
    }
    else {
      this.cache.clear()
      this.emit('template:cache:evict', { key: 'all' })
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    size: number
    maxSize: number
    keys: string[]
    hitRate?: number
  } {
    return {
      size: this.cache.size(),
      maxSize: this.config.maxCacheSize,
      keys: this.cache.keys(),
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(templateInfo: TemplateInfo): string {
    const path = templateInfo.templateFile?.path || templateInfo.category
    return `${templateInfo.category}:${templateInfo.deviceType}:${path}`
  }

  /**
   * 检查模板是否已缓存
   */
  isCached(templateInfo: TemplateInfo): boolean {
    const key = this.generateCacheKey(templateInfo)
    return this.cache.has(key)
  }

  /**
   * 获取缓存的模板列表
   */
  getCachedTemplates(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
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
    this.cache.clear()
    this.loadingPromises.clear()
    this.listeners.clear()
    this.preloadQueue.clear()
  }
}
