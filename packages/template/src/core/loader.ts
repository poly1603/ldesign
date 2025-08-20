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
      await this.loadTemplate(metadata)
    } catch (error) {
      // 预加载失败不影响主流程，静默处理
    }
  }

  /**
   * 批量预加载模板
   */
  async preloadTemplates(templates: TemplateMetadata[]): Promise<void> {
    const promises = templates.map(template =>
      this.preloadTemplate(template).catch(() => {
        // 预加载失败不影响主流程，静默处理
      })
    )

    await Promise.all(promises)
  }

  /**
   * 动态加载组件
   * 基于约定的路径自动加载模板组件
   */
  private async loadComponent(metadata: TemplateMetadata): Promise<Component> {
    try {
      // 基于约定生成组件路径
      const componentPath = this.generateComponentPath(metadata)

      console.log(`🔄 自动加载模板组件: ${metadata.category}/${metadata.device}/${metadata.template}`)
      console.log(`   组件路径: ${componentPath}`)

      // 尝试多种可能的文件扩展名
      const possiblePaths = [
        componentPath.replace(/\.(ts|tsx|vue|js)$/, '.tsx'),
        componentPath.replace(/\.(ts|tsx|vue|js)$/, '.ts'),
        componentPath.replace(/\.(ts|tsx|vue|js)$/, '.vue'),
        componentPath.replace(/\.(ts|tsx|vue|js)$/, '.js'),
      ]

      let lastError: Error | null = null

      for (const path of possiblePaths) {
        try {
          const module = await import(/* @vite-ignore */ path)
          const component = module.default || module

          if (component) {
            return this.wrapComponent(component, path)
          }
        } catch (error) {
          lastError = error as Error
          continue
        }
      }

      throw lastError || new Error(`无法找到模板组件: ${componentPath}`)
    } catch (error) {
      throw error
    }
  }

  /**
   * 基于约定生成组件路径
   * 约定：../templates/{category}/{device}/{template}/index.tsx
   */
  private generateComponentPath(metadata: TemplateMetadata): string {
    // 如果已经有路径，直接使用
    if (metadata.path) {
      return metadata.path
    }

    // 基于约定生成路径
    return `../templates/${metadata.category}/${metadata.device}/${metadata.template}/index.tsx`
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
