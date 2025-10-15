/**
 * 模板加载器
 * 
 * 负责加载模板组件，支持缓存和重试机制
 */

import type { TemplateId, TemplateLoadResult } from '../types'
import type { Component } from 'vue'
import { TemplateRegistry } from './registry'
import { CacheManager } from './cache'
import { getGlobalEmitter } from './events'
import { ERROR_MESSAGES } from '../utils/constants'

/**
 * 加载选项
 */
export interface LoadOptions {
  /** 超时时间(ms) */
  timeout?: number
  /** 最大重试次数 */
  maxRetries?: number
  /** 是否使用缓存 */
  useCache?: boolean
  /** 降级模板ID */
  fallback?: TemplateId
}

/**
 * 模板加载器类
 */
export class TemplateLoader {
  private registry: TemplateRegistry
  private cache: CacheManager
  private emitter = getGlobalEmitter()
  private loadingPromises = new Map<TemplateId, Promise<Component>>()

  constructor(registry: TemplateRegistry, cache: CacheManager) {
    this.registry = registry
    this.cache = cache
  }

  /**
   * 加载模板
   */
  async load(id: TemplateId, options: LoadOptions = {}): Promise<TemplateLoadResult> {
    const {
      timeout = 10000,
      maxRetries = 2,
      useCache = true,
      fallback,
    } = options

    // 发射加载开始事件
    await this.emitter.emit('template:loading', { id })

    const startTime = Date.now()

    try {
      // 尝试从缓存获取
      if (useCache) {
        const cached = this.cache.get(id)
        if (cached) {
          const loadTime = Date.now() - startTime
          const registration = this.registry.get(id)
          
          return {
            id,
            component: cached,
            metadata: registration?.metadata!,
            cached: true,
            loadTime,
          }
        }
      }

      // 获取注册信息
      const registration = this.registry.get(id)
      if (!registration) {
        throw new Error(`${ERROR_MESSAGES.TEMPLATE_NOT_FOUND}: ${id}`)
      }

      // 如果已有组件，直接返回
      if (registration.component) {
        if (useCache) {
          this.cache.set(id, registration.component)
        }
        
        const loadTime = Date.now() - startTime
        await this.emitter.emit('template:loaded', { id, loadTime })
        
        return {
          id,
          component: registration.component,
          metadata: registration.metadata,
          cached: false,
          loadTime,
        }
      }

      // 懒加载组件
      if (registration.loader) {
        const component = await this.loadWithRetry(
          id,
          registration.loader,
          maxRetries,
          timeout
        )

        if (useCache) {
          this.cache.set(id, component)
        }

        const loadTime = Date.now() - startTime
        await this.emitter.emit('template:loaded', { id, loadTime })

        return {
          id,
          component,
          metadata: registration.metadata,
          cached: false,
          loadTime,
        }
      }

      throw new Error(`${ERROR_MESSAGES.TEMPLATE_LOAD_FAILED}: No component or loader`)
    } catch (error) {
      // 发射错误事件
      await this.emitter.emit('template:error', { id, error })

      // 尝试降级
      if (fallback && fallback !== id) {
        console.warn(`[Loader] Loading fallback template: ${fallback}`)
        return this.load(fallback, { ...options, fallback: undefined })
      }

      throw error
    }
  }

  /**
   * 带重试的加载
   */
  private async loadWithRetry(
    id: TemplateId,
    loader: () => Promise<{ default: Component }>,
    maxRetries: number,
    timeout: number
  ): Promise<Component> {
    // 如果正在加载，等待现有的Promise
    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const loadPromise = this.loadWithTimeout(loader, timeout)
        this.loadingPromises.set(id, loadPromise)

        const module = await loadPromise
        const component = module.default

        this.loadingPromises.delete(id)
        return component
      } catch (error) {
        lastError = error as Error
        console.warn(`[Loader] Load attempt ${attempt + 1} failed for ${id}:`, error)

        if (attempt < maxRetries) {
          // 等待一段时间后重试
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
        }
      }
    }

    this.loadingPromises.delete(id)
    throw lastError || new Error(ERROR_MESSAGES.TEMPLATE_LOAD_FAILED)
  }

  /**
   * 带超时的加载
   */
  private loadWithTimeout(
    loader: () => Promise<{ default: Component }>,
    timeout: number
  ): Promise<{ default: Component }> {
    return Promise.race([
      loader(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Load timeout')), timeout)
      ),
    ])
  }

  /**
   * 批量加载模板
   */
  async loadBatch(
    ids: TemplateId[],
    options: LoadOptions = {}
  ): Promise<TemplateLoadResult[]> {
    return Promise.all(ids.map(id => this.load(id, options)))
  }

  /**
   * 预加载模板
   */
  async preload(ids: TemplateId[], options: LoadOptions = {}): Promise<void> {
    try {
      await this.loadBatch(ids, options)
    } catch (error) {
      console.error('[Loader] Preload failed:', error)
    }
  }
}

// 单例实例
let instance: TemplateLoader | null = null

/**
 * 获取加载器实例
 */
export function getLoader(): TemplateLoader {
  if (!instance) {
    const { getRegistry } = require('./registry')
    const { getCache } = require('./cache')
    instance = new TemplateLoader(getRegistry(), getCache())
  }
  return instance
}

/**
 * 重置加载器
 */
export function resetLoader(): void {
  instance = null
}
