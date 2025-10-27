/**
 * Vue 模板管理器
 * 继承自核心 TemplateManager，提供 Vue 特定功能
 */

import { TemplateManager } from '@ldesign/template-core'
import type { 
  TemplateScanResult, 
  TemplateMetadata,
  TemplateLoadOptions 
} from '@ldesign/template-core'
import type { Component } from 'vue'
import { defineAsyncComponent, markRaw } from 'vue'

/**
 * Vue 模板管理器
 */
export class VueTemplateManager extends TemplateManager {
  private templateModules: Record<string, () => Promise<any>> = {}

  constructor(options = {}) {
    super(options)
    this.scanTemplates()
  }

  /**
   * 扫描Vue模板
   */
  protected async scan(): Promise<TemplateScanResult> {
    // 使用 import.meta.glob 扫描所有模板
    const modules = import.meta.glob('../templates/**/*.vue', {
      import: 'default',
      eager: false,
    })

    const templates: TemplateMetadata[] = []
    const byCategory: Record<string, TemplateMetadata[]> = {}
    const byDevice: Record<string, TemplateMetadata[]> = {}

    for (const path in modules) {
      // 解析路径获取模板信息
      const match = path.match(/templates\/(.+)\/(.+)\/(.+)\/index\.vue$/)
      if (!match) continue

      const [, category, device, name] = match
      
      // 尝试导入配置文件
      let config: any = {}
      try {
        const configPath = path.replace('index.vue', 'config.ts')
        const configModule = await import(/* @vite-ignore */ configPath)
        config = configModule.default || {}
      } catch {
        // 配置文件可选
      }

      const metadata: TemplateMetadata = {
        name,
        displayName: config.displayName || name,
        description: config.description,
        category,
        device: device as any,
        version: config.version || '1.0.0',
        author: config.author,
        tags: config.tags,
        isDefault: config.isDefault,
        path,
        ...config.metadata,
      }

      templates.push(metadata)
      
      // 按分类分组
      if (!byCategory[category]) {
        byCategory[category] = []
      }
      byCategory[category].push(metadata)
      
      // 按设备分组
      if (!byDevice[device]) {
        byDevice[device] = []
      }
      byDevice[device].push(metadata)

      // 存储模块加载器
      this.templateModules[`${category}/${device}/${name}`] = modules[path] as () => Promise<any>
    }

    return {
      count: templates.length,
      templates,
      byCategory,
      byDevice,
      scanTime: Date.now(),
    }
  }

  /**
   * 扫描模板（初始化时调用）
   */
  private async scanTemplates() {
    try {
      await this.initialize()
    } catch (error) {
      console.error('[VueTemplateManager] 初始化失败:', error)
    }
  }

  /**
   * 加载Vue模板组件
   */
  async loadTemplate(
    category: string,
    device: string,
    name: string,
    options?: TemplateLoadOptions
  ): Promise<Component> {
    const key = `${category}/${device}/${name}`
    
    // 检查缓存
    const registryItem = this.registry.get(key)
    if (registryItem?.loaded && registryItem.component && options?.cache !== false) {
      registryItem.useCount++
      return registryItem.component
    }

    // 获取加载器
    const loader = this.templateModules[key]
    if (!loader) {
      throw new Error(`模板不存在: ${key}`)
    }

    try {
      // 创建异步组件
      const asyncComponent = defineAsyncComponent({
        loader,
        loadingComponent: options?.loadingComponent,
        errorComponent: options?.errorComponent,
        delay: options?.delay || 200,
        timeout: options?.timeout || 30000,
        suspensible: options?.suspensible !== false,
        onError: (error, retry, fail, attempts) => {
          if (options?.onError) {
            options.onError(error)
          }
          
          if (attempts <= (options?.retryCount || 3)) {
            retry()
          } else {
            fail()
          }
        },
      })

      // 标记为非响应式
      const component = markRaw(asyncComponent)

      // 更新注册表
      if (registryItem) {
        registryItem.component = component
        registryItem.loaded = true
        registryItem.loadedAt = Date.now()
        registryItem.useCount++
      }

      return component
    } catch (error) {
      console.error(`[VueTemplateManager] 加载模板失败: ${key}`, error)
      throw error
    }
  }

  /**
   * 预加载Vue模板
   */
  async preloadVueTemplate(
    category: string,
    device: string,
    name: string
  ): Promise<void> {
    const key = `${category}/${device}/${name}`
    const loader = this.templateModules[key]
    
    if (!loader) {
      throw new Error(`模板不存在: ${key}`)
    }

    try {
      const module = await loader()
      const registryItem = this.registry.get(key)
      
      if (registryItem) {
        registryItem.component = markRaw(module)
        registryItem.loaded = true
        registryItem.loadedAt = Date.now()
      }
    } catch (error) {
      console.error(`[VueTemplateManager] 预加载失败: ${key}`, error)
      throw error
    }
  }

  /**
   * 获取Vue组件
   */
  getComponent(category: string, device: string, name: string): Component | null {
    const key = `${category}/${device}/${name}`
    const registryItem = this.registry.get(key)
    return registryItem?.component || null
  }

  /**
   * 清除组件缓存
   */
  clearComponentCache(category?: string, device?: string, name?: string): void {
    if (category && device && name) {
      // 清除特定组件
      const key = `${category}/${device}/${name}`
      const item = this.registry.get(key)
      if (item) {
        item.component = undefined
        item.loaded = false
        item.loadedAt = undefined
      }
    } else {
      // 清除所有组件
      for (const item of this.registry.values()) {
        item.component = undefined
        item.loaded = false
        item.loadedAt = undefined
      }
    }
  }
}

// 单例实例
let instance: VueTemplateManager | null = null

/**
 * 获取Vue模板管理器实例
 */
export function getVueTemplateManager(options?: any): VueTemplateManager {
  if (!instance) {
    instance = new VueTemplateManager(options)
  }
  return instance
}

/**
 * 创建新的Vue模板管理器实例
 */
export function createVueTemplateManager(options?: any): VueTemplateManager {
  return new VueTemplateManager(options)
}

export default VueTemplateManager
