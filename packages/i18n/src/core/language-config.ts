/**
 * 语言选择配置模块
 * 
 * 提供灵活的语言启用/禁用配置功能，支持多种过滤方式
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import type { LanguageInfo } from './types'
import { getBuiltInLocales, getBuiltInLanguageInfos } from '../locales'

/**
 * 语言过滤器类型
 * 
 * 支持多种过滤方式：
 * - string[]: 直接指定语言代码列表
 * - function: 自定义过滤函数
 * - object: 详细的过滤配置
 */
export type LanguageFilter = 
  | string[] 
  | ((locale: string, info?: LanguageInfo) => boolean)
  | LanguageFilterConfig

/**
 * 语言过滤配置接口
 */
export interface LanguageFilterConfig {
  /** 包含的语言列表 */
  include?: string[]
  /** 排除的语言列表 */
  exclude?: string[]
  /** 按地区过滤 */
  regions?: string[]
  /** 按语言方向过滤 */
  directions?: ('ltr' | 'rtl')[]
  /** 自定义过滤函数 */
  custom?: (locale: string, info?: LanguageInfo) => boolean
}

/**
 * 语言配置接口
 * 
 * 定义语言启用/禁用和相关配置选项
 */
export interface LanguageConfig {
  /** 启用的语言列表或过滤器 */
  enabled?: LanguageFilter
  /** 禁用的语言列表 */
  disabled?: string[]
  /** 默认语言 */
  defaultLocale?: string
  /** 回退语言 */
  fallbackLocale?: string
  /** 是否启用自动检测 */
  autoDetect?: boolean
  /** 预加载的语言列表 */
  preload?: string[]
  /** 懒加载配置 */
  lazyLoad?: boolean
  /** 语言优先级配置 */
  priority?: Record<string, number>
}

/**
 * 选择性 I18n 配置选项
 * 
 * 扩展现有的 I18n 配置，添加语言选择功能
 */
export interface SelectiveI18nOptions {
  /** 语言配置 */
  languageConfig?: LanguageConfig
  /** 是否严格模式（只加载启用的语言） */
  strictMode?: boolean
  /** 语言加载策略 */
  loadingStrategy?: 'eager' | 'lazy' | 'on-demand'
  /** 最大并发加载数 */
  maxConcurrentLoads?: number
  /** 加载超时时间（毫秒） */
  loadTimeout?: number
}

/**
 * 语言注册表类
 * 
 * 管理可用语言列表和相关信息
 */
export class LanguageRegistry {
  private availableLanguages: Map<string, LanguageInfo> = new Map()
  private enabledLanguages: Set<string> = new Set()
  private disabledLanguages: Set<string> = new Set()
  private config: LanguageConfig

  /**
   * 构造函数
   * 
   * @param config 语言配置
   */
  constructor(config: LanguageConfig = {}) {
    this.config = config
    this.initializeLanguages()
    this.applyConfig()
  }

  /**
   * 初始化语言列表
   * 
   * 从内置语言包中加载所有可用语言信息
   */
  private initializeLanguages(): void {
    const builtInLocales = getBuiltInLocales()
    const builtInInfos = getBuiltInLanguageInfos()

    builtInInfos.forEach((info) => {
      this.availableLanguages.set(info.code, info)
    })

    // 添加别名支持
    builtInLocales.forEach((locale) => {
      if (!this.availableLanguages.has(locale)) {
        // 查找主语言信息
        const mainLocale = this.findMainLocale(locale)
        if (mainLocale) {
          const mainInfo = this.availableLanguages.get(mainLocale)
          if (mainInfo) {
            // 创建别名信息
            const aliasInfo: LanguageInfo = {
              ...mainInfo,
              code: locale,
            }
            this.availableLanguages.set(locale, aliasInfo)
          }
        }
      }
    })
  }

  /**
   * 查找主语言代码
   * 
   * @param locale 语言代码
   * @returns 主语言代码或 undefined
   */
  private findMainLocale(locale: string): string | undefined {
    // 简单的别名映射
    const aliasMap: Record<string, string> = {
      'zh': 'zh-CN',
      'en-US': 'en',
      'ja-JP': 'ja',
      'ko-KR': 'ko',
      'es-ES': 'es',
      'fr-FR': 'fr',
      'de-DE': 'de',
      'ru-RU': 'ru',
    }

    return aliasMap[locale]
  }

  /**
   * 应用语言配置
   * 
   * 根据配置启用或禁用语言
   */
  private applyConfig(): void {
    const { enabled, disabled, defaultLocale, fallbackLocale } = this.config

    // 重置状态
    this.enabledLanguages.clear()
    this.disabledLanguages.clear()

    // 处理禁用列表
    if (disabled) {
      disabled.forEach(locale => this.disabledLanguages.add(locale))
    }

    // 处理启用列表
    if (enabled) {
      const enabledLocales = this.applyLanguageFilter(enabled)
      enabledLocales.forEach(locale => {
        if (!this.disabledLanguages.has(locale)) {
          this.enabledLanguages.add(locale)
        }
      })
    } else {
      // 如果没有指定启用列表，默认启用所有可用语言
      this.availableLanguages.forEach((_, locale) => {
        if (!this.disabledLanguages.has(locale)) {
          this.enabledLanguages.add(locale)
        }
      })
    }

    // 确保默认语言和回退语言被启用
    if (defaultLocale && this.availableLanguages.has(defaultLocale)) {
      this.enabledLanguages.add(defaultLocale)
      this.disabledLanguages.delete(defaultLocale)
    }

    if (fallbackLocale && this.availableLanguages.has(fallbackLocale)) {
      this.enabledLanguages.add(fallbackLocale)
      this.disabledLanguages.delete(fallbackLocale)
    }
  }

  /**
   * 应用语言过滤器
   * 
   * @param filter 语言过滤器
   * @returns 过滤后的语言列表
   */
  private applyLanguageFilter(filter: LanguageFilter): string[] {
    if (Array.isArray(filter)) {
      // 直接返回语言代码列表
      return filter.filter(locale => this.availableLanguages.has(locale))
    }

    if (typeof filter === 'function') {
      // 使用自定义过滤函数
      return Array.from(this.availableLanguages.entries())
        .filter(([locale, info]) => filter(locale, info))
        .map(([locale]) => locale)
    }

    // 处理配置对象
    const config = filter as LanguageFilterConfig
    let result = Array.from(this.availableLanguages.keys())

    // 应用包含列表
    if (config.include) {
      result = result.filter(locale => config.include!.includes(locale))
    }

    // 应用排除列表
    if (config.exclude) {
      result = result.filter(locale => !config.exclude!.includes(locale))
    }

    // 按地区过滤
    if (config.regions) {
      result = result.filter(locale => {
        const info = this.availableLanguages.get(locale)
        return info && config.regions!.includes(info.region)
      })
    }

    // 按语言方向过滤
    if (config.directions) {
      result = result.filter(locale => {
        const info = this.availableLanguages.get(locale)
        return info && config.directions!.includes(info.direction)
      })
    }

    // 应用自定义过滤函数
    if (config.custom) {
      result = result.filter(locale => {
        const info = this.availableLanguages.get(locale)
        return config.custom!(locale, info)
      })
    }

    return result
  }

  /**
   * 获取所有可用语言
   * 
   * @returns 可用语言列表
   */
  getAvailableLanguages(): string[] {
    return Array.from(this.availableLanguages.keys())
  }

  /**
   * 获取启用的语言
   * 
   * @returns 启用的语言列表
   */
  getEnabledLanguages(): string[] {
    return Array.from(this.enabledLanguages)
  }

  /**
   * 获取禁用的语言
   * 
   * @returns 禁用的语言列表
   */
  getDisabledLanguages(): string[] {
    return Array.from(this.disabledLanguages)
  }

  /**
   * 检查语言是否启用
   * 
   * @param locale 语言代码
   * @returns 是否启用
   */
  isLanguageEnabled(locale: string): boolean {
    return this.enabledLanguages.has(locale)
  }

  /**
   * 检查语言是否可用
   * 
   * @param locale 语言代码
   * @returns 是否可用
   */
  isLanguageAvailable(locale: string): boolean {
    return this.availableLanguages.has(locale)
  }

  /**
   * 获取语言信息
   * 
   * @param locale 语言代码
   * @returns 语言信息或 undefined
   */
  getLanguageInfo(locale: string): LanguageInfo | undefined {
    return this.availableLanguages.get(locale)
  }

  /**
   * 启用语言
   * 
   * @param locale 语言代码
   * @returns 是否成功启用
   */
  enableLanguage(locale: string): boolean {
    if (!this.availableLanguages.has(locale)) {
      return false
    }

    this.enabledLanguages.add(locale)
    this.disabledLanguages.delete(locale)
    return true
  }

  /**
   * 禁用语言
   * 
   * @param locale 语言代码
   * @returns 是否成功禁用
   */
  disableLanguage(locale: string): boolean {
    if (!this.availableLanguages.has(locale)) {
      return false
    }

    this.disabledLanguages.add(locale)
    this.enabledLanguages.delete(locale)
    return true
  }

  /**
   * 更新配置
   * 
   * @param config 新的语言配置
   */
  updateConfig(config: LanguageConfig): void {
    this.config = { ...this.config, ...config }
    this.applyConfig()
  }

  /**
   * 获取当前配置
   * 
   * @returns 当前语言配置
   */
  getConfig(): LanguageConfig {
    return { ...this.config }
  }
}

/**
 * 创建语言注册表
 * 
 * @param config 语言配置
 * @returns 语言注册表实例
 * 
 * @example
 * ```typescript
 * // 只启用中文和英文
 * const registry = createLanguageRegistry({
 *   enabled: ['zh-CN', 'en']
 * })
 * 
 * // 使用过滤器启用亚洲语言
 * const registry = createLanguageRegistry({
 *   enabled: {
 *     regions: ['CN', 'JP', 'KR']
 *   }
 * })
 * 
 * // 使用自定义过滤函数
 * const registry = createLanguageRegistry({
 *   enabled: (locale, info) => {
 *     return info?.direction === 'ltr'
 *   }
 * })
 * ```
 */
export function createLanguageRegistry(config?: LanguageConfig): LanguageRegistry {
  return new LanguageRegistry(config)
}

/**
 * 默认导出语言注册表类
 */
export default LanguageRegistry
