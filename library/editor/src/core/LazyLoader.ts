/**
 * 懒加载管理器
 * 实现真正的按需加载，减少初始加载时间
 */

import { EventEmitter } from './EventEmitter'
import { getPerformanceMonitor } from '../utils/PerformanceMonitor'

/**
 * 加载器函数类型
 */
export type LoaderFunction<T> = () => Promise<T> | T

/**
 * 加载选项
 */
export interface LoadOptions {
  timeout?: number
  retry?: number
  cache?: boolean
  priority?: number
}

/**
 * 加载项注册信息
 */
interface LoaderRegistration<T> {
  id: string
  loader: LoaderFunction<T>
  options: LoadOptions
  loaded: boolean
  loading: boolean
  result?: T
  error?: Error
  loadTime?: number
}

/**
 * 懒加载管理器类
 */
export class LazyLoader extends EventEmitter {
  private loaders: Map<string, LoaderRegistration<any>> = new Map()
  private loadQueue: string[] = []
  private maxConcurrent: number = 3
  private activeLoads: number = 0
  private monitor = getPerformanceMonitor()
  
  constructor(maxConcurrent: number = 3) {
    super()
    this.maxConcurrent = maxConcurrent
  }
  
  /**
   * 注册加载器
   */
  register<T>(
    id: string,
    loader: LoaderFunction<T>,
    options: LoadOptions = {}
  ): void {
    if (this.loaders.has(id)) {
      console.warn(`Loader "${id}" is already registered`)
      return
    }
    
    this.loaders.set(id, {
      id,
      loader,
      options: {
        timeout: 30000,
        retry: 3,
        cache: true,
        priority: 0,
        ...options
      },
      loaded: false,
      loading: false
    })
    
    this.emit('loader:registered', { id })
  }
  
  /**
   * 加载资源
   */
  async load<T>(id: string): Promise<T | null> {
    const registration = this.loaders.get(id)
    
    if (!registration) {
      console.error(`Loader "${id}" not found`)
      return null
    }
    
    // 如果已加载且启用缓存，直接返回
    if (registration.loaded && registration.options.cache && registration.result) {
      return registration.result as T
    }
    
    // 如果正在加载，等待完成
    if (registration.loading) {
      return this.waitForLoad<T>(id)
    }
    
    // 检查并发限制
    if (this.activeLoads >= this.maxConcurrent) {
      this.loadQueue.push(id)
      return this.waitForLoad<T>(id)
    }
    
    return this.executeLoad<T>(registration)
  }
  
  /**
   * 执行加载
   */
  private async executeLoad<T>(registration: LoaderRegistration<T>): Promise<T | null> {
    registration.loading = true
    this.activeLoads++
    
    const startTime = performance.now()
    this.monitor.start(`lazy-load:${registration.id}`)
    this.emit('load:start', { id: registration.id })
    
    try {
      // 设置超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Load timeout')), registration.options.timeout)
      })
      
      // 执行加载
      const loadPromise = Promise.resolve(registration.loader())
      
      const result = await Promise.race([loadPromise, timeoutPromise])
      
      registration.result = result
      registration.loaded = true
      registration.loading = false
      registration.loadTime = performance.now() - startTime
      
      this.monitor.end(`lazy-load:${registration.id}`, {
        success: true,
        loadTime: registration.loadTime
      })
      
      this.emit('load:success', {
        id: registration.id,
        loadTime: registration.loadTime
      })
      
      this.activeLoads--
      this.processQueue()
      
      return result
    } catch (error) {
      registration.error = error as Error
      registration.loading = false
      this.activeLoads--
      
      this.monitor.end(`lazy-load:${registration.id}`, {
        success: false,
        error: (error as Error).message
      })
      
      this.emit('load:error', {
        id: registration.id,
        error: error as Error
      })
      
      // 重试
      if (registration.options.retry && registration.options.retry > 0) {
        registration.options.retry--
        console.log(`Retrying load for "${registration.id}"...`)
        return this.executeLoad(registration)
      }
      
      this.processQueue()
      
      return null
    }
  }
  
  /**
   * 等待加载完成
   */
  private waitForLoad<T>(id: string): Promise<T | null> {
    return new Promise((resolve) => {
      const checkLoaded = (data: any) => {
        if (data.id === id) {
          this.off('load:success', checkLoaded)
          this.off('load:error', checkLoaded)
          const registration = this.loaders.get(id)
          resolve(registration?.result || null)
        }
      }
      
      this.on('load:success', checkLoaded)
      this.on('load:error', checkLoaded)
    })
  }
  
  /**
   * 处理队列
   */
  private processQueue(): void {
    while (this.loadQueue.length > 0 && this.activeLoads < this.maxConcurrent) {
      const id = this.loadQueue.shift()!
      const registration = this.loaders.get(id)
      
      if (registration && !registration.loaded && !registration.loading) {
        this.executeLoad(registration)
      }
    }
  }
  
  /**
   * 批量加载
   */
  async loadBatch(ids: string[]): Promise<Array<any | null>> {
    // 按优先级排序
    const sorted = ids
      .map(id => ({
        id,
        priority: this.loaders.get(id)?.options.priority || 0
      }))
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.id)
    
    return Promise.all(sorted.map(id => this.load(id)))
  }
  
  /**
   * 预加载
   */
  async preload(ids: string[]): Promise<void> {
    // 低优先级后台加载
    const lowPriorityIds = ids.map(id => {
      const registration = this.loaders.get(id)
      if (registration) {
        registration.options.priority = -1
      }
      return id
    })
    
    // 不等待结果
    this.loadBatch(lowPriorityIds).catch(error => {
      console.warn('Preload failed:', error)
    })
  }
  
  /**
   * 卸载资源
   */
  unload(id: string): void {
    const registration = this.loaders.get(id)
    
    if (registration) {
      registration.loaded = false
      registration.result = undefined
      this.loadedFeatures.delete(id)
      this.emit('load:unloaded', { id })
    }
  }
  
  /**
   * 获取加载统计
   */
  getStats(): {
    total: number
    loaded: number
    loading: number
    queued: number
    failed: number
  } {
    const all = Array.from(this.loaders.values())
    
    return {
      total: all.length,
      loaded: all.filter(l => l.loaded).length,
      loading: all.filter(l => l.loading).length,
      queued: this.loadQueue.length,
      failed: all.filter(l => l.error).length
    }
  }
  
  /**
   * 获取加载时间统计
   */
  getLoadTimes(): Array<{ id: string; time: number }> {
    return Array.from(this.loaders.values())
      .filter(l => l.loadTime !== undefined)
      .map(l => ({ id: l.id, time: l.loadTime! }))
      .sort((a, b) => b.time - a.time)
  }
  
  /**
   * 清理
   */
  destroy(): void {
    this.loaders.clear()
    this.loadQueue = []
    this.loadedFeatures.clear()
    this.removeAllListeners()
  }
}

// 全局单例
let globalLoader: LazyLoader | null = null

/**
 * 获取全局懒加载管理器
 */
export function getLazyLoader(): LazyLoader {
  if (!globalLoader) {
    globalLoader = new LazyLoader()
  }
  return globalLoader
}

/**
 * 重置全局懒加载管理器
 */
export function resetLazyLoader(): void {
  if (globalLoader) {
    globalLoader.destroy()
    globalLoader = null
  }
}




