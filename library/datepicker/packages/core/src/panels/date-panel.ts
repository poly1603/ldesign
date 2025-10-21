/**
 * 日期面板
 */

import type { DateCell, WeekDay } from '@ldesign/datepicker-shared';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  cloneDate,
  isSameDay,
  isToday,
  isInRange,
  addDays,
  startOfDay,
} from '@ldesign/datepicker-shared';

export interface DatePanelOptions {
  year: number;
  month: number;
  value: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  hoverDate?: Date | null;
  weekStartsOn?: WeekDay;
  disabledDate?: (date: Date) => boolean;
  showWeekNumber?: boolean;
}

export class DatePanel {
  private options: Required<DatePanelOptions>;

  constructor(options: DatePanelOptions) {
    this.options = {
      year: options.year,
      month: options.month,
      value: options.value,
      rangeStart: options.rangeStart ?? null,
      rangeEnd: options.rangeEnd ?? null,
      hoverDate: options.hoverDate ?? null,
      weekStartsOn: options.weekStartsOn ?? 1,
      disabledDate: options.disabledDate ?? (() => false),
      showWeekNumber: options.showWeekNumber ?? false,
    };
  }

  /**
   * 生成日期单元格数据
   */
  generateCells(): DateCell[][] {
    const { year, month, weekStartsOn } = this.options;
    const rows: DateCell[][] = [];
    
    // 当月第一天
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInMonth = getDaysInMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    
    // 计算需要显示的上个月的天数
    let firstDayOfWeek = firstDay;
    if (weekStartsOn !== 0) {
      firstDayOfWeek = (firstDay - weekStartsOn + 7) % 7;
    }
    
    let date = 1;
    let nextMonthDate = 1;
    
    // 生成 6 行 7 列的日期网格
    for (let i = 0; i < 6; i++) {
      const row: DateCell[] = [];
      
      for (let j = 0; j < 7; j++) {
        let cellDate: Date;
        let type: DateCell['type'] = 'normal';
        
        // 上个月的日期
        if (i === 0 && j < firstDayOfWeek) {
          const day = daysInPrevMonth - firstDayOfWeek + j + 1;
          cellDate = new Date(year, month - 1, day);
          type = 'prev';
        }
        // 下个月的日期
        else if (date > daysInMonth) {
          cellDate = new Date(year, month + 1, nextMonthDate);
          type = 'next';
          nextMonthDate++;
        }
        // 当月日期
        else {
          cellDate = new Date(year, month, date);
          type = 'normal';
          
          if (isToday(cellDate)) {
            type = 'today';
          }
          
          date++;
        }
        
        row.push(this.createCell(cellDate, type));
      }
      
      rows.push(row);
      
      // 如果已经没有当月日期了，就不再继续生成
      if (date > daysInMonth && i >= 4) {
        break;
      }
    }
    
    return rows;
  }

  /**
   * 创建单元格
   */
  private createCell(date: Date, type: DateCell['type']): DateCell {
    const { value, rangeStart, rangeEnd, hoverDate, disabledDate } = this.options;
    
    const disabled = disabledDate(date);
    const selected = value ? isSameDay(date, value) : false;
    
    // 范围选择逻辑
    let inRange = false;
    let rangeStartFlag = false;
    let rangeEndFlag = false;
    
    if (rangeStart && rangeEnd) {
      inRange = isInRange(date, rangeStart, rangeEnd);
      rangeStartFlag = isSameDay(date, rangeStart);
      rangeEndFlag = isSameDay(date, rangeEnd);
    } else if (rangeStart && hoverDate) {
      // 悬停时的范围预览
      const start = rangeStart <= hoverDate ? rangeStart : hoverDate;
      const end = rangeStart <= hoverDate ? hoverDate : rangeStart;
      inRange = isInRange(date, start, end);
      rangeStartFlag = isSameDay(date, start);
      rangeEndFlag = isSameDay(date, end);
    }
    
    return {
      date: startOfDay(date),
      text: date.getDate(),
      type,
      disabled,
      selected,
      inRange,
      rangeStart: rangeStartFlag,
      rangeEnd: rangeEndFlag,
    };
  }

  /**
   * 获取星期标题
   */
  getWeekdayHeaders(weekdaysMin: string[]): string[] {
    const { weekStartsOn } = this.options;
    const headers: string[] = [];
    
    for (let i = 0; i < 7; i++) {
      const index = (weekStartsOn + i) % 7;
      headers.push(weekdaysMin[index] || '');
    }
    
    return headers;
  }
}





