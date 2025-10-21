/**
 * 日期选择器类型定义
 */

/**
 * 选择模式
 */
export type PickerType =
  | 'date'           // 单个日期
  | 'dates'          // 多个日期
  | 'week'           // 星期
  | 'month'          // 月份
  | 'year'           // 年份
  | 'quarter'        // 季度
  | 'datetime'       // 日期时间
  | 'time'           // 时间
  | 'daterange'      // 日期范围
  | 'datetimerange'  // 日期时间范围
  | 'monthrange'     // 月份范围
  | 'yearrange';     // 年份范围

/**
 * 视图类型
 */
export type ViewType = 'date' | 'month' | 'year' | 'time';

/**
 * 日期值类型
 */
export type DateValue = Date | null;
export type DateRangeValue = [Date | null, Date | null];
export type DatesValue = Date[];
export type PickerValue = DateValue | DateRangeValue | DatesValue;

/**
 * 星期几（0-6，0表示周日）
 */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 季度（1-4）
 */
export type Quarter = 1 | 2 | 3 | 4;

/**
 * 日期单元格数据
 */
export interface DateCell {
  date: Date;
  text: string | number;
  type: 'normal' | 'prev' | 'next' | 'today';
  disabled: boolean;
  selected: boolean;
  inRange: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
}

/**
 * 月份单元格数据
 */
export interface MonthCell {
  month: number;
  text: string;
  disabled: boolean;
  selected: boolean;
  inRange: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
}

/**
 * 年份单元格数据
 */
export interface YearCell {
  year: number;
  text: string | number;
  disabled: boolean;
  selected: boolean;
  inRange: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
}

/**
 * 时间单元格数据
 */
export interface TimeCell {
  value: number;
  text: string;
  disabled: boolean;
  selected: boolean;
}

/**
 * 快捷选项
 */
export interface Shortcut {
  text: string;
  value: Date | [Date, Date] | Date[];
  onClick?: () => void;
}

/**
 * 禁用日期函数
 */
export type DisabledDateFunc = (date: Date) => boolean;

/**
 * 禁用时间函数
 */
export type DisabledTimeFunc = (date: Date) => {
  disabledHours?: number[];
  disabledMinutes?: number[];
  disabledSeconds?: number[];
};

/**
 * 日期格式化选项
 */
export interface FormatOptions {
  locale?: string;
  weekStartsOn?: WeekDay;
  use12Hours?: boolean;
}

/**
 * 日期范围限制
 */
export interface DateRange {
  min?: Date;
  max?: Date;
}

/**
 * 选择器配置
 */
export interface PickerOptions {
  type: PickerType;
  format?: string;
  valueFormat?: string;
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  rangeSeparator?: string;
  defaultValue?: PickerValue;
  defaultTime?: Date | [Date, Date];
  disabledDate?: DisabledDateFunc;
  disabledTime?: DisabledTimeFunc;
  shortcuts?: Shortcut[];
  clearable?: boolean;
  editable?: boolean;
  prefixIcon?: string;
  clearIcon?: string;
  validateEvent?: boolean;
  unlinkPanels?: boolean;
  weekStartsOn?: WeekDay;
  use12Hours?: boolean;
  showWeekNumber?: boolean;
  cellClassName?: (date: Date) => string;
}

/**
 * 国际化配置
 */
export interface Locale {
  name: string;
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  months: string[];
  monthsShort: string[];
  firstDayOfWeek: WeekDay;
  formats: {
    date: string;
    datetime: string;
    time: string;
    month: string;
    year: string;
    quarter: string;
  };
  meridiem: {
    am: string;
    pm: string;
  };
  ordinal?: (n: number) => string;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  primaryColor?: string;
  borderRadius?: string;
  cellSize?: string;
  fontSize?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBgColor?: string;
  selectedBgColor?: string;
  selectedTextColor?: string;
  disabledTextColor?: string;
  disabledBgColor?: string;
  rangeBgColor?: string;
}

/**
 * 事件类型
 */
export interface PickerEvents {
  change: (value: PickerValue) => void;
  input: (value: PickerValue) => void;
  blur: () => void;
  focus: () => void;
  clear: () => void;
  visibleChange: (visible: boolean) => void;
  panelChange: (date: Date, mode: ViewType) => void;
  calendarChange: (value: PickerValue) => void;
}

/**
 * 面板位置
 */
export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';





