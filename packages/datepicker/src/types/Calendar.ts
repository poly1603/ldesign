/**
 * Calendar 日历相关类型定义
 */

import type { DateValue, CalendarCell, CalendarData } from './index';

// 日历接口
export interface ICalendar {
  /** 获取日历数据 */
  getCalendarData(year: number, month: number): CalendarData;
  
  /** 获取指定日期的单元格数据 */
  getCellData(date: DateValue): CalendarCell | null;
  
  /** 检查日期是否在当前月 */
  isCurrentMonth(date: DateValue, year: number, month: number): boolean;
  
  /** 检查日期是否为今天 */
  isToday(date: DateValue): boolean;
  
  /** 检查日期是否被选中 */
  isSelected(date: DateValue): boolean;
  
  /** 检查日期是否在范围内 */
  isInRange(date: DateValue): boolean;
  
  /** 检查日期是否禁用 */
  isDisabled(date: DateValue): boolean;
  
  /** 检查日期是否为周末 */
  isWeekend(date: DateValue): boolean;
  
  /** 获取月份的第一天 */
  getFirstDayOfMonth(year: number, month: number): Date;
  
  /** 获取月份的最后一天 */
  getLastDayOfMonth(year: number, month: number): Date;
  
  /** 获取月份的天数 */
  getDaysInMonth(year: number, month: number): number;
  
  /** 获取周的第一天 */
  getFirstDayOfWeek(): number;
  
  /** 设置周的第一天 */
  setFirstDayOfWeek(day: number): void;
}

// 日历视图类型
export type CalendarViewType = 'month' | 'year' | 'decade' | 'century';

// 日历视图配置
export interface CalendarViewConfig {
  /** 视图类型 */
  type: CalendarViewType;
  /** 显示的年份 */
  year: number;
  /** 显示的月份（仅月视图有效） */
  month?: number;
  /** 每行显示的项目数 */
  itemsPerRow: number;
  /** 总行数 */
  totalRows: number;
  /** 是否显示相邻月份的日期 */
  showAdjacentDates?: boolean;
  /** 是否显示周数 */
  showWeekNumbers?: boolean;
}

// 日历单元格状态
export interface CalendarCellState {
  /** 是否悬停 */
  hovered: boolean;
  /** 是否聚焦 */
  focused: boolean;
  /** 是否按下 */
  pressed: boolean;
  /** 是否可点击 */
  clickable: boolean;
  /** 自定义状态 */
  custom?: Record<string, unknown>;
}

// 日历单元格扩展数据
export interface CalendarCellExtended extends CalendarCell {
  /** 单元格状态 */
  state: CalendarCellState;
  /** 行索引 */
  rowIndex: number;
  /** 列索引 */
  colIndex: number;
  /** 单元格索引 */
  cellIndex: number;
  /** 是否为第一个单元格 */
  isFirst: boolean;
  /** 是否为最后一个单元格 */
  isLast: boolean;
  /** 相邻单元格 */
  adjacent: {
    prev?: CalendarCellExtended;
    next?: CalendarCellExtended;
    above?: CalendarCellExtended;
    below?: CalendarCellExtended;
  };
}

// 日历渲染数据
export interface CalendarRenderData {
  /** 视图配置 */
  viewConfig: CalendarViewConfig;
  /** 单元格数据 */
  cells: CalendarCellExtended[][];
  /** 标题文本 */
  title: string;
  /** 导航信息 */
  navigation: {
    canGoPrev: boolean;
    canGoNext: boolean;
    prevLabel: string;
    nextLabel: string;
  };
  /** 周标题 */
  weekdays?: string[];
  /** 月份标题 */
  months?: string[];
  /** 年份范围 */
  yearRange?: {
    start: number;
    end: number;
  };
}

// 日历事件
export interface CalendarEvents {
  /** 单元格点击 */
  'cell-click': (cell: CalendarCellExtended, event: MouseEvent) => void;
  /** 单元格悬停 */
  'cell-hover': (cell: CalendarCellExtended | null, event: MouseEvent) => void;
  /** 单元格聚焦 */
  'cell-focus': (cell: CalendarCellExtended, event: FocusEvent) => void;
  /** 视图改变 */
  'view-change': (viewConfig: CalendarViewConfig) => void;
  /** 导航 */
  'navigate': (direction: 'prev' | 'next', viewConfig: CalendarViewConfig) => void;
  /** 标题点击 */
  'title-click': (viewConfig: CalendarViewConfig, event: MouseEvent) => void;
}

// 日历配置选项
export interface CalendarOptions {
  /** 初始年份 */
  initialYear?: number;
  /** 初始月份 */
  initialMonth?: number;
  /** 初始视图类型 */
  initialView?: CalendarViewType;
  /** 周的第一天 */
  firstDayOfWeek?: number;
  /** 是否显示相邻月份的日期 */
  showAdjacentDates?: boolean;
  /** 是否显示周数 */
  showWeekNumbers?: boolean;
  /** 是否显示今天按钮 */
  showTodayButton?: boolean;
  /** 最小日期 */
  minDate?: DateValue;
  /** 最大日期 */
  maxDate?: DateValue;
  /** 禁用的日期 */
  disabledDates?: DateValue[];
  /** 禁用的星期 */
  disabledWeekdays?: number[];
  /** 自定义单元格渲染器 */
  cellRenderer?: (cell: CalendarCellExtended) => HTMLElement | string;
  /** 自定义标题渲染器 */
  titleRenderer?: (viewConfig: CalendarViewConfig) => HTMLElement | string;
}

// 日历导航操作
export type CalendarNavigationAction = 
  | 'prev-year'
  | 'next-year'
  | 'prev-month'
  | 'next-month'
  | 'prev-decade'
  | 'next-decade'
  | 'prev-century'
  | 'next-century'
  | 'today'
  | 'view-up'
  | 'view-down';

// 日历键盘导航
export interface CalendarKeyboardNavigation {
  /** 是否启用键盘导航 */
  enabled: boolean;
  /** 键盘映射 */
  keyMap: Record<string, CalendarNavigationAction | 'select' | 'escape'>;
  /** 是否循环导航 */
  loop: boolean;
  /** 是否跨月导航 */
  crossMonth: boolean;
}
