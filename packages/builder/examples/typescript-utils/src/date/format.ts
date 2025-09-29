/**
 * 日期格式化工具函数
 * 提供各种日期格式化和处理功能
 */

/**
 * 格式化日期为指定格式
 * @param date 日期对象或时间戳
 * @param format 格式字符串
 * @returns 格式化后的日期字符串
 * @example
 * ```typescript
 * import { formatDate } from '@ldesign/typescript-utils-example/date'
 * 
 * const result = formatDate(new Date(), 'YYYY-MM-DD') // '2023-12-25'
 * const result2 = formatDate(new Date(), 'YYYY年MM月DD日') // '2023年12月25日'
 * ```
 */
export function formatDate(date: Date | number, format: string): string {
  const d = typeof date === 'number' ? new Date(date) : date
  
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
    's': seconds.toString()
  }
  
  let result = format
  Object.entries(formatMap).forEach(([key, value]) => {
    result = result.replace(new RegExp(key, 'g'), value)
  })
  
  return result
}

/**
 * 获取相对时间描述
 * @param date 日期对象或时间戳
 * @param baseDate 基准日期（默认为当前时间）
 * @returns 相对时间描述
 * @example
 * ```typescript
 * import { getRelativeTime } from '@ldesign/typescript-utils-example/date'
 * 
 * const result = getRelativeTime(new Date(Date.now() - 60000)) // '1分钟前'
 * ```
 */
export function getRelativeTime(date: Date | number, baseDate: Date = new Date()): string {
  const targetDate = typeof date === 'number' ? new Date(date) : date
  const diffMs = baseDate.getTime() - targetDate.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)
  
  if (diffSeconds < 60) {
    return diffSeconds <= 0 ? '刚刚' : `${diffSeconds}秒前`
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 30) {
    return `${diffDays}天前`
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`
  } else {
    return `${diffYears}年前`
  }
}

/**
 * 判断是否为今天
 * @param date 日期对象或时间戳
 * @returns 是否为今天
 * @example
 * ```typescript
 * import { isToday } from '@ldesign/typescript-utils-example/date'
 * 
 * const result = isToday(new Date()) // true
 * ```
 */
export function isToday(date: Date | number): boolean {
  const targetDate = typeof date === 'number' ? new Date(date) : date
  const today = new Date()
  
  return (
    targetDate.getFullYear() === today.getFullYear() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getDate() === today.getDate()
  )
}

/**
 * 判断是否为昨天
 * @param date 日期对象或时间戳
 * @returns 是否为昨天
 * @example
 * ```typescript
 * import { isYesterday } from '@ldesign/typescript-utils-example/date'
 * 
 * const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
 * const result = isYesterday(yesterday) // true
 * ```
 */
export function isYesterday(date: Date | number): boolean {
  const targetDate = typeof date === 'number' ? new Date(date) : date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  return (
    targetDate.getFullYear() === yesterday.getFullYear() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getDate() === yesterday.getDate()
  )
}

/**
 * 判断是否为本周
 * @param date 日期对象或时间戳
 * @returns 是否为本周
 * @example
 * ```typescript
 * import { isThisWeek } from '@ldesign/typescript-utils-example/date'
 * 
 * const result = isThisWeek(new Date()) // true
 * ```
 */
export function isThisWeek(date: Date | number): boolean {
  const targetDate = typeof date === 'number' ? new Date(date) : date
  const today = new Date()
  
  // 获取本周一的日期
  const monday = new Date(today)
  const dayOfWeek = today.getDay() || 7 // 将周日从0改为7
  monday.setDate(today.getDate() - dayOfWeek + 1)
  monday.setHours(0, 0, 0, 0)
  
  // 获取本周日的日期
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  
  return targetDate >= monday && targetDate <= sunday
}

/**
 * 获取月份的天数
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 该月的天数
 * @example
 * ```typescript
 * import { getDaysInMonth } from '@ldesign/typescript-utils-example/date'
 * 
 * const result = getDaysInMonth(2023, 2) // 28
 * const result2 = getDaysInMonth(2024, 2) // 29 (闰年)
 * ```
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 判断是否为闰年
 * @param year 年份
 * @returns 是否为闰年
 * @example
 * ```typescript
 * import { isLeapYear } from '@ldesign/typescript-utils-example/date'
 * 
 * const result = isLeapYear(2024) // true
 * const result2 = isLeapYear(2023) // false
 * ```
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * 获取日期范围内的所有日期
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 日期数组
 * @example
 * ```typescript
 * import { getDateRange } from '@ldesign/typescript-utils-example/date'
 * 
 * const start = new Date('2023-12-01')
 * const end = new Date('2023-12-03')
 * const result = getDateRange(start, end) // [Date('2023-12-01'), Date('2023-12-02'), Date('2023-12-03')]
 * ```
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

/**
 * 添加指定天数到日期
 * @param date 原始日期
 * @param days 要添加的天数
 * @returns 新的日期对象
 * @example
 * ```typescript
 * import { addDays } from '@ldesign/typescript-utils-example/date'
 * 
 * const result = addDays(new Date('2023-12-01'), 7) // Date('2023-12-08')
 * ```
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 添加指定月数到日期
 * @param date 原始日期
 * @param months 要添加的月数
 * @returns 新的日期对象
 * @example
 * ```typescript
 * import { addMonths } from '@ldesign/typescript-utils-example/date'
 * 
 * const result = addMonths(new Date('2023-12-01'), 2) // Date('2024-02-01')
 * ```
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}
