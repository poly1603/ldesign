/**
 * 农历工具函数
 */

import { Lunar, Solar } from 'lunar-javascript'
import type { LunarInfo, DateInput } from '../types'
import { DateUtils } from './date'

/**
 * 农历工具类
 */
export class LunarUtils {
  /**
   * 获取农历信息
   */
  static getLunarInfo(date: DateInput): LunarInfo {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()
    const ganzhi = this.getGanZhi(date)
    const { suitable, avoid } = this.getSuitableAndAvoid(date)

    return {
      year: `${lunar.getYearInChinese()}年`,
      month: `${lunar.getMonthInChinese()}月`,
      day: lunar.getDayInChinese(),
      term: lunar.getJieQi() || undefined,
      festival: this.getLunarFestival(lunar) || undefined,
      zodiac: lunar.getYearShengXiao(),
      gzYear: lunar.getYearInGanZhi(),
      isLeap: lunar.getMonth() < 0,
      ganzhi,
      suitable,
      avoid
    }
  }

  /**
   * 获取农历节日
   */
  private static getLunarFestival(lunar: Lunar): string | null {
    const festivals: Record<string, string> = {
      '正月初一': '春节',
      '正月十五': '元宵节',
      '二月初二': '龙抬头',
      '五月初五': '端午节',
      '七月初七': '七夕节',
      '七月十五': '中元节',
      '八月十五': '中秋节',
      '九月初九': '重阳节',
      '腊月初八': '腊八节',
      '腊月二十三': '小年',
      '腊月二十四': '小年'
    }

    const monthDay = `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`
    return festivals[monthDay] || null
  }

  /**
   * 获取节气信息
   */
  static getSolarTerm(date: DateInput): string | null {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()
    return lunar.getJieQi()
  }

  /**
   * 获取生肖
   */
  static getZodiac(date: DateInput): string {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()
    return lunar.getYearShengXiao()
  }

  /**
   * 获取天干地支
   */
  static getGanZhi(date: DateInput): {
    year: string
    month: string
    day: string
    hour: string
  } {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()

    return {
      year: lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhi(),
      day: lunar.getDayInGanZhi(),
      hour: lunar.getTimeInGanZhi(solarDate.hour())
    }
  }

  /**
   * 获取宜忌信息
   */
  static getSuitableAndAvoid(date: DateInput): { suitable: string[]; avoid: string[] } {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()

    // 使用lunar-javascript库的宜忌功能
    const yi = lunar.getDayYi()
    const ji = lunar.getDayJi()

    return {
      suitable: yi || this.getDefaultSuitable(solarDate),
      avoid: ji || this.getDefaultAvoid(solarDate)
    }
  }

  /**
   * 获取默认宜做事项（当库没有数据时的备用）
   */
  private static getDefaultSuitable(date: any): string[] {
    const activities = [
      '祭祀', '祈福', '求嗣', '开光', '塑绘', '斋醮', '订盟', '纳采', '嫁娶', '裁衣',
      '合帐', '冠笄', '安机械', '安床', '造仓', '开池', '塞穴', '入殓', '破土', '安葬',
      '立碑', '谢土', '启攒', '沐浴', '整手足甲', '扫舍', '修饰垣墙', '平治道涂',
      '修造', '动土', '竖柱', '上梁', '开业', '开市', '交易', '立券', '纳财', '栽种'
    ]

    const dayOfYear = date.dayOfYear()
    const seed = dayOfYear % 100
    const count = 3 + (seed % 3)
    const result: string[] = []

    for (let i = 0; i < count; i++) {
      const index = (seed + i * 7) % activities.length
      const activity = activities[index]
      if (!result.includes(activity)) {
        result.push(activity)
      }
    }

    return result
  }

  /**
   * 获取默认忌做事项（当库没有数据时的备用）
   */
  private static getDefaultAvoid(date: any): string[] {
    const activities = [
      '嫁娶', '开市', '安床', '栽种', '安葬', '破土', '修造', '动土', '出行', '移徙',
      '入宅', '开业', '交易', '纳财', '祭祀', '祈福', '斋醮', '开光', '塑绘', '订盟',
      '纳采', '裁衣', '合帐', '冠笄', '安机械', '造仓', '开池', '塞穴', '入殓'
    ]

    const dayOfYear = date.dayOfYear()
    const seed = dayOfYear % 100
    const count = 2 + (seed % 3)
    const result: string[] = []

    for (let i = 0; i < count; i++) {
      const index = (seed + i * 11) % activities.length
      const activity = activities[index]
      if (!result.includes(activity)) {
        result.push(activity)
      }
    }

    return result
  }

  /**
   * 检查是否为农历节日
   */
  static isLunarFestival(date: DateInput): boolean {
    const lunarInfo = this.getLunarInfo(date)
    return !!lunarInfo.festival
  }

  /**
   * 检查是否为节气
   */
  static isSolarTerm(date: DateInput): boolean {
    const term = this.getSolarTerm(date)
    return !!term
  }

  /**
   * 获取农历月份天数
   */
  static getLunarMonthDays(year: number, month: number): number {
    const lunar = Lunar.fromYmd(year, month, 1)
    return lunar.getDayCount()
  }

  /**
   * 检查是否为农历闰月
   */
  static isLunarLeapMonth(year: number, month: number): boolean {
    const lunar = Lunar.fromYmd(year, month, 1)
    return lunar.getMonth() < 0
  }

  /**
   * 获取农历年的闰月
   */
  static getLunarLeapMonth(year: number): number {
    const lunar = Lunar.fromYmd(year, 1, 1)
    return lunar.getLeapMonth()
  }

  /**
   * 农历转公历
   */
  static lunarToSolar(year: number, month: number, day: number, isLeap = false): Date {
    const lunar = Lunar.fromYmd(year, isLeap ? -month : month, day)
    const solar = lunar.getSolar()
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay())
  }

  /**
   * 公历转农历
   */
  static solarToLunar(date: DateInput): {
    year: number
    month: number
    day: number
    isLeap: boolean
  } {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()

    return {
      year: lunar.getYear(),
      month: Math.abs(lunar.getMonth()),
      day: lunar.getDay(),
      isLeap: lunar.getMonth() < 0
    }
  }

  /**
   * 获取农历年份的所有节气
   */
  static getYearSolarTerms(year: number): Array<{ name: string; date: Date }> {
    const terms: Array<{ name: string; date: Date }> = []
    
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 31; day++) {
        try {
          const solar = Solar.fromYmd(year, month, day)
          const lunar = solar.getLunar()
          const term = lunar.getJieQi()
          
          if (term) {
            terms.push({
              name: term,
              date: new Date(year, month - 1, day)
            })
          }
        } catch (error) {
          // 忽略无效日期
        }
      }
    }
    
    return terms
  }

  /**
   * 获取农历年份的所有节日
   */
  static getYearLunarFestivals(year: number): Array<{ name: string; date: Date; lunar: string }> {
    const festivals: Array<{ name: string; date: Date; lunar: string }> = []
    
    const festivalDates = [
      { lunar: { month: 1, day: 1 }, name: '春节' },
      { lunar: { month: 1, day: 15 }, name: '元宵节' },
      { lunar: { month: 2, day: 2 }, name: '龙抬头' },
      { lunar: { month: 5, day: 5 }, name: '端午节' },
      { lunar: { month: 7, day: 7 }, name: '七夕节' },
      { lunar: { month: 7, day: 15 }, name: '中元节' },
      { lunar: { month: 8, day: 15 }, name: '中秋节' },
      { lunar: { month: 9, day: 9 }, name: '重阳节' },
      { lunar: { month: 12, day: 8 }, name: '腊八节' },
      { lunar: { month: 12, day: 23 }, name: '小年' }
    ]
    
    for (const festival of festivalDates) {
      try {
        const solarDate = this.lunarToSolar(year, festival.lunar.month, festival.lunar.day)
        festivals.push({
          name: festival.name,
          date: solarDate,
          lunar: `${festival.lunar.month}月${festival.lunar.day}日`
        })
      } catch (error) {
        // 忽略无效日期
      }
    }
    
    return festivals
  }

  /**
   * 获取五行信息
   */
  static getWuXing(date: DateInput): {
    year: string
    month: string
    day: string
    hour: string
  } {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()

    return {
      year: lunar.getYearNaYin(),
      month: lunar.getMonthNaYin(),
      day: lunar.getDayNaYin(),
      hour: lunar.getTimeNaYin(solarDate.hour())
    }
  }

  /**
   * 获取星宿信息
   */
  static getXingXiu(date: DateInput): string {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()
    return lunar.getXiu()
  }

  /**
   * 获取建除十二神
   */
  static getJianChu(date: DateInput): string {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()
    return lunar.getJianChu()
  }

  /**
   * 获取值神
   */
  static getZhiShen(date: DateInput): string {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()
    return lunar.getZhiShen()
  }

  /**
   * 获取胎神占方
   */
  static getTaiShen(date: DateInput): string {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()
    return lunar.getTaiShen()
  }

  /**
   * 获取冲煞信息
   */
  static getChongSha(date: DateInput): {
    chong: string
    sha: string
  } {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()

    return {
      chong: lunar.getDayChong(),
      sha: lunar.getDaySha()
    }
  }

  /**
   * 获取宜忌信息
   */
  static getYiJi(date: DateInput): {
    yi: string[]
    ji: string[]
  } {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()

    return {
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi()
    }
  }

  /**
   * 获取时辰信息
   */
  static getHourInfo(date: DateInput, hour: number): {
    name: string
    ganZhi: string
    wuXing: string
    chong: string
    sha: string
    yi: string[]
    ji: string[]
  } {
    const solarDate = DateUtils.dayjs(date)
    const solar = Solar.fromYmd(solarDate.year(), solarDate.month() + 1, solarDate.date())
    const lunar = solar.getLunar()
    const lunarHour = lunar.getTimeZhi(hour)

    return {
      name: lunarHour,
      ganZhi: lunar.getTimeInGanZhi(hour),
      wuXing: lunar.getTimeNaYin(hour),
      chong: lunar.getTimeChong(hour),
      sha: lunar.getTimeSha(hour),
      yi: lunar.getTimeYi(hour),
      ji: lunar.getTimeJi(hour)
    }
  }

  /**
   * 获取农历显示文本
   */
  static getLunarDisplayText(lunarInfo: LunarInfo): string {
    if (lunarInfo.festival) {
      return lunarInfo.festival
    }
    
    if (lunarInfo.term) {
      return lunarInfo.term
    }
    
    if (lunarInfo.day === '初一') {
      return lunarInfo.month
    }
    
    return lunarInfo.day
  }

  /**
   * 格式化农历日期
   */
  static formatLunarDate(lunarInfo: LunarInfo, format = 'full'): string {
    switch (format) {
      case 'full':
        return `${lunarInfo.year}${lunarInfo.month}${lunarInfo.day}`
      case 'monthDay':
        return `${lunarInfo.month}${lunarInfo.day}`
      case 'day':
        return lunarInfo.day
      case 'month':
        return lunarInfo.month
      case 'year':
        return lunarInfo.year
      default:
        return lunarInfo.day
    }
  }

  /**
   * 检查日期是否适宜某项活动
   */
  static isSuitableFor(date: DateInput, activity: string): boolean {
    const yiJi = this.getYiJi(date)
    return yiJi.yi.includes(activity)
  }

  /**
   * 检查日期是否忌讳某项活动
   */
  static isTabooFor(date: DateInput, activity: string): boolean {
    const yiJi = this.getYiJi(date)
    return yiJi.ji.includes(activity)
  }

  /**
   * 获取下一个农历节日
   */
  static getNextLunarFestival(date: DateInput): { name: string; date: Date } | null {
    const currentDate = DateUtils.dayjs(date)
    const year = currentDate.year()
    
    // 获取当年和下一年的农历节日
    const thisYearFestivals = this.getYearLunarFestivals(year)
    const nextYearFestivals = this.getYearLunarFestivals(year + 1)
    
    const allFestivals = [...thisYearFestivals, ...nextYearFestivals]
      .filter(festival => DateUtils.dayjs(festival.date).isAfter(currentDate))
      .sort((a, b) => DateUtils.dayjs(a.date).valueOf() - DateUtils.dayjs(b.date).valueOf())
    
    return allFestivals[0] || null
  }

  /**
   * 获取下一个节气
   */
  static getNextSolarTerm(date: DateInput): { name: string; date: Date } | null {
    const currentDate = DateUtils.dayjs(date)
    const year = currentDate.year()
    
    // 获取当年和下一年的节气
    const thisYearTerms = this.getYearSolarTerms(year)
    const nextYearTerms = this.getYearSolarTerms(year + 1)
    
    const allTerms = [...thisYearTerms, ...nextYearTerms]
      .filter(term => DateUtils.dayjs(term.date).isAfter(currentDate))
      .sort((a, b) => DateUtils.dayjs(a.date).valueOf() - DateUtils.dayjs(b.date).valueOf())
    
    return allTerms[0] || null
  }
}
