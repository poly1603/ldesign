/**
 * 月份面板
 */

import type { MonthCell } from '@ldesign/datepicker-shared';
import { isSameMonth } from '@ldesign/datepicker-shared';

export interface MonthPanelOptions {
  year: number;
  value: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  disabledDate?: (date: Date) => boolean;
  monthsShort?: string[];
}

export class MonthPanel {
  private options: Required<MonthPanelOptions>;

  constructor(options: MonthPanelOptions) {
    this.options = {
      year: options.year,
      value: options.value,
      rangeStart: options.rangeStart ?? null,
      rangeEnd: options.rangeEnd ?? null,
      disabledDate: options.disabledDate ?? (() => false),
      monthsShort: options.monthsShort ?? [],
    };
  }

  /**
   * 生成月份单元格数据（3行4列）
   */
  generateCells(): MonthCell[][] {
    const rows: MonthCell[][] = [];
    
    for (let i = 0; i < 3; i++) {
      const row: MonthCell[] = [];
      
      for (let j = 0; j < 4; j++) {
        const month = i * 4 + j;
        row.push(this.createCell(month));
      }
      
      rows.push(row);
    }
    
    return rows;
  }

  /**
   * 创建月份单元格
   */
  private createCell(month: number): MonthCell {
    const { year, value, rangeStart, rangeEnd, disabledDate, monthsShort } = this.options;
    
    const date = new Date(year, month, 1);
    const disabled = disabledDate(date);
    const selected = value ? isSameMonth(date, value) : false;
    
    // 范围选择逻辑
    let inRange = false;
    let rangeStartFlag = false;
    let rangeEndFlag = false;
    
    if (rangeStart && rangeEnd) {
      const startMonth = rangeStart.getFullYear() * 12 + rangeStart.getMonth();
      const endMonth = rangeEnd.getFullYear() * 12 + rangeEnd.getMonth();
      const currentMonth = year * 12 + month;
      
      inRange = currentMonth >= startMonth && currentMonth <= endMonth;
      rangeStartFlag = currentMonth === startMonth;
      rangeEndFlag = currentMonth === endMonth;
    }
    
    return {
      month,
      text: monthsShort[month] || `${month + 1}月`,
      disabled,
      selected,
      inRange,
      rangeStart: rangeStartFlag,
      rangeEnd: rangeEndFlag,
    };
  }
}





