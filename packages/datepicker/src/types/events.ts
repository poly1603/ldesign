/**
 * 事件相关类型定义
 */

import type { DatePickerValue, CalendarCell } from './index';

// ==================== 事件名称常量 ====================

/**
 * 日期选择器事件名称
 */
export const DatePickerEvents = {
  /** 值变化事件 */
  CHANGE: 'change',
  
  /** 选择事件 */
  SELECT: 'select',
  
  /** 清除事件 */
  CLEAR: 'clear',
  
  /** 打开事件 */
  OPEN: 'open',
  
  /** 关闭事件 */
  CLOSE: 'close',
  
  /** 焦点事件 */
  FOCUS: 'focus',
  
  /** 失焦事件 */
  BLUR: 'blur',
  
  /** 视图变化事件 */
  VIEW_CHANGE: 'viewChange',
  
  /** 月份变化事件 */
  MONTH_CHANGE: 'monthChange',
  
  /** 年份变化事件 */
  YEAR_CHANGE: 'yearChange',
  
  /** 主题变化事件 */
  THEME_CHANGE: 'themeChange',
  
  /** 设备类型变化事件 */
  DEVICE_CHANGE: 'deviceChange',
  
  /** 错误事件 */
  ERROR: 'error',
  
  /** 准备就绪事件 */
  READY: 'ready',
  
  /** 销毁事件 */
  DESTROY: 'destroy'
} as const;

/**
 * 事件名称类型
 */
export type DatePickerEventName = typeof DatePickerEvents[keyof typeof DatePickerEvents];

// ==================== 事件数据接口 ====================

/**
 * 基础事件数据接口
 */
export interface BaseEventData {
  /** 事件类型 */
  type: string;
  
  /** 时间戳 */
  timestamp: number;
  
  /** 事件目标 */
  target?: any;
  
  /** 原始事件 */
  originalEvent?: Event;
}

/**
 * 值变化事件数据
 */
export interface ChangeEventData extends BaseEventData {
  type: typeof DatePickerEvents.CHANGE;
  
  /** 新值 */
  value: DatePickerValue;
  
  /** 旧值 */
  oldValue: DatePickerValue;
  
  /** 格式化后的值 */
  formattedValue: string;
}

/**
 * 选择事件数据
 */
export interface SelectEventData extends BaseEventData {
  type: typeof DatePickerEvents.SELECT;
  
  /** 选中的日期 */
  date: Date;
  
  /** 日历单元格数据 */
  cell: CalendarCell;
  
  /** 是否为多选 */
  isMultiple: boolean;
  
  /** 是否为范围选择 */
  isRange: boolean;
}

/**
 * 清除事件数据
 */
export interface ClearEventData extends BaseEventData {
  type: typeof DatePickerEvents.CLEAR;
  
  /** 清除前的值 */
  previousValue: DatePickerValue;
}

/**
 * 打开/关闭事件数据
 */
export interface OpenCloseEventData extends BaseEventData {
  type: typeof DatePickerEvents.OPEN | typeof DatePickerEvents.CLOSE;
  
  /** 是否为用户操作触发 */
  userTriggered: boolean;
}

/**
 * 视图变化事件数据
 */
export interface ViewChangeEventData extends BaseEventData {
  type: typeof DatePickerEvents.VIEW_CHANGE;
  
  /** 新视图模式 */
  viewMode: 'day' | 'month' | 'year' | 'decade';
  
  /** 旧视图模式 */
  oldViewMode: 'day' | 'month' | 'year' | 'decade';
}

/**
 * 月份变化事件数据
 */
export interface MonthChangeEventData extends BaseEventData {
  type: typeof DatePickerEvents.MONTH_CHANGE;
  
  /** 新年份 */
  year: number;
  
  /** 新月份 */
  month: number;
  
  /** 旧年份 */
  oldYear: number;
  
  /** 旧月份 */
  oldMonth: number;
}

/**
 * 年份变化事件数据
 */
export interface YearChangeEventData extends BaseEventData {
  type: typeof DatePickerEvents.YEAR_CHANGE;
  
  /** 新年份 */
  year: number;
  
  /** 旧年份 */
  oldYear: number;
}

/**
 * 主题变化事件数据
 */
export interface ThemeChangeEventData extends BaseEventData {
  type: typeof DatePickerEvents.THEME_CHANGE;
  
  /** 新主题 */
  theme: 'light' | 'dark' | 'auto';
  
  /** 旧主题 */
  oldTheme: 'light' | 'dark' | 'auto';
}

/**
 * 设备类型变化事件数据
 */
export interface DeviceChangeEventData extends BaseEventData {
  type: typeof DatePickerEvents.DEVICE_CHANGE;
  
  /** 新设备类型 */
  deviceType: 'desktop' | 'tablet' | 'mobile';
  
  /** 旧设备类型 */
  oldDeviceType: 'desktop' | 'tablet' | 'mobile';
  
  /** 屏幕宽度 */
  screenWidth: number;
}

/**
 * 错误事件数据
 */
export interface ErrorEventData extends BaseEventData {
  type: typeof DatePickerEvents.ERROR;
  
  /** 错误信息 */
  message: string;
  
  /** 错误代码 */
  code?: string;
  
  /** 错误对象 */
  error?: Error;
}

/**
 * 焦点事件数据
 */
export interface FocusEventData extends BaseEventData {
  type: typeof DatePickerEvents.FOCUS | typeof DatePickerEvents.BLUR;
  
  /** 相关元素 */
  relatedTarget?: HTMLElement;
}

/**
 * 准备就绪事件数据
 */
export interface ReadyEventData extends BaseEventData {
  type: typeof DatePickerEvents.READY;
  
  /** 初始化耗时 */
  initTime: number;
  
  /** 配置信息 */
  config: any;
}

/**
 * 销毁事件数据
 */
export interface DestroyEventData extends BaseEventData {
  type: typeof DatePickerEvents.DESTROY;
  
  /** 销毁原因 */
  reason?: string;
}

// ==================== 联合类型 ====================

/**
 * 所有事件数据的联合类型
 */
export type DatePickerEventData = 
  | ChangeEventData
  | SelectEventData
  | ClearEventData
  | OpenCloseEventData
  | ViewChangeEventData
  | MonthChangeEventData
  | YearChangeEventData
  | ThemeChangeEventData
  | DeviceChangeEventData
  | ErrorEventData
  | FocusEventData
  | ReadyEventData
  | DestroyEventData;

// ==================== 事件处理器类型 ====================

/**
 * 事件处理器类型映射
 */
export interface DatePickerEventHandlers {
  [DatePickerEvents.CHANGE]: (data: ChangeEventData) => void;
  [DatePickerEvents.SELECT]: (data: SelectEventData) => void;
  [DatePickerEvents.CLEAR]: (data: ClearEventData) => void;
  [DatePickerEvents.OPEN]: (data: OpenCloseEventData) => void;
  [DatePickerEvents.CLOSE]: (data: OpenCloseEventData) => void;
  [DatePickerEvents.FOCUS]: (data: FocusEventData) => void;
  [DatePickerEvents.BLUR]: (data: FocusEventData) => void;
  [DatePickerEvents.VIEW_CHANGE]: (data: ViewChangeEventData) => void;
  [DatePickerEvents.MONTH_CHANGE]: (data: MonthChangeEventData) => void;
  [DatePickerEvents.YEAR_CHANGE]: (data: YearChangeEventData) => void;
  [DatePickerEvents.THEME_CHANGE]: (data: ThemeChangeEventData) => void;
  [DatePickerEvents.DEVICE_CHANGE]: (data: DeviceChangeEventData) => void;
  [DatePickerEvents.ERROR]: (data: ErrorEventData) => void;
  [DatePickerEvents.READY]: (data: ReadyEventData) => void;
  [DatePickerEvents.DESTROY]: (data: DestroyEventData) => void;
}

/**
 * 通用事件处理器类型
 */
export type DatePickerEventHandler<T extends DatePickerEventName = DatePickerEventName> = 
  T extends keyof DatePickerEventHandlers 
    ? DatePickerEventHandlers[T] 
    : (data: BaseEventData) => void;
