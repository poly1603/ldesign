/**
 * 格式化器类型
 */
export type FormatterFunction = (value: any, locale: string, options?: any) => string

/**
 * 格式化器配置
 */
export interface FormatterConfig {
  /** 默认语言 */
  defaultLocale?: string
  /** 时区 */
  timeZone?: string
  /** 货币代码 */
  currency?: string
  /** 自定义格式化器 */
  customFormatters?: Record<string, FormatterFunction>
}

/**
 * 日期格式化选项
 */
export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  /** 相对时间格式 */
  relative?: boolean
  /** 相对时间单位 */
  relativeUnit?: 'auto' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
}

/**
 * 数字格式化选项
 */
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  /** 是否使用紧凑格式 */
  compact?: boolean
  /** 紧凑显示类型 */
  compactDisplay?: 'short' | 'long'
}

/**
 * 增强的格式化引擎
 */
export class FormatterEngine {
  private config: Required<FormatterConfig>
  private formatters = new Map<string, FormatterFunction>()
  private cache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat | Intl.RelativeTimeFormat>()

  constructor(config: FormatterConfig = {}) {
    this.config = {
      defaultLocale: 'en',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: 'USD',
      customFormatters: {},
      ...config,
    }

    this.initializeBuiltinFormatters()
  }

  /**
   * 格式化日期
   * @param date 日期
   * @param locale 语言代码
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  formatDate(date: Date | number | string, locale?: string, options: DateFormatOptions = {}): string {
    const targetLocale = locale || this.config.defaultLocale
    const dateObj = new Date(date)

    if (isNaN(dateObj.getTime())) {
      return String(date)
    }

    if (options.relative) {
      return this.formatRelativeTime(dateObj, targetLocale, options.relativeUnit)
    }

    const cacheKey = `date:${targetLocale}:${JSON.stringify(options)}`
    let formatter = this.cache.get(cacheKey) as Intl.DateTimeFormat

    if (!formatter) {
      formatter = new Intl.DateTimeFormat(targetLocale, {
        timeZone: this.config.timeZone,
        ...options,
      })
      this.cache.set(cacheKey, formatter)
    }

    return formatter.format(dateObj)
  }

  /**
   * 格式化数字
   * @param number 数字
   * @param locale 语言代码
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  formatNumber(number: number, locale?: string, options: NumberFormatOptions = {}): string {
    const targetLocale = locale || this.config.defaultLocale

    if (typeof number !== 'number' || isNaN(number)) {
      return String(number)
    }

    const cacheKey = `number:${targetLocale}:${JSON.stringify(options)}`
    let formatter = this.cache.get(cacheKey) as Intl.NumberFormat

    if (!formatter) {
      const formatOptions: Intl.NumberFormatOptions = { ...options }

      // 处理紧凑格式
      if (options.compact) {
        formatOptions.notation = 'compact'
        formatOptions.compactDisplay = options.compactDisplay || 'short'
      }

      formatter = new Intl.NumberFormat(targetLocale, formatOptions)
      this.cache.set(cacheKey, formatter)
    }

    return formatter.format(number)
  }

  /**
   * 格式化货币
   * @param amount 金额
   * @param locale 语言代码
   * @param currency 货币代码
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  formatCurrency(amount: number, locale?: string, currency?: string, options: Intl.NumberFormatOptions = {}): string {
    const targetLocale = locale || this.config.defaultLocale
    const targetCurrency = currency || this.config.currency

    return this.formatNumber(amount, targetLocale, {
      style: 'currency',
      currency: targetCurrency,
      ...options,
    })
  }

  /**
   * 格式化百分比
   * @param value 值（0-1之间）
   * @param locale 语言代码
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  formatPercent(value: number, locale?: string, options: Intl.NumberFormatOptions = {}): string {
    const targetLocale = locale || this.config.defaultLocale

    return this.formatNumber(value, targetLocale, {
      style: 'percent',
      ...options,
    })
  }

  /**
   * 格式化相对时间
   * @param date 日期
   * @param locale 语言代码
   * @param unit 时间单位
   * @returns 格式化后的字符串
   */
  formatRelativeTime(date: Date, locale?: string, unit: DateFormatOptions['relativeUnit'] = 'auto'): string {
    const targetLocale = locale || this.config.defaultLocale
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()

    let targetUnit: Intl.RelativeTimeFormatUnit
    let value: number

    if (unit === 'auto') {
      const absDiffMs = Math.abs(diffMs)

      if (absDiffMs < 60000) { // 小于1分钟
        targetUnit = 'second'
        value = Math.round(diffMs / 1000)
      } else if (absDiffMs < 3600000) { // 小于1小时
        targetUnit = 'minute'
        value = Math.round(diffMs / 60000)
      } else if (absDiffMs < 86400000) { // 小于1天
        targetUnit = 'hour'
        value = Math.round(diffMs / 3600000)
      } else if (absDiffMs < 604800000) { // 小于1周
        targetUnit = 'day'
        value = Math.round(diffMs / 86400000)
      } else if (absDiffMs < 2629746000) { // 小于1月
        targetUnit = 'week'
        value = Math.round(diffMs / 604800000)
      } else if (absDiffMs < 31556952000) { // 小于1年
        targetUnit = 'month'
        value = Math.round(diffMs / 2629746000)
      } else {
        targetUnit = 'year'
        value = Math.round(diffMs / 31556952000)
      }
    } else {
      targetUnit = unit as Intl.RelativeTimeFormatUnit

      switch (unit) {
        case 'second':
          value = Math.round(diffMs / 1000)
          break
        case 'minute':
          value = Math.round(diffMs / 60000)
          break
        case 'hour':
          value = Math.round(diffMs / 3600000)
          break
        case 'day':
          value = Math.round(diffMs / 86400000)
          break
        case 'week':
          value = Math.round(diffMs / 604800000)
          break
        case 'month':
          value = Math.round(diffMs / 2629746000)
          break
        case 'year':
          value = Math.round(diffMs / 31556952000)
          break
        default:
          value = Math.round(diffMs / 1000)
          targetUnit = 'second'
      }
    }

    const cacheKey = `relative:${targetLocale}`
    let formatter = this.cache.get(cacheKey) as Intl.RelativeTimeFormat

    if (!formatter) {
      formatter = new Intl.RelativeTimeFormat(targetLocale, { numeric: 'auto' })
      this.cache.set(cacheKey, formatter)
    }

    return formatter.format(value, targetUnit)
  }

  /**
   * 格式化列表
   * @param items 项目列表
   * @param locale 语言代码
   * @param options 格式化选项
   * @returns 格式化后的字符串
   */
  formatList(items: string[], locale?: string, options: any = {}): string {
    const targetLocale = locale || this.config.defaultLocale

    if (!Array.isArray(items) || items.length === 0) {
      return ''
    }

    if (items.length === 1) {
      return items[0]
    }

    // 检查是否支持 Intl.ListFormat
    if (typeof (Intl as any).ListFormat === 'function') {
      const cacheKey = `list:${targetLocale}:${JSON.stringify(options)}`
      let formatter = this.cache.get(cacheKey) as any

      if (!formatter) {
        formatter = new (Intl as any).ListFormat(targetLocale, options)
        this.cache.set(cacheKey, formatter)
      }

      return formatter.format(items)
    }

    // 回退实现
    const style = options.style || 'long'
    const type = options.type || 'conjunction'

    if (items.length === 2) {
      const connector = type === 'disjunction' ? ' or ' : ' and '
      return `${items[0]}${connector}${items[1]}`
    }

    const lastItem = items[items.length - 1]
    const otherItems = items.slice(0, -1)
    const connector = type === 'disjunction' ? ', or ' : ', and '

    return `${otherItems.join(', ')}${connector}${lastItem}`
  }

  /**
   * 注册自定义格式化器
   * @param name 格式化器名称
   * @param formatter 格式化器函数
   */
  registerFormatter(name: string, formatter: FormatterFunction): void {
    this.formatters.set(name, formatter)
  }

  /**
   * 使用自定义格式化器
   * @param name 格式化器名称
   * @param value 值
   * @param locale 语言代码
   * @param options 选项
   * @returns 格式化后的字符串
   */
  format(name: string, value: any, locale?: string, options?: any): string {
    const formatter = this.formatters.get(name)

    if (!formatter) {
      throw new Error(`Formatter '${name}' not found`)
    }

    return formatter(value, locale || this.config.defaultLocale, options)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取支持的语言列表
   * @returns 语言代码数组
   */
  getSupportedLocales(): string[] {
    return Intl.DateTimeFormat.supportedLocalesOf(Intl.DateTimeFormat.supportedLocalesOf(['*']))
  }

  /**
   * 初始化内置格式化器
   */
  private initializeBuiltinFormatters(): void {
    // 文件大小格式化器
    this.registerFormatter('fileSize', (bytes: number, locale: string) => {
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = bytes
      let unitIndex = 0

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }

      return `${this.formatNumber(size, locale, { maximumFractionDigits: 2 })} ${units[unitIndex]}`
    })

    // 持续时间格式化器
    this.registerFormatter('duration', (seconds: number, locale: string, options: { format?: 'short' | 'long' } = {}) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60

      if (options.format === 'short') {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }

      const parts: string[] = []
      if (hours > 0) parts.push(`${hours}h`)
      if (minutes > 0) parts.push(`${minutes}m`)
      if (secs > 0) parts.push(`${secs}s`)

      return parts.join(' ')
    })

    // 注册用户配置的自定义格式化器
    for (const [name, formatter] of Object.entries(this.config.customFormatters)) {
      this.registerFormatter(name, formatter)
    }
  }
}

// 导出全局实例
export const formatterEngine = new FormatterEngine()
