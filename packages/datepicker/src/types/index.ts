/**
 * LDesign DatePicker 组件库类型定义
 * 支持多种选择模式、响应式设计、主题系统等核心特性
 */

// ==================== 基础类型 ====================

/**
 * 日期选择器模式
 */
export type DatePickerMode = 'date' | 'datetime' | 'month' | 'year' | 'time';

/**
 * 选择类型
 */
export type SelectionType = 'single' | 'multiple' | 'range';

/**
 * 设备类型
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * 主题类型
 */
export type ThemeType = 'light' | 'dark' | 'auto';

/**
 * 视图模式
 */
export type ViewMode = 'day' | 'month' | 'year' | 'decade';

/**
 * 日期格式类型
 */
export type DateFormat = string;

// ==================== 日期相关类型 ====================

/**
 * 日期值类型
 */
export type DateValue = Date | string | number | null;

/**
 * 日期范围类型
 */
export interface DateRange {
  start: DateValue;
  end: DateValue;
}

/**
 * 多日期选择类型
 */
export type MultipleDates = DateValue[];

/**
 * 日期选择器值类型
 */
export type DatePickerValue = DateValue | DateRange | MultipleDates;

// ==================== 配置接口 ====================

/**
 * 日期选择器配置接口
 */
export interface DatePickerConfig {
  /** 选择器模式 */
  mode?: DatePickerMode;
  
  /** 选择类型 */
  selectionType?: SelectionType;
  
  /** 默认值 */
  defaultValue?: DatePickerValue;
  
  /** 当前值 */
  value?: DatePickerValue;
  
  /** 占位符文本 */
  placeholder?: string;
  
  /** 日期格式 */
  format?: DateFormat;
  
  /** 是否禁用 */
  disabled?: boolean;
  
  /** 是否只读 */
  readonly?: boolean;
  
  /** 是否显示清除按钮 */
  clearable?: boolean;
  
  /** 是否显示今天按钮 */
  showToday?: boolean;
  
  /** 是否显示时间选择 */
  showTime?: boolean;
  
  /** 最小日期 */
  minDate?: DateValue;
  
  /** 最大日期 */
  maxDate?: DateValue;
  
  /** 禁用的日期 */
  disabledDates?: DateValue[] | ((date: Date) => boolean);
  
  /** 设备类型 */
  deviceType?: DeviceType;
  
  /** 主题类型 */
  theme?: ThemeType;
  
  /** 语言 */
  locale?: string;
  
  /** 自定义类名 */
  className?: string;
  
  /** 自定义样式 */
  style?: Record<string, string>;
  
  /** 是否自动关闭 */
  autoClose?: boolean;
  
  /** 弹出位置 */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

// ==================== 日历相关类型 ====================

/**
 * 日历单元格数据
 */
export interface CalendarCell {
  /** 日期值 */
  date: Date;
  
  /** 显示文本 */
  text: string;
  
  /** 是否为当前月 */
  isCurrentMonth: boolean;
  
  /** 是否为今天 */
  isToday: boolean;
  
  /** 是否被选中 */
  isSelected: boolean;
  
  /** 是否在范围内 */
  isInRange: boolean;
  
  /** 是否为范围开始 */
  isRangeStart: boolean;
  
  /** 是否为范围结束 */
  isRangeEnd: boolean;
  
  /** 是否禁用 */
  isDisabled: boolean;
  
  /** 是否为周末 */
  isWeekend: boolean;
  
  /** 自定义类名 */
  className?: string;
}

/**
 * 日历数据接口
 */
export interface CalendarData {
  /** 当前年份 */
  year: number;
  
  /** 当前月份 */
  month: number;
  
  /** 视图模式 */
  viewMode: ViewMode;
  
  /** 日历单元格数据 */
  cells: CalendarCell[];
  
  /** 星期标题 */
  weekdays: string[];
  
  /** 月份标题 */
  monthTitle: string;
  
  /** 年份标题 */
  yearTitle: string;
}

// ==================== 主题相关类型 ====================

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题类型 */
  type: ThemeType;
  
  /** 主色调 */
  primaryColor?: string;
  
  /** 背景色 */
  backgroundColor?: string;
  
  /** 文本色 */
  textColor?: string;
  
  /** 边框色 */
  borderColor?: string;
  
  /** 阴影 */
  boxShadow?: string;
  
  /** 圆角 */
  borderRadius?: string;
  
  /** 自定义CSS变量 */
  customVariables?: Record<string, string>;
}

// ==================== 事件相关类型 ====================

/**
 * 事件监听器类型
 */
export type EventListener<T = any> = (data: T) => void;

/**
 * 事件监听器配置
 */
export interface EventListenerConfig {
  /** 是否只执行一次 */
  once?: boolean;
  
  /** 优先级 */
  priority?: number;
}

/**
 * 事件数据接口
 */
export interface EventData {
  /** 事件类型 */
  type: string;
  
  /** 事件数据 */
  data: any;
  
  /** 时间戳 */
  timestamp: number;
  
  /** 是否已阻止默认行为 */
  defaultPrevented: boolean;
}

// ==================== 工具类型 ====================

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 回调函数类型
 */
export type Callback<T = void> = (value: T) => void;

/**
 * 异步回调函数类型
 */
export type AsyncCallback<T = void> = (value: T) => Promise<void>;

// ==================== 导出所有类型 ====================

export * from './events';
export * from './validation';
export * from './dom';
