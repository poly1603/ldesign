/**
 * 数据格式化工具
 * 
 * @description
 * 提供货币、百分比、数字、日期等数据的格式化功能。
 * 支持国际化、自定义格式、精度控制等。
 */

/**
 * 货币格式化选项
 */
export interface CurrencyFormatOptions {
  /** 货币代码 */
  currency?: string
  /** 语言环境 */
  locale?: string
  /** 小数位数 */
  minimumFractionDigits?: number
  /** 最大小数位数 */
  maximumFractionDigits?: number
  /** 是否显示货币符号 */
  showSymbol?: boolean
}

/**
 * 数字格式化选项
 */
export interface NumberFormatOptions {
  /** 语言环境 */
  locale?: string
  /** 小数位数 */
  minimumFractionDigits?: number
  /** 最大小数位数 */
  maximumFractionDigits?: number
  /** 是否使用千分位分隔符 */
  useGrouping?: boolean
  /** 自定义千分位分隔符 */
  groupingSeparator?: string
  /** 自定义小数点分隔符 */
  decimalSeparator?: string
}

/**
 * 格式化货币
 * 
 * @param amount - 金额
 * @param options - 格式化选项
 * @returns 格式化后的货币字符串
 * 
 * @example
 * ```typescript
 * formatCurrency(1234.56) // '¥1,234.56'
 * formatCurrency(1234.56, { currency: 'USD', locale: 'en-US' }) // '$1,234.56'
 * formatCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' }) // '1.234,56 €'
 * formatCurrency(1234, { minimumFractionDigits: 2 }) // '¥1,234.00'
 * ```
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'CNY',
    locale = 'zh-CN',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: showSymbol ? currency : undefined,
      minimumFractionDigits,
      maximumFractionDigits,
    })

    return formatter.format(amount)
  } catch (error) {
    // 降级处理
    const symbol = showSymbol ? getCurrencySymbol(currency) : ''
    const formatted = formatNumber(amount, {
      locale,
      minimumFractionDigits,
      maximumFractionDigits,
    })
    return `${symbol}${formatted}`
  }
}

/**
 * 获取货币符号
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    KRW: '₩',
    HKD: 'HK$',
    TWD: 'NT$',
  }
  return symbols[currency] || currency
}

/**
 * 格式化数字
 * 
 * @param value - 数值
 * @param options - 格式化选项
 * @returns 格式化后的数字字符串
 * 
 * @example
 * ```typescript
 * formatNumber(1234.567) // '1,234.567'
 * formatNumber(1234.567, { maximumFractionDigits: 2 }) // '1,234.57'
 * formatNumber(1234, { minimumFractionDigits: 2 }) // '1,234.00'
 * formatNumber(1234567, { locale: 'de-DE' }) // '1.234.567'
 * ```
 */
export function formatNumber(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const {
    locale = 'zh-CN',
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping = true,
    groupingSeparator,
    decimalSeparator,
  } = options

  try {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping,
    })

    let result = formatter.format(value)

    // 自定义分隔符
    if (groupingSeparator || decimalSeparator) {
      const parts = result.split(/[,.]/)
      if (parts.length > 1) {
        const integerPart = parts.slice(0, -1).join(groupingSeparator || ',')
        const decimalPart = parts[parts.length - 1]
        result = `${integerPart}${decimalSeparator || '.'}${decimalPart}`
      }
    }

    return result
  } catch (error) {
    return value.toString()
  }
}

/**
 * 格式化百分比
 * 
 * @param value - 数值（0-1 之间）
 * @param options - 格式化选项
 * @returns 格式化后的百分比字符串
 * 
 * @example
 * ```typescript
 * formatPercentage(0.1234) // '12.34%'
 * formatPercentage(0.1234, { maximumFractionDigits: 1 }) // '12.3%'
 * formatPercentage(0.1234, { minimumFractionDigits: 3 }) // '12.340%'
 * ```
 */
export function formatPercentage(
  value: number,
  options: Omit<NumberFormatOptions, 'useGrouping'> = {}
): string {
  const {
    locale = 'zh-CN',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits,
    })

    return formatter.format(value)
  } catch (error) {
    const percentage = (value * 100).toFixed(maximumFractionDigits || 2)
    return `${percentage}%`
  }
}

/**
 * 格式化文件大小
 * 
 * @param bytes - 字节数
 * @param options - 格式化选项
 * @returns 格式化后的文件大小字符串
 * 
 * @example
 * ```typescript
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1048576) // '1.00 MB'
 * formatFileSize(1073741824) // '1.00 GB'
 * formatFileSize(1024, { decimals: 0 }) // '1 KB'
 * formatFileSize(1024, { binary: false }) // '1.02 KB' (使用 1000 进制)
 * ```
 */
export function formatFileSize(
  bytes: number,
  options: {
    decimals?: number
    binary?: boolean
    locale?: string
  } = {}
): string {
  const { decimals = 2, binary = true, locale = 'zh-CN' } = options

  if (bytes === 0) return '0 Bytes'

  const k = binary ? 1024 : 1000
  const sizes = binary
    ? ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)

  const formattedSize = formatNumber(size, {
    locale,
    maximumFractionDigits: decimals,
    minimumFractionDigits: i === 0 ? 0 : decimals,
  })

  return `${formattedSize} ${sizes[i]}`
}

/**
 * 格式化数字为紧凑形式
 * 
 * @param value - 数值
 * @param options - 格式化选项
 * @returns 格式化后的紧凑数字字符串
 * 
 * @example
 * ```typescript
 * formatCompactNumber(1234) // '1.2K'
 * formatCompactNumber(1234567) // '1.2M'
 * formatCompactNumber(1234567890) // '1.2B'
 * formatCompactNumber(1234, { notation: 'long' }) // '1.2 thousand'
 * ```
 */
export function formatCompactNumber(
  value: number,
  options: {
    locale?: string
    notation?: 'short' | 'long'
    maximumFractionDigits?: number
  } = {}
): string {
  const {
    locale = 'zh-CN',
    notation = 'short',
    maximumFractionDigits = 1,
  } = options

  try {
    const formatter = new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: notation,
      maximumFractionDigits,
    })

    return formatter.format(value)
  } catch (error) {
    // 降级处理
    const units = ['', 'K', 'M', 'B', 'T']
    const unitIndex = Math.floor(Math.log10(Math.abs(value)) / 3)
    
    if (unitIndex === 0) {
      return value.toString()
    }
    
    const scaledValue = value / Math.pow(1000, unitIndex)
    const unit = units[Math.min(unitIndex, units.length - 1)]
    
    return `${scaledValue.toFixed(maximumFractionDigits)}${unit}`
  }
}

/**
 * 格式化时间间隔
 * 
 * @param seconds - 秒数
 * @param options - 格式化选项
 * @returns 格式化后的时间间隔字符串
 * 
 * @example
 * ```typescript
 * formatDuration(3661) // '1:01:01'
 * formatDuration(3661, { format: 'long' }) // '1小时1分钟1秒'
 * formatDuration(61, { format: 'short' }) // '1m 1s'
 * formatDuration(3661, { showHours: false }) // '61:01'
 * ```
 */
export function formatDuration(
  seconds: number,
  options: {
    format?: 'hms' | 'long' | 'short'
    showHours?: boolean
    showMinutes?: boolean
    showSeconds?: boolean
    locale?: string
  } = {}
): string {
  const {
    format = 'hms',
    showHours = true,
    showMinutes = true,
    showSeconds = true,
    locale = 'zh-CN',
  } = options

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  switch (format) {
    case 'long':
      const parts: string[] = []
      if (hours > 0 && showHours) {
        parts.push(locale.startsWith('zh') ? `${hours}小时` : `${hours} hour${hours !== 1 ? 's' : ''}`)
      }
      if (minutes > 0 && showMinutes) {
        parts.push(locale.startsWith('zh') ? `${minutes}分钟` : `${minutes} minute${minutes !== 1 ? 's' : ''}`)
      }
      if (secs > 0 && showSeconds) {
        parts.push(locale.startsWith('zh') ? `${secs}秒` : `${secs} second${secs !== 1 ? 's' : ''}`)
      }
      return parts.join(locale.startsWith('zh') ? '' : ' ')

    case 'short':
      const shortParts: string[] = []
      if (hours > 0 && showHours) shortParts.push(`${hours}h`)
      if (minutes > 0 && showMinutes) shortParts.push(`${minutes}m`)
      if (secs > 0 && showSeconds) shortParts.push(`${secs}s`)
      return shortParts.join(' ')

    case 'hms':
    default:
      const hmsParts: string[] = []
      if (showHours && (hours > 0 || showMinutes || showSeconds)) {
        hmsParts.push(hours.toString().padStart(2, '0'))
      }
      if (showMinutes && (minutes > 0 || showSeconds || hmsParts.length > 0)) {
        hmsParts.push(minutes.toString().padStart(2, '0'))
      }
      if (showSeconds) {
        hmsParts.push(secs.toString().padStart(2, '0'))
      }
      return hmsParts.join(':')
  }
}

/**
 * 格式化相对时间
 * 
 * @param date - 日期
 * @param options - 格式化选项
 * @returns 格式化后的相对时间字符串
 * 
 * @example
 * ```typescript
 * const now = new Date()
 * const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
 * 
 * formatRelativeTime(oneHourAgo) // '1小时前'
 * formatRelativeTime(oneHourAgo, { locale: 'en-US' }) // '1 hour ago'
 * ```
 */
export function formatRelativeTime(
  date: Date,
  options: {
    locale?: string
    baseDate?: Date
  } = {}
): string {
  const { locale = 'zh-CN', baseDate = new Date() } = options

  const diffInSeconds = Math.floor((baseDate.getTime() - date.getTime()) / 1000)

  try {
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    if (Math.abs(diffInSeconds) < 60) {
      return formatter.format(-diffInSeconds, 'second')
    } else if (Math.abs(diffInSeconds) < 3600) {
      return formatter.format(-Math.floor(diffInSeconds / 60), 'minute')
    } else if (Math.abs(diffInSeconds) < 86400) {
      return formatter.format(-Math.floor(diffInSeconds / 3600), 'hour')
    } else if (Math.abs(diffInSeconds) < 2592000) {
      return formatter.format(-Math.floor(diffInSeconds / 86400), 'day')
    } else if (Math.abs(diffInSeconds) < 31536000) {
      return formatter.format(-Math.floor(diffInSeconds / 2592000), 'month')
    } else {
      return formatter.format(-Math.floor(diffInSeconds / 31536000), 'year')
    }
  } catch (error) {
    // 降级处理
    const absDiff = Math.abs(diffInSeconds)
    const isFuture = diffInSeconds < 0

    if (absDiff < 60) {
      return isFuture ? '刚刚' : '刚刚'
    } else if (absDiff < 3600) {
      const minutes = Math.floor(absDiff / 60)
      return isFuture ? `${minutes}分钟后` : `${minutes}分钟前`
    } else if (absDiff < 86400) {
      const hours = Math.floor(absDiff / 3600)
      return isFuture ? `${hours}小时后` : `${hours}小时前`
    } else {
      const days = Math.floor(absDiff / 86400)
      return isFuture ? `${days}天后` : `${days}天前`
    }
  }
}
