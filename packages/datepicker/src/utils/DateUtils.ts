/**
 * DateUtils 日期工具类
 * 提供日期格式化、计算、比较等功能
 */

import type { DateValue, LocaleType } from '../types';

/**
 * 日期工具类
 * 提供各种日期操作的静态方法
 */
export class DateUtils {
  // 默认格式
  private static readonly DEFAULT_FORMAT = 'YYYY-MM-DD';

  // 格式化令牌正则表达式
  private static readonly FORMAT_TOKENS = /YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s|SSS|A|a/g;

  // 月份名称映射
  private static readonly MONTH_NAMES: Record<LocaleType, string[]> = {
    'zh-CN': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    'en-US': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    'ja-JP': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    'ko-KR': ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  };

  // 星期名称映射
  private static readonly WEEKDAY_NAMES: Record<LocaleType, string[]> = {
    'zh-CN': ['日', '一', '二', '三', '四', '五', '六'],
    'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    'ja-JP': ['日', '月', '火', '水', '木', '金', '土'],
    'ko-KR': ['일', '월', '화', '수', '목', '금', '토']
  };

  /**
   * 将 DateValue 转换为 Date 对象
   * @param value 日期值
   * @returns Date 对象或 null
   */
  static toDate(value: DateValue): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
      return new Date(value);
    }

    if (typeof value === 'string') {
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
   * 检查日期是否有效
   * @param value 日期值
   * @returns 是否有效
   */
  static isValid(value: DateValue): boolean {
    const date = this.toDate(value);
    return date !== null && !isNaN(date.getTime());
  }

  /**
   * 格式化日期
   * @param value 日期值
   * @param format 格式字符串
   * @param locale 语言环境
   * @returns 格式化后的字符串
   */
  static format(value: DateValue, format: string = this.DEFAULT_FORMAT, _locale: LocaleType = 'zh-CN'): string {
    const date = this.toDate(value);
    if (!date) return '';

    return format.replace(this.FORMAT_TOKENS, (token) => {
      switch (token) {
        case 'YYYY': return date.getFullYear().toString();
        case 'YY': return date.getFullYear().toString().slice(-2);
        case 'MM': return (date.getMonth() + 1).toString().padStart(2, '0');
        case 'M': return (date.getMonth() + 1).toString();
        case 'DD': return date.getDate().toString().padStart(2, '0');
        case 'D': return date.getDate().toString();
        case 'HH': return date.getHours().toString().padStart(2, '0');
        case 'H': return date.getHours().toString();
        case 'mm': return date.getMinutes().toString().padStart(2, '0');
        case 'm': return date.getMinutes().toString();
        case 'ss': return date.getSeconds().toString().padStart(2, '0');
        case 's': return date.getSeconds().toString();
        case 'SSS': return date.getMilliseconds().toString().padStart(3, '0');
        case 'A': return date.getHours() >= 12 ? 'PM' : 'AM';
        case 'a': return date.getHours() >= 12 ? 'pm' : 'am';
        default: return token;
      }
    });
  }

  /**
   * 解析日期字符串
   * @param dateString 日期字符串
   * @param format 格式字符串
   * @returns Date 对象或 null
   */
  static parse(dateString: string, format: string = this.DEFAULT_FORMAT): Date | null {
    if (!dateString || !format) return null;

    // 简单的解析实现，实际项目中可能需要更复杂的解析逻辑
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * 比较两个日期
   * @param date1 第一个日期
   * @param date2 第二个日期
   * @returns 比较结果 (-1: date1 < date2, 0: 相等, 1: date1 > date2)
   */
  static compare(date1: DateValue, date2: DateValue): number {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);

    if (!d1 && !d2) return 0;
    if (!d1) return -1;
    if (!d2) return 1;

    const time1 = d1.getTime();
    const time2 = d2.getTime();

    if (time1 < time2) return -1;
    if (time1 > time2) return 1;
    return 0;
  }

  /**
   * 检查两个日期是否相等
   * @param date1 第一个日期
   * @param date2 第二个日期
   * @returns 是否相等
   */
  static isEqual(date1: DateValue, date2: DateValue): boolean {
    return this.compare(date1, date2) === 0;
  }

  /**
   * 检查日期是否在指定范围内
   * @param date 要检查的日期
   * @param min 最小日期
   * @param max 最大日期
   * @returns 是否在范围内
   */
  static isInRange(date: DateValue, min?: DateValue, max?: DateValue): boolean {
    if (min && this.compare(date, min) < 0) return false;
    if (max && this.compare(date, max) > 0) return false;
    return true;
  }

  /**
   * 添加时间
   * @param date 基础日期
   * @param amount 数量
   * @param unit 单位
   * @returns 新的日期
   */
  static add(date: DateValue, amount: number, unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): Date | null {
    const d = this.toDate(date);
    if (!d) return null;

    const result = new Date(d);

    switch (unit) {
      case 'year':
        result.setFullYear(result.getFullYear() + amount);
        break;
      case 'month':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'day':
        result.setDate(result.getDate() + amount);
        break;
      case 'hour':
        result.setHours(result.getHours() + amount);
        break;
      case 'minute':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'second':
        result.setSeconds(result.getSeconds() + amount);
        break;
    }

    return result;
  }

  /**
   * 减去时间
   * @param date 基础日期
   * @param amount 数量
   * @param unit 单位
   * @returns 新的日期
   */
  static subtract(date: DateValue, amount: number, unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): Date | null {
    return this.add(date, -amount, unit);
  }

  /**
   * 获取日期的开始时间
   * @param date 日期
   * @param unit 单位
   * @returns 开始时间
   */
  static startOf(date: DateValue, unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): Date | null {
    const d = this.toDate(date);
    if (!d) return null;

    const result = new Date(d);

    switch (unit) {
      case 'year':
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'month':
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'day':
        result.setHours(0, 0, 0, 0);
        break;
      case 'hour':
        result.setMinutes(0, 0, 0);
        break;
      case 'minute':
        result.setSeconds(0, 0);
        break;
      case 'second':
        result.setMilliseconds(0);
        break;
    }

    return result;
  }

  /**
   * 获取日期的结束时间
   * @param date 日期
   * @param unit 单位
   * @returns 结束时间
   */
  static endOf(date: DateValue, unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): Date | null {
    const d = this.toDate(date);
    if (!d) return null;

    const result = new Date(d);

    switch (unit) {
      case 'year':
        result.setMonth(11, 31);
        result.setHours(23, 59, 59, 999);
        break;
      case 'month':
        result.setMonth(result.getMonth() + 1, 0);
        result.setHours(23, 59, 59, 999);
        break;
      case 'day':
        result.setHours(23, 59, 59, 999);
        break;
      case 'hour':
        result.setMinutes(59, 59, 999);
        break;
      case 'minute':
        result.setSeconds(59, 999);
        break;
      case 'second':
        result.setMilliseconds(999);
        break;
    }

    return result;
  }

  /**
   * 获取今天的日期
   * @returns 今天的日期
   */
  static today(): Date {
    return this.startOf(new Date(), 'day')!;
  }

  /**
   * 检查是否为今天
   * @param date 日期
   * @returns 是否为今天
   */
  static isToday(date: DateValue): boolean {
    return this.isEqual(this.startOf(date, 'day'), this.today());
  }

  /**
   * 检查是否为周末
   * @param date 日期
   * @returns 是否为周末
   */
  static isWeekend(date: DateValue): boolean {
    const d = this.toDate(date);
    if (!d) return false;

    const day = d.getDay();
    return day === 0 || day === 6; // 周日或周六
  }

  /**
   * 获取月份名称
   * @param month 月份 (0-11)
   * @param locale 语言环境
   * @returns 月份名称
   */
  static getMonthName(month: number, locale: LocaleType = 'zh-CN'): string {
    const names = this.MONTH_NAMES[locale] || this.MONTH_NAMES['zh-CN'];
    return names?.[month] || '';
  }

  /**
   * 获取星期名称
   * @param weekday 星期 (0-6, 0为周日)
   * @param locale 语言环境
   * @returns 星期名称
   */
  static getWeekdayName(weekday: number, locale: LocaleType = 'zh-CN'): string {
    const names = this.WEEKDAY_NAMES[locale] || this.WEEKDAY_NAMES['zh-CN'];
    return names?.[weekday] || '';
  }

  /**
   * 获取年中第几周
   * @param value 日期值
   * @returns 周数
   */
  static getWeekOfYear(value: DateValue): number {
    const date = this.toDate(value);
    if (!date) return 0;

    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
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
}
