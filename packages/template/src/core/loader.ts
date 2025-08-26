/**
 * 动态模板加载器
 * 实现按需加载、智能缓存和预加载优化
 */

import type { CacheManager } from '@ldesign/cache'

import type { EventData, EventListener, LoaderConfig, LoadResult, TemplateInfo, VueComponent } from '../types'
// 使用 @ldesign/cache 包
import { createCache } from '@ldesign/cache'

/**
 * 缓存适配器 - 使用 @ldesign/cache
 */
class CacheAdapter<T = any> {
  private cacheManager: CacheManager
  private maxSize: number
  private ttl: number

  constructor(maxSize = 50, ttl = 30 * 60 * 1000) {
    this.maxSize = maxSize
    this.ttl = ttl

    // 创建缓存管理器实例
    this.cacheManager = createCache({
      defaultEngine: 'memory',
      defaultTTL: ttl,
      maxItems: maxSize,
    })
  }

  async get(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key)
      return value
    }
    catch (error) {
      console.warn('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: T, customTTL?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, {
        ttl: customTTL || this.ttl,
      })
    }
    catch (error) {
      console.warn('Cache set error:', error)
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      return await this.cacheManager.has(key)
    }
    catch (error) {
      console.warn('Cache has error:', error)
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.cacheManager.remove(key)
      return true
    }
    catch (error) {
      console.warn('Cache delete error:', error)
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      await this.cacheManager.clear()
    }
    catch (error) {
      console.warn('Cache clear error:', error)
    }
  }

  async size(): Promise<number> {
    try {
      const keys = await this.cacheManager.keys()
      return keys.length
    }
    catch (error) {
      console.warn('Cache size error:', error)
      return 0
    }
  }

  async keys(): Promise<string[]> {
    try {
      return await this.cacheManager.keys()
    }
    catch (error) {
      console.warn('Cache keys error:', error)
      return []
    }
  }
}

/**
 * 模板加载器类
 */
export class TemplateLoader {
  private config: Required<LoaderConfig>
  private cache: CacheAdapter<VueComponent>
  private loadingPromises = new Map<string, Promise<VueComponent>>()
  private listeners = new Map<string, EventListener[]>()
  private preloadQueue = new Set<string>()

  constructor(config: LoaderConfig = {}) {
    this.config = this.normalizeConfig(config)
    this.cache = new CacheAdapter<VueComponent>(
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
      if (this.config.enableCache && await this.cache.has(cacheKey)) {
        const component = await this.cache.get(cacheKey)
        if (component) {
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
          await this.cache.set(cacheKey, component)
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
    catch (_importError) {
      // 回退方案：检查是否在Vite环境中
      if (typeof window !== 'undefined' && 'import' in window) {
        try {
          // 在浏览器环境中，尝试使用全局模块注册表
          const globalModules = (window as any).__TEMPLATE_MODULES__
          if (globalModules && globalModules[path]) {
            return globalModules[path]
          }
        }
        catch (_globError) {
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
    if (await this.cache.has(cacheKey) || this.loadingPromises.has(cacheKey)) {
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
  async clearCache(templateKey?: string): Promise<void> {
    if (templateKey) {
      await this.cache.delete(templateKey)
      this.emit('template:cache:evict', { key: templateKey })
    }
    else {
      await this.cache.clear()
      this.emit('template:cache:evict', { key: 'all' })
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<{
    size: number
    maxSize: number
    keys: string[]
    hitRate?: number
  }> {
    return {
      size: await this.cache.size(),
      maxSize: this.config.maxCacheSize,
      keys: await this.cache.keys(),
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
  async isCached(templateInfo: TemplateInfo): Promise<boolean> {
    const key = this.generateCacheKey(templateInfo)
    return await this.cache.has(key)
  }

  /**
   * 获取缓存的模板列表
   */
  async getCachedTemplates(): Promise<string[]> {
    return await this.cache.keys()
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
  async dispose(): Promise<void> {
    await this.cache.clear()
    this.loadingPromises.clear()
    this.listeners.clear()
    this.preloadQueue.clear()
  }
}
