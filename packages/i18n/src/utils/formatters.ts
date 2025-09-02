/**
 * 格式化工具函数
 * 
 * 提供数字、日期、货币、相对时间等格式化功能
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

/**
 * 数字格式化选项
 */
export interface NumberFormatOptions {
  locale?: string
  style?: 'decimal' | 'currency' | 'percent'
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
}

/**
 * 日期格式化选项
 */
export interface DateFormatOptions {
  locale?: string
  year?: 'numeric' | '2-digit'
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
  day?: 'numeric' | '2-digit'
  hour?: 'numeric' | '2-digit'
  minute?: 'numeric' | '2-digit'
  second?: 'numeric' | '2-digit'
  timeZone?: string
  hour12?: boolean
}

/**
 * 货币格式化选项
 */
export interface CurrencyFormatOptions {
  locale?: string
  currency: string
  currencyDisplay?: 'symbol' | 'code' | 'name'
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * 相对时间格式化选项
 */
export interface RelativeTimeFormatOptions {
  locale?: string
  numeric?: 'always' | 'auto'
  style?: 'long' | 'short' | 'narrow'
}

/**
 * 格式化数字
 * 
 * @param value 要格式化的数字
 * @param options 格式化选项
 * @returns 格式化后的字符串
 * 
 * @example
 * ```typescript
 * formatNumber(1234.56, { locale: 'zh-CN' }) // '1,234.56'
 * formatNumber(0.123, { style: 'percent' }) // '12.3%'
 * ```
 */
export function formatNumber(value: number, options: NumberFormatOptions = {}): string {
  const {
    locale = 'en-US',
    style = 'decimal',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping = true,
  } = options

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style,
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping,
    })

    return formatter.format(value)
  } catch (error) {
    console.warn('Number formatting failed:', error)
    return value.toString()
  }
}

/**
 * 格式化日期
 * 
 * @param date 要格式化的日期
 * @param options 格式化选项
 * @returns 格式化后的字符串
 * 
 * @example
 * ```typescript
 * formatDate(new Date(), { locale: 'zh-CN', year: 'numeric', month: 'long', day: 'numeric' })
 * // '2024年1月1日'
 * ```
 */
export function formatDate(date: Date | string | number, options: DateFormatOptions = {}): string {
  const {
    locale = 'en-US',
    ...formatOptions
  } = options

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date')
    }

    const formatter = new Intl.DateTimeFormat(locale, formatOptions)
    return formatter.format(dateObj)
  } catch (error) {
    console.warn('Date formatting failed:', error)
    return date.toString()
  }
}

/**
 * 格式化货币
 * 
 * @param value 要格式化的金额
 * @param options 格式化选项
 * @returns 格式化后的字符串
 * 
 * @example
 * ```typescript
 * formatCurrency(1234.56, { locale: 'zh-CN', currency: 'CNY' }) // '¥1,234.56'
 * formatCurrency(1234.56, { locale: 'en-US', currency: 'USD' }) // '$1,234.56'
 * ```
 */
export function formatCurrency(value: number, options: CurrencyFormatOptions): string {
  const {
    locale = 'en-US',
    currency,
    currencyDisplay = 'symbol',
    minimumFractionDigits,
    maximumFractionDigits,
  } = options

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay,
      minimumFractionDigits,
      maximumFractionDigits,
    })

    return formatter.format(value)
  } catch (error) {
    console.warn('Currency formatting failed:', error)
    return `${currency} ${value}`
  }
}

/**
 * 格式化相对时间
 * 
 * @param value 时间差值
 * @param unit 时间单位
 * @param options 格式化选项
 * @returns 格式化后的字符串
 * 
 * @example
 * ```typescript
 * formatRelativeTime(-1, 'day', { locale: 'zh-CN' }) // '1天前'
 * formatRelativeTime(2, 'hour', { locale: 'en-US' }) // 'in 2 hours'
 * ```
 */
export function formatRelativeTime(
  value: number,
  unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
  options: RelativeTimeFormatOptions = {}
): string {
  const {
    locale = 'en-US',
    numeric = 'always',
    style = 'long',
  } = options

  try {
    const formatter = new Intl.RelativeTimeFormat(locale, {
      numeric,
      style,
    })

    return formatter.format(value, unit)
  } catch (error) {
    console.warn('Relative time formatting failed:', error)
    
    // 降级处理
    const absValue = Math.abs(value)
    const suffix = value < 0 ? 'ago' : 'later'
    return `${absValue} ${unit}${absValue !== 1 ? 's' : ''} ${suffix}`
  }
}

/**
 * 智能相对时间格式化
 * 
 * 自动选择合适的时间单位进行格式化
 * 
 * @param date 目标日期
 * @param baseDate 基准日期（默认为当前时间）
 * @param options 格式化选项
 * @returns 格式化后的字符串
 * 
 * @example
 * ```typescript
 * const now = new Date()
 * const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
 * 
 * formatSmartRelativeTime(yesterday) // '1 day ago'
 * ```
 */
export function formatSmartRelativeTime(
  date: Date | string | number,
  baseDate: Date = new Date(),
  options: RelativeTimeFormatOptions = {}
): string {
  try {
    const targetDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    
    if (isNaN(targetDate.getTime()) || isNaN(baseDate.getTime())) {
      throw new Error('Invalid date')
    }

    const diffMs = targetDate.getTime() - baseDate.getTime()
    const diffSeconds = Math.round(diffMs / 1000)
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.round(diffMs / (1000 * 60 * 60 * 24 * 7))
    const diffMonths = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30))
    const diffYears = Math.round(diffMs / (1000 * 60 * 60 * 24 * 365))

    // 选择合适的单位
    if (Math.abs(diffYears) >= 1) {
      return formatRelativeTime(diffYears, 'year', options)
    } else if (Math.abs(diffMonths) >= 1) {
      return formatRelativeTime(diffMonths, 'month', options)
    } else if (Math.abs(diffWeeks) >= 1) {
      return formatRelativeTime(diffWeeks, 'week', options)
    } else if (Math.abs(diffDays) >= 1) {
      return formatRelativeTime(diffDays, 'day', options)
    } else if (Math.abs(diffHours) >= 1) {
      return formatRelativeTime(diffHours, 'hour', options)
    } else if (Math.abs(diffMinutes) >= 1) {
      return formatRelativeTime(diffMinutes, 'minute', options)
    } else {
      return formatRelativeTime(diffSeconds, 'second', options)
    }
  } catch (error) {
    console.warn('Smart relative time formatting failed:', error)
    return date.toString()
  }
}

/**
 * 格式化文件大小
 * 
 * @param bytes 字节数
 * @param locale 语言环境
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 * 
 * @example
 * ```typescript
 * formatFileSize(1024) // '1 KB'
 * formatFileSize(1048576) // '1 MB'
 * ```
 */
export function formatFileSize(bytes: number, locale = 'en-US', decimals = 1): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  const value = bytes / Math.pow(k, i)
  const formattedValue = formatNumber(value, {
    locale,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })

  return `${formattedValue} ${sizes[i]}`
}

/**
 * 格式化百分比
 * 
 * @param value 数值（0-1 之间）
 * @param options 格式化选项
 * @returns 格式化后的字符串
 * 
 * @example
 * ```typescript
 * formatPercentage(0.1234) // '12.34%'
 * formatPercentage(0.5, { maximumFractionDigits: 0 }) // '50%'
 * ```
 */
export function formatPercentage(value: number, options: NumberFormatOptions = {}): string {
  return formatNumber(value, {
    ...options,
    style: 'percent',
  })
}

/**
 * 默认导出
 */
export default {
  formatNumber,
  formatDate,
  formatCurrency,
  formatRelativeTime,
  formatSmartRelativeTime,
  formatFileSize,
  formatPercentage,
}
