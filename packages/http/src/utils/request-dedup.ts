/**
 * 请求去重键生成器模块
 */

import type { RequestConfig } from '../types'

/**
 * 去重键生成器配置
 */
export interface DeduplicationKeyConfig {
  /** 是否包含请求方法 */
  includeMethod?: boolean
  /** 是否包含URL */
  includeUrl?: boolean
  /** 是否包含查询参数 */
  includeParams?: boolean
  /** 是否包含请求体 */
  includeData?: boolean
  /** 是否包含请求头 */
  includeHeaders?: boolean
  /** 要包含的特定请求头 */
  specificHeaders?: string[]
  /** 自定义键生成函数 */
  customGenerator?: (config: RequestConfig) => string
}

/**
 * 智能去重键生成器（优化版）
 *
 * 优化点：
 * 1. 添加键缓存，避免重复计算
 * 2. 使用 WeakMap 自动管理缓存生命周期
 * 3. 优化序列化性能
 */
export class DeduplicationKeyGenerator {
  private config: Required<Omit<DeduplicationKeyConfig, 'customGenerator'>> & Pick<DeduplicationKeyConfig, 'customGenerator'>
  // 使用 WeakMap 缓存键，自动垃圾回收
  private keyCache = new WeakMap<RequestConfig, string>()
  // 对于非对象配置，使用普通 Map（带 LRU）
  private stringKeyCache = new Map<string, string>()
  private maxCacheSize = 1000

  constructor(config: DeduplicationKeyConfig = {}) {
    this.config = {
      includeMethod: true,
      includeUrl: true,
      includeParams: true,
      includeData: false,
      includeHeaders: false,
      specificHeaders: [],
      customGenerator: config.customGenerator,
      ...config,
    }
  }

  /**
   * 生成去重键（优化版 - 带缓存）
   */
  generate(requestConfig: RequestConfig): string {
    // 尝试从缓存获取
    const cached = this.keyCache.get(requestConfig)
    if (cached) {
      return cached
    }

    // 生成新键
    const key = this.generateKey(requestConfig)

    // 缓存结果
    this.keyCache.set(requestConfig, key)

    // 同时缓存到字符串 Map（用于相同配置的不同对象实例）
    this.cacheStringKey(key)

    return key
  }

  /**
   * 实际生成键的逻辑
   */
  private generateKey(requestConfig: RequestConfig): string {
    if (this.config?.customGenerator) {
      return this.config?.customGenerator(requestConfig)
    }

    const parts: string[] = []

    if (this.config?.includeMethod && requestConfig.method) {
      parts.push(`method:${requestConfig.method.toUpperCase()}`)
    }

    if (this.config?.includeUrl && requestConfig.url) {
      parts.push(`url:${requestConfig.url}`)
    }

    if (this.config?.includeParams && requestConfig.params) {
      const paramsStr = this.serializeParams(requestConfig.params)
      if (paramsStr) {
        parts.push(`params:${paramsStr}`)
      }
    }

    if (this.config?.includeData && requestConfig.data) {
      const dataStr = this.serializeData(requestConfig.data)
      if (dataStr) {
        parts.push(`data:${dataStr}`)
      }
    }

    if (this.config?.includeHeaders && requestConfig.headers) {
      const headersStr = this.serializeHeaders(requestConfig.headers)
      if (headersStr) {
        parts.push(`headers:${headersStr}`)
      }
    }

    if (this.config?.specificHeaders.length > 0 && requestConfig.headers) {
      const specificHeadersStr = this.serializeSpecificHeaders(
        requestConfig.headers,
        this.config?.specificHeaders,
      )
      if (specificHeadersStr) {
        parts.push(`specific-headers:${specificHeadersStr}`)
      }
    }

    return parts.join('|')
  }

  /**
   * 缓存字符串键（LRU优化版）
   */
  private cacheStringKey(key: string): void {
    // 如果缓存已满，删除最旧的项（优化：只在需要时删除）
    if (this.stringKeyCache.size >= this.maxCacheSize) {
      // 使用迭代器直接获取第一个键
      const iterator = this.stringKeyCache.keys()
      const firstKey = iterator.next().value
      if (firstKey !== undefined) {
        this.stringKeyCache.delete(firstKey)
      }
    }
    this.stringKeyCache.set(key, key)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.stringKeyCache.clear()
  }

  /**
   * 序列化参数（极致优化版 - 使用数组预分配）
   */
  private serializeParams(params: Record<string, any>): string {
    try {
      const keys = Object.keys(params).sort()
      const len = keys.length
      
      if (len === 0) return ''
      
      // 预分配数组大小
      const parts: string[] = Array.from({ length: len }, () => '')
      
      for (let i = 0; i < len; i++) {
        const key = keys[i]!
        parts[i] = `${key}:${JSON.stringify(params[key])}`
      }
      
      return parts.join(',')
    }
    catch {
      return String(params)
    }
  }

  /**
   * 序列化数据（优化版）
   */
  private serializeData(data: any): string {
    try {
      if (data instanceof FormData) {
        // FormData 特殊处理
        const entries: string[] = []
        for (const [key, value] of data.entries()) {
          entries.push(`${key}:${typeof value === 'string' ? value : '[File]'}`)
        }
        return entries.sort().join(',')
      }

      if (typeof data === 'object' && data !== null) {
        // 直接构建字符串，避免创建排序后的对象
        const keys = Object.keys(data).sort()
        const parts: string[] = []
        for (const key of keys) {
          parts.push(`${key}:${JSON.stringify(data[key])}`)
        }
        return parts.join(',')
      }

      return String(data)
    }
    catch {
      return String(data)
    }
  }

  /**
   * 序列化请求头（优化版）
   */
  private serializeHeaders(headers: Record<string, string>): string {
    try {
      // 排除一些动态的请求头
      const excludeHeaders = new Set(['authorization', 'x-request-id', 'x-timestamp'])
      const parts: string[] = []

      const keys = Object.keys(headers).sort()
      for (const key of keys) {
        if (!excludeHeaders.has(key.toLowerCase())) {
          parts.push(`${key}:${headers[key]}`)
        }
      }

      return parts.join(',')
    }
    catch {
      return String(headers)
    }
  }

  /**
   * 序列化特定请求头（优化版）
   */
  private serializeSpecificHeaders(
    headers: Record<string, string>,
    specificHeaders: string[],
  ): string {
    try {
      const parts: string[] = []
      const sortedHeaders = [...specificHeaders].sort()

      for (const header of sortedHeaders) {
        if (headers[header] !== undefined) {
          parts.push(`${header}:${headers[header]}`)
        }
      }

      return parts.join(',')
    }
    catch {
      return ''
    }
  }
}

/**
 * 创建去重键生成器
 */
export function createDeduplicationKeyGenerator(
  config?: DeduplicationKeyConfig,
): DeduplicationKeyGenerator {
  return new DeduplicationKeyGenerator(config)
}

// 导出默认的键生成器
export const defaultKeyGenerator = new DeduplicationKeyGenerator()

/**
 * 生成请求唯一键（简化版本，向后兼容）
 */
export function generateRequestKey(config: RequestConfig): string {
  return defaultKeyGenerator.generate(config)
}
