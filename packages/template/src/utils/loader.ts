/**
 * 动态加载器工具
 *
 * 提供模板组件的动态加载功能
 */

import type { TemplateMetadata } from '../types/template'
import { type AsyncComponentLoader, type Component, defineAsyncComponent } from 'vue'
import { componentCache } from './cache'

/**
 * 加载优先级
 */
export enum LoadPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * 加载器配置选项
 */
interface LoaderOptions {
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 加载超时时间（毫秒） */
  timeout?: number
  /** 重试次数 */
  retryCount?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 是否显示加载状态 */
  showLoading?: boolean
  /** 自定义加载组件 */
  loadingComponent?: Component | null
  /** 自定义错误组件 */
  errorComponent?: Component | null
  /** 最大并发加载数 */
  maxConcurrent?: number
  /** 是否启用请求去重 */
  enableDeduplication?: boolean
  /** 默认优先级 */
  defaultPriority?: LoadPriority
}

/**
 * 加载结果接口
 */
interface LoadResult {
  /** 加载的组件 */
  component: Component
  /** 是否来自缓存 */
  fromCache: boolean
  /** 加载耗时（毫秒） */
  loadTime: number
}

/**
 * 加载任务接口
 */
interface LoadTask {
  metadata: TemplateMetadata
  priority: LoadPriority
  resolve: (component: Component) => void
  reject: (error: Error) => void
  startTime: number
}

/**
 * 动态组件加载器
 * 
 * 性能优化：
 * - 并发加载控制
 * - 请求去重机制
 * - 优先级队列
 * - 智能重试策略
 * - 性能监控
 */
export class ComponentLoader {
  private options: Required<LoaderOptions> & { maxConcurrent: number; enableDeduplication: boolean; defaultPriority: LoadPriority }
  private loadingPromises = new Map<string, Promise<Component>>()
  private activeLoads = new Set<string>()
  private loadQueue: LoadTask[] = []
  private loadStats = {
    total: 0,
    success: 0,
    failed: 0,
    cached: 0,
    totalLoadTime: 0,
  }

  constructor(options: LoaderOptions = {}) {
    this.options = {
      enableCache: true,
      timeout: 10000,
      retryCount: 3,
      retryDelay: 1000,
      showLoading: true,
      loadingComponent: null,
      errorComponent: null,
      maxConcurrent: 3,
      enableDeduplication: true,
      defaultPriority: LoadPriority.NORMAL,
      ...options,
    }
  }

  /**
   * 加载模板组件（带优先级）
   */
  async loadComponent(
    metadata: TemplateMetadata,
    priority: LoadPriority = this.options.defaultPriority
  ): Promise<LoadResult> {
    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(metadata)
    
    this.loadStats.total++

    // 检查缓存
    if (this.options.enableCache) {
      const cachedComponent = componentCache.getComponent(
        metadata.category,
        metadata.device,
        metadata.name,
      )
      if (cachedComponent) {
        this.loadStats.cached++
        return {
          component: cachedComponent,
          fromCache: true,
          loadTime: Date.now() - startTime,
        }
      }
    }

    // 请求去重：检查是否正在加载
    if (this.options.enableDeduplication) {
      const existingPromise = this.loadingPromises.get(cacheKey)
      if (existingPromise) {
        const component = await existingPromise
        return {
          component,
          fromCache: false,
          loadTime: Date.now() - startTime,
        }
      }
    }

    // 创建加载Promise
    const loadPromise = this.createPriorityLoadPromise(metadata, priority)
    this.loadingPromises.set(cacheKey, loadPromise)

    try {
      const component = await loadPromise

      // 缓存组件
      if (this.options.enableCache) {
        componentCache.cacheComponent(
          metadata.category,
          metadata.device,
          metadata.name,
          component,
        )
      }
      
      const loadTime = Date.now() - startTime
      this.loadStats.success++
      this.loadStats.totalLoadTime += loadTime

      return {
        component,
        fromCache: false,
        loadTime,
      }
    } catch (error) {
      this.loadStats.failed++
      throw error
    } finally {
      this.loadingPromises.delete(cacheKey)
    }
  }

  /**
   * 创建带优先级的加载 Promise
   */
  private createPriorityLoadPromise(
    metadata: TemplateMetadata,
    priority: LoadPriority
  ): Promise<Component> {
    return new Promise((resolve, reject) => {
      const task: LoadTask = {
        metadata,
        priority,
        resolve,
        reject,
        startTime: Date.now(),
      }

      // 添加到队列
      this.loadQueue.push(task)
      
      // 按优先级排序
      this.loadQueue.sort((a, b) => b.priority - a.priority)

      // 尝试处理队列
      this.processQueue()
    })
  }

  /**
   * 处理加载队列
   */
  private processQueue(): void {
    // 检查并发限制
    while (
      this.activeLoads.size < this.options.maxConcurrent &&
      this.loadQueue.length > 0
    ) {
      const task = this.loadQueue.shift()
      if (!task) break

      const cacheKey = this.generateCacheKey(task.metadata)
      this.activeLoads.add(cacheKey)

      // 执行加载
      this.loadComponentWithRetry(task.metadata)
        .then((component) => {
          task.resolve(component)
        })
        .catch((error) => {
          task.reject(error)
        })
        .finally(() => {
          this.activeLoads.delete(cacheKey)
          // 继续处理队列
          this.processQueue()
        })
    }
  }

  /**
   * 创建异步组件
   */
  createAsyncComponent(metadata: TemplateMetadata): Component {
    const loader: AsyncComponentLoader = () => this.loadComponentWithRetry(metadata)

    const options: any = {
      loader,
      delay: 200,
      timeout: this.options.timeout,
      suspensible: false,
    }
    if (this.options.loadingComponent)
      options.loadingComponent = this.options.loadingComponent
    if (this.options.errorComponent)
      options.errorComponent = this.options.errorComponent
    return defineAsyncComponent(options)
  }

  /**
   * 预加载组件
   */
  async preloadComponent(metadata: TemplateMetadata): Promise<void> {
    try {
      await this.loadComponent(metadata)
    }
    catch (error) {
      console.warn(`Failed to preload component: ${metadata.name}`, error)
    }
  }

  /**
   * 批量预加载组件
   */
  async preloadComponents(metadataList: TemplateMetadata[]): Promise<void> {
    const promises = metadataList.map(metadata => this.preloadComponent(metadata))
    await Promise.allSettled(promises)
  }

  /**
   * 创建加载Promise
   */
  private createLoadPromise(metadata: TemplateMetadata): Promise<Component> {
    return this.loadComponentWithRetry(metadata)
  }

  /**
   * 带重试的组件加载
   */
  private async loadComponentWithRetry(metadata: TemplateMetadata): Promise<Component> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.options.retryCount; attempt++) {
      try {
        return await this.loadComponentFromMetadata(metadata)
      }
      catch (error) {
        lastError = error as Error

        if (attempt < this.options.retryCount) {
          await this.delay(this.options.retryDelay * (attempt + 1))
        }
      }
    }

    throw new Error(`Failed to load component after ${this.options.retryCount + 1} attempts: ${lastError?.message}`)
  }

  /**
   * 从模板元数据加载组件
   */
  private async loadComponentFromMetadata(metadata: TemplateMetadata): Promise<Component> {
    try {
      // 优先使用 componentLoader 函数（用于内置模板）
      if (metadata.componentLoader) {
        const component = await metadata.componentLoader()
        if (!component) {
          throw new Error(`No component returned by componentLoader for ${metadata.name}`)
        }
        return component
      }

      // 回退到路径导入（用于用户自定义模板）
      if (metadata.componentPath) {
        const module = await import(/* @vite-ignore */ metadata.componentPath)
        const component = module.default || module

        if (!component) {
          throw new Error(`No default export found in ${metadata.componentPath}`)
        }

        return component
      }

      throw new Error(`No component loader or path found for template: ${metadata.name}`)
    }
    catch (error) {
      throw new Error(`Failed to load component for ${metadata.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(metadata: TemplateMetadata): string {
    return `${metadata.category}:${metadata.device}:${metadata.name}`
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 清除加载中的Promise
   */
  clearLoadingPromises(): void {
    this.loadingPromises.clear()
  }

  /**
   * 获取加载统计信息
   */
  getLoadingStats() {
    const avgLoadTime = this.loadStats.success > 0
      ? this.loadStats.totalLoadTime / this.loadStats.success
      : 0

    return {
      activeLoading: this.loadingPromises.size,
      queuedTasks: this.loadQueue.length,
      activeLoads: this.activeLoads.size,
      stats: {
        ...this.loadStats,
        avgLoadTime,
        successRate:
          this.loadStats.total > 0
            ? (this.loadStats.success / this.loadStats.total) * 100
            : 0,
        cacheHitRate:
          this.loadStats.total > 0
            ? (this.loadStats.cached / this.loadStats.total) * 100
            : 0,
      },
      cacheStats: componentCache.getStats(),
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.loadStats = {
      total: 0,
      success: 0,
      failed: 0,
      cached: 0,
      totalLoadTime: 0,
    }
  }

  /**
   * 获取当前负载情况
   */
  getLoadInfo() {
    return {
      concurrency: {
        current: this.activeLoads.size,
        max: this.options.maxConcurrent,
        utilization:
          (this.activeLoads.size / this.options.maxConcurrent) * 100,
      },
      queue: {
        length: this.loadQueue.length,
        priorities: this.loadQueue.reduce(
          (acc, task) => {
            acc[LoadPriority[task.priority]] =
              (acc[LoadPriority[task.priority]] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        ),
      },
    }
  }
}

/**
 * 全局组件加载器实例
 */
export const componentLoader = new ComponentLoader()

/**
 * 加载器工具函数
 */
export const loaderUtils = {
  /**
   * 快速加载组件
   */
  async loadComponent(metadata: TemplateMetadata): Promise<Component> {
    const result = await componentLoader.loadComponent(metadata)
    return result.component
  },

  /**
   * 创建异步组件
   */
  createAsyncComponent(metadata: TemplateMetadata): Component {
    return componentLoader.createAsyncComponent(metadata)
  },

  /**
   * 预加载组件列表
   */
  async preloadComponents(metadataList: TemplateMetadata[]): Promise<void> {
    await componentLoader.preloadComponents(metadataList)
  },

  /**
   * 清除所有加载状态
   */
  clearAll(): void {
    componentLoader.clearLoadingPromises()
    componentCache.clear()
  },
}
