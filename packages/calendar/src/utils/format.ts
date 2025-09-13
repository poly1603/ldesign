/**
 * 格式化工具函数
 * 
 * 提供各种数据格式化功能：
 * - 日期时间格式化
 * - 数字格式化
 * - 文本格式化
 * - 持续时间格式化
 * - 文件大小格式化
 */

import { i18n } from './i18n'

/**
 * 日期格式化器
 */
export class DateFormatter {
  /**
   * 格式化日期
   * @param date 日期
   * @param format 格式字符串
   * @param locale 语言环境
   */
  static format(date: Date | string | number, format: string, locale?: string): string {
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return 'Invalid Date'
    }

    const currentLocale = locale || i18n.getCurrentLanguage()

    // 使用Intl.DateTimeFormat进行本地化格式化
    if (format === 'short') {
      return new Intl.DateTimeFormat(currentLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(d)
    }

    if (format === 'medium') {
      return new Intl.DateTimeFormat(currentLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(d)
    }

    if (format === 'long') {
      return new Intl.DateTimeFormat(currentLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(d)
    }

    if (format === 'full') {
      return new Intl.DateTimeFormat(currentLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d)
    }

    // 自定义格式化
    return DateFormatter.customFormat(d, format)
  }

  /**
   * 自定义格式化
   * @param date 日期对象
   * @param format 格式字符串
   */
  private static customFormat(date: Date, format: string): string {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    const formatMap: Record<string, string> = {
      'YYYY': year.toString(),
      'YY': year.toString().slice(-2),
      'MM': month.toString().padStart(2, '0'),
      'M': month.toString(),
      'DD': day.toString().padStart(2, '0'),
      'D': day.toString(),
      'HH': hour.toString().padStart(2, '0'),
      'H': hour.toString(),
      'mm': minute.toString().padStart(2, '0'),
      'm': minute.toString(),
      'ss': second.toString().padStart(2, '0'),
      's': second.toString(),
    }

    let result = format
    Object.entries(formatMap).forEach(([key, value]) => {
      result = result.replace(new RegExp(key, 'g'), value)
    })

    return result
  }

  /**
   * 格式化时间
   * @param date 日期
   * @param format 格式（12h/24h）
   * @param locale 语言环境
   */
  static formatTime(date: Date | string | number, format: '12h' | '24h' = '24h', locale?: string): string {
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return 'Invalid Time'
    }

    const currentLocale = locale || i18n.getCurrentLanguage()

    return new Intl.DateTimeFormat(currentLocale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12h',
    }).format(d)
  }

  /**
   * 格式化相对时间
   * @param date 日期
   * @param baseDate 基准日期
   * @param locale 语言环境
   */
  static formatRelative(date: Date | string | number, baseDate?: Date, locale?: string): string {
    const d = new Date(date)
    const base = baseDate || new Date()

    if (isNaN(d.getTime())) {
      return 'Invalid Date'
    }

    const diff = d.getTime() - base.getTime()
    const absDiff = Math.abs(diff)
    const isPast = diff < 0

    // 计算时间差
    const seconds = Math.floor(absDiff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    let key: string
    let value: number | undefined

    if (years > 0) {
      key = years === 1 ? 'y' : 'yy'
      value = years
    } else if (months > 0) {
      key = months === 1 ? 'M' : 'MM'
      value = months
    } else if (days > 0) {
      key = days === 1 ? 'd' : 'dd'
      value = days
    } else if (hours > 0) {
      key = hours === 1 ? 'h' : 'hh'
      value = hours
    } else if (minutes > 0) {
      key = minutes === 1 ? 'm' : 'mm'
      value = minutes
    } else {
      key = 's'
    }

    const relativeText = i18n.formatRelativeTime(key as any, value)
    return isPast ? i18n.formatRelativeTime('past').replace('%s', relativeText) :
      i18n.formatRelativeTime('future').replace('%s', relativeText)
  }

  /**
   * 格式化持续时间
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param locale 语言环境
   */
  static formatDuration(startDate: Date | string | number, endDate: Date | string | number, locale?: string): string {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid Duration'
    }

    const diff = end.getTime() - start.getTime()
    if (diff < 0) {
      return 'Invalid Duration'
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    const parts: string[] = []

    if (days > 0) {
      parts.push(`${days}天`)
    }
    if (hours > 0) {
      parts.push(`${hours}小时`)
    }
    if (minutes > 0) {
      parts.push(`${minutes}分钟`)
    }

    if (parts.length === 0) {
      return '不到1分钟'
    }

    return parts.join('')
  }
}

/**
 * 数字格式化器
 */
export class NumberFormatter {
  /**
   * 格式化数字
   * @param number 数字
   * @param options 格式化选项
   * @param locale 语言环境
   */
  static format(
    number: number,
    options: Intl.NumberFormatOptions = {},
    locale?: string
  ): string {
    const currentLocale = locale || i18n.getCurrentLanguage()
    return new Intl.NumberFormat(currentLocale, options).format(number)
  }

  /**
   * 格式化货币
   * @param amount 金额
   * @param currency 货币代码
   * @param locale 语言环境
   */
  static formatCurrency(amount: number, currency: string = 'CNY', locale?: string): string {
    return this.format(amount, {
      style: 'currency',
      currency,
    }, locale)
  }

  /**
   * 格式化百分比
   * @param value 数值（0-1）
   * @param locale 语言环境
   */
  static formatPercent(value: number, locale?: string): string {
    return this.format(value, {
      style: 'percent',
    }, locale)
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @param decimals 小数位数
   */
  static formatFileSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`
  }

  /**
   * 格式化序数
   * @param number 数字
   * @param locale 语言环境
   */
  static formatOrdinal(number: number, locale?: string): string {
    const currentLocale = locale || i18n.getCurrentLanguage()

    if (currentLocale.startsWith('zh')) {
      return `第${number}`
    }

    // 英文序数
    const suffixes = ['th', 'st', 'nd', 'rd']
    const mod100 = number % 100
    const suffix = suffixes[(mod100 - 20) % 10] || suffixes[mod100] || suffixes[0]

    return `${number}${suffix}`
  }
}

/**
 * 文本格式化器
 */
export class TextFormatter {
  /**
   * 截断文本
   * @param text 文本
   * @param maxLength 最大长度
   * @param suffix 后缀
   */
  static truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) {
      return text
    }
    return text.slice(0, maxLength - suffix.length) + suffix
  }

  /**
   * 首字母大写
   * @param text 文本
   */
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  /**
   * 标题格式化（每个单词首字母大写）
   * @param text 文本
   */
  static titleCase(text: string): string {
    return text.replace(/\b\w+/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }

  /**
   * 驼峰命名转换
   * @param text 文本
   */
  static camelCase(text: string): string {
    return text.replace(/[-_\s]+(.)?/g, (_, char) =>
      char ? char.toUpperCase() : ''
    )
  }

  /**
   * 短横线命名转换
   * @param text 文本
   */
  static kebabCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }

  /**
   * 下划线命名转换
   * @param text 文本
   */
  static snakeCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase()
  }

  /**
   * 移除HTML标签
   * @param html HTML字符串
   */
  static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '')
  }

  /**
   * 转义HTML字符
   * @param text 文本
   */
  static escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * 反转义HTML字符
   * @param html HTML字符串
   */
  static unescapeHtml(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || ''
  }

  /**
   * 格式化电话号码
   * @param phone 电话号码
   */
  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length === 11) {
      // 中国手机号码格式
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
    }

    if (cleaned.length === 10) {
      // 美国电话号码格式
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    }

    return phone
  }

  /**
   * 格式化身份证号码
   * @param idCard 身份证号码
   */
  static formatIdCard(idCard: string): string {
    if (idCard.length === 18) {
      return idCard.replace(/(\d{6})(\d{8})(\d{4})/, '$1 $2 $3')
    }
    return idCard
  }
}

// 导出便捷函数
export const formatDate = DateFormatter.format
export const formatTime = DateFormatter.formatTime
export const formatRelative = DateFormatter.formatRelative
export const formatDuration = DateFormatter.formatDuration
export const formatNumber = NumberFormatter.format
export const formatCurrency = NumberFormatter.formatCurrency
export const formatPercent = NumberFormatter.formatPercent
export const formatFileSize = NumberFormatter.formatFileSize
export const truncate = TextFormatter.truncate
export const capitalize = TextFormatter.capitalize
export const titleCase = TextFormatter.titleCase
