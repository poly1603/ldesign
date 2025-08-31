/**
 * 日期时间工具函数模块
 * 
 * @description
 * 提供常用的日期时间处理、格式化、计算等工具函数。
 * 这些函数具有良好的类型安全性和性能表现。
 */

/**
 * 日期格式化选项
 */
export interface DateFormatOptions {
  /** 年份格式 */
  year?: 'numeric' | '2-digit'
  /** 月份格式 */
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
  /** 日期格式 */
  day?: 'numeric' | '2-digit'
  /** 小时格式 */
  hour?: 'numeric' | '2-digit'
  /** 分钟格式 */
  minute?: 'numeric' | '2-digit'
  /** 秒格式 */
  second?: 'numeric' | '2-digit'
  /** 时区 */
  timeZone?: string
  /** 12/24小时制 */
  hour12?: boolean
}

/**
 * 格式化日期
 * 
 * @param date - 要格式化的日期
 * @param format - 格式字符串或选项
 * @param locale - 语言环境（默认为 'zh-CN'）
 * @returns 格式化后的日期字符串
 * 
 * @example
 * ```typescript
 * const date = new Date('2023-12-25 15:30:45')
 * 
 * formatDate(date, 'YYYY-MM-DD') // '2023-12-25'
 * formatDate(date, 'YYYY-MM-DD HH:mm:ss') // '2023-12-25 15:30:45'
 * formatDate(date, 'MM/DD/YYYY') // '12/25/2023'
 * 
 * // 使用选项对象
 * formatDate(date, {
 *   year: 'numeric',
 *   month: 'long',
 *   day: 'numeric'
 * }) // '2023年12月25日'
 * ```
 */
export function formatDate(
  date: Date | string | number,
  format: string | DateFormatOptions,
  locale = 'zh-CN'
): string {
  const d = new Date(date)
  
  if (typeof format === 'object') {
    return new Intl.DateTimeFormat(locale, format).format(d)
  }
  
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const seconds = d.getSeconds()
  
  const formatMap: Record<string, string> = {
    'YYYY': year.toString(),
    'YY': year.toString().slice(-2),
    'MM': month.toString().padStart(2, '0'),
    'M': month.toString(),
    'DD': day.toString().padStart(2, '0'),
    'D': day.toString(),
    'HH': hours.toString().padStart(2, '0'),
    'H': hours.toString(),
    'mm': minutes.toString().padStart(2, '0'),
    'm': minutes.toString(),
    'ss': seconds.toString().padStart(2, '0'),
    's': seconds.toString(),
  }
  
  return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g, match => formatMap[match])
}

/**
 * 解析日期字符串
 * 
 * @param dateString - 日期字符串
 * @param format - 格式字符串（可选）
 * @returns Date 对象
 * 
 * @example
 * ```typescript
 * parseDate('2023-12-25') // Date object
 * parseDate('25/12/2023', 'DD/MM/YYYY') // Date object
 * ```
 */
export function parseDate(dateString: string, format?: string): Date {
  if (!format) {
    return new Date(dateString)
  }
  
  // 简单的格式解析实现
  const formatRegex = format
    .replace(/YYYY/g, '(\\d{4})')
    .replace(/MM/g, '(\\d{2})')
    .replace(/DD/g, '(\\d{2})')
    .replace(/HH/g, '(\\d{2})')
    .replace(/mm/g, '(\\d{2})')
    .replace(/ss/g, '(\\d{2})')
  
  const match = dateString.match(new RegExp(formatRegex))
  if (!match) {
    return new Date(dateString)
  }
  
  const formatParts = format.match(/YYYY|MM|DD|HH|mm|ss/g) || []
  const values: Record<string, number> = {}
  
  formatParts.forEach((part, index) => {
    values[part] = parseInt(match[index + 1], 10)
  })
  
  return new Date(
    values.YYYY || 0,
    (values.MM || 1) - 1,
    values.DD || 1,
    values.HH || 0,
    values.mm || 0,
    values.ss || 0
  )
}

/**
 * 计算两个日期之间的差值
 * 
 * @param date1 - 第一个日期
 * @param date2 - 第二个日期
 * @param unit - 单位（默认为 'days'）
 * @returns 差值
 * 
 * @example
 * ```typescript
 * const date1 = new Date('2023-12-25')
 * const date2 = new Date('2023-12-20')
 * 
 * dateDiff(date1, date2, 'days') // 5
 * dateDiff(date1, date2, 'hours') // 120
 * ```
 */
export function dateDiff(
  date1: Date | string | number,
  date2: Date | string | number,
  unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds' = 'days'
): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffMs = Math.abs(d1.getTime() - d2.getTime())
  
  switch (unit) {
    case 'years':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365))
    case 'months':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30))
    case 'days':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24))
    case 'hours':
      return Math.floor(diffMs / (1000 * 60 * 60))
    case 'minutes':
      return Math.floor(diffMs / (1000 * 60))
    case 'seconds':
      return Math.floor(diffMs / 1000)
    case 'milliseconds':
      return diffMs
    default:
      return diffMs
  }
}

/**
 * 添加时间到日期
 * 
 * @param date - 基础日期
 * @param amount - 要添加的数量
 * @param unit - 时间单位
 * @returns 新的日期对象
 * 
 * @example
 * ```typescript
 * const date = new Date('2023-12-25')
 * 
 * addTime(date, 7, 'days') // 2024-01-01
 * addTime(date, 2, 'hours') // 2023-12-25 02:00:00
 * ```
 */
export function addTime(
  date: Date | string | number,
  amount: number,
  unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'
): Date {
  const d = new Date(date)
  
  switch (unit) {
    case 'years':
      d.setFullYear(d.getFullYear() + amount)
      break
    case 'months':
      d.setMonth(d.getMonth() + amount)
      break
    case 'days':
      d.setDate(d.getDate() + amount)
      break
    case 'hours':
      d.setHours(d.getHours() + amount)
      break
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount)
      break
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount)
      break
    case 'milliseconds':
      d.setMilliseconds(d.getMilliseconds() + amount)
      break
  }
  
  return d
}

/**
 * 减去时间从日期
 * 
 * @param date - 基础日期
 * @param amount - 要减去的数量
 * @param unit - 时间单位
 * @returns 新的日期对象
 * 
 * @example
 * ```typescript
 * const date = new Date('2023-12-25')
 * 
 * subtractTime(date, 7, 'days') // 2023-12-18
 * ```
 */
export function subtractTime(
  date: Date | string | number,
  amount: number,
  unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'
): Date {
  return addTime(date, -amount, unit)
}

/**
 * 获取日期的开始时间
 * 
 * @param date - 日期
 * @param unit - 单位
 * @returns 开始时间的日期对象
 * 
 * @example
 * ```typescript
 * const date = new Date('2023-12-25 15:30:45')
 * 
 * startOf(date, 'day') // 2023-12-25 00:00:00
 * startOf(date, 'month') // 2023-12-01 00:00:00
 * ```
 */
export function startOf(
  date: Date | string | number,
  unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
): Date {
  const d = new Date(date)
  
  switch (unit) {
    case 'year':
      d.setMonth(0, 1)
      d.setHours(0, 0, 0, 0)
      break
    case 'month':
      d.setDate(1)
      d.setHours(0, 0, 0, 0)
      break
    case 'day':
      d.setHours(0, 0, 0, 0)
      break
    case 'hour':
      d.setMinutes(0, 0, 0)
      break
    case 'minute':
      d.setSeconds(0, 0)
      break
    case 'second':
      d.setMilliseconds(0)
      break
  }
  
  return d
}

/**
 * 获取日期的结束时间
 * 
 * @param date - 日期
 * @param unit - 单位
 * @returns 结束时间的日期对象
 * 
 * @example
 * ```typescript
 * const date = new Date('2023-12-25 15:30:45')
 * 
 * endOf(date, 'day') // 2023-12-25 23:59:59.999
 * endOf(date, 'month') // 2023-12-31 23:59:59.999
 * ```
 */
export function endOf(
  date: Date | string | number,
  unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
): Date {
  const d = new Date(date)
  
  switch (unit) {
    case 'year':
      d.setMonth(11, 31)
      d.setHours(23, 59, 59, 999)
      break
    case 'month':
      d.setMonth(d.getMonth() + 1, 0)
      d.setHours(23, 59, 59, 999)
      break
    case 'day':
      d.setHours(23, 59, 59, 999)
      break
    case 'hour':
      d.setMinutes(59, 59, 999)
      break
    case 'minute':
      d.setSeconds(59, 999)
      break
    case 'second':
      d.setMilliseconds(999)
      break
  }
  
  return d
}

/**
 * 检查是否为闰年
 * 
 * @param year - 年份
 * @returns 是否为闰年
 * 
 * @example
 * ```typescript
 * isLeapYear(2024) // true
 * isLeapYear(2023) // false
 * ```
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

/**
 * 获取月份的天数
 * 
 * @param year - 年份
 * @param month - 月份（1-12）
 * @returns 天数
 * 
 * @example
 * ```typescript
 * getDaysInMonth(2023, 2) // 28
 * getDaysInMonth(2024, 2) // 29
 * ```
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 相对时间格式化
 * 
 * @param date - 日期
 * @param baseDate - 基准日期（默认为当前时间）
 * @param locale - 语言环境（默认为 'zh-CN'）
 * @returns 相对时间字符串
 * 
 * @example
 * ```typescript
 * const now = new Date()
 * const yesterday = subtractTime(now, 1, 'days')
 * 
 * timeAgo(yesterday) // '1天前'
 * ```
 */
export function timeAgo(
  date: Date | string | number,
  baseDate: Date = new Date(),
  locale = 'zh-CN'
): string {
  const d = new Date(date)
  const diffMs = baseDate.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSeconds < 60) {
    return '刚刚'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 30) {
    return `${diffDays}天前`
  } else {
    return formatDate(d, 'YYYY-MM-DD', locale)
  }
}
