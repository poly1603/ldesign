import type { PluralRule } from './types'

/**
 * 多元化类别
 */
export enum PluralCategory {
  ZERO = 'zero',
  ONE = 'one',
  TWO = 'two',
  FEW = 'few',
  MANY = 'many',
  OTHER = 'other',
}

/**
 * 多元化规则函数类型
 */
export type PluralRuleFunction = (count: number, ordinal?: boolean) => PluralCategory

/**
 * 多元化选项
 */
export interface PluralOptions {
  /** 是否为序数 */
  ordinal?: boolean
  /** 自定义规则 */
  customRule?: PluralRuleFunction
}

/**
 * 增强的多元化引擎
 */
export class PluralizationEngine {
  private rules = new Map<string, PluralRuleFunction>()
  private cache = new Map<string, PluralCategory>()

  constructor() {
    this.initializeDefaultRules()
  }

  /**
   * 获取多元化类别
   * @param locale 语言代码
   * @param count 数量
   * @param options 选项
   * @returns 多元化类别
   */
  getCategory(locale: string, count: number, options: PluralOptions = {}): PluralCategory {
    const cacheKey = `${locale}:${count}:${options.ordinal || false}`
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    let category: PluralCategory

    // 使用自定义规则
    if (options.customRule) {
      category = options.customRule(count, options.ordinal)
    } else {
      // 使用内置规则
      const rule = this.rules.get(locale) || this.rules.get('en')!
      category = rule(count, options.ordinal)
    }

    // 缓存结果
    this.cache.set(cacheKey, category)
    
    return category
  }

  /**
   * 注册多元化规则
   * @param locale 语言代码
   * @param rule 规则函数
   */
  registerRule(locale: string, rule: PluralRuleFunction): void {
    this.rules.set(locale, rule)
    // 清除相关缓存
    this.clearCacheForLocale(locale)
  }

  /**
   * 获取支持的语言列表
   * @returns 语言代码数组
   */
  getSupportedLocales(): string[] {
    return Array.from(this.rules.keys())
  }

  /**
   * 清除缓存
   * @param locale 可选的语言代码
   */
  clearCache(locale?: string): void {
    if (locale) {
      this.clearCacheForLocale(locale)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 初始化默认规则
   */
  private initializeDefaultRules(): void {
    // 英语规则
    this.rules.set('en', (count: number, ordinal = false) => {
      if (ordinal) {
        const mod10 = count % 10
        const mod100 = count % 100
        if (mod10 === 1 && mod100 !== 11) return PluralCategory.ONE
        if (mod10 === 2 && mod100 !== 12) return PluralCategory.TWO
        if (mod10 === 3 && mod100 !== 13) return PluralCategory.FEW
        return PluralCategory.OTHER
      }
      return count === 1 ? PluralCategory.ONE : PluralCategory.OTHER
    })

    // 中文规则（简体和繁体）
    const chineseRule = () => PluralCategory.OTHER
    this.rules.set('zh', chineseRule)
    this.rules.set('zh-CN', chineseRule)
    this.rules.set('zh-TW', chineseRule)

    // 日语规则
    this.rules.set('ja', () => PluralCategory.OTHER)

    // 俄语规则
    this.rules.set('ru', (count: number, ordinal = false) => {
      if (ordinal) return PluralCategory.OTHER
      
      const mod10 = count % 10
      const mod100 = count % 100
      
      if (mod10 === 1 && mod100 !== 11) return PluralCategory.ONE
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return PluralCategory.FEW
      return PluralCategory.MANY
    })

    // 法语规则
    this.rules.set('fr', (count: number, ordinal = false) => {
      if (ordinal) {
        return count === 1 ? PluralCategory.ONE : PluralCategory.OTHER
      }
      return count >= 0 && count < 2 ? PluralCategory.ONE : PluralCategory.OTHER
    })

    // 德语规则
    this.rules.set('de', (count: number, ordinal = false) => {
      if (ordinal) return PluralCategory.OTHER
      return count === 1 ? PluralCategory.ONE : PluralCategory.OTHER
    })

    // 西班牙语规则
    this.rules.set('es', (count: number, ordinal = false) => {
      if (ordinal) return PluralCategory.OTHER
      return count === 1 ? PluralCategory.ONE : PluralCategory.OTHER
    })

    // 阿拉伯语规则
    this.rules.set('ar', (count: number, ordinal = false) => {
      if (ordinal) return PluralCategory.OTHER
      
      if (count === 0) return PluralCategory.ZERO
      if (count === 1) return PluralCategory.ONE
      if (count === 2) return PluralCategory.TWO
      if (count % 100 >= 3 && count % 100 <= 10) return PluralCategory.FEW
      if (count % 100 >= 11 && count % 100 <= 99) return PluralCategory.MANY
      return PluralCategory.OTHER
    })

    // 波兰语规则
    this.rules.set('pl', (count: number, ordinal = false) => {
      if (ordinal) return PluralCategory.OTHER
      
      if (count === 1) return PluralCategory.ONE
      
      const mod10 = count % 10
      const mod100 = count % 100
      
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return PluralCategory.FEW
      }
      
      return PluralCategory.MANY
    })
  }

  /**
   * 清除特定语言的缓存
   * @param locale 语言代码
   */
  private clearCacheForLocale(locale: string): void {
    const keysToDelete: string[] = []
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${locale}:`)) {
        keysToDelete.push(key)
      }
    }
    
    for (const key of keysToDelete) {
      this.cache.delete(key)
    }
  }
}

/**
 * 多元化工具函数
 */
export class PluralUtils {
  /**
   * 解析多元化字符串
   * @param pluralString 多元化字符串，格式如 "zero:没有|one:一个|other:{{count}}个"
   * @returns 解析后的对象
   */
  static parsePluralString(pluralString: string): Record<PluralCategory, string> {
    const result: Partial<Record<PluralCategory, string>> = {}
    
    const parts = pluralString.split('|')
    
    for (const part of parts) {
      const [category, text] = part.split(':')
      if (category && text && Object.values(PluralCategory).includes(category as PluralCategory)) {
        result[category as PluralCategory] = text.trim()
      }
    }
    
    return result as Record<PluralCategory, string>
  }

  /**
   * 格式化多元化文本
   * @param pluralObject 多元化对象
   * @param category 类别
   * @param count 数量
   * @param params 参数
   * @returns 格式化后的文本
   */
  static formatPluralText(
    pluralObject: Record<PluralCategory, string>,
    category: PluralCategory,
    count: number,
    params: Record<string, any> = {}
  ): string {
    let text = pluralObject[category] || pluralObject[PluralCategory.OTHER] || ''
    
    // 替换 count 参数
    text = text.replace(/\{\{count\}\}/g, count.toString())
    
    // 替换其他参数
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      text = text.replace(regex, String(value))
    }
    
    return text
  }

  /**
   * 验证多元化对象
   * @param pluralObject 多元化对象
   * @returns 是否有效
   */
  static validatePluralObject(pluralObject: any): pluralObject is Record<PluralCategory, string> {
    if (!pluralObject || typeof pluralObject !== 'object') {
      return false
    }

    // 至少需要有 other 类别
    if (!pluralObject[PluralCategory.OTHER]) {
      return false
    }

    // 检查所有值是否为字符串
    for (const value of Object.values(pluralObject)) {
      if (typeof value !== 'string') {
        return false
      }
    }

    return true
  }
}

// 导出全局实例
export const pluralizationEngine = new PluralizationEngine()
