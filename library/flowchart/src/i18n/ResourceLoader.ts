/**
 * 资源加载器
 * 
 * 负责从不同来源加载翻译资源
 */

import type {
  ResourceLoader,
  TranslationResource,
  ResourceMetadata,
  SupportedLocale
} from './types'

/**
 * HTTP资源加载器
 */
export class HttpResourceLoader implements ResourceLoader {
  name = 'HttpResourceLoader'
  protocols = ['http', 'https']

  /**
   * 加载资源
   */
  async load(url: string, locale: SupportedLocale, namespace: string): Promise<TranslationResource> {
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        locale,
        namespace,
        translations: data,
        version: response.headers.get('etag') || '1.0.0',
        lastUpdated: Date.now()
      }
    } catch (error) {
      throw new Error(`加载资源失败: ${url} - ${error.message}`)
    }
  }

  /**
   * 检查资源是否存在
   */
  async exists(url: string, locale: SupportedLocale, namespace: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * 获取资源元数据
   */
  async getMetadata(url: string, locale: SupportedLocale, namespace: string): Promise<ResourceMetadata> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        size: parseInt(response.headers.get('content-length') || '0'),
        lastModified: new Date(response.headers.get('last-modified') || Date.now()).getTime(),
        version: response.headers.get('etag') || '1.0.0',
        hash: response.headers.get('etag')
      }
    } catch (error) {
      throw new Error(`获取资源元数据失败: ${url} - ${error.message}`)
    }
  }
}

/**
 * 静态资源加载器
 */
export class StaticResourceLoader implements ResourceLoader {
  name = 'StaticResourceLoader'
  protocols = ['static']
  
  private resources: Map<string, any> = new Map()

  constructor(resources: Record<string, any> = {}) {
    Object.entries(resources).forEach(([key, value]) => {
      this.resources.set(key, value)
    })
  }

  /**
   * 注册静态资源
   */
  registerResource(locale: SupportedLocale, namespace: string, translations: any): void {
    const key = `${locale}:${namespace}`
    this.resources.set(key, translations)
  }

  /**
   * 加载资源
   */
  async load(url: string, locale: SupportedLocale, namespace: string): Promise<TranslationResource> {
    const key = `${locale}:${namespace}`
    const translations = this.resources.get(key)
    
    if (!translations) {
      throw new Error(`静态资源不存在: ${key}`)
    }

    return {
      locale,
      namespace,
      translations,
      version: '1.0.0',
      lastUpdated: Date.now()
    }
  }

  /**
   * 检查资源是否存在
   */
  async exists(url: string, locale: SupportedLocale, namespace: string): Promise<boolean> {
    const key = `${locale}:${namespace}`
    return this.resources.has(key)
  }

  /**
   * 获取资源元数据
   */
  async getMetadata(url: string, locale: SupportedLocale, namespace: string): Promise<ResourceMetadata> {
    const key = `${locale}:${namespace}`
    const translations = this.resources.get(key)
    
    if (!translations) {
      throw new Error(`静态资源不存在: ${key}`)
    }

    const size = JSON.stringify(translations).length
    
    return {
      size,
      lastModified: Date.now(),
      version: '1.0.0'
    }
  }
}

/**
 * 本地存储资源加载器
 */
export class LocalStorageResourceLoader implements ResourceLoader {
  name = 'LocalStorageResourceLoader'
  protocols = ['localStorage']
  
  private keyPrefix: string

  constructor(keyPrefix: string = 'i18n_') {
    this.keyPrefix = keyPrefix
  }

  /**
   * 加载资源
   */
  async load(url: string, locale: SupportedLocale, namespace: string): Promise<TranslationResource> {
    const key = this.getStorageKey(locale, namespace)
    const data = localStorage.getItem(key)
    
    if (!data) {
      throw new Error(`本地存储资源不存在: ${key}`)
    }

    try {
      const parsed = JSON.parse(data)
      return {
        locale,
        namespace,
        translations: parsed.translations || parsed,
        version: parsed.version || '1.0.0',
        lastUpdated: parsed.lastUpdated || Date.now()
      }
    } catch (error) {
      throw new Error(`解析本地存储资源失败: ${key} - ${error.message}`)
    }
  }

  /**
   * 检查资源是否存在
   */
  async exists(url: string, locale: SupportedLocale, namespace: string): Promise<boolean> {
    const key = this.getStorageKey(locale, namespace)
    return localStorage.getItem(key) !== null
  }

  /**
   * 获取资源元数据
   */
  async getMetadata(url: string, locale: SupportedLocale, namespace: string): Promise<ResourceMetadata> {
    const key = this.getStorageKey(locale, namespace)
    const data = localStorage.getItem(key)
    
    if (!data) {
      throw new Error(`本地存储资源不存在: ${key}`)
    }

    try {
      const parsed = JSON.parse(data)
      return {
        size: data.length,
        lastModified: parsed.lastUpdated || Date.now(),
        version: parsed.version || '1.0.0'
      }
    } catch (error) {
      throw new Error(`获取本地存储资源元数据失败: ${key} - ${error.message}`)
    }
  }

  /**
   * 保存资源到本地存储
   */
  saveResource(resource: TranslationResource): void {
    const key = this.getStorageKey(resource.locale, resource.namespace)
    const data = JSON.stringify(resource)
    localStorage.setItem(key, data)
  }

  /**
   * 从本地存储删除资源
   */
  removeResource(locale: SupportedLocale, namespace: string): void {
    const key = this.getStorageKey(locale, namespace)
    localStorage.removeItem(key)
  }

  /**
   * 获取存储键
   */
  private getStorageKey(locale: SupportedLocale, namespace: string): string {
    return `${this.keyPrefix}${locale}_${namespace}`
  }
}

/**
 * 缓存资源加载器
 */
export class CacheResourceLoader implements ResourceLoader {
  name = 'CacheResourceLoader'
  protocols = ['cache']
  
  private cache: Map<string, TranslationResource> = new Map()
  private metadata: Map<string, ResourceMetadata> = new Map()
  private maxSize: number
  private ttl: number

  constructor(maxSize: number = 100, ttl: number = 30 * 60 * 1000) {
    this.maxSize = maxSize
    this.ttl = ttl
  }

  /**
   * 加载资源
   */
  async load(url: string, locale: SupportedLocale, namespace: string): Promise<TranslationResource> {
    const key = this.getCacheKey(locale, namespace)
    const cached = this.cache.get(key)
    
    if (!cached) {
      throw new Error(`缓存资源不存在: ${key}`)
    }

    // 检查是否过期
    const meta = this.metadata.get(key)
    if (meta && Date.now() - meta.lastModified > this.ttl) {
      this.cache.delete(key)
      this.metadata.delete(key)
      throw new Error(`缓存资源已过期: ${key}`)
    }

    return cached
  }

  /**
   * 检查资源是否存在
   */
  async exists(url: string, locale: SupportedLocale, namespace: string): Promise<boolean> {
    const key = this.getCacheKey(locale, namespace)
    const cached = this.cache.get(key)
    
    if (!cached) {
      return false
    }

    // 检查是否过期
    const meta = this.metadata.get(key)
    if (meta && Date.now() - meta.lastModified > this.ttl) {
      this.cache.delete(key)
      this.metadata.delete(key)
      return false
    }

    return true
  }

  /**
   * 获取资源元数据
   */
  async getMetadata(url: string, locale: SupportedLocale, namespace: string): Promise<ResourceMetadata> {
    const key = this.getCacheKey(locale, namespace)
    const meta = this.metadata.get(key)
    
    if (!meta) {
      throw new Error(`缓存资源元数据不存在: ${key}`)
    }

    return meta
  }

  /**
   * 缓存资源
   */
  cacheResource(resource: TranslationResource): void {
    const key = this.getCacheKey(resource.locale, resource.namespace)
    
    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, resource)
    this.metadata.set(key, {
      size: JSON.stringify(resource.translations).length,
      lastModified: Date.now(),
      version: resource.version
    })
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
    this.metadata.clear()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // 简化实现，实际应该跟踪命中率
    }
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(locale: SupportedLocale, namespace: string): string {
    return `${locale}:${namespace}`
  }

  /**
   * 淘汰最旧的缓存项
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, meta] of this.metadata.entries()) {
      if (meta.lastModified < oldestTime) {
        oldestTime = meta.lastModified
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.metadata.delete(oldestKey)
    }
  }
}
