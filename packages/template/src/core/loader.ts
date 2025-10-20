/**
 * 模板加载器 - 动态加载模板组件
 */

import type { Component } from 'vue'
import type { TemplateFilter, TemplateLoadOptions, TemplateMetadata } from '../types'
import { getScanner } from './scanner'
import { loadComponentStyle } from './style-loader'

/**
 * 模板加载器类 - 内存优化版本
 */
export class TemplateLoader {
  // 使用 WeakRef 存储组件，允许垃圾回收
  private loadedComponents: Map<string, WeakRef<Component>> = new Map()
  // 加载中的 Promise 缓存，完成后立即清理
  private loadingPromises: Map<string, Promise<Component>> = new Map()
  // FinalizationRegistry 自动清理已回收的组件
  private componentRegistry = new FinalizationRegistry((key: string) => {
    // 自动清理已被垃圾回收的组件引用
    this.loadedComponents.delete(key)
  })
  // 预编译的键生成函数，避免重复字符串拼接
  private static createKey = (category: string, device: string, name: string): string => 
    `${category}/${device}/${name}`

  /**
   * 加载模板组件
   */
  async load(
    category: string,
    device: string,
    name: string,
    options?: TemplateLoadOptions
  ): Promise<Component> {
    const key = TemplateLoader.createKey(category, device, name)

    // 检查缓存 - 优化查找逻辑
    const weakRef = this.loadedComponents.get(key)
    if (weakRef) {
      const cached = weakRef.deref()
      if (cached) {
        options?.onLoad?.(cached)
        return cached
      }
      // 组件已被垃圾回收，清理引用
      this.loadedComponents.delete(key)
    }

    // 检查是否正在加载 - 简化逻辑
    const pending = this.loadingPromises.get(key)
    if (pending) return pending

    // 从注册表获取模板
    const scanner = getScanner()
    const template = scanner.getTemplate(category, device, name)

    if (!template) {
      const error = new Error(`模板未找到: ${key}`)
      options?.onError?.(error)
      throw error
    }

    // 加载组件样式
    loadComponentStyle(category, device, name, template.componentPath)

    // 创建加载 Promise
    const loadPromise = this._loadWithOptions(template.loader, key, options)
    this.loadingPromises.set(key, loadPromise)

    try {
      const component = await loadPromise
      // 使用WeakRef存储组件，允许垃圾回收
      const weakRef = new WeakRef(component)
      this.loadedComponents.set(key, weakRef)
      this.componentRegistry.register(component, key)
      this.loadingPromises.delete(key)
      options?.onLoad?.(component)
      return component
    } catch (error) {
      this.loadingPromises.delete(key)
      options?.onError?.(error as Error)
      throw error
    }
  }

  /**
   * 带选项的加载
   */
  private async _loadWithOptions(
    loader: () => Promise<Component>,
    key: string,
    options?: TemplateLoadOptions
  ): Promise<Component> {
    // 处理超时
    if (options?.timeout) {
      return Promise.race([
        loader(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`加载超时: ${key}`)), options.timeout)
        ),
      ])
    }

    return loader()
  }

  /**
   * 预加载模板
   */
  async preload(category: string, device: string, name: string): Promise<void> {
    try {
      await this.load(category, device, name, { preload: true })
    } catch (error) {
      console.warn(`[TemplateLoader] 预加载失败: ${category}/${device}/${name}`, error)
    }
  }

  /**
   * 批量预加载模板
   */
  async preloadBatch(templates: Array<{ category: string; device: string; name: string }>): Promise<void> {
    await Promise.allSettled(
      templates.map(t => this.preload(t.category, t.device, t.name))
    )
  }

  /**
   * 根据过滤条件预加载模板
   */
  async preloadByFilter(filter: TemplateFilter): Promise<void> {
    const scanner = getScanner()
    const allMetadata = scanner.getAllMetadata()
    
    const filtered = this.filterTemplates(allMetadata, filter)
    await this.preloadBatch(filtered)
  }

  /**
   * 过滤模板 - 内存优化版本
   */
  private filterTemplates(templates: TemplateMetadata[], filter: TemplateFilter): TemplateMetadata[] {
    // 预处理过滤条件，避免在循环中重复处理
    const categorySet = filter.category ? 
      new Set(Array.isArray(filter.category) ? filter.category : [filter.category]) : null
    const deviceSet = filter.device ? 
      new Set(Array.isArray(filter.device) ? filter.device : [filter.device]) : null
    const nameSet = filter.name ? 
      new Set(Array.isArray(filter.name) ? filter.name : [filter.name]) : null
    const tagsArray = filter.tags ? 
      (Array.isArray(filter.tags) ? filter.tags : [filter.tags]) : null

    return templates.filter(t => {
      // 使用 Set 进行 O(1) 查找
      if (categorySet && !categorySet.has(t.category)) return false
      if (deviceSet && !deviceSet.has(t.device)) return false
      if (nameSet && !nameSet.has(t.name)) return false
      if (tagsArray && (!t.tags || !tagsArray.some(tag => t.tags!.includes(tag)))) return false
      if (filter.defaultOnly && !t.isDefault) return false
      return true
    })
  }

  /**
   * 清除缓存 - 优化版本
   */
  clearCache(category?: string, device?: string, name?: string): void {
    if (category && device && name) {
      const key = TemplateLoader.createKey(category, device, name)
      this.loadedComponents.delete(key)
      this.loadingPromises.delete(key) // 同时清理加载中的 Promise
    } else {
      this.loadedComponents.clear()
      this.loadingPromises.clear() // 清理所有加载中的 Promise
    }
  }

  /**
   * 获取已加载的组件数量
   */
  getLoadedCount(): number {
    return this.loadedComponents.size
  }

  /**
   * 获取正在加载的组件数量
   */
  getLoadingCount(): number {
    return this.loadingPromises.size
  }
}

/**
 * 全局加载器实例
 */
let globalLoader: TemplateLoader | null = null

/**
 * 获取全局加载器实例
 */
export function getLoader(): TemplateLoader {
  if (!globalLoader) {
    globalLoader = new TemplateLoader()
  }
  return globalLoader
}

/**
 * 加载模板（便捷方法）
 */
export async function loadTemplate(
  category: string,
  device: string,
  name: string,
  options?: TemplateLoadOptions
): Promise<Component> {
  const loader = getLoader()
  return loader.load(category, device, name, options)
}

/**
 * 预加载模板（便捷方法）
 */
export async function preloadTemplate(
  category: string,
  device: string,
  name: string
): Promise<void> {
  const loader = getLoader()
  return loader.preload(category, device, name)
}
