/**
 * 年份面板
 */

import type { YearCell } from '@ldesign/datepicker-shared';
import { isSameYear } from '@ldesign/datepicker-shared';

export interface YearPanelOptions {
  year: number;
  value: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  disabledDate?: (date: Date) => boolean;
}

export class YearPanel {
  private options: Required<YearPanelOptions>;

  constructor(options: YearPanelOptions) {
    this.options = {
      year: options.year,
      value: options.value,
      rangeStart: options.rangeStart ?? null,
      rangeEnd: options.rangeEnd ?? null,
      disabledDate: options.disabledDate ?? (() => false),
    };
  }

  /**
   * 生成年份单元格数据（3行4列，显示10年）
   */
  generateCells(): YearCell[][] {
    const { year } = this.options;
    
    // 计算年份范围的起始年份（向下取整到10的倍数）
    const startYear = Math.floor(year / 10) * 10;
    const rows: YearCell[][] = [];
    
    let yearIndex = 0;
    
    for (let i = 0; i < 3; i++) {
      const row: YearCell[] = [];
      
      for (let j = 0; j < 4; j++) {
        if (yearIndex < 12) {
          const currentYear = startYear + yearIndex;
          row.push(this.createCell(currentYear));
          yearIndex++;
        }
      }
      
      if (row.length > 0) {
        rows.push(row);
      }
    }
    
    return rows;
  }

  /**
   * 获取年份范围
   */
  getYearRange(): [number, number] {
    const { year } = this.options;
    const startYear = Math.floor(year / 10) * 10;
    return [startYear, startYear + 11];
  }

  /**
   * 创建年份单元格
   */
  private createCell(year: number): YearCell {
    const { value, rangeStart, rangeEnd, disabledDate } = this.options;
    
    const date = new Date(year, 0, 1);
    const disabled = disabledDate(date);
    const selected = value ? isSameYear(date, value) : false;
    
    // 范围选择逻辑
    let inRange = false;
    let rangeStartFlag = false;
    let rangeEndFlag = false;
    
    if (rangeStart && rangeEnd) {
      const startYear = rangeStart.getFullYear();
      const endYear = rangeEnd.getFullYear();
      
      inRange = year >= startYear && year <= endYear;
      rangeStartFlag = year === startYear;
      rangeEndFlag = year === endYear;
    }
    
    return {
      year,
      text: year,
      disabled,
      selected,
      inRange,
      rangeStart: rangeStartFlag,
      rangeEnd: rangeEndFlag,
    };
  }
}





