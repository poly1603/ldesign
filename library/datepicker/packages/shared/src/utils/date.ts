/**
 * 日期工具函数
 */

import type { WeekDay, Quarter } from '../types';

/**
 * 获取月份天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 是否闰年
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 获取月份第一天是星期几
 */
export function getFirstDayOfMonth(year: number, month: number): WeekDay {
  return new Date(year, month, 1).getDay() as WeekDay;
}

/**
 * 克隆日期
 */
export function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

/**
 * 是否同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 是否同一月
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}

/**
 * 是否同一年
 */
export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear();
}

/**
 * 是否是今天
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * 添加天数
 */
export function addDays(date: Date, days: number): Date {
  const result = cloneDate(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 添加月份
 */
export function addMonths(date: Date, months: number): Date {
  const result = cloneDate(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * 添加年份
 */
export function addYears(date: Date, years: number): Date {
  const result = cloneDate(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * 设置日期时间
 */
export function setDateTime(
  date: Date,
  hours?: number,
  minutes?: number,
  seconds?: number
): Date {
  const result = cloneDate(date);
  if (hours !== undefined) result.setHours(hours);
  if (minutes !== undefined) result.setMinutes(minutes);
  if (seconds !== undefined) result.setSeconds(seconds);
  return result;
}

/**
 * 开始日期
 */
export function startOfDay(date: Date): Date {
  return setDateTime(date, 0, 0, 0);
}

/**
 * 结束日期
 */
export function endOfDay(date: Date): Date {
  return setDateTime(date, 23, 59, 59);
}

/**
 * 月初
 */
export function startOfMonth(date: Date): Date {
  const result = cloneDate(date);
  result.setDate(1);
  return startOfDay(result);
}

/**
 * 月末
 */
export function endOfMonth(date: Date): Date {
  const result = cloneDate(date);
  result.setMonth(result.getMonth() + 1, 0);
  return endOfDay(result);
}

/**
 * 年初
 */
export function startOfYear(date: Date): Date {
  const result = cloneDate(date);
  result.setMonth(0, 1);
  return startOfDay(result);
}

/**
 * 年末
 */
export function endOfYear(date: Date): Date {
  const result = cloneDate(date);
  result.setMonth(11, 31);
  return endOfDay(result);
}

/**
 * 获取周起始日期
 */
export function startOfWeek(date: Date, weekStartsOn: WeekDay = 0): Date {
  const day = date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  return startOfDay(addDays(date, -diff));
}

/**
 * 获取周结束日期
 */
export function endOfWeek(date: Date, weekStartsOn: WeekDay = 0): Date {
  return endOfDay(addDays(startOfWeek(date, weekStartsOn), 6));
}

/**
 * 获取季度
 */
export function getQuarter(date: Date): Quarter {
  return (Math.floor(date.getMonth() / 3) + 1) as Quarter;
}

/**
 * 季度开始
 */
export function startOfQuarter(date: Date): Date {
  const quarter = getQuarter(date);
  const result = cloneDate(date);
  result.setMonth((quarter - 1) * 3, 1);
  return startOfDay(result);
}

/**
 * 季度结束
 */
export function endOfQuarter(date: Date): Date {
  const quarter = getQuarter(date);
  const result = cloneDate(date);
  result.setMonth(quarter * 3, 0);
  return endOfDay(result);
}

/**
 * 日期是否在范围内
 */
export function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

/**
 * 日期比较
 */
export function compareDate(date1: Date, date2: Date): number {
  return date1.getTime() - date2.getTime();
}

/**
 * 获取周数
 */
export function getWeekNumber(date: Date, weekStartsOn: WeekDay = 1): number {
  const firstDayOfYear = startOfYear(date);
  const firstWeekStart = startOfWeek(firstDayOfYear, weekStartsOn);
  
  if (firstWeekStart.getFullYear() < date.getFullYear()) {
    const diff = date.getTime() - firstWeekStart.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  }
  
  const diff = date.getTime() - firstWeekStart.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

/**
 * 解析日期字符串
 */
export function parseDate(value: string | Date | number | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  
  const timestamp = Date.parse(value);
  return isNaN(timestamp) ? null : new Date(timestamp);
}

/**
 * 格式化数字（补零）
 */
export function padZero(num: number, length = 2): string {
  return String(num).padStart(length, '0');
}

/**
 * 简单日期格式化
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  const replacements: Record<string, string> = {
    'YYYY': String(year),
    'YY': String(year).slice(-2),
    'MM': padZero(month),
    'M': String(month),
    'DD': padZero(day),
    'D': String(day),
    'HH': padZero(hours),
    'H': String(hours),
    'hh': padZero(hours % 12 || 12),
    'h': String(hours % 12 || 12),
    'mm': padZero(minutes),
    'm': String(minutes),
    'ss': padZero(seconds),
    's': String(seconds),
    'A': hours >= 12 ? 'PM' : 'AM',
    'a': hours >= 12 ? 'pm' : 'am',
  };
  
  let result = format;
  for (const [pattern, replacement] of Object.entries(replacements)) {
    result = result.replace(new RegExp(pattern, 'g'), replacement);
  }
  
  return result;
}

/**
 * 获取日期范围内的所有日期
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  let current = cloneDate(start);
  
  while (current <= end) {
    dates.push(cloneDate(current));
    current = addDays(current, 1);
  }
  
  return dates;
}





