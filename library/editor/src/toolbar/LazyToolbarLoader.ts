/**
 * 工具栏懒加载管理器
 * 负责按需加载工具栏项，优化性能和内存使用
 */

import type { ToolbarItemConfig, LazyLoadConfig } from './types'

/**
 * 加载状态
 */
export enum LoadStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

/**
 * 加载项信息
 */
interface LoadItem {
  id: string
  config: ToolbarItemConfig
  status: LoadStatus
  element?: HTMLElement
  error?: Error
  promise?: Promise<void>
}

/**
 * 懒加载管理器配置
 */
export interface LazyLoaderConfig {
  /** 预加载延迟（毫秒） */
  preloadDelay?: number
  
  /** 最大并发加载数 */
  maxConcurrent?: number
  
  /** 加载超时时间 */
  timeout?: number
  
  /** 是否启用缓存 */
  cache?: boolean
  
  /** 缓存过期时间 */
  cacheExpiry?: number
}

/**
 * 懒加载管理器
 */
export class LazyToolbarLoader {
  private items = new Map<string, LoadItem>()
  private loadQueue: string[] = []
  private loading = new Set<string>()
  private observer?: IntersectionObserver
  private preloadTimers = new Map<string, number>()
  private cache = new Map<string, HTMLElement>()
  private config: LazyLoaderConfig
  
  constructor(config: LazyLoaderConfig = {}) {
    this.config = {
      preloadDelay: 500,
      maxConcurrent: 3,
      timeout: 5000,
      cache: true,
      cacheExpiry: 3600000, // 1小时
      ...config
    }
    
    this.setupObserver()
  }
  
  /**
   * 设置交叉观察器
   */
  private setupObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-item-id')
          if (!id) return
          
          if (entry.isIntersecting) {
            this.load(id)
          } else {
            this.cancelPreload(id)
          }
        })
      },
      { 
        rootMargin: '50px',
        threshold: 0.01
      }
    )
  }
  
  /**
   * 注册懒加载项
   */
  register(config: ToolbarItemConfig): void {
    if (!config.lazy?.enabled) return
    
    this.items.set(config.id, {
      id: config.id,
      config,
      status: LoadStatus.IDLE
    })
  }
  
  /**
   * 加载项目
   */
  async load(id: string): Promise<HTMLElement | undefined> {
    const item = this.items.get(id)
    if (!item) return
    
    // 检查缓存
    if (this.config.cache && this.cache.has(id)) {
      const cached = this.cache.get(id)!
      item.element = cached
      item.status = LoadStatus.LOADED
      return cached
    }
    
    // 已加载
    if (item.status === LoadStatus.LOADED) {
      return item.element
    }
    
    // 正在加载
    if (item.status === LoadStatus.LOADING) {
      await item.promise
      return item.element
    }
    
    // 开始加载
    item.status = LoadStatus.LOADING
    item.promise = this.doLoad(item)
    
    try {
      await item.promise
      return item.element
    } catch (error) {
      console.error(`Failed to load toolbar item "${id}":`, error)
      return undefined
    }
  }
  
  /**
   * 执行加载
   */
  private async doLoad(item: LoadItem): Promise<void> {
    const { config } = item
    const lazyConfig = config.lazy!
    
    // 检查并发限制
    while (this.loading.size >= this.config.maxConcurrent!) {
      await this.waitForSlot()
    }
    
    this.loading.add(item.id)
    
    try {
      // 超时控制
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Load timeout')), 
          lazyConfig.timeout || this.config.timeout)
      })
      
      // 加载器
      const loaderPromise = lazyConfig.loader ? 
        lazyConfig.loader().then(loaded => {
          // 合并加载的配置
          Object.assign(config, loaded)
        }) : 
        Promise.resolve()
      
      await Promise.race([loaderPromise, timeoutPromise])
      
      // 创建元素
      if (config.render) {
        // 使用自定义渲染器
        item.element = config.render(config, null as any)
      } else {
        // 使用默认渲染
        item.element = this.createDefaultElement(config)
      }
      
      // 缓存
      if (this.config.cache && item.element) {
        this.cache.set(item.id, item.element)
        
        // 设置缓存过期
        setTimeout(() => {
          this.cache.delete(item.id)
        }, this.config.cacheExpiry)
      }
      
      item.status = LoadStatus.LOADED
    } catch (error) {
      item.status = LoadStatus.ERROR
      item.error = error as Error
      throw error
    } finally {
      this.loading.delete(item.id)
    }
  }
  
  /**
   * 等待加载槽位
   */
  private async waitForSlot(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (this.loading.size < this.config.maxConcurrent!) {
          resolve()
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }
  
  /**
   * 创建默认元素
   */
  private createDefaultElement(config: ToolbarItemConfig): HTMLElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `toolbar-item ${config.className || ''}`
    button.setAttribute('data-item-id', config.id)
    
    if (config.tooltip) {
      button.title = config.tooltip
    }
    
    // 图标
    if (config.icon) {
      const icon = this.createIcon(config.icon)
      if (icon) button.appendChild(icon)
    }
    
    // 标签
    if (config.label) {
      const label = document.createElement('span')
      label.className = 'toolbar-item-label'
      label.textContent = config.label
      button.appendChild(label)
    }
    
    // 应用样式
    if (config.style) {
      Object.assign(button.style, config.style)
    }
    
    return button
  }
  
  /**
   * 创建图标
   */
  private createIcon(icon: any): HTMLElement | null {
    if (typeof icon === 'string') {
      const span = document.createElement('span')
      span.className = `toolbar-icon ${icon}`
      return span
    }
    
    if (icon.svg) {
      const div = document.createElement('div')
      div.className = 'toolbar-icon-svg'
      div.innerHTML = icon.svg
      return div
    }
    
    if (icon.url) {
      const img = document.createElement('img')
      img.className = 'toolbar-icon-img'
      img.src = icon.url
      return img
    }
    
    return null
  }
  
  /**
   * 预加载
   */
  preload(id: string): void {
    const item = this.items.get(id)
    if (!item || item.status !== LoadStatus.IDLE) return
    
    const lazyConfig = item.config.lazy!
    if (!lazyConfig.preload) return
    
    // 延迟加载
    const timer = window.setTimeout(() => {
      this.load(id)
      this.preloadTimers.delete(id)
    }, this.config.preloadDelay)
    
    this.preloadTimers.set(id, timer)
  }
  
  /**
   * 取消预加载
   */
  cancelPreload(id: string): void {
    const timer = this.preloadTimers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.preloadTimers.delete(id)
    }
  }
  
  /**
   * 创建占位符
   */
  createPlaceholder(config: ToolbarItemConfig): HTMLElement {
    const lazyConfig = config.lazy!
    
    if (lazyConfig.placeholder) {
      if (typeof lazyConfig.placeholder === 'string') {
        const div = document.createElement('div')
        div.className = 'toolbar-item-placeholder'
        div.innerHTML = lazyConfig.placeholder
        return div
      }
      return lazyConfig.placeholder
    }
    
    // 默认占位符
    const placeholder = document.createElement('div')
    placeholder.className = 'toolbar-item-placeholder'
    placeholder.setAttribute('data-item-id', config.id)
    placeholder.style.cssText = `
      width: 32px;
      height: 32px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    `
    
    // 观察占位符
    if (this.observer) {
      this.observer.observe(placeholder)
    }
    
    // 鼠标悬停预加载
    placeholder.addEventListener('mouseenter', () => {
      this.preload(config.id)
    })
    
    placeholder.addEventListener('mouseleave', () => {
      this.cancelPreload(config.id)
    })
    
    return placeholder
  }
  
  /**
   * 替换占位符
   */
  async replacePlaceholder(placeholder: HTMLElement, id: string): Promise<void> {
    const element = await this.load(id)
    if (element && placeholder.parentNode) {
      placeholder.parentNode.replaceChild(element, placeholder)
    }
  }
  
  /**
   * 获取加载状态
   */
  getStatus(id: string): LoadStatus | undefined {
    return this.items.get(id)?.status
  }
  
  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    loaded: number
    loading: number
    error: number
    cached: number
  } {
    let loaded = 0
    let loading = 0
    let error = 0
    
    this.items.forEach(item => {
      switch (item.status) {
        case LoadStatus.LOADED:
          loaded++
          break
        case LoadStatus.LOADING:
          loading++
          break
        case LoadStatus.ERROR:
          error++
          break
      }
    })
    
    return {
      total: this.items.size,
      loaded,
      loading,
      error,
      cached: this.cache.size
    }
  }
  
  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear()
  }
  
  /**
   * 销毁
   */
  destroy(): void {
    this.observer?.disconnect()
    this.preloadTimers.forEach(timer => clearTimeout(timer))
    this.preloadTimers.clear()
    this.items.clear()
    this.loadQueue = []
    this.loading.clear()
    this.cache.clear()
  }
}

// 添加shimmer动画
if (typeof document !== 'undefined' && !document.getElementById('toolbar-lazy-styles')) {
  const style = document.createElement('style')
  style.id = 'toolbar-lazy-styles'
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `
  document.head.appendChild(style)
}