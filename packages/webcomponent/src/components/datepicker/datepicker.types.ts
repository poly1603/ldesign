/**
 * 日期选择器类型定义
 */

export type DatePickerMode = 'year' | 'quarter' | 'month' | 'week' | 'date' | 'datetime';
export type DatePickerType = 'date' | 'daterange' | 'week' | 'month' | 'quarter' | 'year' | 'datetime';

export interface DatePickerProps {
  value?: Date | Date[] | string | string[] | null;
  mode?: DatePickerMode;
  type?: DatePickerType;
  range?: boolean; // 是否启用范围选择（与 mode 组合使用）
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  format?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  disabledDate?: (date: Date) => boolean;
  showWeekNumbers?: boolean;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onChange?: (value: Date | Date[] | null) => void;
  onClear?: () => void;
}

export interface DatePickerViewState {
  currentView: 'year' | 'month' | 'date';
  viewYear: number;
  viewMonth: number;
  viewDate: number;
}

export interface CalendarDate {
  date: Date;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isInRange?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
  weekNumber?: number;
}

export interface YearItem {
  year: number;
  isSelected: boolean;
  isDisabled: boolean;
  isCurrent: boolean;
}

export interface QuarterItem {
  quarter: number;
  label: string;
  isSelected: boolean;
  isDisabled: boolean;
  isCurrent: boolean;
}

export interface MonthItem {
  month: number;
  label: string;
  isSelected: boolean;
  isDisabled: boolean;
  isCurrent: boolean;
}

export interface WeekItem {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  dates: Date[];
  isSelected: boolean;
  isDisabled: boolean;
  isCurrent: boolean;
}