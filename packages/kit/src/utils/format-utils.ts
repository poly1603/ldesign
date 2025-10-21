/**
 * 格式化工具类
 * 提供各种数据格式化方法
 * 
 * @example
 * ```typescript
 * import { FormatUtils } from '@ldesign/kit'
 * 
 * // 格式化文件大小
 * const size = FormatUtils.fileSize(1024 * 1024) // '1.00 MB'
 * 
 * // 格式化货币
 * const price = FormatUtils.currency(1234.56, 'USD') // '$1,234.56'
 * 
 * // 格式化时间
 * const time = FormatUtils.duration(3665000) // '1h 1m 5s'
 * ```
 */

/**
 * 格式化选项
 */
export interface FormatOptions {
  locale?: string
  precision?: number
  separator?: string
  prefix?: string
  suffix?: string
}

/**
 * 货币格式化选项
 */
export interface CurrencyOptions extends FormatOptions {
  currency?: string
  symbol?: boolean
  format?: 'code' | 'symbol' | 'name'
}

/**
 * 格式化工具类
 */
export class FormatUtils {
  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @param precision 精度
   * @param locale 本地化
   */
  static fileSize(bytes: number, precision = 2, locale = 'en'): string {
    if (bytes === 0) return '0 B'

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    const value = bytes / Math.pow(k, i)
    const formatted = value.toLocaleString(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    })

    return `${formatted} ${units[i]}`
  }

  /**
   * 格式化数字
   * @param num 数字
   * @param options 选项
   */
  static number(num: number, options: FormatOptions = {}): string {
    const {
      locale = 'en',
      precision,
      separator = ',',
      prefix = '',
      suffix = '',
    } = options

    let formatted: string

    if (precision !== undefined) {
      formatted = num.toLocaleString(locale, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      })
    }
    else {
      formatted = num.toLocaleString(locale)
    }

    if (separator !== ',') {
      formatted = formatted.replace(/,/g, separator)
    }

    return `${prefix}${formatted}${suffix}`
  }

  /**
   * 格式化货币
   * @param amount 金额
   * @param currency 货币代码
   * @param options 选项
   */
  static currency(amount: number, currency = 'USD', options: CurrencyOptions = {}): string {
    const {
      locale = 'en-US',
      format = 'symbol',
    } = options

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: format,
    }).format(amount)
  }

  /**
   * 格式化百分比
   * @param value 值（0-1）
   * @param precision 精度
   */
  static percentage(value: number, precision = 2): string {
    return `${(value * 100).toFixed(precision)}%`
  }

  /**
   * 格式化时间持续
   * @param ms 毫秒数
   * @param format 格式
   */
  static duration(ms: number, format: 'short' | 'long' = 'short'): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (format === 'long') {
      const parts: string[] = []
      if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`)
      if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 > 1 ? 's' : ''}`)
      if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''}`)
      if (seconds % 60 > 0) parts.push(`${seconds % 60} second${seconds % 60 > 1 ? 's' : ''}`)
      return parts.join(', ')
    }

    const parts: string[] = []
    if (days > 0) parts.push(`${days}d`)
    if (hours % 24 > 0) parts.push(`${hours % 24}h`)
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`)
    if (seconds % 60 > 0 || parts.length === 0) parts.push(`${seconds % 60}s`)
    return parts.join(' ')
  }

  /**
   * 格式化日期
   * @param date 日期
   * @param format 格式
   */
  static date(date: Date, format = 'YYYY-MM-DD'): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  /**
   * 格式化相对时间
   * @param date 日期
   */
  static relativeTime(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
    return `${years} year${years > 1 ? 's' : ''} ago`
  }

  /**
   * 格式化电话号码
   * @param phone 电话号码
   * @param format 格式
   */
  static phone(phone: string, format = '(XXX) XXX-XXXX'): string {
    const digits = phone.replace(/\D/g, '')
    let result = format
    let digitIndex = 0

    for (let i = 0; i < result.length; i++) {
      if (result[i] === 'X' && digitIndex < digits.length) {
        result = result.slice(0, i) + digits[digitIndex] + result.slice(i + 1)
        digitIndex++
      }
    }

    return result
  }

  /**
   * 格式化信用卡号
   * @param cardNumber 卡号
   * @param separator 分隔符
   */
  static creditCard(cardNumber: string, separator = ' '): string {
    const digits = cardNumber.replace(/\D/g, '')
    const groups = digits.match(/.{1,4}/g) || []
    return groups.join(separator)
  }

  /**
   * 格式化社会保障号（美国）
   * @param ssn 社保号
   */
  static ssn(ssn: string): string {
    const digits = ssn.replace(/\D/g, '')
    if (digits.length !== 9) return ssn
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
  }

  /**
   * 格式化列表
   * @param items 项目数组
   * @param type 类型
   */
  static list(items: string[], type: 'conjunction' | 'disjunction' = 'conjunction'): string {
    if (items.length === 0) return ''
    if (items.length === 1) return items[0]!
    if (items.length === 2) {
      const connector = type === 'conjunction' ? ' and ' : ' or '
      return `${items[0]}${connector}${items[1]}`
    }

    // 使用 Intl.ListFormat 如果可用
    if (typeof Intl !== 'undefined' && 'ListFormat' in Intl) {
      return new (Intl as any).ListFormat('en', { type }).format(items)
    }

    // 回退实现
    const connector = type === 'conjunction' ? 'and' : 'or'
    const last = items[items.length - 1]
    const rest = items.slice(0, -1)
    return `${rest.join(', ')}, ${connector} ${last}`
  }

  /**
   * 格式化名称
   * @param firstName 名
   * @param lastName 姓
   * @param format 格式
   */
  static name(firstName: string, lastName: string, format: 'first-last' | 'last-first' | 'last-comma-first' = 'first-last'): string {
    switch (format) {
      case 'first-last':
        return `${firstName} ${lastName}`
      case 'last-first':
        return `${lastName} ${firstName}`
      case 'last-comma-first':
        return `${lastName}, ${firstName}`
      default:
        return `${firstName} ${lastName}`
    }
  }

  /**
   * 格式化地址
   * @param address 地址对象
   */
  static address(address: {
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }): string {
    const parts: string[] = []

    if (address.street) parts.push(address.street)

    const cityState: string[] = []
    if (address.city) cityState.push(address.city)
    if (address.state) cityState.push(address.state)
    if (cityState.length > 0) parts.push(cityState.join(', '))

    if (address.zip) parts.push(address.zip)
    if (address.country) parts.push(address.country)

    return parts.join(', ')
  }

  /**
   * 格式化坐标
   * @param lat 纬度
   * @param lng 经度
   * @param precision 精度
   */
  static coordinates(lat: number, lng: number, precision = 6): string {
    const latStr = lat.toFixed(precision)
    const lngStr = lng.toFixed(precision)
    const latDir = lat >= 0 ? 'N' : 'S'
    const lngDir = lng >= 0 ? 'E' : 'W'
    return `${Math.abs(parseFloat(latStr))}° ${latDir}, ${Math.abs(parseFloat(lngStr))}° ${lngDir}`
  }

  /**
   * 缩写数字（如 1.2K, 3.5M）
   * @param num 数字
   * @param precision 精度
   */
  static abbreviateNumber(num: number, precision = 1): string {
    if (num < 1000) return String(num)

    const units = ['', 'K', 'M', 'B', 'T']
    const k = 1000
    const i = Math.floor(Math.log(num) / Math.log(k))

    const value = num / Math.pow(k, i)
    return `${value.toFixed(precision)}${units[i]}`
  }

  /**
   * 格式化序数（1st, 2nd, 3rd）
   * @param num 数字
   */
  static ordinal(num: number): string {
    const j = num % 10
    const k = num % 100

    if (j === 1 && k !== 11) return `${num}st`
    if (j === 2 && k !== 12) return `${num}nd`
    if (j === 3 && k !== 13) return `${num}rd`
    return `${num}th`
  }

  /**
   * 格式化罗马数字
   * @param num 数字
   */
  static roman(num: number): string {
    if (num <= 0 || num >= 4000) return String(num)

    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']

    let result = ''
    let remaining = num

    for (let i = 0; i < values.length; i++) {
      while (remaining >= values[i]!) {
        result += symbols[i]
        remaining -= values[i]!
      }
    }

    return result
  }

  /**
   * 格式化二进制
   * @param num 数字
   * @param padding 填充位数
   */
  static binary(num: number, padding = 8): string {
    return num.toString(2).padStart(padding, '0')
  }

  /**
   * 格式化十六进制
   * @param num 数字
   * @param padding 填充位数
   * @param uppercase 大写
   */
  static hex(num: number, padding = 2, uppercase = true): string {
    const hex = num.toString(16).padStart(padding, '0')
    return uppercase ? hex.toUpperCase() : hex
  }

  /**
   * 格式化科学记数法
   * @param num 数字
   * @param precision 精度
   */
  static scientific(num: number, precision = 2): string {
    return num.toExponential(precision)
  }

  /**
   * 格式化分数
   * @param decimal 小数
   * @param maxDenominator 最大分母
   */
  static fraction(decimal: number, maxDenominator = 100): string {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

    const sign = decimal < 0 ? '-' : ''
    const absDecimal = Math.abs(decimal)
    const whole = Math.floor(absDecimal)
    const fractional = absDecimal - whole

    if (fractional === 0) {
      return `${sign}${whole}`
    }

    let numerator = Math.round(fractional * maxDenominator)
    let denominator = maxDenominator
    const divisor = gcd(numerator, denominator)

    numerator /= divisor
    denominator /= divisor

    if (whole === 0) {
      return `${sign}${numerator}/${denominator}`
    }

    return `${sign}${whole} ${numerator}/${denominator}`
  }

  /**
   * 格式化 JSON
   * @param obj 对象
   * @param indent 缩进
   */
  static json(obj: any, indent = 2): string {
    return JSON.stringify(obj, null, indent)
  }

  /**
   * 格式化 YAML（简单版）
   * @param obj 对象
   * @param indent 缩进级别
   */
  static yaml(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent)

    if (typeof obj !== 'object' || obj === null) {
      return String(obj)
    }

    if (Array.isArray(obj)) {
      return obj.map(item => `${spaces}- ${FormatUtils.yaml(item, 0)}`).join('\n')
    }

    return Object.entries(obj)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return `${spaces}${key}:\n${FormatUtils.yaml(value, indent + 1)}`
        }
        return `${spaces}${key}: ${value}`
      })
      .join('\n')
  }

  /**
   * 格式化表格（ASCII）
   * @param data 数据
   * @param headers 表头
   */
  static table(data: Array<Record<string, any>>, headers?: string[]): string {
    if (data.length === 0) return ''

    const cols = headers || Object.keys(data[0]!)
    const widths = cols.map((col) => {
      const values = data.map(row => String(row[col] || ''))
      return Math.max(col.length, ...values.map(v => v.length))
    })

    const separator = `+${widths.map(w => '-'.repeat(w + 2)).join('+')}+`
    const headerRow = `|${cols.map((col, i) => ` ${col.padEnd(widths[i]!)} `).join('|')}|`

    const rows = data.map((row) => {
      return `|${cols.map((col, i) => ` ${String(row[col] || '').padEnd(widths[i]!)} `).join('|')}|`
    })

    return [separator, headerRow, separator, ...rows, separator].join('\n')
  }

  /**
   * 格式化代码块
   * @param code 代码
   * @param language 语言
   */
  static codeBlock(code: string, language = ''): string {
    return `\`\`\`${language}\n${code}\n\`\`\``
  }

  /**
   * 格式化 Markdown 链接
   * @param text 文本
   * @param url URL
   */
  static markdownLink(text: string, url: string): string {
    return `[${text}](${url})`
  }

  /**
   * 格式化 HTML 标签
   * @param tag 标签
   * @param content 内容
   * @param attributes 属性
   */
  static htmlTag(tag: string, content: string, attributes: Record<string, string> = {}): string {
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')

    if (attrs) {
      return `<${tag} ${attrs}>${content}</${tag}>`
    }

    return `<${tag}>${content}</${tag}>`
  }
}


