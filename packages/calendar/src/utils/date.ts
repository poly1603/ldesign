/**
 * 日期工具函数
 */

import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekday from 'dayjs/plugin/weekday'
import isoWeek from 'dayjs/plugin/isoWeek'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import type { DateInput } from '../types'

// 扩展dayjs插件
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(weekOfYear)
dayjs.extend(weekday)
dayjs.extend(isoWeek)
dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(relativeTime)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

/**
 * 日期工具类
 */
export class DateUtils {
  /**
   * 创建dayjs实例
   */
  static dayjs(date?: DateInput): Dayjs {
    return dayjs(date)
  }

  /**
   * 获取当前日期
   */
  static now(): Dayjs {
    return dayjs()
  }

  /**
   * 获取今天的开始时间
   */
  static startOfToday(): Dayjs {
    return dayjs().startOf('day')
  }

  /**
   * 获取今天的结束时间
   */
  static endOfToday(): Dayjs {
    return dayjs().endOf('day')
  }

  /**
   * 检查是否为今天
   */
  static isToday(date: DateInput): boolean {
    return dayjs(date).isSame(dayjs(), 'day')
  }

  /**
   * 检查是否为同一天
   */
  static isSameDay(date1: DateInput, date2: DateInput): boolean {
    return dayjs(date1).isSame(dayjs(date2), 'day')
  }

  /**
   * 检查是否为同一周
   */
  static isSameWeek(date1: DateInput, date2: DateInput, firstDayOfWeek = 1): boolean {
    const d1 = dayjs(date1)
    const d2 = dayjs(date2)
    
    // 设置一周的开始日
    const startOfWeek1 = firstDayOfWeek === 0 ? d1.startOf('week') : d1.startOf('isoWeek')
    const startOfWeek2 = firstDayOfWeek === 0 ? d2.startOf('week') : d2.startOf('isoWeek')
    
    return startOfWeek1.isSame(startOfWeek2, 'day')
  }

  /**
   * 检查是否为同一月
   */
  static isSameMonth(date1: DateInput, date2: DateInput): boolean {
    return dayjs(date1).isSame(dayjs(date2), 'month')
  }

  /**
   * 检查是否为同一年
   */
  static isSameYear(date1: DateInput, date2: DateInput): boolean {
    return dayjs(date1).isSame(dayjs(date2), 'year')
  }

  /**
   * 检查是否为周末
   */
  static isWeekend(date: DateInput): boolean {
    const day = dayjs(date).day()
    return day === 0 || day === 6 // 周日或周六
  }

  /**
   * 检查是否为工作日
   */
  static isWeekday(date: DateInput): boolean {
    return !this.isWeekend(date)
  }

  /**
   * 获取月份的第一天
   */
  static startOfMonth(date: DateInput): Dayjs {
    return dayjs(date).startOf('month')
  }

  /**
   * 获取月份的最后一天
   */
  static endOfMonth(date: DateInput): Dayjs {
    return dayjs(date).endOf('month')
  }

  /**
   * 获取周的第一天
   */
  static startOfWeek(date: DateInput, firstDayOfWeek = 1): Dayjs {
    const d = dayjs(date)
    if (firstDayOfWeek === 0) {
      return d.startOf('week') // 周日开始
    } else {
      return d.startOf('isoWeek') // 周一开始
    }
  }

  /**
   * 获取周的最后一天
   */
  static endOfWeek(date: DateInput, firstDayOfWeek = 1): Dayjs {
    const d = dayjs(date)
    if (firstDayOfWeek === 0) {
      return d.endOf('week') // 周六结束
    } else {
      return d.endOf('isoWeek') // 周日结束
    }
  }

  /**
   * 获取年的第一天
   */
  static startOfYear(date: DateInput): Dayjs {
    return dayjs(date).startOf('year')
  }

  /**
   * 获取年的最后一天
   */
  static endOfYear(date: DateInput): Dayjs {
    return dayjs(date).endOf('year')
  }

  /**
   * 获取月份的天数
   */
  static daysInMonth(date: DateInput): number {
    return dayjs(date).daysInMonth()
  }

  /**
   * 获取年份的天数
   */
  static daysInYear(date: DateInput): number {
    const year = dayjs(date).year()
    return this.isLeapYear(year) ? 366 : 365
  }

  /**
   * 检查是否为闰年
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  }

  /**
   * 获取月份的所有日期
   */
  static getDatesInMonth(date: DateInput): Dayjs[] {
    const start = this.startOfMonth(date)
    const end = this.endOfMonth(date)
    const dates: Dayjs[] = []
    
    let current = start
    while (current.isSameOrBefore(end, 'day')) {
      dates.push(current)
      current = current.add(1, 'day')
    }
    
    return dates
  }

  /**
   * 获取月视图的所有日期（包括上月末尾和下月开头）
   */
  static getMonthViewDates(date: DateInput, firstDayOfWeek = 1): Dayjs[] {
    const monthStart = this.startOfMonth(date)
    const monthEnd = this.endOfMonth(date)
    const viewStart = this.startOfWeek(monthStart, firstDayOfWeek)
    const viewEnd = this.endOfWeek(monthEnd, firstDayOfWeek)
    
    const dates: Dayjs[] = []
    let current = viewStart
    
    while (current.isSameOrBefore(viewEnd, 'day')) {
      dates.push(current)
      current = current.add(1, 'day')
    }
    
    return dates
  }

  /**
   * 获取周视图的所有日期
   */
  static getWeekViewDates(date: DateInput, firstDayOfWeek = 1): Dayjs[] {
    const weekStart = this.startOfWeek(date, firstDayOfWeek)
    const dates: Dayjs[] = []
    
    for (let i = 0; i < 7; i++) {
      dates.push(weekStart.add(i, 'day'))
    }
    
    return dates
  }

  /**
   * 获取年视图的所有月份
   */
  static getYearViewMonths(date: DateInput): Dayjs[] {
    const yearStart = this.startOfYear(date)
    const months: Dayjs[] = []
    
    for (let i = 0; i < 12; i++) {
      months.push(yearStart.add(i, 'month'))
    }
    
    return months
  }

  /**
   * 获取两个日期之间的天数
   */
  static daysBetween(start: DateInput, end: DateInput): number {
    return dayjs(end).diff(dayjs(start), 'day')
  }

  /**
   * 获取两个日期之间的所有日期
   */
  static getDatesBetween(start: DateInput, end: DateInput): Dayjs[] {
    const startDate = dayjs(start)
    const endDate = dayjs(end)
    const dates: Dayjs[] = []
    
    let current = startDate
    while (current.isSameOrBefore(endDate, 'day')) {
      dates.push(current)
      current = current.add(1, 'day')
    }
    
    return dates
  }

  /**
   * 检查日期是否在范围内
   */
  static isInRange(date: DateInput, start: DateInput, end: DateInput): boolean {
    const d = dayjs(date)
    const s = dayjs(start)
    const e = dayjs(end)
    return d.isSameOrAfter(s, 'day') && d.isSameOrBefore(e, 'day')
  }

  /**
   * 检查日期是否在之前
   */
  static isBefore(date1: DateInput, date2: DateInput, unit: dayjs.OpUnitType = 'millisecond'): boolean {
    return dayjs(date1).isBefore(dayjs(date2), unit)
  }

  /**
   * 检查日期是否在之后
   */
  static isAfter(date1: DateInput, date2: DateInput, unit: dayjs.OpUnitType = 'millisecond'): boolean {
    return dayjs(date1).isAfter(dayjs(date2), unit)
  }

  /**
   * 检查日期是否相同或在之前
   */
  static isSameOrBefore(date1: DateInput, date2: DateInput, unit: dayjs.OpUnitType = 'millisecond'): boolean {
    return dayjs(date1).isSameOrBefore(dayjs(date2), unit)
  }

  /**
   * 检查日期是否相同或在之后
   */
  static isSameOrAfter(date1: DateInput, date2: DateInput, unit: dayjs.OpUnitType = 'millisecond'): boolean {
    return dayjs(date1).isSameOrAfter(dayjs(date2), unit)
  }

  /**
   * 格式化日期
   */
  static format(date: DateInput, format = 'YYYY-MM-DD'): string {
    return dayjs(date).format(format)
  }

  /**
   * 解析日期字符串
   */
  static parse(dateString: string, format?: string): Dayjs {
    if (format) {
      return dayjs(dateString, format)
    }
    return dayjs(dateString)
  }

  /**
   * 获取相对时间
   */
  static fromNow(date: DateInput): string {
    return dayjs(date).fromNow()
  }

  /**
   * 获取到指定日期的相对时间
   */
  static to(date: DateInput, target: DateInput): string {
    return dayjs(date).to(dayjs(target))
  }

  /**
   * 添加时间
   */
  static add(date: DateInput, amount: number, unit: dayjs.ManipulateType): Dayjs {
    return dayjs(date).add(amount, unit)
  }

  /**
   * 减少时间
   */
  static subtract(date: DateInput, amount: number, unit: dayjs.ManipulateType): Dayjs {
    return dayjs(date).subtract(amount, unit)
  }

  /**
   * 设置时间
   */
  static set(date: DateInput, unit: dayjs.UnitType, value: number): Dayjs {
    return dayjs(date).set(unit, value)
  }

  /**
   * 获取时间单位的值
   */
  static get(date: DateInput, unit: dayjs.UnitType): number {
    return dayjs(date).get(unit)
  }

  /**
   * 获取周数
   */
  static getWeekOfYear(date: DateInput): number {
    return dayjs(date).week()
  }

  /**
   * 获取ISO周数
   */
  static getISOWeekOfYear(date: DateInput): number {
    return dayjs(date).isoWeek()
  }

  /**
   * 获取季度
   */
  static getQuarter(date: DateInput): number {
    return dayjs(date).quarter()
  }

  /**
   * 克隆日期
   */
  static clone(date: DateInput): Dayjs {
    return dayjs(date).clone()
  }

  /**
   * 转换为UTC时间
   */
  static utc(date: DateInput): Dayjs {
    return dayjs(date).utc()
  }

  /**
   * 转换时区
   */
  static timezone(date: DateInput, tz: string): Dayjs {
    return dayjs(date).tz(tz)
  }

  /**
   * 获取时区偏移量
   */
  static getTimezoneOffset(date: DateInput): number {
    return dayjs(date).utcOffset()
  }

  /**
   * 验证日期是否有效
   */
  static isValid(date: DateInput): boolean {
    return dayjs(date).isValid()
  }

  /**
   * 转换为Date对象
   */
  static toDate(date: DateInput): Date {
    return dayjs(date).toDate()
  }

  /**
   * 转换为ISO字符串
   */
  static toISOString(date: DateInput): string {
    return dayjs(date).toISOString()
  }

  /**
   * 转换为时间戳
   */
  static valueOf(date: DateInput): number {
    return dayjs(date).valueOf()
  }

  /**
   * 转换为Unix时间戳
   */
  static unix(date: DateInput): number {
    return dayjs(date).unix()
  }

  /**
   * 获取本地化的星期名称
   */
  static getWeekdayNames(locale = 'zh-CN', format: 'long' | 'short' | 'narrow' = 'short'): string[] {
    const names: string[] = []
    const baseDate = dayjs().startOf('week') // 从周日开始
    
    for (let i = 0; i < 7; i++) {
      const date = baseDate.add(i, 'day')
      if (locale === 'zh-CN') {
        const zhNames = {
          long: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
          short: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
          narrow: ['日', '一', '二', '三', '四', '五', '六']
        }
        names.push(zhNames[format][i])
      } else {
        // 英文格式
        const formatStr = format === 'long' ? 'dddd' : format === 'short' ? 'ddd' : 'dd'
        names.push(date.format(formatStr))
      }
    }
    
    return names
  }

  /**
   * 获取本地化的月份名称
   */
  static getMonthNames(locale = 'zh-CN', format: 'long' | 'short' | 'narrow' = 'long'): string[] {
    const names: string[] = []
    
    for (let i = 0; i < 12; i++) {
      const date = dayjs().month(i)
      if (locale === 'zh-CN') {
        const zhNames = {
          long: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
          short: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
        }
        names.push(zhNames[format][i])
      } else {
        // 英文格式
        const formatStr = format === 'long' ? 'MMMM' : format === 'short' ? 'MMM' : 'M'
        names.push(date.format(formatStr))
      }
    }
    
    return names
  }

  /**
   * 获取常用的日期格式
   */
  static getCommonFormats(locale = 'zh-CN') {
    if (locale === 'zh-CN') {
      return {
        date: 'YYYY年MM月DD日',
        dateShort: 'YYYY-MM-DD',
        dateTime: 'YYYY年MM月DD日 HH:mm:ss',
        dateTimeShort: 'YYYY-MM-DD HH:mm',
        time: 'HH:mm:ss',
        timeShort: 'HH:mm',
        month: 'YYYY年MM月',
        year: 'YYYY年',
        weekday: 'dddd'
      }
    } else {
      return {
        date: 'MMMM DD, YYYY',
        dateShort: 'MM/DD/YYYY',
        dateTime: 'MMMM DD, YYYY HH:mm:ss',
        dateTimeShort: 'MM/DD/YYYY HH:mm',
        time: 'HH:mm:ss',
        timeShort: 'HH:mm',
        month: 'MMMM YYYY',
        year: 'YYYY',
        weekday: 'dddd'
      }
    }
  }
}
