/**
 * 日期选择器工具函数
 */

import type {
  CalendarDate,
  YearItem,
  QuarterItem,
  MonthItem,
  WeekItem,
} from './datepicker.types';

// 月份名称
export const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

// 季度名称
export const QUARTER_NAMES = ['Q1', 'Q2', 'Q3', 'Q4'];

// 星期名称
export const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
export const WEEKDAY_NAMES_FULL = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/**
 * 格式化日期
 */
export function formatDate(date: Date | null, format: string = 'YYYY-MM-DD'): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace(/YYYY/g, String(year))
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);
}

/**
 * 解析日期字符串
 */
export function parseDate(dateStr: string | Date): Date | null {
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr;
  }
  
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }

  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * 比较两个日期是否为同一天
 */
export function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 比较两个日期是否为同一月
 */
export function isSameMonth(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

/**
 * 比较两个日期是否为同一年
 */
export function isSameYear(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear();
}

/**
 * 比较两个日期是否为同一季度
 */
export function isSameQuarter(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    Math.floor(date1.getMonth() / 3) === Math.floor(date2.getMonth() / 3)
  );
}

/**
 * 获取日期所在的周
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * 获取某个月的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 获取某个月第一天是星期几
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * 生成日历数据
 */
export function generateCalendarDates(
  year: number,
  month: number,
  selectedDate: Date | null = null,
  minDate?: Date | null,
  maxDate?: Date | null,
  disabledDate?: (date: Date) => boolean,
  showWeekNumbers?: boolean,
  firstDayOfWeek: number = 0
): CalendarDate[] {
  const dates: CalendarDate[] = [];
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // 调整第一天的星期
  const adjustedFirstDay = (firstDay - firstDayOfWeek + 7) % 7;
  
  // 上个月的日期
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(prevYear, prevMonth, day);
    dates.push(createCalendarDate(
      date,
      false,
      today,
      selectedDate,
      minDate,
      maxDate,
      disabledDate,
      showWeekNumbers
    ));
  }
  
  // 当月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    dates.push(createCalendarDate(
      date,
      true,
      today,
      selectedDate,
      minDate,
      maxDate,
      disabledDate,
      showWeekNumbers
    ));
  }
  
  // 下个月的日期，填充到42天（6周）
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remainingDays = 42 - dates.length;
  
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(nextYear, nextMonth, day);
    dates.push(createCalendarDate(
      date,
      false,
      today,
      selectedDate,
      minDate,
      maxDate,
      disabledDate,
      showWeekNumbers
    ));
  }
  
  return dates;
}

/**
 * 创建日历日期对象
 */
function createCalendarDate(
  date: Date,
  isCurrentMonth: boolean,
  today: Date,
  selectedDate: Date | null,
  minDate?: Date | null,
  maxDate?: Date | null,
  disabledDate?: (date: Date) => boolean,
  showWeekNumbers?: boolean
): CalendarDate {
  let isDisabled = false;
  
  if (minDate && date < minDate) {
    isDisabled = true;
  }
  
  if (maxDate && date > maxDate) {
    isDisabled = true;
  }
  
  if (disabledDate) {
    isDisabled = isDisabled || disabledDate(date);
  }
  
  return {
    date,
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    isCurrentMonth,
    isToday: isSameDay(date, today),
    isSelected: isSameDay(date, selectedDate),
    isDisabled,
    weekNumber: showWeekNumbers ? getWeekNumber(date) : undefined
  };
}

/**
 * 生成年份列表
 */
export function generateYearList(
  centerYear: number,
  selectedYear: number | null = null,
  minDate?: Date | null,
  maxDate?: Date | null
): YearItem[] {
  const years: YearItem[] = [];
  const currentYear = new Date().getFullYear();
  const startYear = Math.floor(centerYear / 10) * 10 - 1;
  
  for (let i = 0; i < 12; i++) {
    const year = startYear + i;
    let isDisabled = false;
    
    if (minDate && year < minDate.getFullYear()) {
      isDisabled = true;
    }
    
    if (maxDate && year > maxDate.getFullYear()) {
      isDisabled = true;
    }
    
    years.push({
      year,
      isSelected: year === selectedYear,
      isDisabled,
      isCurrent: year === currentYear
    });
  }
  
  return years;
}

/**
 * 生成季度列表
 */
export function generateQuarterList(
  year: number,
  selectedDate: Date | null = null,
  minDate?: Date | null,
  maxDate?: Date | null
): QuarterItem[] {
  const quarters: QuarterItem[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.floor(currentDate.getMonth() / 3);
  
  for (let i = 0; i < 4; i++) {
    const quarterStart = new Date(year, i * 3, 1);
    const quarterEnd = new Date(year, i * 3 + 2, getDaysInMonth(year, i * 3 + 2));
    let isDisabled = false;
    
    if (minDate && quarterEnd < minDate) {
      isDisabled = true;
    }
    
    if (maxDate && quarterStart > maxDate) {
      isDisabled = true;
    }
    
    quarters.push({
      quarter: i + 1,
      label: QUARTER_NAMES[i],
      isSelected: selectedDate ? isSameQuarter(selectedDate, new Date(year, i * 3, 1)) : false,
      isDisabled,
      isCurrent: year === currentYear && i === currentQuarter
    });
  }
  
  return quarters;
}

/**
 * 生成月份列表
 */
export function generateMonthList(
  year: number,
  selectedDate: Date | null = null,
  minDate?: Date | null,
  maxDate?: Date | null
): MonthItem[] {
  const months: MonthItem[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(year, i, 1);
    const monthEnd = new Date(year, i, getDaysInMonth(year, i));
    let isDisabled = false;
    
    if (minDate && monthEnd < minDate) {
      isDisabled = true;
    }
    
    if (maxDate && monthStart > maxDate) {
      isDisabled = true;
    }
    
    months.push({
      month: i,
      label: MONTH_NAMES[i],
      isSelected: selectedDate ? isSameMonth(selectedDate, new Date(year, i, 1)) : false,
      isDisabled,
      isCurrent: year === currentYear && i === currentMonth
    });
  }
  
  return months;
}

/**
 * 生成周列表
 */
export function generateWeekList(
  year: number,
  month: number,
  selectedWeek: WeekItem | null = null,
  minDate?: Date | null,
  maxDate?: Date | null,
  firstDayOfWeek: number = 1
): WeekItem[] {
  const weeks: WeekItem[] = [];
  const dates = generateCalendarDates(year, month, null, minDate, maxDate, undefined, true, firstDayOfWeek);
  
  // 按周分组
  for (let i = 0; i < dates.length; i += 7) {
    const weekDates = dates.slice(i, i + 7);
    const startDate = weekDates[0].date;
    const endDate = weekDates[6].date;
    const weekNumber = weekDates[0].weekNumber || 0;
    
    let isDisabled = false;
    if (minDate && endDate < minDate) {
      isDisabled = true;
    }
    if (maxDate && startDate > maxDate) {
      isDisabled = true;
    }
    
    const isSelected = selectedWeek ? 
      (selectedWeek.weekNumber === weekNumber && 
       isSameDay(selectedWeek.startDate, startDate)) : false;
    
    const isCurrent = weekDates.some(d => d.isToday);
    
    weeks.push({
      weekNumber,
      startDate,
      endDate,
      dates: weekDates.map(d => d.date),
      isSelected,
      isDisabled,
      isCurrent
    });
  }
  
  return weeks;
}

/**
 * 获取日期范围内的所有日期
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * 判断日期是否在范围内
 */
export function isDateInRange(date: Date, startDate: Date | null, endDate: Date | null): boolean {
  if (!startDate || !endDate) return false;
  return date >= startDate && date <= endDate;
}