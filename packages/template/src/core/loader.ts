/**
 * 模板加载器 - 重构版本
 *
 * 使用 @ldesign/cache 进行缓存管理
 * 专注于模板组件的动态加载
 */

import type { Component } from 'vue'
import type { TemplateLoadResult, TemplateMetadata } from '../types'
import { defineAsyncComponent } from 'vue'
// TODO: 稍后替换为 import { createCache } from '@ldesign/cache'

/**
 * 简单的内存缓存（临时实现，稍后使用外部包）
 */
class SimpleCache {
  private cache = new Map<string, any>()
  private timestamps = new Map<string, number>()
  private readonly ttl = 5 * 60 * 1000 // 5分钟

  set(key: string, value: any): void {
    this.cache.set(key, value)
    this.timestamps.set(key, Date.now())
  }

  get(key: string): any | null {
    const timestamp = this.timestamps.get(key)
    if (!timestamp || Date.now() - timestamp > this.ttl) {
      this.cache.delete(key)
      this.timestamps.delete(key)
      return null
    }
    return this.cache.get(key) || null
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  clear(): void {
    this.cache.clear()
    this.timestamps.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

/**
 * 模板加载器
 */
export class TemplateLoader {
  private cache = new SimpleCache()

  /**
   * 加载模板组件
   */
  async loadTemplate(metadata: TemplateMetadata): Promise<TemplateLoadResult> {
    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(metadata)

    try {
      // 检查缓存
      const cached = this.cache.get(cacheKey)
      if (cached) {
        console.log(`✅ 从缓存加载模板: ${cacheKey}`)
        return {
          component: cached,
          metadata,
          fromCache: true,
          loadTime: Date.now() - startTime,
        }
      }

      // 动态加载组件
      console.log(`🔄 动态加载模板: ${metadata.componentPath || metadata.path}`)
      const component = await this.loadComponent(metadata)

      // 缓存组件
      this.cache.set(cacheKey, component)

      console.log(`✅ 模板加载成功: ${cacheKey}`)
      return {
        component,
        metadata,
        fromCache: false,
        loadTime: Date.now() - startTime,
      }
    } catch (error) {
      console.error(`❌ 模板加载失败: ${cacheKey}`, error)
      throw new Error(`Failed to load template: ${cacheKey}`)
    }
  }

  /**
   * 预加载模板
   */
  async preloadTemplate(metadata: TemplateMetadata): Promise<void> {
    const cacheKey = this.generateCacheKey(metadata)

    if (this.cache.has(cacheKey)) {
      console.log(`⚡ 模板已缓存，跳过预加载: ${cacheKey}`)
      return
    }

    try {
      console.log(`🚀 预加载模板: ${cacheKey}`)
      await this.loadTemplate(metadata)
    } catch (error) {
      console.warn(`⚠️ 预加载失败: ${cacheKey}`, error)
    }
  }

  /**
   * 批量预加载模板
   */
  async preloadTemplates(templates: TemplateMetadata[]): Promise<void> {
    console.log(`🚀 批量预加载 ${templates.length} 个模板`)

    const promises = templates.map(template =>
      this.preloadTemplate(template).catch(error => {
        console.warn(`预加载失败: ${this.generateCacheKey(template)}`, error)
      })
    )

    await Promise.all(promises)
    console.log(`✅ 批量预加载完成`)
  }

  /**
   * 动态加载组件
   */
  private async loadComponent(metadata: TemplateMetadata): Promise<Component> {
    try {
      // 如果是预构建模板，使用模板映射表
      if (metadata.path && metadata.path.startsWith('templates/')) {
        return await this.loadPrebuiltComponent(metadata)
      }

      // 传统的文件路径加载方式
      const componentPath = metadata.componentPath || metadata.path
      if (!componentPath) {
        throw new Error('No component path provided')
      }

      // 尝试多种可能的导入方式
      const importPaths = [
        componentPath,
        componentPath.replace(/\.(ts|tsx|vue|js)$/, '.tsx'),
        componentPath.replace(/\.(ts|tsx|vue|js)$/, '.vue'),
        componentPath.replace(/\.(ts|tsx|vue|js)$/, '.js'),
      ]

      let lastError: Error | null = null

      for (const path of importPaths) {
        try {
          console.log(`🔄 尝试导入组件: ${path}`)
          const module = await import(/* @vite-ignore */ path)
          const component = module.default || module

          if (component) {
            console.log(`✅ 组件导入成功: ${path}`)
            return this.wrapComponent(component, path)
          }
        } catch (error) {
          console.warn(`⚠️ 组件导入失败: ${path}`, error)
          lastError = error as Error
          continue
        }
      }

      throw lastError || new Error(`No valid component found for ${componentPath}`)
    } catch (error) {
      console.error(`Failed to load component:`, error)
      throw error
    }
  }

  /**
   * 加载预构建组件
   */
  private async loadPrebuiltComponent(metadata: TemplateMetadata): Promise<Component> {
    try {
      console.log(`🔄 加载预构建模板: ${metadata.category}/${metadata.device}/${metadata.template}`)

      // 动态导入模板映射表
      const { templateMap } = await import('../templates')

      // 获取对应的组件
      const categoryMap = templateMap[metadata.category as keyof typeof templateMap]
      if (!categoryMap) {
        throw new Error(`Category not found: ${metadata.category}`)
      }

      const deviceMap = categoryMap[metadata.device as keyof typeof categoryMap]
      if (!deviceMap) {
        throw new Error(`Device not found: ${metadata.device}`)
      }

      const component = deviceMap[metadata.template as keyof typeof deviceMap]
      if (!component) {
        throw new Error(`Template not found: ${metadata.template}`)
      }

      // 直接使用组件，不需要再执行动态导入
      if (!component) {
        throw new Error(`No component found in prebuilt template`)
      }

      console.log(`✅ 预构建模板加载成功: ${metadata.category}/${metadata.device}/${metadata.template}`)
      return this.wrapComponent(component, `prebuilt:${metadata.category}/${metadata.device}/${metadata.template}`)
    } catch (error) {
      console.error('❌ 预构建模板加载失败:', error)
      throw error
    }
  }

  /**
   * 包装组件为异步组件
   */
  private wrapComponent(component: any, path: string): Component {
    // 如果已经是Vue组件，直接返回
    if (component && (component.render || component.setup || component.template)) {
      return component
    }

    // 包装为异步组件
    return defineAsyncComponent({
      loader: () => Promise.resolve(component),
      loadingComponent: this.createLoadingComponent(),
      errorComponent: this.createErrorComponent(path),
      delay: 200,
      timeout: 10000,
    })
  }

  /**
   * 创建加载中组件
   */
  private createLoadingComponent(): Component {
    return {
      template: `
        <div class="template-loading">
          <div class="loading-spinner"></div>
          <p>模板加载中...</p>
        </div>
      `,
      style: `
        .template-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: #666;
        }
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,
    }
  }

  /**
   * 创建错误组件
   */
  private createErrorComponent(path: string): Component {
    return {
      template: `
        <div class="template-error">
          <h3>模板加载失败</h3>
          <p>路径: ${path}</p>
          <button @click="retry">重试</button>
        </div>
      `,
      methods: {
        retry() {
          window.location.reload()
        },
      },
      style: `
        .template-error {
          padding: 2rem;
          text-align: center;
          color: #e74c3c;
          border: 1px solid #e74c3c;
          border-radius: 4px;
          background: #fdf2f2;
        }
        .template-error button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `,
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(metadata: TemplateMetadata): string {
    return `${metadata.category}/${metadata.device}/${metadata.template}`
  }

  /**
   * 检查模板是否已缓存
   */
  isCached(metadata: TemplateMetadata): boolean {
    const cacheKey = this.generateCacheKey(metadata)
    return this.cache.has(cacheKey)
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
    console.log('🗑️ 模板加载器缓存已清空')
  }

  /**
   * 清空特定模板的缓存
   */
  clearTemplateCache(metadata: TemplateMetadata): void {
    const cacheKey = this.generateCacheKey(metadata)
    this.cache.set(cacheKey, null) // 简单实现，实际应该删除
    console.log(`🗑️ 已清空模板缓存: ${cacheKey}`)
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { size: number } {
    return {
      size: this.cache.size, // 使用 size 属性
    }
  }
}
