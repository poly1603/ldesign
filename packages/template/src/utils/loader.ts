/**
 * 动态加载器工具
 *
 * 提供模板组件的动态加载功能
 */

import type { TemplateMetadata } from '../types/template'
import { type AsyncComponentLoader, type Component, defineAsyncComponent } from 'vue'
import { componentCache } from './cache'

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
 * 动态组件加载器
 */
export class ComponentLoader {
  private options: Required<LoaderOptions>
  private loadingPromises = new Map<string, Promise<Component>>()

  constructor(options: LoaderOptions = {}) {
    this.options = {
      enableCache: true,
      timeout: 10000,
      retryCount: 3,
      retryDelay: 1000,
      showLoading: true,
      loadingComponent: null,
      errorComponent: null,
      ...options,
    }
  }

  /**
   * 加载模板组件
   */
  async loadComponent(metadata: TemplateMetadata): Promise<LoadResult> {
    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(metadata)

    // 检查缓存
    if (this.options.enableCache) {
      const cachedComponent = componentCache.getComponent(
        metadata.category,
        metadata.device,
        metadata.name,
      )
      if (cachedComponent) {
        return {
          component: cachedComponent,
          fromCache: true,
          loadTime: Date.now() - startTime,
        }
      }
    }

    // 检查是否正在加载
    const existingPromise = this.loadingPromises.get(cacheKey)
    if (existingPromise) {
      const component = await existingPromise
      return {
        component,
        fromCache: false,
        loadTime: Date.now() - startTime,
      }
    }

    // 创建加载Promise
    const loadPromise = this.createLoadPromise(metadata)
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

      return {
        component,
        fromCache: false,
        loadTime: Date.now() - startTime,
      }
    }
    finally {
      this.loadingPromises.delete(cacheKey)
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
    return {
      activeLoading: this.loadingPromises.size,
      cacheStats: componentCache.getStats(),
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
