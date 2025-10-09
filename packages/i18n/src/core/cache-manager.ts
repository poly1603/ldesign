/**
 * 缓存管理器
 *
 * 统一管理各种缓存，提供一致的缓存接口和优化策略
 *
 * 性能优化：
 * - 使用快速缓存键生成器
 * - 减少对象创建
 * - 优化缓存查找
 *
 * @author LDesign Team
 * @version 2.0.0
 */

import type { TranslationParams, CacheOptions } from './types'
import { TranslationCache } from './cache'
import { FastCacheKeyGenerator } from './fast-cache-key'

/**
 * 缓存键生成器（优化版本）
 */
export class CacheKeyGenerator {
  private static fastGenerator = new FastCacheKeyGenerator({ compact: true, sortParams: true })

  /**
   * 生成翻译缓存键（优化版本）
   * @param locale 语言代码
   * @param key 翻译键
   * @param params 插值参数
   * @returns 缓存键
   */
  static generateTranslationKey(
    locale: string,
    key: string,
    params: TranslationParams = {}
  ): string {
    return this.fastGenerator.generateTranslationKey(locale, key, params)
  }

  /**
   * 生成语言包缓存键
   * @param locale 语言代码
   * @param namespace 命名空间（可选）
   * @returns 缓存键
   */
  static generatePackageKey(locale: string, namespace?: string): string {
    return namespace ? `${locale}:${namespace}` : locale
  }

  /**
   * 生成性能缓存键
   * @param operation 操作类型
   * @param identifier 标识符
   * @returns 缓存键
   */
  static generatePerformanceKey(operation: string, identifier: string): string {
    return `perf:${operation}:${identifier}`
  }
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 总请求数 */
  totalRequests: number
  /** 缓存命中数 */
  hits: number
  /** 缓存未命中数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 缓存大小 */
  size: number
  /** 内存使用量（字节） */
  memoryUsage: number
}

/**
 * 缓存管理器
 * 
 * 提供统一的缓存管理接口，支持多种缓存策略和优化
 */
export class CacheManager {
  private translationCache: TranslationCache
  private options: CacheOptions
  private stats: CacheStats

  constructor(options: CacheOptions) {
    this.options = options
    this.translationCache = new TranslationCache(options)
    this.stats = {
      totalRequests: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      memoryUsage: 0
    }
  }

  /**
   * 获取翻译缓存
   * @param locale 语言代码
   * @param key 翻译键
   * @param params 插值参数
   * @returns 缓存的翻译结果
   */
  getTranslation(
    locale: string,
    key: string,
    params: TranslationParams = {}
  ): string | undefined {
    this.stats.totalRequests++

    const cached = this.translationCache.getCachedTranslation(locale, key, params)
    
    if (cached !== undefined) {
      this.stats.hits++
    } else {
      this.stats.misses++
    }

    this.updateHitRate()
    return cached
  }

  /**
   * 设置翻译缓存
   * @param locale 语言代码
   * @param key 翻译键
   * @param params 插值参数
   * @param value 翻译结果
   */
  setTranslation(
    locale: string,
    key: string,
    params: TranslationParams,
    value: string
  ): void {
    this.translationCache.cacheTranslation(locale, key, params, value)
    this.updateStats()
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.translationCache.clear()
    this.resetStats()
  }

  /**
   * 清除特定语言的缓存
   * @param locale 语言代码
   */
  clearLocale(locale: string): void {
    this.translationCache.clearLocale(locale)
    this.updateStats()
  }

  /**
   * 预热缓存
   * @param locale 语言代码
   * @param keys 要预热的翻译键列表
   * @param translator 翻译函数
   */
  warmUp(
    locale: string,
    keys: string[],
    translator: (key: string) => string
  ): void {
    const entries: Array<{ locale: string; key: string; params?: Record<string, any>; value: string }> = []

    for (const key of keys) {
      try {
        const translation = translator(key)
        if (translation && translation !== key) {
          entries.push({
            locale,
            key,
            value: translation
          })
        }
      } catch (error) {
        // 忽略翻译错误，继续处理其他键
        console.warn(`Failed to warm up cache for key: ${key}`, error)
      }
    }

    this.translationCache.warmUp(entries)
    this.updateStats()
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  getStats(): CacheStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      memoryUsage: 0
    }
  }

  /**
   * 检查缓存健康状态
   * @returns 健康状态报告
   */
  checkHealth(): {
    isHealthy: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // 检查命中率
    if (this.stats.hitRate < 0.5) {
      issues.push('缓存命中率过低')
      recommendations.push('考虑增加缓存大小或优化缓存策略')
    }

    // 检查内存使用
    if (this.options.maxMemory && this.stats.memoryUsage > this.options.maxMemory * 0.9) {
      issues.push('内存使用率过高')
      recommendations.push('考虑清理缓存或减少缓存大小')
    }

    // 检查缓存大小
    if (this.stats.size > this.options.maxSize * 0.9) {
      issues.push('缓存条目数接近上限')
      recommendations.push('考虑增加最大缓存大小或启用自动清理')
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations
    }
  }

  /**
   * 批量获取翻译缓存（减少函数调用开销）
   * @param requests 批量请求数组
   * @returns 翻译结果数组
   */
  batchGetTranslations(
    requests: Array<{ locale: string; key: string; params?: TranslationParams }>
  ): Array<string | undefined> {
    const results: Array<string | undefined> = []
    
    for (const req of requests) {
      const cached = this.translationCache.getCachedTranslation(req.locale, req.key, req.params)
      results.push(cached)
      
      this.stats.totalRequests++
      if (cached !== undefined) {
        this.stats.hits++
      } else {
        this.stats.misses++
      }
    }
    
    this.updateHitRate()
    return results
  }

  /**
   * 批量设置翻译缓存（减少函数调用开销）
   * @param entries 批量缓存条目
   */
  batchSetTranslations(
    entries: Array<{
      locale: string
      key: string
      params?: TranslationParams
      value: string
    }>
  ): void {
    for (const entry of entries) {
      this.translationCache.cacheTranslation(
        entry.locale,
        entry.key,
        entry.params || {},
        entry.value
      )
    }
    this.updateStats()
  }

  /**
   * 自动优化缓存
   */
  optimize(): void {
    const health = this.checkHealth()

    if (!health.isHealthy) {
      // 如果内存使用过高，清理部分缓存
      if (this.options.maxMemory && this.stats.memoryUsage > this.options.maxMemory * 0.8) {
        this.translationCache.cleanup()
      }
    }
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = this.stats.hits / this.stats.totalRequests
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.size = this.translationCache.size()
    this.stats.memoryUsage = this.translationCache.getMemoryUsage()
    this.updateHitRate()
  }
}
