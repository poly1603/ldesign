/**
 * 模板加载器
 * 负责动态加载和缓存模板组件
 */

import type { Component } from 'vue'
import type { CacheConfig, LoadResult, TemplateInfo } from '../types'

export interface LoadOptions {
  /** 是否强制重新加载 */
  forceReload?: boolean
  /** 加载超时时间（毫秒） */
  timeout?: number
  /** 是否缓存结果 */
  cache?: boolean
}

/**
 * 缓存项接口
 */
interface CacheItem {
  /** 组件实例 */
  component: Component
  /** 缓存时间 */
  timestamp: number
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccess: number
}

/**
 * 模板加载器类
 * 提供模板的动态加载、缓存和管理功能
 */
export class TemplateLoader {
  private cache = new Map<string, CacheItem>()
  private loadingPromises = new Map<string, Promise<Component>>()
  private config: CacheConfig

  constructor(config: CacheConfig) {
    this.config = { ...config }
  }

  /**
   * 加载模板组件
   */
  async load(template: TemplateInfo, options: LoadOptions = {}): Promise<LoadResult> {
    const startTime = Date.now()
    const cacheKey = this.getCacheKey(template)

    try {
      // 检查缓存
      if (!options.forceReload && this.config.enabled && options.cache !== false) {
        const cached = this.getFromCache(cacheKey)
        if (cached) {
          return {
            template,
            component: cached,
            loadTime: Date.now() - startTime,
            fromCache: true,
          }
        }
      }

      // 检查是否正在加载
      const existingPromise = this.loadingPromises.get(cacheKey)
      if (existingPromise) {
        const component = await existingPromise
        return {
          template,
          component,
          loadTime: Date.now() - startTime,
          fromCache: false,
        }
      }

      // 开始加载
      const loadPromise = this.loadComponent(template, options)
      this.loadingPromises.set(cacheKey, loadPromise)

      try {
        const component = await loadPromise

        // 缓存组件
        if (this.config.enabled && options.cache !== false) {
          this.setCache(cacheKey, component)
        }

        // 更新模板状态
        template.status = 'loaded'
        template.component = component
        template.updatedAt = new Date()

        return {
          template,
          component,
          loadTime: Date.now() - startTime,
          fromCache: false,
        }
      }
      finally {
        this.loadingPromises.delete(cacheKey)
      }
    }
    catch (error) {
      // 更新模板状态
      template.status = 'error'
      template.error = error as Error
      template.updatedAt = new Date()

      throw new Error(`Failed to load template ${template.id}: ${(error as Error).message}`)
    }
  }

  /**
   * 动态加载组件
   */
  private async loadComponent(template: TemplateInfo, options: LoadOptions): Promise<Component> {
    const { componentPath, path } = template

    if (!componentPath && !path) {
      throw new Error(`No component path specified for template ${template.id}`)
    }

    // 设置加载超时
    const timeout = options.timeout || 10000
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Template load timeout')), timeout)
    })

    try {
      // 尝试多种加载方式
      const loadPromise = this.tryLoadComponent(template)
      const component = await Promise.race([loadPromise, timeoutPromise])

      if (!component) {
        throw new Error('Component is null or undefined')
      }

      return component
    }
    catch (error) {
      console.error(`Failed to load component for template ${template.id}:`, error)
      throw error
    }
  }

  /**
   * 尝试加载组件的多种方式
   */
  private async tryLoadComponent(template: TemplateInfo): Promise<Component> {
    // 优先使用 component 函数（用于手动注册的模板）
    if (template.component && typeof template.component === 'function') {
      try {
        const module = await template.component()
        const component = module.default || module[template.name] || module
        if (component) {
          return component
        }
      }
      catch (error) {
        console.error(`Failed to load component using component function for template ${template.id}:`, error)
      }
    }

    // 回退到路径加载方式
    const { componentPath, path } = template
    const possiblePaths = [
      componentPath,
      path && `${path}/index.vue`,
      path && `${path}/index.tsx`,
      path && `${path}/component.vue`,
      path && `${path}/component.tsx`,
    ].filter(Boolean) as string[]

    let lastError: Error | null = null

    for (const filePath of possiblePaths) {
      try {
        // 动态导入组件
        const module = await import(/* @vite-ignore */ filePath)
        const component = module.default || module[template.name] || module

        if (component) {
          return component
        }
      }
      catch (error) {
        lastError = error as Error
        continue
      }
    }

    throw lastError || new Error(`No valid component found for template ${template.id}`)
  }

  /**
   * 从缓存获取组件
   */
  private getFromCache(cacheKey: string): Component | null {
    const item = this.cache.get(cacheKey)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (this.isCacheExpired(item)) {
      this.cache.delete(cacheKey)
      return null
    }

    // 更新访问信息
    item.accessCount++
    item.lastAccess = Date.now()

    return item.component
  }

  /**
   * 设置缓存
   */
  private setCache(cacheKey: string, component: Component): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxSize) {
      this.evictCache()
    }

    const item: CacheItem = {
      component,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
    }

    this.cache.set(cacheKey, item)
  }

  /**
   * 缓存淘汰
   */
  private evictCache(): void {
    if (this.cache.size === 0)
      return

    switch (this.config.strategy) {
      case 'lru':
        this.evictLRU()
        break
      case 'fifo':
        this.evictFIFO()
        break
      default:
        this.evictLRU()
    }
  }

  /**
   * LRU淘汰策略
   */
  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < oldestTime) {
        oldestTime = item.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * FIFO淘汰策略
   */
  private evictFIFO(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * 检查缓存是否过期
   */
  private isCacheExpired(item: CacheItem): boolean {
    if (this.config.ttl <= 0) {
      return false
    }

    return Date.now() - item.timestamp > this.config.ttl
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(template: TemplateInfo): string {
    return `${template.category}:${template.deviceType}:${template.name}`
  }

  /**
   * 预加载模板
   */
  async preload(templates: TemplateInfo[]): Promise<void> {
    const loadPromises = templates.map(template =>
      this.load(template, { cache: true }).catch((error) => {
        console.warn(`Failed to preload template ${template.id}:`, error)
      }),
    )

    await Promise.allSettled(loadPromises)
  }

  /**
   * 检查模板是否已缓存
   */
  isCached(template: TemplateInfo): boolean {
    const cacheKey = this.getCacheKey(template)
    const item = this.cache.get(cacheKey)
    return item ? !this.isCacheExpired(item) : false
  }

  /**
   * 清除缓存
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const regex = new RegExp(pattern)
    for (const [key] of this.cache.entries()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    size: number
    maxSize: number
    hitRate: number
    items: Array<{ key: string, accessCount: number, age: number }>
  } {
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      accessCount: item.accessCount,
      age: Date.now() - item.timestamp,
    }))

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // TODO: 实现命中率统计
      items,
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config }

    // 如果缓存被禁用，清空缓存
    if (!this.config.enabled) {
      this.clearCache()
    }

    // 如果最大大小减小，进行缓存淘汰
    while (this.cache.size > this.config.maxSize) {
      this.evictCache()
    }
  }

  /**
   * 获取配置
   */
  getConfig(): CacheConfig {
    return { ...this.config }
  }

  /**
   * 销毁加载器
   */
  destroy(): void {
    this.cache.clear()
    this.loadingPromises.clear()
  }
}

/**
 * 创建模板加载器实例
 */
export function createTemplateLoader(config: CacheConfig): TemplateLoader {
  return new TemplateLoader(config)
}
