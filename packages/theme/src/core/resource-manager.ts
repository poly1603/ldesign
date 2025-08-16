/**
 * @ldesign/theme - 资源管理器
 *
 * 负责主题资源的加载、缓存和管理
 */

import type { EventEmitter } from '../utils/event-emitter'
import type { ResourceManagerInstance, ResourceStats } from './types'

/**
 * 资源类型
 */
export type ResourceType =
  | 'image'
  | 'icon'
  | 'sound'
  | 'font'
  | 'json'
  | 'css'
  | 'js'

/**
 * 资源缓存项
 */
interface ResourceCacheItem {
  data: any
  type: ResourceType
  size: number
  loadTime: number
  lastAccess: number
  refCount: number
}

/**
 * 资源加载选项
 */
interface ResourceLoadOptions {
  type?: ResourceType
  timeout?: number
  cache?: boolean
  preload?: boolean
}

/**
 * 资源管理器实现
 */
export class ResourceManager implements ResourceManagerInstance {
  private cache = new Map<string, ResourceCacheItem>()
  private loading = new Map<string, Promise<any>>()
  private eventEmitter: EventEmitter
  private maxCacheSize: number
  private currentCacheSize = 0

  constructor(
    eventEmitter: EventEmitter,
    options: { maxCacheSize?: number } = {}
  ) {
    this.eventEmitter = eventEmitter
    this.maxCacheSize = options.maxCacheSize || 50 * 1024 * 1024 // 50MB
  }

  /**
   * 加载资源
   */
  async load(src: string, type?: string): Promise<any> {
    // 检查缓存
    const cached = this.cache.get(src)
    if (cached) {
      cached.lastAccess = Date.now()
      cached.refCount++
      return cached.data
    }

    // 检查是否正在加载
    const loading = this.loading.get(src)
    if (loading) {
      return loading
    }

    // 开始加载
    const loadPromise = this.loadResource(src, type)
    this.loading.set(src, loadPromise)

    try {
      const data = await loadPromise
      this.loading.delete(src)

      // 缓存资源
      this.cacheResource(src, data, this.detectResourceType(src, type))

      this.eventEmitter.emit('resource-loaded', { resource: src })
      return data
    } catch (error) {
      this.loading.delete(src)
      this.eventEmitter.emit('resource-error', {
        resource: src,
        error: error as Error,
      })
      throw error
    }
  }

  /**
   * 预加载资源
   */
  async preload(resources: string[]): Promise<void> {
    const promises = resources.map(src =>
      this.load(src).catch(error => {
        console.warn(`Failed to preload resource: ${src}`, error)
        return null
      })
    )

    await Promise.all(promises)
  }

  /**
   * 获取缓存的资源
   */
  get(src: string): any {
    const cached = this.cache.get(src)
    if (cached) {
      cached.lastAccess = Date.now()
      cached.refCount++
      return cached.data
    }
    return undefined
  }

  /**
   * 清理资源
   */
  clear(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern)
      for (const [src, item] of this.cache.entries()) {
        if (regex.test(src)) {
          this.currentCacheSize -= item.size
          this.cache.delete(src)
        }
      }
    } else {
      this.cache.clear()
      this.currentCacheSize = 0
    }
  }

  /**
   * 获取资源统计信息
   */
  getStats(): ResourceStats {
    const loaded = 0
    const failed = 0
    const cached = this.cache.size

    // 这里可以添加更详细的统计逻辑

    return {
      total: loaded + failed,
      loaded,
      failed,
      cached,
      memoryUsage: this.currentCacheSize,
    }
  }

  /**
   * 销毁资源管理器
   */
  destroy(): void {
    this.clear()
    this.loading.clear()
  }

  /**
   * 实际加载资源的方法
   */
  private async loadResource(src: string, type?: string): Promise<any> {
    const resourceType = this.detectResourceType(src, type)

    switch (resourceType) {
      case 'image':
        return this.loadImage(src)
      case 'icon':
        return this.loadIcon(src)
      case 'sound':
        return this.loadSound(src)
      case 'font':
        return this.loadFont(src)
      case 'json':
        return this.loadJson(src)
      case 'css':
        return this.loadCss(src)
      case 'js':
        return this.loadJs(src)
      default:
        return this.loadGeneric(src)
    }
  }

  /**
   * 检测资源类型
   */
  private detectResourceType(src: string, type?: string): ResourceType {
    if (type) {
      return type as ResourceType
    }

    const ext = src.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return 'image'
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'sound'
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        return 'font'
      case 'json':
        return 'json'
      case 'css':
        return 'css'
      case 'js':
        return 'js'
      default:
        return 'image' // 默认为图片
    }
  }

  /**
   * 加载图片
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })
  }

  /**
   * 加载图标（SVG）
   */
  private async loadIcon(src: string): Promise<string> {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to load icon: ${src}`)
    }
    return response.text()
  }

  /**
   * 加载音频
   */
  private loadSound(src: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.oncanplaythrough = () => resolve(audio)
      audio.onerror = () => reject(new Error(`Failed to load sound: ${src}`))
      audio.src = src
    })
  }

  /**
   * 加载字体
   */
  private async loadFont(src: string): Promise<FontFace> {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to load font: ${src}`)
    }
    const buffer = await response.arrayBuffer()
    const fontFace = new FontFace('custom-font', buffer)
    await fontFace.load()
    return fontFace
  }

  /**
   * 加载 JSON
   */
  private async loadJson(src: string): Promise<any> {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${src}`)
    }
    return response.json()
  }

  /**
   * 加载 CSS
   */
  private async loadCss(src: string): Promise<string> {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to load CSS: ${src}`)
    }
    return response.text()
  }

  /**
   * 加载 JavaScript
   */
  private async loadJs(src: string): Promise<string> {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to load JS: ${src}`)
    }
    return response.text()
  }

  /**
   * 加载通用资源
   */
  private async loadGeneric(src: string): Promise<any> {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to load resource: ${src}`)
    }
    return response.blob()
  }

  /**
   * 缓存资源
   */
  private cacheResource(src: string, data: any, type: ResourceType): void {
    const size = this.calculateResourceSize(data, type)

    // 检查缓存大小限制
    if (this.currentCacheSize + size > this.maxCacheSize) {
      this.evictLRU(size)
    }

    const item: ResourceCacheItem = {
      data,
      type,
      size,
      loadTime: Date.now(),
      lastAccess: Date.now(),
      refCount: 1,
    }

    this.cache.set(src, item)
    this.currentCacheSize += size
  }

  /**
   * 计算资源大小
   */
  private calculateResourceSize(data: any, type: ResourceType): number {
    switch (type) {
      case 'image':
        return (
          (data as HTMLImageElement).naturalWidth *
          (data as HTMLImageElement).naturalHeight *
          4
        ) // RGBA
      case 'sound':
        return 1024 * 1024 // 估算 1MB
      case 'font':
        return 100 * 1024 // 估算 100KB
      default:
        return JSON.stringify(data).length * 2 // 估算字符串大小
    }
  }

  /**
   * LRU 缓存淘汰
   */
  private evictLRU(requiredSize: number): void {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess)

    let freedSize = 0
    for (const [src, item] of entries) {
      this.cache.delete(src)
      this.currentCacheSize -= item.size
      freedSize += item.size

      if (freedSize >= requiredSize) {
        break
      }
    }
  }
}

/**
 * 创建资源管理器实例
 */
export function createResourceManager(
  eventEmitter: EventEmitter,
  options?: { maxCacheSize?: number }
): ResourceManagerInstance {
  return new ResourceManager(eventEmitter, options)
}
