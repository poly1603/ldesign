/**
 * 日期工具类
 * 提供日期格式化、解析、计算、比较等20+实用方法，支持国际化
 */

import type { DateValue, DateRange } from '../types';

/**
 * 日期工具类
 */
export class DateUtils {
  // ==================== 常量定义 ====================
  
  /** 毫秒常量 */
  private static readonly MILLISECONDS = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000
  };
  
  /** 默认格式 */
  private static readonly DEFAULT_FORMAT = 'YYYY-MM-DD';
  
  /** 格式化令牌正则 */
  private static readonly FORMAT_TOKENS = {
    YYYY: /YYYY/g,
    YY: /YY/g,
    MM: /MM/g,
    M: /(?<!M)M(?!M)/g,
    DD: /DD/g,
    D: /(?<!D)D(?!D)/g,
    HH: /HH/g,
    H: /(?<!H)H(?!H)/g,
    mm: /mm/g,
    m: /(?<!m)m(?!m)/g,
    ss: /ss/g,
    s: /(?<!s)s(?!s)/g,
    SSS: /SSS/g
  };
  
  // ==================== 基础方法 ====================
  
  /**
   * 将值转换为Date对象
   * @param value 日期值
   * @returns Date对象或null
   */
  static toDate(value: DateValue): Date | null {
    if (value === null || value === undefined) {
      return null;
    }
    
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : new Date(value);
    }
    
    if (typeof value === 'string') {
      if (value.trim() === '') {
        return null;
      }
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    
    if (typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  }
  
  /**
   * 检查是否为有效日期
   * @param value 日期值
   * @returns 是否有效
   */
  static isValid(value: DateValue): boolean {
    return this.toDate(value) !== null;
  }
  
  /**
   * 获取当前日期
   * @returns 当前日期
   */
  static now(): Date {
    return new Date();
  }
  
  /**
   * 获取今天的开始时间 (00:00:00)
   * @returns 今天开始时间
   */
  static startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  
  /**
   * 获取今天的结束时间 (23:59:59.999)
   * @returns 今天结束时间
   */
  static endOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }
  
  // ==================== 格式化方法 ====================
  
  /**
   * 格式化日期
   * @param value 日期值
   * @param format 格式字符串
   * @returns 格式化后的字符串
   */
  static format(value: DateValue, format: string = this.DEFAULT_FORMAT): string {
    const date = this.toDate(value);
    if (!date) {
      return '';
    }
    
    let result = format;
    
    // 年份
    result = result.replace(this.FORMAT_TOKENS.YYYY, date.getFullYear().toString());
    result = result.replace(this.FORMAT_TOKENS.YY, date.getFullYear().toString().slice(-2));
    
    // 月份
    result = result.replace(this.FORMAT_TOKENS.MM, this.padZero(date.getMonth() + 1));
    result = result.replace(this.FORMAT_TOKENS.M, (date.getMonth() + 1).toString());
    
    // 日期
    result = result.replace(this.FORMAT_TOKENS.DD, this.padZero(date.getDate()));
    result = result.replace(this.FORMAT_TOKENS.D, date.getDate().toString());
    
    // 小时
    result = result.replace(this.FORMAT_TOKENS.HH, this.padZero(date.getHours()));
    result = result.replace(this.FORMAT_TOKENS.H, date.getHours().toString());
    
    // 分钟
    result = result.replace(this.FORMAT_TOKENS.mm, this.padZero(date.getMinutes()));
    result = result.replace(this.FORMAT_TOKENS.m, date.getMinutes().toString());
    
    // 秒
    result = result.replace(this.FORMAT_TOKENS.ss, this.padZero(date.getSeconds()));
    result = result.replace(this.FORMAT_TOKENS.s, date.getSeconds().toString());
    
    // 毫秒
    result = result.replace(this.FORMAT_TOKENS.SSS, this.padZero(date.getMilliseconds(), 3));
    
    return result;
  }
  
  /**
   * 解析日期字符串
   * @param dateString 日期字符串
   * @param format 格式字符串
   * @returns Date对象或null
   */
  static parse(dateString: string, format?: string): Date | null {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }
    
    // 如果没有指定格式，尝试使用原生解析
    if (!format) {
      return this.toDate(dateString);
    }
    
    // TODO: 实现自定义格式解析
    // 这里先使用简单的实现，后续可以扩展
    return this.toDate(dateString);
  }
  
  // ==================== 计算方法 ====================
  
  /**
   * 添加天数
   * @param value 日期值
   * @param days 天数
   * @returns 新日期
   */
  static addDays(value: DateValue, days: number): Date | null {
    const date = this.toDate(value);
    if (!date) return null;
    
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  /**
   * 添加月份
   * @param value 日期值
   * @param months 月数
   * @returns 新日期
   */
  static addMonths(value: DateValue, months: number): Date | null {
    const date = this.toDate(value);
    if (!date) return null;
    
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }
  
  /**
   * 添加年份
   * @param value 日期值
   * @param years 年数
   * @returns 新日期
   */
  static addYears(value: DateValue, years: number): Date | null {
    const date = this.toDate(value);
    if (!date) return null;
    
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }
  
  /**
   * 计算两个日期之间的天数差
   * @param date1 日期1
   * @param date2 日期2
   * @returns 天数差
   */
  static diffInDays(date1: DateValue, date2: DateValue): number {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);
    
    if (!d1 || !d2) return 0;
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / this.MILLISECONDS.DAY);
  }
  
  /**
   * 计算两个日期之间的月数差
   * @param date1 日期1
   * @param date2 日期2
   * @returns 月数差
   */
  static diffInMonths(date1: DateValue, date2: DateValue): number {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);
    
    if (!d1 || !d2) return 0;
    
    const yearDiff = d2.getFullYear() - d1.getFullYear();
    const monthDiff = d2.getMonth() - d1.getMonth();
    
    return Math.abs(yearDiff * 12 + monthDiff);
  }
  
  // ==================== 比较方法 ====================
  
  /**
   * 比较两个日期是否相等
   * @param date1 日期1
   * @param date2 日期2
   * @returns 是否相等
   */
  static isSame(date1: DateValue, date2: DateValue): boolean {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);
    
    if (!d1 || !d2) return false;
    
    return d1.getTime() === d2.getTime();
  }
  
  /**
   * 比较日期1是否在日期2之前
   * @param date1 日期1
   * @param date2 日期2
   * @returns 是否在之前
   */
  static isBefore(date1: DateValue, date2: DateValue): boolean {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);
    
    if (!d1 || !d2) return false;
    
    return d1.getTime() < d2.getTime();
  }
  
  /**
   * 比较日期1是否在日期2之后
   * @param date1 日期1
   * @param date2 日期2
   * @returns 是否在之后
   */
  static isAfter(date1: DateValue, date2: DateValue): boolean {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);
    
    if (!d1 || !d2) return false;
    
    return d1.getTime() > d2.getTime();
  }
  
  /**
   * 检查日期是否在范围内
   * @param date 日期
   * @param range 日期范围
   * @param inclusive 是否包含边界
   * @returns 是否在范围内
   */
  static isInRange(date: DateValue, range: DateRange, inclusive: boolean = true): boolean {
    const d = this.toDate(date);
    const start = this.toDate(range.start);
    const end = this.toDate(range.end);
    
    if (!d || !start || !end) return false;
    
    if (inclusive) {
      return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
    } else {
      return d.getTime() > start.getTime() && d.getTime() < end.getTime();
    }
  }
  
  // ==================== 日期属性方法 ====================

  /**
   * 检查是否为今天
   * @param value 日期值
   * @returns 是否为今天
   */
  static isToday(value: DateValue): boolean {
    const date = this.toDate(value);
    if (!date) return false;

    const today = new Date();
    return this.isSameDay(date, today);
  }

  /**
   * 检查是否为同一天
   * @param date1 日期1
   * @param date2 日期2
   * @returns 是否为同一天
   */
  static isSameDay(date1: DateValue, date2: DateValue): boolean {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);

    if (!d1 || !d2) return false;

    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  /**
   * 检查是否为同一月
   * @param date1 日期1
   * @param date2 日期2
   * @returns 是否为同一月
   */
  static isSameMonth(date1: DateValue, date2: DateValue): boolean {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);

    if (!d1 || !d2) return false;

    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth();
  }

  /**
   * 检查是否为同一年
   * @param date1 日期1
   * @param date2 日期2
   * @returns 是否为同一年
   */
  static isSameYear(date1: DateValue, date2: DateValue): boolean {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);

    if (!d1 || !d2) return false;

    return d1.getFullYear() === d2.getFullYear();
  }

  /**
   * 检查是否为周末
   * @param value 日期值
   * @returns 是否为周末
   */
  static isWeekend(value: DateValue): boolean {
    const date = this.toDate(value);
    if (!date) return false;

    const day = date.getDay();
    return day === 0 || day === 6; // 周日或周六
  }

  /**
   * 检查是否为工作日
   * @param value 日期值
   * @returns 是否为工作日
   */
  static isWeekday(value: DateValue): boolean {
    return !this.isWeekend(value);
  }

  /**
   * 获取星期几
   * @param value 日期值
   * @param locale 语言环境
   * @returns 星期几的名称
   */
  static getWeekdayName(value: DateValue, locale: string = 'zh-CN'): string {
    const date = this.toDate(value);
    if (!date) return '';

    return date.toLocaleDateString(locale, { weekday: 'long' });
  }

  /**
   * 获取月份名称
   * @param value 日期值
   * @param locale 语言环境
   * @returns 月份名称
   */
  static getMonthName(value: DateValue, locale: string = 'zh-CN'): string {
    const date = this.toDate(value);
    if (!date) return '';

    return date.toLocaleDateString(locale, { month: 'long' });
  }

  // ==================== 日期范围方法 ====================

  /**
   * 获取月份的第一天
   * @param value 日期值
   * @returns 月份第一天
   */
  static startOfMonth(value: DateValue): Date | null {
    const date = this.toDate(value);
    if (!date) return null;

    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * 获取月份的最后一天
   * @param value 日期值
   * @returns 月份最后一天
   */
  static endOfMonth(value: DateValue): Date | null {
    const date = this.toDate(value);
    if (!date) return null;

    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  /**
   * 获取年份的第一天
   * @param value 日期值
   * @returns 年份第一天
   */
  static startOfYear(value: DateValue): Date | null {
    const date = this.toDate(value);
    if (!date) return null;

    return new Date(date.getFullYear(), 0, 1);
  }

  /**
   * 获取年份的最后一天
   * @param value 日期值
   * @returns 年份最后一天
   */
  static endOfYear(value: DateValue): Date | null {
    const date = this.toDate(value);
    if (!date) return null;

    return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  }

  /**
   * 获取一周的第一天
   * @param value 日期值
   * @param startOfWeek 一周的开始 (0=周日, 1=周一)
   * @returns 一周第一天
   */
  static startOfWeek(value: DateValue, startOfWeek: number = 1): Date | null {
    const date = this.toDate(value);
    if (!date) return null;

    const day = date.getDay();
    const diff = (day < startOfWeek ? 7 : 0) + day - startOfWeek;

    const result = new Date(date);
    result.setDate(date.getDate() - diff);
    result.setHours(0, 0, 0, 0);

    return result;
  }

  /**
   * 获取一周的最后一天
   * @param value 日期值
   * @param startOfWeek 一周的开始 (0=周日, 1=周一)
   * @returns 一周最后一天
   */
  static endOfWeek(value: DateValue, startOfWeek: number = 1): Date | null {
    const start = this.startOfWeek(value, startOfWeek);
    if (!start) return null;

    const result = new Date(start);
    result.setDate(start.getDate() + 6);
    result.setHours(23, 59, 59, 999);

    return result;
  }

  /**
   * 获取月份的天数
   * @param year 年份
   * @param month 月份 (0-11)
   * @returns 天数
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * 检查是否为闰年
   * @param year 年份
   * @returns 是否为闰年
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  // ==================== 辅助方法 ====================

  /**
   * 数字补零
   * @param num 数字
   * @param length 长度
   * @returns 补零后的字符串
   */
  private static padZero(num: number, length: number = 2): string {
    return num.toString().padStart(length, '0');
  }

  /**
   * 克隆日期
   * @param value 日期值
   * @returns 克隆的日期
   */
  static clone(value: DateValue): Date | null {
    const date = this.toDate(value);
    return date ? new Date(date) : null;
  }

  /**
   * 获取时间戳
   * @param value 日期值
   * @returns 时间戳
   */
  static getTimestamp(value: DateValue): number {
    const date = this.toDate(value);
    return date ? date.getTime() : 0;
  }

  /**
   * 从时间戳创建日期
   * @param timestamp 时间戳
   * @returns 日期对象
   */
  static fromTimestamp(timestamp: number): Date {
    return new Date(timestamp);
  }
}
