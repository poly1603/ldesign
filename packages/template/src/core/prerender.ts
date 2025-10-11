/**
 * 模板预渲染系统
 * 
 * 支持：SSR、静态生成、关键路径优化、首屏性能提升、SEO优化
 */

import { renderToString } from 'vue/server-renderer'
import { createSSRApp, type Component, type App } from 'vue'
import type { DeviceType } from '../types/template'
import type { Dictionary } from '../types/common'

/**
 * 预渲染模式
 */
export type PrerenderMode = 'ssr' | 'ssg' | 'hybrid'

/**
 * 预渲染策略
 */
export type PrerenderStrategy = 
  | 'eager'      // 立即预渲染
  | 'lazy'       // 延迟预渲染
  | 'on-demand'  // 按需预渲染
  | 'scheduled'  // 定时预渲染

/**
 * 预渲染优先级
 */
export type PrerenderPriority = 'low' | 'normal' | 'high' | 'critical'

/**
 * 预渲染配置
 */
export interface PrerenderConfig {
  /** 预渲染模式 */
  mode: PrerenderMode
  /** 预渲染策略 */
  strategy: PrerenderStrategy
  /** 是否启用 */
  enabled: boolean
  /** 是否缓存结果 */
  cache: boolean
  /** 缓存TTL（秒） */
  cacheTTL: number
  /** 最大并发数 */
  maxConcurrent: number
  /** 超时时间（毫秒） */
  timeout: number
  /** SSR配置 */
  ssr: {
    /** 是否启用流式渲染 */
    streaming: boolean
    /** 是否预取数据 */
    prefetch: boolean
    /** 是否内联关键CSS */
    inlineCriticalCSS: boolean
    /** 是否预加载资源 */
    preloadResources: boolean
  }
  /** SSG配置 */
  ssg: {
    /** 输出目录 */
    outputDir: string
    /** 是否生成sitemap */
    generateSitemap: boolean
    /** 是否压缩HTML */
    minifyHTML: boolean
    /** 是否提取关键CSS */
    extractCriticalCSS: boolean
  }
  /** SEO配置 */
  seo: {
    /** 是否启用 */
    enabled: boolean
    /** 是否生成meta标签 */
    generateMeta: boolean
    /** 是否生成结构化数据 */
    generateStructuredData: boolean
    /** 默认标题 */
    defaultTitle?: string
    /** 默认描述 */
    defaultDescription?: string
  }
}

/**
 * 预渲染任务
 */
export interface PrerenderTask {
  /** 任务ID */
  id: string
  /** 模板路径 */
  templatePath: string
  /** 设备类型 */
  deviceType: DeviceType
  /** 优先级 */
  priority: PrerenderPriority
  /** 初始数据 */
  initialData?: Dictionary
  /** 路由参数 */
  routeParams?: Dictionary
  /** 元数据 */
  metadata?: Dictionary
  /** 创建时间 */
  createdAt: number
}

/**
 * 预渲染结果
 */
export interface PrerenderResult {
  /** 任务ID */
  taskId: string
  /** HTML内容 */
  html: string
  /** 关键CSS */
  criticalCSS?: string
  /** 预加载资源 */
  preloadLinks?: string[]
  /** 内联脚本 */
  inlineScripts?: string[]
  /** 元数据 */
  metadata: {
    /** 渲染时间（毫秒） */
    renderTime: number
    /** 内容大小（字节） */
    size: number
    /** 是否来自缓存 */
    cached: boolean
    /** 生成时间 */
    generatedAt: number
  }
  /** SEO数据 */
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
    ogTags?: Dictionary<string>
    structuredData?: Dictionary
  }
}

/**
 * 预渲染缓存项
 */
interface PrerenderCacheItem {
  result: PrerenderResult
  expiresAt: number
}

/**
 * 预渲染系统
 */
export class PrerenderEngine {
  private config: PrerenderConfig
  private taskQueue: PrerenderTask[] = []
  private activeTasksCount = 0
  private cache: Map<string, PrerenderCacheItem> = new Map()
  private isProcessing = false

  constructor(config: Partial<PrerenderConfig> = {}) {
    this.config = {
      mode: 'hybrid',
      strategy: 'lazy',
      enabled: true,
      cache: true,
      cacheTTL: 3600,
      maxConcurrent: 3,
      timeout: 10000,
      ssr: {
        streaming: true,
        prefetch: true,
        inlineCriticalCSS: true,
        preloadResources: true,
      },
      ssg: {
        outputDir: './dist/prerendered',
        generateSitemap: true,
        minifyHTML: true,
        extractCriticalCSS: true,
      },
      seo: {
        enabled: true,
        generateMeta: true,
        generateStructuredData: true,
      },
      ...config,
    }
  }

  /**
   * 添加预渲染任务
   */
  addTask(task: Omit<PrerenderTask, 'id' | 'createdAt'>): string {
    const fullTask: PrerenderTask = {
      ...task,
      id: this.generateTaskId(),
      createdAt: Date.now(),
    }

    // 按优先级插入队列
    const insertIndex = this.findInsertIndex(fullTask.priority)
    this.taskQueue.splice(insertIndex, 0, fullTask)

    // 根据策略触发处理
    if (this.config.strategy === 'eager') {
      this.processQueue()
    }

    return fullTask.id
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `prerender-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  /**
   * 查找插入位置（按优先级）
   */
  private findInsertIndex(priority: PrerenderPriority): number {
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 }
    const targetPriority = priorityOrder[priority]

    for (let i = 0; i < this.taskQueue.length; i++) {
      if (priorityOrder[this.taskQueue[i].priority] < targetPriority) {
        return i
      }
    }

    return this.taskQueue.length
  }

  /**
   * 处理任务队列
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.taskQueue.length > 0 && this.activeTasksCount < this.config.maxConcurrent) {
      const task = this.taskQueue.shift()
      if (!task) break

      this.activeTasksCount++
      this.processTask(task)
        .finally(() => {
          this.activeTasksCount--
          // 继续处理队列
          this.processQueue()
        })
    }

    this.isProcessing = false
  }

  /**
   * 处理单个任务
   */
  private async processTask(task: PrerenderTask): Promise<PrerenderResult> {
    const cacheKey = this.generateCacheKey(task)

    // 检查缓存
    if (this.config.cache) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }
    }

    const startTime = Date.now()

    try {
      // 执行预渲染
      const result = await this.render(task)

      // 缓存结果
      if (this.config.cache) {
        this.setCache(cacheKey, result)
      }

      return result
    } catch (error) {
      console.error(`预渲染任务失败 (${task.id}):`, error)
      throw error
    }
  }

  /**
   * 执行渲染
   */
  private async render(task: PrerenderTask): Promise<PrerenderResult> {
    const startTime = Date.now()

    // 根据模式选择渲染方法
    let html: string
    let criticalCSS: string | undefined

    if (this.config.mode === 'ssr' || this.config.mode === 'hybrid') {
      html = await this.renderSSR(task)
    } else {
      html = await this.renderSSG(task)
    }

    // 提取关键CSS
    if (
      this.config.ssr.inlineCriticalCSS ||
      (this.config.mode === 'ssg' && this.config.ssg.extractCriticalCSS)
    ) {
      criticalCSS = await this.extractCriticalCSS(html)
    }

    // 生成预加载链接
    const preloadLinks = this.config.ssr.preloadResources
      ? this.generatePreloadLinks(task)
      : []

    // 生成SEO数据
    const seo = this.config.seo.enabled
      ? this.generateSEOData(task)
      : undefined

    const renderTime = Date.now() - startTime
    const size = new Blob([html]).size

    return {
      taskId: task.id,
      html,
      criticalCSS,
      preloadLinks,
      metadata: {
        renderTime,
        size,
        cached: false,
        generatedAt: Date.now(),
      },
      seo,
    }
  }

  /**
   * SSR 渲染
   */
  private async renderSSR(task: PrerenderTask): Promise<string> {
    try {
      // 动态导入模板组件
      const component = await this.loadComponent(task.templatePath)

      // 创建SSR应用
      const app = createSSRApp(component)

      // 注入初始数据
      if (task.initialData) {
        app.provide('initialData', task.initialData)
      }

      // 渲染为字符串
      const html = await renderToString(app)

      return this.wrapHTML(html, task)
    } catch (error) {
      console.error('SSR渲染失败:', error)
      throw error
    }
  }

  /**
   * SSG 渲染
   */
  private async renderSSG(task: PrerenderTask): Promise<string> {
    // SSG渲染逻辑与SSR类似，但会生成静态文件
    const html = await this.renderSSR(task)

    // 可选：压缩HTML
    if (this.config.ssg.minifyHTML) {
      return this.minifyHTML(html)
    }

    return html
  }

  /**
   * 加载组件
   */
  private async loadComponent(templatePath: string): Promise<Component> {
    // 这里需要根据实际的模板系统实现动态加载
    // 示例实现
    try {
      const module = await import(/* @vite-ignore */ templatePath)
      return module.default || module
    } catch (error) {
      console.error(`加载组件失败: ${templatePath}`, error)
      throw error
    }
  }

  /**
   * 包装HTML
   */
  private wrapHTML(content: string, task: PrerenderTask): string {
    const { seo } = this.config

    let html = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n'
    html += '  <meta charset="UTF-8">\n'
    html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'

    // SEO标签
    if (seo.enabled && seo.generateMeta) {
      if (seo.defaultTitle) {
        html += `  <title>${seo.defaultTitle}</title>\n`
      }
      if (seo.defaultDescription) {
        html += `  <meta name="description" content="${seo.defaultDescription}">\n`
      }
    }

    html += '</head>\n<body>\n'
    html += `  <div id="app">${content}</div>\n`

    // 内联关键CSS
    if (this.config.ssr.inlineCriticalCSS) {
      // 关键CSS会在后续步骤添加
    }

    html += '</body>\n</html>'

    return html
  }

  /**
   * 提取关键CSS
   */
  private async extractCriticalCSS(html: string): Promise<string> {
    // 这里需要集成类似 critical 的库来提取关键CSS
    // 简化实现
    return ''
  }

  /**
   * 生成预加载链接
   */
  private generatePreloadLinks(task: PrerenderTask): string[] {
    const links: string[] = []

    // 根据模板路径生成预加载链接
    // 简化实现
    links.push(`<link rel="preload" href="/templates/${task.templatePath}" as="script">`)

    return links
  }

  /**
   * 生成SEO数据
   */
  private generateSEOData(task: PrerenderTask): PrerenderResult['seo'] {
    return {
      title: this.config.seo.defaultTitle,
      description: this.config.seo.defaultDescription,
      keywords: [],
      ogTags: {},
      structuredData: this.config.seo.generateStructuredData ? {} : undefined,
    }
  }

  /**
   * 压缩HTML
   */
  private minifyHTML(html: string): string {
    // 简单的HTML压缩
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim()
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(task: PrerenderTask): string {
    const parts = [
      task.templatePath,
      task.deviceType,
      JSON.stringify(task.routeParams || {}),
      JSON.stringify(task.initialData || {}),
    ]
    return parts.join(':')
  }

  /**
   * 从缓存获取
   */
  private getFromCache(key: string): PrerenderResult | null {
    const item = this.cache.get(key)
    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    // 标记为缓存结果
    return {
      ...item.result,
      metadata: {
        ...item.result.metadata,
        cached: true,
      },
    }
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, result: PrerenderResult): void {
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + this.config.cacheTTL * 1000,
    })
  }

  /**
   * 预渲染模板
   */
  async prerenderTemplate(
    templatePath: string,
    deviceType: DeviceType,
    options?: {
      priority?: PrerenderPriority
      initialData?: Dictionary
      routeParams?: Dictionary
    }
  ): Promise<PrerenderResult> {
    const taskId = this.addTask({
      templatePath,
      deviceType,
      priority: options?.priority || 'normal',
      initialData: options?.initialData,
      routeParams: options?.routeParams,
    })

    // 等待任务完成
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const cacheKey = this.generateCacheKey({
          templatePath,
          deviceType,
          priority: options?.priority || 'normal',
          initialData: options?.initialData,
          routeParams: options?.routeParams,
        } as PrerenderTask)

        const result = this.getFromCache(cacheKey)
        if (result) {
          clearInterval(checkInterval)
          resolve(result)
        }
      }, 100)

      // 超时处理
      setTimeout(() => {
        clearInterval(checkInterval)
        reject(new Error('预渲染超时'))
      }, this.config.timeout)
    })
  }

  /**
   * 批量预渲染
   */
  async batchPrerender(
    tasks: Array<Omit<PrerenderTask, 'id' | 'createdAt'>>
  ): Promise<PrerenderResult[]> {
    const taskIds = tasks.map((task) => this.addTask(task))

    // 触发处理
    this.processQueue()

    // 等待所有任务完成
    return Promise.all(
      taskIds.map((id) => {
        return new Promise<PrerenderResult>((resolve, reject) => {
          const checkInterval = setInterval(() => {
            const task = tasks.find((t) => {
              const fullTask = { ...t, id, createdAt: Date.now() } as PrerenderTask
              const cacheKey = this.generateCacheKey(fullTask)
              return this.cache.has(cacheKey)
            })

            if (task) {
              const cacheKey = this.generateCacheKey({
                ...task,
                id,
                createdAt: Date.now(),
              } as PrerenderTask)
              const result = this.getFromCache(cacheKey)
              if (result) {
                clearInterval(checkInterval)
                resolve(result)
              }
            }
          }, 100)

          setTimeout(() => {
            clearInterval(checkInterval)
            reject(new Error('批量预渲染超时'))
          }, this.config.timeout)
        })
      })
    )
  }

  /**
   * 清除缓存
   */
  clearCache(templatePath?: string): void {
    if (templatePath) {
      // 清除特定模板的缓存
      for (const [key] of this.cache) {
        if (key.startsWith(templatePath)) {
          this.cache.delete(key)
        }
      }
    } else {
      // 清除所有缓存
      this.cache.clear()
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    let validCount = 0
    let expiredCount = 0
    const now = Date.now()

    for (const [, item] of this.cache) {
      if (now > item.expiresAt) {
        expiredCount++
      } else {
        validCount++
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
    }
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      pending: this.taskQueue.length,
      active: this.activeTasksCount,
      capacity: this.config.maxConcurrent,
    }
  }
}

/**
 * 创建预渲染引擎
 */
export function createPrerenderEngine(
  config?: Partial<PrerenderConfig>
): PrerenderEngine {
  return new PrerenderEngine(config)
}
