/**
 * Calendar 日历核心类
 * 提供日历数据生成、日期计算等功能
 */

import type {
  DateValue,
  CalendarCell,
  CalendarData,
  LocaleType,
  ICalendar,
  CalendarOptions
} from '../types';
import { DateUtils } from '../utils/DateUtils';
import { EventManager } from './EventManager';

/**
 * 日历类
 * 负责日历数据的生成和管理
 */
export class Calendar implements ICalendar {
  /** 事件管理器 */
  private eventManager = new EventManager();

  /** 配置选项 */
  private options: any;

  /** 当前选中的日期 */
  private selectedDates: Set<string> = new Set();

  /** 禁用的日期 */
  private disabledDates: Set<string> = new Set();

  /** 语言环境 */
  private locale: LocaleType = 'zh-CN';

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: CalendarOptions = {}) {
    const now = new Date();

    this.options = {
      initialYear: options.initialYear ?? now.getFullYear(),
      initialMonth: options.initialMonth ?? now.getMonth(),
      initialView: options.initialView ?? 'month',
      firstDayOfWeek: options.firstDayOfWeek ?? 0, // 0 = 周日
      showAdjacentDates: options.showAdjacentDates ?? true,
      showWeekNumbers: options.showWeekNumbers ?? false,
      showTodayButton: options.showTodayButton ?? true,
      minDate: options.minDate ?? null,
      maxDate: options.maxDate ?? null,
      disabledDates: options.disabledDates ?? [],
      disabledWeekdays: options.disabledWeekdays ?? [],
      cellRenderer: options.cellRenderer ?? undefined,
      titleRenderer: options.titleRenderer ?? undefined
    };

    this.initializeDisabledDates();
  }

  /**
   * 初始化禁用日期
   */
  private initializeDisabledDates(): void {
    this.disabledDates.clear();

    if (this.options.disabledDates) {
      for (const date of this.options.disabledDates) {
        const dateObj = DateUtils.toDate(date);
        if (dateObj) {
          this.disabledDates.add(DateUtils.format(dateObj, 'YYYY-MM-DD'));
        }
      }
    }
  }

  /**
   * 获取日历数据
   * @param year 年份
   * @param month 月份 (0-11)
   * @returns 日历数据
   */
  getCalendarData(year: number, month: number): CalendarData {
    const cells = this.generateCalendarCells(year, month);
    const weekdays = this.getWeekdayNames();

    return {
      year,
      month,
      cells,
      weekdays
    };
  }

  /**
   * 生成日历单元格数据
   * @param year 年份
   * @param month 月份 (0-11)
   * @returns 单元格数组
   */
  private generateCalendarCells(year: number, month: number): CalendarCell[] {
    const cells: CalendarCell[] = [];

    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 获取当月第一天是星期几
    let startWeekday = firstDay.getDay() - this.options.firstDayOfWeek;
    if (startWeekday < 0) startWeekday += 7;

    // 添加上个月的日期（如果需要显示相邻月份）
    if (this.options.showAdjacentDates && startWeekday > 0) {
      const prevMonth = new Date(year, month, 0);
      const prevMonthLastDate = prevMonth.getDate();

      for (let i = startWeekday - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDate - i);
        cells.push(this.createCalendarCell(date, false));
      }
    }

    // 添加当月的日期
    const daysInMonth = lastDay.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      cells.push(this.createCalendarCell(date, true));
    }

    // 添加下个月的日期（如果需要显示相邻月份）
    if (this.options.showAdjacentDates) {
      const totalCells = Math.ceil(cells.length / 7) * 7;
      const remainingCells = totalCells - cells.length;

      for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        cells.push(this.createCalendarCell(date, false));
      }
    }

    return cells;
  }

  /**
   * 创建日历单元格
   * @param date 日期
   * @param isCurrentMonth 是否为当前月
   * @returns 单元格数据
   */
  private createCalendarCell(date: Date, isCurrentMonth: boolean): CalendarCell {
    return {
      date: new Date(date),
      text: date.getDate().toString(),
      isCurrentMonth,
      isToday: this.isToday(date),
      isSelected: this.isSelected(date),
      isInRange: false, // 将在范围选择时设置
      isRangeStart: false,
      isRangeEnd: false,
      isDisabled: this.isDisabled(date),
      isWeekend: this.isWeekend(date),
      className: this.getCellClassName(date, isCurrentMonth)
    };
  }

  /**
   * 获取单元格类名
   * @param date 日期
   * @param isCurrentMonth 是否为当前月
   * @returns 类名
   */
  private getCellClassName(date: Date, isCurrentMonth: boolean): string {
    const classes: string[] = [];

    if (!isCurrentMonth) classes.push('adjacent-month');
    if (this.isToday(date)) classes.push('today');
    if (this.isSelected(date)) classes.push('selected');
    if (this.isDisabled(date)) classes.push('disabled');
    if (this.isWeekend(date)) classes.push('weekend');

    return classes.join(' ');
  }

  /**
   * 获取星期名称数组
   * @returns 星期名称数组
   */
  private getWeekdayNames(): string[] {
    const names: string[] = [];
    const baseNames = this.getLocalizedWeekdayNames();

    for (let i = 0; i < 7; i++) {
      const index = (this.options.firstDayOfWeek + i) % 7;
      const name = baseNames[index];
      if (name) {
        names.push(name);
      }
    }

    return names;
  }

  /**
   * 获取本地化的星期名称
   * @returns 星期名称数组
   */
  private getLocalizedWeekdayNames(): string[] {
    const weekdays: string[] = [];

    for (let i = 0; i < 7; i++) {
      weekdays.push(DateUtils.getWeekdayName(i, this.locale));
    }

    return weekdays;
  }

  /**
   * 获取指定日期的单元格数据
   * @param date 日期
   * @returns 单元格数据或 null
   */
  getCellData(date: DateValue): CalendarCell | null {
    const dateObj = DateUtils.toDate(date);
    if (!dateObj) return null;

    return this.createCalendarCell(dateObj, true);
  }

  /**
   * 检查日期是否在当前月
   * @param date 日期
   * @param year 年份
   * @param month 月份
   * @returns 是否在当前月
   */
  isCurrentMonth(date: DateValue, year: number, month: number): boolean {
    const dateObj = DateUtils.toDate(date);
    if (!dateObj) return false;

    return dateObj.getFullYear() === year && dateObj.getMonth() === month;
  }

  /**
   * 检查日期是否为今天
   * @param date 日期
   * @returns 是否为今天
   */
  isToday(date: DateValue): boolean {
    return DateUtils.isToday(date);
  }

  /**
   * 检查日期是否被选中
   * @param date 日期
   * @returns 是否被选中
   */
  isSelected(date: DateValue): boolean {
    const dateObj = DateUtils.toDate(date);
    if (!dateObj) return false;

    const dateStr = DateUtils.format(dateObj, 'YYYY-MM-DD');
    return this.selectedDates.has(dateStr);
  }

  /**
   * 检查日期是否在范围内
   * @param _date 日期
   * @returns 是否在范围内
   */
  isInRange(_date: DateValue): boolean {
    // 这个方法将在范围选择功能中实现
    return false;
  }

  /**
   * 检查日期是否禁用
   * @param date 日期
   * @returns 是否禁用
   */
  isDisabled(date: DateValue): boolean {
    const dateObj = DateUtils.toDate(date);
    if (!dateObj) return true;

    const dateStr = DateUtils.format(dateObj, 'YYYY-MM-DD');

    // 检查是否在禁用日期列表中
    if (this.disabledDates.has(dateStr)) return true;

    // 检查是否在日期范围外
    if (!DateUtils.isInRange(dateObj, this.options.minDate, this.options.maxDate)) {
      return true;
    }

    // 检查是否为禁用的星期
    if (this.options.disabledWeekdays.includes(dateObj.getDay())) {
      return true;
    }

    return false;
  }

  /**
   * 检查日期是否为周末
   * @param date 日期
   * @returns 是否为周末
   */
  isWeekend(date: DateValue): boolean {
    return DateUtils.isWeekend(date);
  }

  /**
   * 获取月份的第一天
   * @param year 年份
   * @param month 月份
   * @returns 第一天
   */
  getFirstDayOfMonth(year: number, month: number): Date {
    return new Date(year, month, 1);
  }

  /**
   * 获取月份的最后一天
   * @param year 年份
   * @param month 月份
   * @returns 最后一天
   */
  getLastDayOfMonth(year: number, month: number): Date {
    return new Date(year, month + 1, 0);
  }

  /**
   * 获取月份的天数
   * @param year 年份
   * @param month 月份
   * @returns 天数
   */
  getDaysInMonth(year: number, month: number): number {
    return DateUtils.getDaysInMonth(year, month);
  }

  /**
   * 获取周的第一天
   * @returns 周的第一天 (0-6)
   */
  getFirstDayOfWeek(): number {
    return this.options.firstDayOfWeek;
  }

  /**
   * 设置周的第一天
   * @param day 周的第一天 (0-6)
   */
  setFirstDayOfWeek(day: number): void {
    if (day >= 0 && day <= 6) {
      this.options.firstDayOfWeek = day;
    }
  }

  /**
   * 选择日期
   * @param date 日期
   */
  selectDate(date: DateValue): void {
    const dateObj = DateUtils.toDate(date);
    if (!dateObj || this.isDisabled(dateObj)) return;

    const dateStr = DateUtils.format(dateObj, 'YYYY-MM-DD');
    this.selectedDates.add(dateStr);
  }

  /**
   * 取消选择日期
   * @param date 日期
   */
  deselectDate(date: DateValue): void {
    const dateObj = DateUtils.toDate(date);
    if (!dateObj) return;

    const dateStr = DateUtils.format(dateObj, 'YYYY-MM-DD');
    this.selectedDates.delete(dateStr);
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    this.selectedDates.clear();
  }

  /**
   * 设置语言环境
   * @param locale 语言环境
   */
  setLocale(locale: LocaleType): void {
    this.locale = locale;
  }

  /**
   * 更新配置选项
   * @param options 新的配置选项
   */
  updateOptions(options: Partial<CalendarOptions>): void {
    Object.assign(this.options, options);

    if (options.disabledDates) {
      this.initializeDisabledDates();
    }
  }

  /**
   * 销毁日历实例
   */
  destroy(): void {
    this.eventManager.destroy();
    this.selectedDates.clear();
    this.disabledDates.clear();
  }
}
