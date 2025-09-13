/**
 * 节假日工具函数
 * 
 * 提供节假日相关功能：
 * - 法定节假日判断
 * - 调休日期计算
 * - 工作日判断
 * - 节假日信息获取
 * - 自定义节假日管理
 */

/**
 * 节假日类型
 */
export enum HolidayType {
  /** 法定节假日 */
  LEGAL = 'legal',
  /** 传统节日 */
  TRADITIONAL = 'traditional',
  /** 国际节日 */
  INTERNATIONAL = 'international',
  /** 自定义节假日 */
  CUSTOM = 'custom',
  /** 调休工作日 */
  WORKDAY = 'workday',
}

/**
 * 节假日信息接口
 */
export interface HolidayInfo {
  /** 节假日名称 */
  name: string
  /** 节假日类型 */
  type: HolidayType
  /** 日期 */
  date: Date
  /** 是否为法定假日 */
  isLegal: boolean
  /** 是否为调休工作日 */
  isWorkday: boolean
  /** 描述 */
  description?: string
  /** 持续天数 */
  duration?: number
}

/**
 * 中国法定节假日配置
 */
const CHINA_LEGAL_HOLIDAYS: Array<{
  name: string
  month: number
  day: number
  duration: number
  description: string
}> = [
    { name: '元旦', month: 1, day: 1, duration: 1, description: '新年第一天' },
    { name: '劳动节', month: 5, day: 1, duration: 1, description: '国际劳动节' },
    { name: '国庆节', month: 10, day: 1, duration: 3, description: '中华人民共和国成立纪念日' },
  ]

/**
 * 传统节日配置（农历）
 */
export const TRADITIONAL_HOLIDAYS: Array<{
  name: string
  lunarMonth: number
  lunarDay: number
  description: string
}> = [
    { name: '春节', lunarMonth: 1, lunarDay: 1, description: '农历新年' },
    { name: '元宵节', lunarMonth: 1, lunarDay: 15, description: '正月十五' },
    { name: '端午节', lunarMonth: 5, lunarDay: 5, description: '五月初五' },
    { name: '中秋节', lunarMonth: 8, lunarDay: 15, description: '八月十五' },
  ]

/**
 * 国际节日配置
 */
const INTERNATIONAL_HOLIDAYS: Array<{
  name: string
  month: number
  day: number
  description: string
}> = [
    { name: '情人节', month: 2, day: 14, description: '西方情人节' },
    { name: '妇女节', month: 3, day: 8, description: '国际妇女节' },
    { name: '愚人节', month: 4, day: 1, description: '愚人节' },
    { name: '儿童节', month: 6, day: 1, description: '国际儿童节' },
    { name: '教师节', month: 9, day: 10, description: '中国教师节' },
    { name: '圣诞节', month: 12, day: 25, description: '圣诞节' },
  ]

/**
 * 节假日管理器
 */
export class HolidayManager {
  /** 自定义节假日 */
  private customHolidays: Map<string, HolidayInfo> = new Map()

  /** 调休工作日 */
  private workdays: Set<string> = new Set()

  /** 特殊假期配置（按年份） */
  private specialHolidays: Map<number, HolidayInfo[]> = new Map()

  /**
   * 判断是否为节假日
   * @param date 日期
   */
  isHoliday(date: Date): boolean {
    const dateStr = this.formatDate(date)

    // 检查是否为调休工作日
    if (this.workdays.has(dateStr)) {
      return false
    }

    // 检查周末
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true
    }

    // 检查法定节假日
    if (this.isLegalHoliday(date)) {
      return true
    }

    // 检查自定义节假日
    if (this.customHolidays.has(dateStr)) {
      return true
    }

    return false
  }

  /**
   * 判断是否为法定节假日
   * @param date 日期
   */
  isLegalHoliday(date: Date): boolean {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()

    // 检查固定日期的法定节假日
    for (const holiday of CHINA_LEGAL_HOLIDAYS) {
      if (holiday.month === month && holiday.day === day) {
        return true
      }
    }

    // 检查特殊年份的节假日配置
    const specialHolidays = this.specialHolidays.get(year)
    if (specialHolidays) {
      const dateStr = this.formatDate(date)
      return specialHolidays.some(holiday =>
        this.formatDate(holiday.date) === dateStr && holiday.isLegal
      )
    }

    return false
  }

  /**
   * 判断是否为工作日
   * @param date 日期
   */
  isWorkday(date: Date): boolean {
    const dateStr = this.formatDate(date)

    // 检查是否为调休工作日
    if (this.workdays.has(dateStr)) {
      return true
    }

    // 如果是节假日，则不是工作日
    if (this.isHoliday(date)) {
      return false
    }

    // 周一到周五为工作日
    const dayOfWeek = date.getDay()
    return dayOfWeek >= 1 && dayOfWeek <= 5
  }

  /**
   * 获取节假日信息
   * @param date 日期
   */
  getHolidayInfo(date: Date): HolidayInfo | null {
    const dateStr = this.formatDate(date)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()

    // 检查调休工作日
    if (this.workdays.has(dateStr)) {
      return {
        name: '调休工作日',
        type: HolidayType.WORKDAY,
        date: new Date(date),
        isLegal: false,
        isWorkday: true,
        description: '因节假日调休安排的工作日',
      }
    }

    // 检查自定义节假日
    if (this.customHolidays.has(dateStr)) {
      return { ...this.customHolidays.get(dateStr)! }
    }

    // 检查特殊年份配置
    const specialHolidays = this.specialHolidays.get(year)
    if (specialHolidays) {
      const special = specialHolidays.find(holiday =>
        this.formatDate(holiday.date) === dateStr
      )
      if (special) {
        return { ...special }
      }
    }

    // 检查法定节假日
    for (const holiday of CHINA_LEGAL_HOLIDAYS) {
      if (holiday.month === month && holiday.day === day) {
        return {
          name: holiday.name,
          type: HolidayType.LEGAL,
          date: new Date(date),
          isLegal: true,
          isWorkday: false,
          description: holiday.description,
          duration: holiday.duration,
        }
      }
    }

    // 检查国际节日
    for (const holiday of INTERNATIONAL_HOLIDAYS) {
      if (holiday.month === month && holiday.day === day) {
        return {
          name: holiday.name,
          type: HolidayType.INTERNATIONAL,
          date: new Date(date),
          isLegal: false,
          isWorkday: false,
          description: holiday.description,
        }
      }
    }

    // 检查周末
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        name: dayOfWeek === 0 ? '周日' : '周六',
        type: HolidayType.LEGAL,
        date: new Date(date),
        isLegal: false,
        isWorkday: false,
        description: '周末休息日',
      }
    }

    return null
  }

  /**
   * 获取月份的所有节假日
   * @param year 年份
   * @param month 月份（1-12）
   */
  getMonthHolidays(year: number, month: number): HolidayInfo[] {
    const holidays: HolidayInfo[] = []
    const daysInMonth = new Date(year, month, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const holidayInfo = this.getHolidayInfo(date)

      if (holidayInfo) {
        holidays.push(holidayInfo)
      }
    }

    return holidays
  }

  /**
   * 添加自定义节假日
   * @param holidayInfo 节假日信息
   */
  addCustomHoliday(holidayInfo: HolidayInfo): void {
    const dateStr = this.formatDate(holidayInfo.date)
    this.customHolidays.set(dateStr, { ...holidayInfo })
  }

  /**
   * 移除自定义节假日
   * @param date 日期
   */
  removeCustomHoliday(date: Date): void {
    const dateStr = this.formatDate(date)
    this.customHolidays.delete(dateStr)
  }

  /**
   * 添加调休工作日
   * @param date 日期
   */
  addWorkday(date: Date): void {
    const dateStr = this.formatDate(date)
    this.workdays.add(dateStr)
  }

  /**
   * 移除调休工作日
   * @param date 日期
   */
  removeWorkday(date: Date): void {
    const dateStr = this.formatDate(date)
    this.workdays.delete(dateStr)
  }

  /**
   * 设置特殊年份的节假日配置
   * @param year 年份
   * @param holidays 节假日列表
   */
  setYearHolidays(year: number, holidays: HolidayInfo[]): void {
    this.specialHolidays.set(year, holidays.map(h => ({ ...h })))
  }

  /**
   * 获取下一个工作日
   * @param date 起始日期
   */
  getNextWorkday(date: Date): Date {
    let nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    while (!this.isWorkday(nextDate)) {
      nextDate.setDate(nextDate.getDate() + 1)
    }

    return nextDate
  }

  /**
   * 获取上一个工作日
   * @param date 起始日期
   */
  getPreviousWorkday(date: Date): Date {
    let prevDate = new Date(date)
    prevDate.setDate(prevDate.getDate() - 1)

    while (!this.isWorkday(prevDate)) {
      prevDate.setDate(prevDate.getDate() - 1)
    }

    return prevDate
  }

  /**
   * 计算工作日天数
   * @param startDate 开始日期
   * @param endDate 结束日期
   */
  getWorkdaysCount(startDate: Date, endDate: Date): number {
    let count = 0
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      if (this.isWorkday(currentDate)) {
        count++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return count
  }

  /**
   * 获取节假日名称
   * @param date 日期
   */
  getHolidayName(date: Date): string | null {
    const holidayInfo = this.getHolidayInfo(date)
    return holidayInfo ? holidayInfo.name : null
  }

  /**
   * 清空所有自定义配置
   */
  clear(): void {
    this.customHolidays.clear()
    this.workdays.clear()
    this.specialHolidays.clear()
  }

  /**
   * 格式化日期为字符串
   * @param date 日期
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

// 创建全局实例
export const holidayManager = new HolidayManager()

// 导出便捷函数
export const isHoliday = (date: Date) => holidayManager.isHoliday(date)
export const isWorkday = (date: Date) => holidayManager.isWorkday(date)
export const getHolidayInfo = (date: Date) => holidayManager.getHolidayInfo(date)
export const getHolidayName = (date: Date) => holidayManager.getHolidayName(date)
