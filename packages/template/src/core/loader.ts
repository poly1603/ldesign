/**
 * 模板加载器
 * 
 * 基于 ComponentLoader 的模板加载器，提供缓存和预加载功能
 */

import type { TemplateInfo, TemplateMetadata, LoadResult } from '../types'
import type { Component } from 'vue'
import { ComponentLoader } from '../utils/loader'
import { componentCache } from '../utils/cache'

/**
 * 模板加载器配置
 */
export interface TemplateLoaderConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 缓存策略 */
  strategy?: 'lru' | 'lfu' | 'fifo' | 'ttl'
  /** 最大缓存大小 */
  maxSize?: number
  /** TTL（毫秒） */
  ttl?: number
  /** 检查周期（毫秒） */
  checkPeriod?: number
  /** 是否启用压缩 */
  enableCompression?: boolean
  /** 是否启用持久化 */
  enablePersistence?: boolean
  /** 持久化键 */
  persistenceKey?: string
}

/**
 * 模板加载器类
 */
export class TemplateLoader {
  private componentLoader: ComponentLoader
  private config: Required<TemplateLoaderConfig>

  constructor(config: TemplateLoaderConfig = {}) {
    this.config = {
      enabled: true,
      strategy: 'lru',
      maxSize: 50,
      ttl: 0,
      checkPeriod: 5 * 60 * 1000,
      enableCompression: false,
      enablePersistence: false,
      persistenceKey: 'template_cache',
      ...config,
    }

    this.componentLoader = new ComponentLoader({
      enableCache: this.config.enabled,
      timeout: 10000,
      retryCount: 3,
      retryDelay: 1000,
    })
  }

  /**
   * 加载模板
   */
  async load(template: TemplateInfo): Promise<LoadResult<Component>> {
    const startTime = Date.now()
    
    try {
      // 转换 TemplateInfo 为 TemplateMetadata
      const metadata: TemplateMetadata = {
        name: template.name,
        displayName: (template as any).displayName || template.name,
        category: template.category,
        device: (template as any).device ?? (template as any).deviceType,
        description: template.metadata?.description || '',
        version: template.metadata?.version || '1.0.0',
        author: template.metadata?.author || '',
        tags: template.metadata?.tags || [],
        componentPath: (template as any).componentPath ?? template.templateFile?.path ?? '',
        configPath: (template as any).configPath ?? '',
        componentLoader: template.component ? () => Promise.resolve(template.component!) : undefined,
      }

      const result = await this.componentLoader.loadComponent(metadata)
      const duration = Date.now() - startTime

      return {
        success: true,
        data: result.component,
        duration,
        fromCache: result.fromCache,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      return {
        success: false,
        error: error as Error,
        duration,
        fromCache: false,
      }
    }
  }

  /**
   * 预加载模板列表
   */
  async preload(templates: TemplateInfo[]): Promise<void> {
    const metadataList: TemplateMetadata[] = templates.map(template => ({
      name: template.name,
      displayName: (template as any).displayName || template.name,
      category: template.category,
      device: (template as any).device ?? (template as any).deviceType,
      description: template.metadata?.description || '',
      version: template.metadata?.version || '1.0.0',
      author: template.metadata?.author || '',
      tags: template.metadata?.tags || [],
      componentPath: (template as any).componentPath ?? template.templateFile?.path ?? '',
      configPath: (template as any).configPath ?? '',
      componentLoader: template.component ? () => Promise.resolve(template.component!) : undefined,
    }))

    await this.componentLoader.preloadComponents(metadataList)
  }

  /**
   * 清除缓存
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      // 如果有模式，需要实现模式匹配清除
      // 这里简化处理，直接清除所有缓存
      componentCache.clear()
    } else {
      componentCache.clear()
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<TemplateLoaderConfig>): void {
    this.config = { ...this.config, ...config }
    
    // 重新创建 ComponentLoader 以应用新配置
    this.componentLoader = new ComponentLoader({
      enableCache: this.config.enabled,
      timeout: 10000,
      retryCount: 3,
      retryDelay: 1000,
    })
  }

  /**
   * 销毁加载器
   */
  destroy(): void {
    this.componentLoader.clearLoadingPromises()
    componentCache.clear()
  }

  /**
   * 获取加载统计信息
   */
  getStats() {
    return this.componentLoader.getLoadingStats()
  }
}
