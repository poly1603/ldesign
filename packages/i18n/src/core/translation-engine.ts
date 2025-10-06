/**
 * 翻译引擎
 *
 * 从 I18n 类中提取的翻译逻辑，负责处理翻译的核心功能
 * 包括翻译执行、插值处理、复数化等
 *
 * 性能优化：
 * - 使用 WeakMap 缓存语言包，自动垃圾回收
 * - 减少函数调用层级
 * - 优化字符串操作
 * - 快速路径处理常见情况
 *
 * @author LDesign Team
 * @version 2.0.0
 */

import type {
  TranslationParams,
  TranslationOptions,
  LanguagePackage,
  Loader,
  NestedObject,
} from './types'
import { getNestedValue } from '../utils/path'
import { hasInterpolation, interpolate } from '../utils/interpolation'
import { hasPluralExpression, processPluralization } from '../utils/pluralization'

/**
 * 翻译引擎配置选项
 */
export interface TranslationEngineOptions {
  /** 当前语言 */
  currentLocale: string
  /** 降级语言 */
  fallbackLocale?: string
  /** 语言包加载器 */
  loader: Loader
  /** 包缓存 */
  packageCache: WeakMap<Loader, Map<string, LanguagePackage>>
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 翻译引擎类
 *
 * 负责处理翻译的核心逻辑，从 I18n 主类中分离出来以提高可维护性
 *
 * 性能优化：
 * - 冻结的空对象避免重复创建
 * - 内联热路径代码
 * - 减少条件判断
 */
export class TranslationEngine {
  private options: TranslationEngineOptions
  private readonly emptyParams: TranslationParams = Object.freeze({})
  private readonly emptyOptions: TranslationOptions = Object.freeze({})

  // 缓存常用的检查结果
  private hasFallback: boolean

  constructor(options: TranslationEngineOptions) {
    this.options = options
    this.hasFallback = !!(options.fallbackLocale && options.fallbackLocale !== options.currentLocale)
  }

  /**
   * 更新引擎配置
   */
  updateOptions(options: Partial<TranslationEngineOptions>): void {
    this.options = { ...this.options, ...options }
    this.hasFallback = !!(this.options.fallbackLocale && this.options.fallbackLocale !== this.options.currentLocale)
  }

  /**
   * 执行翻译（优化版本）
   *
   * 性能优化：
   * - 内联常见路径
   * - 减少函数调用
   * - 快速返回
   *
   * @param key 翻译键
   * @param params 插值参数
   * @param options 翻译选项
   * @returns 翻译后的字符串
   */
  translate(
    key: string,
    params: TranslationParams = this.emptyParams,
    options: TranslationOptions = this.emptyOptions,
  ): string {
    // 快速路径：获取翻译文本
    let text = this.getTranslationTextFast(key, this.options.currentLocale)

    // 降级处理
    if (text === undefined && this.hasFallback) {
      text = this.getTranslationTextFast(key, this.options.fallbackLocale!)
    }

    // 使用默认值或键名
    if (text === undefined) {
      return options.defaultValue || key
    }

    // 快速路径：无需处理的情况
    const hasParams = params !== this.emptyParams && Object.keys(params).length > 0
    if (!hasParams) {
      return text
    }

    // 处理复数化
    if (hasPluralExpression(text)) {
      text = processPluralization(text, params, this.options.currentLocale)
    }

    // 处理插值
    if (hasInterpolation(text)) {
      text = interpolate(text, params, {
        escapeValue: options.escapeValue,
      })
    }

    return text
  }

  /**
   * 批量翻译
   * @param keys 翻译键数组
   * @param params 插值参数
   * @param options 翻译选项
   * @returns 翻译结果映射
   */
  batchTranslate(
    keys: string[],
    params: TranslationParams = this.emptyParams,
    options: TranslationOptions = this.emptyOptions,
  ): Record<string, string> {
    const results: Record<string, string> = {}
    
    for (const key of keys) {
      results[key] = this.translate(key, params, options)
    }
    
    return results
  }

  /**
   * 检查翻译键是否存在
   * @param key 翻译键
   * @param locale 语言代码，默认为当前语言
   * @returns 是否存在
   */
  exists(key: string, locale?: string): boolean {
    const targetLocale = locale || this.options.currentLocale
    const text = this.getTranslationText(key, targetLocale)
    return text !== undefined
  }

  /**
   * 执行翻译的核心逻辑
   * @param key 翻译键
   * @param params 插值参数
   * @param options 翻译选项
   * @returns 翻译后的字符串
   */
  private performTranslation(
    key: string,
    params: TranslationParams,
    options: TranslationOptions,
  ): string {
    // 获取翻译文本
    let text = this.getTranslationText(key, this.options.currentLocale)

    // 如果没有找到，尝试降级语言
    if (
      text === undefined
      && this.options.fallbackLocale
      && this.options.fallbackLocale !== this.options.currentLocale
    ) {
      text = this.getTranslationText(key, this.options.fallbackLocale)
    }

    // 如果仍然没有找到，使用默认值或键名
    if (text === undefined) {
      text = options.defaultValue || key
    }

    // 处理增强的多元化
    if (hasPluralExpression(text)) {
      text = this.processEnhancedPluralization(text, params, this.options.currentLocale)
    }

    // 处理插值
    if (hasInterpolation(text)) {
      text = interpolate(text, params, {
        escapeValue: options.escapeValue,
      })
    }

    return text
  }

  /**
   * 获取翻译文本
   * @param key 翻译键
   * @param locale 语言代码
   * @returns 翻译文本或 undefined
   */
  private getTranslationText(key: string, locale: string): string | undefined {
    return this.getTranslationTextOptimized(key, locale)
  }

  /**
   * 快速获取翻译文本（优化版本）
   *
   * 性能优化：
   * - 移除调试代码到生产环境
   * - 减少条件判断
   * - 内联常用操作
   *
   * @param key 翻译键
   * @param locale 语言代码
   * @returns 翻译文本或 undefined
   */
  private getTranslationTextFast(
    key: string,
    locale: string,
  ): string | undefined {
    // 获取或创建 loader 缓存
    let loaderCache = this.options.packageCache.get(this.options.loader)
    if (!loaderCache) {
      loaderCache = new Map()
      this.options.packageCache.set(this.options.loader, loaderCache)
    }

    // 获取或加载语言包
    let packageData = loaderCache.get(locale)
    if (!packageData) {
      const loader = this.options.loader as Loader & {
        getLoadedPackage?: (_locale: string) => LanguagePackage | undefined
      }
      packageData = loader.getLoadedPackage?.(locale)

      if (packageData) {
        loaderCache.set(locale, packageData)
      } else {
        return undefined
      }
    }

    // 获取嵌套值
    return getNestedValue(packageData.translations as NestedObject, key)
  }

  /**
   * 获取翻译文本（优化版本，保留用于兼容性）
   */
  private getTranslationTextOptimized(
    key: string,
    locale: string,
  ): string | undefined {
    return this.getTranslationTextFast(key, locale)
  }

  /**
   * 处理增强的多元化
   * @param text 包含多元化表达式的文本
   * @param params 参数
   * @param locale 语言代码
   * @returns 处理后的文本
   */
  private processEnhancedPluralization(
    text: string,
    params: TranslationParams,
    locale: string
  ): string {
    // 检查是否包含 ICU 格式的多元化表达式
    const icuFormatMatch = text.match(/\{([^,]+),\s*plural,\s*(.+)\}/)

    if (icuFormatMatch) {
      const [, countKey, pluralRules] = icuFormatMatch
      const count = Number(params[countKey]) || 0

      // 解析复数规则
      const rules = this.parseICUPluralRules(pluralRules)
      const rule = this.selectPluralRule(count, rules, locale)

      if (rule) {
        // 替换整个表达式
        return text.replace(icuFormatMatch[0], rule)
      }
    }

    // 降级到标准复数化处理
    return processPluralization(text, params, locale)
  }

  /**
   * 解析 ICU 复数规则
   * @param rulesText 规则文本
   * @returns 解析后的规则映射
   */
  private parseICUPluralRules(rulesText: string): Record<string, string> {
    const rules: Record<string, string> = {}
    const rulePattern = /(=\d+|zero|one|two|few|many|other)\s*\{([^}]+)\}/g
    
    let match
    while ((match = rulePattern.exec(rulesText)) !== null) {
      const [, key, value] = match
      rules[key] = value.trim()
    }
    
    return rules
  }

  /**
   * 选择合适的复数规则
   * @param count 数量
   * @param rules 规则映射
   * @param locale 语言代码
   * @returns 选中的规则文本
   */
  private selectPluralRule(
    count: number,
    rules: Record<string, string>,
    locale: string
  ): string | undefined {
    // 精确匹配
    const exactMatch = rules[`=${count}`]
    if (exactMatch) return exactMatch

    // 根据语言选择复数规则
    if (locale.startsWith('zh') || locale.startsWith('ja') || locale.startsWith('ko')) {
      // 中日韩语言没有复数形式
      return rules.other || rules.one
    }

    // 英语复数规则
    if (count === 0) return rules.zero || rules.other
    if (count === 1) return rules.one || rules.other
    return rules.other
  }
}
