/**
 * 快速缓存键生成器
 * 
 * 优化的缓存键生成算法，减少字符串操作和内存分配
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import type { TranslationParams } from './types'
import { buildString, globalPools } from '../utils/object-pool'

/**
 * 缓存键生成器配置
 */
export interface CacheKeyConfig {
  /** 是否使用紧凑模式（更短的键，但可读性较差） */
  compact?: boolean
  /** 是否启用参数排序（确保相同参数不同顺序生成相同键） */
  sortParams?: boolean
  /** 分隔符 */
  separator?: string
}

/**
 * 快速缓存键生成器
 */
export class FastCacheKeyGenerator {
  private config: Required<CacheKeyConfig>
  private emptyParamsKey = ''

  constructor(config: CacheKeyConfig = {}) {
    this.config = {
      compact: config.compact ?? false,
      sortParams: config.sortParams ?? true,
      separator: config.separator ?? ':',
    }
  }

  /**
   * 生成翻译缓存键
   * 
   * 优化策略：
   * 1. 使用字符串构建器池减少内存分配
   * 2. 快速路径处理无参数情况
   * 3. 参数排序确保一致性
   * 4. 紧凑模式减少键长度
   */
  generateTranslationKey(
    locale: string,
    key: string,
    params?: TranslationParams
  ): string {
    // 快速路径：无参数
    if (!params || Object.keys(params).length === 0) {
      return `${locale}${this.config.separator}${key}`
    }

    // 使用字符串构建器池
    return buildString((builder) => {
      builder.push(locale, this.config.separator, key)

      const paramKeys = Object.keys(params)
      if (paramKeys.length > 0) {
        if (this.config.sortParams) {
          paramKeys.sort()
        }

        builder.push(this.config.separator)
        
        if (this.config.compact) {
          // 紧凑模式：使用更短的格式
          for (let i = 0; i < paramKeys.length; i++) {
            if (i > 0) builder.push(',')
            const k = paramKeys[i]
            builder.push(k, '=', String(params[k]))
          }
        } else {
          // 标准模式：更易读
          for (let i = 0; i < paramKeys.length; i++) {
            if (i > 0) builder.push(this.config.separator)
            const k = paramKeys[i]
            builder.push(k, ':', String(params[k]))
          }
        }
      }
    })
  }

  /**
   * 生成语言包缓存键
   */
  generatePackageKey(locale: string, namespace?: string): string {
    if (!namespace) {
      return locale
    }
    return `${locale}${this.config.separator}${namespace}`
  }

  /**
   * 生成批量翻译缓存键
   */
  generateBatchKey(locale: string, keys: string[]): string {
    return buildString((builder) => {
      builder.push(locale, this.config.separator, 'batch', this.config.separator)
      
      if (this.config.compact) {
        builder.push(keys.join(','))
      } else {
        builder.push(keys.join(this.config.separator))
      }
    })
  }

  /**
   * 解析缓存键（用于调试）
   */
  parseCacheKey(cacheKey: string): {
    locale: string
    key: string
    params?: Record<string, string>
  } | null {
    const parts = cacheKey.split(this.config.separator)
    if (parts.length < 2) return null

    const [locale, key, ...paramParts] = parts
    
    if (paramParts.length === 0) {
      return { locale, key }
    }

    const params: Record<string, string> = {}
    const paramStr = paramParts.join(this.config.separator)
    
    if (this.config.compact) {
      // 解析紧凑格式
      const pairs = paramStr.split(',')
      for (const pair of pairs) {
        const [k, v] = pair.split('=')
        if (k && v) params[k] = v
      }
    } else {
      // 解析标准格式
      for (const part of paramParts) {
        const [k, v] = part.split(':')
        if (k && v) params[k] = v
      }
    }

    return { locale, key, params }
  }
}

/**
 * 哈希缓存键生成器
 * 
 * 使用哈希算法生成固定长度的键，适合大量参数的场景
 */
export class HashCacheKeyGenerator {
  /**
   * 简单的字符串哈希函数（FNV-1a）
   */
  private hash(str: string): string {
    let hash = 2166136261 // FNV offset basis
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i)
      hash = Math.imul(hash, 16777619) // FNV prime
    }
    // 转换为正数并转为36进制（更短）
    return (hash >>> 0).toString(36)
  }

  /**
   * 生成哈希缓存键
   */
  generateTranslationKey(
    locale: string,
    key: string,
    params?: TranslationParams
  ): string {
    if (!params || Object.keys(params).length === 0) {
      return `${locale}:${key}`
    }

    // 序列化参数
    const paramStr = JSON.stringify(params)
    const paramHash = this.hash(paramStr)
    
    return `${locale}:${key}:${paramHash}`
  }

  /**
   * 生成语言包缓存键
   */
  generatePackageKey(locale: string, namespace?: string): string {
    return namespace ? `${locale}:${namespace}` : locale
  }
}

/**
 * 缓存键工厂
 */
export class CacheKeyFactory {
  private static standardGenerator: FastCacheKeyGenerator
  private static compactGenerator: FastCacheKeyGenerator
  private static hashGenerator: HashCacheKeyGenerator

  /**
   * 获取标准生成器
   */
  static getStandard(): FastCacheKeyGenerator {
    if (!this.standardGenerator) {
      this.standardGenerator = new FastCacheKeyGenerator({
        compact: false,
        sortParams: true,
      })
    }
    return this.standardGenerator
  }

  /**
   * 获取紧凑生成器
   */
  static getCompact(): FastCacheKeyGenerator {
    if (!this.compactGenerator) {
      this.compactGenerator = new FastCacheKeyGenerator({
        compact: true,
        sortParams: true,
      })
    }
    return this.compactGenerator
  }

  /**
   * 获取哈希生成器
   */
  static getHash(): HashCacheKeyGenerator {
    if (!this.hashGenerator) {
      this.hashGenerator = new HashCacheKeyGenerator()
    }
    return this.hashGenerator
  }

  /**
   * 根据场景选择最佳生成器
   */
  static getBest(scenario: 'default' | 'memory' | 'speed'): FastCacheKeyGenerator | HashCacheKeyGenerator {
    switch (scenario) {
      case 'memory':
        return this.getCompact()
      case 'speed':
        return this.getHash()
      default:
        return this.getStandard()
    }
  }
}

/**
 * 默认导出标准生成器
 */
export const defaultCacheKeyGenerator = CacheKeyFactory.getStandard()

/**
 * 便捷函数：生成翻译缓存键
 */
export function generateCacheKey(
  locale: string,
  key: string,
  params?: TranslationParams
): string {
  return defaultCacheKeyGenerator.generateTranslationKey(locale, key, params)
}

/**
 * 便捷函数：生成语言包缓存键
 */
export function generatePackageCacheKey(locale: string, namespace?: string): string {
  return defaultCacheKeyGenerator.generatePackageKey(locale, namespace)
}

