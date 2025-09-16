/**
 * 日历核心类
 * 实现日历数据生成、视图模式、日期单元格管理等功能
 */

import type {
  ViewMode,
  CalendarCell,
  CalendarData,
  DateValue,
  DateRange,
  MultipleDates,
  SelectionType
} from '../types';

import { DateUtils } from '../utils/DateUtils';
import { EventManager } from '../utils/EventManager';

/**
 * 日历配置接口
 */
interface CalendarConfig {
  /** 当前年份 */
  year?: number;
  
  /** 当前月份 (0-11) */
  month?: number;
  
  /** 视图模式 */
  viewMode?: ViewMode;
  
  /** 选择类型 */
  selectionType?: SelectionType;
  
  /** 一周的开始 (0=周日, 1=周一) */
  weekStartsOn?: number;
  
  /** 最小日期 */
  minDate?: DateValue;
  
  /** 最大日期 */
  maxDate?: DateValue;
  
  /** 禁用的日期 */
  disabledDates?: DateValue[] | ((date: Date) => boolean);
  
  /** 语言环境 */
  locale?: string;
  
  /** 显示其他月份的日期 */
  showOtherMonths?: boolean;
  
  /** 显示周数 */
  showWeekNumbers?: boolean;
}

/**
 * 日历类
 */
export class Calendar {
  /** 当前年份 */
  private year: number;
  
  /** 当前月份 (0-11) */
  private month: number;
  
  /** 当前视图模式 */
  private viewMode: ViewMode = 'day';
  
  /** 选择类型 */
  private selectionType: SelectionType = 'single';
  
  /** 一周的开始 */
  private weekStartsOn: number = 1;
  
  /** 最小日期 */
  private minDate?: Date;
  
  /** 最大日期 */
  private maxDate?: Date;
  
  /** 禁用的日期函数 */
  private disabledDatesFn?: (date: Date) => boolean;
  
  /** 语言环境 */
  private locale: string = 'zh-CN';
  
  /** 显示其他月份的日期 */
  private showOtherMonths: boolean = true;
  
  /** 显示周数 */
  private showWeekNumbers: boolean = false;
  
  /** 选中的日期 */
  private selectedDates: Date[] = [];
  
  /** 日期范围 */
  private selectedRange?: DateRange;
  
  /** 事件管理器 */
  private eventManager: EventManager;
  
  // ==================== 构造函数 ====================
  
  /**
   * 构造函数
   * @param config 日历配置
   */
  constructor(config: CalendarConfig = {}) {
    const now = new Date();
    
    this.year = config.year ?? now.getFullYear();
    this.month = config.month ?? now.getMonth();
    this.viewMode = config.viewMode ?? 'day';
    this.selectionType = config.selectionType ?? 'single';
    this.weekStartsOn = config.weekStartsOn ?? 1;
    this.locale = config.locale ?? 'zh-CN';
    this.showOtherMonths = config.showOtherMonths ?? true;
    this.showWeekNumbers = config.showWeekNumbers ?? false;
    
    // 设置日期范围
    this.setMinDate(config.minDate);
    this.setMaxDate(config.maxDate);
    this.setDisabledDates(config.disabledDates);
    
    this.eventManager = new EventManager();
  }
  
  // ==================== 配置方法 ====================
  
  /**
   * 设置最小日期
   * @param date 最小日期
   */
  setMinDate(date?: DateValue): void {
    this.minDate = date ? DateUtils.toDate(date) || undefined : undefined;
  }
  
  /**
   * 设置最大日期
   * @param date 最大日期
   */
  setMaxDate(date?: DateValue): void {
    this.maxDate = date ? DateUtils.toDate(date) || undefined : undefined;
  }
  
  /**
   * 设置禁用的日期
   * @param dates 禁用的日期数组或函数
   */
  setDisabledDates(dates?: DateValue[] | ((date: Date) => boolean)): void {
    if (typeof dates === 'function') {
      this.disabledDatesFn = dates;
    } else if (Array.isArray(dates)) {
      const disabledDates = dates
        .map(date => DateUtils.toDate(date))
        .filter(Boolean) as Date[];
      
      this.disabledDatesFn = (date: Date) => {
        return disabledDates.some(disabledDate => 
          DateUtils.isSameDay(date, disabledDate)
        );
      };
    } else {
      this.disabledDatesFn = undefined;
    }
  }
  
  /**
   * 设置语言环境
   * @param locale 语言环境
   */
  setLocale(locale: string): void {
    this.locale = locale;
  }
  
  // ==================== 导航方法 ====================
  
  /**
   * 导航到指定年月
   * @param year 年份
   * @param month 月份 (0-11)
   */
  navigateTo(year: number, month: number): void {
    const oldYear = this.year;
    const oldMonth = this.month;
    
    this.year = year;
    this.month = month;
    
    this.eventManager.emit('navigate', {
      year,
      month,
      oldYear,
      oldMonth
    });
  }
  
  /**
   * 导航到上一个月
   */
  previousMonth(): void {
    if (this.month === 0) {
      this.navigateTo(this.year - 1, 11);
    } else {
      this.navigateTo(this.year, this.month - 1);
    }
  }
  
  /**
   * 导航到下一个月
   */
  nextMonth(): void {
    if (this.month === 11) {
      this.navigateTo(this.year + 1, 0);
    } else {
      this.navigateTo(this.year, this.month + 1);
    }
  }
  
  /**
   * 导航到上一年
   */
  previousYear(): void {
    this.navigateTo(this.year - 1, this.month);
  }
  
  /**
   * 导航到下一年
   */
  nextYear(): void {
    this.navigateTo(this.year + 1, this.month);
  }
  
  /**
   * 导航到今天
   */
  goToToday(): void {
    const today = new Date();
    this.navigateTo(today.getFullYear(), today.getMonth());
  }
  
  // ==================== 视图模式方法 ====================
  
  /**
   * 设置视图模式
   * @param mode 视图模式
   */
  setViewMode(mode: ViewMode): void {
    const oldMode = this.viewMode;
    this.viewMode = mode;
    
    this.eventManager.emit('viewModeChange', {
      viewMode: mode,
      oldViewMode: oldMode
    });
  }
  
  /**
   * 获取当前视图模式
   * @returns 视图模式
   */
  getViewMode(): ViewMode {
    return this.viewMode;
  }
  
  // ==================== 选择方法 ====================
  
  /**
   * 选择日期
   * @param date 日期
   */
  selectDate(date: DateValue): void {
    const dateObj = DateUtils.toDate(date);
    if (!dateObj || this.isDateDisabled(dateObj)) {
      return;
    }
    
    switch (this.selectionType) {
      case 'single':
        this.selectedDates = [dateObj];
        break;
        
      case 'multiple':
        const existingIndex = this.selectedDates.findIndex(selected => 
          DateUtils.isSameDay(selected, dateObj)
        );
        
        if (existingIndex >= 0) {
          // 取消选择
          this.selectedDates.splice(existingIndex, 1);
        } else {
          // 添加选择
          this.selectedDates.push(dateObj);
        }
        break;
        
      case 'range':
        if (!this.selectedRange || (this.selectedRange.start && this.selectedRange.end)) {
          // 开始新的范围选择
          this.selectedRange = { start: dateObj, end: null };
          this.selectedDates = [dateObj];
        } else if (this.selectedRange.start && !this.selectedRange.end) {
          // 完成范围选择
          const start = this.selectedRange.start;
          const end = dateObj;
          
          if (DateUtils.isBefore(end, start)) {
            this.selectedRange = { start: end, end: start };
          } else {
            this.selectedRange = { start, end };
          }
          
          // 生成范围内的所有日期
          this.selectedDates = this.generateDateRange(
            this.selectedRange.start,
            this.selectedRange.end
          );
        }
        break;
    }
    
    this.eventManager.emit('dateSelect', {
      date: dateObj,
      selectedDates: [...this.selectedDates],
      selectedRange: this.selectedRange ? { ...this.selectedRange } : undefined
    });
  }
  
  /**
   * 清除选择
   */
  clearSelection(): void {
    this.selectedDates = [];
    this.selectedRange = undefined;
    
    this.eventManager.emit('selectionClear', {});
  }
  
  /**
   * 检查日期是否被选中
   * @param date 日期
   * @returns 是否被选中
   */
  isDateSelected(date: Date): boolean {
    return this.selectedDates.some(selected => 
      DateUtils.isSameDay(selected, date)
    );
  }
  
  /**
   * 检查日期是否在选择范围内
   * @param date 日期
   * @returns 是否在范围内
   */
  isDateInRange(date: Date): boolean {
    if (!this.selectedRange || !this.selectedRange.start || !this.selectedRange.end) {
      return false;
    }
    
    return DateUtils.isInRange(date, this.selectedRange);
  }
  
  /**
   * 检查日期是否为范围开始
   * @param date 日期
   * @returns 是否为范围开始
   */
  isRangeStart(date: Date): boolean {
    return this.selectedRange?.start ? 
      DateUtils.isSameDay(date, this.selectedRange.start) : false;
  }
  
  /**
   * 检查日期是否为范围结束
   * @param date 日期
   * @returns 是否为范围结束
   */
  isRangeEnd(date: Date): boolean {
    return this.selectedRange?.end ? 
      DateUtils.isSameDay(date, this.selectedRange.end) : false;
  }
  
  // ==================== 数据生成方法 ====================
  
  /**
   * 生成日历数据
   * @returns 日历数据
   */
  generateCalendarData(): CalendarData {
    switch (this.viewMode) {
      case 'day':
        return this.generateDayViewData();
      case 'month':
        return this.generateMonthViewData();
      case 'year':
        return this.generateYearViewData();
      case 'decade':
        return this.generateDecadeViewData();
      default:
        return this.generateDayViewData();
    }
  }
  
  /**
   * 生成日视图数据
   * @returns 日历数据
   */
  private generateDayViewData(): CalendarData {
    const cells: CalendarCell[] = [];
    const firstDayOfMonth = new Date(this.year, this.month, 1);
    const lastDayOfMonth = new Date(this.year, this.month + 1, 0);
    
    // 计算第一周的开始日期
    const startDate = DateUtils.startOfWeek(firstDayOfMonth, this.weekStartsOn)!;
    
    // 生成6周的日期 (42天)
    for (let i = 0; i < 42; i++) {
      const date = DateUtils.addDays(startDate, i)!;
      const isCurrentMonth = date.getMonth() === this.month;
      
      // 如果不显示其他月份的日期，跳过
      if (!this.showOtherMonths && !isCurrentMonth) {
        continue;
      }
      
      cells.push(this.createCalendarCell(date, isCurrentMonth));
    }
    
    return {
      year: this.year,
      month: this.month,
      viewMode: 'day',
      cells,
      weekdays: this.getWeekdayNames(),
      monthTitle: this.getMonthTitle(),
      yearTitle: this.getYearTitle()
    };
  }
  
  /**
   * 生成月视图数据
   * @returns 日历数据
   */
  private generateMonthViewData(): CalendarData {
    const cells: CalendarCell[] = [];
    
    for (let month = 0; month < 12; month++) {
      const date = new Date(this.year, month, 1);
      cells.push(this.createCalendarCell(date, true, 'month'));
    }
    
    return {
      year: this.year,
      month: this.month,
      viewMode: 'month',
      cells,
      weekdays: [],
      monthTitle: this.getMonthTitle(),
      yearTitle: this.getYearTitle()
    };
  }
  
  /**
   * 生成年视图数据
   * @returns 日历数据
   */
  private generateYearViewData(): CalendarData {
    const cells: CalendarCell[] = [];
    const startYear = Math.floor(this.year / 10) * 10;
    
    for (let i = 0; i < 12; i++) {
      const year = startYear + i - 1;
      const date = new Date(year, 0, 1);
      const isCurrentDecade = year >= startYear && year < startYear + 10;
      
      cells.push(this.createCalendarCell(date, isCurrentDecade, 'year'));
    }
    
    return {
      year: this.year,
      month: this.month,
      viewMode: 'year',
      cells,
      weekdays: [],
      monthTitle: this.getMonthTitle(),
      yearTitle: `${startYear} - ${startYear + 9}`
    };
  }
  
  /**
   * 生成十年视图数据
   * @returns 日历数据
   */
  private generateDecadeViewData(): CalendarData {
    const cells: CalendarCell[] = [];
    const startDecade = Math.floor(this.year / 100) * 100;

    for (let i = 0; i < 12; i++) {
      const decade = startDecade + i * 10 - 10;
      const date = new Date(decade, 0, 1);
      const isCurrentCentury = decade >= startDecade && decade < startDecade + 100;

      cells.push(this.createCalendarCell(date, isCurrentCentury, 'decade'));
    }

    return {
      year: this.year,
      month: this.month,
      viewMode: 'decade',
      cells,
      weekdays: [],
      monthTitle: this.getMonthTitle(),
      yearTitle: `${startDecade} - ${startDecade + 99}`
    };
  }

  // ==================== 辅助方法 ====================

  /**
   * 创建日历单元格
   * @param date 日期
   * @param isCurrentPeriod 是否为当前周期
   * @param cellType 单元格类型
   * @returns 日历单元格
   */
  private createCalendarCell(
    date: Date,
    isCurrentPeriod: boolean,
    cellType: 'day' | 'month' | 'year' | 'decade' = 'day'
  ): CalendarCell {
    const today = new Date();

    let text: string;
    let isToday = false;

    switch (cellType) {
      case 'day':
        text = date.getDate().toString();
        isToday = DateUtils.isSameDay(date, today);
        break;
      case 'month':
        text = DateUtils.getMonthName(date, this.locale);
        isToday = DateUtils.isSameMonth(date, today);
        break;
      case 'year':
        text = date.getFullYear().toString();
        isToday = DateUtils.isSameYear(date, today);
        break;
      case 'decade':
        const startYear = date.getFullYear();
        text = `${startYear}-${startYear + 9}`;
        isToday = today.getFullYear() >= startYear && today.getFullYear() <= startYear + 9;
        break;
    }

    return {
      date: new Date(date),
      text,
      isCurrentMonth: isCurrentPeriod,
      isToday,
      isSelected: this.isDateSelected(date),
      isInRange: this.isDateInRange(date),
      isRangeStart: this.isRangeStart(date),
      isRangeEnd: this.isRangeEnd(date),
      isDisabled: this.isDateDisabled(date),
      isWeekend: DateUtils.isWeekend(date)
    };
  }

  /**
   * 检查日期是否被禁用
   * @param date 日期
   * @returns 是否被禁用
   */
  private isDateDisabled(date: Date): boolean {
    // 检查最小日期
    if (this.minDate && DateUtils.isBefore(date, this.minDate)) {
      return true;
    }

    // 检查最大日期
    if (this.maxDate && DateUtils.isAfter(date, this.maxDate)) {
      return true;
    }

    // 检查自定义禁用函数
    if (this.disabledDatesFn && this.disabledDatesFn(date)) {
      return true;
    }

    return false;
  }

  /**
   * 生成日期范围内的所有日期
   * @param start 开始日期
   * @param end 结束日期
   * @returns 日期数组
   */
  private generateDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);

    while (!DateUtils.isAfter(current, end)) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * 获取星期名称数组
   * @returns 星期名称数组
   */
  private getWeekdayNames(): string[] {
    const names: string[] = [];
    const baseDate = new Date(2023, 0, 1); // 2023年1月1日是周日

    for (let i = 0; i < 7; i++) {
      const dayIndex = (this.weekStartsOn + i) % 7;
      const date = new Date(baseDate);
      date.setDate(date.getDate() + dayIndex);

      names.push(date.toLocaleDateString(this.locale, { weekday: 'short' }));
    }

    return names;
  }

  /**
   * 获取月份标题
   * @returns 月份标题
   */
  private getMonthTitle(): string {
    const date = new Date(this.year, this.month, 1);
    return date.toLocaleDateString(this.locale, {
      year: 'numeric',
      month: 'long'
    });
  }

  /**
   * 获取年份标题
   * @returns 年份标题
   */
  private getYearTitle(): string {
    return this.year.toString();
  }

  // ==================== 获取器方法 ====================

  /**
   * 获取当前年份
   * @returns 年份
   */
  getYear(): number {
    return this.year;
  }

  /**
   * 获取当前月份
   * @returns 月份 (0-11)
   */
  getMonth(): number {
    return this.month;
  }

  /**
   * 获取选中的日期
   * @returns 选中的日期数组
   */
  getSelectedDates(): Date[] {
    return [...this.selectedDates];
  }

  /**
   * 获取选中的日期范围
   * @returns 日期范围
   */
  getSelectedRange(): DateRange | undefined {
    return this.selectedRange ? { ...this.selectedRange } : undefined;
  }

  /**
   * 获取选择类型
   * @returns 选择类型
   */
  getSelectionType(): SelectionType {
    return this.selectionType;
  }

  /**
   * 设置选择类型
   * @param type 选择类型
   */
  setSelectionType(type: SelectionType): void {
    this.selectionType = type;
    this.clearSelection();
  }

  // ==================== 事件方法 ====================

  /**
   * 监听导航事件
   * @param listener 事件监听器
   * @returns 监听器ID
   */
  onNavigate(listener: (data: any) => void): string {
    return this.eventManager.on('navigate', listener);
  }

  /**
   * 监听视图模式变化事件
   * @param listener 事件监听器
   * @returns 监听器ID
   */
  onViewModeChange(listener: (data: any) => void): string {
    return this.eventManager.on('viewModeChange', listener);
  }

  /**
   * 监听日期选择事件
   * @param listener 事件监听器
   * @returns 监听器ID
   */
  onDateSelect(listener: (data: any) => void): string {
    return this.eventManager.on('dateSelect', listener);
  }

  /**
   * 监听选择清除事件
   * @param listener 事件监听器
   * @returns 监听器ID
   */
  onSelectionClear(listener: (data: any) => void): string {
    return this.eventManager.on('selectionClear', listener);
  }

  /**
   * 移除事件监听器
   * @param eventName 事件名称
   * @param listenerId 监听器ID
   */
  off(eventName: string, listenerId: string): void {
    this.eventManager.off(eventName, listenerId);
  }

  // ==================== 销毁方法 ====================

  /**
   * 销毁日历实例
   */
  destroy(): void {
    this.eventManager.removeAllListeners();
    this.selectedDates = [];
    this.selectedRange = undefined;
  }
}
