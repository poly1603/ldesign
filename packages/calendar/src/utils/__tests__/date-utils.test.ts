/**
 * 日期工具函数测试
 */

import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatTime,
  formatDateTime,
  parseDate,
  getToday,
  getTomorrow,
  getYesterday,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getDaysInMonth,
  isLeapYear,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isToday,
  isWeekend,
  isDateInRange,
  getDaysDiff,
  addDays,
  addMonths,
  subtractDays,
  getDayOfWeek,
  getMonthName,
  getMonthViewDates,
  getWeekViewDates,
  getDayViewHours,
  getWeekNumber,
  getQuarter,
  isInCurrentMonth,
  isInCurrentWeek,
  getWeeksInMonth,
  getHourLabel,
  calculateEventPosition,
  isTimeRangeOverlap
} from '../date-utils'

describe('日期格式化', () => {
  const testDate = new Date('2025-09-15T10:30:00')

  it('应该正确格式化日期', () => {
    expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2025-09-15')
    expect(formatDate(testDate, 'MM/DD/YYYY')).toBe('09/15/2025')
    expect(formatDate(testDate, 'YYYY年MM月DD日')).toBe('2025年09月15日')
  })

  it('应该正确格式化时间', () => {
    expect(formatTime(testDate, 'HH:mm')).toBe('10:30')
    expect(formatTime(testDate, 'HH:mm:ss')).toBe('10:30:00')
  })

  it('应该正确格式化日期时间', () => {
    expect(formatDateTime(testDate, 'YYYY-MM-DD HH:mm')).toBe('2025-09-15 10:30')
  })
})

describe('日期解析', () => {
  it('应该正确解析日期字符串', () => {
    const parsed = parseDate('2025-09-15')
    expect(parsed.getFullYear()).toBe(2025)
    expect(parsed.getMonth()).toBe(8) // 月份从0开始
    expect(parsed.getDate()).toBe(15)
  })

  it('应该正确解析自定义格式的日期', () => {
    const parsed = parseDate('15/09/2025', 'DD/MM/YYYY')
    expect(parsed.getFullYear()).toBe(2025)
    expect(parsed.getMonth()).toBe(8)
    expect(parsed.getDate()).toBe(15)
  })
})

describe('日期计算', () => {
  const testDate = new Date('2025-09-15') // 周一

  it('应该正确获取周的开始和结束', () => {
    // 周日开始
    const startSunday = getStartOfWeek(testDate, 0)
    expect(startSunday.getDay()).toBe(0) // 周日

    // 周一开始
    const startMonday = getStartOfWeek(testDate, 1)
    expect(startMonday.getDay()).toBe(1) // 周一
    expect(isSameDay(startMonday, testDate)).toBe(true)
  })

  it('应该正确获取月的开始和结束', () => {
    const monthStart = getStartOfMonth(testDate)
    expect(monthStart.getDate()).toBe(1)
    expect(monthStart.getMonth()).toBe(8)

    const monthEnd = getEndOfMonth(testDate)
    expect(monthEnd.getDate()).toBe(30) // 9月有30天
    expect(monthEnd.getMonth()).toBe(8)
  })

  it('应该正确计算月份天数', () => {
    expect(getDaysInMonth('2025-02-01')).toBe(28) // 2025年不是闰年
    expect(getDaysInMonth('2024-02-01')).toBe(29) // 2024年是闰年
    expect(getDaysInMonth('2025-09-01')).toBe(30)
  })

  it('应该正确判断闰年', () => {
    expect(isLeapYear(2024)).toBe(true)
    expect(isLeapYear(2025)).toBe(false)
    expect(isLeapYear(2000)).toBe(true)
    expect(isLeapYear(1900)).toBe(false)
  })
})

describe('日期比较', () => {
  const date1 = new Date('2025-09-15')
  const date2 = new Date('2025-09-15')
  const date3 = new Date('2025-09-16')

  it('应该正确判断是否为同一天', () => {
    expect(isSameDay(date1, date2)).toBe(true)
    expect(isSameDay(date1, date3)).toBe(false)
  })

  it('应该正确判断是否为同一周', () => {
    expect(isSameWeek(date1, date3)).toBe(true) // 都在同一周
  })

  it('应该正确判断是否为同一月', () => {
    expect(isSameMonth(date1, date3)).toBe(true)
    expect(isSameMonth(date1, new Date('2025-10-01'))).toBe(false)
  })

  it('应该正确判断是否为周末', () => {
    expect(isWeekend(new Date('2025-09-13'))).toBe(true) // 周六
    expect(isWeekend(new Date('2025-09-14'))).toBe(true) // 周日
    expect(isWeekend(new Date('2025-09-15'))).toBe(false) // 周一
  })

  it('应该正确判断日期是否在范围内', () => {
    const start = new Date('2025-09-10')
    const end = new Date('2025-09-20')
    const testDate = new Date('2025-09-15')

    expect(isDateInRange(testDate, start, end)).toBe(true)
    expect(isDateInRange(new Date('2025-09-05'), start, end)).toBe(false)
    expect(isDateInRange(new Date('2025-09-25'), start, end)).toBe(false)
  })
})

describe('日期运算', () => {
  const baseDate = new Date('2025-09-15')

  it('应该正确添加天数', () => {
    const result = addDays(baseDate, 5)
    expect(result.getDate()).toBe(20)
  })

  it('应该正确添加月数', () => {
    const result = addMonths(baseDate, 2)
    expect(result.getMonth()).toBe(10) // 11月（从0开始）
  })

  it('应该正确减去天数', () => {
    const result = subtractDays(baseDate, 5)
    expect(result.getDate()).toBe(10)
  })

  it('应该正确计算日期差', () => {
    const date1 = new Date('2025-09-10')
    const date2 = new Date('2025-09-15')
    expect(getDaysDiff(date1, date2)).toBe(5)
  })
})

describe('日历视图专用函数', () => {
  const testDate = new Date('2025-09-15') // 2025年9月15日，周一

  it('应该正确获取月视图日期', () => {
    const dates = getMonthViewDates(testDate, 1) // 周一开始
    expect(dates.length).toBeGreaterThan(28) // 至少包含整个月
    expect(dates.length % 7).toBe(0) // 应该是7的倍数（完整的周）
  })

  it('应该正确获取周视图日期', () => {
    const dates = getWeekViewDates(testDate, 1) // 周一开始
    expect(dates.length).toBe(7)
    expect(dates[0].getDay()).toBe(1) // 第一天是周一
  })

  it('应该正确获取日视图小时', () => {
    const hours = getDayViewHours(testDate, 9, 17) // 9点到17点
    expect(hours.length).toBe(9) // 9, 10, 11, 12, 13, 14, 15, 16, 17
    expect(hours[0].getHours()).toBe(9)
    expect(hours[8].getHours()).toBe(17)
  })

  it('应该正确获取周数', () => {
    const weekNum = getWeekNumber(testDate)
    expect(typeof weekNum).toBe('number')
    expect(weekNum).toBeGreaterThan(0)
    expect(weekNum).toBeLessThanOrEqual(53)
  })

  it('应该正确获取季度', () => {
    expect(getQuarter(new Date('2025-01-15'))).toBe(1)
    expect(getQuarter(new Date('2025-04-15'))).toBe(2)
    expect(getQuarter(new Date('2025-07-15'))).toBe(3)
    expect(getQuarter(new Date('2025-10-15'))).toBe(4)
  })

  it('应该正确判断是否在当前月', () => {
    const sameMonth = new Date('2025-09-20')
    const differentMonth = new Date('2025-10-15')
    
    expect(isInCurrentMonth(sameMonth, testDate)).toBe(true)
    expect(isInCurrentMonth(differentMonth, testDate)).toBe(false)
  })

  it('应该正确获取小时标签', () => {
    expect(getHourLabel(0, '24')).toBe('00:00')
    expect(getHourLabel(13, '24')).toBe('13:00')
    expect(getHourLabel(0, '12')).toBe('12 AM')
    expect(getHourLabel(12, '12')).toBe('12 PM')
    expect(getHourLabel(13, '12')).toBe('1 PM')
  })

  it('应该正确检查时间段重叠', () => {
    const start1 = new Date('2025-09-15T10:00:00')
    const end1 = new Date('2025-09-15T12:00:00')
    const start2 = new Date('2025-09-15T11:00:00')
    const end2 = new Date('2025-09-15T13:00:00')
    const start3 = new Date('2025-09-15T14:00:00')
    const end3 = new Date('2025-09-15T16:00:00')

    expect(isTimeRangeOverlap(start1, end1, start2, end2)).toBe(true) // 重叠
    expect(isTimeRangeOverlap(start1, end1, start3, end3)).toBe(false) // 不重叠
  })
})
