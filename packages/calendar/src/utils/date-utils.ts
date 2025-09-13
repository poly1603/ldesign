/**
 * 日期工具函数
 * 
 * 提供日期处理相关的工具函数：
 * - 日期格式化
 * - 日期计算
 * - 日期比较
 * - 日期范围处理
 * - 时区处理
 */

import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

// 扩展dayjs插件
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)
dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.extend(isSameOrBefore)

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式字符串
 * @param locale 语言环境
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD', locale?: string): string {
  const dayjsInstance = dayjs(date)
  return locale ? dayjsInstance.locale(locale).format(format) : dayjsInstance.format(format)
}

/**
 * 格式化时间
 * @param date 日期
 * @param format 格式字符串
 * @param locale 语言环境
 */
export function formatTime(date: Date | string | number, format: string = 'HH:mm', locale?: string): string {
  return formatDate(date, format, locale)
}

/**
 * 格式化日期时间
 * @param date 日期
 * @param format 格式字符串
 * @param locale 语言环境
 */
export function formatDateTime(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm', locale?: string): string {
  return formatDate(date, format, locale)
}

/**
 * 解析日期字符串
 * @param dateString 日期字符串
 * @param format 格式字符串
 */
export function parseDate(dateString: string, format?: string): Date {
  const parsed = format ? dayjs(dateString, format) : dayjs(dateString)
  return parsed.toDate()
}

/**
 * 获取今天的日期
 */
export function getToday(): Date {
  return dayjs().startOf('day').toDate()
}

/**
 * 获取明天的日期
 */
export function getTomorrow(): Date {
  return dayjs().add(1, 'day').startOf('day').toDate()
}

/**
 * 获取昨天的日期
 */
export function getYesterday(): Date {
  return dayjs().subtract(1, 'day').startOf('day').toDate()
}

/**
 * 获取本周的开始日期
 * @param date 参考日期
 * @param startOfWeek 一周的开始日期（0-6，0为周日）
 */
export function getStartOfWeek(date: Date | string | number, startOfWeek: number = 0): Date {
  const dayjsDate = dayjs(date)
  const currentDay = dayjsDate.day()
  const diff = (currentDay - startOfWeek + 7) % 7
  return dayjsDate.subtract(diff, 'day').startOf('day').toDate()
}

/**
 * 获取本周的结束日期
 * @param date 参考日期
 * @param startOfWeek 一周的开始日期（0-6，0为周日）
 */
export function getEndOfWeek(date: Date | string | number, startOfWeek: number = 0): Date {
  const startDate = getStartOfWeek(date, startOfWeek)
  return dayjs(startDate).add(6, 'day').endOf('day').toDate()
}

/**
 * 获取本月的开始日期
 * @param date 参考日期
 */
export function getStartOfMonth(date: Date | string | number): Date {
  return dayjs(date).startOf('month').toDate()
}

/**
 * 获取本月的结束日期
 * @param date 参考日期
 */
export function getEndOfMonth(date: Date | string | number): Date {
  return dayjs(date).endOf('month').toDate()
}

/**
 * 获取本年的开始日期
 * @param date 参考日期
 */
export function getStartOfYear(date: Date | string | number): Date {
  return dayjs(date).startOf('year').toDate()
}

/**
 * 获取本年的结束日期
 * @param date 参考日期
 */
export function getEndOfYear(date: Date | string | number): Date {
  return dayjs(date).endOf('year').toDate()
}

/**
 * 获取月份的天数
 * @param date 参考日期
 */
export function getDaysInMonth(date: Date | string | number): number {
  return dayjs(date).daysInMonth()
}

/**
 * 获取年份的天数
 * @param date 参考日期
 */
export function getDaysInYear(date: Date | string | number): number {
  const year = dayjs(date).year()
  return isLeapYear(year) ? 366 : 365
}

/**
 * 判断是否为闰年
 * @param year 年份
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

/**
 * 判断两个日期是否为同一天
 * @param date1 日期1
 * @param date2 日期2
 */
export function isSameDay(date1: Date | string | number, date2: Date | string | number): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'day')
}

/**
 * 判断两个日期是否为同一周
 * @param date1 日期1
 * @param date2 日期2
 */
export function isSameWeek(date1: Date | string | number, date2: Date | string | number): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'week')
}

/**
 * 判断两个日期是否为同一月
 * @param date1 日期1
 * @param date2 日期2
 */
export function isSameMonth(date1: Date | string | number, date2: Date | string | number): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'month')
}

/**
 * 判断两个日期是否为同一年
 * @param date1 日期1
 * @param date2 日期2
 */
export function isSameYear(date1: Date | string | number, date2: Date | string | number): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'year')
}

/**
 * 判断日期是否为今天
 * @param date 日期
 */
export function isToday(date: Date | string | number): boolean {
  return isSameDay(date, new Date())
}

/**
 * 判断日期是否为周末
 * @param date 日期
 */
export function isWeekend(date: Date | string | number): boolean {
  const day = dayjs(date).day()
  return day === 0 || day === 6
}

/**
 * 判断日期是否在指定范围内
 * @param date 要检查的日期
 * @param start 开始日期
 * @param end 结束日期
 * @param inclusive 是否包含边界
 */
export function isDateInRange(
  date: Date | string | number,
  start: Date | string | number,
  end: Date | string | number,
  inclusive: boolean = true
): boolean {
  const targetDate = dayjs(date)
  const startDate = dayjs(start)
  const endDate = dayjs(end)

  if (inclusive) {
    return targetDate.isSame(startDate) || targetDate.isSame(endDate) ||
      (targetDate.isAfter(startDate) && targetDate.isBefore(endDate))
  } else {
    return targetDate.isAfter(startDate) && targetDate.isBefore(endDate)
  }
}

/**
 * 计算两个日期之间的天数差
 * @param date1 日期1
 * @param date2 日期2
 */
export function getDaysDiff(date1: Date | string | number, date2: Date | string | number): number {
  return dayjs(date2).diff(dayjs(date1), 'day')
}

/**
 * 计算两个日期之间的小时差
 * @param date1 日期1
 * @param date2 日期2
 */
export function getHoursDiff(date1: Date | string | number, date2: Date | string | number): number {
  return dayjs(date2).diff(dayjs(date1), 'hour')
}

/**
 * 计算两个日期之间的分钟差
 * @param date1 日期1
 * @param date2 日期2
 */
export function getMinutesDiff(date1: Date | string | number, date2: Date | string | number): number {
  return dayjs(date2).diff(dayjs(date1), 'minute')
}

/**
 * 添加指定天数
 * @param date 基准日期
 * @param days 要添加的天数
 */
export function addDays(date: Date | string | number, days: number): Date {
  return dayjs(date).add(days, 'day').toDate()
}

/**
 * 添加指定周数
 * @param date 基准日期
 * @param weeks 要添加的周数
 */
export function addWeeks(date: Date | string | number, weeks: number): Date {
  return dayjs(date).add(weeks, 'week').toDate()
}

/**
 * 添加指定月数
 * @param date 基准日期
 * @param months 要添加的月数
 */
export function addMonths(date: Date | string | number, months: number): Date {
  return dayjs(date).add(months, 'month').toDate()
}

/**
 * 添加指定年数
 * @param date 基准日期
 * @param years 要添加的年数
 */
export function addYears(date: Date | string | number, years: number): Date {
  return dayjs(date).add(years, 'year').toDate()
}

/**
 * 减去指定天数
 * @param date 基准日期
 * @param days 要减去的天数
 */
export function subtractDays(date: Date | string | number, days: number): Date {
  return dayjs(date).subtract(days, 'day').toDate()
}

/**
 * 减去指定周数
 * @param date 基准日期
 * @param weeks 要减去的周数
 */
export function subtractWeeks(date: Date | string | number, weeks: number): Date {
  return dayjs(date).subtract(weeks, 'week').toDate()
}

/**
 * 减去指定月数
 * @param date 基准日期
 * @param months 要减去的月数
 */
export function subtractMonths(date: Date | string | number, months: number): Date {
  return dayjs(date).subtract(months, 'month').toDate()
}

/**
 * 减去指定年数
 * @param date 基准日期
 * @param years 要减去的年数
 */
export function subtractYears(date: Date | string | number, years: number): Date {
  return dayjs(date).subtract(years, 'year').toDate()
}

/**
 * 获取日期的星期几
 * @param date 日期
 * @param locale 语言环境
 */
export function getDayOfWeek(date: Date | string | number, locale?: string): string {
  const dayjsDate = dayjs(date)
  return locale ? dayjsDate.locale(locale).format('dddd') : dayjsDate.format('dddd')
}

/**
 * 获取月份名称
 * @param date 日期
 * @param locale 语言环境
 */
export function getMonthName(date: Date | string | number, locale?: string): string {
  const dayjsDate = dayjs(date)
  return locale ? dayjsDate.locale(locale).format('MMMM') : dayjsDate.format('MMMM')
}

/**
 * 获取相对时间描述
 * @param date 日期
 * @param baseDate 基准日期（默认为当前时间）
 * @param locale 语言环境
 */
export function getRelativeTime(date: Date | string | number, baseDate?: Date | string | number, locale?: string): string {
  const targetDate = dayjs(date)
  const base = baseDate ? dayjs(baseDate) : dayjs()

  if (locale) {
    return targetDate.locale(locale).from(base)
  }
  return targetDate.from(base)
}

/**
 * 创建日期范围数组
 * @param start 开始日期
 * @param end 结束日期
 * @param unit 单位（day, week, month等）
 */
export function createDateRange(
  start: Date | string | number,
  end: Date | string | number,
  unit: 'day' | 'week' | 'month' | 'year' = 'day'
): Date[] {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  const dates: Date[] = []

  let current = startDate
  while (current.isSameOrBefore(endDate)) {
    dates.push(current.toDate())
    current = current.add(1, unit)
  }

  return dates
}

/**
 * 获取时区偏移量
 * @param date 日期
 * @param timezone 时区
 */
export function getTimezoneOffset(date: Date | string | number, _timezone?: string): number {
  // 这里需要更复杂的时区处理逻辑
  // 可以使用 dayjs 的 timezone 插件
  return new Date(date).getTimezoneOffset()
}

/**
 * 转换时区
 * @param date 日期
 * @param fromTimezone 源时区
 * @param toTimezone 目标时区
 */
export function convertTimezone(
  date: Date | string | number,
  _fromTimezone: string,
  _toTimezone: string
): Date {
  // 这里需要时区转换逻辑
  // 可以使用 dayjs 的 timezone 插件
  return new Date(date)
}

// ==================== 日历视图专用工具函数 ====================

/**
 * 获取月视图需要显示的所有日期（包括上月和下月的日期）
 * @param date 参考日期
 * @param startOfWeek 一周的开始日期（0-6，0为周日）
 */
export function getMonthViewDates(date: Date | string | number, startOfWeek: number = 0): Date[] {
  const monthStart = getStartOfMonth(date)
  const monthEnd = getEndOfMonth(date)

  // 获取月视图的开始日期（可能是上个月的日期）
  const viewStart = getStartOfWeek(monthStart, startOfWeek)

  // 获取月视图的结束日期（可能是下个月的日期）
  const viewEnd = getEndOfWeek(monthEnd, startOfWeek)

  return createDateRange(viewStart, viewEnd, 'day')
}

/**
 * 获取周视图需要显示的所有日期
 * @param date 参考日期
 * @param startOfWeek 一周的开始日期（0-6，0为周日）
 */
export function getWeekViewDates(date: Date | string | number, startOfWeek: number = 0): Date[] {
  const weekStart = getStartOfWeek(date, startOfWeek)
  const weekEnd = getEndOfWeek(date, startOfWeek)

  return createDateRange(weekStart, weekEnd, 'day')
}

/**
 * 获取日视图的小时时间段
 * @param date 参考日期
 * @param startHour 开始小时（默认0）
 * @param endHour 结束小时（默认23）
 */
export function getDayViewHours(date: Date | string | number, startHour: number = 0, endHour: number = 23): Date[] {
  const dayStart = dayjs(date).startOf('day')
  const hours: Date[] = []

  for (let hour = startHour; hour <= endHour; hour++) {
    hours.push(dayStart.hour(hour).toDate())
  }

  return hours
}

/**
 * 获取周数（一年中的第几周）
 * @param date 参考日期
 * @param mode ISO周数或本地周数
 */
export function getWeekNumber(date: Date | string | number, mode: 'iso' | 'local' = 'iso'): number {
  const dayjsDate = dayjs(date)
  return mode === 'iso' ? dayjsDate.isoWeek() : dayjsDate.week()
}

/**
 * 获取季度
 * @param date 参考日期
 */
export function getQuarter(date: Date | string | number): number {
  return Math.floor(dayjs(date).month() / 3) + 1
}

/**
 * 判断日期是否在当前月份
 * @param date 要检查的日期
 * @param referenceDate 参考月份的日期
 */
export function isInCurrentMonth(date: Date | string | number, referenceDate: Date | string | number): boolean {
  return isSameMonth(date, referenceDate)
}

/**
 * 判断日期是否在当前周
 * @param date 要检查的日期
 * @param referenceDate 参考周的日期
 */
export function isInCurrentWeek(date: Date | string | number, referenceDate: Date | string | number): boolean {
  return isSameWeek(date, referenceDate)
}

/**
 * 获取月份的周数
 * @param date 参考日期
 * @param startOfWeek 一周的开始日期（0-6，0为周日）
 */
export function getWeeksInMonth(date: Date | string | number, startOfWeek: number = 0): number {
  const monthDates = getMonthViewDates(date, startOfWeek)
  return Math.ceil(monthDates.length / 7)
}

/**
 * 获取时间段的标签
 * @param hour 小时（0-23）
 * @param format 格式（12小时制或24小时制）
 */
export function getHourLabel(hour: number, format: '12' | '24' = '24'): string {
  if (format === '12') {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    if (hour < 12) return `${hour} AM`
    return `${hour - 12} PM`
  }
  return `${hour.toString().padStart(2, '0')}:00`
}

/**
 * 计算事件在时间轴上的位置
 * @param eventStart 事件开始时间
 * @param eventEnd 事件结束时间
 * @param dayStart 一天的开始时间
 * @param dayEnd 一天的结束时间
 */
export function calculateEventPosition(
  eventStart: Date | string | number,
  eventEnd: Date | string | number,
  dayStart: Date | string | number,
  dayEnd: Date | string | number
): { top: number; height: number } {
  const start = dayjs(eventStart)
  const end = dayjs(eventEnd)
  const dayStartTime = dayjs(dayStart)
  const dayEndTime = dayjs(dayEnd)

  // 计算一天的总分钟数
  const totalMinutes = dayEndTime.diff(dayStartTime, 'minute')

  // 计算事件开始时间相对于一天开始的分钟数
  const startMinutes = start.diff(dayStartTime, 'minute')

  // 计算事件持续的分钟数
  const durationMinutes = end.diff(start, 'minute')

  // 计算位置百分比
  const top = Math.max(0, (startMinutes / totalMinutes) * 100)
  const height = Math.min(100 - top, (durationMinutes / totalMinutes) * 100)

  return { top, height }
}

/**
 * 检查两个时间段是否重叠
 * @param start1 时间段1开始时间
 * @param end1 时间段1结束时间
 * @param start2 时间段2开始时间
 * @param end2 时间段2结束时间
 */
export function isTimeRangeOverlap(
  start1: Date | string | number,
  end1: Date | string | number,
  start2: Date | string | number,
  end2: Date | string | number
): boolean {
  const s1 = dayjs(start1)
  const e1 = dayjs(end1)
  const s2 = dayjs(start2)
  const e2 = dayjs(end2)

  return s1.isBefore(e2) && s2.isBefore(e1)
}
