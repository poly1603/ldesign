/**
 * 日期处理工具类
 * 提供日期格式化、解析、计算等功能
 */

/**
 * 日期处理工具
 */
export class DateUtils {
  /**
   * 格式化日期
   * @param date 日期对象或时间戳
   * @param format 格式字符串
   * @returns 格式化后的字符串
   */
  static format(date: Date | number | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) {
      throw new TypeError('Invalid date')
    }

    const tokens: Record<string, () => string> = {
      YYYY: () => d.getFullYear().toString(),
      YY: () => d.getFullYear().toString().slice(-2),
      MM: () => (d.getMonth() + 1).toString().padStart(2, '0'),
      M: () => (d.getMonth() + 1).toString(),
      DD: () => d.getDate().toString().padStart(2, '0'),
      D: () => d.getDate().toString(),
      HH: () => d.getHours().toString().padStart(2, '0'),
      H: () => d.getHours().toString(),
      mm: () => d.getMinutes().toString().padStart(2, '0'),
      m: () => d.getMinutes().toString(),
      ss: () => d.getSeconds().toString().padStart(2, '0'),
      s: () => d.getSeconds().toString(),
      SSS: () => d.getMilliseconds().toString().padStart(3, '0'),
      A: () => (d.getHours() >= 12 ? 'PM' : 'AM'),
      a: () => (d.getHours() >= 12 ? 'pm' : 'am'),
    }

    return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|[sAa]|SSS/g, match =>
      tokens[match] ? tokens[match]() : match)
  }

  /**
   * 解析日期字符串
   * @param dateString 日期字符串
   * @param format 格式字符串
   * @returns 日期对象
   */
  static parse(dateString: string, format?: string): Date {
    if (!format) {
      return new Date(dateString)
    }

    // 简化的解析实现，支持常见格式
    const patterns: Record<string, RegExp> = {
      'YYYY-MM-DD': /^(\d{4})-(\d{2})-(\d{2})$/,
      'YYYY/MM/DD': /^(\d{4})\/(\d{2})\/(\d{2})$/,
      'DD/MM/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
      'MM/DD/YYYY': /^(\d{2})\/(\d{2})\/(\d{4})$/,
      'YYYY-MM-DD HH:mm:ss': /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
    }

    const pattern = patterns[format]
    if (!pattern) {
      return new Date(dateString)
    }

    const match = dateString.match(pattern)
    if (!match) {
      throw new Error(`Date string "${dateString}" does not match format "${format}"`)
    }

    const [, ...groups] = match
    const [g0 = '0', g1 = '0', g2 = '0', g3 = '0', g4 = '0', g5 = '0'] = groups

    switch (format) {
      case 'YYYY-MM-DD':
      case 'YYYY/MM/DD':
        return new Date(
          Number.parseInt(g0),
          Number.parseInt(g1) - 1,
          Number.parseInt(g2),
        )
      case 'DD/MM/YYYY':
        return new Date(
          Number.parseInt(g2),
          Number.parseInt(g1) - 1,
          Number.parseInt(g0),
        )
      case 'MM/DD/YYYY':
        return new Date(
          Number.parseInt(g2),
          Number.parseInt(g0) - 1,
          Number.parseInt(g1),
        )
      case 'YYYY-MM-DD HH:mm:ss':
        return new Date(
          Number.parseInt(g0),
          Number.parseInt(g1) - 1,
          Number.parseInt(g2),
          Number.parseInt(g3),
          Number.parseInt(g4),
          Number.parseInt(g5),
        )
      default:
        return new Date(dateString)
    }
  }

  /**
   * 获取当前时间戳
   * @returns 时间戳（毫秒）
   */
  static now(): number {
    return Date.now()
  }

  /**
   * 获取今天的开始时间
   * @param date 基准日期
   * @returns 今天开始时间
   */
  static startOfDay(date: Date = new Date()): Date {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  }

  /**
   * 获取今天的结束时间
   * @param date 基准日期
   * @returns 今天结束时间
   */
  static endOfDay(date: Date = new Date()): Date {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  }

  /**
   * 获取本周的开始时间
   * @param date 基准日期
   * @param startOfWeek 一周的开始（0=周日，1=周一）
   * @returns 本周开始时间
   */
  static startOfWeek(date: Date = new Date(), startOfWeek = 1): Date {
    const result = DateUtils.startOfDay(date)
    const day = result.getDay()
    const diff = (day < startOfWeek ? 7 : 0) + day - startOfWeek
    result.setDate(result.getDate() - diff)
    return result
  }

  /**
   * 获取本周的结束时间
   * @param date 基准日期
   * @param startOfWeek 一周的开始（0=周日，1=周一）
   * @returns 本周结束时间
   */
  static endOfWeek(date: Date = new Date(), startOfWeek = 1): Date {
    const result = DateUtils.startOfWeek(date, startOfWeek)
    result.setDate(result.getDate() + 6)
    return DateUtils.endOfDay(result)
  }

  /**
   * 获取本月的开始时间
   * @param date 基准日期
   * @returns 本月开始时间
   */
  static startOfMonth(date: Date = new Date()): Date {
    const result = DateUtils.startOfDay(date)
    result.setDate(1)
    return result
  }

  /**
   * 获取本月的结束时间
   * @param date 基准日期
   * @returns 本月结束时间
   */
  static endOfMonth(date: Date = new Date()): Date {
    const result = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return DateUtils.endOfDay(result)
  }

  /**
   * 获取本年的开始时间
   * @param date 基准日期
   * @returns 本年开始时间
   */
  static startOfYear(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0)
  }

  /**
   * 获取本年的结束时间
   * @param date 基准日期
   * @returns 本年结束时间
   */
  static endOfYear(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999)
  }

  /**
   * 添加时间
   * @param date 基准日期
   * @param amount 数量
   * @param unit 单位
   * @returns 新日期
   */
  static add(
    date: Date,
    amount: number,
    unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years',
  ): Date {
    const result = new Date(date)

    switch (unit) {
      case 'milliseconds':
        result.setMilliseconds(result.getMilliseconds() + amount)
        break
      case 'seconds':
        result.setSeconds(result.getSeconds() + amount)
        break
      case 'minutes':
        result.setMinutes(result.getMinutes() + amount)
        break
      case 'hours':
        result.setHours(result.getHours() + amount)
        break
      case 'days':
        result.setDate(result.getDate() + amount)
        break
      case 'weeks':
        result.setDate(result.getDate() + amount * 7)
        break
      case 'months':
        result.setMonth(result.getMonth() + amount)
        break
      case 'years':
        result.setFullYear(result.getFullYear() + amount)
        break
    }

    return result
  }

  /**
   * 减去时间
   * @param date 基准日期
   * @param amount 数量
   * @param unit 单位
   * @returns 新日期
   */
  static subtract(
    date: Date,
    amount: number,
    unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years',
  ): Date {
    return DateUtils.add(date, -amount, unit)
  }

  /**
   * 计算两个日期的差值
   * @param date1 日期1
   * @param date2 日期2
   * @param unit 单位
   * @returns 差值
   */
  static diff(
    date1: Date,
    date2: Date,
    unit:
      | 'milliseconds'
      | 'seconds'
      | 'minutes'
      | 'hours'
      | 'days'
      | 'weeks'
      | 'months'
      | 'years' = 'milliseconds',
  ): number {
    const diffMs = date1.getTime() - date2.getTime()

    switch (unit) {
      case 'milliseconds':
        return diffMs
      case 'seconds':
        return Math.floor(diffMs / 1000)
      case 'minutes':
        return Math.floor(diffMs / (1000 * 60))
      case 'hours':
        return Math.floor(diffMs / (1000 * 60 * 60))
      case 'days':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24))
      case 'weeks':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
      case 'months':
        return (
          (date1.getFullYear() - date2.getFullYear()) * 12 + (date1.getMonth() - date2.getMonth())
        )
      case 'years':
        return date1.getFullYear() - date2.getFullYear()
      default:
        return diffMs
    }
  }

  /**
   * 检查是否为同一天
   * @param date1 日期1
   * @param date2 日期2
   * @returns 是否为同一天
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear()
      && date1.getMonth() === date2.getMonth()
      && date1.getDate() === date2.getDate()
    )
  }

  /**
   * 检查是否为今天
   * @param date 日期
   * @returns 是否为今天
   */
  static isToday(date: Date): boolean {
    return DateUtils.isSameDay(date, new Date())
  }

  /**
   * 检查是否为昨天
   * @param date 日期
   * @returns 是否为昨天
   */
  static isYesterday(date: Date): boolean {
    const yesterday = DateUtils.subtract(new Date(), 1, 'days')
    return DateUtils.isSameDay(date, yesterday)
  }

  /**
   * 检查是否为明天
   * @param date 日期
   * @returns 是否为明天
   */
  static isTomorrow(date: Date): boolean {
    const tomorrow = DateUtils.add(new Date(), 1, 'days')
    return DateUtils.isSameDay(date, tomorrow)
  }

  /**
   * 检查是否为闰年
   * @param year 年份
   * @returns 是否为闰年
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  /**
   * 获取月份的天数
   * @param year 年份
   * @param month 月份（0-11）
   * @returns 天数
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
  }

  /**
   * 获取相对时间描述
   * @param date 日期
   * @param baseDate 基准日期
   * @returns 相对时间描述
   */
  static getRelativeTime(date: Date, baseDate: Date = new Date()): string {
    const diffMs = baseDate.getTime() - date.getTime()
    const absDiffMs = Math.abs(diffMs)
    const isPast = diffMs > 0

    const units = [
      { name: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
      { name: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
      { name: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
      { name: 'day', ms: 1000 * 60 * 60 * 24 },
      { name: 'hour', ms: 1000 * 60 * 60 },
      { name: 'minute', ms: 1000 * 60 },
      { name: 'second', ms: 1000 },
    ]

    for (const unit of units) {
      const count = Math.floor(absDiffMs / unit.ms)
      if (count >= 1) {
        const suffix = count === 1 ? '' : 's'
        return isPast ? `${count} ${unit.name}${suffix} ago` : `in ${count} ${unit.name}${suffix}`
      }
    }

    return 'just now'
  }

  /**
   * 格式化时间长度
   * @param ms 毫秒数
   * @returns 格式化后的字符串
   */
  static formatDuration(ms: number): string {
    const units = [
      { name: 'd', ms: 1000 * 60 * 60 * 24 },
      { name: 'h', ms: 1000 * 60 * 60 },
      { name: 'm', ms: 1000 * 60 },
      { name: 's', ms: 1000 },
    ]

    const parts: string[] = []
    let remaining = Math.abs(ms)

    for (const unit of units) {
      const count = Math.floor(remaining / unit.ms)
      if (count > 0) {
        parts.push(`${count}${unit.name}`)
        remaining %= unit.ms
      }
    }

    if (parts.length === 0) {
      return '0s'
    }

    return parts.join(' ')
  }

  /**
   * 获取时区偏移
   * @param date 日期
   * @returns 时区偏移（分钟）
   */
  static getTimezoneOffset(date: Date = new Date()): number {
    return date.getTimezoneOffset()
  }

  /**
   * 转换为UTC时间
   * @param date 日期
   * @returns UTC时间
   */
  static toUTC(date: Date): Date {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
  }

  /**
   * 从UTC时间转换为本地时间
   * @param date UTC日期
   * @returns 本地时间
   */
  static fromUTC(date: Date): Date {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  }
}
