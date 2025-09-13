/**
 * 农历工具函数
 * 
 * 提供农历相关功能：
 * - 公历转农历
 * - 农历节日计算
 * - 二十四节气计算
 * - 天干地支计算
 * - 生肖计算
 */

import { Lunar } from 'lunar-javascript'

/**
 * 农历信息接口
 */
export interface LunarInfo {
  /** 农历年 */
  year: number
  /** 农历月 */
  month: number
  /** 农历日 */
  day: number
  /** 农历年中文 */
  yearInChinese: string
  /** 农历月中文 */
  monthInChinese: string
  /** 农历日中文 */
  dayInChinese: string
  /** 是否闰月 */
  isLeapMonth: boolean
  /** 天干地支年 */
  yearInGanZhi: string
  /** 天干地支月 */
  monthInGanZhi: string
  /** 天干地支日 */
  dayInGanZhi: string
  /** 生肖 */
  zodiac: string
  /** 星座 */
  constellation: string
  /** 农历节日 */
  festivals: string[]
  /** 节气 */
  solarTerm: string | null
  /** 宜 */
  yi: string[]
  /** 忌 */
  ji: string[]
}

/**
 * 节气信息接口
 */
export interface SolarTermInfo {
  /** 节气名称 */
  name: string
  /** 节气日期 */
  date: Date
  /** 是否为当天 */
  isToday: boolean
}

/**
 * 获取农历信息
 * @param date 公历日期
 */
export function getLunarInfo(date: Date): LunarInfo {
  const lunar = Lunar.fromDate(date)

  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    yearInChinese: lunar.getYearInChinese(),
    monthInChinese: lunar.getMonthInChinese(),
    dayInChinese: lunar.getDayInChinese(),
    isLeapMonth: lunar.isLeapMonth(),
    yearInGanZhi: lunar.getYearInGanZhi(),
    monthInGanZhi: lunar.getMonthInGanZhi(),
    dayInGanZhi: lunar.getDayInGanZhi(),
    zodiac: lunar.getYearZodiac(),
    constellation: lunar.getConstellation(),
    festivals: lunar.getFestivals(),
    solarTerm: lunar.getJieQi(),
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
  }
}

/**
 * 获取农历日期显示文本
 * @param date 公历日期
 * @param showYear 是否显示年份
 */
export function getLunarDateText(date: Date, showYear: boolean = false): string {
  const lunar = Lunar.fromDate(date)

  let text = ''

  if (showYear) {
    text += lunar.getYearInChinese() + '年'
  }

  // 如果是闰月，添加"闰"字
  if (lunar.isLeapMonth()) {
    text += '闰'
  }

  text += lunar.getMonthInChinese()
  text += lunar.getDayInChinese()

  return text
}

/**
 * 获取农历节日
 * @param date 公历日期
 */
export function getLunarFestivals(date: Date): string[] {
  const lunar = Lunar.fromDate(date)
  return lunar.getFestivals()
}

/**
 * 获取节气信息
 * @param date 公历日期
 */
export function getSolarTerm(date: Date): string | null {
  const lunar = Lunar.fromDate(date)
  return lunar.getJieQi()
}

/**
 * 获取当月所有节气
 * @param year 年份
 * @param month 月份（1-12）
 */
export function getMonthlySolarTerms(year: number, month: number): SolarTermInfo[] {
  const terms: SolarTermInfo[] = []
  const today = new Date()

  // 获取当月最后一天
  const lastDay = new Date(year, month, 0)

  // 遍历当月每一天，查找节气
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month - 1, day)
    const lunar = Lunar.fromDate(currentDate)
    const solarTerm = lunar.getJieQi()

    if (solarTerm) {
      terms.push({
        name: solarTerm,
        date: currentDate,
        isToday: currentDate.toDateString() === today.toDateString(),
      })
    }
  }

  return terms
}

/**
 * 获取生肖
 * @param date 公历日期
 */
export function getZodiac(date: Date): string {
  const lunar = Lunar.fromDate(date)
  return lunar.getYearZodiac()
}

/**
 * 获取星座
 * @param date 公历日期
 */
export function getConstellation(date: Date): string {
  const lunar = Lunar.fromDate(date)
  return lunar.getConstellation()
}

/**
 * 获取天干地支
 * @param date 公历日期
 */
export function getGanZhi(date: Date): {
  year: string
  month: string
  day: string
} {
  const lunar = Lunar.fromDate(date)

  return {
    year: lunar.getYearInGanZhi(),
    month: lunar.getMonthInGanZhi(),
    day: lunar.getDayInGanZhi(),
  }
}

/**
 * 获取宜忌信息
 * @param date 公历日期
 */
export function getYiJi(date: Date): {
  yi: string[]
  ji: string[]
} {
  const lunar = Lunar.fromDate(date)

  return {
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
  }
}

/**
 * 判断是否为农历节日
 * @param date 公历日期
 */
export function isLunarFestival(date: Date): boolean {
  const festivals = getLunarFestivals(date)
  return festivals.length > 0
}

/**
 * 判断是否为节气
 * @param date 公历日期
 */
export function isSolarTerm(date: Date): boolean {
  const solarTerm = getSolarTerm(date)
  return solarTerm !== null
}

/**
 * 获取农历月份天数
 * @param year 农历年
 * @param month 农历月
 * @param isLeapMonth 是否闰月
 */
export function getLunarMonthDays(_year: number, _month: number, _isLeapMonth: boolean = false): number {
  // 这里需要使用农历库的具体实现
  // lunar-javascript 库可能有相应的方法
  return 30 // 临时返回值
}

/**
 * 获取农历年份天数
 * @param year 农历年
 */
export function getLunarYearDays(_year: number): number {
  // 这里需要使用农历库的具体实现
  return 354 // 临时返回值
}

/**
 * 判断农历年是否有闰月
 * @param year 农历年
 */
export function hasLeapMonth(_year: number): boolean {
  // 这里需要使用农历库的具体实现
  return false // 临时返回值
}

/**
 * 获取农历年的闰月月份
 * @param year 农历年
 */
export function getLeapMonth(_year: number): number {
  // 这里需要使用农历库的具体实现
  return 0 // 临时返回值，0表示无闰月
}

/**
 * 农历转公历
 * @param year 农历年
 * @param month 农历月
 * @param day 农历日
 * @param isLeapMonth 是否闰月
 */
export function lunarToSolar(year: number, month: number, day: number, isLeapMonth: boolean = false): Date {
  // 使用 lunar-javascript 库进行转换
  try {
    const lunar = Lunar.fromYmd(year, month, day)
    if (isLeapMonth) {
      lunar.setLeapMonth(true)
    }
    const solar = lunar.getSolar()
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay())
  } catch (error) {
    console.error('农历转公历失败:', error)
    return new Date()
  }
}

/**
 * 获取农历日期的简短显示文本
 * @param date 公历日期
 */
export function getLunarShortText(date: Date): string {
  const lunar = Lunar.fromDate(date)

  // 如果是农历初一，显示月份
  if (lunar.getDay() === 1) {
    return lunar.getMonthInChinese()
  }

  // 如果有节日，优先显示节日
  const festivals = lunar.getFestivals()
  if (festivals.length > 0) {
    return festivals[0] || ''
  }

  // 如果有节气，显示节气
  const solarTerm = lunar.getJieQi()
  if (solarTerm) {
    return solarTerm
  }

  // 否则显示农历日期
  return lunar.getDayInChinese()
}

/**
 * 获取传统节日列表
 */
export function getTraditionalFestivals(): Array<{
  name: string
  lunarMonth: number
  lunarDay: number
  description: string
}> {
  return [
    { name: '春节', lunarMonth: 1, lunarDay: 1, description: '农历新年' },
    { name: '元宵节', lunarMonth: 1, lunarDay: 15, description: '正月十五' },
    { name: '龙抬头', lunarMonth: 2, lunarDay: 2, description: '二月二' },
    { name: '端午节', lunarMonth: 5, lunarDay: 5, description: '五月初五' },
    { name: '七夕节', lunarMonth: 7, lunarDay: 7, description: '七月初七' },
    { name: '中元节', lunarMonth: 7, lunarDay: 15, description: '七月十五' },
    { name: '中秋节', lunarMonth: 8, lunarDay: 15, description: '八月十五' },
    { name: '重阳节', lunarMonth: 9, lunarDay: 9, description: '九月初九' },
    { name: '腊八节', lunarMonth: 12, lunarDay: 8, description: '腊月初八' },
    { name: '小年', lunarMonth: 12, lunarDay: 23, description: '腊月二十三' },
    { name: '除夕', lunarMonth: 12, lunarDay: 30, description: '腊月三十' },
  ]
}

/**
 * 获取二十四节气列表
 */
export function getSolarTermsList(): string[] {
  return [
    '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
    '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
    '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
    '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
  ]
}
